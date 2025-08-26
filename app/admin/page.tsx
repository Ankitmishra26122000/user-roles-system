"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { AdminHeader } from "@/components/admin/admin-header"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { AddUserDialog } from "@/components/admin/add-user-dialog"
import { AddStoreDialog } from "@/components/admin/add-store-dialog"
import { UsersTable } from "@/components/admin/users-table"
import { StoresTable } from "@/components/admin/stores-table"

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    if (user.role !== "ADMIN") {
      router.push("/")
      return
    }
  }, [user, router])

  if (!user || user.role !== "ADMIN") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <DashboardStats />

          <div className="flex gap-4">
            <AddUserDialog />
            <AddStoreDialog />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <UsersTable />
            <StoresTable />
          </div>
        </div>
      </main>
    </div>
  )
}
