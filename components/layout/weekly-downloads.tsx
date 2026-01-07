'use client'

import { useState } from 'react'
import { DownloadIcon } from 'lucide-react'
import { Area, AreaChart, XAxis, YAxis } from 'recharts'

import { ChartConfig, ChartContainer } from '@/components/ui/chart'

export interface DownloadStats {
  total: number
  weekly: { day: string; count: number }[]
}

const chartConfig = {
  downloads: {
    label: 'Downloads',
    color: 'var(--primary)',
  },
} satisfies ChartConfig

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`
  }
  return num.toString()
}

function formatDay(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function WeeklyDownloads({ data }: { data: DownloadStats | null }) {
  const [hoveredData, setHoveredData] = useState<{
    day: string
    downloads: number
  } | null>(null)

  if (!data || data.weekly.length === 0) {
    return null
  }

  const chartData = data.weekly.map((item) => ({
    day: formatDay(item.day),
    downloads: item.count,
  }))

  const totalDownloads = data.total
  const lastDayDownloads = chartData[chartData.length - 1]?.downloads ?? 0

  return (
    <div className="bg-muted flex flex-col px-6 py-4">
      <div className="text-foreground flex items-center gap-2 py-2">
        <DownloadIcon className="size-3" />
        <span className="font-mono text-xs font-medium tracking-wide uppercase">
          Downloads
        </span>
      </div>
      <div className="flex flex-col gap-1 px-0 py-2">
        <div className="flex items-baseline gap-2">
          {hoveredData ? (
            <>
              <span className="text-foreground font-mono text-lg font-semibold tabular-nums">
                {formatNumber(hoveredData.downloads)}
              </span>
              <span className="text-muted-foreground font-mono text-xs">
                {hoveredData.day}
              </span>
            </>
          ) : (
            <>
              <span className="text-foreground font-mono text-lg font-semibold tabular-nums">
                {formatNumber(totalDownloads)}
              </span>
              <span className="text-muted-foreground font-mono text-xs">
                Total
              </span>
            </>
          )}
        </div>
        <ChartContainer config={chartConfig} className="h-[60px] w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 1, right: 0, bottom: 1, left: 0 }}
            onMouseMove={(state) => {
              if (state.activePayload?.[0]?.payload) {
                setHoveredData(state.activePayload[0].payload)
              }
            }}
            onMouseLeave={() => setHoveredData(null)}
          >
            <defs>
              <linearGradient id="fillDownloads" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-downloads)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-downloads)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" hide />
            <YAxis hide domain={[0, 'auto']} />
            <Area
              dataKey="downloads"
              type="monotone"
              fill="url(#fillDownloads)"
              stroke="var(--color-downloads)"
              strokeWidth={1.5}
            />
          </AreaChart>
        </ChartContainer>
        <span className="text-muted-foreground font-mono text-xs opacity-50">
          {lastDayDownloads} downloads today
        </span>
      </div>
    </div>
  )
}
