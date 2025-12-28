import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const supabase = await createClient();
        const { data, error } = await supabase
            .from("user_image_usage")
            .select("image_count")
            .eq("email", email)
            .single();

        if (error && error.code !== "PGRST116") {
            console.error("Error fetching image count:", error);
            return NextResponse.json({ count: 0 });
        }

        return NextResponse.json({ count: data?.image_count || 0 });
    } catch (error) {
        console.error("Image count API Error:", error);
        return NextResponse.json({ count: 0 });
    }
}
