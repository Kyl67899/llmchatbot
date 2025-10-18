// components/billing/InvoicesList.tsx
"use client";

import { useEffect, useState } from "react";

type Invoice = {
  id: string;
  number?: string | null;
  status: string;
  amount_paid: number;
  amount_due: number;
  currency: string;
  hosted_invoice_url?: string | null;
  invoice_pdf?: string | null;
  created?: number;
};

export default function InvoicesList({ userId }: { userId: string }) {
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch("/api/stripe/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, limit: 50 }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.error) {
          setError(json.error);
          setInvoices([]);
          return;
        }
        setInvoices(json.invoices ?? []);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [userId]);

  if (!userId) return <div className="text-sm text-muted-foreground">Sign in to view invoices.</div>;
  if (loading) return <div className="text-sm">Loading invoices...</div>;
  if (error) return <div className="text-sm text-destructive">Error: {error}</div>;
  if (!invoices || invoices.length === 0) return <div className="text-sm text-muted-foreground">No invoices found</div>;

  return (
    <div className="space-y-3">
      {invoices.map((inv) => (
        <div key={inv.id} className="border rounded p-3 flex justify-between items-center">
          <div>
            <div className="font-medium">{inv.number ?? inv.id}</div>
            <div className="text-xs text-muted-foreground">Status: {inv.status}</div>
            <div className="text-xs text-muted-foreground">
              Amount Paid: {(inv.amount_paid / 100).toFixed(2)} {inv.currency.toUpperCase()}
            </div>
            <div className="text-xs text-muted-foreground">
              Date: {inv.created ? new Date(inv.created * 1000).toLocaleDateString() : "—"}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {inv.hosted_invoice_url ? (
              <a href={inv.hosted_invoice_url} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
                View invoice
              </a>
            ) : inv.invoice_pdf ? (
              <a href={inv.invoice_pdf} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
                Download PDF
              </a>
            ) : null}
            <div className="text-xs text-muted-foreground">{inv.status}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
