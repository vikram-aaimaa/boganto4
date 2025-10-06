// Create a simple error component for blog posts
function BlogError({ error }) {
  return (
    <div className="flex items-center justify-center min-h-[300px] bg-red-50 rounded-xl p-6">
      <div className="text-center">
        <h3 className="text-red-800 text-lg font-semibold mb-2">Error Loading Blog</h3>
        <p className="text-red-600">{error}</p>
      </div>
    </div>
  );
}

export default BlogError;