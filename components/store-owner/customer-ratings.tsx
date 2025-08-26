"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { Star, User } from "lucide-react"

export function CustomerRatings() {
  const { user, stores, ratings, users } = useAuth()

  // Find the store owned by the current user
  const ownedStore = stores.find((store) => store.ownerId === user?.id)

  // Get ratings for the owned store
  const storeRatings = ownedStore ? ratings.filter((rating) => rating.storeId === ownedStore.id) : []

  // Sort ratings by date (newest first)
  const sortedRatings = storeRatings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const getUserName = (userId: string) => {
    const customer = users.find((u) => u.id === userId)
    return customer ? customer.name : "Unknown User"
  }

  const getUserEmail = (userId: string) => {
    const customer = users.find((u) => u.id === userId)
    return customer ? customer.email : "Unknown Email"
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "default"
    if (rating >= 3) return "secondary"
    return "destructive"
  }

  if (!ownedStore) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Ratings</CardTitle>
        <p className="text-sm text-muted-foreground">Users who have submitted ratings for {ownedStore.name}</p>
      </CardHeader>
      <CardContent>
        {sortedRatings.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No ratings submitted yet</p>
            <p className="text-sm text-muted-foreground mt-2">Customers will appear here once they rate your store</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedRatings.map((rating) => (
              <div key={rating.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{getUserName(rating.userId)}</span>
                    </div>
                    <Badge variant={getRatingColor(rating.rating)}>
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      {rating.rating}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Email: {getUserEmail(rating.userId)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
