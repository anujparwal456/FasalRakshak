import { GoogleGenAI } from "@google/genai"

const client = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY!
})

export async function fetchGeminiResponse(prompt: string): Promise<string> {
  console.log("🔥 GEMINI FUNCTION CALLED WITH PROMPT:", prompt)

  const response = await client.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  })

  return response.text || ""
}

