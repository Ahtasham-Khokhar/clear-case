"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Shield,
  FileText,
  Users,
  BarChart3,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
} from "lucide-react"

export default function HomePage() {
  const features = [
    {
      icon: FileText,
      title: "Case Management",
      description:
        "Efficiently track and manage police cases from report to resolution",
    },
    {
      icon: Users,
      title: "Multi-Role Access",
      description:
        "Separate dashboards for citizens, police officers, and administrators",
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description:
        "Comprehensive analytics and reporting for better decision making",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with role-based access control",
    },
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Get instant notifications about case status changes",
    },
    {
      icon: CheckCircle,
      title: "Easy to Use",
      description: "Intuitive interface designed for all user types",
    },
  ]

  const stats = [
    { label: "Cases Resolved", value: "2,500+" },
    { label: "Active Users", value: "1,200+" },
    { label: "Police Stations", value: "50+" },
    { label: "Response Time", value: "Under 2 hrs" },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Shield className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Modern Police Case
            <span className="gradient-text block">Management System</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Streamline law enforcement operations with our comprehensive case
            management platform. Built for efficiency, transparency, and
            community safety.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-3" asChild>
              <Link href="/auth/register">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Button variant="outline" size="lg" className="text-lg px-8 py-3" asChild>
              <Link href="/report">
                Report a Case
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful Features for Modern Policing
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to manage cases efficiently and serve your
              community better
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card
                  key={index}
                  className="glass hover:shadow-lg transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How Case-Clear Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Simple steps to efficient case management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Report Case",
                description:
                  "Citizens can easily report cases online with detailed information and evidence",
              },
              {
                title: "Assign & Investigate",
                description:
                  "Cases are automatically assigned to appropriate officers for investigation",
              },
              {
                title: "Track & Resolve",
                description:
                  "Real-time updates keep everyone informed until case resolution",
              },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trusted by Law Enforcement
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our users say about Case-Clear
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "Case-Clear has revolutionized how we handle cases. The efficiency gains are remarkable.",
                name: "Chief Inspector Sarah Johnson",
                role: "Metro Police Department",
              },
              {
                quote:
                  "As a citizen, I love how easy it is to report cases and track their progress.",
                name: "Michael Chen",
                role: "Community Member",
              },
              {
                quote:
                  "The analytics dashboard helps us make data-driven decisions for better policing.",
                name: "Captain Maria Rodriguez",
                role: "Central Police Station",
              },
            ].map((testimonial, i) => (
              <Card key={i} className="glass">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[1, 2, 3, 4, 5].map((starNum) => (
                      <Star
                        key={starNum}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary">
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
  <Button size="lg" variant="outline" className=" bg-transparent text-lg px-8 py-3" asChild>
    <Link href="/auth/register">
      Start Free Trial
    </Link>
  </Button>

  <Button size="lg" variant="outline" className="text-lg px-8 py-3" asChild>
    <Link href="/contact">
      Contact Sales
    </Link>
  </Button>
</div>
      </section>
    </div>
  )
}