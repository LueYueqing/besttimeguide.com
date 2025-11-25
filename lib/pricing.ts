/**
 * 价格配置 - 单一数据源
 * 所有价格相关的信息都在这里维护，避免重复
 */

export interface PricingPlan {
  id: 'free' | 'pro' | 'enterprise'
  name: string
  description: string
  monthly: {
    price: number
    displayPrice: string
    billing: string
  }
  annual: {
    price: number
    displayPrice: string
    billing: string
    savings: string
  }
  features: {
    included: string[]
    excluded?: string[]
  }
  highlight?: string // 如 "Most Popular"
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free Forever',
    description: 'Perfect for personal use',
    monthly: {
      price: 0,
      displayPrice: '$0',
      billing: '',
    },
    annual: {
      price: 0,
      displayPrice: '$0',
      billing: '',
      savings: '',
    },
    features: {
      included: [
        'Unlimited Static QR Codes',
        'Basic Customization',
        'PNG Downloads',
        'Personal Use License',
      ],
      excluded: [
        'Dynamic QR Codes (Limited to 3)',
        'Analytics & Tracking',
        'Logo Upload',
        'API Access',
      ],
    },
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'For professionals and small businesses',
    monthly: {
      price: 5.99,
      displayPrice: '$5.99',
      billing: 'Billed monthly',
    },
    annual: {
      price: 4.99,
      displayPrice: '$4.99',
      billing: 'Billed annually ($59.88/year)',
      savings: 'Save $12 per year!',
    },
    highlight: 'Most Popular',
    features: {
      included: [
        'Everything in Free',
        'Up to 50 Dynamic QR Codes',
        'Advanced Analytics',
        'Logo Upload & Custom Design',
        'Multiple Download Formats',
        'Bulk QR Code Generation',
        'Full API Access',
        'Priority Support',
      ],
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    monthly: {
      price: 24.99,
      displayPrice: '$24.99',
      billing: 'Billed monthly',
    },
    annual: {
      price: 19.99,
      displayPrice: '$19.99',
      billing: 'Billed annually ($239.88/year)',
      savings: 'Save $60 per year!',
    },
    features: {
      included: [
        'Everything in Professional',
        'Up to 500 Dynamic QR Codes',
        'Advanced Analytics & Reports',
        'Real-time Scan Monitoring',
        'White-label Solution',
        'Team Collaboration',
        'Advanced Security',
        'Priority Support',
        'SLA Guarantee',
      ],
    },
  },
]

/**
 * 获取指定计划的价格信息
 */
export function getPlanPricing(planId: 'free' | 'pro' | 'enterprise', isAnnual: boolean = false) {
  const plan = PRICING_PLANS.find((p) => p.id === planId)
  if (!plan) return null

  return isAnnual ? plan.annual : plan.monthly
}

/**
 * 获取指定计划的完整信息
 */
export function getPlan(planId: 'free' | 'pro' | 'enterprise'): PricingPlan | null {
  return PRICING_PLANS.find((p) => p.id === planId) || null
}

/**
 * 获取推荐计划（通常是 Pro）
 */
export function getRecommendedPlan(): PricingPlan {
  return PRICING_PLANS.find((p) => p.highlight === 'Most Popular') || PRICING_PLANS[1]
}

