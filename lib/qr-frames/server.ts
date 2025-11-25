/**
 * Server-side QR Frame utilities
 * 服务器端二维码框架工具函数（使用 @xmldom/xmldom）
 */

import { promises as fs } from 'fs'
import path from 'path'
import { DOMParser, XMLSerializer } from '@xmldom/xmldom'
import { getTemplateById, QRFrameTemplate } from './index'

/**
 * 从文件系统加载SVG模板内容（服务器端）
 */
export async function loadTemplateSVGFromFile(templateId: string): Promise<string> {
  const template = getTemplateById(templateId)
  if (!template) {
    throw new Error(`Template ${templateId} not found`)
  }
  
  const svgPath = path.join(process.cwd(), 'public', 'qr-frames', 'svg', template.svgFile)
  try {
    return await fs.readFile(svgPath, 'utf-8')
  } catch (error) {
    console.error(`Error loading template SVG from file: ${svgPath}`, error)
    throw error
  }
}

/**
 * 组合二维码和框架（服务器端版本）
 */
export async function combineQRWithFrameServer(
  qrCodeSVG: string,
  templateId: string
): Promise<string> {
  const template = getTemplateById(templateId)
  if (!template) {
    throw new Error(`Template ${templateId} not found`)
  }

  // 从文件系统加载框架SVG
  const frameSVG = await loadTemplateSVGFromFile(templateId)
  
  // 解析框架SVG（使用 @xmldom/xmldom）
  const parser = new DOMParser()
  const frameDoc = parser.parseFromString(frameSVG, 'image/svg+xml')
  
  // 获取占位区域信息（完全使用模板配置）
  const placeholderX = template.placeholder.x
  const placeholderY = template.placeholder.y
  const placeholderWidth = template.placeholder.width
  const placeholderHeight = template.placeholder.height
  
  // 查找占位区域（如果存在，用于定位插入位置）
  const placeholder = frameDoc.getElementById('qr-placeholder')
  let insertParent: Element = frameDoc.getElementsByTagName('svg')[0]
  let insertBefore: Node | null = null
  
  if (placeholder) {
    insertParent = placeholder.parentNode as Element || insertParent
    insertBefore = placeholder.nextSibling
  }
  
  // 解析二维码SVG
  const qrDoc = parser.parseFromString(qrCodeSVG, 'image/svg+xml')
  const qrSvg = qrDoc.getElementsByTagName('svg')[0]
  if (!qrSvg) {
    throw new Error('Invalid QR code SVG')
  }
  
  // 获取二维码尺寸
  const qrViewBox = qrSvg.getAttribute('viewBox')?.split(' ') || ['0', '0', '200', '200']
  const qrWidth = parseFloat(qrViewBox[2])
  const qrHeight = parseFloat(qrViewBox[3])
  
  // 计算缩放比例
  const marginRatio = template.qrScale ?? 0.95
  
  const sizeDiff = Math.abs(qrWidth - placeholderWidth) + Math.abs(qrHeight - placeholderHeight)
  let scale: number
  
  if (sizeDiff < 50 && marginRatio >= 0.98) {
    scale = Math.min(placeholderWidth / qrWidth, placeholderHeight / qrHeight) * marginRatio
  } else {
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
    if (child.nodeType === 1) { // ELEMENT_NODE
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
    placeholder.parentNode?.removeChild(placeholder)
  }
  
  // 获取最终的SVG
  const finalSvg = frameDoc.getElementsByTagName('svg')[0]
  if (!finalSvg) {
    throw new Error('Failed to generate final SVG')
  }
  
  return new XMLSerializer().serializeToString(finalSvg)
}

