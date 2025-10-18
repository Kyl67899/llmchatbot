"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2, Shield, User, Mail, X } from "lucide-react"
import { toast } from "sonner"
import { inviteMemberByEmail } from "@/lib/services/organizations"

export interface Organization {
  id: string
  name: string
  credits: number
  tier?: "free" | "pro" | "enterprise"
}

export interface OrganizationMember {
  userId: string
  username: string
  email: string
  role: "admin" | "member"
  joinedAt: Date
}

interface OrganizationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organization: Organization
  currentUserId: string
  members: OrganizationMember[]
  onRemoveMember: (userId: string) => Promise<void> | void
  onUpdateRole: (userId: string, role: "admin" | "member") => Promise<void> | void
  onAddCredits: (amount: number) => Promise<void> | void
}

export function OrganizationDialog({
  open,
  onOpenChange,
  organization = { id: "", name: "organization", credits: 0, tier: "free" },
  members = [],
  currentUserId,
  onRemoveMember,
  onUpdateRole,
  onAddCredits,
}: OrganizationDialogProps) {
  const [creditAmount, setCreditAmount] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteError, setInviteError] = useState("")
  const [inviteSuccess, setInviteSuccess] = useState("")
  const [isInviting, setIsInviting] = useState(false)
  const [isAddingCredits, setIsAddingCredits] = useState(false)

  const currentMember = members.find((m) => m.userId === currentUserId)
  const isAdmin = currentMember?.role === "admin"

  useEffect(() => {
    if (!open) {
      setCreditAmount("")
      setInviteEmail("")
      setInviteError("")
      setInviteSuccess("")
      setIsInviting(false)
      setIsAddingCredits(false)
    }
  }, [open])

  const handleAddCredits = async () => {
    const amount = Number.parseInt(creditAmount, 10)
    if (!amount || amount <= 0) {
      toast.error("Enter a valid credit amount")
      return
    }
    try {
      setIsAddingCredits(true)
      await onAddCredits(amount)
      setCreditAmount("")
      toast.success(`${amount} credits added successfully`)
    } catch (err) {
      console.error("Add credits error:", err)
      toast.error("Failed to add credits")
    } finally {
      setIsAddingCredits(false)
    }
  }

  const handleBuyCredits = async () => {
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: organization.id,
          packageId: process.env.NEXT_PUBLIC_STRIPE_TEST_ID,
        }),
      })
      const payload = await res.json()
      if (!res.ok || !payload?.url) {
        throw new Error(payload?.error || "Checkout creation failed")
      }
      window.location.href = payload.url
    } catch (err) {
      console.error("Stripe checkout error:", err)
      toast.error("Failed to initiate payment")
    }
  }

  const handleInviteMember = async () => {
    setInviteError("")
    setInviteSuccess("")
    if (!inviteEmail) {
      setInviteError("Please enter an email address")
      return
    }
    try {
      setIsInviting(true)
      const result = await inviteMemberByEmail(organization.id, inviteEmail, currentUserId)
      if (result?.success) {
        setInviteSuccess("Invitation sent successfully!")
        setInviteEmail("")
        toast.success("Invitation sent")
        // optionally refresh parent data instead of reload
        setTimeout(() => window.location.reload(), 1200)
      } else {
        setInviteError(result?.error || "Failed to send invitation")
      }
    } catch (err) {
      console.error("Invite error:", err)
      setInviteError("Unexpected error occurred")
    } finally {
      setIsInviting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] sm:max-h-[500px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{organization?.name ?? "Organization"}</DialogTitle>
          <DialogDescription>Manage your organization settings and members</DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">
                Plan
              </div>
              <div className="font-medium">{organization.tier ?? "free"}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                Credits
              </div>
              <div className="font-medium">{organization.credits}</div>
            </div>
          </div>

          <Tabs defaultValue="members" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="invite">Invite</TabsTrigger>
              <TabsTrigger value="credits">Credits</TabsTrigger>
            </TabsList>

            {/* Members Tab */}
            <TabsContent value="members" className="space-y-4 mt-4">
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {members.length === 0 ? (
                    <div className="text-sm text-muted-foreground p-4">No members</div>
                  ) : (
                    members.map((member) => (
                      <div
                        key={member.userId}
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {member.username?.[0]?.toUpperCase() ?? "U"}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{member.username}</div>
                            <div className="text-sm text-muted-foreground">{member.email}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                            {member.role === "admin" ? (
                              <>
                                <Shield className="h-3 w-3 mr-1" />
                                Admin
                              </>
                            ) : (
                              <>
                                <User className="h-3 w-3 mr-1" />
                                Member
                              </>
                            )}
                          </Badge>

                          {isAdmin && member.userId !== currentUserId && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  onUpdateRole(member.userId, member.role === "admin" ? "member" : "admin")
                                }
                              >
                                Toggle Role
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onRemoveMember(member.userId)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Invite Tab */}
            <TabsContent value="invite" className="space-y-4 mt-4">
              <div className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <h4 className="font-medium">
                    Invite By Email
                  </h4>
                </div>

                <p className="text-sm text-muted-foreground mb-3">
                  Invite existing users to join your
                  organization by entering their email address.
                </p>

                <div className="space-y-3">
                  <div>
                    <Label className="py-2" htmlFor="invite-email">Email Address</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="user@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="bg-secondary border-border"
                    />
                  </div>

                  {inviteError && (
                    <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                      {inviteError}
                    </div>
                  )}

                  {inviteSuccess && (
                    <div className="text-sm text-primary bg-primary/10 p-3 rounded-md border border-primary/20">
                      {inviteSuccess}
                    </div>
                  )}

                  <Button onClick={handleInviteMember} disabled={!inviteEmail || !isAdmin || isInviting} className="w-full">
                    {isInviting ? "Sending..." : "Send Invitation"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Credits Tab */}
            <TabsContent value="credits" className="space-y-4 mt-4">
              {organization.credits === 0 && (
                <div className="p-4 rounded-lg border border-destructive bg-destructive/10">
                  <p className="text-sm text-destructive font-medium mb-2">Your organization has 0 credits.</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    You won’t be able to send messages until credits are added.
                  </p>
                  <Button variant="default" onClick={handleBuyCredits}>
                    Buy 500 Credits
                  </Button>
                </div>
              )}

              {/* Manual credit input */}
              <div className="p-4 rounded-lg border border-border bg-card">
                <p className="text-sm text-muted-foreground mb-2">
                  Add credits to your organization. Credits are shared among all members.
                </p>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="py-2" htmlFor="credits">Credit Amount</Label>
                    <Input
                      id="credits"
                      type="number"
                      placeholder="Enter amount"
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(e.target.value)}
                      className="bg-secondary border-border"
                      min="1"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddCredits} disabled={isAddingCredits || Number.parseInt(creditAmount || "0", 10) <= 0}>
                      {isAddingCredits ? "Adding..." : "Add Credits"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Credit info */}
              <div className="p-4 rounded-lg border border-border bg-card">
                <h4 className="font-medium mb-2">Credit Information</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Each message costs 1 credit</li>
                  <li>• Credits are shared across all organization members</li>
                  <li>• New organizations start with 500 credits</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
