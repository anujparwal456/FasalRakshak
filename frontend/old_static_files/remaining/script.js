// Mock disease database
const mockDiseases = [
  {
    id: 1,
    crop: "Tomato",
    disease: "Early Blight",
    confidence: 94,
    status: "diseased",
    scientificName: "Alternaria solani",
    severity: "Moderate",
    affectedArea: "Leaves and Stems",
    symptoms: [
      "Dark brown spots with concentric rings on older leaves",
      "Yellowing around the spots",
      "Premature leaf drop",
      "Stems may show dark lesions",
    ],
    remedy:
      "Apply fungicides containing chlorothalonil or mancozeb. Remove infected leaves immediately and destroy them.",
    prevention:
      "Ensure proper spacing between plants for air circulation. Avoid overhead watering. Use disease-free seeds.",
    chemicals: [
      { name: "Chlorothalonil 75% WP", dosage: "2g per liter of water", application: "Spray every 7-10 days" },
      { name: "Mancozeb 75% WP", dosage: "2.5g per liter of water", application: "Apply at first sign of disease" },
      { name: "Azoxystrobin 23% SC", dosage: "1ml per liter of water", application: "Preventive spray every 14 days" },
    ],
    fertilizer: "Use balanced NPK fertilizer (10-10-10). Apply copper-based fungicide as preventive measure.",
    organicTreatment: "Neem oil spray (5ml per liter), Baking soda solution (1 tablespoon per liter)",
    estimatedRecovery: "2-3 weeks with proper treatment",
    spreadRisk: "High - can spread rapidly in humid conditions",
  },
  {
    id: 2,
    crop: "Potato",
    disease: "Late Blight",
    confidence: 89,
    status: "diseased",
    scientificName: "Phytophthora infestans",
    severity: "Severe",
    affectedArea: "Leaves, Stems, and Tubers",
    symptoms: [
      "Water-soaked spots on leaves that turn brown",
      "White fungal growth on leaf undersides",
      "Rapid plant collapse during humid weather",
      "Tuber infection with brown rot",
    ],
    remedy:
      "Apply systemic fungicides containing metalaxyl immediately. Remove and destroy infected plants to prevent spread.",
    prevention:
      "Plant resistant varieties. Maintain proper drainage and avoid wet conditions. Apply preventive fungicides before symptoms appear.",
    chemicals: [
      { name: "Metalaxyl 8% + Mancozeb 64% WP", dosage: "2.5g per liter", application: "Spray every 7 days" },
      { name: "Cymoxanil 8% + Mancozeb 64% WP", dosage: "2g per liter", application: "Apply at disease onset" },
      { name: "Dimethomorph 50% WP", dosage: "1g per liter", application: "Use in rotation with other fungicides" },
    ],
    fertilizer: "Use potassium-rich fertilizer. Apply Bordeaux mixture preventively. Avoid excessive nitrogen.",
    organicTreatment: "Bordeaux mixture (Copper sulfate + lime), Garlic extract spray",
    estimatedRecovery: "3-4 weeks, may require replanting in severe cases",
    spreadRisk: "Very High - can destroy entire crop in days",
  },
  {
    id: 3,
    crop: "Corn",
    disease: "Healthy",
    confidence: 96,
    status: "healthy",
    scientificName: "N/A",
    severity: "None",
    affectedArea: "None",
    symptoms: ["Plant shows no signs of disease", "Healthy green foliage", "Normal growth pattern"],
    remedy: "No treatment needed. Continue regular care and monitoring.",
    prevention:
      "Maintain current practices. Monitor regularly for any signs of disease. Ensure proper nutrition and watering.",
    chemicals: [],
    fertilizer: "Continue with balanced fertilization schedule. NPK 20-20-20 for vegetative growth.",
    organicTreatment: "Compost tea application monthly for plant health",
    estimatedRecovery: "N/A - Plant is healthy",
    spreadRisk: "None",
  },
  {
    id: 4,
    crop: "Rice",
    disease: "Bacterial Leaf Blight",
    confidence: 87,
    status: "diseased",
    scientificName: "Xanthomonas oryzae",
    severity: "Moderate to Severe",
    affectedArea: "Leaves",
    symptoms: [
      "Water-soaked lesions on leaf margins",
      "Lesions turn yellow then white",
      "Bacterial ooze visible in morning",
      "Leaf curling and wilting",
    ],
    remedy:
      "Apply copper-based bactericides immediately. Remove infected leaves and improve field drainage. Use antibiotics if severe.",
    prevention: "Use disease-free seeds. Avoid excessive nitrogen fertilization. Maintain proper water management.",
    chemicals: [
      { name: "Copper Oxychloride 50% WP", dosage: "3g per liter", application: "Spray every 10 days" },
      { name: "Streptocycline (Antibiotic)", dosage: "1g per 10 liters", application: "Apply at first symptom" },
      { name: "Plantomycin", dosage: "1g per 10 liters", application: "Use with copper fungicide" },
    ],
    fertilizer:
      "Balanced NPK with emphasis on potassium. Apply zinc sulfate if deficient. Reduce nitrogen during infection.",
    organicTreatment: "Pseudomonas fluorescens treatment, Copper-based organic fungicide",
    estimatedRecovery: "2-4 weeks depending on severity",
    spreadRisk: "High - spreads through water and wind",
  },
  {
    id: 5,
    crop: "Wheat",
    disease: "Rust (Yellow Rust)",
    confidence: 92,
    status: "diseased",
    scientificName: "Puccinia striiformis",
    severity: "Moderate",
    affectedArea: "Leaves and Stems",
    symptoms: [
      "Yellow-orange pustules in stripes on leaves",
      "Reduced photosynthesis",
      "Premature leaf death",
      "Stunted grain development",
    ],
    remedy: "Apply triazole fungicides. Remove volunteer wheat plants. Use resistant varieties for next planting.",
    prevention: "Plant resistant varieties. Remove alternate hosts. Apply preventive fungicides at tillering stage.",
    chemicals: [
      { name: "Propiconazole 25% EC", dosage: "1ml per liter", application: "Spray at first sign" },
      { name: "Tebuconazole 25% EC", dosage: "1ml per liter", application: "Apply every 14 days" },
      { name: "Mancozeb 75% WP", dosage: "2g per liter", application: "Preventive application" },
    ],
    fertilizer: "Balanced NPK. Increase potassium for disease resistance. Apply sulfur-containing fertilizers.",
    organicTreatment: "Sulfur dust application, Neem oil spray with copper",
    estimatedRecovery: "3-4 weeks, yield may be affected",
    spreadRisk: "High - spreads rapidly through wind-borne spores",
  },
]

