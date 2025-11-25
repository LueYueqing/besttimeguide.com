'use client'

import dynamic from 'next/dynamic'

// 动态导入，禁用SSR，避免Illegal invocation错误
const ScanQRClient = dynamic(() => import('./scan-client'), {
  ssr: false,
  loading: () => (
    <section className="section bg-transparent py-16">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          <div className="card p-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-16 h-16 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <p className="text-neutral-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  ),
})

export default function ScanQRWrapper() {
  return <ScanQRClient />
}

