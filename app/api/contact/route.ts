import { NextRequest, NextResponse } from 'next/server'

// Rate limiting: simple in-memory store (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(ip)

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60 * 60 * 1000 }) // 1 hour
    return true
  }

  if (limit.count >= 5) {
    return false // Max 5 submissions per hour
  }

  limit.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'

    // Rate limiting check
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { name, email, subject, message, category } = body

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be filled.' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address.' },
        { status: 400 }
      )
    }

    // Basic spam detection (simple checks)
    const spamKeywords = ['viagra', 'casino', 'lottery', 'winner', 'click here']
    const messageLower = message.toLowerCase()
    if (spamKeywords.some(keyword => messageLower.includes(keyword))) {
      return NextResponse.json(
        { success: false, error: 'Message contains inappropriate content.' },
        { status: 400 }
      )
    }

    // Send email notifications
    const { sendContactNotification, sendContactAutoReply } = await import('@/lib/email')
    
    // Send notification to admin (don't fail if this fails)
    const adminEmail = process.env.ADMIN_EMAIL || 'javajia@gmail.com'
    console.log(`[Contact Form] Attempting to send notification to admin: ${adminEmail}`)
    
    const notificationSent = await sendContactNotification({
      name,
      email,
      category,
      subject,
      message,
    })

    if (!notificationSent) {
      console.error(`[Contact Form] Failed to send notification email to admin: ${adminEmail}`)
      console.error(`[Contact Form] Please check your email configuration (EMAIL_SMTP_HOST, EMAIL_USER, EMAIL_PASSWORD, ADMIN_EMAIL)`)
    } else {
      console.log(`[Contact Form] Successfully sent notification email to admin: ${adminEmail}`)
    }

    // Send auto-reply to user (don't fail if this fails - email might be invalid)
    const autoReplySent = await sendContactAutoReply(email, name)

    if (!autoReplySent) {
      console.warn(`[Contact Form] Failed to send auto-reply email to user: ${email}`)
    } else {
      console.log(`[Contact Form] Successfully sent auto-reply email to user: ${email}`)
    }

    // Log submission
    console.log('Contact form submission:', {
      name,
      email,
      category,
      subject,
      message,
      ip,
      timestamp: new Date().toISOString(),
      adminEmail,
      notificationSent,
      autoReplySent,
    })

    // Always return success even if emails fail
    // (email delivery failures shouldn't prevent form submission)
    // TODO: In production, also implement:
    // - Save to database (Prisma)
    // - Create support ticket (Intercom/Zendesk)

    return NextResponse.json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you within 24 hours.',
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}

