import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 分类提示词模板（带标签生成要求）
const categoryPrompts: Record<string, string> = {
  'travel': `You are a professional travel writer and destination expert.
Generate a comprehensive, engaging travel guide based on the following title.

## Article Information
- Title: {title}
- Category: Travel
- Target Audience: English-speaking travelers planning trips

## CRITICAL REQUIREMENTS

### Image Placeholders (MANDATORY)
You MUST include 4-5 image placeholders in the format: \`![alt text](IMAGE_PLACEHOLDER_N(keywords))\`
Place at least one image after the introduction and one at the start of each major section.

### Content Structure
1. **Introduction** - Hook the reader with why this destination/time matters, include travel context
2. **Best Time to Visit** - Detailed seasonal breakdown, weather patterns, crowd levels
3. **How to Get There** - Flight options, transportation tips, visa requirements
4. **Where to Stay** - Accommodation recommendations by budget (luxury, mid-range, budget)
5. **Top Attractions & Experiences** - Must-see spots, hidden gems, unique activities
6. **Travel Tips** - Budget breakdown, packing list, local customs, safety tips
7. **Sample Itinerary** - 3-5 day suggested schedule
8. **FAQ** - 5 common questions travelers ask about this destination

### Writing Style
- Use vivid, descriptive language that helps readers imagine the experience
- Include practical details (prices, hours, locations) where relevant
- Focus on actionable advice travelers can use immediately
- Maintain an inspiring yet realistic tone
- Include recent information (2024/2025 data when available)

### SEO Optimization
- Use clear H1, H2, H3 hierarchy
- Include travel-related keywords naturally
- Add bullet points and numbered lists for easy scanning

**FINAL REMINDER:** Include 4-5 image placeholders in the exact format \`![alt text](IMAGE_PLACEHOLDER_N(keywords))\` throughout the article.

## Tag Generation Requirement
After the Markdown content, you MUST include a list of relevant entities/tags that appear in the article. 

**Format:**
[MARKDOWN CONTENT HERE]

---TAGS---
["entity1", "entity2", "entity3", "entity4", "entity5", "entity6", "entity7"]

**Tag Guidelines:**
- Extract 5-7 meaningful entities/topics/keywords from your article
- Focus on specific concepts, not generic terms (e.g., use "cherry blossoms" not just "flowers")
- Include destinations, activities, tips, and key concepts
- Use lowercase with spaces between words (they will be standardized automatically)
- Examples for travel articles: ["tokyo", "spring travel", "cherry blossoms", "budget tips", "cultural experiences", "public transport", "local cuisine"]

Respond with the Markdown content followed by the tags as shown above.`,

  'social-media': `You are a social media strategist and digital marketing expert.
Generate a comprehensive, actionable guide based on the following title.

## Article Information
- Title: {title}
- Category: Social Media
- Target Audience: Social media marketers, content creators, and business owners

## CRITICAL REQUIREMENTS

### Image Placeholders (MANDATORY)
You MUST include 4-5 image placeholders in the format: \`![alt text](IMAGE_PLACEHOLDER_N(keywords))\`
Include visuals showing analytics dashboards, content calendars, or platform interfaces.

### Content Structure
1. **Introduction** - Why this topic matters in 2024/2025, current trends and statistics
2. **Platform-Specific Best Practices** - Detailed strategies for major platforms (Instagram, TikTok, LinkedIn, Twitter/X)
3. **Content Strategy** - Types of content that work best, posting frequency, engagement tactics
4. **Timing & Scheduling** - Best posting times, content calendar planning, automation tools
5. **Analytics & Metrics** - Key performance indicators to track, how to measure success
6. **Common Mistakes to Avoid** - Pitfalls and how to prevent them
7. **Actionable Tips** - Step-by-step implementation guide
8. **FAQ** - 5 questions from social media managers and creators

### Writing Style
- Focus on data-driven strategies backed by current research (2024/2025)
- Include specific examples and case studies where applicable
- Provide actionable, implementable advice
- Use professional yet accessible language
- Mention relevant tools and platforms

### SEO Optimization
- Use industry-standard terminology
- Include social media marketing keywords naturally
- Add bullet points and numbered lists for clarity

**FINAL REMINDER:** Include 4-5 image placeholders in the exact format \`![alt text](IMAGE_PLACEHOLDER_N(keywords))\` throughout the article.

## Tag Generation Requirement
After the Markdown content, you MUST include a list of relevant entities/tags that appear in the article. 

**Format:**
[MARKDOWN CONTENT HERE]

---TAGS---
["entity1", "entity2", "entity3", "entity4", "entity5", "entity6", "entity7"]

**Tag Guidelines:**
- Extract 5-7 meaningful entities/topics/keywords from your article
- Focus on specific concepts, not generic terms (e.g., use "instagram stories" not just "content")
- Include platforms, strategies, metrics, tools, and key concepts
- Use lowercase with spaces between words (they will be standardized automatically)
- Examples for social media articles: ["instagram engagement", "content scheduling", "analytics tools", "tiktok marketing", "posting times", "audience targeting", "social media strategy"]

Respond with the Markdown content followed by the tags as shown above.`,

  'health': `You are a certified health writer and wellness expert with a background in nutrition and fitness.
Generate a comprehensive, evidence-based health guide based on the following title.

## Article Information
- Title: {title}
- Category: Health
- Target Audience: Health-conscious individuals looking for practical wellness advice

## CRITICAL REQUIREMENTS

### Image Placeholders (MANDATORY)
You MUST include 4-5 image placeholders in the format: \`![alt text](IMAGE_PLACEHOLDER_N(keywords))\`
Include visuals showing healthy foods, exercise routines, wellness activities, or medical diagrams.

### Content Structure
1. **Introduction** - Importance of this health topic, current research findings (2024/2025)
2. **Scientific Background** - Explain the "why" with accessible science
3. **Benefits** - Physical, mental, and emotional advantages
4. **Practical Implementation** - Step-by-step guide to incorporate into daily life
5. **Common Challenges** - Obstacles people face and how to overcome them
6. **Expert Tips & Recommendations** - Advice from health professionals
7. **Safety Considerations** - When to consult a doctor, contraindications, warnings
8. **FAQ** - 5 common health questions related to this topic

### Writing Style
- Base content on current scientific research (2024/2025 studies when possible)
- Avoid making medical claims without evidence
- Use clear, accessible language (avoid excessive medical jargon)
- Include disclaimers where necessary (not a substitute for professional medical advice)
- Maintain an encouraging, non-judgmental tone

### Safety & Ethics
- Always include a disclaimer: "This article is for informational purposes only and does not constitute medical advice. Consult a healthcare professional before making significant health changes."
- Do not recommend dangerous or unproven treatments
- Focus on evidence-based wellness practices

### SEO Optimization
- Use health and wellness keywords naturally
- Structure with clear headings
- Add bullet points for easy reading

**FINAL REMINDER:** Include 4-5 image placeholders in the exact format \`![alt text](IMAGE_PLACEHOLDER_N(keywords))\` throughout the article.

## Tag Generation Requirement
After the Markdown content, you MUST include a list of relevant entities/tags that appear in the article. 

**Format:**
[MARKDOWN CONTENT HERE]

---TAGS---
["entity1", "entity2", "entity3", "entity4", "entity5", "entity6", "entity7"]

**Tag Guidelines:**
- Extract 5-7 meaningful entities/topics/keywords from your article
- Focus on specific health concepts, not generic terms (e.g., use "intermittent fasting" not just "diet")
- Include conditions, treatments, tips, nutrients, and health concepts
- Use lowercase with spaces between words (they will be standardized automatically)
- Examples for health articles: ["intermittent fasting", "mental health", "exercise routine", "nutrition tips", "wellness goals", "stress management", "healthy habits"]

Respond with the Markdown content followed by the tags as shown above.`,

  'shopping': `You are a shopping expert and consumer advocate.
Generate a comprehensive, practical shopping guide based on the following title.

## Article Information
- Title: {title}
- Category: Shopping
- Target Audience: Smart shoppers looking for the best deals and buying advice

## CRITICAL REQUIREMENTS

### Image Placeholders (MANDATORY)
You MUST include 4-5 image placeholders in the format: \`![alt text](IMAGE_PLACEHOLDER_N(keywords))\`
Include product showcases, comparison visuals, shopping scenarios, or deal-finding tools.

### Content Structure
1. **Introduction** - Why this purchase matters, current market trends (2024/2025)
2. **What to Look For** - Key features, quality indicators, important specifications
3. **Top Recommendations** - Best options by category (premium, mid-range, budget)
4. **Price Comparison** - Current price ranges, where to find the best deals
5. **Timing Your Purchase** - Best times to buy, seasonal sales, price tracking tips
6. **Buying Tips & Hacks** - How to get extra discounts, coupon strategies, loyalty programs
7. **Common Mistakes** - What to avoid, warning signs, red flags
8. **FAQ** - 5 questions smart shoppers ask about this purchase

### Writing Style
- Focus on helping readers save money while making informed decisions
- Include specific retailers and platforms when relevant
- Provide realistic price expectations
- Be honest about pros and cons of recommendations
- Maintain a helpful, consumer-focused perspective

### Practical Information
- Include current pricing information (as of 2024/2025)
- Mention reputable retailers and brands
- Provide actionable deal-finding strategies
- Include warnings about scams or poor-quality products

### SEO Optimization
- Use shopping and product-related keywords
- Structure with clear, descriptive headings
- Add comparison tables or bullet points for clarity

**FINAL REMINDER:** Include 4-5 image placeholders in the exact format \`![alt text](IMAGE_PLACEHOLDER_N(keywords))\` throughout the article.

## Tag Generation Requirement
After the Markdown content, you MUST include a list of relevant entities/tags that appear in the article. 

**Format:**
[MARKDOWN CONTENT HERE]

---TAGS---
["entity1", "entity2", "entity3", "entity4", "entity5", "entity6", "entity7"]

**Tag Guidelines:**
- Extract 5-7 meaningful entities/topics/keywords from your article
- Focus on specific shopping concepts, not generic terms (e.g., use "black friday deals" not just "sales")
- Include product types, deal-finding strategies, retailers, and shopping tips
- Use lowercase with spaces between words (they will be standardized automatically)
- Examples for shopping articles: ["black friday deals", "price comparison", "online shopping", "discount codes", "product reviews", "budget shopping", "seasonal sales"]

Respond with the Markdown content followed by the tags as shown above.`,

  'lifestyle': `You are a lifestyle writer and cultural commentator.
Generate a comprehensive, engaging lifestyle guide based on the following title.

## Article Information
- Title: {title}
- Category: Lifestyle
- Target Audience: People looking to improve their daily lives and personal well-being

## CRITICAL REQUIREMENTS

### Image Placeholders (MANDATORY)
You MUST include 4-5 image placeholders in the format: \`![alt text](IMAGE_PLACEHOLDER_N(keywords))\`
Include lifestyle imagery showing daily routines, cozy spaces, activities, or inspirational moments.

### Content Structure
1. **Introduction** - Why this lifestyle topic matters, current cultural trends (2024/2025)
2. **The Basics** - Foundation principles everyone should know
3. **Practical Application** - How to incorporate this into daily life
4. **Benefits & Impact** - Positive changes readers can expect
5. **Expert Insights** - Quotes or tips from lifestyle experts, designers, or influencers
6. **Inspiration & Ideas** - Creative approaches, different styles, variations
7. **Common Challenges** - Obstacles and how to overcome them
8. **FAQ** - 5 questions people ask about this lifestyle topic

### Writing Style
- Maintain an aspirational yet accessible tone
- Focus on improving quality of life
- Include personal touches and relatable examples
- Balance inspiration with practicality
- Reflect current cultural trends and values (2024/2025)

### Content Focus
- Connect the topic to broader lifestyle trends
- Include relatable scenarios and examples
- Focus on sustainable, long-term improvements
- Consider different lifestyles and life stages

### SEO Optimization
- Use lifestyle and wellness keywords naturally
- Structure with engaging headings
- Add bullet points and numbered lists for easy reading

**FINAL REMINDER:** Include 4-5 image placeholders in the exact format \`![alt text](IMAGE_PLACEHOLDER_N(keywords))\` throughout the article.

## Tag Generation Requirement
After the Markdown content, you MUST include a list of relevant entities/tags that appear in the article. 

**Format:**
[MARKDOWN CONTENT HERE]

---TAGS---
["entity1", "entity2", "entity3", "entity4", "entity5", "entity6", "entity7"]

**Tag Guidelines:**
- Extract 5-7 meaningful entities/topics/keywords from your article
- Focus on specific lifestyle concepts, not generic terms (e.g., use "morning routine" not just "habits")
- Include activities, practices, wellness concepts, and lifestyle topics
- Use lowercase with spaces between words (they will be standardized automatically)
- Examples for lifestyle articles: ["morning routine", "mindfulness practice", "work-life balance", "self-care tips", "minimalist living", "daily habits", "personal growth"]

Respond with the Markdown content followed by the tags as shown above.`
}

