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

export async function fetchDiseaseReport(diseaseName: string): Promise<DiseaseReport | null> {
  try {
    console.log("📡 Fetching Gemini report for:", diseaseName);

    const response = await fetch("http://localhost:5000/api/disease-report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        disease: diseaseName,
      }),
    });

    if (!response.ok) {
      console.error("❌ Report fetch failed:", response.status);
      return null;
    }

    const data = await response.json();
    
    console.log("✅ Report received from backend:", data);
    
    // Extract the ai_report from the response
    if (data.ai_report) {
      return data.ai_report as DiseaseReport;
    }

    return null;
  } catch (error) {
    console.error("❌ Error fetching disease report:", error);
    return null;
  }
}
