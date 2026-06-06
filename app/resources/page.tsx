"use client"

import { useState } from "react"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Video,
  Download,
  HelpCircle,
  Search,
  FileText,
  PlayCircle,
  ExternalLink,
  Phone,
  AlertTriangle,
  Shield,
} from "lucide-react"

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = [
    { id: "all", label: "All Resources" },
    { id: "guides", label: "User Guides" },
    { id: "videos", label: "Video Tutorials" },
    { id: "faqs", label: "FAQs" },
    { id: "downloads", label: "Downloads" },
    { id: "emergency", label: "Emergency Info" },
  ]

  const resources = [
    {
      id: 1,
      title: "Getting Started with ClearCase",
      description: "Complete guide for new users to understand the platform",
      type: "guide",
      category: "guides",
      icon: BookOpen,
      downloadUrl: "#",
      readTime: "10 min read",
    },
    {
      id: 2,
      title: "How to Report a Crime",
      description: "Step-by-step video tutorial on crime reporting",
      type: "video",
      category: "videos",
      icon: Video,
      downloadUrl: "#",
      duration: "5 min",
    },
    {
      id: 3,
      title: "Police Officer Manual",
      description: "Comprehensive manual for law enforcement officers",
      type: "pdf",
      category: "downloads",
      icon: Download,
      downloadUrl: "#",
      fileSize: "2.5 MB",
    },
    {
      id: 4,
      title: "Frequently Asked Questions",
      description: "Common questions and answers about ClearCase",
      type: "faq",
      category: "faqs",
      icon: HelpCircle,
      downloadUrl: "#",
      items: "25 questions",
    },
    {
      id: 5,
      title: "Emergency Contact Numbers",
      description: "Important emergency contacts and procedures",
      type: "emergency",
      category: "emergency",
      icon: Phone,
      downloadUrl: "#",
      priority: "high",
    },
    {
      id: 6,
      title: "Admin Dashboard Tutorial",
      description: "Learn how to use the administrative features",
      type: "video",
      category: "videos",
      icon: Video,
      downloadUrl: "#",
      duration: "15 min",
    },
    {
      id: 7,
      title: "Data Security Guidelines",
      description: "Best practices for maintaining data security",
      type: "guide",
      category: "guides",
      icon: Shield,
      downloadUrl: "#",
      readTime: "8 min read",
    },
    {
      id: 8,
      title: "Mobile App User Guide",
      description: "How to use ClearCase on mobile devices",
      type: "pdf",
      category: "downloads",
      icon: Download,
      downloadUrl: "#",
      fileSize: "1.8 MB",
    },
  ]

  const faqs = [
    {
      question: "How do I report a crime anonymously?",
      answer:
        "You can report crimes anonymously by selecting the 'Anonymous Report' option when filling out the crime report form. Your identity will not be stored or shared.",
    },
    {
      question: "How long does it take to get a response?",
      answer:
        "Emergency cases receive immediate attention. Non-emergency cases typically receive a response within 24-48 hours.",
    },
    {
      question: "Can I track the status of my case?",
      answer:
        "Yes, you can track your case status in real-time through your citizen dashboard. You'll also receive email and SMS notifications for updates.",
    },
    {
      question: "Is my personal information secure?",
      answer:
        "Absolutely. We use enterprise-grade encryption and security measures to protect all personal information and case data.",
    },
    {
      question: "What types of crimes can I report?",
      answer:
        "You can report all types of crimes including theft, vandalism, fraud, assault, and more. For emergencies, please call 15 directly.",
    },
  ]

  const emergencyContacts = [
    { service: "Emergency Services", number: "15", description: "Life-threatening emergencies" },
    { service: "Police Non-Emergency", number: "042-99212609", description: "Non-urgent police matters" },
    { service: "Fire Department", number: "1122", description: "Fire and rescue services" },
    { service: "Poison Control", number: "1124", description: "Poison emergencies" },
    { service: "Crisis Hotline", number: "0800-99000", description: "Mental health crisis support" },
  ]

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Resources & Support</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Find guides, tutorials, FAQs, and emergency information to help you use ClearCase effectively
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <resource.icon className="h-8 w-8 text-blue-600" />
                    {resource.priority === "high" && <Badge variant="destructive">High Priority</Badge>}
                  </div>
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {resource.readTime && (
                        <span className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {resource.readTime}
                        </span>
                      )}
                      {resource.duration && (
                        <span className="flex items-center">
                          <PlayCircle className="h-4 w-4 mr-1" />
                          {resource.duration}
                        </span>
                      )}
                      {resource.fileSize && (
                        <span className="flex items-center">
                          <Download className="h-4 w-4 mr-1" />
                          {resource.fileSize}
                        </span>
                      )}
                      {resource.items && (
                        <span className="flex items-center">
                          <HelpCircle className="h-4 w-4 mr-1" />
                          {resource.items}
                        </span>
                      )}
                    </div>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      {resource.type === "video" ? "Watch" : resource.type === "pdf" ? "Download" : "View"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Quick answers to common questions</p>
          </div>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-start">
                    <HelpCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 ml-7">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Contacts */}
      <section className="py-16 bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <AlertTriangle className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Emergency Contacts</h2>
            <p className="text-xl text-red-100">Important numbers for emergency situations</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {emergencyContacts.map((contact, index) => (
              <Card key={index} className="bg-white text-gray-900">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Phone className="h-5 w-5 text-red-600 mr-2" />
                    {contact.service}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-600 mb-2">{contact.number}</p>
                  <p className="text-gray-600">{contact.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Need More Help?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Can't find what you're looking for? Our support team is here to help
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Phone className="h-5 w-5 mr-2" />
              Contact Support
            </Button>
            <Button size="lg" variant="outline">
              <FileText className="h-5 w-5 mr-2" />
              Submit Ticket
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
