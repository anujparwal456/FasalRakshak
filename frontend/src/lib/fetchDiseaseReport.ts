/**
 * Fetch AI Disease Report from Backend Gemini Service
 */

export interface DiseaseReport {
  crop_name: string;
  disease_name: string;
  severity: string;
  affected_area: string;
  recovery_timeline: string;
  spread_risk: string;
  disease_description: string;
  symptoms: string[];
  treatment: string[];
  organic_treatment: string[];
  fertilizer_recommendation: string[];
  prevention: string[];
}

// Helper function: Create fetch with timeout
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = 60000 // 60 second timeout for Gemini AI
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function fetchDiseaseReport(
  diseaseName: string
): Promise<DiseaseReport | null> {
  try {
    console.log("\n" + "=".repeat(60));
    console.log("📡 FETCHING DISEASE REPORT");
    console.log("=".repeat(60));
    console.log(`   Disease: ${diseaseName}`);

    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "https://fasalrakshak.onrender.com";
    console.log(`   Backend URL: ${backendUrl}`);

    console.log("   ⏳ Sending request (Gemini AI may take 10-30 seconds)...");

    const response = await fetchWithTimeout(
      `${backendUrl}/api/disease-report`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          disease: diseaseName,
        }),
      },
      60000 // 60 second timeout
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Report fetch failed: ${response.status}`);
      console.error(`   Response: ${errorText}`);
      return null;
    }

    const data = await response.json();

    console.log("✅ RESPONSE RECEIVED FROM BACKEND");
    console.log("   Response structure:", {
      has_disease: !!data.disease,
      has_ai_report: !!data.ai_report,
      report_fields: data.ai_report
        ? Object.keys(data.ai_report).slice(0, 5)
        : [],
    });

    // Extract the ai_report from the response
    if (data.ai_report) {
      const report = data.ai_report as DiseaseReport;
      console.log("✅ DISEASE REPORT READY");
      console.log(`   ├─ Crop: ${report.crop_name}`);
      console.log(`   ├─ Disease: ${report.disease_name}`);
      console.log(`   ├─ Severity: ${report.severity}`);
      console.log(`   └─ Symptoms: ${report.symptoms?.length || 0} items`);
      console.log("=".repeat(60) + "\n");
      return report;
    }

    console.error(
      "❌ ai_report field missing from response:",
      data
    );
    return null;
  } catch (error) {
    console.error("\n" + "=".repeat(60));
    console.error("❌ ERROR FETCHING DISEASE REPORT");
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        console.error(
          "   TIMEOUT: Backend took longer than 60 seconds to respond"
        );
        console.error(
          "   TIP: Gemini API may be slow. Try again in a moment."
        );
      } else {
        console.error(`   ${error.name}: ${error.message}`);
      }
    } else {
      console.error(`   ${String(error)}`);
    }
    console.error("=".repeat(60) + "\n");
    return null;
  }
}
