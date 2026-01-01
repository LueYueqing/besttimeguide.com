import React from 'react'
import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer'

// PDF 样式
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginBottom: 10,
    color: '#1a1a1a',
  },
  meta: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 10,
    textAlign: 'center' as const,
  },
  featured: {
    fontSize: 10,
    fontWeight: 'bold' as const,
    color: '#06c',
    marginBottom: 15,
    textAlign: 'center' as const,
  },
  descriptionBox: {
    backgroundColor: '#f0f7ff',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  description: {
    fontSize: 10,
    color: '#333333',
    lineHeight: 1.5,
  },
  h1: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
    marginTop: 20,
    marginBottom: 10,
  },
  h2: {
    fontSize: 15,
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
    marginTop: 15,
    marginBottom: 8,
  },
  h3: {
    fontSize: 13,
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
    marginTop: 12,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.6,
    marginBottom: 10,
    textAlign: 'justify' as const,
  },
  list: {
    fontSize: 10,
    lineHeight: 1.6,
    marginBottom: 5,
    paddingLeft: 20,
  },
  blockquote: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#06c',
    fontStyle: 'italic',
    fontSize: 10,
  },
  image: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 10,
    objectFit: 'contain' as const,
  },
  tagContainer: {
    marginTop: 10,
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    padding: '4 8',
    borderRadius: 3,
    fontSize: 8,
    marginRight: 5,
    marginBottom: 5,
    color: '#555555',
  },
  footer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 9,
    color: '#666666',
    textAlign: 'center' as const,
    marginBottom: 5,
  },
  qrCode: {
    width: 50,
    height: 50,
    alignSelf: 'center' as const,
    marginTop: 10,
  },
  pageNumber: {
    position: 'absolute' as const,
    bottom: 15,
    right: 30,
    fontSize: 8,
    color: '#999999',
  },
})

interface PdfDocumentProps {
  article: any
  qrCodeData: string
}

// 解析 Markdown 为 PDF 元素
function parseMarkdownToElements(markdown: string): React.ReactNode[] {
  const elements: React.ReactNode[] = []
  
  // 简单的 markdown 解析
  const lines = markdown.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // 标题
    if (trimmed.startsWith('# ')) {
      const text = trimmed.substring(2)
      elements.push(<Text key={elements.length} style={styles.h1}>{text}</Text>)
    } else if (trimmed.startsWith('## ')) {
      const text = trimmed.substring(3)
      elements.push(<Text key={elements.length} style={styles.h2}>{text}</Text>)
    } else if (trimmed.startsWith('### ')) {
      const text = trimmed.substring(4)
      elements.push(<Text key={elements.length} style={styles.h3}>{text}</Text>)
    }
    // 图片 markdown
    else if (trimmed.startsWith('![')) {
      const imgMatch = trimmed.match(/!\[.*?\]\((.*?)\)/)
      if (imgMatch && imgMatch[1]) {
        // 将相对路径转换为完整的绝对 URL
        let imageUrl = imgMatch[1]
        if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
          // 使用环境变量配置的域名，如果没有则使用默认域名
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://besttimeguide.com'
          imageUrl = imageUrl.startsWith('/') ? `${baseUrl}${imageUrl}` : `${baseUrl}/${imageUrl}`
        }
        elements.push(
          <Image key={elements.length} src={imageUrl} style={styles.image} />
        )
      }
    }
    // 列表
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const text = trimmed.substring(2)
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`(.*?)`/g, '$1')
        .replace(/&nbsp;/g, ' ')
        .replace(/"/g, '"')
        .replace(/'/g, "'")
        .replace(/&#39;/g, "'")
        .replace(/&/g, '&')
        .trim()

      if (text) {
        elements.push(
          <Text key={elements.length} style={styles.list}>• {text}</Text>
        )
      }
    }
    // 引用
    else if (trimmed.startsWith('> ')) {
      const text = trimmed.substring(2).trim()
      if (text) {
        elements.push(
          <View key={elements.length} style={styles.blockquote}>
            <Text>"{text}"</Text>
          </View>
        )
      }
    }
    // 段落
    else {
      const text = trimmed
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/`(.*?)`/g, '$1')
        .replace(/&nbsp;/g, ' ')
        .replace(/"/g, '"')
        .replace(/'/g, "'")
        .replace(/&#39;/g, "'")
        .replace(/&/g, '&')
        .trim()

      if (text) {
        elements.push(
          <Text key={elements.length} style={styles.paragraph}>{text}</Text>
        )
      }
    }
  }

  return elements
}

// 格式化日期
function formatDate(date: string | Date | null): string {
  if (!date) return 'Date not available'
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'Date not available'
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// PDF 文档组件
export const PdfDocument: React.FC<PdfDocumentProps> = ({ article, qrCodeData }) => {
  const contentElements = parseMarkdownToElements(article.content || '')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 标题 */}
        <Text style={styles.title}>{article.title}</Text>

        {/* 元信息 */}
        <Text style={styles.meta}>
          By {article.author?.name || 'Unknown'}
          {article.readingTime && article.readingTime > 0 ? ` • ${article.readingTime} min read` : ''}
          {' • '}
          {formatDate(article.publishedAt)}
        </Text>

        {article.featured && (
          <Text style={styles.featured}>★ Featured Article</Text>
        )}

        {/* 描述 */}
        {article.description && (
          <View style={styles.descriptionBox}>
            <Text style={styles.description}>{article.description}</Text>
          </View>
        )}

        {/* 内容 */}
        {contentElements}

        {/* 标签 */}
        {Array.isArray(article.tags) && article.tags.length > 0 && (
          <View style={styles.tagContainer}>
            {article.tags.map((tag: string, index: number) => (
              <Text key={index} style={styles.tag}>
                {tag}
              </Text>
            ))}
          </View>
        )}

        {/* 页脚 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Scan QR code to view this article online</Text>
          <Text style={styles.footerText}>{`https://besttimeguide.com/${article.slug}`}</Text>
          <Text style={styles.footerText}>Generated from besttimeguide.com</Text>
          <Text style={styles.footerText}>Category: {article.category?.name || 'General'}</Text>
          <Image src={qrCodeData} style={styles.qrCode} />
        </View>

        {/* 页码 */}
        <Text style={styles.pageNumber} render={({ pageNumber }) => `Page ${pageNumber}`} fixed />
      </Page>
    </Document>
  )
}
