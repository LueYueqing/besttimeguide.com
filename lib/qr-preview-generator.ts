/**
 * QR Code Preview Generator
 * 生成二维码预览图并保存
 * 
 * 支持多种存储方式（自动选择，按优先级）：
 * - 开发环境：本地文件系统（优先）> Cloudinary（如果配置了）
 * - 生产环境：Cloudinary（如果配置了）> Vercel Blob Storage > 本地文件系统
 */

import { promises as fs } from 'fs'
import path from 'path'
import QRCode from 'qrcode'
import sharp from 'sharp'
import { getTemplateById } from './qr-frames'
import { combineQRWithFrameServer } from './qr-frames/server'
import { put, del, head } from '@vercel/blob'

const PREVIEWS_DIR = path.join(process.cwd(), 'public', 'qr-previews')
const PREVIEW_SIZE = 160 // 预览图尺寸（160x160px，列表显示80x80，2倍分辨率保证清晰度）

// 检测环境
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'
const IS_VERCEL = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined
const USE_CLOUDINARY = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
)
const USE_VERCEL_BLOB = IS_VERCEL && !!process.env.BLOB_READ_WRITE_TOKEN

/**
 * 确保预览图目录存在（仅在本地文件系统模式）
 */
async function ensurePreviewsDir() {
  try {
    await fs.access(PREVIEWS_DIR)
    return true
  } catch {
    try {
      await fs.mkdir(PREVIEWS_DIR, { recursive: true })
      return true
    } catch {
      return false
    }
  }
}

/**
 * 上传到 Cloudinary
 */
async function uploadToCloudinary(pngBuffer: Buffer, qrCodeId: number): Promise<string> {
  try {
    const cloudinary = await import('cloudinary').then(m => m.v2)
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
      api_key: process.env.CLOUDINARY_API_KEY!,
      api_secret: process.env.CLOUDINARY_API_SECRET!,
    })

    return new Promise((resolve) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'qr-previews',
          public_id: `qr-${qrCodeId}-preview`,
          resource_type: 'image',
          format: 'png',
          overwrite: true,
        },
        (error, result) => {
          if (error) {
            console.warn(`[QR Preview] Cloudinary upload failed for QR ${qrCodeId}:`, error)
            resolve(getPreviewUrl(qrCodeId)) // 降级
          } else if (result) {
            console.log(`[QR Preview] Uploaded to Cloudinary: ${result.secure_url} for QR ${qrCodeId}`)
            resolve(result.secure_url) // 返回 Cloudinary URL
          } else {
            resolve(getPreviewUrl(qrCodeId)) // 降级
          }
        }
      )
      uploadStream.end(pngBuffer)
    })
  } catch (error) {
    console.warn(`[QR Preview] Cloudinary error for QR ${qrCodeId}:`, error)
    return getPreviewUrl(qrCodeId) // 降级
  }
}

/**
 * 保存到本地文件系统
 */
async function saveToLocalFileSystem(pngBuffer: Buffer, qrCodeId: number): Promise<string> {
  const dirExists = await ensurePreviewsDir()
  if (!dirExists) {
    console.warn(`[QR Preview] Cannot create preview directory, skipping file generation for QR ${qrCodeId}`)
    return getPreviewUrl(qrCodeId)
  }

  const previewPath = path.join(PREVIEWS_DIR, `qr-${qrCodeId}-preview.png`)
  await fs.writeFile(previewPath, pngBuffer)
  console.log(`[QR Preview] Saved to file system: ${previewPath} for QR ${qrCodeId}`)
  return getPreviewUrl(qrCodeId)
}

/**
 * 获取预览图URL（用于前端显示）
 */
export function getPreviewUrl(qrCodeId: number): string {
  // 使用 API 路由统一处理（支持所有存储方式）
  return `/api/qr-previews/${qrCodeId}`
}

/**
 * 生成二维码预览图
 * @param qrCodeId 二维码ID
 * @param content 二维码内容（URL或文本）
 * @param frameTemplateId 框架模板ID（可选）
 */
