"use client"

import { useState } from "react"
import { Button, ButtonProps } from "@/components/ui/button"
import { TrialRegistrationModal } from "./trial-registration-modal"

interface TrialButtonProps extends ButtonProps {
  children: React.ReactNode
  plan?: string
  customRedirectUrl?: string
}

export function TrialButton({ children, plan = "minimo", customRedirectUrl, ...props }: TrialButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button {...props} onClick={() => setIsOpen(true)}>
        {children}
      </Button>
      <TrialRegistrationModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        plan={plan}
        customRedirectUrl={customRedirectUrl}
      />
    </>
  )
}
