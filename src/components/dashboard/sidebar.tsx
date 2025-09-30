"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard,
  TableOfContents,
  Unlink,
  TicketPercent,
  Bot,
  Folder,
  ChevronDown,
  Wifi
} from "lucide-react"
import { Project } from '../../hooks/use-project-selection'

interface DashboardSidebarProps {
  userData?: {profile: object, projects: Project[]} | null
  selectedProject?: Project | null
  onProjectSelect?: (project: Project) => void
}

export default function DashboardSidebar({ 
  userData, 
  selectedProject, 
  onProjectSelect 
}: DashboardSidebarProps) {
  const pathname = usePathname()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname.startsWith('/dashboard') && pathname.split('/').length === 2
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className="bg-white text-black w-48 pl-4 pt-3 pr-4 flex-shrink-0 border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="mb-6 flex justify-center">
        <svg width="140" height="34" viewBox="0 0 993 240" xmlns="http://www.w3.org/2000/svg">
          <path fill="#034737" d="m0.8 180l55.9-141.2h31.8l55.7 141.2h-34.1l-10.3-28.4h-54.4l-10.3 28.4zm71.7-102.7l-16.4 46.3h33l-16.3-46.3zm83.8 102.7v-141.2h81.6v28h-49.7v28.5h46v27.9h-46v56.8zm102.8 0v-141.2h81.6v28h-49.6v28.5h45.9v27.9h-45.9v56.8zm101.8 0v-141.2h90.2v28h-58.3v28.8h57.8v27.2h-57.8v29.2h58.3v28zm201.1 0l-57.1-111.9 2.4 0.4v111.5h-32v-141.2h43.7l57.2 111.2-2.3 0.5v-111.7h31.9v141.2zm119.6-143.8q13.1 0 23 2.9 9.8 2.9 15.8 6.1 6 3.2 7.3 4.3l-15.4 25.7q-1.7-1.2-5.9-3.7-4.1-2.5-9.7-4.4-5.6-1.9-11.7-1.9-8.2 0-13.4 3-5 2.9-5 8.7 0 3.9 2.7 7.1 2.7 3.1 8.3 6 5.7 2.8 14.3 6.1 8 2.9 14.9 6.9 7 3.9 12.2 9.4 5.4 5.3 8.5 12.4 3.1 7 3.1 16 0 10.7-4.4 18.7-4.4 7.8-12 12.9-7.5 5.1-17.1 7.7-9.5 2.5-19.8 2.5-14.6 0-26.1-3.3-11.5-3.4-18.5-7.2-7.1-3.9-8.5-5.2l16-26.8q1.2 1 4.9 3.1 3.7 2.1 9.1 4.5 5.3 2.2 11.3 3.8 6.1 1.6 12 1.6 9.8 0 14.8-3.7 4.9-3.9 4.9-10.1 0-4.6-3.1-8.2-3.1-3.6-9.3-6.8-6.2-3.4-15.5-7-9.3-3.7-17.5-9.1-8-5.3-13-13.4-5.1-8-5.1-19.9 0-11.9 6.7-20.5 6.7-8.8 17.6-13.5 11-4.7 23.6-4.7zm149.9 87.6v-85h32v86.7q0 17.5-6.9 30.3-6.8 12.8-19.6 19.8-12.7 7-30.3 7-17.8 0-30.7-7-12.8-7-19.6-19.8-6.8-12.8-6.8-30.3v-86.7h31.9v85q0 9.7 3 16.3 3.1 6.6 8.8 10 5.6 3.4 13.4 3.4 7.5 0 13.1-3.4 5.6-3.4 8.6-10 3.1-6.6 3.1-16.3zm106-87.6q13.2 0 23 2.9 9.9 2.9 15.9 6.1 5.9 3.2 7.2 4.3l-15.4 25.7q-1.7-1.2-5.9-3.7-4-2.5-9.7-4.4-5.6-1.9-11.7-1.9-8.2 0-13.3 3-5.1 2.9-5.1 8.7 0 3.9 2.7 7.1 2.8 3.1 8.4 6 5.6 2.8 14.3 6.1 7.9 2.9 14.9 6.9 6.9 3.9 12.2 9.4 5.3 5.3 8.4 12.4 3.1 7 3.1 16 0 10.7-4.4 18.7-4.4 7.8-12 12.9-7.4 5.1-17.1 7.7-9.5 2.5-19.8 2.5-14.5 0-26.1-3.3-11.4-3.4-18.5-7.2-7-3.9-8.4-5.2l15.9-26.8q1.3 1 4.9 3.1 3.8 2.1 9.1 4.5 5.4 2.2 11.4 3.8 6.1 1.6 11.9 1.6 9.9 0 14.8-3.7 4.9-3.9 4.9-10.1 0-4.6-3.1-8.2-3.1-3.6-9.3-6.8-6.2-3.4-15.5-7-9.3-3.7-17.4-9.1-8.1-5.3-13.1-13.4-5-8-5-19.9 0-11.9 6.6-20.5 6.8-8.8 17.7-13.5 11-4.7 23.5-4.7z"></path>
        </svg>
      </div>

      {/* Navigation */}
      <nav className="mt-4">
        {/* Workplace Section */}
        <div className="mb-3">
          <h3 className="text-xs font-bold uppercase text-gray-500 mb-2">Workplace</h3>
          <ul className="space-y-1">
            <li className="mb-2">
              <div className="mb-2 pt-1 pb-1 relative">
                <button 
                  type="button" 
                  className="flex h-7 items-center justify-between whitespace-nowrap rounded-md border px-2 py-1 text-xs shadow-sm w-full bg-white border-gray-200 hover:bg-gray-50"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="flex items-center">
                    <Folder className="w-3 h-3 mr-1 text-gray-400" />
                    <span className="text-xs">
                      {selectedProject ? selectedProject.name : 'Select Project'}
                    </span>
                  </div>
                  <ChevronDown className={`h-3 w-3 opacity-50 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                {isDropdownOpen && userData?.projects && userData.projects.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {userData.projects.map((project) => (
                      <button
                        key={project.id}
                        type="button"
                        className={`w-full px-2 py-2 text-xs text-left hover:bg-gray-50 flex items-center ${
                          selectedProject?.id === project.id ? 'bg-blue-50 text-blue-700' : ''
                        }`}
                        onClick={() => {
                          onProjectSelect?.(project)
                          setIsDropdownOpen(false)
                        }}
                      >
                        <Folder className="w-3 h-3 mr-1 text-gray-400" />
                        <span className="truncate">{project.name}</span>
                        <span className="ml-auto text-xs text-gray-500 uppercase">
                          {project.country}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </li>
          </ul>
        </div>

        <hr className="my-2 border-t border-gray-200 pb-2" />

        {/* Main Menu */}
        <div className="mb-2 pb-2">
          <h3 className="text-xs font-bold uppercase text-gray-500 mb-2">Main Menu</h3>
          <ul>
            <li className={`rounded-lg border mb-1 ${
              isActive('/dashboard') && pathname === '/dashboard'
                ? 'bg-white border-gray-200 border-b-2' 
                : 'border-transparent hover:border-gray-200'
            }`}>
              <Link href="/dashboard" className="flex items-center py-1 px-2">
                <LayoutDashboard className={`w-3 h-3 mr-2 ${
                  isActive('/dashboard') && pathname === '/dashboard' ? 'text-green-600' : ''
                }`} />
                <span className="text-xs">Dashboard</span>
              </Link>
            </li>
            <li className={`rounded-lg border mb-1 ${
              isActive('/dashboard/networks')
                ? 'bg-white border-gray-200 border-b-2' 
                : 'border-transparent hover:border-gray-200'
            }`}>
              <Link href="/dashboard/networks" className="flex items-center py-1 px-2">
                <TableOfContents className={`w-3 h-3 mr-2 ${
                  isActive('/dashboard/networks') ? 'text-green-600' : ''
                }`} />
                <span className="text-xs">Campaigns</span>
              </Link>
            </li>
            
            <li className={`rounded-lg border mb-1 ${
              isActive('/dashboard/link-rot')
                ? 'bg-white border-gray-200 border-b-2' 
                : 'border-transparent hover:border-gray-200'
            }`}>
              <Link href="/dashboard/link-rot" className="flex items-center py-1 px-2">
                <Unlink className={`w-3 h-3 mr-2 ${
                  isActive('/dashboard/link-rot') ? 'text-green-600' : ''
                }`} />
                <span className="text-xs">Link rot</span>
              </Link>
            </li>
            <li className={`rounded-lg border mb-1 ${
              isActive('/dashboard/coupons')
                ? 'bg-white border-gray-200 border-b-2' 
                : 'border-transparent hover:border-gray-200'
            }`}>
              <Link href="/dashboard/coupons" className="flex items-center py-1 px-2">
                <TicketPercent className={`w-3 h-3 mr-2 ${
                  isActive('/dashboard/coupons') ? 'text-green-600' : ''
                }`} />
                <span className="text-xs">Coupons</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Scraping Section */}
        <div className="mb-1 mt-4">
          <h3 className="text-xs font-bold uppercase text-gray-500 mb-2">Tools</h3>
          <ul>
          <li className={`rounded-lg border mb-1 ${
              isActive('/dashboard/network-uptime')
                ? 'bg-white border-gray-200 border-b-2' 
                : 'border-transparent hover:border-gray-200'
            }`}>
              <Link href="/dashboard/network-uptime" className="flex items-center py-1 px-2">
                <Wifi className={`w-3 h-3 mr-2 ${
                  isActive('/dashboard/network-uptime') ? 'text-green-600' : ''
                }`} />
                <span className="text-xs">Network Downtime</span>
              </Link>
            </li>
            <li className={`rounded-lg border mb-1 ${
              isActive('/dashboard/logos')
                ? 'bg-white border-gray-200 border-b-2' 
                : 'border-transparent hover:border-gray-200'
            }`}>
              <Link href="/dashboard/logos" className="flex items-center py-1 px-2">
                <Bot className={`w-3 h-3 mr-2 ${
                  isActive('/dashboard/logos') ? 'text-green-600' : ''
                }`} />
                <span className="text-xs">Logos</span>
              </Link>
            </li>
            <li className={`rounded-lg border mb-1 ${
              isActive('/dashboard/link-validator')
                ? 'bg-white border-gray-200 border-b-2' 
                : 'border-transparent hover:border-gray-200'
            }`}>
              <Link href="/dashboard/link-validator" className="flex items-center py-1 px-2">
                <Bot className={`w-3 h-3 mr-2 ${
                  isActive('/dashboard/link-validator') ? 'text-green-600' : ''
                }`} />
                <span className="text-xs">Link validation</span>
              </Link>
            </li>
   
                  
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div className="mt-auto pb-2 text-xs text-gray-400">
        Affensus Limited <br /> v0.1.0
      </div>
    </aside>
  )
}
