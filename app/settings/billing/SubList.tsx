// components/billing/SubscriptionsList.tsx
"use client";

import { useEffect, useState } from "react";

type Sub = {
  id: string;
  status: string;
  product: string | null;
  priceId: string | null;
  current_period_start?: number;
  current_period_end?: number;
  quantity?: number;
};

export default function SubscriptionsList({ userId }: { userId: string }) {
  const [subs, setSubs] = useState<Sub[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch("/api/stripe/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.error) {
          setError(json.error);
          setSubs([]);
          return;
        }
        setSubs(json.subscriptions ?? []);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [userId]);

  if (!userId) return <div className="text-sm text-muted-foreground">Sign in to view subscriptions.</div>;
  if (loading) return <div className="text-sm">Loading subscriptions...</div>;
  if (error) return <div className="text-sm text-destructive">Error: {error}</div>;
  if (!subs || subs.length === 0) return <div className="text-sm text-muted-foreground">No active subscriptions</div>;

  return (
    <div className="space-y-3">
      {subs.map((s) => (
        <div key={s.id} className="border rounded p-3 flex justify-between items-center">
          <div>
            <div className="font-medium">{s.product ?? s.priceId}</div>
            <div className="text-xs text-muted-foreground">Status: {s.status}</div>
            <div className="text-xs text-muted-foreground">
              Period: {s.current_period_start ? new Date(s.current_period_start * 1000).toLocaleDateString() : "—"}
              {" — "}
              {s.current_period_end ? new Date(s.current_period_end * 1000).toLocaleDateString() : "—"}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">{s.quantity} qty</div>
        </div>
      ))}
    </div>
  );
}
