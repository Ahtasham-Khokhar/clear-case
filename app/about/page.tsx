"use client"

import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Target, Heart, Users, Award, CheckCircle, Lightbulb } from "lucide-react"

export default function AboutPage() {
  const teamMembers = [
  {
    name: "Aisha Butt",
    role: "Chief Technology Officer",
    description: "15+ years leading public sector secure tech deployments",
    image: "https://i.dawn.com/primary/2025/04/021622513030086.jpg",
  },
  {
    name: "Muhammad Ali",
    role: "Lead Developer",
    description: "Expert in secure web apps, encryption, and Next.js ecosystems",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1-kECQ60WIuZkxfxWWOtcxxJilKgIOcB5sg&s",
  },
  {
    name: "Dr. Kamran Malik",
    role: "Security Consultant",
    description: "Specialist in threat intelligence and data protection standards",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGeizFRVnIMpfWOfD480G0HDnsf3aG0spRrQ&s",
  },
  {
    name: "Tariq Khan",
    role: "Police Liaison Officer",
    description: "Retired Senior Superintendent of Police (SSP) with 20+ years field experience",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTezP1ewzzQd6NA9gVNDeJJUPFMAQBhzUauCA&s",
  },
]

  const values = [
    {
      icon: Shield,
      title: "Security First",
      description: "We prioritize the security and privacy of all user data with enterprise-grade protection.",
    },
    {
      icon: Heart,
      title: "Community Focus",
      description: "Our mission is to make communities safer through better crime reporting and management.",
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We continuously innovate to provide the most effective crime management solutions.",
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "We believe in working together with law enforcement and communities for better outcomes.",
    },
  ]

  const achievements = [
    { number: "50+", label: "Police Departments" },
    { number: "10,000+", label: "Cases Managed" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About ClearCase</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Empowering law enforcement and communities with modern technology for safer neighborhoods
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                ClearCase was founded with a simple yet powerful mission: to bridge the gap between communities and law
                enforcement through innovative technology. We believe that effective crime reporting and case management
                are essential for building safer, more connected communities.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Our platform streamlines the entire process from initial crime reporting to case resolution, ensuring
                transparency, efficiency, and accountability at every step.
              </p>
              <div className="flex items-center space-x-4">
                <Target className="h-8 w-8 text-blue-600" />
                <span className="text-lg font-semibold text-gray-900">
                  Making communities safer, one case at a time
                </span>
              </div>
            </div>
            <div className="bg-blue-50 p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Why We Started</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
                  <span className="text-gray-700">Outdated paper-based reporting systems</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
                  <span className="text-gray-700">Lack of transparency in case progress</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
                  <span className="text-gray-700">Inefficient communication between departments</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
                  <span className="text-gray-700">Need for better data analytics and insights</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <value.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">{value.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">Experienced professionals dedicated to public safety</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <Badge variant="secondary">{member.role}</Badge>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">{member.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Award className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Our Impact</h2>
            <p className="text-xl text-blue-100">Numbers that reflect our commitment to excellence</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold mb-2">{achievement.number}</div>
                <div className="text-blue-100">{achievement.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join the growing number of communities using ClearCase for better crime management
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Us
            </a>
            <a
              href="/features"
              className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
