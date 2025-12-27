/**
 * IndexNow Integration
 * 实时通知搜索引擎（Bing、Google、Yandex等）有新内容更新
 * 
 * 官方文档: https://www.indexnow.org/
 */

const INDEXNOW_ENDPOINT = 'https://www.indexnow.org/indexnow'

export interface IndexNowResponse {
  success: boolean
  error?: string
  message?: string
}

/**
 * 提交单个URL到IndexNow
 * @param url 需要提交的完整URL
 * @returns 提交结果
 */
export async function submitToIndexNow(url: string): Promise<IndexNowResponse> {
  try {
    const key = process.env.INDEXNOW_KEY
    
    if (!key) {
      console.warn('[IndexNow] INDEXNOW_KEY not configured, skipping submission')
      return { 
        success: false, 
        error: 'INDEXNOW_KEY not configured' 
      }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://besttimeguide.com'
    
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host: new URL(siteUrl).hostname,
        key: key,
        urlList: [url],
      }),
    })

    if (response.ok) {
      console.log(`[IndexNow] Successfully submitted: ${url}`)
      return { 
        success: true, 
        message: `URL submitted successfully: ${url}` 
      }
    } else {
      const errorText = await response.text()
      console.error(`[IndexNow] Failed to submit ${url}:`, errorText)
      return { 
        success: false, 
        error: `HTTP ${response.status}: ${errorText}` 
      }
    }
  } catch (error) {
    console.error('[IndexNow] Error submitting URL:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * 批量提交多个URL到IndexNow
 * @param urls 需要提交的URL数组
 * @returns 提交结果
 */
export async function submitBatchToIndexNow(urls: string[]): Promise<IndexNowResponse> {
  if (urls.length === 0) {
    return { success: true, message: 'No URLs to submit' }
  }

  try {
    const key = process.env.INDEXNOW_KEY
    
    if (!key) {
      console.warn('[IndexNow] INDEXNOW_KEY not configured, skipping submission')
      return { 
        success: false, 
        error: 'INDEXNOW_KEY not configured' 
      }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://besttimeguide.com'
    
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host: new URL(siteUrl).hostname,
        key: key,
        urlList: urls,
      }),
    })

    if (response.ok) {
      console.log(`[IndexNow] Successfully submitted ${urls.length} URLs`)
      return { 
        success: true, 
        message: `Successfully submitted ${urls.length} URLs` 
      }
    } else {
      const errorText = await response.text()
      console.error(`[IndexNow] Failed to submit batch:`, errorText)
      return { 
        success: false, 
        error: `HTTP ${response.status}: ${errorText}` 
      }
    }
  } catch (error) {
    console.error('[IndexNow] Error submitting batch:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * 生成IndexNow验证密钥
 * @returns 随机生成的32字符十六进制密钥
 */
export function generateIndexNowKey(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * 创建IndexNow验证文件内容
 * @param key IndexNow密钥
 * @returns 验证文件内容
 */
export function createIndexNowKeyFile(key: string): string {
  return key
}
