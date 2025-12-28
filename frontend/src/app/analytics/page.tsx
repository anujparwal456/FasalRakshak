"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/contexts/LanguageContext"
import { createClient } from "@/lib/supabase/client"
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Activity,
  Leaf,
  AlertCircle
} from "lucide-react"

/* ================= TYPES ================= */

interface ScanData {
  id: string
  crop_name: string
  disease_name: string
  confidence: number
  created_at: string
}

interface Stats {
  totalScans: number
  uniqueCrops: number
  avgConfidence: number
  diseaseDistribution: Record<string, number>
  cropFrequency: Record<string, number>
  severityBreakdown: Record<string, number>
  recentScans: ScanData[]
}

/* ================= PAGE ================= */

export default function AnalyticsPage() {
  const languageContext = useLanguage()

  // ✅ SAFE TRANSLATION FUNCTION (FIX)
  const t =
    typeof languageContext?.t === "function"
      ? languageContext.t
      : (key: string) => {
          const fallback: Record<string, string> = {
            analyticsTitle: "Analytics",
            totalScans: "Total Scans",
            uniqueCrops: "Unique Crops",
            avgConfidence: "Average Confidence",
            diseaseDistribution: "Disease Distribution",
            cropFrequency: "Crop Frequency",
            severityBreakdown: "Severity Breakdown",
            recentScans: "Recent Scans",
            loading: "Loading..."
          }
          return fallback[key] || key
        }

  const [stats, setStats] = useState<Stats>({
    totalScans: 0,
    uniqueCrops: 0,
    avgConfidence: 0,
    diseaseDistribution: {},
    cropFrequency: {},
    severityBreakdown: {},
    recentScans: []
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const supabase = createClient()

      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data: scans, error } = await supabase
        .from("scan_results")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error || !scans) {
        console.error("Error fetching scans:", error?.message)
        setLoading(false)
        return
      }

      if (scans.length === 0) {
        setLoading(false)
        return
      }

      const uniqueCrops = new Set(scans.map(s => s.crop_name)).size
      const avgConfidence =
        scans.reduce((sum, s) => sum + s.confidence, 0) / scans.length

      const diseaseDistribution: Record<string, number> = {}
      const cropFrequency: Record<string, number> = {}

      const severityBreakdown: Record<string, number> = {
        High: 0,
        Medium: 0,
        Low: 0
      }

      scans.forEach(scan => {
        diseaseDistribution[scan.disease_name] =
          (diseaseDistribution[scan.disease_name] || 0) + 1

        cropFrequency[scan.crop_name] =
          (cropFrequency[scan.crop_name] || 0) + 1

        const conf = scan.confidence * 100
        if (conf >= 80) severityBreakdown.High++
        else if (conf >= 50) severityBreakdown.Medium++
        else severityBreakdown.Low++
      })

      setStats({
        totalScans: scans.length,
        uniqueCrops,
        avgConfidence: avgConfidence * 100,
        diseaseDistribution,
        cropFrequency,
        severityBreakdown,
        recentScans: scans.slice(0, 10)
      })

      setLoading(false)
    } catch (err: any) {
      console.error("Analytics error:", err?.message || err)
      setLoading(false)
    }
  }

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-800 font-medium">{t("loading")}</p>
        </div>
      </div>
    )
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen relative">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">
            {t("analyticsTitle")}
          </h1>
          <p className="text-green-600">
            Insights from your crop health scans
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title={t("totalScans")} value={stats.totalScans} icon={Activity} />
          <StatCard title={t("uniqueCrops")} value={stats.uniqueCrops} icon={Leaf} />
          <StatCard
            title={t("avgConfidence")}
            value={`${stats.avgConfidence.toFixed(1)}%`}
            icon={TrendingUp}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <ProgressCard
            title={t("diseaseDistribution")}
            icon={AlertCircle}
            data={stats.diseaseDistribution}
            total={stats.totalScans}
          />

          <ProgressCard
            title={t("cropFrequency")}
            icon={BarChart3}
            data={stats.cropFrequency}
            total={stats.totalScans}
          />

          <ProgressCard
            title={t("severityBreakdown")}
            icon={PieChartIcon}
            data={stats.severityBreakdown}
            total={stats.totalScans}
          />

          <Card className="border-2 border-green-200 shadow-xl bg-white/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Activity className="w-5 h-5" />
                {t("recentScans")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.recentScans.slice(0, 5).map(scan => (
                <div
                  key={scan.id}
                  className="flex justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <div>
                    <p className="text-sm font-semibold text-green-900">
                      {scan.crop_name}
                    </p>
                    <p className="text-xs text-green-600">
                      {new Date(scan.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-green-900">
                    {(scan.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

/* ================= REUSABLE COMPONENTS ================= */

function StatCard({ title, value, icon: Icon }: any) {
  return (
    <Card className="border-2 border-green-200 shadow-xl bg-white/95">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-green-700">
          {title}
        </CardTitle>
        <Icon className="w-4 h-4 text-green-600" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-green-900">{value}</div>
      </CardContent>
    </Card>
  )
}

function ProgressCard({ title, icon: Icon, data, total }: any) {
  return (
    <Card className="border-2 border-green-200 shadow-xl bg-white/95">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Icon className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(data).map(([label, count]: any) => {
          const percentage = total > 0 ? (count / total) * 100 : 0
          return (
            <div key={label}>
              <div className="flex justify-between text-sm">
                <span className="text-green-800">{label}</span>
                <span className="font-semibold">{count}</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
