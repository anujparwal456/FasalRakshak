"use client"

import { useState } from "react"
import { predictDisease } from "@/lib/predict"

export default function DiseaseScanner() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handlePredict = async () => {
    if (!file) return

    setLoading(true)
    try {
      const data = await predictDisease(file)
      setResult(data)
    } catch {
      alert("Prediction failed")
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto p-6 border rounded-lg space-y-4">
      <input
        type="file"
        accept="image/*"
        aria-label="Upload plant image"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        onClick={handlePredict}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Scanning..." : "Scan Plant"}
      </button>

      {result && (
        <div className="p-4 bg-gray-100 rounded">
          <p><b>Disease:</b> {result.disease}</p>
          <p><b>Confidence:</b> {(result.confidence * 100).toFixed(2)}%</p>
        </div>
      )}
    </div>
  )
}
