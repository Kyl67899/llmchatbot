// "use client"

// import { useCallback, useEffect, useState } from "react"
// import { useRouter } from "next/navigation"
// import { useUser, useClerk, SignedIn, SignedOut } from "@clerk/nextjs"

// import { ChatSidebar } from "@/components/chat-sidebar"
// import { ChatHeader } from "@/components/chat-header"
// import { ChatMessages } from "@/components/chat-messages"
// import { ChatInput } from "@/components/chat-input"
// import { InsufficientCreditsDialog } from "@/components/insufficient-credits-dialog"
// import { OrganizationDialog } from "@/components/organization-dialog"
// import { CreateOrganizationDialog } from "@/components/create-organization-dialog"
// import { PurchaseCreditsDialog } from "@/components/purchase-credits-dialog"
// import { toast } from "sonner"

// export default function ChatPage() {
//   const router = useRouter()
//   const { user: clerkUser } = useUser()
//   const { signOut: clerkSignOut } = useClerk()

//   const [dbUser, setDbUser] = useState<any>(null)
//   const [conversations, setConversations] = useState<any[]>([])
//   const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
//   const [currentMessages, setCurrentMessages] = useState<any[]>([])
//   const [userOrganizations, setUserOrganizations] = useState<any[]>([])
//   const [currentOrgId, setCurrentOrgId] = useState<string>("")
//   const [credits, setCredits] = useState<number>(500)
//   const [showInsufficientCredits, setShowInsufficientCredits] = useState(false)
//   const [showOrgDialog, setShowOrgDialog] = useState(false)
//   const [showCreateOrgDialog, setShowCreateOrgDialog] = useState(false)
//   const [showPurchaseCreditsDialog, setShowPurchaseCreditsDialog] = useState(false);
//   const currentOrganization = userOrganizations.find((org) => org.id === currentOrgId) || null;

//   const [messages, setMessages] = useState<any[]>([])
//   const [sending, setSending] = useState(false)

//   // const sendMessage = useCallback(async (content: string) => {
//   //   console.log("parent sendMessage called with:", content)

//   //   if (!conversations) {
//   //     console.warn("No conversation selected")
//   //     return
//   //   }

//   //   if (credits <= 0) {
//   //     console.warn("Insufficient credits")
//   //     return
//   //   }

//   // optimistic user message
//   //   const userMsg = {
//   //     id: `tmp-${Date.now()}`,
//   //     role: "user",
//   //     content,
//   //     createdAt: new Date().toISOString(),
//   //   }
//   //   setMessages((m) => [...m, userMsg])

//   //   setSending(true)
//   //   try {
//   //     const res = await fetch("/api/chat/send", {
//   //       method: "POST",
//   //       headers: { "Content-Type": "application/json" },
//   //       body: JSON.stringify({ conversations, orgId: currentOrgId, content }),
//   //     })

//   //     if (!res.ok) {
//   //       const text = await res.text().catch(() => "")
//   //       throw new Error(`API error ${res.status} ${text}`)
//   //     }

//   //     const json = await res.json()
//   // expected: { assistant: { id, role, content, createdAt } }
//   //     if (json.assistant) {
//   //       setMessages((m) => [...m, json.assistant])
//   //       setCredits((c) => Math.max(0, c - 1))
//   //     } else if (Array.isArray(json.messages)) {
//   //       setMessages(json.messages)
//   //     } else {
//   //       console.warn("Unexpected API response", json)
//   //     }
//   //   } catch (err) {
//   //     console.error("sendMessage error:", err)
//   //   } finally {
//   //     setSending(false)
//   //   }
//   // }, [conversations, currentOrgId, credits]);



//   // const orgsRes = await fetch("/api/organizations", {
//   //   method: "POST",
//   //   headers: { "Content-Type": "application/json" },
//   //   body: JSON.stringify({ userId: user.id }),
//   // });

//   // const orgs = await orgsRes.json()
//   // setUserOrganizations(orgs)
//   // setCredits(orgs[0]?.credits || 0)

//   useEffect(() => {
//     const loadUser = async () => {
//       if (!clerkUser?.id) return

//       // 1. Fetch user from your database
//       const userRes = await fetch("/api/user", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           clerkId: clerkUser.id,
//           username: clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress,
//           email: clerkUser.emailAddresses[0]?.emailAddress,
//         }),
//       })

//       console.log("Clerk ID:", clerkUser?.id);

//       const user = await userRes.json();

