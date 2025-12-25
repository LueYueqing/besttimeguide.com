import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Tutorials - Step-by-Step Guides | Your App Name',
  description: 'Learn how to use our platform with comprehensive tutorials and step-by-step guides.',
  keywords: 'tutorials, guides, how to, step by step, getting started',
  alternates: {
    canonical: '/tutorials',
  },
}

export default function TutorialsPage() {
  const tutorialCategories = [
    {
      title: 'Getting Started',
      icon: '🚀',
      description: 'Start using our platform in minutes',
      tutorials: [
        {
          title: 'Getting Started Guide',
          description: 'Complete beginner guide to get started with our platform.',
          duration: '5 min read',
          level: 'Beginner',
          href: '/'
        },
        {
          title: 'Account Setup',
          description: 'Learn how to set up your account and configure your preferences.',
          duration: '3 min read',
          level: 'Beginner',
          href: '/dashboard/profile'
        },
        {
          title: 'Understanding the Dashboard',
          description: 'Navigate and understand all the features in your dashboard.',
          duration: '4 min read',
          level: 'Beginner',
          href: '/dashboard'
        }
      ]
    },
    {
      title: 'Advanced Features',
      icon: '⚡',
      description: 'Unlock the full potential',
      tutorials: [
        {
          title: 'API Integration',
          description: 'Learn how to integrate our API into your applications.',
          duration: '10 min read',
          level: 'Advanced',
          href: '/docs/api'
        },
        {
          title: 'Team Management',
          description: 'Set up and manage your team members and permissions.',
          duration: '6 min read',
          level: 'Intermediate',
          href: '/dashboard'
        },
        {
          title: 'Analytics & Reporting',
          description: 'Understand your data with analytics and generate reports.',
          duration: '8 min read',
          level: 'Intermediate',
          href: '/dashboard/analytics'
        }
      ]
    },
    {
      title: 'Best Practices',
      icon: '💡',
      description: 'Tips and tricks from experts',
      tutorials: [
        {
          title: 'Security Best Practices',
          description: 'Keep your account and data secure with these best practices.',
          duration: '7 min read',
          level: 'Intermediate',
          href: '/help'
        },
        {
          title: 'Optimization Tips',
          description: 'Optimize your workflow and improve efficiency.',
          duration: '5 min read',
          level: 'Intermediate',
          href: '/help'
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-100">
      <Navigation />

      {/* Hero Section */}
      <section className="hero hero-bg bg-pattern">
        <div className="hero-container text-center">
          <h1 className="hero-title fade-in-up">
            Tutorials & Guides
          </h1>
          <p className="hero-subtitle fade-in-up">
            Learn how to use our platform with step-by-step guides
          </p>
        </div>
      </section>

      {/* Tutorial Categories */}
      <section className="section bg-white">
        <div className="container">
          <div className="space-y-12">
            {tutorialCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="fade-in-up">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl">{category.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900">{category.title}</h2>
                    <p className="text-neutral-600">{category.description}</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.tutorials.map((tutorial, tutorialIndex) => (
                    <Link
                      key={tutorialIndex}
                      href={tutorial.href}
                      className="card p-6 hover:shadow-lg transition-shadow group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                          {tutorial.title}
                        </h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-primary-100 text-primary-700">
                          {tutorial.level}
                        </span>
                      </div>
                      <p className="text-neutral-600 text-sm mb-4">
                        {tutorial.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span>{tutorial.duration}</span>
                        <span className="group-hover:text-primary-600 transition-colors">
                          Read more →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="section bg-gradient-primary">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Need More Help?
          </h2>
          <p className="text-lg text-neutral-600 mb-8">
            Can't find what you're looking for? Contact our support team.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/help"
              className="btn btn-primary"
            >
              Visit Help Center
            </Link>
            <Link
              href="/help/contact"
              className="btn btn-secondary"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
