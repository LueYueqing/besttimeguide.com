#!/usr/bin/env node

/**
 * 生成构建信息文件
 * 在构建时生成 lib/build-info.generated.ts，包含构建时间等信息
 */

const fs = require('fs')
const path = require('path')

function formatBuildTime(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`
}

const buildTime = new Date()
const buildTimeFormatted = formatBuildTime(buildTime)

const outputPath = path.join(__dirname, '..', 'lib', 'build-info.generated.ts')
const outputDir = path.dirname(outputPath)

// 确保目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

const content = `// 此文件由 scripts/generate-build-info.js 在构建时自动生成
// 请勿手动编辑此文件

export const BUILD_TIME = ${buildTime.getTime()}
export const BUILD_TIME_FORMATTED = '${buildTimeFormatted}'

export function getBuildTimeFormatted(): string {
  return BUILD_TIME_FORMATTED
}
`

fs.writeFileSync(outputPath, content, 'utf8')
console.log(`✓ Generated build info: ${buildTimeFormatted}`)

