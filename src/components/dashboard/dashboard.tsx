"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Wrench, 
  BarChart3,
  Users,
  Zap,
  Trophy,
  Clock,
  Settings,
  TrendingUp,
  Activity
} from "lucide-react"
import { DashboardLayout } from '@/components/dashboard'



interface DashboardProps {
  locale?: string
  userId?: string | null
}

export default function Dashboard({}: DashboardProps) {
  const renderOverviewTab = () => {
    return (
      <div className="space-y-3">
        {/* Dashboard Overview */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Dashboard Overview
            </CardTitle>
            <CardDescription className="text-xs">
              Complete overview of your account and activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-1 mb-1">
                  <Users className="w-3 h-3 text-blue-600" />
                  <span className="font-semibold text-blue-900 text-xs">Active Users</span>
                </div>
                <div className="text-lg font-bold text-blue-600">1,234</div>
                <div className="text-xs text-blue-700">+12% from last month</div>
              </div>
              
              <div className="p-2 bg-green-50 rounded-lg">
                <div className="flex items-center gap-1 mb-1">
                  <Zap className="w-3 h-3 text-green-600" />
                  <span className="font-semibold text-green-900 text-xs">Tools Used</span>
                </div>
                <div className="text-lg font-bold text-green-600">5,678</div>
                <div className="text-xs text-green-700">This month</div>
              </div>
              
              <div className="p-2 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-1 mb-1">
                  <Trophy className="w-3 h-3 text-purple-600" />
                  <span className="font-semibold text-purple-900 text-xs">Success Rate</span>
                </div>
                <div className="text-lg font-bold text-purple-600">98.5%</div>
                <div className="text-xs text-purple-700">Overall performance</div>
              </div>
              
              <div className="p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3 text-gray-600" />
                  <span className="font-semibold text-gray-900 text-xs">Uptime</span>
                </div>
                <div className="text-lg font-bold text-gray-600">99.9%</div>
                <div className="text-xs text-gray-700">Last 30 days</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="w-4 h-4 text-blue-600" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-xs">
              Access your most used features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Button className="h-12 flex flex-col gap-1">
                <Wrench className="w-4 h-4" />
                <span className="text-xs">Open Tools</span>
              </Button>
              <Button variant="outline" className="h-12 flex flex-col gap-1">
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs">View Analytics</span>
              </Button>
              <Button variant="outline" className="h-12 flex flex-col gap-1">
                <Settings className="w-4 h-4" />
                <span className="text-xs">Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="w-4 h-4 text-blue-600" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-xs">
              Your latest actions and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <Zap className="w-3 h-3 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-xs">Tool Usage Updated</h4>
                  <p className="text-xs text-gray-600">Analytics dashboard refreshed with latest data</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <Users className="w-3 h-3 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-xs">New User Registered</h4>
                  <p className="text-xs text-gray-600">Welcome message sent automatically</p>
                  <p className="text-xs text-gray-500">5 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-3 h-3 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-xs">System Performance Report</h4>
                  <p className="text-xs text-gray-600">All systems running optimally</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }





  return (
    <DashboardLayout>
      <div className="pt-8 pl-8 pr-8 pb-12">
        <div className="space-y-3">
          {renderOverviewTab()}
        </div>
      </div>
    </DashboardLayout>
  )
}