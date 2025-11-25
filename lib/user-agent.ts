/**
 * User-Agent 解析工具
 * 从 User-Agent 字符串中提取操作系统、浏览器、设备类型等信息
 */

export interface DeviceInfo {
  os: string | null        // 操作系统: iOS, Android, Windows, macOS, Linux
  osVersion: string | null // 操作系统版本
  browser: string | null   // 浏览器: Chrome, Safari, Firefox, Edge
  browserVersion: string | null
  deviceType: string | null // 设备类型: mobile, tablet, desktop
  deviceBrand: string | null // 设备品牌: iPhone, Samsung, iPad, etc.
  deviceModel: string | null // 设备型号
}

export function parseUserAgent(userAgent: string): DeviceInfo {
  if (!userAgent) {
    return {
      os: null,
      osVersion: null,
      browser: null,
      browserVersion: null,
      deviceType: null,
      deviceBrand: null,
      deviceModel: null,
    }
  }

  const ua = userAgent.toLowerCase()
  
  // 检测设备类型
  const isMobile = /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
  const isTablet = /tablet|ipad|playbook|silk/i.test(userAgent) && !isMobile
  const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'

  // 检测操作系统
  let os: string | null = null
  let osVersion: string | null = null
  let deviceBrand: string | null = null
  let deviceModel: string | null = null

  // iOS
  if (/iphone|ipad|ipod/i.test(userAgent)) {
    os = 'iOS'
    const match = userAgent.match(/OS (\d+)[._](\d+)/i)
    if (match) {
      osVersion = `${match[1]}.${match[2]}`
    }
    if (/iphone/i.test(userAgent)) {
      deviceBrand = 'iPhone'
      // 尝试提取 iPhone 型号
      const modelMatch = userAgent.match(/iPhone\s*(?:OS\s*\d+[._]\d+)?[;\s]+([^;)]+)/i)
      if (modelMatch) {
        deviceModel = modelMatch[1].trim()
      }
    } else if (/ipad/i.test(userAgent)) {
      deviceBrand = 'iPad'
    } else if (/ipod/i.test(userAgent)) {
      deviceBrand = 'iPod'
    }
  }
  // Android
  else if (/android/i.test(userAgent)) {
    os = 'Android'
    const match = userAgent.match(/Android\s+([\d.]+)/i)
    if (match) {
      osVersion = match[1]
    }
    // 尝试提取设备品牌和型号
    const brandMatch = userAgent.match(/(?:^|[^a-z])(samsung|huawei|xiaomi|oppo|vivo|oneplus|google|motorola|lg|sony|nokia|realme|redmi|poco)(?:\s+([^;)]+))?/i)
    if (brandMatch) {
      deviceBrand = brandMatch[1].charAt(0).toUpperCase() + brandMatch[1].slice(1)
      if (brandMatch[2]) {
        deviceModel = brandMatch[2].trim()
      }
    }
    // 如果没有找到品牌，尝试从 Build 信息中提取
    if (!deviceBrand) {
      const buildMatch = userAgent.match(/Build\/([^;)]+)/i)
      if (buildMatch) {
        deviceModel = buildMatch[1].trim()
      }
    }
  }
  // Windows
  else if (/windows/i.test(userAgent)) {
    os = 'Windows'
    if (/Windows NT 10.0/i.test(userAgent)) {
      osVersion = '10'
    } else if (/Windows NT 6.3/i.test(userAgent)) {
      osVersion = '8.1'
    } else if (/Windows NT 6.2/i.test(userAgent)) {
      osVersion = '8'
    } else if (/Windows NT 6.1/i.test(userAgent)) {
      osVersion = '7'
    }
  }
  // macOS
  else if (/macintosh|mac os x/i.test(userAgent)) {
    os = 'macOS'
    const match = userAgent.match(/Mac OS X\s+([\d_]+)/i)
    if (match) {
      osVersion = match[1].replace(/_/g, '.')
    }
  }
  // Linux
  else if (/linux/i.test(userAgent)) {
    os = 'Linux'
  }

  // 检测浏览器
  let browser: string | null = null
  let browserVersion: string | null = null

  // Chrome (包括 Edge Chromium)
  if (/edg/i.test(userAgent)) {
    browser = 'Edge'
    const match = userAgent.match(/Edg\/([\d.]+)/i)
    if (match) {
      browserVersion = match[1]
    }
  } else if (/chrome/i.test(userAgent) && !/opr|opera/i.test(userAgent)) {
    browser = 'Chrome'
    const match = userAgent.match(/Chrome\/([\d.]+)/i)
    if (match) {
      browserVersion = match[1]
    }
  }
  // Safari
  else if (/safari/i.test(userAgent) && !/chrome|crios|fxios/i.test(userAgent)) {
    browser = 'Safari'
    const match = userAgent.match(/Version\/([\d.]+)/i)
    if (match) {
      browserVersion = match[1]
    }
  }
  // Firefox
  else if (/firefox|fxios/i.test(userAgent)) {
    browser = 'Firefox'
    const match = userAgent.match(/(?:Firefox|FxiOS)\/([\d.]+)/i)
    if (match) {
      browserVersion = match[1]
    }
  }
  // Opera
  else if (/opr|opera/i.test(userAgent)) {
    browser = 'Opera'
    const match = userAgent.match(/(?:OPR|Opera)\/([\d.]+)/i)
    if (match) {
      browserVersion = match[1]
    }
  }

  return {
    os,
    osVersion,
    browser,
    browserVersion,
    deviceType,
    deviceBrand,
    deviceModel,
  }
}

/**
 * 将设备信息格式化为字符串，用于存储到数据库
 * 格式: "OS: iOS 15.0 | Browser: Safari 15.0 | Device: iPhone 13"
 */
export function formatDeviceInfo(info: DeviceInfo): string {
  const parts: string[] = []
  
  if (info.os) {
    parts.push(`OS: ${info.os}${info.osVersion ? ` ${info.osVersion}` : ''}`)
  }
  if (info.browser) {
    parts.push(`Browser: ${info.browser}${info.browserVersion ? ` ${info.browserVersion}` : ''}`)
  }
  if (info.deviceBrand) {
    parts.push(`Device: ${info.deviceBrand}${info.deviceModel ? ` ${info.deviceModel}` : ''}`)
  }
  
  return parts.length > 0 ? parts.join(' | ') : info.deviceType || 'Unknown'
}

