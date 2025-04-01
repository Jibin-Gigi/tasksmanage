import Link from "next/link"
import Image from "next/image"
import { MapPin, Briefcase, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CareersPage() {
  const openPositions = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "Remote (US)",
      type: "Full-time",
      slug: "senior-frontend-developer",
    },
    {
      id: 2,
      title: "Product Manager",
      department: "Product",
      location: "San Francisco, CA",
      type: "Full-time",
      slug: "product-manager",
    },
    {
      id: 3,
      title: "UX/UI Designer",
      department: "Design",
      location: "Remote (Global)",
      type: "Full-time",
      slug: "ux-ui-designer",
    },
    {
      id: 4,
      title: "Customer Success Manager",
      department: "Customer Success",
      location: "New York, NY",
      type: "Full-time",
      slug: "customer-success-manager",
    },
    {
      id: 5,
      title: "DevOps Engineer",
      department: "Engineering",
      location: "Remote (US)",
      type: "Full-time",
      slug: "devops-engineer",
    },
    {
      id: 6,
      title: "Content Marketing Specialist",
      department: "Marketing",
      location: "Remote (US)",
      type: "Full-time",
      slug: "content-marketing-specialist",
    },
  ]

  const benefits = [
    {
      title: "Flexible Work",
      description: "Work from anywhere with flexible hours",
      icon: "🌎",
    },
    {
      title: "Competitive Salary",
      description: "Above-market compensation packages",
      icon: "💰",
    },
    {
      title: "Health Benefits",
      description: "Comprehensive health, dental, and vision coverage",
      icon: "🏥",
    },
    {
      title: "Learning Budget",
      description: "Annual budget for courses and conferences",
      icon: "📚",
    },
    {
      title: "Paid Time Off",
      description: "Generous vacation policy and paid holidays",
      icon: "🏖️",
    },
    {
      title: "Team Retreats",
      description: "Annual company retreats to exciting locations",
      icon: "✈️",
    },
  ]

  return (
    <div className="container py-12 md:py-16 lg:py-24">
      {/* Hero Section */}
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">Join Our Team</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Help us transform the way people work with gamified productivity
        </p>
      </div>

      {/* Company Culture */}
      <div className="mt-16 grid gap-12 md:grid-cols-2 items-center">
        <div className="relative h-[300px] w-full rounded-lg overflow-hidden">
          <Image
            src="/placeholder.svg?height=600&width=800&text=Our Culture"
            alt="TaskMaster team culture"
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h2 className="text-3xl font-bold">Our Culture</h2>
          <p className="mt-4 text-muted-foreground">
            At TaskMaster, we believe that work should be engaging and rewarding. We apply the same gamification
            principles that power our product to our own workplace culture.
          </p>
          <p className="mt-4 text-muted-foreground">
            We're a diverse team of passionate individuals who are committed to building the best productivity tools. We
            value creativity, collaboration, and continuous learning.
          </p>
          <p className="mt-4 text-muted-foreground">
            Whether you're working remotely or in one of our offices, you'll be part of a supportive community that
            celebrates achievements and helps each other grow.
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="mt-24">
        <h2 className="text-3xl font-bold text-center">Benefits & Perks</h2>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex flex-col items-start rounded-lg border p-6">
              <div className="text-4xl">{benefit.icon}</div>
              <h3 className="mt-4 text-xl font-bold">{benefit.title}</h3>
              <p className="mt-2 text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Open Positions */}
      <div className="mt-24">
        <h2 className="text-3xl font-bold text-center">Open Positions</h2>
        <div className="mt-12 grid gap-6">
          {openPositions.map((position) => (
            <Link
              key={position.id}
              href={`/company/careers/${position.slug}`}
              className="group flex flex-col rounded-lg border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{position.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Briefcase className="mr-1 h-4 w-4" />
                      <span>{position.department}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-1 h-4 w-4" />
                      <span>{position.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>{position.type}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    View Position <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-24 rounded-lg bg-muted p-8 text-center">
        <h2 className="text-3xl font-bold">Don't See a Perfect Fit?</h2>
        <p className="mt-4 text-muted-foreground">
          We're always looking for talented individuals to join our team. Send us your resume and let us know how you
          can contribute.
        </p>
        <Button size="lg" className="mt-6">
          Submit Your Resume
        </Button>
      </div>
    </div>
  )
}

