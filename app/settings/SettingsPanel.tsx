// components/settings/SettingsPanel.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface Props {
  userId: string;
  showBillingControls?: boolean;
}

export default function SettingsPanel({ userId, showBillingControls = false }: Props) {
  const [loading, setLoading] = useState(false);
  const { user, isLoaded } = useUser();

  async function openStripePortal() {
    if (!userId) {
      alert("Please sign in to manage billing.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        alert(json?.error || "Unable to open billing portal");
        setLoading(false);
        return;
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
        return;
      }

      alert("No portal URL returned");
    } catch (err) {
      console.error("portal error", err);
      alert("Failed to open billing portal");
    } finally {
      setLoading(false);
    }
  }

  async function viewInvoices() {
    alert("Invoice viewer not implemented yet. Add an API to fetch invoices and render them here.");
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">Update your public profile and contact details on your account provider.</p>
      </div>

      {showBillingControls ? (
        <>
          <div className="flex gap-2">
            <Button onClick={openStripePortal} disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Opening Portal</> : "Open Billing Portal"}
            </Button>

            <Button variant="outline" onClick={viewInvoices}>View Invoices</Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Use the portal to update payment methods, view invoices, and cancel subscriptions.
          </p>
        </>
      ) : (
        <>
          <div className="mt-4">
            {loading && <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />}
            <Button
              variant="outline"
              size="sm"
              onClick={openStripePortal}
              disabled={loading || !user}
              className="mt-6"
            >
              Manage Billing Portal
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
