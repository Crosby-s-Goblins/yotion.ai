"use client"

import { useMemo, useState } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  TooltipProps,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function CustomTooltip({ active, payload, label }: TooltipProps<number, any>) {
  if (active && payload && payload.length) {
    const score = payload[0].value as number
    const percent = (score / 100).toFixed(1)
    return (
      <div className="bg-white p-2 rounded border shadow">
        <p className="text-sm font-semibold">{label} Score: {percent}%</p>
      </div>
    )
  }
  return null
}

interface Session {
  date: string
  consistency_score: number
  accuracy_score: number
}

interface Props {
  sessions: Session[]
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

function formatHour(hour: number) {
  return hour.toString().padStart(2, "0") + ":00"
}

function ChartLine({ sessions, dataKey, label, stroke }: {
  sessions: Session[]
  dataKey: "consistency_score" | "accuracy_score"
  label: string
  stroke: string
}) {
  const [timeRange, setTimeRange] = useState<"day" | "week">("day")

  const now = new Date()

  const recentPoints = useMemo(() => {
    if (timeRange === "day") {
      return Array.from({ length: 24 }, (_, i) => {
        const h = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000)
        return h.getHours()
      })
    } else {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now)
        d.setDate(now.getDate() - (6 - i))
        return d.toISOString().split("T")[0]
      })
    }
  }, [timeRange, now])

  const sessionsCurrent = useMemo(() => {
    return sessions.filter((s) => {
      const d = new Date(s.date)
      return timeRange === "day"
        ? d >= new Date(now.getTime() - 24 * 60 * 60 * 1000) && d <= now
        : d >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) && d <= now
    })
  }, [sessions, now, timeRange])

  const sessionsComparison = useMemo(() => {
    return sessions.filter((s) => {
      const d = new Date(s.date)
      return timeRange === "day"
        ? d >= new Date(now.getTime() - 48 * 60 * 60 * 1000) && d < new Date(now.getTime() - 24 * 60 * 60 * 1000)
        : d >= new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) && d < new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    })
  }, [sessions, now, timeRange])

  const scoresByKey = useMemo(() => {
    const map: Record<string | number, number[]> = {}
    recentPoints.forEach((p) => (map[p] = []))

    sessionsCurrent.forEach((s) => {
      const key = timeRange === "day"
        ? new Date(s.date).getHours()
        : new Date(s.date).toISOString().split("T")[0]
      if (map[key]) map[key].push(s[dataKey])
    })

    return map
  }, [sessionsCurrent, recentPoints, dataKey, timeRange])

  const chartData = useMemo(() => {
    return recentPoints.map((p) => {
      const scores = scoresByKey[p]
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
      return {
        time: timeRange === "day" ? formatHour(p as number) : (p as string).slice(5),
        [dataKey]: avg,
      }
    })
  }, [scoresByKey, recentPoints, dataKey, timeRange])

  const avgCurrent = useMemo(() => {
    if (sessionsCurrent.length === 0) return 0
    return sessionsCurrent.reduce((sum, s) => sum + s[dataKey], 0) / sessionsCurrent.length
  }, [sessionsCurrent, dataKey])

  const avgPast = useMemo(() => {
    if (sessionsComparison.length === 0) return 0
    return sessionsComparison.reduce((sum, s) => sum + s[dataKey], 0) / sessionsComparison.length
  }, [sessionsComparison, dataKey])

  const { changePercent, isIncrease } = calculateChange(avgCurrent, avgPast)

  const xTicks = useMemo(() => {
    return timeRange === "day"
      ? chartData.map((d, i) => (i % 4 === 0 ? d.time : "")).filter(Boolean)
      : chartData.map((d) => d.time)
  }, [chartData, timeRange])

  const chartConfig: ChartConfig = {
    [dataKey]: {
      label,
      color: "var(--chart-2)",
    },
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>{label}</CardTitle>
          <CardDescription>
            {timeRange === "day" ? "Past 24 hours" : "Past 7 days"}
          </CardDescription>
        </div>
        <div className="mt-2 md:mt-0 w-40">
          <Select value={timeRange} onValueChange={(val) => setTimeRange(val as "day" | "week")}> 
            <SelectTrigger>
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Past Day</SelectItem>
              <SelectItem value="week">Past Week</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="text-center text-muted-foreground mt-10">No data available</div>
        ) : (
          <ChartContainer config={chartConfig}>
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
                <ChartTooltip cursor={false} content={<CustomTooltip label={label} />} />
                <Line
                  dataKey={dataKey}
                  type="monotone"
                  stroke={stroke}
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
              Trending up by {changePercent.toFixed(1)}% <TrendingUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Trending down by {Math.abs(changePercent).toFixed(1)}% <TrendingDown className="h-4 w-4" />
            </>
          )}
        </div>
        <div className="text-muted-foreground leading-none">
          Average {label.toLowerCase()} ({timeRange === "day" ? "last 24 hours" : "last 7 days"}) compared to previous period
        </div>
      </CardFooter>
    </Card>
  )
}

export function ChartLineConsistency({ sessions }: Props) {
  return <ChartLine sessions={sessions} dataKey="consistency_score" label="Consistency Score" stroke="#67e8f9" />
}

export function ChartLineAccuracy({ sessions }: Props) {
  return <ChartLine sessions={sessions} dataKey="accuracy_score" label="Accuracy Score" stroke="#10B981" />
}
