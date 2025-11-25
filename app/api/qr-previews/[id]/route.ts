/**
 * API Route: Get QR Code Preview Image URL
 * 获取二维码预览图 URL（支持多种存储方式：Cloudinary、Vercel Blob、文件系统）
 * 
 * - 开发环境：优先使用本地文件系统
 * - 生产环境：优先使用 Cloudinary
 */

import { NextRequest, NextResponse } from 'next/server'
import { head } from '@vercel/blob'
import { promises as fs } from 'fs'
import path from 'path'

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'
const IS_VERCEL = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined
const USE_CLOUDINARY = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
)
const USE_VERCEL_BLOB = IS_VERCEL && !!process.env.BLOB_READ_WRITE_TOKEN
const PREVIEWS_DIR = path.join(process.cwd(), 'public', 'qr-previews')

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const qrCodeId = parseInt(id, 10)
    if (isNaN(qrCodeId)) {
      return NextResponse.json({ error: 'Invalid QR code ID' }, { status: 400 })
    }

    // 根据环境选择存储方式
    // 开发环境：优先使用本地文件系统
    // 生产环境：优先使用 Cloudinary
    if (IS_DEVELOPMENT) {
      // 开发环境：优先使用本地文件系统
      const previewPath = path.join(PREVIEWS_DIR, `qr-${qrCodeId}-preview.png`)
      try {
        await fs.access(previewPath)
        const fileUrl = `/qr-previews/qr-${qrCodeId}-preview.png`
        return NextResponse.redirect(new URL(fileUrl, request.url), 302)
      } catch {
        // 如果本地文件不存在，尝试从 Cloudinary 获取（如果配置了）
        if (USE_CLOUDINARY) {
          try {
            const cloudinary = await import('cloudinary').then(m => m.v2)
            cloudinary.config({
              cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
              api_key: process.env.CLOUDINARY_API_KEY!,
              api_secret: process.env.CLOUDINARY_API_SECRET!,
            })
            const resource = await cloudinary.api.resource(`qr-previews/qr-${qrCodeId}-preview`)
            return NextResponse.redirect(resource.secure_url, 302)
          } catch (error: any) {
            if (error?.http_code === 404) {
              return NextResponse.json({ error: 'Preview not found' }, { status: 404 })
            }
            console.warn(`[QR Preview API] Cloudinary error for QR ${qrCodeId}:`, error)
            return NextResponse.json({ error: 'Preview not found' }, { status: 404 })
          }
        }
        return NextResponse.json({ error: 'Preview not found' }, { status: 404 })
      }
    } else {
      // 生产环境：优先使用 Cloudinary
      if (USE_CLOUDINARY) {
        try {
          const cloudinary = await import('cloudinary').then(m => m.v2)
          cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
            api_key: process.env.CLOUDINARY_API_KEY!,
            api_secret: process.env.CLOUDINARY_API_SECRET!,
          })
          const resource = await cloudinary.api.resource(`qr-previews/qr-${qrCodeId}-preview`)
          return NextResponse.redirect(resource.secure_url, 302)
        } catch (error: any) {
          if (error?.http_code === 404) {
            return NextResponse.json({ error: 'Preview not found' }, { status: 404 })
          }
          console.warn(`[QR Preview API] Cloudinary error for QR ${qrCodeId}:`, error)
          return NextResponse.json({ error: 'Preview not found' }, { status: 404 })
        }
      } else if (USE_VERCEL_BLOB) {
        // 使用 Vercel Blob Storage
        const blobName = `qr-previews/qr-${qrCodeId}-preview.png`
        try {
          const blob = await head(blobName)
          return NextResponse.redirect(blob.url, 302)
        } catch (error: any) {
          if (error?.statusCode === 404) {
            return NextResponse.json({ error: 'Preview not found' }, { status: 404 })
          }
          console.warn(`[QR Preview API] Blob Storage error for QR ${qrCodeId}:`, error)
          return NextResponse.json({ error: 'Preview not found' }, { status: 404 })
        }
      } else {
        // 降级到本地文件系统
        const previewPath = path.join(PREVIEWS_DIR, `qr-${qrCodeId}-preview.png`)
        try {
          await fs.access(previewPath)
          const fileUrl = `/qr-previews/qr-${qrCodeId}-preview.png`
          return NextResponse.redirect(new URL(fileUrl, request.url), 302)
        } catch {
          return NextResponse.json({ error: 'Preview not found' }, { status: 404 })
        }
      }
    }
  } catch (error) {
    console.error('Error getting preview URL:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

