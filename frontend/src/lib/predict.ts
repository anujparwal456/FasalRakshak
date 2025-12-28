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

    // ✅ Correct backend URL
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/predict`,
      {
        method: "POST",
        body: formData,
      }
    );

    // ❌ If backend fails
    if (!res.ok) {
      const text = await res.text();
      console.error("ML API Error:", text);
      throw new Error("Prediction failed");
    }

    // ✅ Success
    return await res.json();
  } catch (error) {
    console.error("ML API request failed:", error);
    throw error;
  }
}
