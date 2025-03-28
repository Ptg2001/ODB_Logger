"use client";

import React, { useState, useEffect } from "react";
import { X, Database, RefreshCw, Trash2, ChevronUp, ChevronDown, Clock, Info, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define the type of db log entry
type DbLogEntry = {
  timestamp: Date;
  operation: string;
  success: boolean;
  duration: number;
  message?: string;
};

// Only show in development mode
const isDev = process.env.NODE_ENV === 'development';

export function DebugPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [logs, setLogs] = useState<DbLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [error, setError] = useState<string | null>(null);

  // Only run in development mode
  useEffect(() => {
    if (!isDev) return;
    
    // Check if debug mode is enabled in localStorage
    const debugEnabled = localStorage.getItem('obd_debug_enabled') === 'true';
    setIsVisible(debugEnabled);
  }, []);

  // Fetch logs from API endpoint
  const fetchLogs = async () => {
    if (!isVisible || isMinimized) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/debug/logs');
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }
      
      const data = await response.json();
      
      // Convert string timestamps back to Date objects
      const processedLogs = data.logs.map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }));
      
      setLogs(processedLogs);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Failed to load logs. Server-side component may be unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear logs via API endpoint
  const clearLogs = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/debug/logs', {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear logs');
      }
      
      setLogs([]);
    } catch (err) {
      console.error('Error clearing logs:', err);
      setError('Failed to clear logs');
    } finally {
      setIsLoading(false);
    }
  };

  // Set up polling for logs when visible
  useEffect(() => {
    if (!isDev || !isVisible || isMinimized) return;
    
    // Fetch logs immediately
    fetchLogs();
    
    // Then set up polling
    const interval = setInterval(fetchLogs, 2000);
    
    return () => clearInterval(interval);
  }, [isVisible, isMinimized]);

  // Toggle debug panel visibility
  const toggleVisibility = () => {
    const newState = !isVisible;
    setIsVisible(newState);
    localStorage.setItem('obd_debug_enabled', newState ? 'true' : 'false');
  };

  // Don't render anything in production
  if (!isDev) return null;

  // Filter logs based on active tab
  const filteredLogs = activeTab === "all" 
    ? logs 
    : activeTab === "errors"
      ? logs.filter(log => !log.success)
      : logs.filter(log => log.operation === activeTab);

  return (
    <>
      {/* Debug toggle button */}
      <Button
        size="sm"
        variant="outline"
        className="fixed bottom-4 right-4 z-50 bg-background/80 backdrop-blur-sm"
        onClick={toggleVisibility}
      >
        <Database className="h-4 w-4 mr-2" />
        {isVisible ? "Hide Debug" : "Debug Mode"}
      </Button>

      {/* Debug panel */}
      {isVisible && (
        <Card className={`fixed z-50 shadow-xl border-primary/20 transition-all duration-200 overflow-hidden ${
          isMinimized 
            ? "bottom-4 left-4 w-48 h-10" 
            : "bottom-4 left-4 w-96 sm:w-[450px] md:w-[550px] h-[450px]"
        }`}>
          <CardHeader className="p-2 flex flex-row items-center justify-between bg-muted/50">
            <div className="flex items-center">
              <Database className="h-4 w-4 mr-2 text-primary" />
              <CardTitle className="text-sm font-medium">Database Debug</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={clearLogs}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={fetchLogs}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => setIsVisible(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {!isMinimized && (
            <>
              <div className="p-2 border-t border-border/20">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="QUERY">Queries</TabsTrigger>
                    <TabsTrigger value="TRANSACTION">Transactions</TabsTrigger>
                    <TabsTrigger value="errors">Errors</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <CardContent className="p-0 overflow-auto h-[340px]">
                {isLoading && logs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Database className="h-8 w-8 mb-2 opacity-30 animate-pulse" />
                    <p className="text-sm">Loading logs...</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-full text-destructive/70">
                    <AlertCircle className="h-8 w-8 mb-2" />
                    <p className="text-sm">{error}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4" 
                      onClick={fetchLogs}
                    >
                      Retry
                    </Button>
                  </div>
                ) : filteredLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Database className="h-8 w-8 mb-2 opacity-30" />
                    <p className="text-sm">No database operations recorded yet</p>
                    <p className="text-xs mt-1">Interact with the app to see queries</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/10">
                    {filteredLogs.map((log, index) => (
                      <div key={index} className={`p-2 text-xs hover:bg-muted/30 ${!log.success ? 'bg-destructive/5' : ''}`}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1">
                            {log.success ? (
                              <Info className="h-3 w-3 text-primary" />
                            ) : (
                              <AlertCircle className="h-3 w-3 text-destructive" />
                            )}
                            <span className="font-medium">{log.operation}</span>
                            <Badge variant={log.success ? "outline" : "destructive"} className="text-[9px] px-1 py-0 h-4">
                              {log.success ? "Success" : "Error"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{log.duration.toFixed(2)}ms</span>
                            </div>
                            <span className="text-[9px] text-muted-foreground">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        {log.message && (
                          <div className="ml-4 mt-1 text-muted-foreground break-all">
                            {log.message}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="p-2 border-t border-border/20 flex justify-between items-center">
                <div className="text-xs text-muted-foreground">
                  {filteredLogs.length} operation{filteredLogs.length !== 1 ? 's' : ''} logged
                </div>
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-xs"
                    onClick={fetchLogs}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Refresh'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-xs"
                    onClick={clearLogs}
                    disabled={isLoading}
                  >
                    Clear Logs
                  </Button>
                </div>
              </CardFooter>
            </>
          )}
        </Card>
      )}
    </>
  );
} 