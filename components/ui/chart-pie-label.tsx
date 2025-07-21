"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { Pie, PieChart } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useMemo } from "react"

export const description = "A pie chart with a label"

type Session = {
  date: string // ISO string (full ISO timestamp)
  exercises_performed: number[] // int8[] from supabase, pose IDs as numbers
}

type Pose = {
  id: number
  name: string
}
interface Props {
  sessions: Session[]
  poses: Pose[]
}

// Get YYYY-MM-DD string for offset days ago (UTC)
function getDateStr(offsetDays = 0) {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - offsetDays)
  return d.toISOString().slice(0, 10)
}

// Utility to map pose ID to name
function createPoseIdToNameMap(poses: Pose[]) {
  const map = new Map<number, string>()
  poses.forEach((p) => map.set(p.id, p.name))
  return map
}

// Build chart data aggregating counts of exercises performed in last 30 days
function buildChartDataLastMonth(sessions: Session[], poses:Pose[]) {
  const cutoffDate = getDateStr(30)
  const cutoffDateObj = new Date(cutoffDate)
  const poseCountMap = new Map<string, number>()

  const poseIdToName = createPoseIdToNameMap(poses)
  
  sessions
    .filter((s) => {
      const sessionDateOnly = s.date.slice(0, 10)
      const sessionDateObj = new Date(sessionDateOnly)
      return sessionDateObj >= cutoffDateObj
    })
    .forEach((s) => {
      (s.exercises_performed ?? []).forEach((poseId) => {
        const poseName = poseIdToName.get(poseId) ?? poseId.toString() // fallback to ID string
        poseCountMap.set(poseName, (poseCountMap.get(poseName) || 0) + 1)
      })
    })

  const colors = [
  "#3B82F6", // blue-500
  "#1D4ED8", // blue-700
  "#2563EB", // blue-600
  "#1E40AF", // blue-800
  "#60A5FA", // blue-400
  "#93C5FD", // blue-300
  "#DBEAFE", // blue-100
  "#1E3A8A", // blue-900
]

  return Array.from(poseCountMap.entries()).map(([poseName, count], i) => ({
    name: poseName,
    value: count,
    fill: colors[i % colors.length],
  }))
}

function buildChartConfig(chartData: { name: string; fill: string }[]): ChartConfig {
  const config: ChartConfig = {}
  chartData.forEach((d) => {
    config[d.name] = { label: d.name, color: d.fill }
  })
  return config
}

// Get unique poses for a specific date (YYYY-MM-DD string)
function getUniquePosesForDate(sessions: Session[], dateStr: string): Set<number> {
  const posesSet = new Set<number>()
  sessions
    .filter((s) => s.date.slice(0, 10) === dateStr)
    .forEach((s) => {
      (s.exercises_performed ?? []).forEach((p) => posesSet.add(p))
    })
  return posesSet
}

function calculateChange(todayCount: number, yesterdayCount: number) {
  if (yesterdayCount === 0 && todayCount > 0) {
    return { changePercent: 100, isIncrease: true }
  } else if (yesterdayCount === 0 && todayCount === 0) {
    return { changePercent: 0, isIncrease: true }
  } else {
    const diff = todayCount - yesterdayCount
    return { changePercent: (diff / yesterdayCount) * 100, isIncrease: diff >= 0 }
  }
}

export function ChartPiePoseDistribution({ sessions, poses }: Props) {
  const chartData = useMemo(() => buildChartDataLastMonth(sessions, poses), [sessions, poses])
  const chartConfig = useMemo(() => buildChartConfig(chartData), [chartData])

  const todayStr = getDateStr(0)
  const yesterdayStr = getDateStr(1)

  const uniquePosesToday = useMemo(() => getUniquePosesForDate(sessions, todayStr), [sessions, todayStr])
  const uniquePosesYesterday = useMemo(() => getUniquePosesForDate(sessions, yesterdayStr), [sessions, yesterdayStr])

  const todayCount = uniquePosesToday.size
  const yesterdayCount = uniquePosesYesterday.size

  const { changePercent, isIncrease } = calculateChange(todayCount, yesterdayCount)

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-2 p-6 pb-2">
        <div className="font-bold text-lg tracking-tight">Pose Type Breakdown</div>
        <div className="text-sm text-gray-500">
          See your trends and less practiced areas
        </div>
      </div>
      <div className="p-6">
        {chartData.length === 0 ? (
          <div className="text-center text-muted-foreground mt-10">
            No pose data in the last 30 days.
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
            <PieChart width={300} height={300}>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                label
                outerRadius={80}
                cx="50%"
                cy="50%"
              />
            </PieChart>
          </ChartContainer>
        )}
      </div>
      <div className="flex flex-col items-start gap-2 text-sm p-6 pt-0">
        <div className="flex gap-2 leading-none font-medium">
          {isIncrease ? (
            <>
              Trending up by {changePercent?.toFixed(1)}% <TrendingUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Trending down by {Math.abs(changePercent ?? 0).toFixed(1)}% <TrendingDown className="h-4 w-4" />
            </>
          )}
        </div>
        <div className="text-muted-foreground leading-none">
          Explore different pose types to develop well-rounded practice
        </div>
      </div>
    </div>
  )
}
