"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

interface AutoRefreshProps {
  interval?: number // em milissegundos
}

export default function AutoRefresh({ interval = 120000 }: AutoRefreshProps) {
  const router = useRouter()

  useEffect(() => {
    if (typeof window === "undefined") return

    const refreshTimer = setInterval(() => {
      // Regra de Ouro: Só atualiza se a aba estiver visível (economiza recursos)
      if (document.visibilityState === "visible") {
        console.log("[AutoRefresh] Atualizando dados do dashboard...")
        router.refresh()
        // Disparar evento customizado para componentes de cliente
        window.dispatchEvent(new CustomEvent("next-refresh"))
      }
    }, interval)

    return () => clearInterval(refreshTimer)
  }, [interval, router])

  return null // Componente invisível
}
