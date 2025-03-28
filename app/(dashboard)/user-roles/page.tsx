"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { RoleGuard } from "@/components/role-guard"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function UserRolesPage() {
  const { user } = useAuth()
  const [addingUsers, setAddingUsers] = useState(false)
  const [userStatus, setUserStatus] = useState<any>(null)

  // Function to add the tester and viewer users
  const addUsers = async () => {
    setAddingUsers(true)
    try {
      const response = await fetch('/api/auth/add-users')
      const data = await response.json()
      setUserStatus(data)
      
      toast({
        title: data.success ? "Success" : "Error",
        description: data.message,
        variant: data.success ? "default" : "destructive"
      })
    } catch (error) {
      console.error("Error adding users:", error)
      toast({
        title: "Error",
        description: "Failed to add users. See console for details.",
        variant: "destructive"
      })
    } finally {
      setAddingUsers(false)
    }
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>User Roles</CardTitle>
          <CardDescription>
            Testing and managing user roles for the OBD Logger application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-2">Current User</h3>
              <p>Name: {user?.name}</p>
              <p>Email: {user?.email}</p>
              <p>Role: <span className="font-semibold">{user?.role}</span></p>
            </div>
            
            <h3 className="font-medium mt-6">Role Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-green-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Admin</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Full access to all features</li>
                    <li>User management</li>
                    <li>Settings configuration</li>
                    <li>All data operations</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Tester</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Record data from OBD devices</li>
                    <li>Import/export files</li>
                    <li>Clear fault codes</li>
                    <li>View all data</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="bg-yellow-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Viewer</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>View all data and reports</li>
                    <li>No edit capabilities</li>
                    <li>Read-only access</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-8 space-y-4">
              <h3 className="font-medium">Testing Access Control</h3>
              <div className="flex flex-wrap gap-4">
                <RoleGuard allowedRoles={["admin"]}>
                  <Button variant="destructive">
                    Admin-Only Action
                  </Button>
                </RoleGuard>
                
                <RoleGuard allowedRoles={["admin", "tester"]}>
                  <Button variant="default">
                    Admin or Tester Action
                  </Button>
                </RoleGuard>
                
                <RoleGuard allowedRoles={["admin", "tester", "viewer"]}>
                  <Button variant="outline">
                    All Users Action
                  </Button>
                </RoleGuard>
              </div>
            </div>
            
            <RoleGuard allowedRoles={["admin"]}>
              <div className="border-t pt-4 mt-8">
                <h3 className="font-medium mb-4">Administrator Actions</h3>
                <Button 
                  onClick={addUsers} 
                  disabled={addingUsers}
                >
                  {addingUsers && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Tester & Viewer Users
                </Button>
                
                {userStatus && (
                  <div className="mt-4 text-sm">
                    <p>Tester user: {userStatus.tester.exists ? "Exists" : userStatus.tester.added ? "Created" : "Not created"}</p>
                    <p>Viewer user: {userStatus.viewer.exists ? "Exists" : userStatus.viewer.added ? "Created" : "Not created"}</p>
                  </div>
                )}
              </div>
            </RoleGuard>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 