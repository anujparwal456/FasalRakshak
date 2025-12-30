import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

// System prompt for agricultural analysis
const SYSTEM_PROMPT = `You are FasalRakshak AI Assistant, an expert in agriculture, crop diseases, soil health, and plant treatment.

Analyze the given image carefully and answer the user's question accurately.

Rules:
- Focus only on agriculture-related insights
- If disease is detected, mention:
   - Crop name
   - Disease name
   - Severity (Low / Medium / High)
   - Symptoms
   - Organic treatment
   - Chemical treatment (if needed)
   - Prevention tips
- If image is unclear, politely ask for a clearer image
- Keep language simple and farmer-friendly
- Do not include markdown unless necessary`;

async function checkImageCount(email: string): Promise<number> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("user_image_usage")
            .select("image_count")
            .eq("email", email)
            .single();

        if (error && error.code !== "PGRST116") {
            console.error("Error checking image count:", error);
            return 0;
        }

        return data?.image_count || 0;
    } catch (error) {
        console.error("Error in checkImageCount:", error);
        return 0;
    }
}

async function incrementImageCount(email: string): Promise<void> {
    try {
        const supabase = await createClient();
        const currentCount = await checkImageCount(email);

        // Try to update first
        const { error: updateError } = await supabase
            .from("user_image_usage")
            .update({ image_count: currentCount + 1, updated_at: new Date() })
            .eq("email", email);

        // If no rows updated, insert new row
        if (updateError?.code === "PGRST116" || currentCount === 0) {
            await supabase.from("user_image_usage").insert({
                email,
                image_count: 1,
                created_at: new Date(),
                updated_at: new Date(),
            });
        }
    } catch (error) {
        console.error("Error incrementing image count:", error);
    }
}

async function generateWithImage(
    prompt: string,
    imageBase64: string
): Promise<string> {
    try {
        // Convert base64 to proper format for Gemini
        const base64Data = imageBase64.split(",")[1] || imageBase64;
        const mimeType = imageBase64.includes("png") ? "image/png" : "image/jpeg";

        const response = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: `${SYSTEM_PROMPT}\n\nUser Question:\n${prompt}` },
                        {
                            inlineData: {
                                mimeType,
                                data: base64Data,
                            },
                        },
                    ],
                },
            ],
        });

        if (!response.text) {
            throw new Error("No response generated");
        }

        return response.text;
    } catch (error) {
        const lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`⚠️ Gemini model with image failed: ${lastError.message}`);

        if (lastError.message.includes("overloaded") || lastError.message.includes("503")) {
            throw new Error("AI servers are busy right now. Please try again in a moment.");
        }

        throw lastError;
    }
}

async function generateTextOnly(prompt: string): Promise<string> {
    try {
        const response = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [{ text: `${SYSTEM_PROMPT}\n\nUser Question:\n${prompt}` }],
                },
            ],
        });

        if (!response.text) {
            throw new Error("No response generated");
        }

        return response.text;
    } catch (error) {
        const lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`⚠️ Gemini model text failed: ${lastError.message}`);

        if (lastError.message.includes("overloaded") || lastError.message.includes("503")) {
            throw new Error("AI servers are busy right now. Please try again in a moment.");
        }

        throw lastError;
    }
}

export async function POST(req: Request) {
    try {
        const { email, message, image } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        if (!message && !image) {
            return NextResponse.json(
                { error: "Message or image is required" },
                { status: 400 }
            );
        }

        // Check image count if image is provided
        if (image) {
            const currentCount = await checkImageCount(email);
            if (currentCount >= 3) {
                return NextResponse.json(
                    { error: "You have reached the maximum image upload limit (3 images). You can continue chatting without images." },
                    { status: 429 }
                );
            }
        }

        let reply: string;

        // Generate response based on image presence
        if (image) {
            reply = await generateWithImage(message || "Analyze this image", image);
            // Increment count after successful processing
            await incrementImageCount(email);
        } else {
            reply = await generateTextOnly(message);
        }

        // Store in database
        try {
            const supabase = await createClient();
            await supabase.from("chat_history").insert({
                email,
                message,
                reply,
                has_image: !!image,
                created_at: new Date(),
            });
        } catch (dbError) {
            console.error("Supabase Error:", dbError);
            // Continue even if DB fails
        }

        return NextResponse.json({ reply });
    } catch (error) {
        console.error("Gemini API Error:", error);
        const errorMessage =
            error instanceof Error ? error.message : "Failed to generate response";

        return NextResponse.json(
            {
                error: errorMessage.includes("overloaded") ||
                    errorMessage.includes("503")
                    ? "AI servers are busy right now. Please try again in a moment."
                    : errorMessage,
            },
            { status: 500 }
        );
    }
}
