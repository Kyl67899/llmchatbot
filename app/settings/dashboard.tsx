"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Dashboard({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Settings & Billing</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <h4 className="font-semibold">Billing</h4>
          <p className="text-sm text-muted-foreground mb-4">View subscriptions, purchase history, and manage payment methods.</p>

          <div className="grid gap-2">
            <Button asChild>
              <a href="/billing">Open full billing dashboard</a>
            </Button>

            {/* Example inline content — replace with your billing components */}
            <div className="border rounded p-4">
              <p className="text-sm">Active subscriptions and one-time payments appear here.</p>
              {/* Insert your subscription list component or billing UI */}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
