"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { redirect } from "next/navigation"
import { DatabaseIcon, DownloadIcon, UploadIcon, RefreshCwIcon, AlertTriangleIcon } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function DatabasePage() {
  const { user } = useAuth()

  // Redirect if not admin
  if (user?.role !== "admin") {
    redirect("/dashboard")
  }

  const [sqlQuery, setSqlQuery] = useState("")
  const [backupName, setBackupName] = useState("")
  const [selectedBackup, setSelectedBackup] = useState("")

  const handleRunQuery = () => {
    if (!sqlQuery.trim()) {
      toast({
        variant: "destructive",
        title: "Query is empty",
        description: "Please enter a SQL query to run.",
      })
      return
    }

    toast({
      title: "Query executed",
      description: "Your SQL query has been executed successfully.",
    })
  }

  const handleCreateBackup = () => {
    if (!backupName.trim()) {
      toast({
        variant: "destructive",
        title: "Backup name is empty",
        description: "Please enter a name for the backup.",
      })
      return
    }

    toast({
      title: "Backup created",
      description: `Database backup "${backupName}" has been created successfully.`,
    })
  }

  const handleRestoreBackup = () => {
    if (!selectedBackup) {
      toast({
        variant: "destructive",
        title: "No backup selected",
        description: "Please select a backup to restore.",
      })
      return
    }

    toast({
      title: "Backup restored",
      description: `Database has been restored from backup "${selectedBackup}".`,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Database Management</h2>
        <p className="text-muted-foreground">Manage database operations and backups</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Size</CardTitle>
            <DatabaseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.45 GB</div>
            <p className="text-xs text-muted-foreground">Last optimized: 3 days ago</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <DatabaseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,245,678</div>
            <p className="text-xs text-muted-foreground">Across all tables</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Health</CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Good</div>
            <Progress value={85} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">85% optimal performance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
            <DownloadIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 hours ago</div>
            <p className="text-xs text-muted-foreground">Next scheduled: 12 hours</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="query" className="space-y-4">
        <TabsList>
          <TabsTrigger value="query">SQL Query</TabsTrigger>
          <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
          <TabsTrigger value="optimize">Optimize</TabsTrigger>
        </TabsList>

        <TabsContent value="query" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Run SQL Query</CardTitle>
              <CardDescription>Execute SQL queries directly on the database</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sql-query">SQL Query</Label>
                <Textarea
                  id="sql-query"
                  placeholder="SELECT * FROM tests WHERE project_id = 1 LIMIT 10;"
                  className="font-mono h-40"
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleRunQuery}>Run Query</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Create Backup</CardTitle>
                <CardDescription>Create a new database backup</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="backup-name">Backup Name</Label>
                  <Input
                    id="backup-name"
                    placeholder="e.g., full_backup_2023_12_15"
                    value={backupName}
                    onChange={(e) => setBackupName(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleCreateBackup}>
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Create Backup
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Restore Backup</CardTitle>
                <CardDescription>Restore database from a backup</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="select-backup">Select Backup</Label>
                  <Select value={selectedBackup} onValueChange={setSelectedBackup}>
                    <SelectTrigger id="select-backup">
                      <SelectValue placeholder="Select a backup" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_backup_2023_12_14">full_backup_2023_12_14</SelectItem>
                      <SelectItem value="full_backup_2023_12_13">full_backup_2023_12_13</SelectItem>
                      <SelectItem value="full_backup_2023_12_12">full_backup_2023_12_12</SelectItem>
                      <SelectItem value="full_backup_2023_12_11">full_backup_2023_12_11</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={handleRestoreBackup}>
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Restore Backup
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimize" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Optimization</CardTitle>
              <CardDescription>Optimize database performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Optimization Options</Label>
                <div className="grid gap-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="optimize-tables" className="rounded border-gray-300" defaultChecked />
                    <Label htmlFor="optimize-tables">Optimize Tables</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="repair-tables" className="rounded border-gray-300" defaultChecked />
                    <Label htmlFor="repair-tables">Repair Tables</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="analyze-tables" className="rounded border-gray-300" defaultChecked />
                    <Label htmlFor="analyze-tables">Analyze Tables</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="clear-cache" className="rounded border-gray-300" />
                    <Label htmlFor="clear-cache">Clear Cache</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <RefreshCwIcon className="mr-2 h-4 w-4" />
                Run Optimization
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

