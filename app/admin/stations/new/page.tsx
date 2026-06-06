import { StationRegistrationForm } from "@/components/admin/station-registration-form"

export default function NewStationPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Register New Police Station</h2>
        <p className="text-muted-foreground">Complete the multi-step form to register a new police station</p>
      </div>

      <StationRegistrationForm />
    </div>
  )
}