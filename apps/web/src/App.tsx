import { Routes, Route } from "react-router-dom"
import EditorPage from "./pages/EditorPage"
import ProjectsPage from "./pages/ProjectsPage"

function App() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-900">
      <Routes>
        <Route path="/" element={<ProjectsPage />} />
        <Route path="/editor/:projectId" element={<EditorPage />} />
      </Routes>
    </div>
  )
}

export default App
