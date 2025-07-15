"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A bar chart with a label"

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

// Get last 7 days including today, in order from oldest to newest
function getLast7Days() {
  const days = []
  const today = new Date()

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push(d)
  }

  return days
}

// Format day name from Date object, e.g. "Sunday"
function getDayName(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "long" })
}

interface Session {
  date: string // ISO date string
}

interface Props {
  sessions: Session[]
}
// Smming sessions in a date range
function sumSessionsInRange(
  sessions: Session[],
  startDate: Date,
  endDate: Date
): number {
  // Sum sessions with date >= startDate and < endDate
  const start = startDate.getTime()
  const end = endDate.getTime()

  return sessions.reduce((acc, session) => {
    const sessionTime = new Date(session.date).getTime()
    if (sessionTime >= start && sessionTime < end) {
      return acc + 1
    }
    return acc
  }, 0)
}

export function ChartBarWeeklyProgress({ sessions }: Props) {
  // Dates for this week: last 7 days including today
  const today = new Date()
  const thisWeekStart = new Date(today)
  thisWeekStart.setHours(0, 0, 0, 0)
  thisWeekStart.setDate(today.getDate() - 6) // 7 days including today

  // Dates for last week: 7 days before this week
  const lastWeekStart = new Date(thisWeekStart)
  lastWeekStart.setDate(thisWeekStart.getDate() - 7)
  const lastWeekEnd = new Date(thisWeekStart) // exclusive

  // Calculate totals
  const thisWeekTotal = sumSessionsInRange(sessions, thisWeekStart, new Date(today.getTime() + 86400000)) // include today
  const lastWeekTotal = sumSessionsInRange(sessions, lastWeekStart, lastWeekEnd)

  // Calculate percent change
  let percentChange = 0
  if (lastWeekTotal === 0 && thisWeekTotal > 0) {
    percentChange = 100
  } else if (lastWeekTotal === 0 && thisWeekTotal === 0) {
    percentChange = 0
  } else {
    percentChange = ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100
  }

  const isIncreaseOrNoChange = percentChange >= 0
  // Get last 7 days dates
  const last7Days = getLast7Days()

  // Count sessions per day
  // Create a map from 'YYYY-MM-DD' to count
  const sessionCountByDay: Record<string, number> = {}

  sessions.forEach((session) => {
    const sessionDate = new Date(session.date)
    const key = sessionDate.toISOString().slice(0, 10) // YYYY-MM-DD
    sessionCountByDay[key] = (sessionCountByDay[key] ?? 0) + 1
  })

  // Build chartData with day names and counts, zero if none
  const chartData = last7Days.map((date) => {
    const key = date.toISOString().slice(0, 10)
    return {
      day: getDayName(date),
      desktop: sessionCountByDay[key] ?? 0,
    }
  })

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-2 p-6 pb-2">
        <div className="font-bold text-lg tracking-tight">Daily Pose Count</div>
        <div className="text-sm text-gray-500">Poses Completed</div>
      </div>
      <div className="p-6">
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="desktop" fill="#3B82F6" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
       <div className="flex flex-col items-start gap-2 text-sm p-6 pt-0">
        <div className="flex gap-2 leading-none font-medium">
          {isIncreaseOrNoChange ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
          {`An exercise ${
            isIncreaseOrNoChange ? "increase" : "decrease"
          } of ${Math.abs(percentChange).toFixed(1)}% this week!`}
        </div>
        <div className="text-muted-foreground leading-none">Build consistency by practicing regularly each day</div>
      </div>
    </div>
  )
}
