"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, Car, Gauge, Database } from "lucide-react";

type RouteChangeContextType = {
  isRouteChanging: boolean;
  pathname: string | null;
};

const RouteChangeContext = createContext<RouteChangeContextType>({
  isRouteChanging: false,
  pathname: null,
});

export const useRouteChangeStatus = () => useContext(RouteChangeContext);

export function RouteChangeProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isRouteChanging, setIsRouteChanging] = useState(false);
  const [changingTo, setChangingTo] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [lastPathChecked, setLastPathChecked] = useState<string | null>(null);

  // Memoize the route change start function
  const handleRouteChangeStart = useCallback((url: string) => {
    if (process.env.NODE_ENV === 'production') return; // Skip animation in production for performance
    
    // Only trigger if we're not already changing routes
    if (!isRouteChanging) {
      setIsRouteChanging(true);
      setChangingTo(url);
    }
  }, [isRouteChanging]);

  // Memoize the route change complete function
  const handleRouteChangeComplete = useCallback(() => {
    // Add a small delay before hiding the animation
    setTimeout(() => {
      setIsRouteChanging(false);
      setChangingTo(null);
    }, 300);
  }, []);

  useEffect(() => {
    // Only run client-side
    if (typeof window === 'undefined') return;
    
    setMounted(true);
    
    // Track route changes only if this is a different path than last checked
    if (pathname !== lastPathChecked) {
      setLastPathChecked(pathname);
      
      // If we detect a new pathname, trigger route change animation
      if (pathname && lastPathChecked !== null) {
        handleRouteChangeStart(pathname);
        handleRouteChangeComplete();
      }
    }
    
    // Add event listener for page unload
    const handleBeforeUnload = () => setIsRouteChanging(true);
    window.addEventListener("beforeunload", handleBeforeUnload);
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [pathname, lastPathChecked, handleRouteChangeStart, handleRouteChangeComplete]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    isRouteChanging,
    pathname: changingTo
  }), [isRouteChanging, changingTo]);

  // Don't show anything until mounted to avoid hydration issues
  if (!mounted) return <>{children}</>;

  return (
    <RouteChangeContext.Provider value={contextValue}>
      <div className="contents">
        {children}
        
        {isRouteChanging && (
          <div 
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all flex flex-col items-center justify-center"
            style={{ 
              opacity: isRouteChanging ? 1 : 0,
              pointerEvents: isRouteChanging ? "auto" : "none",
            }}
          >
            <div className="car-diagnostic-animation">
              <div className="car-silhouette"></div>
              <div className="scanner-beam"></div>
              <div className="scanner-points">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="scan-point" style={{ animationDelay: `${i * 0.15}s` }}></div>
                ))}
              </div>
            </div>
            
            <div className="text-center space-y-3 mt-4">
              <h3 className="text-lg font-semibold text-primary">Loading...</h3>
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Connecting to vehicle systems</span>
              </div>
              
              <div className="w-56 h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 loading-progress-bar"></div>
              </div>
              
              <div className="flex justify-center gap-3 mt-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                  <Car className="h-4 w-4 text-primary" />
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center animate-pulse" style={{ animationDelay: "0.2s" }}>
                  <Gauge className="h-4 w-4 text-primary" />
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center animate-pulse" style={{ animationDelay: "0.4s" }}>
                  <Database className="h-4 w-4 text-primary" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Add global styles for animations */}
      <style jsx global>{`
        /* Car diagnostic loading animation */
        @keyframes carScan {
          0% { transform: translateY(-10px); opacity: 0; }
          10% { transform: translateY(0); opacity: 1; }
          90% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(10px); opacity: 0; }
        }
        
        @keyframes scanBeam {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { transform: translateY(-80%); opacity: 0.7; }
          90% { transform: translateY(80%); opacity: 0.7; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        
        @keyframes scanPoint {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0); opacity: 0; }
        }
        
        @keyframes progressAnimation {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        
        .car-diagnostic-animation {
          position: relative;
          width: 150px;
          height: 100px;
          will-change: transform; /* Optimize for animations */
        }
        
        .car-silhouette {
          position: absolute;
          width: 100px;
          height: 40px;
          background-image: url("data:image/svg+xml,%3Csvg width='200' height='100' viewBox='0 0 200 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40,80 L40,70 C40,60 45,50 60,50 L140,50 C155,50 160,60 160,70 L160,80 L170,80 C175,80 180,75 180,70 L180,65 C180,60 175,55 170,55 L160,55 L150,30 C145,20 135,15 125,15 L75,15 C65,15 55,20 50,30 L40,55 L30,55 C25,55 20,60 20,65 L20,70 C20,75 25,80 30,80 L40,80 Z M60,80 C55,80 50,75 50,70 C50,65 55,60 60,60 C65,60 70,65 70,70 C70,75 65,80 60,80 Z M140,80 C135,80 130,75 130,70 C130,65 135,60 140,60 C145,60 150,65 150,70 C150,75 145,80 140,80 Z' fill='%233B82F6' /%3E%3C/svg%3E");
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: carScan 3s ease-in-out infinite;
          will-change: transform, opacity; /* Optimize for animations */
        }
        
        .scanner-beam {
          position: absolute;
          width: 100px;
          height: 6px;
          background: linear-gradient(to bottom, rgba(59, 130, 246, 0.8), rgba(59, 130, 246, 0));
          box-shadow: 0 0 10px 2px rgba(59, 130, 246, 0.3);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: scanBeam 3s ease-in-out infinite;
          will-change: transform, opacity; /* Optimize for animations */
        }
        
        .scanner-points {
          position: absolute;
          width: 100px;
          height: 40px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          contain: strict; /* Improve performance */
        }
        
        .scan-point {
          position: absolute;
          width: 4px;
          height: 4px;
          background-color: #3B82F6;
          border-radius: 50%;
          box-shadow: 0 0 5px 2px rgba(59, 130, 246, 0.5);
          animation: scanPoint 1s ease-in-out infinite;
          will-change: transform, opacity; /* Optimize for animations */
        }
        
        .scan-point:nth-child(1) { top: 20%; left: 20%; }
        .scan-point:nth-child(2) { top: 30%; left: 40%; }
        .scan-point:nth-child(3) { top: 50%; left: 30%; }
        .scan-point:nth-child(4) { top: 70%; left: 20%; }
        .scan-point:nth-child(5) { top: 20%; left: 70%; }
        .scan-point:nth-child(6) { top: 40%; left: 80%; }
        .scan-point:nth-child(7) { top: 60%; left: 75%; }
        .scan-point:nth-child(8) { top: 75%; left: 60%; }
        
        .loading-progress-bar {
          animation: progressAnimation 2s ease-in-out forwards;
          will-change: width; /* Optimize for animations */
        }
      `}</style>
    </RouteChangeContext.Provider>
  );
} 