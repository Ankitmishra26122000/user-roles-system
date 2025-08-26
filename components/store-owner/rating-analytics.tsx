"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { Star } from "lucide-react"

export function RatingAnalytics() {
  const { user, stores, ratings } = useAuth()

  // Find the store owned by the current user
  const ownedStore = stores.find((store) => store.ownerId === user?.id)

  // Get ratings for the owned store
  const storeRatings = ownedStore ? ratings.filter((rating) => rating.storeId === ownedStore.id) : []

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = storeRatings.filter((rating) => rating.rating === star).length
    const percentage = storeRatings.length > 0 ? (count / storeRatings.length) * 100 : 0
    return { star, count, percentage }
  })

  if (!ownedStore || storeRatings.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rating Distribution</CardTitle>
        <p className="text-sm text-muted-foreground">Breakdown of ratings for {ownedStore.name}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {ratingDistribution.map(({ star, count, percentage }) => (
            <div key={star} className="flex items-center gap-4">
              <div className="flex items-center gap-1 w-16">
                <span className="text-sm font-medium">{star}</span>
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="flex-1">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              <div className="text-sm text-muted-foreground w-16 text-right">
                {count} ({percentage.toFixed(0)}%)
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