let uploadedImage = null
let cameraStream = null

// Scroll to upload section
function scrollToUpload() {
  window.scrollTo({ top: 400, behavior: "smooth" })
}

// Handle file upload
function handleFileUpload(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedImage = e.target.result
      showImagePreview(uploadedImage)
      stopCamera()
    }
    reader.readAsDataURL(file)
  }
}

// Open camera
async function openCamera() {
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    })

    const videoElement = document.getElementById("videoElement")
    videoElement.srcObject = cameraStream

    document.getElementById("cameraView").classList.remove("hidden")
    document.getElementById("cameraBtn").disabled = true
    document.getElementById("imagePreview").classList.add("hidden")
    document.getElementById("scanButtonWrapper").classList.add("hidden")

    uploadedImage = null

    // Reinitialize lucide icons
    window.lucide.createIcons()
  } catch (err) {
    console.error("Error accessing camera:", err)
    alert("Could not access camera. Please upload an image instead.")
  }
}

// Capture photo
function capturePhoto() {
  const videoElement = document.getElementById("videoElement")
  const canvasElement = document.getElementById("canvasElement")
  const context = canvasElement.getContext("2d")

  canvasElement.width = videoElement.videoWidth
  canvasElement.height = videoElement.videoHeight
  context.drawImage(videoElement, 0, 0)

  uploadedImage = canvasElement.toDataURL("image/png")
  showImagePreview(uploadedImage)
  stopCamera()
}

// Stop camera
function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop())
    cameraStream = null
  }

  document.getElementById("cameraView").classList.add("hidden")
  document.getElementById("cameraBtn").disabled = false
}

// Show image preview
function showImagePreview(imageSrc) {
  document.getElementById("previewImage").src = imageSrc
  document.getElementById("imagePreview").classList.remove("hidden")
  document.getElementById("scanButtonWrapper").classList.remove("hidden")

  // Reinitialize lucide icons
  window.lucide.createIcons()
}

// Remove image
function removeImage() {
  uploadedImage = null
  document.getElementById("imagePreview").classList.add("hidden")
  document.getElementById("scanButtonWrapper").classList.add("hidden")
  document.getElementById("fileInput").value = ""
}

// Scan disease
function scanDisease() {
  if (!uploadedImage) {
    alert("Please upload or capture an image first!")
    return
  }

  const scanBtn = document.getElementById("scanBtn")
  const scanBtnText = document.getElementById("scanBtnText")

  scanBtn.disabled = true
  scanBtnText.innerHTML =
    '<div style="width: 1.25rem; height: 1.25rem; border: 3px solid white; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; display: inline-block; margin-right: 0.5rem;"></div>Scanning with AI...'

  document.getElementById("scanningProgress").classList.remove("hidden")

  setTimeout(() => {
    const randomDisease = mockDiseases[Math.floor(Math.random() * mockDiseases.length)]

    // Store data in sessionStorage
    const scanResult = {
      ...randomDisease,
      image: uploadedImage,
      scanDate: new Date().toISOString(),
    }

    sessionStorage.setItem("scanResult", JSON.stringify(scanResult))

    // Redirect to results page
    window.location.href = "results.html"
  }, 2500)
}

// Initialize lucide icons on page load
document.addEventListener("DOMContentLoaded", () => {
  window.lucide.createIcons()
})

// Declare lucide variable
window.lucide = {
  createIcons: () => {
    // Placeholder for lucide icon creation logic
    console.log("Lucide icons created")
  },
}
