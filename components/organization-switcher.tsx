"use client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Building2, Check, Plus, Settings } from "lucide-react"
import type { Organization } from "@/lib/auth"

interface OrganizationSwitcherProps {
  organizations: Organization[]
  currentOrgId: string
  onSwitchOrganization: (orgId: string) => void
  onManageOrganization: () => void
  onCreateOrganization: (name: string) => void | Promise<void> 
}

export function OrganizationSwitcher({
  organizations,
  currentOrgId,
  onSwitchOrganization,
  onManageOrganization,
  onCreateOrganization,
}: OrganizationSwitcherProps) {
  const currentOrg = organizations.find((org) => org.id === currentOrgId)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-2 px-2">
          <Building2 className="h-4 w-4" />
          <span className="truncate flex-1 text-left">{currentOrg?.name || "Select Organization"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((org) => (
          <DropdownMenuItem key={org.id} onClick={() => onSwitchOrganization(org.id)} className="cursor-pointer">
            <div className="flex items-center gap-2 flex-1">
              <Building2 className="h-4 w-4" />
              <div className="flex-1">
                <div className="font-medium">{org.name}</div>
                <div className="text-xs text-muted-foreground">{org.memberCount} members</div>
              </div>
              {org.id === currentOrgId && <Check className="h-4 w-4 text-emerald-500" />}
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onManageOrganization} className="cursor-pointer">
          <Settings className="h-4 w-4 mr-2" />
          Manage Organization
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCreateOrganization} className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Create Organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
