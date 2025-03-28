import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("timeRange") || "all"

    // Build date filter based on time range
    let dateFilter = ""
    if (timeRange !== "all") {
      const dateFilterMap: Record<string, string> = {
        week: "DATE_SUB(CURDATE(), INTERVAL 1 WEEK)",
        month: "DATE_SUB(CURDATE(), INTERVAL 1 MONTH)",
        year: "DATE_SUB(CURDATE(), INTERVAL 1 YEAR)",
      }

      if (dateFilterMap[timeRange]) {
        dateFilter = `WHERE p.created_date >= ${dateFilterMap[timeRange]}`
      }
    }

    // Get project status distribution
    const statusDistribution = (await executeQuery(`
      SELECT 
        status as name,
        COUNT(*) as value
      FROM projects p
      ${dateFilter}
      GROUP BY status
    `)) as any[]

    // Get projects by manager
    const projectsByManager = (await executeQuery(`
      SELECT 
        manager as name,
        COUNT(*) as value
      FROM projects p
      ${dateFilter}
      GROUP BY manager
      ORDER BY value DESC
      LIMIT 10
    `)) as any[]

    // Get projects created over time
    const projectsOverTime = (await executeQuery(`
      SELECT 
        created_date as date,
        COUNT(*) as count
      FROM projects p
      ${dateFilter}
      GROUP BY created_date
      ORDER BY created_date
    `)) as any[]

    // Get tests by project
    const testsByProject = (await executeQuery(`
      SELECT 
        p.name,
        COUNT(t.id) as tests
      FROM projects p
      LEFT JOIN tests t ON p.id = t.project_id
      ${dateFilter ? dateFilter.replace("p.created_date", "p.created_date") : ""}
      GROUP BY p.id
      ORDER BY tests DESC
      LIMIT 10
    \`) as any  'p.created_date') : ''}
      GROUP BY p.id
      ORDER BY tests DESC
      LIMIT 10
    `)) as any[]

    // Get project comparison data
    const projectComparison = (await executeQuery(`
      SELECT 
        p.name,
        COUNT(DISTINCT t.id) as tests,
        COUNT(DISTINCT tfc.fault_code_id) as faults,
        COUNT(DISTINCT r.id) as reports
      FROM projects p
      LEFT JOIN tests t ON p.id = t.project_id
      LEFT JOIN test_fault_codes tfc ON t.id = tfc.test_id
      LEFT JOIN reports r ON p.id = r.project_id
      ${dateFilter ? dateFilter.replace("p.created_date", "p.created_date") : ""}
      GROUP BY p.id
      ORDER BY tests DESC
      LIMIT 10
    `)) as any[]

    // Generate synthetic performance metrics based on test data
    const projectPerformance = (await executeQuery(`
      SELECT 
        p.name,
        CASE 
          WHEN COUNT(t.id) = 0 THEN 50
          ELSE GREATEST(0, LEAST(100, 50 + (COUNT(CASE WHEN t.status = 'Completed' THEN 1 ELSE NULL END) * 10 / COUNT(t.id))))
        END as performance,
        CASE 
          WHEN COUNT(t.id) = 0 THEN 50
          ELSE GREATEST(0, LEAST(100, 80 - (COUNT(DISTINCT tfc.fault_code_id) * 5 / COUNT(t.id))))
        END as reliability,
        CASE 
          WHEN COUNT(t.id) = 0 THEN 50
          ELSE GREATEST(0, LEAST(100, 60 + (COUNT(DISTINCT r.id) * 8 / GREATEST(1, COUNT(t.id)))))
        END as efficiency
      FROM projects p
      LEFT JOIN tests t ON p.id = t.project_id
      LEFT JOIN test_fault_codes tfc ON t.id = tfc.test_id
      LEFT JOIN reports r ON p.id = r.project_id
      ${dateFilter ? dateFilter.replace("p.created_date", "p.created_date") : ""}
      GROUP BY p.id
      ORDER BY performance DESC
      LIMIT 6
    `)) as any[]

    return NextResponse.json({
      statusDistribution,
      projectsByManager,
      projectsOverTime,
      testsByProject,
      projectComparison,
      projectPerformance,
    })
  } catch (error) {
    console.error("Error fetching project analysis:", error)
    return NextResponse.json({ error: "Failed to fetch project analysis" }, { status: 500 })
  }
}

