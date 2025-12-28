export function Footer() {
  return (
    <footer className="relative z-50 w-full bg-white border-t border-green-200 py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm">
          <div>© {new Date().getFullYear()} Plant Disease Prediction </div>
          <div className="text-center sm:text-right">
            <p className="text-gray-700">Developed by <span className="font-semibold text-green-600">Anuj Parwal</span></p>
            <p className="text-gray-600">
              Mail: <a href="mailto:anujparwal3@gmail.com" className="text-green-600 hover:text-green-700 font-medium">anujparwal3@gmail.com</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
