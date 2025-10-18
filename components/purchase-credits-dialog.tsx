"use client"

import { useState } from "react"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { getDefaultPackages } from "@/lib/db/payments"

interface PurchaseCreditsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  organizationId: string
}

export function PurchaseCreditsDialog({ open, onOpenChange, userId }: PurchaseCreditsDialogProps) {
  const [loading, setLoading] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const packages = getDefaultPackages()

  const handlePurchase = async ({ packageId, userId,  }: { packageId: string; userId: string; }) => {
    if (!userId) {
      alert("Missing user. Please sign in or select an organization.");
      return;
    }

    setLoading(true);
    setSelectedPackage(packageId);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId,
          userId,
          returnUrl: window.location.href,
        }),
      });

      const data = await response.json().catch(() => ({}));
      console.log("Checkout response:", response.status, data);

      if (!response.ok) {
        if (response.status === 503) {
          alert("Stripe is not configured. Please add your Stripe API keys in the environment variables.");
        } else {
          alert(data?.error || "Failed to create checkout session");
        }
        setLoading(false);
        setSelectedPackage(null);
        return;
      }

      if (data?.url) {
        // redirect to Stripe Checkout
        window.location.href = data.url;
        return;
      }

      alert("No checkout URL returned. Try again.");
      setLoading(false);
      setSelectedPackage(null);
    } catch (error) {
      console.error("Purchase error:", error);
      alert("Failed to initiate purchase. Please try again.");
      setLoading(false);
      setSelectedPackage(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] sm:max-h-[400px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Purchase Credits
          </DialogTitle>
          <DialogDescription>
            Choose a credit package to continue using AI chat features
          </DialogDescription>

          <div className="grid gap-4 py-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={cn(
                  "relative border rounded-lg p-6 cursor-pointer transition-all hover:border-primary",
                  pkg.popular && "border-primary bg-primary/5",
                )}
                onClick={() => !loading && handlePurchase({ packageId: pkg.id, userId })}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{pkg.name}</h3>
                    <p className="text-2xl font-bold text-emerald-500 mt-1">{pkg.credits} Credits</p>
                    <p className="text-sm text-muted-foreground mt-2">${(pkg.price / 100).toFixed(2)} monthly payment</p>
                  </div>

                  <Button
                    disabled={loading}
                    className={cn("min-w-[100px]", loading && selectedPackage === pkg.id && "opacity-50")}
                  >
                    {loading && selectedPackage === pkg.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing
                      </>
                    ) : (
                      "Purchase"
                    )}
                  </Button>
                </div>

                <div className="mt-4 space-y-2">
                  {/* TODO: Make this only available for pro or enterprise version */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span>Use across all your organizations</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span>No expiration date</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span>Secure payment via Stripe</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Payments are processed securely through Stripe. Credits are added instantly after successful payment.
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
