"use client"

import { useMemo, useState } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
} from "recharts"

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
} from "@/components/ui/chart"
import { TooltipProps } from "recharts"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function CustomTooltipConsistency({ active, payload }: TooltipProps<number, any>) {
  if (active && payload && payload.length) {
    const score = payload[0].value as number
    const percent = (score / 100).toFixed(1)
    return (
      <div className="bg-white p-2 rounded border shadow">
        <p className="text-sm font-semibold">Consistency Score: {percent}%</p>
      </div>
    )
  }
  return null
}

function CustomTooltipAccuracy({ active, payload }: TooltipProps<number, any>) {
  if (active && payload && payload.length) {
    const score = payload[0].value as number
    const percent = (score / 100).toFixed(1)
    return (
      <div className="bg-white p-2 rounded border shadow">
        <p className="text-sm font-semibold">Accuracy Score: {percent}%</p>
      </div>
    )
  }
  return null
}

export const description = "A line chart showing consistency scores"

interface Session {
  date: string
  consistency_score: number
  accuracy_score: number
}

interface Props {
  sessions: Session[]
}

function formatHour(hour: number) {
  return hour.toString().padStart(2, "0") + ":00"
}


function calculateChange(todayAvg: number, yesterdayAvg: number) {
  if (yesterdayAvg === 0 && todayAvg > 0) {
    return { changePercent: 100, isIncrease: true }
  } else if (yesterdayAvg === 0 && todayAvg === 0) {
    return { changePercent: 0, isIncrease: true }
  } else {
    const diff = todayAvg - yesterdayAvg
    return { changePercent: (diff / yesterdayAvg) * 100, isIncrease: diff >= 0 }
  }
}

