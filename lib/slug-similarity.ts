/**
 * 将slug拆分为单词数组
 * 移除常见的停用词和连字符
 */
function extractWordsFromSlug(slug: string): string[] {
  // 移除特殊字符，只保留字母、数字和连字符
  const cleanedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '')
  
  // 按连字符拆分单词
  const words = cleanedSlug.split('-').filter(word => word.length > 0)
  
  // 过滤掉常见的停用词（这些词通常不提供太多语义信息）
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can',
    'best', 'time', 'visit', 'guide', 'when', 'what', 'how', 'why',
    'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them',
    'we', 'you', 'your', 'our', 'us', 'their', 'his', 'her', 'my',
    'about', 'after', 'all', 'also', 'any', 'because', 'before', 'between',
    'both', 'each', 'even', 'first', 'if', 'into', 'just', 'like', 'more',
    'most', 'much', 'new', 'now', 'only', 'other', 'over', 'same', 'such',
    'than', 'then', 'there', 'these', 'think', 'through', 'under', 'while',
    'year', 'years', 'month', 'months', 'day', 'days', 'week', 'weeks'
  ])
  
  return words.filter(word => !stopWords.has(word) && word.length > 1)
}

/**
 * 计算两个单词数组的相似度
 * 使用Jaccard相似度系数：交集 / 并集
 */
function calculateWordSimilarity(words1: string[], words2: string[]): number {
  if (words1.length === 0 && words2.length === 0) {
    return 0
  }
  
  const set1 = new Set(words1)
  const set2 = new Set(words2)
  
  const intersection = new Set([...set1].filter(word => set2.has(word)))
  const union = new Set([...set1, ...set2])
  
  if (union.size === 0) {
    return 0
  }
  
  return intersection.size / union.size
}

/**
 * 检查两个slug是否相似
 * @param slug1 - 第一个slug
 * @param slug2 - 第二个slug
 * @param threshold - 相似度阈值（默认0.8，即80%）
 * @returns 相似度百分比（0-1之间）
 */
export function checkSlugSimilarity(slug1: string, slug2: string, threshold: number = 0.8): number {
  const words1 = extractWordsFromSlug(slug1)
  const words2 = extractWordsFromSlug(slug2)
  
  // 如果两个slug提取的有效单词都很少（<=2个），提高相似度要求
  if (words1.length <= 2 && words2.length <= 2) {
    // 短slug需要更高的相似度才认为重复（90%）
    const adjustedThreshold = 0.9
    const similarity = calculateWordSimilarity(words1, words2)
    return similarity >= adjustedThreshold ? similarity : 0
  }
  
  const similarity = calculateWordSimilarity(words1, words2)
  return similarity >= threshold ? similarity : 0
}

/**
 * 从一组slug中找出与给定slug相似的所有slug
 * @param targetSlug - 要检查的slug
 * @param existingSlugs - 现有的slug数组（可以是字符串数组或包含slug属性的对象数组）
 * @param threshold - 相似度阈值（默认0.8）
 * @returns 相似的slug及其相似度
 */
export function findSimilarSlugs(
  targetSlug: string,
  existingSlugs: (string | { slug: string })[],
  threshold: number = 0.8
): Array<{ slug: string; similarity: number }> {
  const results: Array<{ slug: string; similarity: number }> = []
  
  for (const item of existingSlugs) {
    const existingSlug = typeof item === 'string' ? item : item.slug
    
    // 跳过完全相同的slug（这个应该在之前就被唯一性检查拦截了）
    if (existingSlug.toLowerCase() === targetSlug.toLowerCase()) {
      continue
    }
    
    const similarity = checkSlugSimilarity(targetSlug, existingSlug, threshold)
    
    if (similarity > 0) {
      results.push({
        slug: existingSlug,
        similarity: Math.round(similarity * 100) / 100 // 保留两位小数
      })
    }
  }
  
  // 按相似度降序排序
  return results.sort((a, b) => b.similarity - a.similarity)
}
