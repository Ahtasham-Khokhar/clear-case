"use client"

import { useState } from "react"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  FileText,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Phone,
  User,
  Camera,
  MapPin,
  Calendar,
  ArrowRight,
} from "lucide-react"

export default function ReportPage() {
  const [currentStep, setCurrentStep] = useState(1)

  const steps = [
    {
      number: 1,
      title: "Prepare Information",
      description: "Gather all relevant details about the incident",
      icon: FileText,
    },
    {
      number: 2,
      title: "Create Account",
      description: "Register or login to submit your report",
      icon: User,
    },
    {
      number: 3,
      title: "Submit Report",
      description: "Fill out the detailed crime report form",
      icon: Shield,
    },
    {
      number: 4,
      title: "Track Progress",
      description: "Monitor your case status and receive updates",
      icon: Clock,
    },
  ]

  const reportTypes = [
    {
      title: "Theft & Burglary",
      description: "Stolen property, break-ins, shoplifting",
      examples: ["Home burglary", "Car theft", "Pickpocketing", "Shoplifting"],
    },
    {
      title: "Vandalism & Property Damage",
      description: "Damage to personal or public property",
      examples: ["Graffiti", "Broken windows", "Vehicle damage", "Property destruction"],
    },
    {
      title: "Fraud & Scams",
      description: "Financial crimes and deceptive practices",
      examples: ["Credit card fraud", "Online scams", "Identity theft", "Check fraud"],
    },
    {
      title: "Assault & Violence",
      description: "Physical harm or threats of violence",
      examples: ["Physical assault", "Domestic violence", "Threats", "Harassment"],
    },
    {
      title: "Drug-Related Crimes",
      description: "Drug possession, distribution, or related activities",
      examples: ["Drug dealing", "Drug possession", "Drug paraphernalia", "Substance abuse"],
    },
    {
      title: "Other Crimes",
      description: "Any other criminal activity not listed above",
      examples: ["Noise complaints", "Trespassing", "Public disturbance", "Other incidents"],
    },
  ]

  const requiredInformation = [
    {
      icon: Calendar,
      title: "Date & Time",
      description: "When did the incident occur? Be as specific as possible.",
    },
    {
      icon: MapPin,
      title: "Location",
      description: "Where did the incident happen? Include full address if known.",
    },
    {
      icon: FileText,
      title: "Description",
      description: "What happened? Provide detailed description of the incident.",
    },
    {
      icon: User,
      title: "Suspect Information",
      description: "Any information about the suspect(s) if known.",
    },
    {
      icon: User,
      title: "Witness Information",
      description: "Contact details of any witnesses to the incident.",
    },
    {
      icon: Camera,
      title: "Evidence",
      description: "Photos, videos, documents, or other evidence related to the crime.",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Report a Crime</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Follow our step-by-step guide to report a crime safely and securely. Your report helps make our community
              safer.
            </p>
            <Alert className="max-w-2xl mx-auto bg-red-600 border-red-500 text-white">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-white">
                <strong>Emergency:</strong> If this is an emergency or crime in progress, call 15 immediately. This
                online form is for non-emergency reporting only.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="py-8 bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
            <div className="flex items-center space-x-2">
              <Phone className="h-6 w-6" />
              <span className="text-lg font-semibold">Emergency: 15</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-6 w-6" />
              <span className="text-lg">Non-Emergency: 042-99212609</span>
            </div>
          </div>
        </div>
      </section>

      {/* Reporting Process Steps */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How to Report a Crime</h2>
            <p className="text-xl text-gray-600">Follow these simple steps to submit your crime report</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <Card
                key={step.number}
                className={`text-center hover:shadow-lg transition-shadow ${
                  currentStep === step.number ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                    {step.number}
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {step.number < 4 && <ArrowRight className="h-5 w-5 text-gray-400 mx-auto" />}
                  {step.number === 4 && <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Types of Crimes */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Types of Crimes You Can Report</h2>
            <p className="text-xl text-gray-600">We handle all types of criminal incidents</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reportTypes.map((type, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{type.title}</CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold text-gray-900 mb-2">Examples:</h4>
                  <ul className="space-y-1">
                    {type.examples.map((example, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                        {example}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Required Information */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Information You'll Need</h2>
            <p className="text-xl text-gray-600">Gather this information before starting your report</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {requiredInformation.map((info, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <info.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{info.title}</h3>
                      <p className="text-sm text-gray-600">{info.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Start Reporting CTA */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Submit Your Report?</h2>
          <p className="text-xl text-blue-100 mb-8">
            You'll need to create an account or login to submit a crime report. This helps us track your case and keep
            you updated.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/auth/register?role=citizen">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <User className="h-5 w-5 mr-2" />
                Create Account & Report
              </Button>
            </a>
            <a href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="text-white bg-transparent"
              >
                <Shield className="h-5 w-5 mr-2" />
                Login to Report
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Anonymous Reporting */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <CardTitle className="text-2xl text-yellow-800">Anonymous Reporting</CardTitle>
              <CardDescription className="text-yellow-700">
                You can also submit anonymous reports, but you won't be able to track the case status or receive
                updates.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="border-yellow-600 text-yellow-700 hover:bg-yellow-100">
                Submit Anonymous Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Safety Tips */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Safety Tips</h2>
            <p className="text-xl text-gray-600">Important reminders for your safety</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle className="text-green-800">Do</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-green-700">
                  <li>• Report crimes as soon as possible</li>
                  <li>• Provide as much detail as you can remember</li>
                  <li>• Keep copies of any evidence</li>
                  <li>• Follow up on your case regularly</li>
                  <li>• Contact police immediately for emergencies</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <AlertTriangle className="h-8 w-8 text-red-600 mb-2" />
                <CardTitle className="text-red-800">Don't</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-red-700">
                  <li>• Don't delay reporting serious crimes</li>
                  <li>• Don't provide false information</li>
                  <li>• Don't interfere with ongoing investigations</li>
                  <li>• Don't take matters into your own hands</li>
                  <li>• Don't ignore follow-up communications</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
