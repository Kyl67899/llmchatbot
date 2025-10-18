// Credit packages (used for seeding or fallback)
export const DEFAULT_CREDIT_PACKAGES = [
    {
      id: "starter",
      name: "Starter",
      credits: 500,
      price: 1099, // $10.99
      popular: false,
    },
    {
      id: "pro",
      name: "Pro",
      credits: 1000,
      price: 3999, // $39.99
      popular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      credits: 5000,
      price: 6999, // $69.99
      popular: false,
    },
  ]
  
  // Credit costs for actions
  export const CREDIT_COSTS = {
    MESSAGE: 2,
    CHAT: 5,
    INVITE: 10,
    ORGANIZATION_CREATE: 25,
  }
  
  // Notification types
  export const NOTIFICATION_TYPES = {
    LOW_CREDITS: "low_credits",
    MEMBER_JOINED: "member_joined",
    MEMBER_LEFT: "member_left",
    SYSTEM: "system",
  } as const
  
  export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES]
  
  // Roles
  export const MEMBER_ROLES = ["admin", "member"] as const
  export type MemberRole = (typeof MEMBER_ROLES)[number]
  