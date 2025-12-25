import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { resolve } from 'path'

// 加载环境变量
// 优先加载 .env.local，如果不存在则加载 .env
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

const prisma = new PrismaClient()

// 计算阅读时间
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

async function main() {
  console.log('开始填充测试数据...')

  // 1. 创建分类
  console.log('创建分类...')
  const travelCategory = await prisma.category.upsert({
    where: { slug: 'travel' },
    update: {},
    create: {
      name: 'Travel',
      slug: 'travel',
      description: '旅行相关的最佳时间指南',
      order: 1,
    },
  })

  const socialMediaCategory = await prisma.category.upsert({
    where: { slug: 'social-media' },
    update: {},
    create: {
      name: 'Social Media',
      slug: 'social-media',
      description: '社交媒体发布最佳时间指南',
      order: 2,
    },
  })

  const healthCategory = await prisma.category.upsert({
    where: { slug: 'health' },
    update: {},
    create: {
      name: 'Health',
      slug: 'health',
      description: '健康补充剂和药物最佳服用时间指南',
      order: 3,
    },
  })

  const shoppingCategory = await prisma.category.upsert({
    where: { slug: 'shopping' },
    update: {},
    create: {
      name: 'Shopping',
      slug: 'shopping',
      description: '购物最佳时间指南',
      order: 4,
    },
  })

  const lifestyleCategory = await prisma.category.upsert({
    where: { slug: 'lifestyle' },
    update: {},
    create: {
      name: 'Lifestyle',
      slug: 'lifestyle',
      description: '生活方式相关的最佳时间指南',
      order: 5,
    },
  })

  console.log('分类创建完成')

  // 2. 获取或创建管理员用户
  console.log('检查管理员用户...')
  let adminUser = await prisma.user.findFirst({
    where: { isAdmin: true },
  })

  if (!adminUser) {
    // 如果没有管理员，创建一个
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@besttimeguide.com',
        name: 'Admin',
        isAdmin: true,
        plan: 'ENTERPRISE',
      },
    })
    console.log('创建了管理员用户')
  }

  // 3. 创建示例文章
  console.log('创建示例文章...')

  // 示例文章1: Best Time to Visit Japan
  const japanContent = `# Best Time to Visit Japan (2025 Complete Guide)

## Quick Answer Box
- **Best Months**: March-May, September-November
- **Peak Season**: March-May (Cherry Blossom Season)
- **Off Season**: June-August (Rainy Season)
- **Average Temperature**: 10-25°C (50-77°F)
- **Best For**: Cherry blossom viewing, autumn leaves, cultural experiences

## Introduction

Japan is a country that offers incredible experiences year-round, but timing your visit can make a huge difference in your experience. From the famous cherry blossoms in spring to the vibrant autumn leaves, each season has its unique charm.

## Best Time to Visit Japan by Month

### January
- **Weather**: Cold, dry (0-10°C / 32-50°F)
- **Crowds**: Low
- **Prices**: Low
- **Pros**: Fewer tourists, lower prices, winter festivals
- **Cons**: Very cold, some attractions closed
- **Best Activities**: Skiing, hot springs, New Year celebrations

### February
- **Weather**: Cold, occasional snow (2-10°C / 36-50°F)
- **Crowds**: Low
- **Prices**: Low
- **Pros**: Snow festivals, fewer crowds
- **Cons**: Still cold
- **Best Activities**: Sapporo Snow Festival, skiing

### March
- **Weather**: Mild, beginning of spring (5-15°C / 41-59°F)
- **Crowds**: High
- **Prices**: High
- **Pros**: Cherry blossoms start blooming
- **Cons**: Crowded, expensive
- **Best Activities**: Cherry blossom viewing, hanami parties

### April
- **Weather**: Pleasant spring weather (10-20°C / 50-68°F)
- **Crowds**: Very High
- **Prices**: Very High
- **Pros**: Peak cherry blossom season, perfect weather
- **Cons**: Extremely crowded, expensive
- **Best Activities**: Cherry blossom viewing, Golden Week

### May
- **Weather**: Warm, comfortable (15-25°C / 59-77°F)
- **Crowds**: High
- **Prices**: High
- **Pros**: Great weather, Golden Week
- **Cons**: Still crowded
- **Best Activities**: Hiking, outdoor activities

## Weather Guide

Japan has four distinct seasons:
- **Spring (March-May)**: Mild temperatures, cherry blossoms
- **Summer (June-August)**: Hot and humid, rainy season in June-July
- **Fall (September-November)**: Cool and comfortable, autumn leaves
- **Winter (December-February)**: Cold and dry, snow in northern regions

## Tips for Visiting Japan

1. Book accommodations well in advance, especially during cherry blossom season
2. Learn basic Japanese phrases
3. Get a Japan Rail Pass for train travel
4. Respect local customs and etiquette
5. Try local cuisine and street food

## Frequently Asked Questions (FAQ)

### Q: When is the cheapest time to visit Japan?
A: January and February are typically the cheapest months, with lower hotel prices and fewer tourists.

### Q: What is the weather like in Japan?
A: Japan has four distinct seasons. Spring and fall are generally the most pleasant, while summer can be hot and humid.

### Q: Do I need a visa to visit Japan?
A: It depends on your nationality. Many countries have visa-free access for short stays.

## Related Guides
- Best Time to Visit Tokyo
- Best Time to Visit Kyoto
- Best Time to Visit Hokkaido
`

  await prisma.article.upsert({
    where: { slug: 'best-time-to-visit-japan' },
    update: {},
    create: {
      title: 'Best Time to Visit Japan (2025 Complete Guide)',
      slug: 'best-time-to-visit-japan',
      description: 'Discover the best time to visit Japan for cherry blossoms, autumn leaves, and cultural experiences. Complete month-by-month guide with weather, crowds, and prices.',
      content: japanContent,
      categoryId: travelCategory.id,
      authorId: adminUser.id,
      metaTitle: 'Best Time to Visit Japan 2025 | Complete Travel Guide',
      metaDescription: 'Plan your perfect trip to Japan with our comprehensive guide. Learn about the best months to visit, weather patterns, cherry blossom season, and more.',
      keywords: 'best time to visit japan, japan travel guide, cherry blossom season, japan weather',
      tags: JSON.stringify(['travel', 'japan', 'cherry-blossom', 'asia']),
      featured: true,
      published: true,
      publishedAt: new Date(),
      readingTime: calculateReadingTime(japanContent),
    },
  })

  // 示例文章2: Best Time to Post on Instagram
  const instagramContent = `# Best Time to Post on Instagram (2025 Guide)

## Quick Answer Box
- **Best Time**: 11am-1pm, 7pm-9pm
- **Best Days**: Tuesday, Wednesday, Thursday
- **Peak Engagement**: 11am-1pm EST
- **Time Zone**: Consider your target audience's time zone

## Introduction

Posting at the right time on Instagram can significantly increase your engagement rates. Understanding when your audience is most active is key to maximizing your reach and interaction.

## Best Time to Post on Instagram by Day of Week

### Monday
- **Best Time**: 11am-1pm, 7pm-9pm
- **Engagement Rate**: Moderate
- **Audience Activity**: People checking social media during lunch and after work

### Tuesday
- **Best Time**: 10am-12pm, 7pm-9pm
- **Engagement Rate**: High
- **Audience Activity**: One of the best days for engagement

### Wednesday
- **Best Time**: 11am-1pm, 7pm-9pm
- **Engagement Rate**: High
- **Audience Activity**: Mid-week peak engagement

### Thursday
- **Best Time**: 11am-1pm, 7pm-9pm
- **Engagement Rate**: High
- **Audience Activity**: Strong engagement before weekend

### Friday
- **Best Time**: 9am-11am, 7pm-9pm
- **Engagement Rate**: Moderate
- **Audience Activity**: People preparing for weekend

### Saturday
- **Best Time**: 10am-12pm, 7pm-9pm
- **Engagement Rate**: Moderate
- **Audience Activity**: Weekend browsing

### Sunday
- **Best Time**: 10am-12pm, 7pm-9pm
- **Engagement Rate**: Low to Moderate
- **Audience Activity**: Lower engagement, but still active

## Best Time to Post by Time of Day

### Morning (6am-12pm)
- **Engagement**: High
- **Best For**: Motivational content, breakfast posts
- **Audience**: Early risers, commuters

### Afternoon (12pm-5pm)
- **Engagement**: Very High
- **Best For**: Lunch break content, product posts
- **Audience**: People on lunch break

### Evening (5pm-9pm)
- **Engagement**: Very High
- **Best For**: Entertainment content, lifestyle posts
- **Audience**: After-work browsing

### Night (9pm-12am)
- **Engagement**: Moderate
- **Best For**: Relaxing content, stories
- **Audience**: Evening browsers

## Time Zone Considerations

Always consider your target audience's time zone:
- **US East Coast**: 11am-1pm, 7pm-9pm EST
- **US West Coast**: 8am-10am, 4pm-6pm PST
- **Europe**: 1pm-3pm, 7pm-9pm CET
- **Asia**: 8am-10am, 7pm-9pm local time

## Platform-Specific Tips

1. Use Instagram Insights to find your specific best times
2. Post consistently at your optimal times
3. Test different times and analyze results
4. Consider your audience demographics
5. Use scheduling tools for consistency

## FAQ

### Q: What is the best time to post on Instagram?
A: Generally, 11am-1pm and 7pm-9pm on weekdays, especially Tuesday-Thursday.

### Q: Does the best time vary by industry?
A: Yes, different industries have different optimal posting times based on their audience.

### Q: Should I post on weekends?
A: Weekend engagement is typically lower, but can still be effective for certain content types.

## Related Platforms
- Best Time to Post on TikTok
- Best Time to Post on Facebook
- Best Time to Post on LinkedIn
`

  await prisma.article.upsert({
    where: { slug: 'best-time-to-post-on-instagram' },
    update: {},
    create: {
      title: 'Best Time to Post on Instagram (2025 Guide)',
      slug: 'best-time-to-post-on-instagram',
      description: 'Learn the best times to post on Instagram for maximum engagement. Complete guide with day-by-day and time-of-day recommendations.',
      content: instagramContent,
      categoryId: socialMediaCategory.id,
      authorId: adminUser.id,
      metaTitle: 'Best Time to Post on Instagram 2025 | Engagement Guide',
      metaDescription: 'Maximize your Instagram engagement with our data-driven guide on the best times to post. Includes day-by-day and time-of-day recommendations.',
      keywords: 'best time to post on instagram, instagram engagement, social media strategy',
      tags: JSON.stringify(['social-media', 'instagram', 'marketing', 'engagement']),
      featured: true,
      published: true,
      publishedAt: new Date(),
      readingTime: calculateReadingTime(instagramContent),
    },
  })

  // 示例文章3: Best Time to Take Creatine
  const creatineContent = `# Best Time to Take Creatine (Complete Guide)

## Quick Answer Box
- **Best Time**: Before or after workout
- **With or Without Food**: Either is fine
- **Dosage**: 3-5g per day
- **Duration**: Long-term use is safe

## Introduction

Creatine is one of the most researched and effective supplements for improving athletic performance and muscle building. Timing your creatine intake can help maximize its benefits.

## Why Timing Matters

While creatine timing isn't as critical as once thought, taking it around your workout can provide slight advantages:
- Better muscle uptake during exercise
- Improved workout performance
- Enhanced recovery

## Best Time to Take Creatine for Different Goals

### For Muscle Building
- **Best Time**: Before or after workout
- **Reason**: Better muscle uptake during exercise
- **Dosage**: 3-5g daily

### For Athletic Performance
- **Best Time**: 30 minutes before workout
- **Reason**: Maximize energy availability
- **Dosage**: 3-5g daily

### For General Health
- **Best Time**: Any time, with meals
- **Reason**: Consistency is more important than timing
- **Dosage**: 3-5g daily

## How to Take Creatine

1. **Loading Phase (Optional)**: 20g per day for 5-7 days, divided into 4 doses
2. **Maintenance Phase**: 3-5g per day
3. **Timing**: Before or after workout, or with meals
4. **Mixing**: Mix with water, juice, or protein shake

## Side Effects & Considerations

- **Water Retention**: May cause slight water weight gain
- **Stomach Upset**: Can occur with high doses
- **Kidney Health**: Safe for healthy individuals
- **Hydration**: Drink plenty of water

## FAQ

### Q: Should I take creatine before or after workout?
A: Either time works, but many prefer after workout for better absorption.

### Q: Do I need to cycle creatine?
A: No, creatine can be taken continuously without cycling.

### Q: Can I take creatine with coffee?
A: Yes, caffeine doesn't interfere with creatine absorption.

## Related Supplements
- Best Time to Take Protein
- Best Time to Take BCAAs
- Best Time to Take Pre-Workout
`

  await prisma.article.upsert({
    where: { slug: 'best-time-to-take-creatine' },
    update: {},
    create: {
      title: 'Best Time to Take Creatine (Complete Guide)',
      slug: 'best-time-to-take-creatine',
      description: 'Learn when and how to take creatine for maximum benefits. Complete guide covering timing, dosage, and best practices.',
      content: creatineContent,
      categoryId: healthCategory.id,
      authorId: adminUser.id,
      metaTitle: 'Best Time to Take Creatine | Complete Supplement Guide',
      metaDescription: 'Discover the optimal timing for creatine supplementation. Learn about dosage, timing, and best practices for maximum benefits.',
      keywords: 'best time to take creatine, creatine supplement, creatine timing',
      tags: JSON.stringify(['health', 'supplements', 'creatine', 'fitness']),
      featured: false,
      published: true,
      publishedAt: new Date(),
      readingTime: calculateReadingTime(creatineContent),
    },
  })

  console.log('测试数据填充完成！')
  console.log(`创建了 ${await prisma.category.count()} 个分类`)
  console.log(`创建了 ${await prisma.article.count()} 篇文章`)
}

main()
  .catch((e) => {
    console.error('错误:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

