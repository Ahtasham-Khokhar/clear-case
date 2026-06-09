"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, ChevronRight, Upload } from "lucide-react"

interface StationFormData {
  // Basic Information
  name: string
  station_code: string
  jurisdiction: string
  established_date: string

  // Address Information
  address: string
  city: string
  state: string
  postal_code: string
  latitude: string
  longitude: string

  // Contact Information
  phone: string
  email: string
  officer_in_charge: string
  officer_contact: string

  // Additional Information
  logo_url: string
  status: string
}

const initialFormData: StationFormData = {
  name: "",
  station_code: "",
  jurisdiction: "",
  established_date: "",
  address: "",
  city: "",
  state: "",
  postal_code: "",
  latitude: "",
  longitude: "",
  phone: "",
  email: "",
  officer_in_charge: "",
  officer_contact: "",
  logo_url: "",
  status: "active",
}

const steps = [
  {
    title: "Basic Information",
    description: "Station name, code, and basic details",
  },
  {
    title: "Address Details",
    description: "Location and address information",
  },
  {
    title: "Contact Information",
    description: "Phone, email, and officer details",
  },
  {
    title: "Additional Details",
    description: "Logo and final configuration",
  },
]

export function StationRegistrationForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<StationFormData>(initialFormData)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const updateFormData = (field: keyof StationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(formData.name && formData.station_code && formData.jurisdiction)
      case 1:
        return !!(formData.address && formData.city && formData.state && formData.postal_code)
      case 2:
        return !!(formData.phone && formData.email && formData.officer_in_charge)
      case 3:
        return true // Optional step
      default:
        return false
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
    } else {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields before proceeding.",
        variant: "destructive",
      })
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/police-stations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Police station registered successfully!",
        })
        router.push("/stations")
      } else {
        throw new Error(data.error || "Failed to register station")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to register station",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
          </h3>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentStep === 0 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Station Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    placeholder="Central Police Station"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="station_code">Station Code *</Label>
                  <Input
                    id="station_code"
                    value={formData.station_code}
                    onChange={(e) => updateFormData("station_code", e.target.value)}
                    placeholder="CPS001"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="jurisdiction">Jurisdiction *</Label>
                <Textarea
                  id="jurisdiction"
                  value={formData.jurisdiction}
                  onChange={(e) => updateFormData("jurisdiction", e.target.value)}
                  placeholder="Describe the area of jurisdiction..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="established_date">Established Date</Label>
                <Input
                  id="established_date"
                  type="date"
                  value={formData.established_date}
                  onChange={(e) => updateFormData("established_date", e.target.value)}
                />
              </div>
            </>
          )}

          {currentStep === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateFormData("address", e.target.value)}
                  placeholder="123 Main Street, Downtown"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateFormData("city", e.target.value)}
                    placeholder="Downtown"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => updateFormData("state", e.target.value)}
                    placeholder="California"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code *</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e) => updateFormData("postal_code", e.target.value)}
                    placeholder="90210"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    value={formData.latitude}
                    onChange={(e) => updateFormData("latitude", e.target.value)}
                    placeholder="34.0522"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    value={formData.longitude}
                    onChange={(e) => updateFormData("longitude", e.target.value)}
                    placeholder="-118.2437"
                  />
                </div>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                    placeholder="+1-555-0101"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    placeholder="station@police.gov"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="officer_in_charge">Officer in Charge *</Label>
                  <Input
                    id="officer_in_charge"
                    value={formData.officer_in_charge}
                    onChange={(e) => updateFormData("officer_in_charge", e.target.value)}
                    placeholder="Inspector John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="officer_contact">Officer Contact</Label>
                  <Input
                    id="officer_contact"
                    value={formData.officer_contact}
                    onChange={(e) => updateFormData("officer_contact", e.target.value)}
                    placeholder="+1-555-0102"
                  />
                </div>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="logo_url">Station Logo URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="logo_url"
                    value={formData.logo_url}
                    onChange={(e) => updateFormData("logo_url", e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Upload or provide a URL for the station logo</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => updateFormData("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Review Information</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Station:</span> {formData.name} ({formData.station_code})
                  </p>
                  <p>
                    <span className="font-medium">Location:</span> {formData.city}, {formData.state}
                  </p>
                  <p>
                    <span className="font-medium">Officer:</span> {formData.officer_in_charge}
                  </p>
                  <p>
                    <span className="font-medium">Contact:</span> {formData.phone}
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        {currentStep === steps.length - 1 ? (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Registering..." : "Register Station"}
          </Button>
        ) : (
          <Button onClick={nextStep}>
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
export default StationRegistrationForm;
