import { createClient } from "@/lib/supabase/client";

interface ScanResult {
  disease: string;
  confidence: number;
  cropName?: string;
  imageUrl?: string;
}

export async function saveScanResult(result: ScanResult) {
  const supabase = createClient();

  console.log("🔍 Starting saveScanResult with:", result);

  // 1️⃣ Get logged-in user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("🔍 AUTH CHECK - User:", user);
  console.log("🔍 AUTH CHECK - User ID:", user?.id);
  console.log("🔍 AUTH CHECK - Error:", userError);

  if (userError || !user) {
    console.error("❌ User not authenticated:", userError);
    return { success: false, error: "User not authenticated" };
  }

  console.log("✅ User authenticated:", user.id);

  // Extract crop name from disease (e.g., "Tomato___Early_blight" -> "Tomato")
  const cropName = result.cropName || result.disease.split("___")[0] || "Unknown";
  const diseaseName = result.disease;

  const insertData = {
    user_id: user.id,
    crop_name: cropName,
    disease_name: diseaseName,
    confidence: result.confidence ?? 0,
    image_url: result.imageUrl || "",
  };

  console.log("📝 Inserting data:", insertData);

  // Test table access first
  const { data: testData, error: testError } = await supabase
    .from("scan_results")
    .select("*")
    .limit(1);

  console.log("🧪 Table test - Data:", testData);
  console.log("🧪 Table test - Error:", testError);

  // 2️⃣ Insert scan result
  const { data, error } = await supabase
    .from("scan_results")
    .insert([insertData])
    .select();

  // 3️⃣ Log FULL error if any
  if (error) {
    console.error("❌ Supabase insert FULL error:", error);
    console.error("❌ Error stringified:", JSON.stringify(error, null, 2));
    console.error("❌ Error details:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return { success: false, error };
  }

  console.log("✅ Insert success:", data);
  return { success: true, data };
}
