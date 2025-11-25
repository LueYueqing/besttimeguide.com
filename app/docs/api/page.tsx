import type { Metadata } from 'next'
import Navigation from '../../../components/Navigation'
import Footer from '../../../components/Footer'

export const metadata: Metadata = {
  title: 'API Documentation',
  description: 'Complete RESTful API documentation. Integrate our platform into your applications with our powerful API.',
  keywords: 'QR code API, QR generator API, RESTful API, QR code integration, API documentation, bulk QR generation API',
  alternates: {
    canonical: '/docs/api',
  },
}

export default function APIDocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-100">
      <Navigation />

      {/* Hero Section */}
      <section className="hero hero-bg">
        <div className="hero-container text-center">
          <h1 className="hero-title fade-in-up">
            API Documentation<br />
            <span className="text-gradient">Developer Resources</span>
          </h1>
          
          <p className="hero-subtitle fade-in-up">
            Integrate our platform into your applications with our powerful RESTful API. 
            Access analytics, manage resources, and automate workflows programmatically.
          </p>
        </div>
      </section>

      {/* Getting Started */}
      <section className="section bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="section-header">
              <h2 className="section-title">Getting Started</h2>
              <p className="section-subtitle">
                Get up and running with our API in minutes
              </p>
            </div>

            <div className="card p-8 mb-8">
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">API Base URL</h3>
              <div className="bg-neutral-900 text-white p-4 rounded-lg font-mono text-sm mb-4">
                {process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api
              </div>
              <p className="text-neutral-700 mb-6">
                All API requests must be made to this base URL. You'll need an API key from your Professional account dashboard.
              </p>

              <h3 className="text-xl font-bold text-neutral-900 mb-4">Authentication</h3>
              <p className="text-neutral-700 mb-4">
                Include your API key in the request header:
              </p>
              <div className="bg-neutral-900 text-white p-4 rounded-lg font-mono text-sm">
                <div className="text-neutral-400">Authorization: Bearer YOUR_API_KEY</div>
              </div>
            </div>

            <div className="card p-8 bg-primary-50 border border-primary-200">
              <h3 className="text-xl font-bold text-primary-900 mb-4 flex items-center gap-2">
                <span>💡</span>
                Get Your API Key
              </h3>
              <p className="text-primary-800 mb-4">
                API access is available for Professional plan subscribers. Sign up for $4.99/month and get unlimited API calls.
              </p>
              <a href="/pricing" className="btn bg-primary-600 text-white hover:bg-primary-700">
                View Pricing Plans
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section className="section bg-neutral-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="section-header">
              <h2 className="section-title">API Endpoints</h2>
              <p className="section-subtitle">
                Complete reference for all available endpoints
              </p>
            </div>

            {/* Generate QR Code */}
            <div className="card p-8 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-success-600 text-white px-3 py-1 rounded text-sm font-bold">POST</span>
                <h3 className="text-2xl font-bold text-neutral-900">Generate QR Code</h3>
              </div>
              <div className="bg-neutral-900 text-white p-4 rounded-lg font-mono text-sm mb-4">
                /qr-codes
              </div>
              <p className="text-neutral-700 mb-6">
                Create a new QR code with custom design options.
              </p>

              <h4 className="text-lg font-bold text-neutral-900 mb-3">Request Body</h4>
              <div className="bg-neutral-900 text-white p-4 rounded-lg font-mono text-xs mb-4 overflow-x-auto">
                <pre>{JSON.stringify({
                  type: 'url',
                  data: 'https://example.com',
                  config: {
                    color: {
                      dark: '#000000',
                      light: '#ffffff'
                    },
                    width: 800,
                    errorCorrectionLevel: 'M'
                  }
                }, null, 2)}</pre>
              </div>

              <h4 className="text-lg font-bold text-neutral-900 mb-3">Response</h4>
              <div className="bg-neutral-900 text-white p-4 rounded-lg font-mono text-xs overflow-x-auto">
                <pre>{JSON.stringify({
                  success: true,
                  data: {
                    id: 'qr_abc123',
                    resourceUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/resource/res_abc123`,
                    downloadUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/resource/res_abc123/download`,
                    createdAt: '2025-10-29T10:00:00Z'
                  }
                }, null, 2)}</pre>
              </div>
            </div>

            {/* List QR Codes */}
            <div className="card p-8 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-primary-600 text-white px-3 py-1 rounded text-sm font-bold">GET</span>
                <h3 className="text-2xl font-bold text-neutral-900">List QR Codes</h3>
              </div>
              <div className="bg-neutral-900 text-white p-4 rounded-lg font-mono text-sm mb-4">
                /qr-codes
              </div>
              <p className="text-neutral-700 mb-4">
                Retrieve a list of all your QR codes with pagination support.
              </p>
              <div className="bg-neutral-900 text-white p-4 rounded-lg font-mono text-xs">
                <div className="text-neutral-400">Query Parameters:</div>
                <div>?page=1&limit=20&type=url</div>
              </div>
            </div>

            {/* Get QR Code Analytics */}
            <div className="card p-8 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-primary-600 text-white px-3 py-1 rounded text-sm font-bold">GET</span>
                <h3 className="text-2xl font-bold text-neutral-900">Get QR Code Analytics</h3>
              </div>
              <div className="bg-neutral-900 text-white p-4 rounded-lg font-mono text-sm mb-4">
                /qr-codes/{'{id}'}/analytics
              </div>
              <p className="text-neutral-700">
                Get detailed scan statistics for a specific QR code including scan count, geographic data, and device information.
              </p>
            </div>

            {/* Batch Generate */}
            <div className="card p-8 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-success-600 text-white px-3 py-1 rounded text-sm font-bold">POST</span>
                <h3 className="text-2xl font-bold text-neutral-900">Batch Generate QR Codes</h3>
              </div>
              <div className="bg-neutral-900 text-white p-4 rounded-lg font-mono text-sm mb-4">
                /qr-codes/batch
              </div>
              <p className="text-neutral-700 mb-4">
                Generate multiple QR codes at once from a CSV file or JSON array.
              </p>
              <div className="bg-neutral-900 text-white p-4 rounded-lg font-mono text-xs">
                <pre>{JSON.stringify({
                  items: [
                    { data: 'https://example.com/1', type: 'url' },
                    { data: 'https://example.com/2', type: 'url' }
                  ],
                  config: {
                    width: 800
                  }
                }, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="section bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="section-header">
              <h2 className="section-title">Code Examples</h2>
              <p className="section-subtitle">
                Quick start examples in popular languages
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* JavaScript */}
              <div className="card p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-4">JavaScript (Fetch)</h3>
                <div className="bg-neutral-900 text-white p-4 rounded-lg font-mono text-xs overflow-x-auto">
                  <pre>{`const response = await fetch(
  '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/resources',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'url',
      data: 'https://example.com'
    })
  }
);
const qrCode = await response.json();`}</pre>
                </div>
              </div>

              {/* Python */}
              <div className="card p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-4">Python (Requests)</h3>
                <div className="bg-neutral-900 text-white p-4 rounded-lg font-mono text-xs overflow-x-auto">
                  <pre>{`import requests

response = requests.post(
    '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/resources',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    json={
        'type': 'url',
        'data': 'https://example.com'
    }
)
qr_code = response.json()`}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rate Limits */}
      <section className="section bg-gradient-primary">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="section-header">
              <h2 className="section-title text-white">Rate Limits</h2>
              <p className="section-subtitle text-primary-100">
                API usage limits and quotas
              </p>
            </div>

            <div className="card p-8 bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Professional Plan</h3>
                  <ul className="space-y-3 text-primary-100">
                    <li className="flex items-center gap-3">
                      <span className="text-primary-300">✓</span>
                      <span>1000 requests per hour</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-primary-300">✓</span>
                      <span>Unlimited QR codes</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-primary-300">✓</span>
                      <span>Full API access</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Enterprise</h3>
                  <ul className="space-y-3 text-primary-100">
                    <li className="flex items-center gap-3">
                      <span className="text-primary-300">✓</span>
                      <span>Unlimited requests</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-primary-300">✓</span>
                      <span>Priority support</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-primary-300">✓</span>
                      <span>Custom SLA</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-black mb-6">
              Ready to Integrate?
            </h2>
            <p className="text-xl text-neutral-700 mb-8">
              Start using our API today. Get your API key from your Professional dashboard.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/pricing" className="btn bg-primary-600 text-white hover:bg-primary-700 btn-lg font-bold">
                <span>🚀</span>
                Get Started
              </a>
              <a href="/help/contact" className="btn btn-ghost text-neutral-700 border-neutral-300 hover:bg-neutral-100 btn-lg">
                <span>📞</span>
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer variant="full" />
    </div>
  )
}

