"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { StoreOwnerHeader } from "@/components/store-owner/store-owner-header"
import { StoreStats } from "@/components/store-owner/store-stats"
import { CustomerRatings } from "@/components/store-owner/customer-ratings"
import { RatingAnalytics } from "@/components/store-owner/rating-analytics"

export default function StoreOwnerDashboard() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    if (user.role !== "OWNER") {
      router.push("/")
      return
    }
  }, [user, router])

  if (!user || user.role !== "OWNER") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreOwnerHeader />
      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <StoreStats />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CustomerRatings />
            <RatingAnalytics />
          </div>
        </div>
      </main>
    </div>
  )
}
