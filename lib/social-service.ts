/*
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"
*/

export interface SocialHabit {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  habitName: string
  location: {
    name: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  timestamp: Date
  points: number
  category: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  totalPoints: number
  friends: string[]
  following: string[]
  followers: string[]
  createdAt: Date
}

export interface LeaderboardEntry {
  userId: string
  userName: string
  userAvatar?: string
  totalPoints: number
  weeklyPoints: number
  rank: number
}

// User Profile Management
export const createUserProfile = async (userId: string, userData: Partial<UserProfile>) => {
  console.log("Mock: Creating user profile", userId, userData)
  return Promise.resolve()
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  return Promise.resolve({
    id: userId,
    name: "Utilizador Teste",
    email: "teste@exemplo.com",
    totalPoints: 1250,
    friends: ["user2", "user3"],
    following: ["user2", "user3", "user4"],
    followers: ["user1", "user5"],
    createdAt: new Date(),
  })
}

// Social Habits
export const shareSocialHabit = async (habitData: Omit<SocialHabit, "id" | "timestamp">) => {
  console.log("Mock: Sharing social habit", habitData)
  return Promise.resolve("mock-habit-id")
}

// Friends System
export const followUser = async (currentUserId: string, targetUserId: string) => {
  console.log("Mock: Following user", currentUserId, "->", targetUserId)
  return Promise.resolve()
}

export const unfollowUser = async (currentUserId: string, targetUserId: string) => {
  console.log("Mock: Unfollowing user", currentUserId, "->", targetUserId)
  return Promise.resolve()
}

// Leaderboard
export const getLeaderboard = async (timeframe: "weekly" | "monthly" | "all" = "all"): Promise<LeaderboardEntry[]> => {
  return Promise.resolve([
    { userId: "user1", userName: "Maria Silva", totalPoints: 2450, weeklyPoints: 350, rank: 1 },
    { userId: "user2", userName: "Pedro Santos", totalPoints: 2100, weeklyPoints: 280, rank: 2 },
    { userId: "user3", userName: "Ana Costa", totalPoints: 1890, weeklyPoints: 420, rank: 3 },
    { userId: "user4", userName: "João Ferreira", totalPoints: 1650, weeklyPoints: 190, rank: 4 },
    { userId: "user5", userName: "Sofia Oliveira", totalPoints: 1420, weeklyPoints: 310, rank: 5 },
  ])
}

// Get Friends' Habits
export const getFriendsHabits = async (userId: string): Promise<SocialHabit[]> => {
  return Promise.resolve([
    {
      id: "habit1",
      userId: "user2",
      userName: "Maria Silva",
      habitName: "Ginásio",
      location: { name: "Fitness Hut Colombo", coordinates: { lat: 38.7569, lng: -9.2076 } },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      points: 50,
      category: "fitness",
    },
    {
      id: "habit2",
      userId: "user3",
      userName: "Pedro Santos",
      habitName: "Corrida",
      location: { name: "Parque Eduardo VII", coordinates: { lat: 38.7267, lng: -9.1545 } },
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      points: 30,
      category: "fitness",
    },
    {
      id: "habit3",
      userId: "user4",
      userName: "Ana Costa",
      habitName: "Leitura",
      location: { name: "Biblioteca Nacional", coordinates: { lat: 38.7223, lng: -9.1414 } },
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      points: 25,
      category: "education",
    },
  ])
}

// Search Users
export const searchUsers = async (searchTerm: string): Promise<UserProfile[]> => {
  const mockUsers = [
    {
      id: "user1",
      name: "Maria Silva",
      email: "maria@exemplo.com",
      totalPoints: 2450,
      friends: [],
      following: [],
      followers: [],
      createdAt: new Date(),
    },
    {
      id: "user2",
      name: "Pedro Santos",
      email: "pedro@exemplo.com",
      totalPoints: 2100,
      friends: [],
      following: [],
      followers: [],
      createdAt: new Date(),
    },
    {
      id: "user3",
      name: "Ana Costa",
      email: "ana@exemplo.com",
      totalPoints: 1890,
      friends: [],
      following: [],
      followers: [],
      createdAt: new Date(),
    },
    {
      id: "user4",
      name: "João Ferreira",
      email: "joao@exemplo.com",
      totalPoints: 1650,
      friends: [],
      following: [],
      followers: [],
      createdAt: new Date(),
    },
    {
      id: "user5",
      name: "Sofia Oliveira",
      email: "sofia@exemplo.com",
      totalPoints: 1420,
      friends: [],
      following: [],
      followers: [],
      createdAt: new Date(),
    },
  ]

  return Promise.resolve(
    mockUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  )
}
