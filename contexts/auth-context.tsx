"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type UserRole = "admin" | "user" | "store_owner"

export interface User {
  id: string
  name: string
  email: string
  address: string
  role: UserRole
  rating?: number // For store owners
}

export interface Store {
  id: string
  name: string
  email: string
  address: string
  rating: number
  ownerId: string
}

export interface Rating {
  id: string
  userId: string
  storeId: string
  rating: number
  createdAt: string
}

interface AuthContextType {
  user: User | null
  users: User[]
  stores: Store[]
  ratings: Rating[]
  login: (email: string, password: string, role: UserRole) => Promise<boolean>
  logout: () => void
  signup: (userData: Omit<User, "id" | "role"> & { password: string }) => Promise<boolean>
  addUser: (userData: Omit<User, "id"> & { password: string }) => void
  addStore: (storeData: Omit<Store, "id" | "rating">) => void
  updatePassword: (newPassword: string) => Promise<boolean>
  submitRating: (storeId: string, rating: number) => void
  updateRating: (ratingId: string, newRating: number) => void
  getUserRatingForStore: (storeId: string) => Rating | undefined
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock data
const mockUsers: User[] = [
  {
    id: "1",
    name: "System Administrator",
    email: "admin@system.com",
    address: "123 Admin Street, Admin City",
    role: "admin",
  },
  {
    id: "2",
    name: "John Doe Normal User",
    email: "john@user.com",
    address: "456 User Avenue, User Town",
    role: "user",
  },
  {
    id: "3",
    name: "Store Owner Mike Johnson",
    email: "mike@store.com",
    address: "789 Store Boulevard, Store City",
    role: "store_owner",
    rating: 4.2,
  },
]

const mockStores: Store[] = [
  {
    id: "1",
    name: "Mike's Electronics Store",
    email: "mike@store.com",
    address: "789 Store Boulevard, Store City",
    rating: 4.2,
    ownerId: "3",
  },
  {
    id: "2",
    name: "Tech Paradise",
    email: "info@techparadise.com",
    address: "321 Tech Street, Digital City",
    rating: 3.8,
    ownerId: "4",
  },
]

const mockRatings: Rating[] = [
  {
    id: "1",
    userId: "2",
    storeId: "1",
    rating: 4,
    createdAt: "2024-01-15",
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [stores, setStores] = useState<Store[]>(mockStores)
  const [ratings, setRatings] = useState<Rating[]>(mockRatings)

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    // Mock authentication - in real app, this would call an API
    const foundUser = users.find((u) => u.email === email && u.role === role)
    if (foundUser) {
      setUser(foundUser)
      localStorage.setItem("currentUser", JSON.stringify(foundUser))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("currentUser")
  }

  const signup = async (userData: Omit<User, "id" | "role"> & { password: string }): Promise<boolean> => {
    // Check if email already exists
    if (users.some((u) => u.email === userData.email)) {
      return false
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      address: userData.address,
      role: "user",
    }

    setUsers((prev) => [...prev, newUser])
    setUser(newUser)
    localStorage.setItem("currentUser", JSON.stringify(newUser))
    return true
  }

  const addUser = (userData: Omit<User, "id"> & { password: string }) => {
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      address: userData.address,
      role: userData.role,
    }
    setUsers((prev) => [...prev, newUser])
  }

  const addStore = (storeData: Omit<Store, "id" | "rating">) => {
    const newStore: Store = {
      id: Date.now().toString(),
      ...storeData,
      rating: 0,
    }
    setStores((prev) => [...prev, newStore])
  }

  const updatePassword = async (newPassword: string): Promise<boolean> => {
    // Mock password update
    return true
  }

  const submitRating = (storeId: string, rating: number) => {
    if (!user) return

    const existingRating = ratings.find((r) => r.userId === user.id && r.storeId === storeId)

    if (existingRating) {
      // Update existing rating
      setRatings((prev) => prev.map((r) => (r.id === existingRating.id ? { ...r, rating } : r)))
    } else {
      // Add new rating
      const newRating: Rating = {
        id: Date.now().toString(),
        userId: user.id,
        storeId,
        rating,
        createdAt: new Date().toISOString().split("T")[0],
      }
      setRatings((prev) => [...prev, newRating])
    }

    // Update store's average rating
    const storeRatings = ratings.filter((r) => r.storeId === storeId)
    const avgRating = storeRatings.reduce((sum, r) => sum + r.rating, rating) / (storeRatings.length + 1)

    setStores((prev) => prev.map((s) => (s.id === storeId ? { ...s, rating: Math.round(avgRating * 10) / 10 } : s)))
  }

  const updateRating = (ratingId: string, newRating: number) => {
    setRatings((prev) => prev.map((r) => (r.id === ratingId ? { ...r, rating: newRating } : r)))
  }

  const getUserRatingForStore = (storeId: string): Rating | undefined => {
    if (!user) return undefined
    return ratings.find((r) => r.userId === user.id && r.storeId === storeId)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        stores,
        ratings,
        login,
        logout,
        signup,
        addUser,
        addStore,
        updatePassword,
        submitRating,
        updateRating,
        getUserRatingForStore,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
