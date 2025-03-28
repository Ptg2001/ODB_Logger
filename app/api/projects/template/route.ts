import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Create a CSV template
    const csvTemplate = `name,description,status,manager
Harrier 2024,New Harrier model for 2024,Active,John Doe
Nexon EV,Electric version of Nexon,Active,Jane Smith
Altroz Turbo,Turbocharged version of Altroz,Active,Bob Johnson
Safari Hybrid,Hybrid version of Safari,Inactive,Alice Brown`

    // Set headers for CSV download
    const headers = new Headers()
    headers.append("Content-Type", "text/csv")
    headers.append("Content-Disposition", 'attachment; filename="project_template.csv"')

    return new NextResponse(csvTemplate, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error("Error generating template:", error)
    return NextResponse.json({ error: "Failed to generate template" }, { status: 500 })
  }
}

