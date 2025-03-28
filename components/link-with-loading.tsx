"use client";

import React from "react";
import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { useRouteChangeStatus } from "@/components/route-change-provider";
import { Loader2, ArrowRight } from "lucide-react";

interface LinkWithLoadingProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  showArrow?: boolean;
  loadingText?: string;
  showActiveIndicator?: boolean;
}

export function LinkWithLoading({
  children,
  className = "",
  activeClassName = "text-primary font-medium",
  showArrow = false,
  loadingText,
  showActiveIndicator = false,
  href,
  ...props
}: LinkWithLoadingProps) {
  const pathname = usePathname();
  const { isRouteChanging } = useRouteChangeStatus();
  
  // Convert href to string for comparison
  const hrefString = href.toString();
  
  // Check if this link is for the current path
  const isActive = pathname === hrefString;
  
  // Apply active class if this link matches current path
  const finalClassName = `${className} ${isActive ? activeClassName : ""}`;
  
  // Determine if this specific link is being navigated to
  const isLoading = isRouteChanging && pathname !== hrefString;
  
  return (
    <Link
      href={href}
      className={`${finalClassName} relative inline-flex items-center gap-1 group transition-all duration-200`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          {loadingText || children}
        </>
      ) : (
        <>
          {children}
          {showArrow && (
            <ArrowRight className="h-3 w-3 transform transition-transform duration-200 group-hover:translate-x-1" />
          )}
          {showActiveIndicator && isActive && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary origin-left scale-x-100"></span>
          )}
        </>
      )}
    </Link>
  );
} 