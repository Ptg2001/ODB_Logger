# Full-Screen Layout Pattern for OBD-II Logger

This guide explains how to implement the full-screen layout pattern for all dashboard pages to ensure consistent display across all devices.

## Overview

We've updated the layout system to ensure all pages display content in full-screen mode, similar to how the fault codes page works. This provides a more immersive and responsive experience while maintaining all existing functionality.

## How to Use

### 1. Import the DashboardPage Component

Start by importing the DashboardPage component:

```tsx
import { DashboardPage } from "@/components/layouts/dashboard-page";
```

### 2. Wrap Your Content

Replace your existing page structure with the DashboardPage component:

```tsx
export default function YourPage() {
  return (
    <DashboardPage title="Your Page Title" subtitle="Optional subtitle text">
      <div className="px-4 sm:px-6 md:px-8 space-y-6 w-full">
        {/* Your page content */}
      </div>
    </DashboardPage>
  );
}
```

### 3. Ensure Content Uses Full Width With Proper Padding

The outer container should have both full width and proper responsive padding:

```tsx
<div className="px-4 sm:px-6 md:px-8 w-full">
  {/* Your component */}
</div>
```

### 4. For Tabs Components

When using Tabs, make them full width with left-aligned triggers:

```tsx
<Tabs defaultValue="tab1" className="space-y-4 w-full">
  <TabsList className="w-full justify-start">
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1" className="space-y-4">
    <div className="w-full">
      {/* Tab content */}
    </div>
  </TabsContent>
</Tabs>
```

## Example Implementation

Here's a complete example of how to implement the full-screen layout pattern:

```tsx
"use client"

import { DashboardPage } from "@/components/layouts/dashboard-page"
import { YourComponent } from "@/components/your-component"

export default function YourPage() {
  return (
    <DashboardPage title="Your Page Title" subtitle="Your page description">
      <div className="px-4 sm:px-6 md:px-8 space-y-6 w-full">
        {/* Your page content */}
        <div className="w-full">
          <YourComponent />
        </div>
      </div>
    </DashboardPage>
  );
}
```

## Consistent Padding Pattern

To maintain consistent spacing across the application:

- Use `px-4 sm:px-6 md:px-8` for horizontal padding
- This creates a responsive padding that increases on larger screens
- Apply this to the main content container directly inside the DashboardPage component

## CSS Utility Classes

The following utility classes are available:

- `.full-height` - Makes an element take up 100% of available height
- `.full-width` - Makes an element take up 100% of available width (with no padding constraints)
- `.dashboard-page` - Applies the dashboard page layout
- `.dashboard-content` - Styles the content area of a dashboard page

## Benefits

- Consistent layout across all pages
- Better use of screen real estate
- Improved responsiveness on all device sizes
- Content extends to the full width of the screen
- Maintains all existing functionality
- Cleaner, more organized code structure 