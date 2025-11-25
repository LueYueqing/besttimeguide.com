'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function ScanQRClient() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState<boolean | null>(null)
  const [hasCamera, setHasCamera] = useState<boolean | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const html5QrCodeRef = useRef<any>(null) // 保存 Html5Qrcode 实例
  const router = useRouter()

  // 检查浏览器是否支持摄像头（不主动检查设备，只在用户点击时检查）
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      const supported = navigator.mediaDevices && 
        typeof navigator.mediaDevices.getUserMedia === 'function'
      setIsSupported(supported ?? false)
      // 不主动检查摄像头设备，让用户点击按钮时再检查
      setHasCamera(null)
    } catch (err) {
      setIsSupported(false)
      setHasCamera(null)
    }
  }, [])

  // 请求摄像头权限并开始扫描
  const startScanning = async () => {
    // 确保在客户端环境
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      setError('Please refresh the page and try again.')
      return
    }

    if (!isSupported) {
      setError('Your browser does not support camera access. Please use a modern browser like Chrome, Firefox, or Safari.')
      return
    }

    try {
      setError(null)
      setScanning(true)

      // 动态加载QR码扫描库 - 确保在客户端
      // 使用动态导入避免SSR问题
      const html5QrcodeModule = await import('html5-qrcode')
      const { Html5Qrcode } = html5QrcodeModule
      
      // 确保DOM元素存在
      const elementId = 'qr-reader'
      const element = document.getElementById(elementId)
      if (!element) {
        setError('Scanner element not found. Please refresh the page.')
        setScanning(false)
        return
      }

      // 确保navigator.mediaDevices在正确的上下文中
      if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
        setError('Camera API not available. Please use a modern browser.')
        setScanning(false)
        return
      }

      const html5QrCode = new Html5Qrcode(elementId)
      html5QrCodeRef.current = html5QrCode // 保存实例引用

      // 尝试获取摄像头列表，如果失败则使用facingMode
      let cameraDeviceId: string | null = null
      
      try {
        const devices = await Html5Qrcode.getCameras()
        if (devices && devices.length > 0) {
          // 优先使用后置摄像头
          const backCamera = devices.find((device: any) => 
            device.label?.toLowerCase().includes('back') || 
            device.label?.toLowerCase().includes('rear') ||
            device.label?.toLowerCase().includes('environment')
          )
          cameraDeviceId = backCamera?.id || devices[0]?.id || null
        }
      } catch (camErr) {
        // 如果获取摄像头列表失败，使用默认配置
        console.log('Could not get camera list, will use facingMode:', camErr)
        cameraDeviceId = null
      }

      // 启动摄像头的辅助函数
      const startCamera = async (config: string | { facingMode: string }) => {
        return html5QrCode.start(
          config,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            // 扫描成功
            handleScanSuccess(decodedText)
            html5QrCode.stop().then(() => {
              setScanning(false)
              html5QrCodeRef.current = null
            }).catch(() => {})
          },
          (errorMessage) => {
            // 扫描中，忽略错误（这些是正常的扫描过程错误）
          }
        )
      }

      // 尝试启动摄像头：先尝试设备ID，失败则回退到facingMode
      try {
        if (cameraDeviceId) {
          try {
            await startCamera(cameraDeviceId)
          } catch (deviceErr: any) {
            // 如果设备ID失败（NotFoundError），回退到facingMode
            if (deviceErr.name === 'NotFoundError' || deviceErr.message?.includes('device not found')) {
              console.log('Device ID failed, falling back to facingMode:', deviceErr)
              await startCamera({ facingMode: 'environment' })
            } else {
              throw deviceErr // 重新抛出其他错误
            }
          }
        } else {
          // 直接使用facingMode
          await startCamera({ facingMode: 'environment' })
        }
      } catch (err: any) {
        console.error('Failed to start QR scanner:', err)
        setScanning(false)
        html5QrCodeRef.current = null
        
        // 根据错误类型显示不同的提示信息
        if (err.name === 'NotAllowedError' || err.message?.includes('permission')) {
          setError('Camera permission denied. Please allow camera access to scan QR codes.')
        } else if (err.name === 'NotFoundError' || err.message?.includes('camera') || err.message?.includes('device not found')) {
          // 没有摄像头时，设置为无摄像头状态并显示友好提示
          setHasCamera(false)
          setError('No camera detected on your device. Please use the upload or paste option instead.')
        } else if (err.message?.includes('Illegal invocation')) {
          setError('Camera access error. Please refresh the page and try again.')
        } else {
          // 其他错误也尝试设置为无摄像头状态
          setHasCamera(false)
          setError('Unable to access camera. Please use the upload or paste option instead.')
        }
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err)
      setScanning(false)
      html5QrCodeRef.current = null
      
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access to scan QR codes.')
      } else if (err.name === 'NotFoundError' || err.message?.includes('camera') || err.message?.includes('device not found')) {
        // 没有摄像头时，设置为无摄像头状态并显示友好提示
        setHasCamera(false)
        setError('No camera detected on your device. Please use the upload or paste option instead.')
      } else if (err.message?.includes('Illegal invocation')) {
        setError('Camera access error. Please refresh the page and try again.')
      } else {
        // 其他错误也尝试设置为无摄像头状态
        setHasCamera(false)
        setError('Unable to access camera. Please use the upload or paste option instead.')
      }
    }
  }

  // 停止扫描
  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop()
        html5QrCodeRef.current = null
      } catch (err) {
        // 如果扫描器已停止，忽略错误
        console.log('Scanner already stopped')
      }
    }
    setScanning(false)
  }

  // 处理扫描成功
  const handleScanSuccess = (decodedText: string) => {
    setResult(decodedText)
    stopScanning()
    
    // 根据内容类型执行相应操作
    handleQRCodeContent(decodedText)
  }

  // 处理QR码内容
  const handleQRCodeContent = (content: string) => {
    // 检查是否是URL
    if (content.startsWith('http://') || content.startsWith('https://')) {
      // 可以询问用户是否要打开链接
      if (confirm(`Open this URL?\n\n${content}`)) {
        window.open(content, '_blank')
      }
    }
    // 检查是否是WiFi连接
    else if (content.startsWith('WIFI:')) {
      // WiFi连接信息
      const wifiInfo = parseWifiQR(content)
      alert(`WiFi Network:\nSSID: ${wifiInfo.ssid}\nPassword: ${wifiInfo.password}\nSecurity: ${wifiInfo.security}`)
    }
    // 其他类型（文本、电话、邮件等）
    else {
      // 显示内容
      alert(`QR Code Content:\n\n${content}`)
    }
  }

  // 解析WiFi QR码
  const parseWifiQR = (content: string) => {
    const parts = content.replace('WIFI:', '').split(';')
    const info: any = {}
    parts.forEach(part => {
      const [key, value] = part.split(':')
      if (key && value) {
        info[key.toLowerCase()] = value
      }
    })
    return {
      ssid: info.s || info.ssid || 'Unknown',
      password: info.p || info.pass || '',
      security: info.t || info.type || 'WPA'
    }
  }

  // 从文件扫描二维码
  const scanFromFile = async (file: File) => {
    if (!file) return

    try {
      setError(null)
      setUploading(true)

      console.log('[QR Scanner] Starting file scan:', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      })

      // 动态加载QR码扫描库
      const html5QrcodeModule = await import('html5-qrcode')
      const { Html5Qrcode } = html5QrcodeModule

      // 创建一个临时容器元素（如果不存在）
      let tempContainer = document.getElementById('temp-scanner')
      if (!tempContainer) {
        tempContainer = document.createElement('div')
        tempContainer.id = 'temp-scanner'
        tempContainer.style.display = 'none'
        tempContainer.style.width = '1px'
        tempContainer.style.height = '1px'
        tempContainer.style.position = 'absolute'
        tempContainer.style.overflow = 'hidden'
        document.body.appendChild(tempContainer)
      }

      // 创建一个临时实例用于扫描文件
      const html5QrCode = new Html5Qrcode('temp-scanner')
      
      console.log('[QR Scanner] Html5Qrcode instance created, scanning file...')
      
      // 使用 scanFile 方法
      // 第二个参数 false 表示不显示图片，true 表示显示（有助于调试）
      // 对于 v2.3.8，scanFile 的签名是: scanFile(file: File, showImage?: boolean): Promise<string>
      let decodedText: string
      try {
        // 先尝试不显示图片的模式（更快）
        decodedText = await html5QrCode.scanFile(file, false)
        console.log('[QR Scanner] Scan successful (showImage=false)')
      } catch (scanError: any) {
        console.error('[QR Scanner] First scan attempt failed:', scanError)
        // 如果第一次失败，尝试显示图片模式（可能有助于某些情况）
        console.log('[QR Scanner] Retrying with showImage=true...')
        try {
          decodedText = await html5QrCode.scanFile(file, true)
          console.log('[QR Scanner] Scan successful (showImage=true)')
        } catch (retryError: any) {
          console.error('[QR Scanner] Retry also failed:', retryError)
          throw retryError // 重新抛出错误，让外层 catch 处理
        }
      }

      console.log('[QR Scanner] Scan result:', decodedText)

      if (decodedText && decodedText.trim()) {
        handleScanSuccess(decodedText.trim())
      } else {
        setError('No QR code found in the image. Please make sure the image contains a clear QR code.')
      }
    } catch (err: any) {
      console.error('[QR Scanner] Error scanning from file:', {
        error: err,
        message: err?.message,
        name: err?.name,
        stack: err?.stack,
      })
      
      // 更详细的错误处理
      const errorMessage = err?.message || String(err) || 'Unknown error'
      
      if (errorMessage.includes('No QR code found') || 
          errorMessage.includes('not found') ||
          errorMessage.includes('QR code parse error') ||
          errorMessage.includes('Exception decoding QRCode')) {
        setError('No QR code found in the image. Please make sure:\n• The image contains a clear, complete QR code\n• The QR code is not too small or blurry\n• The image has good contrast')
      } else if (errorMessage.includes('file type') || errorMessage.includes('format')) {
        setError('Invalid file type. Please upload a valid image file (PNG, JPG, etc.).')
      } else if (errorMessage.includes('FileReader') || errorMessage.includes('read')) {
        setError('Failed to read the image file. Please try uploading the image again.')
      } else {
        // 显示更详细的错误信息（开发环境）
        const isDev = process.env.NODE_ENV === 'development'
        setError(
          isDev 
            ? `Failed to scan QR code: ${errorMessage}. Please check the browser console for more details.`
            : 'Failed to scan QR code from image. Please try another image or make sure the QR code is clear and complete.'
        )
      }
    } finally {
      setUploading(false)
    }
  }

  // 处理文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file (PNG, JPG, etc.).')
        return
      }
      scanFromFile(file)
    }
    // 重置文件输入，允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 处理粘贴图片
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        console.log('[QR Scanner] Paste detected, image type:', item.type)
        
        const file = item.getAsFile()
        if (file) {
          console.log('[QR Scanner] File from paste:', {
            name: file.name || 'pasted-image',
            type: file.type,
            size: file.size,
          })
          scanFromFile(file)
        } else {
          // 如果 getAsFile() 返回 null，尝试使用 Blob
          item.getAsString((str) => {
            console.log('[QR Scanner] Got string from paste, trying to convert...')
          })
        }
        return
      }
    }
  }

  // 重新扫描
  const resetScan = () => {
    setResult(null)
    setError(null)
    setHasCamera(null) // 重置摄像头状态，允许用户再次尝试
    // 不自动启动摄像头，让用户选择使用上传还是摄像头
  }

  // 清理
  useEffect(() => {
    return () => {
      // 组件卸载时停止扫描
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {})
        html5QrCodeRef.current = null
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-100">
      {/* 简洁的标题区域 */}
      <section className="section bg-transparent pt-12 pb-4">
        <div className="container">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-2">
              Scan QR Code
            </h1>
            <p className="text-neutral-600">
              Paste or upload a QR code image to scan instantly
            </p>
          </div>
        </div>
      </section>

      {/* Scan Section */}
      <section className="section bg-transparent py-4">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            
            {/* 浏览器支持检查 */}
            {isSupported === false && (
              <div className="card p-6 bg-warning-50 border border-warning-200 mb-6">
                <h3 className="text-lg font-semibold text-warning-900 mb-2">
                  Browser Not Supported
                </h3>
                <p className="text-warning-700">
                  Your browser does not support camera access. Please use a modern browser like Chrome, Firefox, or Safari.
                </p>
              </div>
            )}


            {/* 错误提示 - 仅显示真正的错误（如权限问题） */}
            {error && (
              <div className="card p-6 bg-error-50 border border-error-200 mb-6">
                <h3 className="text-lg font-semibold text-error-900 mb-2">
                  Error
                </h3>
                <p className="text-error-700 mb-4">{error}</p>
                {error.includes('permission') && (
                  <button
                    onClick={startScanning}
                    className="btn btn-primary"
                  >
                    Try Again
                  </button>
                )}
              </div>
            )}

            {/* 扫描区域 */}
            {!result && (
              <div className="card p-8 max-w-2xl mx-auto" onPaste={handlePaste}>
                {!scanning && !uploading ? (
                  <div className="text-center">
                    <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-16 h-16 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    </div>
                    
                    <div className="space-y-4">
                      {/* 主要功能：粘贴/上传图片 */}
                      <div className="space-y-3">
                        <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-4 mb-4">
                          <p className="text-sm font-medium text-primary-900 mb-2">
                            💡 Quick Tip: Paste an image directly (Ctrl+V / Cmd+V)
                          </p>
                          <p className="text-xs text-primary-700">
                            Simply copy a QR code image and paste it here to scan instantly!
                          </p>
                        </div>
                        
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="qr-file-input"
                        />
                        <label
                          htmlFor="qr-file-input"
                          className="btn btn-primary btn-lg w-full cursor-pointer flex items-center justify-center gap-2"
                        >
                          <span>📁</span>
                          Upload QR Code Image
                        </label>
                        <p className="text-xs text-center text-neutral-500">
                          Or paste an image from clipboard (Ctrl+V / Cmd+V)
                        </p>
                      </div>

                      {/* 摄像头扫描按钮 - 放在上传按钮附近 */}
                      {isSupported !== false && (
                        <div className="space-y-2">
                          <button
                            onClick={startScanning}
                            className="btn btn-secondary btn-lg w-full"
                            disabled={isSupported === false}
                          >
                            <span>📷</span>
                            Use Camera Scanner
                          </button>
                          <p className="text-xs text-center text-neutral-500">
                            Scan QR codes with your device camera
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : scanning ? (
                  <div>
                    <div id="qr-reader" className="mb-4" style={{ width: '100%', minHeight: '300px' }}></div>
                    <div className="text-center">
                      <p className="text-sm text-neutral-600 mb-4">
                        Point your camera at a QR code
                      </p>
                      <button
                        onClick={stopScanning}
                        className="btn btn-secondary"
                      >
                        Stop Scanning
                      </button>
                    </div>
                  </div>
                ) : uploading ? (
                  <div className="text-center">
                    <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-16 h-16 text-primary-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <p className="text-neutral-600">Scanning QR code from image...</p>
                  </div>
                ) : null}
              </div>
            )}


            {/* 扫描结果 */}
            {result && (
              <div className="card p-8 max-w-2xl mx-auto">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                    QR Code Scanned!
                  </h2>
                </div>

                <div className="bg-neutral-50 p-4 rounded-lg mb-6">
                  <label className="text-sm font-medium text-neutral-700 mb-2 block">
                    Content:
                  </label>
                  <div className="break-all text-neutral-900 font-mono text-sm">
                    {result}
                  </div>
                </div>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={resetScan}
                    className="btn btn-primary"
                  >
                    <span>🔄</span>
                    Scan Another
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result)
                      alert('Copied to clipboard!')
                    }}
                    className="btn btn-secondary"
                  >
                    <span>📋</span>
                    Copy
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* 详细说明内容区域 */}
      <section className="section bg-white">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            
            {/* 使用教程 */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">How to Scan QR Codes</h2>
              <div className="card p-8">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-neutral-900 mb-2">Click "Start Scanning"</h3>
                      <p className="text-neutral-600">
                        Click the "Start Scanning" button above to activate your device camera. The scanner will request permission to access your camera.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-neutral-900 mb-2">Allow Camera Permission</h3>
                      <p className="text-neutral-600">
                        When prompted, click "Allow" to grant camera access. This is required for the scanner to work. Your camera feed is processed locally and never recorded or stored.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-neutral-900 mb-2">Point Camera at QR Code</h3>
                      <p className="text-neutral-600">
                        Position the QR code within the scanning frame. Make sure the QR code is clearly visible and well-lit. The scanner will automatically detect and decode the QR code.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-neutral-900 mb-2">View Results</h3>
                      <p className="text-neutral-600">
                        Once scanned, the QR code content will be displayed. For URLs, you can open them directly. For WiFi codes, connection details will be shown. For other types, the content will be displayed for you to use.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 功能特点 */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Why Use Our QR Code Scanner?</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="card p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">🌐</div>
                    <div>
                      <h3 className="font-semibold text-lg text-neutral-900 mb-2">Works in Browser</h3>
                      <p className="text-neutral-600">
                        No app download required. Scan QR codes directly in your web browser on desktop or mobile devices.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">🔒</div>
                    <div>
                      <h3 className="font-semibold text-lg text-neutral-900 mb-2">Privacy First</h3>
                      <p className="text-neutral-600">
                        All scanning happens locally in your browser. No data is sent to our servers, ensuring complete privacy.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">⚡</div>
                    <div>
                      <h3 className="font-semibold text-lg text-neutral-900 mb-2">Instant Scanning</h3>
                      <p className="text-neutral-600">
                        Fast and accurate QR code detection. Works with all standard QR code formats including URLs, text, WiFi, and more.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">📱</div>
                    <div>
                      <h3 className="font-semibold text-lg text-neutral-900 mb-2">Mobile Friendly</h3>
                      <p className="text-neutral-600">
                        Optimized for mobile devices. Works seamlessly on smartphones and tablets with front or back cameras.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 支持的QR码类型 */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Supported QR Code Types</h2>
              <div className="card p-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg text-neutral-900 mb-4">Standard Types</h3>
                    <ul className="space-y-3 text-neutral-600">
                      <li className="flex items-center gap-2">
                        <span className="text-primary-600">✓</span>
                        <span>Website URLs - Open links instantly</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-primary-600">✓</span>
                        <span>Plain Text - Read messages and notes</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-primary-600">✓</span>
                        <span>WiFi Networks - Connect to networks automatically</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-primary-600">✓</span>
                        <span>Phone Numbers - Make calls with one tap</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-neutral-900 mb-4">Advanced Types</h3>
                    <ul className="space-y-3 text-neutral-600">
                      <li className="flex items-center gap-2">
                        <span className="text-primary-600">✓</span>
                        <span>Email Addresses - Compose emails quickly</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-primary-600">✓</span>
                        <span>SMS Messages - Send texts instantly</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-primary-600">✓</span>
                        <span>Business Cards - Save contact information</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-primary-600">✓</span>
                        <span>Location Coordinates - Open in maps</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* 常见问题 */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <div className="card p-6">
                  <h3 className="font-semibold text-lg text-neutral-900 mb-2">
                    Do I need to download an app to scan QR codes?
                  </h3>
                  <p className="text-neutral-600">
                    No! Our QR code scanner works directly in your web browser. No app installation required. Just open this page and start scanning.
                  </p>
                </div>

                <div className="card p-6">
                  <h3 className="font-semibold text-lg text-neutral-900 mb-2">
                    Is my camera data secure?
                  </h3>
                  <p className="text-neutral-600">
                    Yes, absolutely. All scanning happens locally in your browser. We never access, store, or transmit your camera feed. Your privacy is completely protected.
                  </p>
                </div>

                <div className="card p-6">
                  <h3 className="font-semibold text-lg text-neutral-900 mb-2">
                    What browsers are supported?
                  </h3>
                  <p className="text-neutral-600">
                    Our scanner works on all modern browsers including Chrome, Firefox, Safari, and Edge. Make sure you're using the latest version for the best experience.
                  </p>
                </div>

                <div className="card p-6">
                  <h3 className="font-semibold text-lg text-neutral-900 mb-2">
                    Can I scan QR codes from a screenshot or image?
                  </h3>
                  <p className="text-neutral-600">
                    Yes! You can upload an image file containing a QR code, or simply paste an image from your clipboard (Ctrl+V / Cmd+V). This is especially useful if you don't have a camera or want to scan QR codes from screenshots or downloaded images.
                  </p>
                </div>

                <div className="card p-6">
                  <h3 className="font-semibold text-lg text-neutral-900 mb-2">
                    Why isn't my camera working?
                  </h3>
                  <p className="text-neutral-600">
                    Make sure you've granted camera permissions when prompted. Also check that no other app is using your camera. If issues persist, try refreshing the page or using a different browser.
                  </p>
                </div>
              </div>
            </div>

            {/* 相关工具 */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Create Your Own QR Codes</h2>
              <div className="card p-8 bg-gradient-to-br from-primary-50 to-primary-100">
                <p className="text-neutral-700 mb-6">
                  Need to create QR codes? Use our free QR code generator to create custom QR codes for URLs, WiFi, business cards, and more.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a href="/" className="btn btn-primary">
                    <span>🎯</span>
                    Create QR Code
                  </a>
                  <a href="/url-qr-code-generator" className="btn btn-secondary">
                    <span>🔗</span>
                    URL Generator
                  </a>
                  <a href="/wifi-qr-code-generator" className="btn btn-secondary">
                    <span>📶</span>
                    WiFi Generator
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

