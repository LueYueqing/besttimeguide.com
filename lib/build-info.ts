// 构建时间信息
// 在构建时，scripts/generate-build-info.js 会生成 build-info.generated.ts
// 如果生成的文件不存在（开发环境），使用当前时间作为后备

function formatBuildTime(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`
}

let buildTimeFormatted: string

try {
  // 尝试导入构建时生成的文件
  // @ts-ignore - 动态导入生成的文件
  const buildInfo = require('./build-info.generated')
  buildTimeFormatted = buildInfo.BUILD_TIME_FORMATTED || buildInfo.getBuildTimeFormatted()
} catch (e) {
  // 如果文件不存在（开发环境），使用当前时间
  buildTimeFormatted = formatBuildTime(new Date())
}

export function getBuildTimeFormatted(): string {
  return buildTimeFormatted
}

