"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Calendar, Scan } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      setUser(user)

      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      setProfile(profileData)
      setIsLoading(false)
    }

    fetchUser()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-800 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const displayName = profile?.name || user?.user_metadata?.name || user?.email?.split("@")[0] || "User"
  const email = user?.email || ""

  return (
    <div className="min-h-screen relative">
      <main className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto border-2 border-green-200 shadow-2xl backdrop-blur-sm bg-white/95">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Welcome to Your Dashboard</CardTitle>
            <CardDescription className="text-green-50">Manage your plant health scans and analysis</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 shadow-sm">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-900">{displayName}</h3>
                <p className="text-sm text-green-600">{email}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-green-500">
                  <Calendar className="w-3 h-3" />
                  Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-green-900">Quick Actions</h4>
              <div className="grid gap-3">
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all"
                >
                  <Link href="/">
                    <Scan className="w-4 h-4 mr-2" />
                    Start New Scan
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-2 border-green-300 hover:bg-green-50 bg-transparent shadow-md hover:shadow-lg transition-all"
                >
                  <Link href="/chatbot">Ask AI Assistant</Link>
                </Button>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg shadow-sm">
              <p className="text-sm text-blue-900">
                <strong>Tip:</strong> Regular plant monitoring helps detect diseases early and prevents crop loss. Use
                our AI-powered scanner for instant analysis!
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
