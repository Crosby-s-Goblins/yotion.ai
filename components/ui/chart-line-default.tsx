"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
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
import { useMemo } from "react"
import { TooltipProps } from "recharts";

function CustomTooltip({ active, payload }: TooltipProps<number, any>) {
  if (active && payload && payload.length) {
    const score = payload[0].value as number;
    const percent = (score / 100).toFixed(1);
    return (
      <div className="bg-white p-2 rounded border shadow">
        <p className="text-sm font-semibold">
          Consistency Score: {percent}%
        </p>
      </div>
    );
  }
  return null;
}


export const description = "A line chart showing consistency scores over the past 6 hours today"

interface Session {
  date: string // ISO string with time
  consistency_score: number
}

interface Props {
  sessions: Session[]
}

function formatHour(hour: number) {
  return hour.toString().padStart(2, "0") + ":00"
}

function getDateStr(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() - offsetDays)
  return d.toISOString().slice(0, 10)
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

const chartConfig = {
  consistency_score: {
    label: "Consistency Score",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ChartLineConsistency({ sessions }: Props) {
  const todayStr = getDateStr(0)
  const yesterdayStr = getDateStr(1)

  const sessionsToday = useMemo(
    () => sessions.filter((s) => s.date.slice(0, 10) === todayStr),
    [sessions, todayStr]
  )
  const sessionsYesterday = useMemo(
    () => sessions.filter((s) => s.date.slice(0, 10) === yesterdayStr),
    [sessions, yesterdayStr]
  )

  // Current local hour (0-23)
  const now = new Date()
  const currentHour = now.getHours()

  // Calculate last 6 hours (including current hour), e.g. if now=14, hours = [9,10,11,12,13,14]
  const past6Hours = Array.from({ length: 6 }, (_, i) => (currentHour - 5 + i + 24) % 24)

  // Group scores by hour for sessions today
  const scoresByHour = useMemo(() => {
    const map: Record<number, number[]> = {}
    past6Hours.forEach((h) => (map[h] = []))

    sessionsToday.forEach((s) => {
      const date = new Date(s.date)
      const hour = date.getHours()
      if (past6Hours.includes(hour)) {
        map[hour].push(s.consistency_score)
      }
    })

    return map
  }, [sessionsToday, past6Hours])

  // Average score per hour in the past 6 hours
  const chartData = useMemo(() => {
    return past6Hours.map((hour) => {
      const scores = scoresByHour[hour]
      const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
      return {
        time: formatHour(hour),
        consistency_score: avg,
      }
    })
  }, [scoresByHour, past6Hours])

  const avgConsistencyToday = useMemo(() => {
    if (sessionsToday.length === 0) return 0
    const sum = sessionsToday.reduce((acc, s) => acc + s.consistency_score, 0)
    return sum / sessionsToday.length
  }, [sessionsToday])

  const avgConsistencyYesterday = useMemo(() => {
    if (sessionsYesterday.length === 0) return 0
    const sum = sessionsYesterday.reduce((acc, s) => acc + s.consistency_score, 0)
    return sum / sessionsYesterday.length
  }, [sessionsYesterday])

  const { changePercent, isIncrease } = calculateChange(avgConsistencyToday, avgConsistencyYesterday)

  // Use past6Hours formatted for X axis ticks
  const xTicks = past6Hours.map(formatHour)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Consistency Score (Past 6 Hours)</CardTitle>
        <CardDescription>Scores over the last 6 hours</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="text-center text-muted-foreground mt-10">No data for today</div>
        ) : (
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 12, right: 12 }}
              width={600}
              height={300}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                ticks={xTicks}
                interval={0}
              />
              <ChartTooltip cursor={false} content={<CustomTooltip />}  />
              <Line
                dataKey="consistency_score"
                type="monotone"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
            </LineChart>
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
          Average consistency score today compared to yesterday
        </div>
      </CardFooter>
    </Card>
  )
}
