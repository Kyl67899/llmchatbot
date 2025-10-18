// app/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import SettingsPanel from "./SettingsPanel";
import InvoicesList from "./billing/invoicesList";
import SubscriptionsList from "./billing/SubList";
import { SubscriptionManager } from "@/components/subscription-manager";

export default function Setting() {
  const { user, isLoaded } = useUser();
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  async function openStripePortal() {
    if (!user) {
      alert("Please sign in to manage billing.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user }),
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

  useEffect(() => {
    if (isLoaded) {
      setEmail(user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress ?? undefined);
    }
  }, [user, isLoaded]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>
      <div className="mb-6">
        <Link href="/chat" className="text-sm text-primary hover:underline ">
          &larr; Go to Chat
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 border rounded-lg p-4">
          <h2 className="text-lg font-medium mb-2">Account</h2>
          <p className="text-sm text-muted-foreground mb-4">Profile information and account actions.</p>
          <div className="space-y-2">
            <div>
              <div className="text-xs text-muted-foreground">Username</div>
              <div className="font-medium">{user?.username ?? user?.fullName ?? "—"}</div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Email</div>
              <div className="font-medium">{email ?? "—"}</div>
            </div>
          </div>
        </div>

        <div className="col-span-2 border rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4">Quick Settings</h2>
          <SettingsPanel userId={user?.id ?? ""} />


          <h2 className="text-lg font-medium mt-8 mb-4">Invoices</h2>
          <InvoicesList userId={user?.id ?? ""} />

          <h2 className="text-lg font-medium mt-8 mb-4">
            SubScription Details
          </h2>
          <p className="text-sm text-muted-foreground mb-4">View and manage your subscription details.</p>
          <SubscriptionsList userId={user?.id ?? ""} />

          <SubscriptionManager />
        </div>
      </div>
    </div>
  );
}