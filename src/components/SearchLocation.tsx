import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface SearchResult {
  display_name: string
  lat: string
  lon: string
}

interface SearchLocationProps {
  onSelect: (lng: number, lat: number, name: string) => void
}

export function SearchLocation({ onSelect }: SearchLocationProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

  async function search(q: string) {
    if (q.length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`,
        { headers: { "Accept-Language": "ru,en" } }
      )
      const data: SearchResult[] = await res.json()
      setResults(data)
      setOpen(data.length > 0)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  function handleInput(value: string) {
    setQuery(value)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => search(value), 400)
  }

  function handleSelect(r: SearchResult) {
    onSelect(parseFloat(r.lon), parseFloat(r.lat), r.display_name)
    setQuery(r.display_name.split(",")[0])
    setOpen(false)
  }

  return (
    <div className="relative">
      <div className="flex gap-1.5">
        <Input
          placeholder="Search location..."
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => search(query)}
          disabled={loading}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {results.map((r, i) => (
            <button
              key={i}
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors border-b border-border last:border-b-0 cursor-pointer"
              onClick={() => handleSelect(r)}
            >
              {r.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
