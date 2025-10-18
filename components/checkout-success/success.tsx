import { useEffect } from "react"
import { toast } from "sonner"

export default function CreditSuccessPage() {
  useEffect(() => {
    toast.success("Credits added successfully!")
  }, [])

  return <div className="p-4">Redirecting...</div>
}

// backend
// const member = await prisma.organizationMember.findFirst({
//     where: { userId, organizationId },
//   })
  
//   if (member.role === "member" && creditsToAdd > 100) {
//     throw new Error("Members can only add up to 100 credits")
//   }
  