const chartConfigConsistency = {
  consistency_score: {
    label: "Consistency Score",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

const chartConfigAccuracy = {
  consistency_score: {
    label: "Accuracy Score",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ChartLineConsistency({ sessions }: Props) {
  const [timeRange, setTimeRange] = useState<"6h" | "24h">("6h")

  const now = new Date()
  const rangeHours = timeRange === "6h" ? 6 : 24

  const recentHours = Array.from({ length: rangeHours }, (_, i) => {
    const h = new Date(now.getTime() - (rangeHours - 1 - i) * 60 * 60 * 1000)
    return h.getHours()
  })

  const sessionsToday = useMemo(
    () =>
      sessions.filter((s) => {
        const sessionDate = new Date(s.date)
        return (
          sessionDate >= new Date(now.getTime() - rangeHours * 60 * 60 * 1000) &&
          sessionDate <= now
        )
      }),
    [sessions, now, rangeHours]
  )

  const pastComparisonStart = new Date(now.getTime() - rangeHours * 60 * 60 * 1000 * 2)
  const pastComparisonEnd = new Date(now.getTime() - rangeHours * 60 * 60 * 1000)

  const sessionsComparison = useMemo(
    () =>
      sessions.filter((s) => {
        const d = new Date(s.date)
        return d >= pastComparisonStart && d < pastComparisonEnd
      }),
    [sessions, pastComparisonStart, pastComparisonEnd]
  )


  const scoresByHour = useMemo(() => {
    const map: Record<number, number[]> = {}
    recentHours.forEach((h) => (map[h] = []))

    sessionsToday.forEach((s) => {
      const hour = new Date(s.date).getHours()
      if (map[hour]) {
        map[hour].push(s.consistency_score)
      }
    })

    return map
  }, [sessionsToday, recentHours])

  const chartData = useMemo(() => {
    return recentHours.map((hour) => {
      const scores = scoresByHour[hour]
      const avg =
        scores.length > 0
          ? scores.reduce((sum, s) => sum + s, 0) / scores.length
          : 0
      return {
        time: formatHour(hour),
        consistency_score: avg,
      }
    })
  }, [scoresByHour, recentHours])

  const avgToday = useMemo(() => {
    if (sessionsToday.length === 0) return 0
    const total = sessionsToday.reduce((sum, s) => sum + s.consistency_score, 0)
    return total / sessionsToday.length
  }, [sessionsToday])

  const avgComparison = useMemo(() => {
    if (sessionsComparison.length === 0) return 0
    const total = sessionsComparison.reduce((sum, s) => sum + s.consistency_score, 0)
    return total / sessionsComparison.length
  }, [sessionsComparison])

  const { changePercent, isIncrease } = calculateChange(avgToday, avgComparison)

  const xTicks = recentHours.filter((_, i) => rangeHours === 24 ? i % 4 === 0 : true).map(formatHour)

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Consistency Score</CardTitle>
          <CardDescription>
            {timeRange === "6h"
              ? "Past 6 hours"
              : "Past 24 hours"}
          </CardDescription>
        </div>
        <div className="mt-2 md:mt-0 w-40">
          <Select value={timeRange} onValueChange={(val) => setTimeRange(val as "6h" | "24h")}>
            <SelectTrigger>
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="text-center text-muted-foreground mt-10">No data available</div>
        ) : (
          <ChartContainer config={chartConfigConsistency}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 10, left: 24, right: 24, bottom: 10 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  ticks={xTicks}
                  interval={0}
                  minTickGap={16}
                />
                <ChartTooltip cursor={false} content={<CustomTooltipConsistency />} />
                <Line
                  dataKey="consistency_score"
                  type="monotone"
                  stroke="#67e8f9"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {isIncrease ? (
            <>
              Trending up by {changePercent.toFixed(1)}%{" "}
              <TrendingUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Trending down by {Math.abs(changePercent).toFixed(1)}%{" "}
              <TrendingDown className="h-4 w-4" />
            </>
          )}
        </div>
        <div className="text-muted-foreground leading-none">
            Average consistency score (last {rangeHours} hours) compared to previous {rangeHours} hours
        </div>
      </CardFooter>
    </Card>
  )
}


export function ChartLineAccuracy({ sessions }: Props) {
  const [timeRange, setTimeRange] = useState<"6h" | "24h">("6h")

  const now = new Date()
  const rangeHours = timeRange === "6h" ? 6 : 24

  const recentHours = Array.from({ length: rangeHours }, (_, i) => {
    const h = new Date(now.getTime() - (rangeHours - 1 - i) * 60 * 60 * 1000)
    return h.getHours()
  })

  const sessionsToday = useMemo(
    () =>
      sessions.filter((s) => {
        const sessionDate = new Date(s.date)
        return (
          sessionDate >= new Date(now.getTime() - rangeHours * 60 * 60 * 1000) &&
          sessionDate <= now
        )
      }),
    [sessions, now, rangeHours]
  )

  const pastComparisonStart = new Date(now.getTime() - rangeHours * 60 * 60 * 1000 * 2)
  const pastComparisonEnd = new Date(now.getTime() - rangeHours * 60 * 60 * 1000)

  const sessionsComparison = useMemo(
    () =>
      sessions.filter((s) => {
        const d = new Date(s.date)
        return d >= pastComparisonStart && d < pastComparisonEnd
      }),
    [sessions, pastComparisonStart, pastComparisonEnd]
  )

  const scoresByHour = useMemo(() => {
    const map: Record<number, number[]> = {}
    recentHours.forEach((h) => (map[h] = []))

    sessionsToday.forEach((s) => {
      const hour = new Date(s.date).getHours()
      if (map[hour]) {
        map[hour].push(s.accuracy_score)
      }
    })

    return map
  }, [sessionsToday, recentHours])

  const chartData = useMemo(() => {
    return recentHours.map((hour) => {
      const scores = scoresByHour[hour]
      const avg =
        scores.length > 0
          ? scores.reduce((sum, s) => sum + s, 0) / scores.length
          : 0
      return {
        time: formatHour(hour),
        accuracy_score: avg,
      }
    })
  }, [scoresByHour, recentHours])

  const avgToday = useMemo(() => {
    if (sessionsToday.length === 0) return 0
    const total = sessionsToday.reduce((sum, s) => sum + s.accuracy_score, 0)
    return total / sessionsToday.length
  }, [sessionsToday])

  const avgComparison = useMemo(() => {
    if (sessionsComparison.length === 0) return 0
    const total = sessionsComparison.reduce((sum, s) => sum + s.accuracy_score, 0)
    return total / sessionsComparison.length
  }, [sessionsComparison])

  const { changePercent, isIncrease } = calculateChange(avgToday, avgComparison)
  const xTicks = recentHours.filter((_, i) => rangeHours === 24 ? i % 4 === 0 : true).map(formatHour)

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Accuracy Score</CardTitle>
          <CardDescription>
            {timeRange === "6h"
              ? "Past 6 hours"
              : "Past 24 hours"}
          </CardDescription>
        </div>
        <div className="mt-2 md:mt-0 w-40">
          <Select value={timeRange} onValueChange={(val) => setTimeRange(val as "6h" | "24h")}>
            <SelectTrigger>
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="text-center text-muted-foreground mt-10">No data available</div>
        ) : (
          <ChartContainer config={chartConfigAccuracy}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 10, left: 24, right: 24, bottom: 10 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  ticks={xTicks}
                  interval={0}
                  minTickGap={16}
                />
                <ChartTooltip cursor={false} content={<CustomTooltipAccuracy />} />
                <Line
                  dataKey="accuracy_score"
                  type="monotone"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {isIncrease ? (
            <>
              Trending up by {changePercent.toFixed(1)}%{" "}
              <TrendingUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Trending down by {Math.abs(changePercent).toFixed(1)}%{" "}
              <TrendingDown className="h-4 w-4" />
            </>
          )}
        </div>
        <div className="text-muted-foreground leading-none">
            Average accuracy score (last {rangeHours} hours) compared to previous {rangeHours} hours
        </div>
      </CardFooter>
    </Card>
  )
}