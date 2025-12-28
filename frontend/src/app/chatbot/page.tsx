"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Send, User, Sprout, Leaf, Calendar, Bug, ImagePlus, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Array<{ text: string; sender: "user" | "bot" }>>([
    {
      text: "Hello! I'm your AI plant expert. I can help you with:\n\n• Plant disease identification and treatment\n• Crop management and farming techniques\n• Fertilizer and pesticide recommendations\n• Soil health and nutrition\n• Weather-based crop guidance\n\nYou can also upload plant images (up to 3) for disease analysis!\n\nWhat would you like to know?",
      sender: "bot",
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageCount, setImageCount] = useState(0)
  const [imageLimitReached, setImageLimitReached] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const supabase = createClient()
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        setUserEmail(user.email || "")
        
        // Fetch image count
        try {
          const response = await fetch("/api/chat/image-count", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email }),
          })
          const data = await response.json()
          setImageCount(data.count || 0)
          setImageLimitReached((data.count || 0) >= 3)
        } catch (error) {
          console.error("Error fetching image count:", error)
        }
      }
    }
    getUser()
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (imageLimitReached) {
      alert("You have reached the maximum image upload limit (3 images). You can continue chatting without images.")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      setSelectedImage(base64)
    }
    reader.readAsDataURL(file)
    event.target.value = ""
  }

  const handleSendMessage = async (messageOverride?: string) => {
    const message = messageOverride || inputValue.trim()
    if (!message && !selectedImage) return

    if (!userEmail) {
      alert("Please login to use this feature")
      return
    }

    setShowSuggestions(false)
    setMessages((prev) => [...prev, { text: message || "(Image only)", sender: "user" }])
    setInputValue("")
    setIsTyping(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          email: userEmail,
          image: selectedImage,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error?.includes("maximum image upload limit")) {
          setImageLimitReached(true)
          setMessages((prev) => [...prev, { text: "You have reached the maximum image upload limit (3 images). You can continue chatting without images.", sender: "bot" }])
        } else {
          throw new Error(data.error || "AI unavailable")
        }
      } else {
        // Update image count if image was uploaded
        if (selectedImage) {
          const newCount = imageCount + 1
          setImageCount(newCount)
          setImageLimitReached(newCount >= 3)
        }
        setSelectedImage(null)
        setMessages((prev) => [...prev, { text: data.reply, sender: "bot" }])
      }
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setMessages((prev) => [
        ...prev,
        { 
          text: errorMessage.includes("busy") || errorMessage.includes("overloaded") 
            ? "⚠️ AI servers are busy right now. Please try again in a moment." 
            : "Sorry, I encountered an error. Please try again.", 
          sender: "bot" 
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

const handleSuggestedQuestion = (question: string) => {
  handleSendMessage(question)
}


  return (
    <div className="min-h-screen relative">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-2 border-green-200 shadow-2xl backdrop-blur-sm bg-white/95">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Bot className="w-7 h-7" />
              AI Plant Assistant
            </CardTitle>
            <CardDescription className="text-green-50">
              Ask me anything about plants, diseases, treatments, and farming techniques
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {/* Messages Container */}
            <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-white">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
                      message.sender === "bot" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {message.sender === "bot" ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div
                    className={`max-w-[75%] rounded-lg p-4 shadow-md ${
                      message.sender === "bot"
                        ? "bg-green-50 text-green-900 border border-green-200"
                        : "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                    }`}
                  >
                    <p className="whitespace-pre-line text-sm leading-relaxed">{message.text}</p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-md">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {showSuggestions && (
              <div className="p-4 bg-gradient-to-r from-gray-50 to-green-50 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3 font-medium">Try asking:</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestedQuestion("What are the common diseases affecting tomato plants?")}
                    className="justify-start text-left h-auto py-2 hover:bg-green-50 shadow-sm hover:shadow-md transition-all"
                  >
                    <Sprout className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-xs">Tomato diseases?</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestedQuestion("How do I improve soil fertility organically?")}
                    className="justify-start text-left h-auto py-2 hover:bg-green-50 shadow-sm hover:shadow-md transition-all"
                  >
                    <Leaf className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-xs">Soil fertility?</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestedQuestion("Best time to plant wheat in India?")}
                    className="justify-start text-left h-auto py-2 hover:bg-green-50 shadow-sm hover:shadow-md transition-all"
                  >
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-xs">Planting schedule?</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestedQuestion("How to control aphids naturally?")}
                    className="justify-start text-left h-auto py-2 hover:bg-green-50 shadow-sm hover:shadow-md transition-all"
                  >
                    <Bug className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-xs">Pest control?</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200 space-y-3">
              {selectedImage && (
                <div className="relative inline-block">
                  <img src={selectedImage} alt="preview" className="h-20 rounded-lg border-2 border-green-200" />
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all"
                    title="Remove image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {imageLimitReached && (
                <p className="text-xs text-red-600 font-medium">Image limit reached (3/3)</p>
              )}

              <div className="flex gap-2">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Ask about plants, diseases, treatments..."
                  className="flex-1 p-3 border-2 border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                  rows={2}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  aria-label="Upload plant image for analysis"
                  title="Upload plant image for analysis"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageLimitReached}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg px-4 shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
                  title="Upload image"
                >
                  <ImagePlus className="w-5 h-5" />
                </button>
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() && !selectedImage}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 shadow-lg hover:shadow-xl transition-all"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
