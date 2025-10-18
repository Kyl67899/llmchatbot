"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Calendar, AlertCircle } from "lucide-react"

interface Subscription {
  id: string
  planId: string
  status: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  plan: {
    name: string
    monthlyCredits: number
    price: number
  }
}

interface SubscriptionManagerProps {
  organizationId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SubscriptionManager({ organizationId, open, onOpenChange }: SubscriptionManagerProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchSubscription()
    }
  }, [open, organizationId])

  const fetchSubscription = async () => {
    try {
      const response = await fetch(`/api/stripe/subscription?organizationId=${organizationId}`)
      if (response.ok) {
        const data = await response.json()
        setSubscription(data.subscription)
      }
    } catch (error) {
      console.error("Error fetching subscription:", error)
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscription || !confirm("Are you sure you want to cancel your subscription?")) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: subscription.id }),
      })

      if (response.ok) {
        alert("Subscription canceled successfully")
        fetchSubscription()
      } else {
        alert("Failed to cancel subscription")
      }
    } catch (error) {
      console.error("Error canceling subscription:", error)
      alert("Failed to cancel subscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>Subscription Management</DialogTitle>
          <DialogDescription>Manage your subscription and billing</DialogDescription>
        </DialogHeader>

        {subscription ? (
          <div className="space-y-4">
            <Card className="p-4 border-border">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{subscription.plan.name} Plan</h3>
                  <p className="text-sm text-muted-foreground">${(subscription.plan.price / 100).toFixed(2)}/month</p>
                </div>
                <Badge
                  variant={subscription.status === "active" ? "default" : "secondary"}
                  className={subscription.status === "active" ? "bg-emerald-500" : ""}
                >
                  {subscription.status}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  <span>{subscription.plan.monthlyCredits} credits per month</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
                </div>
              </div>

              {subscription.cancelAtPeriodEnd && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <p className="text-sm text-yellow-500">
                    Your subscription will be canceled at the end of the current billing period.
                  </p>
                </div>
              )}
            </Card>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => (window.location.href = "/pricing")}
              >
                Change Plan
              </Button>
              {!subscription.cancelAtPeriodEnd && (
                <Button variant="destructive" onClick={handleCancelSubscription} disabled={loading}>
                  {loading ? "Canceling..." : "Cancel Subscription"}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">You don't have an active subscription</p>
            <Button onClick={() => (window.location.href = "/pricing")}>View Plans</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