//       if (!user || !user.id) {
//         console.error("User not found or missing ID");
//         return
//       }

//       setDbUser(user);

//       // 2. Fetch organizations
//       const orgsRes = await fetch("/api/organizations", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId: user.id }),
//       });

//       const orgs = await orgsRes.json();
//       setUserOrganizations(orgs);

//       if (orgs.length > 0) {
//         const org = orgs[0];
//         setCurrentOrgId(org.id);
//         setCredits(org.credits);

//         // 3. Fetch conversations
//         const convRes = await fetch("/api/conversations", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ userId: user.id, orgId: org.id }),
//         })
//         const convs = await convRes.json()
//         setConversations(convs)

//         if (convs.length > 0) {
//           setCurrentConversationId(convs[0].id)
//           setCurrentMessages(convs[0].messages)
//         }
//       }

//       // 4. Fetch notifications (optional)
//       const notifRes = await fetch("/api/notifications", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId: user.id }),
//       })
//       const notifications = await notifRes.json()
//       // setNotifications(notifications) ← if you have a state for this
//     }

//     loadUser();
//   }, [clerkUser]);

//   // handle create ogranization
//   const handleCreateOrganization = async (name: string) => {
//     const res = await fetch("/api/create-organization", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ name, userId: dbUser.id }),
//     })

//     if (res.ok) {
//       const newOrg = await res.json();
//       setUserOrganizations((prev) => [...prev, newOrg]);
//       setCurrentOrgId(newOrg.id);
//       setCredits(newOrg.credits);
//     } else {
//       console.error("Failed to create organization");
//     }
//   };

//   // handle switch organization
//   const handleSwitchOrganization = async (orgId: string) => {
//     setCurrentOrgId(orgId);

//     const res = await fetch("/api/organizations", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ userId: dbUser.id }),
//     });

//     const orgs = await res.json();
//     const selected = orgs.find((o) => o.id === orgId);
//     if (selected) {
//       setCredits(selected.credits)
//     };
//   };

//   // handle send message
//   const sendMessage = async (content: string) => {
//     if (!dbUser || !currentConversationId || !currentOrgId) {
//       console.warn("missing user/conversation/org")
//       return
//     }

//     if (credits <= 0) {
//       setShowInsufficientCredits(true)
//       return
//     }

//     // optimistic user message
//     const optimisticUserMsg = {
//       id: `tmp-${Date.now()}`,
//       role: "user",
//       content,
//       createdAt: new Date().toISOString(),
//     }
//     setCurrentMessages((prev) => [...prev, optimisticUserMsg])

//     setSending(true)
//     try {
//       const res = await fetch("/api/send-message", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           userId: dbUser.id,
//           conversationId: currentConversationId,
//           orgId: currentOrgId,
//           content,
//           role: "user",
//         }),
//       })

//       if (!res.ok) {
//         const text = await res.text().catch(() => "")
//         throw new Error(`send failed: ${res.status} ${text}`)
//       }

//       const payload = await res.json()
//       // server should return { userMessage, assistantMessage, creditsUsed?: number }
//       // adapt to your API shape
//       const { userMessage, assistantMessage, creditsUsed = 1 } = payload

//       // replace optimistic user message with server-saved one (optional)
//       setCurrentMessages((prev) => {
//         // remove optimistic message if it exists (match on tmp id or timestamps)
//         const withoutTmp = prev.filter((m) => !String(m.id).startsWith("tmp-"))
//         // append server user message (if provided) and assistant message
//         return [
//           ...withoutTmp,
//           ...(userMessage ? [userMessage] : []),
//           ...(assistantMessage ? [assistantMessage] : []),
//         ]
//       })

//       // deduct credits after successful send
//       setCredits((c) => Math.max(0, c - creditsUsed))
//     } catch (err) {
//       console.error("sendMessage error:", err)
//       // optional: indicate failure to the user, remove optimistic message, or mark it failed
//       setCurrentMessages((prev) => prev.filter((m) => !String(m.id).startsWith("tmp-")))
//       toast?.error?.("Failed to send message")
//     } finally {
//       setSending(false)
//     }
//   }

//   // handle select conversation
//   const handleSelectConversation = (id: string) => {
//     const conv = conversations.find((c) => c.id === id);
//     if (conv) {
//       setCurrentConversationId(id);
//       setCurrentMessages(conv.messages);
//     }
//   };

