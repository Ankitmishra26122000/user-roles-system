"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { Star, Users, TrendingUp } from "lucide-react"

export function StoreStats() {
  const { user, stores, ratings, users } = useAuth()

  // Find the store owned by the current user
  const ownedStore = stores.find((store) => store.ownerId === user?.id)

  // Get ratings for the owned store
  const storeRatings = ownedStore ? ratings.filter((rating) => rating.storeId === ownedStore.id) : []

  // Calculate average rating
  const averageRating =
    storeRatings.length > 0 ? storeRatings.reduce((sum, rating) => sum + rating.rating, 0) / storeRatings.length : 0

  // Get unique users who rated the store
  const uniqueRaters = new Set(storeRatings.map((rating) => rating.userId)).size

  if (!ownedStore) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">No store found for your account. Please contact an administrator.</p>
        </CardContent>
      </Card>
    )
  }

  const stats = [
    {
      title: "Average Rating",
      value: averageRating.toFixed(1),
      icon: Star,
      description: `Based on ${storeRatings.length} rating${storeRatings.length !== 1 ? "s" : ""}`,
    },
    {
      title: "Total Ratings",
      value: storeRatings.length,
      icon: TrendingUp,
      description: "Customer reviews",
    },
    {
      title: "Unique Customers",
      value: uniqueRaters,
      icon: Users,
      description: "Who rated your store",
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{ownedStore.name}</CardTitle>
          <p className="text-muted-foreground">{ownedStore.address}</p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
