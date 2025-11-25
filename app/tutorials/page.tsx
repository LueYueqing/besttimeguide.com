import type { Metadata } from 'next'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Tutorials - QR Code Generator Step-by-Step Guides | CustomQR.pro',
  description: 'Learn how to use CustomQR.pro with our comprehensive tutorials. Step-by-step guides for generating QR codes, customization, dynamic QR codes, API integration, and more.',
  keywords: 'QR code tutorials, QR generator guide, how to create QR code, QR code guide, step by step QR code',
  alternates: {
    canonical: 'https://customqr.pro/tutorials',
  },
}

export default function TutorialsPage() {
  const tutorialCategories = [
    {
      title: 'Getting Started',
      icon: '🚀',
      description: 'Start creating QR codes in minutes',
      tutorials: [
        {
          title: 'How to Generate Your First QR Code',
          description: 'Complete beginner guide to creating your first QR code from start to finish.',
          duration: '5 min read',
          level: 'Beginner',
          href: '/url-qr-code-generator'
        },
        {
          title: 'Understanding QR Code Types',
          description: 'Learn about different QR code types and when to use each one.',
          duration: '8 min read',
          level: 'Beginner',
          href: '/features'
        },
        {
          title: 'Downloading and Using QR Codes',
          description: 'Learn how to download QR codes in different formats and use them effectively.',
          duration: '4 min read',
          level: 'Beginner',
          href: '/url-qr-code-generator'
        }
      ]
    },
    {
      title: 'Customization',
      icon: '🎨',
      description: 'Make your QR codes stand out',
      tutorials: [
        {
          title: 'Adding Your Logo to QR Codes',
          description: 'Step-by-step guide to adding your brand logo to QR codes for better branding.',
          duration: '6 min read',
          level: 'Intermediate',
          href: '/url-qr-code-generator'
        },
        {
          title: 'Customizing QR Code Colors',
          description: 'Learn how to customize QR code colors to match your brand identity.',
          duration: '5 min read',
          level: 'Beginner',
          href: '/url-qr-code-generator'
        },
        {
          title: 'Using Frames and Text',
          description: 'Add professional frames and "SCAN ME" text to your QR codes.',
          duration: '7 min read',
          level: 'Intermediate',
          href: '/url-qr-code-generator'
        },
        {
          title: 'QR Code Style Options',
          description: 'Explore different QR code styles: square, rounded, dots, and more.',
          duration: '5 min read',
          level: 'Beginner',
          href: '/features'
        }
      ]
    },
    {
      title: 'Dynamic QR Codes',
      icon: '🔄',
      description: 'Edit and track your QR codes',
      tutorials: [
        {
          title: 'What Are Dynamic QR Codes?',
          description: 'Understand the difference between static and dynamic QR codes.',
          duration: '6 min read',
          level: 'Beginner',
          href: '/features'
        },
        {
          title: 'Editing QR Code Content',
          description: 'Learn how to edit dynamic QR codes without reprinting them.',
          duration: '5 min read',
          level: 'Intermediate',
          href: '/features'
        },
        {
          title: 'Understanding Scan Analytics',
          description: 'Track QR code performance with detailed analytics dashboard.',
          duration: '8 min read',
          level: 'Intermediate',
          href: '/features'
        },
        {
          title: 'Creating Custom Landing Pages',
          description: 'Design beautiful landing pages for your dynamic QR codes.',
          duration: '10 min read',
          level: 'Advanced',
          href: '/features'
        }
      ]
    },
    {
      title: 'API & Integration',
      icon: '💻',
      description: 'Integrate QR codes into your apps',
      tutorials: [
        {
          title: 'Getting Started with the API',
          description: 'Set up your API key and make your first API request.',
          duration: '10 min read',
          level: 'Intermediate',
          href: '/api-docs'
        },
        {
          title: 'Generating QR Codes via API',
          description: 'Learn how to generate QR codes programmatically using our RESTful API.',
          duration: '12 min read',
          level: 'Intermediate',
          href: '/api-docs#generate'
        },
        {
          title: 'Batch QR Code Generation',
          description: 'Generate hundreds of QR codes at once using CSV import and API.',
          duration: '15 min read',
          level: 'Advanced',
          href: '/api-docs#batch'
        }
      ]
    },
    {
      title: 'Use Cases',
      icon: '📱',
      description: 'Real-world QR code applications',
      tutorials: [
        {
          title: 'QR Codes for Business Cards',
          description: 'Create professional vCard QR codes for networking events.',
          duration: '6 min read',
          level: 'Beginner',
          href: '/business-card-qr-code-generator'
        },
        {
          title: 'WiFi QR Codes for Events',
          description: 'Share WiFi passwords instantly at conferences and events.',
          duration: '5 min read',
          level: 'Beginner',
          href: '/wifi-qr-code-generator'
        },
        {
          title: 'Event QR Codes for Calendars',
          description: 'Create calendar event QR codes for meetings and conferences.',
          duration: '7 min read',
          level: 'Beginner',
          href: '/event-qr-code-generator'
        },
        {
          title: 'Marketing QR Codes',
          description: 'Use QR codes in print marketing materials and campaigns.',
          duration: '10 min read',
          level: 'Intermediate',
          href: '/features'
        }
      ]
    },
    {
      title: 'Advanced Topics',
      icon: '⚡',
      description: 'Power user features',
      tutorials: [
        {
          title: 'Error Correction Levels',
          description: 'Understand QR code error correction and when to use each level.',
          duration: '8 min read',
          level: 'Advanced',
          href: '/features'
        },
        {
          title: 'QR Code Best Practices',
          description: 'Professional tips for creating high-quality, scannable QR codes.',
          duration: '10 min read',
          level: 'Intermediate',
          href: '/features'
        },
        {
          title: 'QR Code Security',
          description: 'Learn how to protect your QR codes from malicious modification.',
          duration: '12 min read',
          level: 'Advanced',
          href: '/features'
        }
      ]
    }
  ]

  const featuredTutorials = [
    {
      title: 'Getting Started: Your First QR Code',
      description: 'A complete beginner-friendly guide to creating your first QR code in 5 minutes.',
      icon: '🎯',
          href: '/url-qr-code-generator',
      readTime: '5 min'
    },
    {
      title: 'Adding Logos to QR Codes',
      description: 'Learn how to brand your QR codes by adding your logo in the center.',
      icon: '🖼️',
          href: '/url-qr-code-generator',
      readTime: '6 min'
    },
    {
      title: 'Dynamic QR Codes Explained',
      description: 'Understand the power of dynamic QR codes and how to use them effectively.',
      icon: '🔄',
      href: '/features',
      readTime: '8 min'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-100">
      <Navigation />

      {/* Hero Section */}
      <section className="hero hero-bg">
        <div className="hero-container text-center">
          <h1 className="hero-title fade-in-up">
            Tutorials & Guides<br />
            <span className="text-gradient">Learn by Doing</span>
          </h1>
          
          <p className="hero-subtitle fade-in-up">
            Step-by-step tutorials to help you master QR code generation, 
            customization, and advanced features.
          </p>
        </div>
      </section>

      {/* Featured Tutorials */}
      <section className="section bg-white">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Tutorials</h2>
            <p className="section-subtitle">
              Start with these popular guides
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {featuredTutorials.map((tutorial, index) => (
              <Link
                key={index}
                href={tutorial.href}
                className="card p-6 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{tutorial.icon}</div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-primary-100 text-primary-600 px-2 py-1 rounded text-xs font-semibold">
                    {tutorial.readTime}
                  </span>
                  <span className="text-neutral-500 text-xs">Featured</span>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">{tutorial.title}</h3>
                <p className="text-neutral-700 text-sm mb-4">{tutorial.description}</p>
                <span className="text-primary-600 font-semibold text-sm inline-flex items-center gap-2">
                  Read tutorial →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* All Tutorials by Category */}
      <section className="section bg-neutral-50">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">All Tutorials</h2>
            <p className="section-subtitle">
              Browse tutorials organized by topic
            </p>
          </div>

          <div className="space-y-12 max-w-6xl mx-auto">
            {tutorialCategories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-4xl">{category.icon}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-neutral-900 mb-1">{category.title}</h3>
                    <p className="text-neutral-600">{category.description}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {category.tutorials.map((tutorial, tutorialIndex) => (
                    <Link
                      key={tutorialIndex}
                      href={tutorial.href}
                      className="card p-6 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            tutorial.level === 'Beginner' ? 'bg-success-100 text-success-700' :
                            tutorial.level === 'Intermediate' ? 'bg-primary-100 text-primary-700' :
                            'bg-accent-100 text-accent-700'
                          }`}>
                            {tutorial.level}
                          </span>
                          <span className="text-neutral-500 text-xs">{tutorial.duration}</span>
                        </div>
                      </div>
                      <h4 className="text-lg font-bold text-neutral-900 mb-2">{tutorial.title}</h4>
                      <p className="text-neutral-700 text-sm">{tutorial.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start CTA */}
      <section className="section bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-black mb-6">
              Ready to Create Your QR Code?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Put what you've learned into practice. Generate your first QR code in minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/url-qr-code-generator" className="btn bg-white text-primary-600 hover:bg-neutral-50 btn-lg font-bold">
                <span>🚀</span>
                Start Generating
              </a>
              <a href="/help" className="btn btn-ghost text-white border-white/30 hover:bg-white/10 btn-lg">
                <span>❓</span>
                Need Help?
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer variant="full" />
    </div>
  )
}

