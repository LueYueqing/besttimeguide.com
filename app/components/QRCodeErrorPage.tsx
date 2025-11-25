'use client'

interface QRCodeErrorPageProps {
  type: 'expired' | 'limit_reached' | 'time_restricted' | 'not_found'
  message?: string
}

export default function QRCodeErrorPage({ type, message }: QRCodeErrorPageProps) {
  const getErrorContent = () => {
    switch (type) {
      case 'expired':
        return {
          title: 'QR Code Expired',
          icon: '⏰',
          description: message || 'This QR code is no longer active. The scheduled period has ended.',
        }
      case 'limit_reached':
        return {
          title: 'Scan Limit Reached',
          icon: '🚫',
          description: message || 'This QR code has reached its maximum scan limit and is no longer accessible.',
        }
      case 'time_restricted':
        return {
          title: 'Not Available Now',
          icon: '🕐',
          description: message || 'This QR code is only available during specific hours. Please try again later.',
        }
      case 'not_found':
        return {
          title: 'QR Code Not Found',
          icon: '❌',
          description: message || 'The QR code you are looking for does not exist or has been removed.',
        }
      default:
        return {
          title: 'Access Denied',
          icon: '⚠️',
          description: message || 'This QR code is not currently accessible.',
        }
    }
  }

  const content = getErrorContent()

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">{content.icon}</div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-3">{content.title}</h1>
        <p className="text-neutral-600 mb-6">{content.description}</p>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-700"
        >
          Go to Homepage
        </a>
      </div>
    </div>
  )
}

