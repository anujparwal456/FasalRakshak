export async function predictDisease(image: File | string) {
  try {
    const formData = new FormData();

    // ✅ Always send key name as "image"
    if (typeof image === "string") {
      // base64 / blob url
      const response = await fetch(image);
      const blob = await response.blob();
      formData.append("image", blob, "image.jpg");
    } else {
      formData.append("image", image);
    }

    // ✅ Correct backend URL with fallback
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://fasalrakshak.onrender.com";
    console.log("📡 Predicting disease with backend:", backendUrl);
    
    const res = await fetch(
      `${backendUrl}/predict`,
      {
        method: "POST",
        body: formData,
      }
    );

    // ❌ If backend fails
    if (!res.ok) {
      const text = await res.text();
      console.error("❌ ML API Error:", res.status, text);
      throw new Error(`Prediction failed: ${res.status}`);
    }

    // ✅ Success
    const data = await res.json();
    console.log("✅ Prediction successful:", data.disease);
    return data;
  } catch (error) {
    console.error("❌ ML API request failed:", error);
    throw error;
  }
}
