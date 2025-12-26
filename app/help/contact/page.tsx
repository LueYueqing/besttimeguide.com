'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { useUser } from '@/contexts/UserContext'

export default function ContactPage() {
  const { user, loading: userLoading } = useUser()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  // 如果用户已登录，自动填充邮箱和姓名
  useEffect(() => {
    if (!userLoading && user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || prev.email,
        name: user.name || prev.name,
      }))
    }
  }, [user, userLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSubmitStatus({
          type: 'success',
          message: data.message || 'Thank you for contacting us! We will get back to you within 24 hours.',
        })
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          category: 'general',
        })
      } else {
        setSubmitStatus({
          type: 'error',
          message: data.error || 'Something went wrong. Please try again.',
        })
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitStatus({
        type: 'error',
        message: 'Network error. Please check your connection and try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-100">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="hero hero-bg">
        <div className="hero-container text-center">
          <h1 className="hero-title fade-in-up">
            Get in Touch - We're Here to Help
          </h1>
          
          <p className="hero-subtitle fade-in-up">
            Have a question about our timing guides, need help finding information, or want to share feedback? 
            Our team is ready to assist you with any inquiries.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your email address"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category" className="form-label">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="general">General Question</option>
                    <option value="content">Content Question</option>
                    <option value="suggestion">Guide Suggestion</option>
                    <option value="feedback">Feedback</option>
                    <option value="partnership">Partnership Inquiry</option>
                    <option value="media">Media Inquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="subject" className="form-label">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Brief description of your inquiry"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="Please provide details about your question or issue..."
                  />
                  <div className="form-help">
                    Be as specific as possible to help us provide the best assistance.
                  </div>
                </div>

                {/* Submit Status Messages */}
                {submitStatus.type === 'success' && (
                  <div className="bg-success-50 border border-success-200 text-success-800 px-4 py-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span>✅</span>
                      <p className="font-semibold">{submitStatus.message}</p>
                    </div>
                  </div>
                )}

                {submitStatus.type === 'error' && (
                  <div className="bg-error-50 border border-error-200 text-error-800 px-4 py-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span>❌</span>
                      <p className="font-semibold">{submitStatus.message}</p>
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-primary w-full btn-lg"
                  disabled={isSubmitting}
                >
                  <span>{isSubmitting ? '⏳' : '📤'}</span>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>

                <p className="text-sm text-neutral-600 text-center">
                  We typically respond within 24 hours during business days.
                </p>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Other Ways to Reach Us</h2>
                
                <div className="space-y-6">
                  <div className="card p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center text-xl">
                        📧
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">General Inquiries</h3>
                        <p className="text-neutral-600 mb-3">
                          For questions about our guides and content
                        </p>
                        <a href="mailto:javajia@gmail.com" className="text-primary-600 hover:text-primary-700 font-semibold">
                          javajia@gmail.com
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="card p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-accent-100 text-accent-600 rounded-2xl flex items-center justify-center text-xl">
                        💼
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">Partnership & Media</h3>
                        <p className="text-neutral-600 mb-3">
                          For partnership opportunities and media inquiries
                        </p>
                        <a href="mailto:javajia@gmail.com" className="text-primary-600 hover:text-primary-700 font-semibold">
                          javajia@gmail.com
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="card p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-success-100 text-success-600 rounded-2xl flex items-center justify-center text-xl">
                        🔧
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">Content Suggestions</h3>
                        <p className="text-neutral-600 mb-3">
                          Suggest new timing guides or topics
                        </p>
                        <a href="mailto:javajia@gmail.com" className="text-primary-600 hover:text-primary-700 font-semibold">
                          javajia@gmail.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support Hours */}
              <div className="card p-6 bg-gradient-to-br from-primary-50 to-primary-100">
                <h3 className="font-bold text-lg mb-4">Support Hours</h3>
                <div className="space-y-2 text-neutral-700">
                  <div className="flex justify-between">
                    <span>Monday - Friday:</span>
                    <span className="font-semibold">9:00 AM - 6:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday:</span>
                    <span className="font-semibold">10:00 AM - 4:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday:</span>
                    <span className="font-semibold">Closed</span>
                  </div>
                </div>
                <p className="text-sm text-neutral-600 mt-4">
                  * We aim to respond to all inquiries within 24 hours
                </p>
              </div>

              {/* Quick Links */}
              <div className="card p-6">
                <h3 className="font-bold text-lg mb-4">Quick Links</h3>
                <div className="space-y-3">
                  <a href="/help/faq" className="flex items-center gap-3 text-neutral-700 hover:text-primary-600 transition-colors">
                    <span>❓</span>
                    <span>Frequently Asked Questions</span>
                  </a>
                  <a href="/" className="flex items-center gap-3 text-neutral-700 hover:text-primary-600 transition-colors">
                    <span>📚</span>
                    <span>Browse All Guides</span>
                  </a>
                  <a href="/help/faq" className="flex items-center gap-3 text-neutral-700 hover:text-primary-600 transition-colors">
                    <span>🎓</span>
                    <span>FAQ</span>
                  </a>
                  <a href="/help" className="flex items-center gap-3 text-neutral-700 hover:text-primary-600 transition-colors">
                    <span>🆘</span>
                    <span>Help Center</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Response Time Promise */}
      <section className="section bg-gradient-primary">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-6">
              Our Response Time Promise
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card p-6">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="font-bold text-lg mb-2">General Inquiries</h3>
                <p className="text-neutral-600">Response within 24 hours</p>
              </div>
              <div className="card p-6">
                <div className="text-3xl mb-3">🚀</div>
                <h3 className="font-bold text-lg mb-2">Content Questions</h3>
                <p className="text-neutral-600">Response within 12 hours</p>
              </div>
              <div className="card p-6">
                <div className="text-3xl mb-3">👔</div>
                <h3 className="font-bold text-lg mb-2">Partnership</h3>
                <p className="text-neutral-600">Response within 4 hours</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer variant="full" />
    </div>
  )
}
