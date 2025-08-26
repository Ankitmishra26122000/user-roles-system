"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { Users, Store, Star } from "lucide-react"

export function DashboardStats() {
  const { users, stores, ratings } = useAuth()

  const stats = [
    {
      title: "Total Users",
      value: users.length,
      icon: Users,
      description: "Registered users",
    },
    {
      title: "Total Stores",
      value: stores.length,
      icon: Store,
      description: "Active stores",
    },
    {
      title: "Total Ratings",
      value: ratings.length,
      icon: Star,
      description: "Submitted ratings",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
  )
}
