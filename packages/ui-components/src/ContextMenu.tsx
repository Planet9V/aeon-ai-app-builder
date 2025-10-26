import { useEffect, useRef } from "react"

export interface MenuItem {
  id: string
  label: string
  icon?: string
  shortcut?: string
  disabled?: boolean
  separator?: boolean
  danger?: boolean
  onClick?: () => void
}

export interface ContextMenuProps {
  x: number
  y: number
  items: MenuItem[]
  onClose: () => void
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [onClose])

  useEffect(() => {
    if (menuRef.current) {
      const menu = menuRef.current
      const rect = menu.getBoundingClientRect()

      if (rect.right > window.innerWidth) {
        menu.style.left = `${x - rect.width}px`
      }

      if (rect.bottom > window.innerHeight) {
        menu.style.top = `${y - rect.height}px`
      }
    }
  }, [x, y])

  const handleItemClick = (item: MenuItem) => {
    if (item.disabled || item.separator) return

    item.onClick?.()
    onClose()
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[200px] bg-gray-800 border border-gray-700 rounded shadow-lg py-1"
      style={{ left: x, top: y }}
    >
      {items.map((item, index) => {
        if (item.separator) {
          return <div key={item.id || `sep-${index}`} className="h-px bg-gray-700 my-1" />
        }

        return (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
            className={`
              w-full px-3 py-2 text-left text-sm flex items-center gap-3
              transition-colors
              ${
                item.disabled
                  ? "text-gray-600 cursor-not-allowed"
                  : item.danger
                    ? "text-red-400 hover:bg-red-900/20"
                    : "text-gray-300 hover:bg-gray-700"
              }
            `}
          >
            {item.icon && <span className="w-4 text-center">{item.icon}</span>}
            <span className="flex-1">{item.label}</span>
            {item.shortcut && <span className="text-xs text-gray-500">{item.shortcut}</span>}
          </button>
        )
      })}
    </div>
  )
}

export default ContextMenu
