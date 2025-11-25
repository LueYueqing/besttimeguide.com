import templatesConfig from './templates.json'

export interface QRFrameTemplate {
  id: string
  name: string
  category: string
  description: string
  svgFile: string
  preview?: string
  placeholder: {
    x: number
    y: number
    width: number
    height: number
  }
  qrSize?: number // 自定义二维码生成尺寸（可选，如果不设置则根据占位区域自动计算 = placeholder.width × 1.2，确保清晰度）
  qrScale?: number // 二维码在占位区域中的缩放比例（可选，默认0.95，即使用95%的空间）
  tags: string[]
}

export interface QRFrameConfig {
  templateId: string | null
  enabled: boolean
}

// 获取所有模板
export function getAllTemplates(): QRFrameTemplate[] {
  return templatesConfig as QRFrameTemplate[]
}

// 根据ID获取模板
export function getTemplateById(id: string): QRFrameTemplate | undefined {
  return templatesConfig.find(t => t.id === id) as QRFrameTemplate | undefined
}

// 根据分类获取模板
export function getTemplatesByCategory(category: string): QRFrameTemplate[] {
  return templatesConfig.filter(t => t.category === category) as QRFrameTemplate[]
}

// 加载SVG模板内容
export async function loadTemplateSVG(templateId: string): Promise<string> {
  const template = getTemplateById(templateId)
  if (!template) {
    throw new Error(`Template ${templateId} not found`)
  }
  
  try {
    const response = await fetch(`/qr-frames/svg/${template.svgFile}`)
    if (!response.ok) {
      throw new Error(`Failed to load SVG: ${response.statusText}`)
    }
    return await response.text()
  } catch (error) {
    console.error('Error loading template SVG:', error)
    throw error
  }
}

// 组合二维码和框架
export async function combineQRWithFrame(
  qrCodeSVG: string,
  templateId: string
): Promise<string> {
  const template = getTemplateById(templateId)
  if (!template) {
    throw new Error(`Template ${templateId} not found`)
  }

  // 加载框架SVG
  const frameSVG = await loadTemplateSVG(templateId)
  
  // 解析框架SVG
  const parser = new DOMParser()
  const frameDoc = parser.parseFromString(frameSVG, 'image/svg+xml')
  
  // 获取占位区域信息（完全使用模板配置，不依赖SVG中的占位符）
  // 这样可以支持没有占位符的原始SVG，完全通过templates.json配置
  const placeholderX = template.placeholder.x
  const placeholderY = template.placeholder.y
  const placeholderWidth = template.placeholder.width
  const placeholderHeight = template.placeholder.height
  
  // 查找占位区域（如果存在，用于定位插入位置；如果不存在，直接插入到SVG根元素）
  const placeholder = frameDoc.getElementById('qr-placeholder')
  let insertParent: Element = frameDoc.querySelector('svg')!
  let insertBefore: Node | null = null
  
  if (placeholder) {
    // 如果SVG中有占位符，在占位符位置插入
    insertParent = placeholder.parentElement || frameDoc.querySelector('svg')!
    insertBefore = placeholder.nextSibling
    // 移除占位符（后面会移除）
  } else {
    // 如果没有占位符，直接插入到SVG根元素
    // 找到最后一个元素作为插入参考
    const svg = frameDoc.querySelector('svg')
    if (svg) {
      insertParent = svg
      // 插入到所有现有元素之后
      insertBefore = null
    }
  }
  
  // 调试日志（开发环境）
  if (process.env.NODE_ENV === 'development') {
    console.log('[QR Frame] Using template config:', {
      templateId: template.id,
      placeholder: { x: placeholderX, y: placeholderY, width: placeholderWidth, height: placeholderHeight },
      qrSize: template.qrSize,
      qrScale: template.qrScale,
      hasPlaceholderInSVG: !!placeholder
    })
  }
  
  // 解析二维码SVG
  const qrDoc = parser.parseFromString(qrCodeSVG, 'image/svg+xml')
  const qrSvg = qrDoc.querySelector('svg')
  if (!qrSvg) {
    throw new Error('Invalid QR code SVG')
  }
  
  // 获取二维码尺寸
  const qrViewBox = qrSvg.getAttribute('viewBox')?.split(' ') || ['0', '0', '200', '200']
  const qrWidth = parseFloat(qrViewBox[2])
  const qrHeight = parseFloat(qrViewBox[3])
  
  // 计算缩放比例（使用模板配置的缩放比例，或默认95%）
  const marginRatio = template.qrScale ?? 0.95
  
  // 如果二维码尺寸和占位区域尺寸接近，直接使用1:1缩放
  const sizeDiff = Math.abs(qrWidth - placeholderWidth) + Math.abs(qrHeight - placeholderHeight)
  let scale: number
  
  if (sizeDiff < 50 && marginRatio >= 0.98) {
    // 尺寸非常接近且缩放比例很大，使用精确匹配
    scale = Math.min(placeholderWidth / qrWidth, placeholderHeight / qrHeight) * marginRatio
  } else {
    // 正常缩放计算
    const scaleX = (placeholderWidth * marginRatio) / qrWidth
    const scaleY = (placeholderHeight * marginRatio) / qrHeight
    scale = Math.min(scaleX, scaleY)
  }
  
  // 计算居中位置
  const scaledWidth = qrWidth * scale
  const scaledHeight = qrHeight * scale
  const offsetX = placeholderX + (placeholderWidth - scaledWidth) / 2
  const offsetY = placeholderY + (placeholderHeight - scaledHeight) / 2
  
  // 创建二维码组
  const qrGroup = frameDoc.createElementNS('http://www.w3.org/2000/svg', 'g')
  qrGroup.setAttribute('transform', `translate(${offsetX}, ${offsetY}) scale(${scale})`)
  
  // 复制二维码内容到组中
  const qrChildren = Array.from(qrSvg.childNodes)
  for (const child of qrChildren) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const importedNode = frameDoc.importNode(child, true)
      qrGroup.appendChild(importedNode)
    }
  }
  
  // 插入二维码到指定位置
  if (insertBefore) {
    insertParent.insertBefore(qrGroup, insertBefore)
  } else {
    insertParent.appendChild(qrGroup)
  }
  
  // 如果存在占位符元素，移除它
  if (placeholder) {
    placeholder.remove()
  }
  
  // 获取最终的SVG
  const finalSvg = frameDoc.querySelector('svg')
  if (!finalSvg) {
    throw new Error('Failed to generate final SVG')
  }
  
  return new XMLSerializer().serializeToString(finalSvg)
}

