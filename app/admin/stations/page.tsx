"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, MapPin, Phone, Mail } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface PoliceStation {
  id: string
  name: string
  station_code: string
  address: string
  city: string
  state: string
  phone: string
  email: string
  officer_in_charge: string
  status: string
  created_at: string
  cases: { count: number }[]
}

export default function StationsPage() {
  const [stations, setStations] = useState<PoliceStation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchStations()
  }, [])

  async function fetchStations() {
    try {
      const response = await fetch("/api/police-stations")
      const data = await response.json()

      if (data.success) {
        setStations(data.stations)
      }
    } catch (error) {
      console.error("Failed to fetch stations:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredStations = stations.filter(
    (station) =>
      station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.station_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.city.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Police Stations</h2>
          <p className="text-muted-foreground">Manage all registered police stations</p>
        </div>
        <Button asChild>
          <Link href="/admin/stations/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Station
          </Link>
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
                <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted animate-pulse rounded" />
                  <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredStations.map((station) => (
            <Card key={station.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{station.name}</CardTitle>
                    <CardDescription>{station.station_code}</CardDescription>
                  </div>
                  <Badge
                    variant={station.status === "active" ? "default" : "secondary"}
                    className={station.status === "active" ? "bg-green-100 text-green-800" : ""}
                  >
                    {station.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>
                    {station.city}, {station.state}
                  </span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="mr-2 h-4 w-4" />
                  <span>{station.phone}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="mr-2 h-4 w-4" />
                  <span>{station.email}</span>
                </div>
                {station.officer_in_charge && (
                  <div className="text-sm">
                    <span className="font-medium">Officer in Charge:</span>
                    <br />
                    <span className="text-muted-foreground">{station.officer_in_charge}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Cases: {station.cases?.[0]?.count || 0}</span>
                  <span className="text-xs text-muted-foreground">
                    Added {formatDistanceToNow(new Date(station.created_at), { addSuffix: true })}
                  </span>
                </div>
                <Button asChild className="w-full">
                  <Link href={`/admin/stations/${station.id}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredStations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No stations found matching your search.</p>
        </div>
      )}
    </div>
  )
}
