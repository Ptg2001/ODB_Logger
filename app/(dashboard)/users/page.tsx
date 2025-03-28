"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserPlusIcon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { UsersList } from "@/components/users/users-list"
import { CreateUserDialog } from "@/components/users/create-user-dialog"
import { redirect } from "next/navigation"

export default function UsersPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])

  // Redirect if not admin
  if (user?.role !== "admin") {
    redirect("/dashboard")
  }

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching users...');
      const response = await fetch('/api/users');
      
      if (response.ok) {
        const data = await response.json();
        console.log('Users data received:', data);
        
        // Make sure data is an array
        const usersArray = Array.isArray(data) ? data : [];
        setUsers(usersArray);
        setIsLoading(false);
      } else {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle successful user creation
  const handleUserCreated = () => {
    setIsCreateDialogOpen(false);
    // Refresh user list
    fetchUsers();
    toast({
      title: "Success",
      description: "User has been created successfully."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <UserPlusIcon className="mr-2 h-4 w-4" /> Create User
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <UsersList users={users} />
          )}
        </CardContent>
      </Card>

      <CreateUserDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleUserCreated}
      />
    </div>
  )
}

