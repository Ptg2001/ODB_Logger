import React from "react";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PageWrapper({ children, className = "" }: PageWrapperProps) {
  return (
    <div className={`h-full w-full flex flex-col overflow-x-hidden ${className}`}>
      <div className="flex-1 w-full p-responsive">
        {children}
      </div>
    </div>
  );
} 