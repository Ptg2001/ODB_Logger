"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontalIcon, EditIcon, TrashIcon, KeyIcon, ShieldIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

type Project = {
  id: number;
  name: string;
}

type User = {
  id: number | string;
  username: string;
  email: string;
  role: string;
  status: string;
  projects: Project[];
  last_login: string;
  created_at: string;
}

type UsersListProps = {
  searchTerm?: string;
  users: User[];
  onUserDeleted?: () => void;
}

export function UsersList({ searchTerm = "", users, onUserDeleted }: UsersListProps) {
  const [confirmDelete, setConfirmDelete] = useState<number | string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [newRole, setNewRole] = useState("")
  const [loading, setLoading] = useState(false)
  const [availableProjects, setAvailableProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [editFormData, setEditFormData] = useState({
    username: "",
    email: "",
    role: "",
    status: "",
    projects: [] as number[]
  })

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true)
      const response = await fetch('/api/projects')
      
      if (response.ok) {
        const data = await response.json()
        setAvailableProjects(data.projects || [])
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingProjects(false)
    }
  }

  const handleEditUser = (user: User) => {
    fetchProjects()
    
    setSelectedUser(user)
    setEditFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      projects: user.projects?.map(p => typeof p === 'object' ? p.id : +p) || []
    })
    setEditDialogOpen(true)
  }

  const handleDeleteUser = async (id: number | string) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete user')
      }
      
      toast({
        title: "User deleted",
        description: `User has been deleted successfully.`,
      })
      
      // Call the callback to refresh the users list if provided
      if (onUserDeleted) {
        onUserDeleted()
      } else {
        // If no callback is provided, we could refresh the page
        window.location.reload()
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive"
      })
    } finally {
      setConfirmDelete(null)
    }
  }

  const handleResetPassword = (user: User) => {
    setSelectedUser(user)
    setNewPassword("")
    setPasswordDialogOpen(true)
  }

  const handleChangeRole = (user: User) => {
    setSelectedUser(user)
    setNewRole(user.role)
    setRoleDialogOpen(true)
  }

  const submitPasswordReset = async () => {
    if (!selectedUser || !newPassword) return
    
    setLoading(true)
    try {
      // This is a simplified approach - you'd typically have a proper password reset API
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: newPassword })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update password')
      }
      
      toast({
        title: "Password updated",
        description: `Password has been reset for ${selectedUser.username}.`
      })
      
      setPasswordDialogOpen(false)
    } catch (error) {
      console.error('Error updating password:', error)
    toast({
        title: "Error",
        description: "Failed to reset password. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const submitRoleChange = async () => {
    if (!selectedUser || !newRole) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update role')
      }
      
    toast({
        title: "Role updated",
        description: `Role has been changed to ${newRole} for ${selectedUser.username}.`
      })
      
      // Update the user in the list
      if (onUserDeleted) {
        onUserDeleted()
      } else {
        window.location.reload()
      }
      
      setRoleDialogOpen(false)
    } catch (error) {
      console.error('Error updating role:', error)
    toast({
        title: "Error",
        description: "Failed to change role. Please try again.",
        variant: "destructive"
    })
    } finally {
      setLoading(false)
    }
  }

  const submitUserEdit = async () => {
    if (!selectedUser) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update user')
      }
      
      toast({
        title: "User updated",
        description: `User ${editFormData.username} has been updated successfully.`
      })
      
      // Update the user in the list
      if (onUserDeleted) {
        onUserDeleted()
      } else {
        window.location.reload()
      }
      
      setEditDialogOpen(false)
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <>
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Projects</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
                  <TableCell className="font-medium">{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.role === "admin" ? "default" : user.role === "tester" ? "secondary" : "outline"}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.status === "Active" ? "success" : "secondary"}>{user.status}</Badge>
              </TableCell>
                  <TableCell>
                    {user.projects && user.projects.length > 0 ? (
                      <div className="relative group">
                        <span className="cursor-help underline decoration-dotted">
                          {user.projects.length} project{user.projects.length !== 1 ? 's' : ''}
                        </span>
                        <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-popover rounded-md shadow-md text-sm z-50 invisible group-hover:visible">
                          <div className="font-semibold mb-2">Associated Projects:</div>
                          <ul className="list-disc pl-4 space-y-1">
                            {user.projects.map((project: any, index: number) => (
                              <li key={index} className="text-xs">
                                {typeof project === 'object' && project.name ? project.name : 
                                 typeof project === 'string' ? project : `Project ${index + 1}`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No projects</span>
                    )}
                  </TableCell>
                  <TableCell>{user.last_login || 'Never'}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontalIcon className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                      <EditIcon className="mr-2 h-4 w-4" />
                      Edit User
                    </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                      <KeyIcon className="mr-2 h-4 w-4" />
                      Reset Password
                    </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeRole(user)}>
                      <ShieldIcon className="mr-2 h-4 w-4" />
                      Change Role
                    </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setConfirmDelete(user.id)}>
                      <TrashIcon className="mr-2 h-4 w-4" />
                      Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
              ))
            )}
        </TableBody>
      </Table>
    </div>

      <AlertDialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account 
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeleteUser(confirmDelete!)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter a new password for user {selectedUser?.username}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Input
                id="new-password"
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="col-span-4"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={submitPasswordReset} 
              disabled={loading || !newPassword}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for user {selectedUser?.username}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="col-span-4">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="tester">Tester</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={submitRoleChange} 
              disabled={loading || !newRole}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and project associations for {selectedUser?.username}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid w-full items-center gap-2">
              <label htmlFor="edit-username" className="text-sm font-medium leading-none">
                Username
              </label>
              <Input
                id="edit-username"
                value={editFormData.username}
                onChange={(e) => setEditFormData({...editFormData, username: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid w-full items-center gap-2">
              <label htmlFor="edit-email" className="text-sm font-medium leading-none">
                Email
              </label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid w-full items-center gap-2">
                <label htmlFor="edit-role" className="text-sm font-medium leading-none">
                  Role
                </label>
                <Select
                  value={editFormData.role}
                  onValueChange={(value) => setEditFormData({...editFormData, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="tester">Tester</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid w-full items-center gap-2">
                <label htmlFor="edit-status" className="text-sm font-medium leading-none">
                  Status
                </label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value) => setEditFormData({...editFormData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid w-full items-center gap-2">
              <label className="text-sm font-medium leading-none">Projects</label>
              <div className="border rounded-md p-4 space-y-2 h-[120px] overflow-y-auto">
                {loadingProjects ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : availableProjects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No projects available</p>
                ) : (
                  availableProjects.map((project) => (
                    <div key={project.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-project-${project.id}`}
                        checked={editFormData.projects.includes(project.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEditFormData({
                              ...editFormData, 
                              projects: [...editFormData.projects, project.id]
                            });
                          } else {
                            setEditFormData({
                              ...editFormData, 
                              projects: editFormData.projects.filter(id => id !== project.id)
                            });
                          }
                        }}
                      />
                      <label
                        htmlFor={`edit-project-${project.id}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {project.name}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={submitUserEdit} 
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

