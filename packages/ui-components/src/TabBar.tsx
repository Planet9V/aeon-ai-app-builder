import { useRef, useEffect, useState } from "react"
import { Tab, type TabProps } from "./Tab"

export interface TabItem {
  id: string
  title: string
  isDirty?: boolean
  icon?: string
  isActive?: boolean
}

export interface TabBarProps {
  tabs: TabItem[]
  activeTabId: string | null
  onTabClick: (tabId: string) => void
  onTabClose: (tabId: string) => void
  maxVisibleTabs?: number
}

export function TabBar({ tabs, activeTabId, onTabClick, onTabClose, maxVisibleTabs = 20 }: TabBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftScroll, setShowLeftScroll] = useState(false)
  const [showRightScroll, setShowRightScroll] = useState(false)

  useEffect(() => {
    checkScrollButtons()
  }, [tabs])

  useEffect(() => {
    const activeIndex = tabs.findIndex((t) => t.id === activeTabId)
    if (activeIndex !== -1 && scrollContainerRef.current) {
      const tabElements = scrollContainerRef.current.children
      const activeTab = tabElements[activeIndex] as HTMLElement
      if (activeTab) {
        activeTab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
      }
    }
  }, [activeTabId])

  const checkScrollButtons = () => {
    if (!scrollContainerRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setShowLeftScroll(scrollLeft > 0)
    setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 1)
  }

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return

    const scrollAmount = 200
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })

    setTimeout(checkScrollButtons, 300)
  }

  if (tabs.length === 0) {
    return (
      <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-4">
        <span className="text-gray-500 text-sm">No files open</span>
      </div>
    )
  }

  return (
    <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center relative">
      {showLeftScroll && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 z-10 h-full w-8 bg-gradient-to-r from-gray-800 to-transparent flex items-center justify-center hover:from-gray-700 transition"
          aria-label="Scroll left"
        >
          <span className="text-gray-400">‹</span>
        </button>
      )}

      <div
        ref={scrollContainerRef}
        className="flex-1 flex overflow-x-auto scrollbar-none"
        onScroll={checkScrollButtons}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            id={tab.id}
            title={tab.title}
            isDirty={tab.isDirty}
            icon={tab.icon}
            isActive={tab.id === activeTabId}
            onClick={() => onTabClick(tab.id)}
            onClose={() => onTabClose(tab.id)}
          />
        ))}
      </div>

      {showRightScroll && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 z-10 h-full w-8 bg-gradient-to-l from-gray-800 to-transparent flex items-center justify-center hover:from-gray-700 transition"
          aria-label="Scroll right"
        >
          <span className="text-gray-400">›</span>
        </button>
      )}
    </div>
  )
}

export default TabBar
