"use client"

import { useState, useEffect } from "react"
import { fetchGeminiResponse } from "@/lib/gemini"
import { createClient } from "@/lib/supabase/client"

export default function TestChatbotPage() {
  const supabase = createClient()
  const [message, setMessage] = useState("")
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Get the current user session
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) setUserId(data.user.id)
    }
    getUser()
  }, [])

  const handleSend = async () => {
    if (!message) return
    if (!userId) {
      alert("Please login to use the chatbot")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Fetch response from Gemini API
      const text = await fetchGeminiResponse(message)
      setResponse(text)

      // Store in Supabase
      await supabase.from("chat_history").insert({
        user_id: userId,
        message: message,
        reply: text,
        created_at: new Date().toISOString(),
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Chatbot Gemini API</h1>

      <textarea
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message for Gemini AI..."
        className="w-full border p-2 rounded mb-4"
      />

      <button
        onClick={handleSend}
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        {loading ? "Fetching..." : "Send"}
      </button>

      {response && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
          <strong>Response:</strong>
          <p>{response}</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  )
}
