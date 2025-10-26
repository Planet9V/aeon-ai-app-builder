import { useState, useRef, useEffect } from "react"

export interface ModelInfo {
  id: string
  name: string
  provider: string
  contextLength: number
  pricing: {
    prompt: number
    completion: number
  }
}

export interface AIModelSelectorProps {
  models: ModelInfo[]
  selectedModel: string
  onSelect: (modelId: string) => void
  className?: string
}

export function AIModelSelector({ models, selectedModel, onSelect, className = "" }: AIModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedModelInfo = models.find((m) => m.id === selectedModel)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen])

  const handleSelect = (modelId: string) => {
    onSelect(modelId)
    setIsOpen(false)
  }

  const formatContext = (length: number): string => {
    if (length >= 1000) {
      return `${(length / 1000).toFixed(0)}k`
    }
    return length.toString()
  }

  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}/1M`
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded hover:bg-gray-700 transition text-sm text-gray-300"
        aria-label="Select AI model"
        aria-expanded={isOpen}
      >
        <span className="text-blue-400">🤖</span>
        <span className="font-medium">{selectedModelInfo?.name || "Select Model"}</span>
        <span className="text-gray-500">▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs text-gray-400 px-2 py-1 mb-1">Available Models</div>

            {models.map((model) => {
              const isSelected = model.id === selectedModel

              return (
                <button
                  key={model.id}
                  onClick={() => handleSelect(model.id)}
                  className={`w-full text-left px-3 py-2 rounded transition ${
                    isSelected ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium flex items-center gap-2">
                        {model.name}
                        {isSelected && <span className="text-xs">✓</span>}
                      </div>
                      <div className="text-xs opacity-75 mt-0.5">{model.provider}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-mono">{formatContext(model.contextLength)} ctx</div>
                      <div className="text-xs opacity-75 mt-0.5">{formatPrice(model.pricing.prompt)}</div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {selectedModelInfo && (
            <div className="border-t border-gray-700 p-3 bg-gray-750">
              <div className="text-xs text-gray-400 mb-2">Selected Model Details</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Context Length:</span>
                  <span className="text-gray-300 font-mono">{selectedModelInfo.contextLength.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Prompt Pricing:</span>
                  <span className="text-gray-300 font-mono">{formatPrice(selectedModelInfo.pricing.prompt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Completion Pricing:</span>
                  <span className="text-gray-300 font-mono">{formatPrice(selectedModelInfo.pricing.completion)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AIModelSelector
