"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { X, Send, Bot, Minimize2, ImagePlus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { chatbotKnowledge } from "@/lib/chatbot-data"
import { createClient } from "@/lib/supabase/client"

interface Message {
    id: string
    text: string
    sender: "user" | "bot"
    timestamp: Date
    image?: string
}

export function FloatingChatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [inputMessage, setInputMessage] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const [userName, setUserName] = useState<string | null>(null)
    const [userEmail, setUserEmail] = useState<string | null>(null)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [imageCount, setImageCount] = useState(0)
    const [imageLimitReached, setImageLimitReached] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const fetchUserName = async () => {
            const supabase = createClient()
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (user) {
                const name = user.user_metadata?.name || user.email?.split("@")[0] || "User"
                const email = user.email || ""
                setUserName(name)
                setUserEmail(email)

                // Fetch user's image count
                try {
                    const response = await fetch("/api/chat/image-count", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email }),
                    })
                    if (!response.ok) {
                        console.warn(`Image count API returned ${response.status}`)
                    }
                    const data = await response.json()
                    const count = data.count || 0
                    console.log("📊 Image count loaded:", count)
                    setImageCount(count)
                    setImageLimitReached(count >= 3)
                } catch (error) {
                    console.error("❌ Error fetching image count:", error)
                    console.log("⚠️ Image upload may not work. Check: /api/chat/image-count endpoint")
                }

                setMessages([
                    {
                        id: "1",
                        text: `Hello ${name}! I'm FasalRakshak AI Assistant. Ask me anything about plants, diseases, fertilizers, or crop protection! You can also upload plant images for analysis (3 images max).`,
                        sender: "bot",
                        timestamp: new Date(),
                    },
                ])
            } else {
                setMessages([
                    {
                        id: "1",
                        text: "Hello! I'm FasalRakshak AI Assistant. Ask me anything about plants, diseases, fertilizers, or crop protection!",
                        sender: "bot",
                        timestamp: new Date(),
                    },
                ])
            }
        }

        fetchUserName()
    }, [])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const getBotResponse = (userMessage: string): string => {
        const lowerMessage = userMessage.toLowerCase()

        for (const [key, value] of Object.entries(chatbotKnowledge)) {
            if (lowerMessage.includes(key) || key.split(" ").some((word) => lowerMessage.includes(word))) {
                return value.response
            }
        }

        if (lowerMessage.includes("pest") || lowerMessage.includes("insect")) {
            return chatbotKnowledge["aphid control"].response
        }

        if (
            lowerMessage.includes("plant") ||
            lowerMessage.includes("grow") ||
            lowerMessage.includes("crop") ||
            lowerMessage.includes("farming")
        ) {
            return `I can help you with various agricultural topics:

• Plant diseases and their treatment
• Soil fertility management
• Irrigation techniques
• Fertilizer recommendations
• Pest control methods
• Crop planting schedules

What specific topic would you like to know about?`
        }

        return `Thank you for your question! I specialize in:

• Plant disease identification and treatment
• Crop protection strategies
• Soil and fertilizer management
• Irrigation best practices
• Pest and disease control
• Agricultural tips and guidance

Could you please ask about a specific crop, disease, or farming practice? I'm here to help!`
    }

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

    const handleSendMessage = async () => {
        if (!inputMessage.trim() && !selectedImage) return

        if (!userEmail) {
            alert("Please login to use this feature")
            return
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputMessage || "(Image only)",
            sender: "user",
            timestamp: new Date(),
            image: selectedImage || undefined,
        }

        setMessages((prev) => [...prev, userMessage])
        setInputMessage("")
        setSelectedImage(null)
        setIsTyping(true)

        try {
            // Send to Gemini API with image support
            const response = await fetch("/api/chat/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: userEmail,
                    message: inputMessage,
                    image: selectedImage,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                if (data.error?.includes("maximum image upload limit")) {
                    setImageLimitReached(true)
                    setMessages((prev) => [
                        ...prev,
                        {
                            id: (Date.now() + 1).toString(),
                            text: "You have reached the maximum image upload limit (3 images). You can continue chatting without images.",
                            sender: "bot",
                            timestamp: new Date(),
                        },
                    ])
                } else {
                    throw new Error(data.error || "Failed to get response")
                }
                setIsTyping(false)
                return
            }

            // Update image count if image was uploaded
            if (selectedImage) {
                const newCount = imageCount + 1
                setImageCount(newCount)
                setImageLimitReached(newCount >= 3)
            }

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: data.reply || "Unable to process your request",
                sender: "bot",
                timestamp: new Date(),
            }
            setMessages((prev) => [...prev, botMessage])
        } catch (error) {
            console.error("Chat error:", error)
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "Sorry, I couldn't process your request. Please try again.",
                sender: "bot",
                timestamp: new Date(),
            }
            setMessages((prev) => [...prev, botMessage])
        } finally {
            setIsTyping(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-full shadow-2xl hover:shadow-[0_20px_60px_rgba(16,185,129,0.5)] flex items-center justify-center transform hover:scale-110 transition-all duration-300 group animate-bounce hover:animate-none"
                    aria-label="Open AI Chatbot"
                >
                    <Bot className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <Card className="fixed bottom-6 right-6 z-50 w-[90vw] max-w-md h-[70vh] max-h-[600px] shadow-[0_20px_70px_rgba(0,0,0,0.3)] border-2 border-green-300 flex flex-col bg-white overflow-hidden animate-slide-up">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-4 flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                                <Bot className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">FasalRakshak AI</h3>
                                <p className="text-xs text-green-100">Online - Ask me anything!</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200 hover:scale-110"
                                aria-label="Minimize chat"
                                title="Minimize - Go back to website"
                            >
                                <Minimize2 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200 hover:scale-110"
                                aria-label="Close chat"
                                title="Close chat"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-green-50 to-emerald-50">
                        {messages.map((message) => (
                            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${message.sender === "user"
                                            ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                                            : "bg-white text-gray-800 shadow-md border border-green-200"
                                        }`}
                                >
                                    {message.image && (
                                        <img src={message.image} alt="uploaded" className="max-w-full h-auto rounded-lg mb-2" />
                                    )}
                                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                                    <span
                                        className={`text-xs mt-1 block ${message.sender === "user" ? "text-green-100" : "text-gray-400"}`}
                                    >
                                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white rounded-2xl px-4 py-3 shadow-md border border-green-200">
                                    <div className="flex gap-2">
                                        <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce animation-delay-200" />
                                        <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce animation-delay-400" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white border-t border-green-200 shadow-lg space-y-3">
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
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask about plants, diseases..."
                                className="flex-1 px-4 py-2 border-2 border-green-200 rounded-full focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all"
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
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
                                title="Upload image"
                            >
                                <ImagePlus className="w-5 h-5" />
                            </button>
                            <Button
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim() && !selectedImage}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl transition-all hover:scale-110"
                            >
                                <Send className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
        </>
    )
}