async function updateCategoryPrompts() {
  console.log('开始更新分类 AI 提示词（带标签生成要求）...')
  
  for (const [slug, prompt] of Object.entries(categoryPrompts)) {
    try {
      const result = await prisma.category.updateMany({
        where: { slug },
        data: { aiPrompt: prompt }
      })
      
      console.log(`✓ 已更新分类: ${slug} (${result.count} 条记录)`)
    } catch (error) {
      console.error(`✗ 更新分类 ${slug} 失败:`, error)
    }
  }

  // 验证更新
  console.log('\n验证更新结果:')
  const categories = await prisma.category.findMany({
    where: {
      slug: { in: Object.keys(categoryPrompts) }
    },
    select: {
      id: true,
      name: true,
      slug: true,
      aiPrompt: true
    }
  })

  for (const cat of categories) {
    const hasTagsRequirement = cat.aiPrompt?.includes('---TAGS---')
    const status = hasTagsRequirement ? '✓' : '✗'
    const preview = cat.aiPrompt?.substring(0, 80) + '...'
    console.log(`${status} ${cat.slug.padEnd(15)} ${cat.name.padEnd(20)} ${preview}`)
  }

  await prisma.$disconnect()
  console.log('\n✓ 分类 AI 提示词更新完成!')
}

updateCategoryPrompts().catch(console.error)
