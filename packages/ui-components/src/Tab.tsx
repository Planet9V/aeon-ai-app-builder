import { useState } from "react"

export interface TabProps {
  id: string
  title: string
  isDirty?: boolean
  icon?: string
  isActive?: boolean
  onClick: () => void
  onClose: () => void
}

export function Tab({ id, title, isDirty, icon, isActive, onClick, onClose }: TabProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClose()
  }

  const displayTitle = title.length > 20 ? title.substring(0, 20) + "..." : title

  return (
    <div
      className={`
        flex items-center gap-2 px-3 h-full min-w-[120px] max-w-[200px]
        border-r border-gray-700 cursor-pointer
        transition-colors duration-150
        ${isActive ? "bg-gray-900 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-750 hover:text-gray-200"}
      `}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={title}
    >
      {icon && <span className="text-sm flex-shrink-0">{icon}</span>}

      <span className="flex-1 text-sm truncate select-none">{displayTitle}</span>

      {isDirty && !isHovered && <span className="text-yellow-400 text-lg leading-none flex-shrink-0">●</span>}

      {(isHovered || isActive) && (
        <button
          onClick={handleClose}
          className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center hover:bg-gray-600 transition"
          aria-label={`Close ${title}`}
        >
          <span className="text-gray-400 hover:text-white text-sm">×</span>
        </button>
      )}
    </div>
  )
}

export default Tab