//   // handle new chat
//   const handleNewChat = async () => {
//     const res = await fetch("/api/new-conversation", {
//       method: "POST",
//       body: JSON.stringify({
//         userId: dbUser.id,
//         orgId: currentOrgId,
//         title: `New Chat ${new Date().toLocaleString()}`,
//       }),
//     });

//     const newConv = await res.json();
//     setConversations((prev) => [newConv, ...prev]);
//     setCurrentConversationId(newConv.id);
//     setCurrentMessages([]);
//   };

//   // handle delete conversation
//   const handleDeleteConversation = async (id: string) => {
//     await fetch("/api/delete-conversation", {
//       method: "POST",
//       body: JSON.stringify({ id }),
//     });

//     const updated = conversations.filter((c) => c.id !== id)
//     setConversations(updated);

//     if (currentConversationId === id) {
//       if (updated.length > 0) {
//         setCurrentConversationId(updated[0].id);
//         setCurrentMessages(updated[0].messages);
//       } else {
//         setCurrentConversationId(null);
//         setCurrentMessages([]);
//       };
//     };
//   };

//   return (
//     <>
//       <SignedIn>
//         <div className="h-screen flex bg-black">
//           <div className="w-80 flex-shrink-0">
//             <ChatSidebar
//               conversations={conversations}
//               currentConversationId={currentConversationId}
//               onSelectConversation={handleSelectConversation}
//               onNewChat={handleNewChat}
//               onDeleteConversation={handleDeleteConversation}
//               onLogout={async () => {
//                 await clerkSignOut()
//                 router.push("/login")
//               }}
//               username={dbUser?.username}
//               credits={credits}
//               organizations={userOrganizations}
//               currentOrgId={currentOrgId}
//               currentOrganization={currentOrganization}
//               onSwitchOrganization={handleSwitchOrganization}
//               // onCreateOrganization={handleCreateOrganization}
//               // onSwitchOrganization={setCurrentOrgId}
//               onManageOrganization={() => setShowOrgDialog(true)}
//               // onCreateOrganization={() => setShowCreateOrgDialog(true)}
//               onPurchaseCredits={() => setShowPurchaseCreditsDialog(true)}
//             />
//           </div>

//           <div className="flex flex-col flex-1">
//             <ChatHeader userId={clerkUser?.id || ""} onOpenSettings={() => { }} />
//             <ChatMessages messages={messages} />
//             <ChatInput
//               conversationId={currentConversationId}
//               userId={dbUser?.id}
//               orgId={currentOrgId}
//               credits={credits}
//               setCredits={setCredits}
//               onInsufficientCredits={() => setShowInsufficientCredits(true)}
//               // onSendMessage={handleSendMessage}
//               onSendMessage={sendMessage} disabled={sending || credits <= 0}
//             // disabled={!currentConversationId || !dbUser}
//             />
//           </div>

//           <InsufficientCreditsDialog
//             open={showInsufficientCredits}
//             onClose={() => setShowInsufficientCredits(false)}
//           />

//           <OrganizationDialog
//             open={showOrgDialog}
//             onClose={() => setShowOrgDialog(false)}
//           />

//           <CreateOrganizationDialog
//             open={showCreateOrgDialog}
//             onOpenChange={setShowCreateOrgDialog}
//             onCreateOrganization={handleCreateOrganization}
//           />

//           <PurchaseCreditsDialog
//             open={showPurchaseCreditsDialog}
//             onOpenChange={(open) => setShowPurchaseCreditsDialog(open)}
//             userId={dbUser?.id}
//             organizationId={currentOrgId}
//           />

//         </div>
//       </SignedIn>

//       <SignedOut>
//         <div className="h-screen flex items-center justify-center bg-black text-white">
//           <p>
//             Please{" "}
//             <a href="/login" className="underline text-primary">
//               sign in
//             </a>{" "}
//             to access the chat.
//           </p>
//         </div>
//       </SignedOut>
//     </>
//   )
// }

"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser, useClerk, SignedIn, SignedOut } from "@clerk/nextjs"
import { toast } from "sonner"

import { ChatSidebar } from "@/components/chat-sidebar"
import { ChatHeader } from "@/components/chat-header"
import { ChatMessages } from "@/components/chat-messages"
import { ChatInput } from "@/components/chat-input"
import { InsufficientCreditsDialog } from "@/components/insufficient-credits-dialog"
import { OrganizationDialog } from "@/components/organization-dialog"
import { CreateOrganizationDialog } from "@/components/create-organization-dialog"
import { PurchaseCreditsDialog } from "@/components/purchase-credits-dialog"

