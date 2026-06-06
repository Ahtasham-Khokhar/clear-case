"use client"

import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Shield,
  FileText,
  Users,
  BarChart3,
  CheckCircle,
  Search,
  Bell,
  Lock,
  Smartphone,
  Globe,
  Database,
} from "lucide-react"

export default function FeaturesPage() {
  const features = [
    {
      icon: FileText,
      title: "Easy Case Reporting",
      description: "Submit crime reports quickly with our intuitive form interface",
      benefits: ["24/7 availability", "Mobile-friendly", "Secure submission", "Auto-confirmation"],
    },
    {
      icon: Shield,
      title: "Advanced Security",
      description: "Enterprise-grade security to protect sensitive information",
      benefits: ["End-to-end encryption", "Role-based access", "Audit trails", "Data protection"],
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Comprehensive dashboards for tracking and analysis",
      benefits: ["Live case tracking", "Performance metrics", "Custom reports", "Data visualization"],
    },
    {
      icon: Users,
      title: "Multi-role Management",
      description: "Separate interfaces for citizens, officers, and administrators",
      benefits: ["Role-based dashboards", "Permission controls", "User verification", "Access management"],
    },
    {
      icon: Search,
      title: "Advanced Search",
      description: "Powerful search and filtering capabilities",
      benefits: ["Quick case lookup", "Advanced filters", "Smart suggestions", "Bulk operations"],
    },
    {
      icon: Bell,
      title: "Real-time Notifications",
      description: "Stay updated with instant notifications",
      benefits: ["Case updates", "Status changes", "Email alerts", "SMS notifications"],
    },
    {
      icon: Smartphone,
      title: "Mobile Responsive",
      description: "Access the system from any device, anywhere",
      benefits: ["Mobile optimized", "Touch-friendly", "Offline support", "Cross-platform"],
    },
    {
      icon: Database,
      title: "Data Management",
      description: "Comprehensive data storage and backup solutions",
      benefits: ["Secure storage", "Regular backups", "Data recovery", "Export options"],
    },
  ]

  const systemFeatures = [
    {
      category: "For Citizens",
      items: [
        "Report crimes online 24/7",
        "Track case status in real-time",
        "Receive updates via email/SMS",
        "Access case history",
        "Anonymous reporting option",
      ],
    },
    {
      category: "For Police Officers",
      items: [
        "Manage assigned cases",
        "Update case status",
        "Access case details",
        "Generate reports",
        "Collaborate with team",
      ],
    },
    {
      category: "For Administrators",
      items: [
        "User management system",
        "Officer verification",
        "System analytics",
        "Case assignment",
        "Performance monitoring",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Powerful Features for Modern Crime Management</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Discover how ClearCase revolutionizes crime reporting and case management with cutting-edge technology and
              user-friendly design
            </p>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Core Features</h2>
            <p className="text-xl text-gray-600">Everything you need for efficient crime management</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* System Features by Role */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Features by User Role</h2>
            <p className="text-xl text-gray-600">Tailored functionality for every user type</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {systemFeatures.map((section, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl text-center">{section.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {section.items.map((item, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Lock className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Security & Privacy</h2>
            <p className="text-xl text-blue-100">Your data security is our top priority</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Data Encryption</h3>
              <p className="text-blue-100">End-to-end encryption for all sensitive data</p>
            </div>
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Control</h3>
              <p className="text-blue-100">Role-based permissions and user verification</p>
            </div>
            <div className="text-center">
              <Database className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Secure Storage</h3>
              <p className="text-blue-100">Protected databases with regular backups</p>
            </div>
            <div className="text-center">
              <Globe className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Compliance</h3>
              <p className="text-blue-100">Meets industry security standards</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
