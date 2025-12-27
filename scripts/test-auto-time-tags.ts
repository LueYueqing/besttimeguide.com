/**
 * 测试自动时间标签生成功能
 */

import { generateAutoTimeTags, updateTimeTags, validateTimeTags, getTimeTagDescription } from '../lib/auto-time-tags'

// 测试用例
const testCases = [
  {
    name: '春季旅游文章',
    title: 'Best Time to Visit Japan for Cherry Blossom',
    content: 'Spring is the best season to visit Japan. The cherry blossom season typically runs from late March to early April. This is the most beautiful time to see the sakura.',
    category: 'Travel',
    existingTags: ['travel', 'japan', 'cherry-blossom'],
    expectedTags: ['season-spring', 'season-autumn', 'month-march', 'month-april', 'week-12', 'week-13', 'travel', 'japan', 'cherry-blossom']
  },
  {
    name: '夏季购物文章',
    title: 'Best Time to Buy Air Conditioner',
    content: 'Summer is the hottest time of the year. Buying AC in winter can save you money.',
    category: 'Shopping',
    existingTags: ['shopping', 'home-appliances'],
    expectedTags: ['season-winter', 'season-spring', 'shopping', 'home-appliances']
  },
  {
    name: '冬季圣诞购物',
    title: 'Best Time to Buy Christmas Gifts',
    content: 'November and December are the best months to buy Christmas gifts. Black Friday deals are available in late November.',
    category: 'Shopping',
    existingTags: ['shopping', 'gifts'],
    expectedTags: ['month-november', 'month-december', 'week-47', 'week-48', 'shopping', 'gifts']
  },
  {
    name: '健康健身文章',
    title: 'Best Time to Start Fitness Journey',
    content: 'January is the perfect time to start your fitness journey with New Year resolutions.',
    category: 'Health',
    existingTags: ['health', 'fitness'],
    expectedTags: ['season-spring', 'month-january', 'health', 'fitness']
  },
  {
    name: '社交媒体发布',
    title: 'Best Time to Post on Instagram',
    content: 'Summer and winter holidays are great for social media engagement.',
    category: 'Social Media',
    existingTags: ['social-media', 'instagram', 'marketing'],
    expectedTags: ['season-summer', 'season-winter', 'social-media', 'instagram', 'marketing']
  },
  {
    name: '通用文章（无时间关键词）',
    title: 'How to Code Better',
    content: 'Programming is a skill that requires practice and dedication.',
    category: 'Technology',
    existingTags: ['programming', 'coding'],
    expectedTags: ['should-have-current-time'] // 应该添加当前时间标签
  }
]

function runTests() {
  console.log('='.repeat(80))
  console.log('测试自动时间标签生成功能')
  console.log('='.repeat(80))
  console.log()

  let passed = 0
  let failed = 0

  testCases.forEach((testCase, index) => {
    console.log(`测试 ${index + 1}: ${testCase.name}`)
    console.log('-'.repeat(80))
    console.log(`标题: ${testCase.title}`)
    console.log(`分类: ${testCase.category}`)
    console.log(`现有标签: ${testCase.existingTags.join(', ')}`)
    console.log()

    const generatedTags = generateAutoTimeTags(
      testCase.title,
      testCase.content,
      testCase.category,
      testCase.existingTags
    )

    console.log(`生成标签: ${generatedTags.join(', ')}`)
    console.log()

    // 验证标签格式
    const validation = validateTimeTags(generatedTags)
    if (validation.valid) {
      console.log('✅ 标签格式验证通过')
    } else {
      console.log('❌ 标签格式验证失败:')
      validation.errors.forEach(error => console.log(`   - ${error}`))
    }

    // 检查是否包含时间标签
    const hasTimeTags = generatedTags.some(tag => 
      tag.startsWith('season-') || 
      tag.startsWith('month-') || 
      tag.startsWith('week-')
    )

    if (hasTimeTags) {
      console.log('✅ 包含时间标签')
    } else {
      console.log('❌ 未包含时间标签')
    }

    // 显示时间标签的描述
    console.log()
    console.log('时间标签描述:')
    generatedTags
      .filter(tag => tag.startsWith('season-') || tag.startsWith('month-') || tag.startsWith('week-'))
      .forEach(tag => {
        console.log(`  - ${tag}: ${getTimeTagDescription(tag)}`)
      })

    console.log()

    // 简单验证（实际应该更严格）
    const hasExpectedSeason = testCase.expectedTags.some(tag => 
      tag.startsWith('season-') && generatedTags.includes(tag)
    )

    if (validation.valid && hasTimeTags && (testCase.name === '通用文章（无时间关键词）' || hasExpectedSeason)) {
      console.log('✅ 测试通过')
      passed++
    } else {
      console.log('❌ 测试失败')
      failed++
    }

    console.log()
    console.log('='.repeat(80))
    console.log()
  })

  // 测试标签更新
  console.log('测试标签更新功能')
  console.log('-'.repeat(80))
  const existingTags = ['tech', 'programming', 'season-spring']
  const updatedTags = updateTimeTags(
    existingTags,
    'Best Time to Buy Summer Clothes',
    'Buy winter clothes in summer for better deals',
    'Shopping'
  )
  console.log(`原始标签: ${existingTags.join(', ')}`)
  console.log(`更新后: ${updatedTags.join(', ')}`)
  console.log()

  // 验证非时间标签被保留
  const nonTimeTagsPreserved = ['tech', 'programming'].every(tag => updatedTags.includes(tag))
  // 验证时间标签被更新
  const timeTagsUpdated = !updatedTags.includes('season-spring') || 
    updatedTags.some(tag => tag.includes('summer') || tag.includes('winter'))

  if (nonTimeTagsPreserved && timeTagsUpdated) {
    console.log('✅ 标签更新功能正常')
    passed++
  } else {
    console.log('❌ 标签更新功能异常')
    failed++
  }

  // 汇总结果
  console.log()
  console.log('='.repeat(80))
  console.log('测试结果汇总')
  console.log('='.repeat(80))
  console.log(`通过: ${passed}`)
  console.log(`失败: ${failed}`)
  console.log(`总计: ${testCases.length + 1}`)
  console.log()

  if (failed === 0) {
    console.log('✅ 所有测试通过！')
    process.exit(0)
  } else {
    console.log('❌ 部分测试失败，请检查')
    process.exit(1)
  }
}

// 运行测试
runTests()
