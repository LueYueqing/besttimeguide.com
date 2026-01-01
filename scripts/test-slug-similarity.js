// 测试 slug 相似度计算

// 复制 lib/slug-similarity.ts 中的核心逻辑
function extractWordsFromSlug(slug) {
  const cleanedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '')
  const words = cleanedSlug.split('-').filter(word => word.length > 0)
  
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

function calculateWordSimilarity(words1, words2) {
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

function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// 测试用例
const title1 = 'Best Time to Visit Japan in Spring'
const title2 = 'Best Time to Visit Japan in Summer'

const slug1 = generateSlug(title1)
const slug2 = generateSlug(title2)

console.log('Title 1:', title1)
console.log('Slug 1:', slug1)
console.log('Words 1:', extractWordsFromSlug(slug1))
console.log()

console.log('Title 2:', title2)
console.log('Slug 2:', slug2)
console.log('Words 2:', extractWordsFromSlug(slug2))
console.log()

const words1 = extractWordsFromSlug(slug1)
const words2 = extractWordsFromSlug(slug2)
const similarity = calculateWordSimilarity(words1, words2)

console.log('Jaccard Similarity:', similarity)
console.log('Similarity Percentage:', (similarity * 100).toFixed(2) + '%')
console.log('Threshold: 0.8 (80%)')
console.log('Similar (> 0.8)?', similarity > 0.8)
console.log()

// 测试更相似的例子
const title3 = 'Best Time to Visit Japan in Spring'
const title4 = 'Best Time to Visit Japan in April'

const slug3 = generateSlug(title3)
const slug4 = generateSlug(title4)

console.log('\n--- 另一个测试 ---')
console.log('Title 3:', title3)
console.log('Slug 3:', slug3)
console.log('Words 3:', extractWordsFromSlug(slug3))

console.log('\nTitle 4:', title4)
console.log('Slug 4:', slug4)
console.log('Words 4:', extractWordsFromSlug(slug4))

const words3 = extractWordsFromSlug(slug3)
const words4 = extractWordsFromSlug(slug4)
const similarity2 = calculateWordSimilarity(words3, words4)

console.log('\nJaccard Similarity:', similarity2)
console.log('Similarity Percentage:', (similarity2 * 100).toFixed(2) + '%')
console.log('Similar (> 0.8)?', similarity2 > 0.8)

// 测试完全重复的情况
const title5 = 'Best Time to Visit Japan in Spring'
const title6 = 'Best Time to Visit Japan in Spring'

const slug5 = generateSlug(title5)
const slug6 = generateSlug(title6)

console.log('\n--- 完全相同的测试 ---')
console.log('Title 5:', title5)
console.log('Slug 5:', slug5)
console.log('Words 5:', extractWordsFromSlug(slug5))

console.log('\nTitle 6:', title6)
console.log('Slug 6:', slug6)
console.log('Words 6:', extractWordsFromSlug(slug6))

const words5 = extractWordsFromSlug(slug5)
const words6 = extractWordsFromSlug(slug6)
const similarity3 = calculateWordSimilarity(words5, words6)

console.log('\nJaccard Similarity:', similarity3)
console.log('Similarity Percentage:', (similarity3 * 100).toFixed(2) + '%')
console.log('Similar (> 0.8)?', similarity3 > 0.8)

// 测试真正相似的情况
const title7 = 'Best Time to Visit Japan'
const title8 = 'Japan Best Travel Time'

const slug7 = generateSlug(title7)
const slug8 = generateSlug(title8)

console.log('\n--- 真正相似的测试 ---')
console.log('Title 7:', title7)
console.log('Slug 7:', slug7)
console.log('Words 7:', extractWordsFromSlug(slug7))

console.log('\nTitle 8:', title8)
console.log('Slug 8:', slug8)
console.log('Words 8:', extractWordsFromSlug(slug8))

const words7 = extractWordsFromSlug(slug7)
const words8 = extractWordsFromSlug(slug8)
const similarity4 = calculateWordSimilarity(words7, words8)

console.log('\nJaccard Similarity:', similarity4)
console.log('Similarity Percentage:', (similarity4 * 100).toFixed(2) + '%')
console.log('Similar (> 0.8)?', similarity4 > 0.8)
