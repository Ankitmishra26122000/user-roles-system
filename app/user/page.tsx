"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { UserHeader } from "@/components/user/user-header"
import { StoresGrid } from "@/components/user/stores-grid"

export default function UserDashboard() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    if (user.role !== "user") {
      router.push("/")
      return
    }
  }, [user, router])

  if (!user || user.role !== "user") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <StoresGrid />
        </div>
      </main>
    </div>
  )
}
