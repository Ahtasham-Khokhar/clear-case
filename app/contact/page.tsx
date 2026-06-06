"use client"

import type React from "react"

import { useState } from "react"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Phone, Mail, MapPin, Clock, MessageSquare, HeadphonesIcon, AlertTriangle, CheckCircle, Shield } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    type: "general",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    setSubmitted(true)
    setFormData({ name: "", email: "", subject: "", message: "", type: "general" })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone Support",
      details: "042-99212609",
      description: "24/7 emergency support available",
    },
    {
      icon: Mail,
      title: "Email Support",
      details: "police@clearcase.com",
      description: "Response within 24 hours",
    },
    {
      icon: MapPin,
      title: "Office Address",
      details: "Office of the Inspector General of Police, Punjab, Lahore",
      description: "Monday - Friday, 9 AM - 6 PM",
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: "Mon - Fri: 9 AM - 6 PM",
      description: "Emergency support available 24/7",
    },
  ]

  const supportTypes = [
    {
      icon: AlertTriangle,
      title: "Emergency Support",
      description: "For urgent technical issues affecting case reporting",
      contact: "Call: 042-99212609 (24/7)",
    },
    {
      icon: HeadphonesIcon,
      title: "Technical Support",
      description: "Help with system issues, login problems, or feature questions",
      contact: "Email: tech@clearcase.com",
    },
    {
      icon: MessageSquare,
      title: "General Inquiries",
      description: "Questions about features, pricing, or partnerships",
      contact: "Email: info@clearcase.com",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              We're here to help. Reach out to us for support, questions, or to learn more about ClearCase
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              {submitted ? (
                <Card className="p-8 text-center bg-green-50 border-green-200">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-800 mb-2">Message Sent Successfully!</h3>
                  <p className="text-green-600">We'll get back to you within 24 hours.</p>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="type">Inquiry Type</Label>
                        <select
                          id="type"
                          name="type"
                          aria-label="Select inquiry type"
                          value={formData.type}
                          onChange={handleChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="general">General Inquiry</option>
                          <option value="technical">Technical Support</option>
                          <option value="partnership">Partnership</option>
                          <option value="feedback">Feedback</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="subject">Subject *</Label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={6}
                          className="mt-1"
                          placeholder="Please provide details about your inquiry..."
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Sending..." : "Send Message"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <info.icon className="h-8 w-8 text-blue-600 mt-1" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{info.title}</h3>
                          <p className="text-blue-600 font-medium mb-1">{info.details}</p>
                          <p className="text-gray-600 text-sm">{info.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Types */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Support Options</h2>
            <p className="text-xl text-gray-600">Choose the best way to get help based on your needs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {supportTypes.map((support, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <support.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <CardTitle className="text-xl">{support.title}</CardTitle>
                  <CardDescription>{support.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-600 font-medium">{support.contact}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Notice */}
      <section className="py-16 bg-red-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AlertTriangle className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Emergency Situations</h2>
          <p className="text-xl text-red-100 mb-8">
            For immediate emergency assistance, please contact your local emergency services directly
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100">
              <Phone className="h-5 w-5 mr-2" />
              Call 15
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white bg-transparent">
              Emergency Contacts
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
