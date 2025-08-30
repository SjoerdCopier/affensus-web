"use client"

import { Project } from '../../hooks/use-project-selection'

interface DashboardProps {
  locale?: string
  userId?: string | null
  userData?: {profile: object, projects: Project[]} | null
  selectedProject?: Project | null
}

export default function Dashboard({ }: DashboardProps) {
  return (
    <div className="pt-8 pl-8 pr-8 pb-12">
      <h1 className="text-2xl font-bold text-gray-900">Welcome</h1>
    </div>
  )
}