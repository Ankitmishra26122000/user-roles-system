"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { Search, Star } from "lucide-react"

export function StoresTable() {
  const { stores, users } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.address.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  const getOwnerName = (ownerId: string) => {
    const owner = users.find((user) => user.id === ownerId)
    return owner ? owner.name : "Unknown Owner"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stores Management</CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredStores.map((store) => (
            <div key={store.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold">{store.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{store.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Email: {store.email}</p>
                <p>Address: {store.address}</p>
                <p>Owner: {getOwnerName(store.ownerId)}</p>
              </div>
            </div>
          ))}
          {filteredStores.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No stores found matching your criteria.</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
