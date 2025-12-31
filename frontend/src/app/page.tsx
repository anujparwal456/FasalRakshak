"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Upload,
  Camera,
  Scan,
  Leaf,
  Droplets,
  Shield,
  Sparkles,
  Bot,
  MessageCircle,
  Sprout,
  Beaker,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { IntroAnimation } from "@/components/intro-animation"
import { AnimatedBackground } from "@/components/animated-background"
import { createClient } from "@/lib/supabase/client"
import { saveScanResult } from "@/lib/saveScanResult"
import { useLanguage } from "@/contexts/LanguageContext"
import { translate } from "@/lib/translations"
import styles from "./home.module.css"

export default function Home() {
  const router = useRouter()
  const { language } = useLanguage()
  const [showIntro, setShowIntro] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [showCamera, setShowCamera] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Supabase Auth
  useEffect(() => {
    const supabase = createClient()
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  // Intro animation
  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem("hasSeenIntro")
    if (hasSeenIntro) {
      setShowIntro(false)
    } else {
      const timer = setTimeout(() => {
        setShowIntro(false)
        sessionStorage.setItem("hasSeenIntro", "true")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => setSelectedImage(e.target?.result as string)
    reader.readAsDataURL(file)
    setShowCamera(false)
  }

  const openCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    if (videoRef.current) {
      videoRef.current.srcObject = stream
      setShowCamera(true)
      setSelectedImage(null)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      ;(videoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop())
    }
    setShowCamera(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    canvasRef.current.width = videoRef.current.videoWidth
    canvasRef.current.height = videoRef.current.videoHeight
    ctx.drawImage(videoRef.current, 0, 0)
    setSelectedImage(canvasRef.current.toDataURL("image/png"))
    stopCamera()
  }

  const base64ToFile = (base64: string, filename: string) => {
    const arr = base64.split(",")
    const mime = arr[0].match(/:(.*?);/)![1]
    const bstr = atob(arr[1])
    return new File([Uint8Array.from(bstr, (c) => c.charCodeAt(0))], filename, {
      type: mime,
    })
  }

  const scanDisease = async () => {
    if (!selectedImage) return alert("Upload image first")
    setIsScanning(true)

    try {
      const imageFile = base64ToFile(selectedImage, "plant.png")
      const formData = new FormData()
      formData.append("image", imageFile)

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://fasalrakshak.onrender.com"
      console.log("🔄 Scanning with backend:", backendUrl)
      
      const res = await fetch(`${backendUrl}/predict`, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error("❌ Backend error:", res.status, errorText)
        alert(`Backend error: ${res.status}. Check console for details.`)
        return
      }

      const data = await res.json()

      if (!data.disease) {
        console.error("❌ Invalid response:", data)
        alert("Backend returned invalid data. Check console.")
        return
      }

      console.log("✅ Disease detected:", data.disease)

      await saveScanResult({
        disease: data.disease,
        confidence: data.confidence,
        imageUrl: selectedImage,
      })

      sessionStorage.setItem(
        "scanResult",
        JSON.stringify({
          disease: data.disease,
          confidence: data.confidence,
          image: selectedImage,
          scanDate: new Date().toISOString(),
        })
      )

      router.push("/results")
    } catch (error) {
      console.error("❌ Scan error:", error)
      alert("Backend not running. Check console for details.")
    } finally {
      setIsScanning(false)
    }
  }

  useEffect(() => stopCamera, [])

  if (showIntro) return <IntroAnimation />
  return (
    <div className="min-h-screen relative">
      <div className="relative z-10">
        <main className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <section className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-800 via-emerald-700 to-teal-700 bg-clip-text text-transparent mb-4 text-balance">
              {translate("welcomeTitle", language)}
            </h2>
            <p className="text-lg md:text-xl text-green-700 mb-8 max-w-2xl mx-auto text-pretty">
              {translate("welcomeSubtitle", language)}
            </p>
            <Button
              size="lg"
              onClick={() => window.scrollTo({ top: 600, behavior: "smooth" })}
              className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-1"
            >
              <Scan className="w-5 h-5 mr-2" />
              {translate("startScanning", language)}
            </Button>
          </section>

          {/* AI Chatbot Promo Card */}
          <Card className="mb-8 border-2 border-green-200 shadow-2xl hover:shadow-3xl transition-all duration-500 bg-gradient-to-br from-green-50 via-white to-emerald-50 transform hover:-translate-y-2">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-green-900 flex items-center justify-center gap-2">
                <MessageCircle className="w-6 h-6 text-green-600" />
                {translate("askAIPlantExpert", language)}
              </CardTitle>
              <CardDescription className="text-green-600">
                {translate("aiAssistantDescription", language)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
                  <Sprout className="w-8 h-8 text-green-600 mb-2" />
                  <span className="text-sm text-green-800 font-medium text-center">
                    {translate("plantDiseaseHelp", language)}
                  </span>
                </div>
                <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
                  <Leaf className="w-8 h-8 text-green-600 mb-2" />
                  <span className="text-sm text-green-800 font-medium text-center">
                    {translate("farmingTechniques", language)}
                  </span>
                </div>
                <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
                  <Droplets className="w-8 h-8 text-green-600 mb-2" />
                  <span className="text-sm text-green-800 font-medium text-center">
                    {translate("irrigationTips", language)}
                  </span>
                </div>
                <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
                  <Beaker className="w-8 h-8 text-green-600 mb-2" />
                  <span className="text-sm text-green-800 font-medium text-center">
                    {translate("fertilizerGuide", language)}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link href="/chatbot">
                    <Bot className="w-5 h-5 mr-2" />
                    {translate("chatWithAIAssistant", language)}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upload & Camera Section */}
          <Card className="mb-8 border-2 border-green-200 shadow-2xl hover:shadow-3xl transition-all duration-500 bg-white/95 backdrop-blur-lg transform hover:-translate-y-2">
            <CardHeader>
              <CardTitle className="text-2xl text-green-900 flex items-center gap-2">
                <Camera className="w-6 h-6 text-green-600" />
                {translate("uploadImage", language)} or {translate("takePhoto", language)}
              </CardTitle>
              <CardDescription className="text-green-600">
                {translate("takeClearPhoto", language)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Upload Section */}
                <div
                  className="border-2 border-dashed border-green-300 rounded-xl p-8 text-center hover:border-green-500 hover:bg-green-50/50 transition-all duration-300 cursor-pointer group shadow-lg hover:shadow-2xl"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-16 h-16 mx-auto mb-4 text-green-500 group-hover:scale-125 transition-transform duration-300 drop-shadow-lg" />
                  <h3 className="text-lg font-semibold text-green-900 mb-2">{translate("uploadImage", language)}</h3>
                  <p className="text-sm text-green-600 mb-4">{translate("clickToBrowse", language)}</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    title="Upload Image"
                  />
                  <Button
                    variant="outline"
                    className="border-green-500 text-green-700 hover:bg-green-50 bg-white shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    {translate("chooseFile", language)}
                  </Button>
                </div>

                {/* Camera Section */}
                <div className="border-2 border-dashed border-green-300 rounded-xl p-8 text-center hover:border-green-500 hover:bg-green-50/50 transition-all duration-300 shadow-lg hover:shadow-2xl">
                  <Camera className="w-16 h-16 mx-auto mb-4 text-green-500 drop-shadow-lg" />
                  <h3 className="text-lg font-semibold text-green-900 mb-2">{translate("takePhoto", language)}</h3>
                  <p className="text-sm text-green-600 mb-4">{translate("captureLivePhoto", language)}</p>
                  <Button
                    onClick={openCamera}
                    disabled={showCamera}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    {showCamera ? translate("cameraActive", language) : translate("openCamera", language)}
                  </Button>
                </div>
              </div>

              {/* Camera View */}
              {showCamera && (
                <div className="relative rounded-xl overflow-hidden border-4 border-green-500 shadow-2xl animate-fade-in">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-auto max-h-96 object-cover bg-black" />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <Button
                      onClick={capturePhoto}
                      size="lg"
                      className="bg-white text-green-700 hover:bg-green-50 shadow-lg rounded-full w-16 h-16 p-0"
                    >
                      <div className="w-12 h-12 rounded-full border-4 border-green-600" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Image Preview */}
              {selectedImage && !showCamera && (
                <div className="relative rounded-xl overflow-hidden border-4 border-green-500 shadow-2xl animate-fade-in">
                  <img
                    src={selectedImage || "/placeholder.svg"}
                    alt="Uploaded plant"
                    className="w-full h-auto max-h-96 object-contain bg-gray-50"
                  />
                  <div className="absolute top-4 right-4">
                    <Button
                      onClick={() => setSelectedImage(null)}
                      variant="destructive"
                      size="sm"
                      className="rounded-full"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              )}

              {/* Scan Button */}
              {selectedImage && (
                <div className="text-center animate-fade-in">
                  <Button
                    onClick={scanDisease}
                    disabled={isScanning}
                    size="lg"
                    className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-1"
                  >
                    {isScanning ? (
                      <>
                        <div className={styles["scanning-spinner"]} />
                        {translate("scanningWithAI", language)}
                      </>
                    ) : (
                      <>
                        <Scan className="w-5 h-5 mr-2" />
                        {translate("scanForDisease", language)}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scanning Progress */}
          {isScanning && (
            <Card className="mb-8 border-2 border-green-200 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 animate-fade-in">
              <CardContent className="py-12 text-center">
                <div className="w-24 h-24 mx-auto mb-6 relative">
                  <div className="absolute inset-0 border-8 border-green-200 rounded-full" />
                  <div className="absolute inset-0 border-8 border-green-600 border-t-transparent rounded-full animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-900 mb-2">{translate("analyzingPlantImage", language)}</h3>
                <p className="text-green-700">{translate("aiModelProcessing", language)}</p>
              </CardContent>
            </Card>
          )}
        </main>

        {/* Footer with Features */}
        <footer className="bg-transparent text-gray-800 py-16 mt-24 relative z-10">
          <div className="container mx-auto px-4">
            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <div className="p-6 bg-white/70 backdrop-blur-md rounded-2xl shadow-2xl border border-green-200">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Identify Plants in Seconds</h3>
                <p className="text-gray-700">
                  Take multiple photos of your plant, upload them and let us work our magic. This web demo allows you to
                  identify up to 10 plants per month for free.
                </p>
              </div>

              <div className="p-6 bg-white/70 backdrop-blur-md rounded-2xl shadow-2xl border border-emerald-200">
                <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Plenty of Plants</h3>
                <p className="text-gray-700">
                  FasalRakshak can accurately identify more than 35,000 taxa of plants, mushrooms and lichen from around
                  the world. We give you the common name, a short description and the classification of your plant in
                  addition to the scientific (Latin) name.
                </p>
              </div>

              <div className="p-6 bg-white/70 backdrop-blur-md rounded-2xl shadow-2xl border border-teal-200">
                <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Power of Machine Learning</h3>
                <p className="text-gray-700">
                  We use cutting-edge methods of machine learning (aka artificial intelligence) and train custom deep
                  convolutional neural networks to ensure the best possible results. We estimate that we get the plant
                  name right 90% of the time.
                </p>
              </div>

              <div className="p-6 bg-white/70 backdrop-blur-md rounded-2xl shadow-2xl border border-green-200">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                  <Sprout className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Plant Diseases</h3>
                <p className="text-gray-700">
                  Is your plant sick? Could it be due to pests or a fungal disease, or is it simply overwatered? Our
                  plant.health feature can tell the difference! It can detect 548 different plant health conditions.
                </p>
              </div>

              <div className="p-6 bg-white/70 backdrop-blur-md rounded-2xl shadow-2xl border border-emerald-200">
                <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Batch Identification</h3>
                <p className="text-gray-700">
                  Want to identify multiple images at once? Whether you're a student, hobbyist or have a collection of
                  images to identify, our new Batch Identification feature simplifies bulk identification tasks.
                </p>
              </div>

              <div className="p-6 bg-white/70 backdrop-blur-md rounded-2xl shadow-2xl border border-teal-200">
                <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">FasalRakshak API</h3>
                <p className="text-gray-700">
                  Are you in the business of agriculture, the environment, or a smart garden and you need to identify
                  plants and plant diseases? We offer our identification engine via API and custom solutions to meet
                  your needs.
                </p>
              </div>
            </div>

            {/* Footer Bottom */}
            <div className="border-t border-gray-300 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg shadow-lg">
                      <Shield className="w-6 h-6 text-white absolute inset-0 m-auto" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">FasalRakshak</p>
                    <p className="text-sm text-gray-700">फसल रक्षक - Crop Protector</p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm">© 2025 FasalRakshak. All rights reserved.</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
      <AnimatedBackground />
    </div>
  )
}
