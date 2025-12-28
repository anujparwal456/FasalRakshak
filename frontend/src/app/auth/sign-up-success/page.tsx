import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle, ArrowLeft } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900">
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-white hover:text-green-200 transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Home</span>
      </Link>

      <div className="w-full max-w-md">
        <Card className="border-2 border-green-200 shadow-2xl backdrop-blur-sm bg-white/95">
          <CardHeader className="text-center bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16" />
            </div>
            <CardTitle className="text-2xl">Thank You for Signing Up!</CardTitle>
            <CardDescription className="text-green-50">Check your email to confirm your account</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-gray-700 text-center">
              We've sent a confirmation email to your inbox. Please click the link in the email to verify your account
              before signing in.
            </p>
            <div className="flex gap-3">
              <Button asChild className="flex-1 bg-green-600 hover:bg-green-700">
                <Link href="/login">Go to Login</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 bg-transparent">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