export async function generateQRPreview(
  qrCodeId: number,
  content: string,
  frameTemplateId: string | null = null
): Promise<string> {
  try {
    // 确定二维码尺寸
    let qrSize = 400
    if (frameTemplateId) {
      const template = getTemplateById(frameTemplateId)
      if (template) {
        if (template.qrSize) {
          qrSize = template.qrSize
        } else {
          const placeholderSize = Math.min(template.placeholder.width, template.placeholder.height)
          qrSize = Math.max(200, Math.min(800, Math.floor(placeholderSize * 1.2)))
        }
      }
    }

    // 生成二维码SVG
    const qrCodeSVG = await QRCode.toString(content, {
      type: 'svg',
      width: qrSize,
      margin: frameTemplateId ? 1 : 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })

    // 如果选择了框架，组合框架和二维码
    let finalSVG = qrCodeSVG
    if (frameTemplateId) {
      try {
        finalSVG = await combineQRWithFrameServer(qrCodeSVG, frameTemplateId)
      } catch (error) {
        console.error(`Error combining frame for QR ${qrCodeId}:`, error)
        // 如果框架组合失败，使用普通二维码
      }
    }

    // 将SVG转换为PNG
    const svgBuffer = Buffer.from(finalSVG, 'utf-8')
    const pngBuffer = await sharp(svgBuffer)
      .resize(PREVIEW_SIZE, PREVIEW_SIZE, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png()
      .toBuffer()

    // 根据环境选择存储方式
    // 开发环境：优先使用本地文件系统
    // 生产环境：优先使用 Cloudinary
    if (IS_DEVELOPMENT) {
      // 开发环境：优先使用本地文件系统
      const dirExists = await ensurePreviewsDir()
      if (!dirExists) {
        console.warn(`[QR Preview] Cannot create preview directory, skipping file generation for QR ${qrCodeId}`)
        // 如果本地存储失败，尝试 Cloudinary（如果配置了）
        if (USE_CLOUDINARY) {
          return uploadToCloudinary(pngBuffer, qrCodeId)
        }
        return getPreviewUrl(qrCodeId)
      }

      const previewPath = path.join(PREVIEWS_DIR, `qr-${qrCodeId}-preview.png`)
      await fs.writeFile(previewPath, pngBuffer)
      console.log(`[QR Preview] Saved to file system: ${previewPath} for QR ${qrCodeId}`)
      return getPreviewUrl(qrCodeId)
    } else {
      // 生产环境：优先使用 Cloudinary
      if (USE_CLOUDINARY) {
        return uploadToCloudinary(pngBuffer, qrCodeId)
      } else if (USE_VERCEL_BLOB) {
        // 使用 Vercel Blob Storage
        try {
          const blobName = `qr-previews/qr-${qrCodeId}-preview.png`
          const blob = await put(blobName, pngBuffer, {
            access: 'public',
            contentType: 'image/png',
            addRandomSuffix: false,
          })
          console.log(`[QR Preview] Uploaded to Blob Storage: ${blob.url} for QR ${qrCodeId}`)
          return blob.url
        } catch (error) {
          console.warn(`[QR Preview] Blob Storage failed for QR ${qrCodeId}:`, error)
          // 降级到本地文件系统
          return saveToLocalFileSystem(pngBuffer, qrCodeId)
        }
      } else {
        // 降级到本地文件系统
        return saveToLocalFileSystem(pngBuffer, qrCodeId)
      }
    }
  } catch (error) {
    console.error(`Error generating preview for QR ${qrCodeId}:`, error)
    // 不抛出错误，让前端回退到实时生成
    return getPreviewUrl(qrCodeId)
  }
}

/**
 * 删除预览图
 */
export async function deleteQRPreview(qrCodeId: number): Promise<void> {
  try {
    if (IS_DEVELOPMENT) {
      // 开发环境：删除本地文件
      const previewPath = path.join(PREVIEWS_DIR, `qr-${qrCodeId}-preview.png`)
      try {
        await fs.unlink(previewPath)
        console.log(`[QR Preview] Deleted from file system: ${previewPath}`)
      } catch (error: any) {
        if (error?.code !== 'ENOENT') {
          console.warn(`[QR Preview] Error deleting from file system for QR ${qrCodeId}:`, error)
        }
      }
      // 如果配置了 Cloudinary，也尝试删除（可能之前上传过）
      if (USE_CLOUDINARY) {
        try {
          const cloudinary = await import('cloudinary').then(m => m.v2)
          cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
            api_key: process.env.CLOUDINARY_API_KEY!,
            api_secret: process.env.CLOUDINARY_API_SECRET!,
          })
          await cloudinary.uploader.destroy(`qr-previews/qr-${qrCodeId}-preview`)
          console.log(`[QR Preview] Deleted from Cloudinary: qr-${qrCodeId}-preview`)
        } catch (error: any) {
          if (error?.http_code !== 404) {
            console.warn(`[QR Preview] Error deleting from Cloudinary for QR ${qrCodeId}:`, error)
          }
        }
      }
    } else {
      // 生产环境：优先删除 Cloudinary
      if (USE_CLOUDINARY) {
        try {
          const cloudinary = await import('cloudinary').then(m => m.v2)
          cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
            api_key: process.env.CLOUDINARY_API_KEY!,
            api_secret: process.env.CLOUDINARY_API_SECRET!,
          })
          await cloudinary.uploader.destroy(`qr-previews/qr-${qrCodeId}-preview`)
          console.log(`[QR Preview] Deleted from Cloudinary: qr-${qrCodeId}-preview`)
        } catch (error: any) {
          if (error?.http_code !== 404) {
            console.warn(`[QR Preview] Error deleting from Cloudinary for QR ${qrCodeId}:`, error)
          }
        }
      } else if (USE_VERCEL_BLOB) {
        // 删除 Vercel Blob Storage 中的文件
        try {
          const blobName = `qr-previews/qr-${qrCodeId}-preview.png`
          await del(blobName)
          console.log(`[QR Preview] Deleted from Blob Storage: ${blobName}`)
        } catch (error: any) {
          if (error?.statusCode !== 404) {
            console.warn(`[QR Preview] Error deleting from Blob Storage for QR ${qrCodeId}:`, error)
          }
        }
      } else {
        // 删除本地文件
        const previewPath = path.join(PREVIEWS_DIR, `qr-${qrCodeId}-preview.png`)
        try {
          await fs.unlink(previewPath)
          console.log(`[QR Preview] Deleted from file system: ${previewPath}`)
        } catch (error: any) {
          if (error?.code !== 'ENOENT') {
            console.warn(`[QR Preview] Error deleting from file system for QR ${qrCodeId}:`, error)
          }
        }
      }
    }
  } catch (error: any) {
    // 文件不存在时忽略错误
    if (error?.code !== 'ENOENT' && error?.http_code !== 404 && error?.statusCode !== 404) {
      console.warn(`[QR Preview] Error deleting preview for QR ${qrCodeId}:`, error)
    }
  }
}

