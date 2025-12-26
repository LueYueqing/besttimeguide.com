import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { uploadBufferToR2 } from '@/lib/r2'
import { PrismaClient } from '@prisma/client'
import sharp from 'sharp'

const prisma = new PrismaClient()

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
                buffer = await sharp(buffer)
                    .resize(375, 250, {
                        fit: 'cover',
                        position: 'center'
                    })
                    .toBuffer()
            } catch (err) {
                console.error('Sharp resizing failed:', err)
                // Fallback to original buffer if resize fails
            }
        }

        // Generate a safe unique filename
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-')
        const fileName = `upload-${Date.now()}-${sanitizedName}`

        const url = await uploadBufferToR2(buffer, fileName, contentType)

        return NextResponse.json({ success: true, url })
    } catch (error: any) {
        console.error('Upload failed:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
