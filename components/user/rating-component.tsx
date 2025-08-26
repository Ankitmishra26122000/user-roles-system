"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Star } from "lucide-react"

interface RatingComponentProps {
  storeId: string
  storeName: string
}

export function RatingComponent({ storeId, storeName }: RatingComponentProps) {
  const { user, getUserRatingForStore, submitRating } = useAuth()
  const { toast } = useToast()

  const existingRating = getUserRatingForStore(storeId)
  const [selectedRating, setSelectedRating] = useState(existingRating?.rating || 0)
  const [hoveredRating, setHoveredRating] = useState(0)

  const handleRatingSubmit = () => {
    if (selectedRating === 0) {
      toast({
        title: "Please select a rating",
        description: "Choose a rating between 1 and 5 stars",
        variant: "destructive",
      })
      return
    }

    submitRating(storeId, selectedRating)
    toast({
      title: existingRating ? "Rating updated" : "Rating submitted",
      description: `You rated ${storeName} ${selectedRating} star${selectedRating > 1 ? "s" : ""}`,
    })
  }

  if (!user) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Your Rating:</span>
        {existingRating && (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">{existingRating.rating}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              className="p-1"
              onMouseEnter={() => setHoveredRating(rating)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setSelectedRating(rating)}
            >
              <Star
                className={`h-5 w-5 transition-colors ${
                  rating <= (hoveredRating || selectedRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
        <Button size="sm" onClick={handleRatingSubmit}>
          {existingRating ? "Update Rating" : "Submit Rating"}
        </Button>
      </div>
    </div>
  )
}
