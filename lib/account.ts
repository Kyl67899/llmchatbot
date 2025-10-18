// src/lib/account.ts
async function callAccount(action: string, userId: string, payload?: any) {
    const res = await fetch("/api/account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, userId, payload }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || "Account API error");
    return json;
  }
  
  export const accountApi = {
    getInfo: (userId: string) => callAccount("getInfo", userId),
    update: (userId: string, updates: any) => callAccount("update", userId, { updates }),
    delete: (userId: string) => callAccount("delete", userId),
    subscriptions: (userId: string, opts?: any) => callAccount("subscriptions", userId, opts),
    invoices: (userId: string, opts?: any) => callAccount("invoices", userId, opts),
    payments: (userId: string, opts?: any) => callAccount("payments", userId, opts),
    portal: (userId: string) => callAccount("portal", userId),
  };
  