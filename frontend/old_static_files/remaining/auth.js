// Authentication functions using localStorage

// Initialize users database in localStorage
function initializeDatabase() {
  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify([]))
  }
}

// Get all users from localStorage
function getUsers() {
  const users = localStorage.getItem("users")
  return users ? JSON.parse(users) : []
}

// Save users to localStorage
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users))
}

// Check if user is logged in
function isLoggedIn() {
  return localStorage.getItem("currentUser") !== null
}

// Get current user
function getCurrentUser() {
  const user = localStorage.getItem("currentUser")
  return user ? JSON.parse(user) : null
}

// Set current user
function setCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user))
}

// Logout user
function logoutUser() {
  localStorage.removeItem("currentUser")
}

// Show alert message
function showAlert(elementId, message, type = "error") {
  const alertElement = document.getElementById(elementId)
  if (!alertElement) return

  alertElement.textContent = message
  alertElement.className = `alert alert-${type}`
  alertElement.classList.remove("hidden")

  // Hide after 5 seconds
  setTimeout(() => {
    alertElement.classList.add("hidden")
  }, 5000)
}

// Handle signup form submission
function handleSignup(event) {
  event.preventDefault()

  const name = document.getElementById("signupName").value.trim()
  const email = document.getElementById("signupEmail").value.trim().toLowerCase()
  const password = document.getElementById("signupPassword").value
  const confirmPassword = document.getElementById("confirmPassword").value
  const agreeTerms = document.getElementById("agreeTerms").checked

  // Validate passwords match
  if (password !== confirmPassword) {
    showAlert("signupAlert", "Passwords do not match!", "error")
    return
  }

  // Validate password length
  if (password.length < 6) {
    showAlert("signupAlert", "Password must be at least 6 characters long!", "error")
    return
  }

  // Check terms agreement
  if (!agreeTerms) {
    showAlert("signupAlert", "Please agree to the Terms of Service!", "error")
    return
  }

  // Initialize database
  initializeDatabase()
  const users = getUsers()

  // Check if email already exists
  const existingUser = users.find((u) => u.email === email)
  if (existingUser) {
    showAlert("signupAlert", "Email already registered. Please login instead.", "error")
    return
  }

  // Create new user
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password, // In production, this should be hashed!
    createdAt: new Date().toISOString(),
    scans: [],
  }

  // Save user
  users.push(newUser)
  saveUsers(users)

  // Log the user in
  const userToStore = { ...newUser }
  delete userToStore.password // Don't store password in currentUser
  setCurrentUser(userToStore)

  // Show success and redirect
  showAlert("signupAlert", "Account created successfully! Redirecting...", "success")

  setTimeout(() => {
    window.location.href = "dashboard.html"
  }, 1500)
}

// Handle login form submission
function handleLogin(event) {
  event.preventDefault()

  const email = document.getElementById("loginEmail").value.trim().toLowerCase()
  const password = document.getElementById("loginPassword").value
  const rememberMe = document.getElementById("rememberMe").checked

  // Initialize database
  initializeDatabase()
  const users = getUsers()

  // Find user
  const user = users.find((u) => u.email === email)

  if (!user) {
    showAlert("loginAlert", "Email not found. Please sign up first.", "error")
    return
  }

  // Check password
  if (user.password !== password) {
    showAlert("loginAlert", "Incorrect password. Please try again.", "error")
    return
  }

  // Log the user in
  const userToStore = { ...user }
  delete userToStore.password // Don't store password
  setCurrentUser(userToStore)

  // Show success and redirect
  showAlert("loginAlert", "Login successful! Redirecting...", "success")

  setTimeout(() => {
    window.location.href = "dashboard.html"
  }, 1500)
}

// Protect pages that require authentication
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = "login.html"
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  initializeDatabase()
  window.lucide.createIcons()
})
