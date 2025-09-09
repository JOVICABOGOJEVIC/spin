<button 
  type="submit" 
  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
  disabled={loading}
>
  {loading ? (
    <div className="flex items-center justify-center">
      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
      Loading...
    </div>
  ) : (
    'Login'
  )}
</button> 