/**
 * 检查预览图是否存在
 */
export async function previewExists(qrCodeId: number): Promise<boolean> {
  try {
    if (IS_DEVELOPMENT) {
      // 开发环境：检查本地文件
      const previewPath = path.join(PREVIEWS_DIR, `qr-${qrCodeId}-preview.png`)
      try {
        await fs.access(previewPath)
        return true
      } catch {
        return false
      }
    } else {
      // 生产环境：优先检查 Cloudinary
      if (USE_CLOUDINARY) {
        try {
          const cloudinary = await import('cloudinary').then(m => m.v2)
          cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
            api_key: process.env.CLOUDINARY_API_KEY!,
            api_secret: process.env.CLOUDINARY_API_SECRET!,
          })
          await cloudinary.api.resource(`qr-previews/qr-${qrCodeId}-preview`)
          return true
        } catch {
          return false
        }
      } else if (USE_VERCEL_BLOB) {
        // 检查 Vercel Blob Storage 中的文件
        try {
          const blobName = `qr-previews/qr-${qrCodeId}-preview.png`
          await head(blobName)
          return true
        } catch {
          return false
        }
      } else {
        // 检查本地文件
        const previewPath = path.join(PREVIEWS_DIR, `qr-${qrCodeId}-preview.png`)
        try {
          await fs.access(previewPath)
          return true
        } catch {
          return false
        }
      }
    }
  } catch {
    return false
  }
}
