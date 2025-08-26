"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { LogOut, User, Settings } from "lucide-react"
import { useState } from "react"
import { UpdatePasswordDialog } from "./update-password-dialog"

export function UserHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Store Browser</h1>
              <p className="text-sm text-gray-600">Discover and rate amazing stores</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-600">{user?.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowPasswordDialog(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Update Password
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      <UpdatePasswordDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog} />
    </>
  )
}
