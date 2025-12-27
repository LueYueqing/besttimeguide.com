// 图表颜色配置 - 统一管理图表组件使用的颜色
// 使用 Tailwind 配置中的颜色值
// 支持深色模式

interface ChartColorScheme {
  grid: string
  axis: string
  tooltip: {
    background: string
    border: string
    borderRadius: string
    boxShadow: string
    textColor: string
  }
  primary: string
  series: string[]
}

// 浅色模式颜色配置
const lightColors: ChartColorScheme = {
  grid: '#e5e7eb',      // neutral-200
  axis: '#6b7280',      // neutral-500
  tooltip: {
    background: '#ffffff',
    border: '#e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    textColor: '#111827',
  },
  primary: '#10b981',   // success-500
  series: [
    '#3b82f6',  // primary-500 (蓝色)
    '#10b981',  // success-500 (绿色)
    '#f59e0b',  // warning-500 (橙色)
    '#ef4444',  // error-500 (红色)
    '#8b5cf6',  // info-600 (紫色)
    '#ec4899',  // 粉色
    '#06b6d4',  // 青色
    '#f97316',  // accent-500 (橙色)
  ],
}

// 深色模式颜色配置
const darkColors: ChartColorScheme = {
  grid: '#374151',      // neutral-700
  axis: '#9ca3af',      // neutral-400
  tooltip: {
    background: '#1f2937',
    border: '#374151',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)',
    textColor: '#f9fafb',
  },
  primary: '#34d399',   // success-400 (更亮的绿色)
  series: [
    '#60a5fa',  // primary-400 (更亮的蓝色)
    '#34d399',  // success-400 (更亮的绿色)
    '#fbbf24',  // warning-400 (更亮的橙色)
    '#f87171',  // error-400 (更亮的红色)
    '#a78bfa',  // info-500 (更亮的紫色)
    '#f472b6',  // 更亮的粉色
    '#22d3ee',  // 更亮的青色
    '#fb923c',  // 更亮的橙色
  ],
}

// 当前颜色配置（默认浅色模式）
let currentColors: ChartColorScheme = lightColors

/**
 * 设置颜色模式
 * @param mode 'light' | 'dark' | 'auto'
 */
export function setChartColorMode(mode: 'light' | 'dark' | 'auto') {
  if (mode === 'auto') {
    // 自动检测系统偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    currentColors = prefersDark ? darkColors : lightColors
  } else {
    currentColors = mode === 'dark' ? darkColors : lightColors
  }
}

/**
 * 获取当前颜色配置
 */
export function getCurrentColors(): ChartColorScheme {
  return currentColors
}

// 导出颜色配置对象（保持向后兼容）
export const chartColors = {
  get grid() { return currentColors.grid },
  get axis() { return currentColors.axis },
  get tooltip() { return currentColors.tooltip },
  get primary() { return currentColors.primary },
  get series() { return currentColors.series },
}

/**
 * 根据索引获取系列颜色
 * @param index 数据索引
 * @returns 颜色值
 */
export function getChartColor(index: number): string {
  return chartColors.series[index % chartColors.series.length]
}

/**
 * 获取图表坐标轴配置
 */
export function getAxisConfig() {
  return {
    stroke: chartColors.axis,
    fontSize: 12,
    tickLine: false,
    axisLine: false,
  }
}

/**
 * 获取图表网格配置
 */
export function getGridConfig() {
  return {
    strokeDasharray: '3 3',
    stroke: chartColors.grid,
    vertical: false,
  }
}

/**
 * 获取图表 Tooltip 配置
 */
export function getTooltipConfig() {
  return {
    contentStyle: {
      backgroundColor: chartColors.tooltip.background,
      border: `1px solid ${chartColors.tooltip.border}`,
      borderRadius: chartColors.tooltip.borderRadius,
      boxShadow: chartColors.tooltip.boxShadow,
      color: chartColors.tooltip.textColor,
    },
  }
}

/**
 * 获取主要线条配置
 * @param strokeWidth 线条宽度，默认 3
 */
export function getPrimaryLineConfig(strokeWidth: number = 3) {
  return {
    type: 'monotone' as const,
    dataKey: 'scans',
    stroke: chartColors.primary,
    strokeWidth,
    dot: { 
      fill: chartColors.primary, 
      r: 4, 
      strokeWidth: 2, 
      stroke: '#ffffff' 
    },
    activeDot: { r: 6, strokeWidth: 0 },
  }
}