export default function ChatPage() {
  const router = useRouter()
  const { user: clerkUser } = useUser()
  const { signOut: clerkSignOut } = useClerk()

  const [dbUser, setDbUser] = useState<any>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [currentMessages, setCurrentMessages] = useState<any[]>([])
  const [userOrganizations, setUserOrganizations] = useState<any[]>([])
  const [currentOrgId, setCurrentOrgId] = useState<string>("")
  const [credits, setCredits] = useState<number>(500)
  const [showInsufficientCredits, setShowInsufficientCredits] = useState(false)
  const [showOrgDialog, setShowOrgDialog] = useState(false)
  const [showCreateOrgDialog, setShowCreateOrgDialog] = useState(false)
  const [showPurchaseCreditsDialog, setShowPurchaseCreditsDialog] = useState(false)
  const currentOrganization = userOrganizations.find((org) => org.id === currentOrgId) || null

  const [sending, setSending] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      if (!clerkUser?.id) return

      try {
        // 1. Fetch or create user record
        const userRes = await fetch("/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clerkId: clerkUser.id,
            username: clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress,
            email: clerkUser.emailAddresses[0]?.emailAddress,
          }),
        })
        const user = await userRes.json()
        if (!user || !user.id) {
          console.error("User not found or missing ID")
          return
        }
        setDbUser(user)

        // 2. Fetch organizations
        const orgsRes = await fetch("/api/organizations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        })
        const orgs = await orgsRes.json()
        setUserOrganizations(orgs || [])

        if (orgs && orgs.length > 0) {
          const org = orgs[0]
          setCurrentOrgId(org.id)
          setCredits(org.credits ?? credits)

          // 3. Fetch conversations for selected org
          const convRes = await fetch("/api/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, orgId: org.id }),
          })
          const convs = await convRes.json()
          setConversations(convs || [])

          if (convs && convs.length > 0) {
            setCurrentConversationId(convs[0].id)
            setCurrentMessages(convs[0].messages || [])
          } else {
            setCurrentConversationId(null)
            setCurrentMessages([])
          }
        }
      } catch (err) {
        console.error("loadUser error:", err)
      }
    }

    loadUser()
  }, [clerkUser])

  // create organization
  const handleCreateOrganization = async (name: string) => {
    if (!dbUser) return
    try {
      const res = await fetch("/api/create-organization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, userId: dbUser.id }),
      })
      if (!res.ok) throw new Error("Create org failed")
      const newOrg = await res.json()
      setUserOrganizations((prev) => [...prev, newOrg])
      setCurrentOrgId(newOrg.id)
      setCredits(newOrg.credits ?? credits)
    } catch (err) {
      console.error("Failed to create organization", err)
      toast.error("Failed to create organization")
    }
  }

  // switch organization
  const handleSwitchOrganization = async (orgId: string) => {
    setCurrentOrgId(orgId)
    if (!dbUser) return
    try {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: dbUser.id }),
      })
      const orgs = await res.json()
      const selected = (orgs || []).find((o: any) => o.id === orgId)
      if (selected) setCredits(selected.credits ?? credits)
    } catch (err) {
      console.error("Failed to switch organization", err)
    }
  }

  // send message and deduct credits (parent handler passed to ChatInput)
  const sendMessage = async (content: string) => {
    if (!dbUser || !currentConversationId || !currentOrgId) {
      console.warn("missing user/conversation/org")
      return
    }

    if (credits <= 0) {
      setShowInsufficientCredits(true)
      return
    }

    const optimisticUserMsg = {
      id: `tmp-${Date.now()}`,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    }
    setCurrentMessages((prev) => [...prev, optimisticUserMsg])

    setSending(true)
    try {
      const res = await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: dbUser.id,
          conversationId: currentConversationId,
          orgId: currentOrgId,
          content,
          role: "user",
        }),
      })

      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(`send failed: ${res.status} ${text}`)
      }

      const payload = await res.json()
      // Expected server response: { userMessage, assistantMessage, creditsUsed?: number }
      const { userMessage, assistantMessage, creditsUsed = 1 } = payload

      setCurrentMessages((prev) => {
        // remove optimistic tmp messages then append server messages
        const withoutTmp = prev.filter((m) => !String(m.id).startsWith("tmp-"))
        return [
          ...withoutTmp,
          ...(userMessage ? [userMessage] : []),
          ...(assistantMessage ? [assistantMessage] : []),
        ]
      })

      // Deduct credits client-side for immediate UX; server should also enforce/deduct
      setCredits((c) => Math.max(0, c - creditsUsed))
    } catch (err) {
      console.error("sendMessage error:", err)
      // remove optimistic message on error
      setCurrentMessages((prev) => prev.filter((m) => !String(m.id).startsWith("tmp-")))
      toast.error("Failed to send message")
    } finally {
      setSending(false)
    }
  }

  // select conversation
  const handleSelectConversation = (id: string) => {
    const conv = conversations.find((c) => c.id === id)
    if (conv) {
      setCurrentConversationId(id)
      setCurrentMessages(conv.messages || [])
    }
  }

  // new conversation
  const handleNewChat = async () => {
    if (!dbUser || !currentOrgId) return
    try {
      const res = await fetch("/api/new-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: dbUser.id,
          orgId: currentOrgId,
          title: `New Chat ${new Date().toLocaleString()}`,
        }),
      })
      if (!res.ok) throw new Error("Create conversation failed")
      const newConv = await res.json()
      setConversations((prev) => [newConv, ...prev])
      setCurrentConversationId(newConv.id)
      setCurrentMessages([])
    } catch (err) {
      console.error("handleNewChat error:", err)
      toast.error("Failed to create new chat")
    }
  }

  // delete conversation
  const handleDeleteConversation = async (id: string) => {
    try {
      await fetch("/api/delete-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      const updated = conversations.filter((c) => c.id !== id)
      setConversations(updated)
      if (currentConversationId === id) {
        if (updated.length > 0) {
          setCurrentConversationId(updated[0].id)
          setCurrentMessages(updated[0].messages || [])
        } else {
          setCurrentConversationId(null)
          setCurrentMessages([])
        }
      }
    } catch (err) {
      console.error("handleDeleteConversation error:", err)
      toast.error("Failed to delete conversation")
    }
  }

  return (
    <>
      <SignedIn>
        <div className="h-screen flex bg-black">
          <div className="w-80 flex-shrink-0">
            <ChatSidebar
              conversations={conversations}
              currentConversationId={currentConversationId}
              onSelectConversation={handleSelectConversation}
              onNewChat={handleNewChat}
              onDeleteConversation={handleDeleteConversation}
              onLogout={async () => {
                await clerkSignOut()
                router.push("/login")
              }}
              username={dbUser?.username}
              credits={credits}
              organizations={userOrganizations}
              currentOrgId={currentOrgId}
              currentOrganization={currentOrganization}
              onSwitchOrganization={handleSwitchOrganization}
              onManageOrganization={() => setShowOrgDialog(true)}
              onPurchaseCredits={() => setShowPurchaseCreditsDialog(true)}
            />
          </div>

          <div className="flex flex-col flex-1">
            <ChatHeader userId={clerkUser?.id || ""} onOpenSettings={() => {}} />
            <ChatMessages messages={currentMessages} />
            <ChatInput
              onSendMessage={sendMessage}
              disabled={sending || credits <= 0}
              // keep other props removed; ChatInput only needs onSendMessage and disabled
            />
          </div>

          <InsufficientCreditsDialog
            open={showInsufficientCredits}
            onClose={() => setShowInsufficientCredits(false)}
          />

          <OrganizationDialog
            open={showOrgDialog}
            onOpenChange={setShowOrgDialog}
            organization={currentOrganization ?? { id: "", name: "Organization", credits: 0 }}
            currentUserId={dbUser?.id}
            members={currentOrganization?.members ?? []}
            onRemoveMember={async () => {}}
            onUpdateRole={async () => {}}
            onAddCredits={async () => {}}
          />

          <CreateOrganizationDialog
            open={showCreateOrgDialog}
            onOpenChange={setShowCreateOrgDialog}
            onCreateOrganization={handleCreateOrganization}
          />

          <PurchaseCreditsDialog
            open={showPurchaseCreditsDialog}
            onOpenChange={setShowPurchaseCreditsDialog}
            userId={dbUser?.id}
            organizationId={currentOrgId}
          />
        </div>
      </SignedIn>

      <SignedOut>
        <div className="h-screen flex items-center justify-center bg-black text-white">
          <p>
            Please{" "}
            <a href="/login" className="underline text-primary">
              sign in
            </a>{" "}
            to access the chat.
          </p>
        </div>
      </SignedOut>
    </>
  )
}
