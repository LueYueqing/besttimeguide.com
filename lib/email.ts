import nodemailer from 'nodemailer'

// Email configuration interface
interface EmailConfig {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
}

// Create transporter based on environment
function createTransporter() {
  // Helper to clean password (remove spaces from Google App Password)
  const cleanPassword = (password?: string) => {
    if (!password) return ''
    // Remove all spaces from password (Google App Passwords are displayed with spaces)
    return password.replace(/\s+/g, '')
  }

  // Option 1: Gmail SMTP (recommended for Google email)
  if (process.env.EMAIL_SMTP_HOST === 'smtp.gmail.com') {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: cleanPassword(process.env.EMAIL_PASSWORD), // Gmail App Password (automatically removes spaces)
      },
    })
  }

  // Option 2: Custom SMTP (for Google Workspace or other providers)
  if (process.env.EMAIL_SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_SMTP_HOST,
      port: parseInt(process.env.EMAIL_SMTP_PORT || '587'),
      secure: process.env.EMAIL_SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: cleanPassword(process.env.EMAIL_PASSWORD),
      },
    })
  }

  // Option 3: Resend (recommended for production - simpler and more reliable)
  if (process.env.RESEND_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 587,
      secure: false,
      auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY,
      },
    })
  }

  // Fallback: Development mode - log emails instead of sending
  return nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true,
  })
}

// Get default sender email
function getDefaultSender(): string {
  // Priority:
  // 1. Custom sender from env
  // 2. Email user (if using SMTP)
  // 3. Default fallback
  return (
    process.env.EMAIL_FROM ||
    process.env.EMAIL_USER ||
    'javajia@gmail.com'
  )
}

// Send email function
export async function sendEmail(config: EmailConfig): Promise<boolean> {
  try {
    const transporter = createTransporter()
    const from = config.from || getDefaultSender()

    // In development, log the email instead of sending
    if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
      console.log('📧 Email (Development Mode - not sent):')
      console.log('From:', from)
      console.log('To:', config.to)
      console.log('Subject:', config.subject)
      console.log('Body:', config.text || config.html)
      return true
    }

    // Check if email configuration is missing
    if (!process.env.EMAIL_USER && !process.env.RESEND_API_KEY) {
      console.error('❌ Email configuration missing! Please set EMAIL_USER and EMAIL_PASSWORD (or RESEND_API_KEY)')
      console.error('📧 Email would have been sent:')
      console.error('  From:', from)
      console.error('  To:', config.to)
      console.error('  Subject:', config.subject)
      return false
    }

    const info = await transporter.sendMail({
      from: `CustomQR.pro <${from}>`, // Format: "Name <email@domain.com>"
      to: config.to,
      subject: config.subject,
      text: config.text || config.html.replace(/<[^>]*>/g, ''), // Plain text version
      html: config.html,
    })

    console.log('✅ Email sent successfully:', info.messageId)
    console.log('  From:', from)
    console.log('  To:', config.to)
    console.log('  Subject:', config.subject)
    return true
  } catch (error: any) {
    console.error('❌ Error sending email:')
    console.error('  To:', config.to)
    console.error('  Subject:', config.subject)
    console.error('  Error:', error.message || error)
    if (error.response) {
      console.error('  Response:', error.response)
    }
    if (error.code) {
      console.error('  Error Code:', error.code)
    }
    return false
  }
}

// Send contact form notification to admin
export async function sendContactNotification(data: {
  name: string
  email: string
  subject: string
  message: string
  category: string
}): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL || 'javajia@gmail.com'
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #2563eb; }
          .value { margin-top: 5px; padding: 10px; background: white; border-radius: 4px; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Contact Form Submission</h1>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Name:</div>
              <div class="value">${data.name}</div>
            </div>
            <div class="field">
              <div class="label">Email:</div>
              <div class="value"><a href="mailto:${data.email}">${data.email}</a></div>
            </div>
            <div class="field">
              <div class="label">Category:</div>
              <div class="value">${data.category}</div>
            </div>
            <div class="field">
              <div class="label">Subject:</div>
              <div class="value">${data.subject}</div>
            </div>
            <div class="field">
              <div class="label">Message:</div>
              <div class="value">${data.message.replace(/\n/g, '<br>')}</div>
            </div>
          </div>
          <div class="footer">
            <p>This email was sent from the CustomQR.pro contact form.</p>
            <p>Timestamp: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: adminEmail,
    subject: `[Contact Form] ${data.subject}`,
    html,
  })
}

// Send auto-reply to user
export async function sendContactAutoReply(userEmail: string, userName: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You for Contacting Us!</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Thank you for reaching out to CustomQR.pro. We've received your message and our team will get back to you within 24 hours during business days.</p>
            <p>In the meantime, you might find these resources helpful:</p>
            <ul>
              <li><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/help/faq">Frequently Asked Questions</a></li>
              <li><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/blog">Blog & Guides</a></li>
              <li><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/docs/api">API Documentation</a></li>
            </ul>
            <p>If you have any urgent questions, feel free to reply to this email.</p>
            <p>Best regards,<br>${process.env.NEXT_PUBLIC_APP_NAME || 'Your App'} Team</p>
          </div>
          <div class="footer">
            <p>${process.env.NEXT_PUBLIC_APP_NAME || 'Your App'}</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}">Visit our website</a> | <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/help/contact">Contact us</a></p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: userEmail,
    subject: 'Thank you for contacting CustomQR.pro',
    html,
  })
}

