import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"
import { parse as csvParse } from "csv-parse/sync"
import * as XLSX from "xlsx"
import { PDFExtract } from "pdf.js-extract"

// Helper function to parse CSV data
async function parseCSV(buffer: Buffer) {
  try {
    const content = buffer.toString("utf-8")
    const records = csvParse(content, {
      columns: true,
      skip_empty_lines: true,
    })
    return records
  } catch (error) {
    console.error("Error parsing CSV:", error)
    throw new Error("Failed to parse CSV file")
  }
}

// Helper function to parse Excel data
async function parseExcel(buffer: Buffer) {
  try {
    const workbook = XLSX.read(buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)
    return data
  } catch (error) {
    console.error("Error parsing Excel:", error)
    throw new Error("Failed to parse Excel file")
  }
}

// Helper function to parse PDF data
async function parsePDF(buffer: Buffer) {
  try {
    const pdfExtract = new PDFExtract()
    const options = {}

    // Using the buffer directly instead of converting to ArrayBuffer
    const data = await pdfExtract.extractBuffer(buffer, options)

    // Process PDF content - this is a simplified example
    // In a real app, you'd need more sophisticated parsing based on your PDF structure
    const textContent = data.pages.map((page) => page.content.map((item) => item.str).join(" ")).join("\n")

    // Try to extract structured data from the text
    // This is a very simplified approach - real PDFs would need more complex parsing
    const lines = textContent.split("\n").filter((line) => line.trim())
    const headers = ["name", "description", "status", "manager"]

    const records = []
    let currentRecord: Record<string, string> = {}
    let headerIndex = 0

    for (const line of lines) {
      if (headerIndex < headers.length) {
        currentRecord[headers[headerIndex]] = line.trim()
        headerIndex++
      } else {
        records.push(currentRecord)
        currentRecord = {}
        headerIndex = 0
        currentRecord[headers[headerIndex]] = line.trim()
        headerIndex++
      }
    }

    if (Object.keys(currentRecord).length > 0) {
      records.push(currentRecord)
    }

    return records
  } catch (error) {
    console.error("Error parsing PDF:", error)
    throw new Error("Failed to parse PDF file")
  }
}

// Helper function to validate and normalize project data
function normalizeProjectData(data: any[]) {
  return data
    .map((item) => ({
      id: uuidv4(),
      name: String(item.name || item.Name || item.PROJECT_NAME || "").trim(),
      description: String(item.description || item.Description || item.PROJECT_DESCRIPTION || "").trim(),
      status: ["Active", "Inactive"].includes(String(item.status || item.Status || "Active"))
        ? String(item.status || item.Status || "Active")
        : "Active",
      created_date: new Date().toISOString().split("T")[0],
      manager: String(item.manager || item.Manager || item.PROJECT_MANAGER || "").trim() || "System Import",
    }))
    .filter((item) => item.name) // Filter out items without a name
}

// Main handler for file upload
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const fileType = formData.get("fileType") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Parse the file based on its type
    let records
    switch (fileType) {
      case "csv":
        records = await parseCSV(buffer)
        break
      case "excel":
        records = await parseExcel(buffer)
        break
      case "pdf":
        records = await parsePDF(buffer)
        break
      default:
        return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
    }

    // Normalize and validate the data
    const projects = normalizeProjectData(records)

    if (projects.length === 0) {
      return NextResponse.json({ error: "No valid projects found in the file" }, { status: 400 })
    }

    // Insert projects into the database
    for (const project of projects) {
      await executeQuery(
        `INSERT INTO projects (id, name, description, status, created_date, manager)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [project.id, project.name, project.description, project.status, project.created_date, project.manager],
      )
    }

    return NextResponse.json({
      message: "Projects imported successfully",
      count: projects.length,
    })
  } catch (error) {
    console.error("Error importing projects:", error)
    return NextResponse.json(
      { error: "Failed to import projects", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

