import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * 调试API：获取模板配置
 * 在开发环境中，这个API会实时读取 templates.json，无需重启服务器
 */
export async function GET() {
  try {
    // 只在开发环境中允许访问
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development mode' },
        { status: 403 }
      )
    }

    const templatesPath = join(process.cwd(), 'lib', 'qr-frames', 'templates.json')
    const templatesContent = readFileSync(templatesPath, 'utf-8')
    const templates = JSON.parse(templatesContent)

    return NextResponse.json({ success: true, templates })
  } catch (error: any) {
    console.error('Error reading templates:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to read templates' },
      { status: 500 }
    )
  }
}

