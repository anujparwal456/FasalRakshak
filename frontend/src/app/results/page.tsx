"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Download,
    CheckCircle2,
    AlertCircle,
    Leaf,
    Sparkles,
    Calendar,
    Activity,
    Droplets,
    Beaker,
    Shield,
} from "lucide-react"
import { translations, Language } from "@/lib/translations"
import { generateReportPDF } from "../../../utils/generateReportPDF"
import { fetchDiseaseReport, DiseaseReport } from "@/lib/fetchDiseaseReport"

import Link from "next/link"

interface ScanResult {
    id: number
    crop: string
    disease: string
    confidence: number
    status: string
    scientificName: string
    severity: string
    affectedArea: string
    symptoms: string[]
    remedy: string
    prevention: string
    chemicals: Array<{
        name: string
        dosage: string
        application: string
    }>
    fertilizer: string
    organicTreatment: string
    estimatedRecovery: string
    spreadRisk: string
    image: string
    scanDate: string
    aiReport?: any
}

export default function ResultsPage() {
    const router = useRouter()
    const [result, setResult] = useState<ScanResult | null>(null)
    const [language, setLanguage] = useState<"en" | "hi">("en")
    const [aiReport, setAiReport] = useState<DiseaseReport | null>(null)
    const [loadingReport, setLoadingReport] = useState(false)

    useEffect(() => {
        const data = sessionStorage.getItem("scanResult")
        if (data) {
            const parsedResult = JSON.parse(data)
            setResult(parsedResult)

            // 🔴 FETCH GEMINI REPORT HERE
            fetchAIReport(parsedResult.disease)
        } else {
            router.push("/")
        }
    }, [router])

    const fetchAIReport = async (diseaseName: string) => {
        setLoadingReport(true)
        try {
            console.log("🔄 Starting AI report fetch for:", diseaseName)
            const report = await fetchDiseaseReport(diseaseName)
            if (report) {
                setAiReport(report)
                console.log("✅ AI Report loaded successfully")
            } else {
                console.warn("⚠️ AI Report returned null - backend may not have generated data")
                // Still allow download with basic data
                setAiReport({
                    crop_name: "Unknown",
                    disease_name: diseaseName,
                    severity: "Medium",
                    affected_area: "Leaves",
                    recovery_timeline: "2-4 weeks",
                    spread_risk: "Medium",
                    disease_description: "Plant disease detected",
                    symptoms: ["Visible leaf discoloration"],
                    treatment: ["Consult agricultural expert"],
                    organic_treatment: ["Neem oil application"],
                    fertilizer_recommendation: ["Balanced NPK"],
                    prevention: ["Proper crop rotation"]
                })
            }
        } catch (error) {
            console.error("❌ Failed to fetch AI report:", error)
            // Fallback report
            setAiReport({
                crop_name: "Unknown",
                disease_name: diseaseName,
                severity: "Medium",
                affected_area: "Leaves",
                recovery_timeline: "2-4 weeks",
                spread_risk: "Medium",
                disease_description: "Plant disease detected",
                symptoms: ["Disease analysis in progress"],
                treatment: ["Consult agricultural expert"],
                organic_treatment: ["Neem oil application"],
                fertilizer_recommendation: ["Balanced NPK"],
                prevention: ["Proper crop rotation"]
            })
        } finally {
            setLoadingReport(false)
        }
    }

    const downloadReport = async () => {
        if (!result || !aiReport) {
            alert("Report data not available yet. Please wait.");
            return;
        }

        try {
            // Generate unique Report ID
            const reportId = `PD-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            const scanDate = new Date(result.scanDate).toLocaleString();

            console.log("📄 Preparing PDF with Gemini data:", {
                plant: aiReport.crop_name,
                severity: aiReport.severity,
                disease: aiReport.disease_name,
                description: aiReport.disease_description,
            });

            // 🔥 Use GEMINI data, not old data
            await generateReportPDF({
                reportId,
                date: scanDate,
                plant: aiReport.crop_name || result.crop,
                disease: aiReport.disease_name || result.disease,
                confidence: (result.confidence * 100).toFixed(2),
                severity: aiReport.severity || "Medium",
                description: aiReport.disease_description || "Plant disease detected",

                // Combine all Gemini recommendations
                recommendations: [
                    ...(aiReport.symptoms || []),
                    ...(aiReport.treatment || []),
                    ...(aiReport.organic_treatment || []),
                    ...(aiReport.fertilizer_recommendation || []),
                    ...(aiReport.prevention || [])
                ],

                image: result.image || null
            });

            console.log("✅ PDF downloaded successfully");
        } catch (error) {
            console.error("❌ PDF generation error:", error);
            alert("Failed to generate PDF. Please try again.");
        }
    };

    if (!result) {
        return (
            <div className="min-h-screen relative flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-800 font-medium text-lg">Loading results...</p>
                </div>
            </div>
        )
    }

    return (
         <div className="min-h-screen relative">
             {/* Loading Overlay for Report Fetch */}
             {loadingReport && (
                 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                     <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
                         <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                         <h3 className="text-xl font-bold text-green-900 mb-2">Generating AI Report</h3>
                         <p className="text-gray-600 mb-4">Using Gemini AI to analyze the disease (10-30 seconds)</p>
                         <div className="flex gap-2 justify-center">
                             <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" />
                             <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce animation-delay-200" />
                             <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce animation-delay-400" />
                         </div>
                     </div>
                 </div>
             )}
             <main className="container mx-auto px-4 py-8">
                 {/* Action Buttons */}
                 <div className="flex justify-end items-center gap-4 mb-6 animate-fade-in">
                    <Button
                        onClick={downloadReport}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                    </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Left Column - Image and Quick Stats */}
                    <div className="md:col-span-1 space-y-6">
                        {/* Scanned Image */}
                        <Card className="border-2 border-green-200 shadow-xl overflow-hidden animate-fade-in backdrop-blur-sm bg-white/95">
                            <div className={`h-2 ${result.status === "healthy" ? "bg-green-500" : "bg-orange-500"}`} />
                            <CardContent className="p-0">
                                <img src={result.image || "/placeholder.svg"} alt="Scanned crop" className="w-full h-64 object-cover" />
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        <Card className="border-2 border-green-200 shadow-xl animate-fade-in backdrop-blur-sm bg-white/95">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-green-600" />
                                    Quick Stats
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-green-700">Confidence</span>
                                        <span className="text-lg font-bold text-green-900">{result.confidence}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 confidence-progress-bar ${result.confidence >= 80
                                                ? "bg-gradient-to-r from-green-500 to-green-600"
                                                : result.confidence >= 50
                                                    ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                                                    : "bg-gradient-to-r from-red-500 to-red-600"
                                                }`}
                                            style={{ '--confidence-width': `${result.confidence}%` } as React.CSSProperties}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-green-700">Severity</span>
                                    <span
                                        className={`text-sm font-semibold ${result.severity === "None"
                                            ? "text-green-600"
                                            : result.severity === "Moderate"
                                                ? "text-orange-600"
                                                : "text-red-600"
                                            }`}
                                    >
                                        {result.severity}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-green-700">Spread Risk</span>
                                    <span className="text-sm font-semibold text-orange-600">
                                        {aiReport?.spread_risk || result.spreadRisk ? (aiReport?.spread_risk || result.spreadRisk.split("-")[0]) : "Medium"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-green-700">Recovery Time</span>
                                    <span className="text-sm font-semibold text-green-900">
                                        {aiReport?.recovery_timeline || result.estimatedRecovery ? (aiReport?.recovery_timeline || result.estimatedRecovery.split(",")[0]) : "2–4 weeks"}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Scan Info */}
                        <Card className="border-2 border-green-200 shadow-xl animate-fade-in backdrop-blur-sm bg-white/95">
                            <CardContent className="pt-6 space-y-2">
                                <div className="flex items-center gap-2 text-sm text-green-700">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(result.scanDate).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-green-700">
                                    <Leaf className="w-4 h-4" />
                                    <span>
                                        Report ID: {result.id}-{new Date(result.scanDate).getTime()}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Detailed Information */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Quick Summary - Crop, Timeline, Affected Area */}
                        <Card className="border-2 border-green-200 shadow-xl animate-fade-in backdrop-blur-sm bg-white/95">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                                <CardTitle className="text-lg text-green-900">Disease Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-3">
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                        <p className="text-xs text-green-600 font-semibold">Crop</p>
                                        <p className="text-lg font-bold text-green-900">{aiReport?.crop_name || result.crop || "Unknown"}</p>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                        <p className="text-xs text-green-600 font-semibold">Affected Area</p>
                                        <p className="text-lg font-bold text-green-900">{aiReport?.affected_area || "Leaves"}</p>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                        <p className="text-xs text-green-600 font-semibold">Recovery Timeline</p>
                                        <p className="text-lg font-bold text-green-900">{aiReport?.recovery_timeline || "2–4 weeks"}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Disease Identification */}
                        <Card className="border-2 border-green-200 shadow-xl animate-fade-in backdrop-blur-sm bg-white/95">
                            <div className={`h-2 ${result.status === "healthy" ? "bg-green-500" : "bg-orange-500"}`} />
                            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            {result.status === "healthy" ? (
                                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                                            ) : (
                                                <AlertCircle className="w-8 h-8 text-orange-600" />
                                            )}
                                            <CardTitle className="text-3xl text-green-900">{result.crop}</CardTitle>
                                        </div>
                                        <p className="text-lg font-semibold text-green-700">{result.disease}</p>
                                        <p className="text-sm text-green-600 italic mt-1">{result.scientificName}</p>
                                    </div>
                                    <div
                                        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${result.status === "healthy"
                                            ? "bg-green-100 text-green-800 border-2 border-green-300"
                                            : "bg-orange-100 text-orange-800 border-2 border-orange-300"
                                            }`}
                                    >
                                        {result.status === "healthy" ? "Healthy Crop" : "Disease Detected"}
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* Symptoms */}
                        <Card className="border-2 border-green-200 shadow-xl animate-fade-in backdrop-blur-sm bg-white/95">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-green-600" />
                                    Observed Symptoms
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {loadingReport && !aiReport ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block">
                                            <div className="w-8 h-8 border-4 border-green-300 border-t-green-600 rounded-full animate-spin"></div>
                                        </div>
                                        <p className="text-green-700 mt-2">Loading AI analysis...</p>
                                    </div>
                                ) : (
                                    <ul className="space-y-2">
                                        {aiReport?.symptoms && Array.isArray(aiReport.symptoms) && aiReport.symptoms.length > 0 ? (
                                            aiReport.symptoms.map((symptom, index) => (
                                                <li key={index} className="flex items-start gap-2 text-green-800">
                                                    <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                                                    <span className="leading-relaxed">{symptom}</span>
                                                </li>
                                            ))
                                        ) : result.symptoms && Array.isArray(result.symptoms) ? (
                                            result.symptoms.map((symptom, index) => (
                                                <li key={index} className="flex items-start gap-2 text-green-800">
                                                    <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                                                    <span className="leading-relaxed">{symptom}</span>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="text-green-800">No specific symptoms listed.</li>
                                        )}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>

                        {/* Treatment Recommendations */}
                        <Card className="border-2 border-green-200 shadow-xl animate-fade-in backdrop-blur-sm bg-white/95">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-green-600" />
                                    Immediate Treatment Required
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {aiReport?.treatment && Array.isArray(aiReport.treatment) && aiReport.treatment.length > 0 ? (
                                    <ul className="space-y-2">
                                        {aiReport.treatment.map((step, index) => (
                                            <li key={index} className="flex items-start gap-2 text-green-800">
                                                <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                                                <span className="leading-relaxed">{step}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-green-800 leading-relaxed">{result.remedy || "No immediate treatment required."}</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Chemical Treatments */}
                        {result.chemicals && Array.isArray(result.chemicals) && result.chemicals.length > 0 && (
                            <Card className="border-2 border-green-200 shadow-xl animate-fade-in backdrop-blur-sm bg-white/95">
                                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <Beaker className="w-5 h-5 text-green-600" />
                                        Recommended Chemical Treatments
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        {result.chemicals.map((chemical, index) => (
                                            <div key={index} className="bg-green-50 p-4 rounded-lg border border-green-200">
                                                <h4 className="font-semibold text-green-900 mb-2">{chemical.name}</h4>
                                                <div className="grid md:grid-cols-2 gap-2 text-sm">
                                                    <div>
                                                        <span className="text-green-700 font-medium">Dosage:</span>
                                                        <span className="text-green-800 ml-2">{chemical.dosage}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-green-700 font-medium">Application:</span>
                                                        <span className="text-green-800 ml-2">{chemical.application}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Organic Treatment */}
                        <Card className="border-2 border-green-200 shadow-xl animate-fade-in backdrop-blur-sm bg-white/95">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Leaf className="w-5 h-5 text-green-600" />
                                    Organic Treatment Options
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {aiReport?.organic_treatment && Array.isArray(aiReport.organic_treatment) && aiReport.organic_treatment.length > 0 ? (
                                    <ul className="space-y-2">
                                        {aiReport.organic_treatment.map((treatment, index) => (
                                            <li key={index} className="flex items-start gap-2 text-green-800">
                                                <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                                                <span className="leading-relaxed">{treatment}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-green-800 leading-relaxed">{result.organicTreatment || "No organic treatment available."}</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Fertilizer Recommendations */}
                        <Card className="border-2 border-green-200 shadow-xl animate-fade-in backdrop-blur-sm bg-white/95">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Droplets className="w-5 h-5 text-green-600" />
                                    Fertilizer & Nutrient Recommendations
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {aiReport?.fertilizer_recommendation && Array.isArray(aiReport.fertilizer_recommendation) && aiReport.fertilizer_recommendation.length > 0 ? (
                                    <ul className="space-y-2">
                                        {aiReport.fertilizer_recommendation.map((fert, index) => (
                                            <li key={index} className="flex items-start gap-2 text-green-800">
                                                <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                                                <span className="leading-relaxed">{fert}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-green-800 leading-relaxed">{result.fertilizer || "No fertilizer recommendation available."}</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Prevention Measures */}
                        <Card className="border-2 border-green-200 shadow-xl animate-fade-in backdrop-blur-sm bg-white/95">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-green-600" />
                                    Prevention & Future Care
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {aiReport?.prevention && Array.isArray(aiReport.prevention) && aiReport.prevention.length > 0 ? (
                                    <ul className="space-y-2">
                                        {aiReport.prevention.map((measure, index) => (
                                            <li key={index} className="flex items-start gap-2 text-green-800">
                                                <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                                                <span className="leading-relaxed">{measure}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-green-800 leading-relaxed">{result.prevention || "No prevention measures available."}</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Disclaimer */}
                        <Card className="border-2 border-yellow-200 bg-yellow-50/50 shadow-xl animate-fade-in backdrop-blur-sm bg-white/95">
                            <CardContent className="pt-6">
                                <p className="text-sm text-yellow-900 leading-relaxed">
                                    <strong>Disclaimer:</strong> This report is generated by AI-powered analysis and should be used as a
                                    guideline. For critical agricultural decisions, please consult with agricultural experts, plant
                                    pathologists, or local agricultural extension services.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}