// components/settings/LiveUserPanel.tsx
"use client";
import { useEffect, useState, useRef } from "react";


export default function BillingPage({ userId }: { userId: string }) {
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const evtSourceRef = useRef<EventSource|null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetchUserInfo(userId).then((json) => setInfo(json)).catch(console.error).finally(()=>setLoading(false));

    // SSE subscription
    const es = new EventSource("/api/events/stream");
    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        // payload should include enough info to decide relevance
        if (payload?.type === "stripe_event" || payload?.type === "clerk_event" || payload?.type === "user_update") {
          // refetch minimal info or merge updates
          fetchUserInfo(userId).then(setInfo).catch(console.error);
        }
      } catch {}
    };
    evtSourceRef.current = es;
    return () => { es.close(); evtSourceRef.current = null; };
  }, [userId]);

  async function onSave(updates: any) {
    setLoading(true);
    const res = await updateUser(userId, updates);
    if (res.ok) {
      // optimistic fetch
      const json = await res.json().catch(()=>null);
      if (json?.user) setInfo((prev:any)=>({...prev, clerk: json.user}));
      setEditing(false);
    } else {
      console.error(await res.text());
      alert("Failed to update");
    }
    setLoading(false);
  }

  async function onDelete() {
    if (!confirm("Delete account? This is irreversible.")) return;
    const res = await deleteUser(userId);
    if (res.ok) {
      // handle sign-out / redirect
      window.location.href = "/";
    } else {
      alert("Failed to delete account");
    }
  }

  if (!userId) return <div>Please sign in</div>;
  if (loading && !info) return <div>Loading...</div>;

  return (
    <div>
      <div className="border rounded p-4 mb-4">
        <h3 className="font-semibold">Profile</h3>
        <div>Username: {info?.clerk?.username ?? "—"}</div>
        <div>Email: {info?.clerk?.email ?? "—"}</div>
        <div>Stripe Customer: {info?.db?.stripeCustomerId ?? "—"}</div>

        <div className="mt-2">
          <button onClick={()=>setEditing(true)} disabled={loading}>Edit</button>
          <button onClick={onDelete} disabled={loading}>Delete</button>
        </div>
      </div>

      <div className="border rounded p-4 mb-4">
        <h3 className="font-semibold">Subscriptions</h3>
        <SubscriptionsList userId={userId} />
      </div>

      <div className="border rounded p-4">
        <h3 className="font-semibold">Invoices</h3>
        <InvoicesList userId={userId} />
      </div>
    </div>
  );
}
