/**
 * Crime Report Form
 * Multi-step form for citizens to report crimes with evidence upload,
 * location selection, and incident details
 */
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
import { ArrowLeft, ArrowRight, Upload, MapPin } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { apiClient } from "@/lib/api-client"

const CASE_TYPES = [
  { value: "theft", label: "Theft" },
  { value: "assault", label: "Assault" },
  { value: "fraud", label: "Fraud" },
  { value: "vandalism", label: "Vandalism" },
  { value: "domestic_violence", label: "Domestic Violence" },
  { value: "traffic_violation", label: "Traffic Violation" },
  { value: "cybercrime", label: "Cybercrime" },
  { value: "other", label: "Other" },
]

const PRIORITY_LEVELS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
]

export default function ReportCrimePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    caseType: "",
    priority: "medium",
    incidentDate: "",
    incidentLocation: "",
    incidentLatitude: "",
    incidentLongitude: "",
    reporterPhone: "",
    reporterAddress: "",
    witnessDetails: "",
    evidenceFiles: [] as File[],
  })

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      setFormData((prev) => ({
        ...prev,
        evidenceFiles: [...prev.evidenceFiles, ...Array.from(files)],
      }))
    }
  }

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      evidenceFiles: prev.evidenceFiles.filter((_, i) => i !== index),
    }))
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            incidentLatitude: position.coords.latitude.toString(),
            incidentLongitude: position.coords.longitude.toString(),
          }))
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.title && formData.description && formData.caseType
      case 2:
        return formData.incidentDate && formData.incidentLocation
      case 3:
        return formData.reporterPhone && formData.reporterAddress
      case 4:
        return true // Optional step
      default:
        return false
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      // Get current user with detailed logging
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error("Auth error:", authError)
        throw new Error("Authentication failed")
      }

      if (!authUser) {
        console.error("No authenticated user found")
        throw new Error("Not authenticated")
      }

      // Get user profile with better error handling
      let { data: userProfiles, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_user_id", authUser.id)

      if (profileError) {
        console.error("Error fetching user profile:", profileError)
        throw new Error(`Failed to fetch user profile: ${profileError.message}`)
      }

      // Create user profile if it doesn't exist
      if (!userProfiles || userProfiles.length === 0) {
        console.log("No user profile found, creating new profile for auth user:", authUser.id)
        
        // First check if email exists
        const { data: existingUsers, error: emailCheckError } = await supabase
          .from("users")
          .select("id, auth_user_id")
          .eq("email", authUser.email)
          .single()

        if (emailCheckError && !emailCheckError.message.includes("Results contain 0 rows")) {
          console.error("Error checking existing email:", emailCheckError)
          throw new Error(`Failed to check existing email: ${emailCheckError.message}`)
        }

        if (existingUsers) {
          console.log("Found existing user with same email, using that profile:", existingUsers)
          
          // Update auth_user_id if it's different
          if (existingUsers.auth_user_id !== authUser.id) {
            const { error: updateError } = await supabase
              .from("users")
              .update({ auth_user_id: authUser.id })
              .eq("id", existingUsers.id)

            if (updateError) {
              console.error("Error updating auth_user_id:", updateError)
              throw new Error(`Failed to update auth_user_id: ${updateError.message}`)
            }
          }

          const { data: existingProfile, error: fetchError } = await supabase
            .from("users")
            .select("*")
            .eq("id", existingUsers.id)
            .single()

          if (fetchError) {
            console.error("Error fetching existing profile:", fetchError)
            throw new Error(`Failed to fetch existing profile: ${fetchError.message}`)
          }

          if (!existingProfile) {
            console.error("No profile found after update")
            throw new Error("Failed to fetch updated profile")
          }

          userProfiles = [existingProfile]
        } else {
          // Create new profile
          const newUserData = {
            auth_user_id: authUser.id,
            email: authUser.email,
            full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || "Unknown",
            role: "citizen",
            is_active: true
          }

          console.log("Creating new user profile with data:", newUserData)

          const { data: newProfile, error: createError } = await supabase
            .from("users")
            .insert([newUserData])
            .select()
            .single()

          if (createError) {
            console.error("Failed to create user profile:", createError)
            throw new Error(`Failed to create user profile: ${createError.message}`)
          }

          if (!newProfile) {
            console.error("No profile data returned after creation")
            throw new Error("Failed to create user profile: No data returned")
          }

          // Verify the profile was created
          const { data: verifyProfile, error: verifyError } = await supabase
            .from("users")
            .select("*")
            .eq("id", newProfile.id)
            .single()

          if (verifyError || !verifyProfile) {
            console.error("Failed to verify new profile:", verifyError)
            throw new Error("Failed to verify new profile")
          }

          userProfiles = [verifyProfile]
          console.log("Successfully created and verified new user profile:", verifyProfile)
        }
      }

      // Verify the user profile
      const userProfile = userProfiles[0]
      console.log("User Profile for case creation:", {
        id: userProfile.id,
        auth_user_id: userProfile.auth_user_id,
        role: userProfile.role,
        email: userProfile.email,
        matches_auth: userProfile.auth_user_id === authUser.id
      })

      if (!userProfile.id) {
        console.error("User profile has no ID:", userProfile)
        throw new Error("Invalid user profile: Missing ID")
      }

      if (userProfile.role !== 'citizen') {
        throw new Error("Only citizens can submit case reports")
      }

      // Create case using API client
      const response = await apiClient.createCase({
        title: formData.title,
        description: formData.description,
        case_type: formData.caseType,
        priority: formData.priority || 'medium',
        citizen_id: userProfile.id,
        reporter_id: userProfile.id,
        reporter_phone: formData.reporterPhone || '',
        reporter_address: formData.reporterAddress || '',
        incident_date: formData.incidentDate || new Date().toISOString(),
        incident_location: formData.incidentLocation || '',
        incident_latitude: formData.incidentLatitude ? Number.parseFloat(formData.incidentLatitude) : undefined,
        incident_longitude: formData.incidentLongitude ? Number.parseFloat(formData.incidentLongitude) : undefined,
        witness_details: formData.witnessDetails || '',
        evidence_files: formData.evidenceFiles.map((f) => f.name),
        status: "pending"
      })

      if (!response.data) {
        throw new Error("Failed to create case: No data returned")
      }

      router.push(`/citizen/cases/${response.data.id}?success=true`)
    } catch (error) {
      console.error("Error submitting case:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to submit case"
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Report a Crime</h1>
          <p className="text-gray-600">Please provide detailed information about the incident</p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </CardContent>
        </Card>

        {/* Form Steps */}
        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Basic Information"}
              {currentStep === 2 && "Incident Details"}
              {currentStep === 3 && "Contact Information"}
              {currentStep === 4 && "Evidence & Witnesses"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Provide basic details about the crime"}
              {currentStep === 2 && "When and where did the incident occur?"}
              {currentStep === 3 && "Your contact information for follow-up"}
              {currentStep === 4 && "Upload evidence and witness information"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Case Title *</Label>
                  <Input
                    id="title"
                    placeholder="Brief description of the incident"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="caseType">Crime Type *</Label>
                  <Select value={formData.caseType} onValueChange={(value) => handleInputChange("caseType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select crime type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CASE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_LEVELS.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a detailed description of what happened..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Step 2: Incident Details */}
            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="incidentDate">Date and Time of Incident *</Label>
                  <Input
                    id="incidentDate"
                    type="datetime-local"
                    value={formData.incidentDate}
                    onChange={(e) => handleInputChange("incidentDate", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="incidentLocation">Location of Incident *</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="incidentLocation"
                      placeholder="Street address or description of location"
                      value={formData.incidentLocation}
                      onChange={(e) => handleInputChange("incidentLocation", e.target.value)}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={getCurrentLocation}>
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {formData.incidentLatitude && formData.incidentLongitude && (
                  <div className="text-sm text-gray-600">
                    Location coordinates: {formData.incidentLatitude}, {formData.incidentLongitude}
                  </div>
                )}
              </>
            )}

            {/* Step 3: Contact Information */}
            {currentStep === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="reporterPhone">Your Phone Number *</Label>
                  <Input
                    id="reporterPhone"
                    type="tel"
                    placeholder="Phone number for contact"
                    value={formData.reporterPhone}
                    onChange={(e) => handleInputChange("reporterPhone", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reporterAddress">Your Address *</Label>
                  <Textarea
                    id="reporterAddress"
                    placeholder="Your current address"
                    rows={3}
                    value={formData.reporterAddress}
                    onChange={(e) => handleInputChange("reporterAddress", e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Step 4: Evidence & Witnesses */}
            {currentStep === 4 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="evidenceFiles">Evidence Files</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload photos, videos, or documents related to the incident
                    </p>
                    <Input
                      type="file"
                      multiple
                      accept="image/*,video/*,.pdf,.doc,.docx"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                      id="file-upload"
                    />
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <Button type="button" variant="outline">
                        Choose Files
                      </Button>
                    </Label>
                  </div>

                  {formData.evidenceFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">Uploaded Files:</p>
                      {formData.evidenceFiles.map((file, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">{file.name}</span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="witnessDetails">Witness Information</Label>
                  <Textarea
                    id="witnessDetails"
                    placeholder="Names and contact information of any witnesses (optional)"
                    rows={3}
                    value={formData.witnessDetails}
                    onChange={(e) => handleInputChange("witnessDetails", e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button type="button" onClick={nextStep} disabled={!validateStep(currentStep)}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="button" onClick={handleSubmit} disabled={loading}>
                  {loading ? "Submitting..." : "Submit Report"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
