"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, Sparkles } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { SUBSCRIPTION_PLANS } from "@/lib/db/subscriptions"

export default function PricingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      router.push("/login")
      return
    }

    setLoading(planId)

    try {
      const response = await fetch("/api/stripe/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          userId: user.id,
          organizationId: user.activeOrganizationId,
          email: user.email || `${user.username}@example.com`,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.message || "Failed to create checkout session")
      }
    } catch (error) {
      console.error("[v0] Subscribe error:", error)
      alert("Failed to start subscription process")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground text-lg">
            Start with 500 free credits, then upgrade for unlimited possibilities
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`relative p-8 ${
                plan.popular ? "border-emerald-500 border-2 shadow-lg shadow-emerald-500/20" : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">${(plan.price / 100).toFixed(0)}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>

              <Button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id}
                className={`w-full mb-6 ${
                  plan.popular ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-secondary hover:bg-secondary/80"
                }`}
              >
                {loading === plan.id ? "Processing..." : "Subscribe"}
              </Button>

              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Free Tier Info */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto p-8 border-border">
            <h3 className="text-xl font-bold mb-2">Start Free</h3>
            <p className="text-muted-foreground mb-4">
              Every new account gets 500 free credits to explore our AI chat platform. No credit card required!
            </p>
            <Button onClick={() => router.push("/register")} variant="outline">
              Get Started Free
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
