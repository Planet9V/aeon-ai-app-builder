function ProjectsPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">OpenCode Platform</h1>
        <p className="text-gray-400 mb-8">Your projects will appear here</p>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Create New Project
        </button>
      </div>
    </div>
  )
}

export default ProjectsPage
