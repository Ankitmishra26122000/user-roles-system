"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Plus } from "lucide-react"

export function AddStoreDialog() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    ownerId: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { addStore, users } = useAuth()
  const { toast } = useToast()

  // Get store owners for selection
  const storeOwners = users.filter((user) => user.role === "store_owner")

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (formData.name.length < 20) {
      newErrors.name = "Name must be at least 20 characters long"
    } else if (formData.name.length > 60) {
      newErrors.name = "Name must not exceed 60 characters"
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (formData.address.length > 400) {
      newErrors.address = "Address must not exceed 400 characters"
    }

    if (!formData.ownerId) {
      newErrors.ownerId = "Please select a store owner"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    addStore(formData)
    toast({
      title: "Store added successfully",
      description: `${formData.name} has been added to the system`,
    })

    setFormData({
      name: "",
      email: "",
      address: "",
      ownerId: "",
    })
    setErrors({})
    setOpen(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Store
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Store</DialogTitle>
          <DialogDescription>Register a new store in the system.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="store-name">Store Name</Label>
            <Input
              id="store-name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="store-email">Email</Label>
            <Input
              id="store-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="store-address">Address</Label>
            <Textarea
              id="store-address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              required
            />
            {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner">Store Owner</Label>
            <select
              id="owner"
              value={formData.ownerId}
              onChange={(e) => handleInputChange("ownerId", e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              required
            >
              <option value="">Select a store owner</option>
              {storeOwners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </select>
            {errors.ownerId && <p className="text-sm text-destructive">{errors.ownerId}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Store</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
