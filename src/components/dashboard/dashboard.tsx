"use client"

interface DashboardProps {
  locale?: string
  userId?: string | null
  userData?: {profile: object, projects: {id: string, name: string, country: string}[]} | null
  selectedProject?: {id: string, name: string, country: string} | null
}

export default function Dashboard({ userId }: DashboardProps) {
  return (
    <div className="pt-8 pl-8 pr-8 pb-12">
      <h1 className="text-2xl font-bold text-gray-900">Welcome</h1>
    </div>
  )
}