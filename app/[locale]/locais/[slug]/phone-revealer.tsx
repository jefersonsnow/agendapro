"use client"

import { useState } from "react"
import { Phone } from "lucide-react"

interface PhoneRevealerProps {
  phone: string
  name: string
}

export default function PhoneRevealer({ phone, name }: PhoneRevealerProps) {
  const [revealed, setRevealed] = useState(false)

  // Formata o telefone visualmente (ex: 962466660 -> 962 466 660)
  const formatPhone = (p: string) => {
    const cleaned = p.replace(/\s+/g, "")
    if (cleaned.length === 9) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)}`
    }
    return p
  }

  if (revealed) {
    return (
      <a
        href={`tel:${phone}`}
        className="w-full inline-flex items-center justify-center gap-3 h-14 px-6 rounded-2xl font-black uppercase tracking-widest text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all animate-fade-in"
        id="btn-call-direct"
      >
        <Phone className="h-4 w-4" />
        Ligar: {formatPhone(phone)}
      </a>
    )
  }

  return (
    <button
      onClick={() => setRevealed(true)}
      className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3"
      id="btn-reveal-phone"
    >
      <Phone className="h-4 w-4" />
      Ligar para Agendar
    </button>
  )
}
