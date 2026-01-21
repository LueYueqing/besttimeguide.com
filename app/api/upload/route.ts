import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { uploadBufferToR2 } from '@/lib/r2'
import { prisma } from '@/lib/prisma'
import sharp from 'sharp'

// WebP 转换配置
const ENABLE_WEBP_CONVERSION = process.env.ENABLE_WEBP_CONVERSION !== 'false'
const WEBP_QUALITY = parseInt(process.env.WEBP_QUALITY || '80', 10)

async function checkAdmin() {
    const session = await auth()
    if (!session?.user?.id) return false
    const userId = parseInt(session.user.id as string, 10)
    if (isNaN(userId)) return false
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { isAdmin: true } })
    return user?.isAdmin ?? false
}

export async function POST(request: NextRequest) {
    try {
        const isAdmin = await checkAdmin()
        if (!isAdmin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const shouldResize = searchParams.get('resize') === 'true'

        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
        }

        let buffer = Buffer.from(await file.arrayBuffer())
        const contentType = file.type || 'application/octet-stream'

        // If resize requested and is an image
        if (shouldResize && contentType.startsWith('image/')) {
            try {
                let sharpInstance = sharp(buffer).resize(375, 250, {
                    fit: 'cover',
                    position: 'center'
                })

                // 应用 WebP 转换（如果启用且不是 SVG）
                let finalContentType = contentType

                if (ENABLE_WEBP_CONVERSION && contentType !== 'image/svg+xml') {
                    try {
                        // 获取原始图片信息
                        const metadata = await sharp(buffer).metadata()

                        if (metadata.format && metadata.format !== 'webp' && metadata.format !== 'svg') {
                            // console.log(`[Upload] Converting cover image from ${metadata.format} to WebP...`)

                            // 转换为 WebP
                            const webpBuffer = Buffer.from(await sharpInstance.webp({
                                quality: WEBP_QUALITY,
                                effort: 4
                            }).toBuffer())

                            buffer = webpBuffer
                            finalContentType = 'image/webp'

                            // 计算压缩率
                            const compressionRatio = ((buffer.length - webpBuffer.length) / buffer.length * 100).toFixed(1)
                            // console.log(`[Upload] WebP conversion complete. Compression ratio: ${compressionRatio}%`)
                        } else {
                            buffer = Buffer.from(await sharpInstance.toBuffer())
                        }
                    } catch (processError) {
                        console.error('[Upload] WebP conversion failed, using resized image:', processError)
                        buffer = Buffer.from(await sharpInstance.toBuffer())
                    }
                } else {
                    buffer = Buffer.from(await sharpInstance.toBuffer())
                }

                // 更新 content type（如果转换为 WebP）
                if (finalContentType === 'image/webp') {
                    // 在 fileName 中添加 .webp 扩展名
                }
            } catch (err) {
                console.error('Sharp processing failed:', err)
                // Fallback to original buffer if processing fails
            }
        } else {
            // 如果不需要缩放，仍然尝试转换为 WebP（如果启用）
            if (ENABLE_WEBP_CONVERSION && contentType.startsWith('image/') && contentType !== 'image/svg+xml') {
                try {
                    const metadata = await sharp(buffer).metadata()

                    if (metadata.format && metadata.format !== 'webp' && metadata.format !== 'svg') {
                        // console.log(`[Upload] Converting cover image from ${metadata.format} to WebP...`)

                        const webpBuffer = Buffer.from(await sharp(buffer).webp({
                            quality: WEBP_QUALITY,
                            effort: 4
                        }).toBuffer())

                        const compressionRatio = ((buffer.length - webpBuffer.length) / buffer.length * 100).toFixed(1)
                        // console.log(`[Upload] WebP conversion complete. Compression ratio: ${compressionRatio}%`)

                        buffer = webpBuffer
                    }
                } catch (processError) {
                    console.error('[Upload] WebP conversion failed:', processError)
                }
            }
        }

        // Generate a safe unique filename
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-')
        let fileName = `upload-${Date.now()}-${sanitizedName}`

        // 如果是 WebP，确保文件扩展名是 .webp
        if (ENABLE_WEBP_CONVERSION && contentType.startsWith('image/') && contentType !== 'image/svg+xml') {
            const extMatch = fileName.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
            if (extMatch && extMatch[1].toLowerCase() !== 'svg') {
                fileName = fileName.replace(/\.[^.]+$/, '.webp')
            }
        }

        // 使用正确的 content type（如果转换为 WebP）
        const finalContentType = ENABLE_WEBP_CONVERSION &&
            contentType.startsWith('image/') &&
            contentType !== 'image/svg+xml' &&
            fileName.endsWith('.webp')
            ? 'image/webp'
            : contentType

        const result = await uploadBufferToR2(buffer, fileName, finalContentType)
        const url = typeof result === 'string' ? result : result.r2Url

        return NextResponse.json({ success: true, url })
    } catch (error: any) {
        console.error('Upload failed:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
