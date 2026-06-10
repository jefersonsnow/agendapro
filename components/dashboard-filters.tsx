"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Search, Calendar as CalendarIcon } from "lucide-react"

export default function DashboardFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const now = new Date()
  const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  
  const lastDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const lastDay = `${lastDate.getFullYear()}-${String(lastDate.getMonth() + 1).padStart(2, '0')}-${String(lastDate.getDate()).padStart(2, '0')}`

  const [from, setFrom] = useState(searchParams.get("from") || firstDay)
  const [to, setTo] = useState(searchParams.get("to") || lastDay)

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (from) params.set("from", from)
    if (to) params.set("to", to)
    
    router.push(`/dashboard?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="bg-[#f0f4f3] p-4 rounded-3xl border border-border/10 shadow-sm mb-6 w-full md:w-fit flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6">
      <div className="flex flex-col gap-1.5 flex-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#8a9b96] px-1">Início</span>
        <div className="relative">
          <input 
            type="date" 
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="bg-white border-transparent rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 w-full md:w-[180px] shadow-sm appearance-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 flex-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#8a9b96] px-1">Fim</span>
        <div className="relative">
          <input 
            type="date" 
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="bg-white border-transparent rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 w-full md:w-[180px] shadow-sm appearance-none"
          />
        </div>
      </div>

      <Button 
        onClick={handleApply} 
        className="rounded-2xl md:mt-auto h-[48px] bg-[#008766] hover:bg-[#007055] text-white font-bold px-8 shadow-lg shadow-emerald-900/10 transition-all hover:scale-[1.02] active:scale-[0.98] w-full md:w-auto"
      >
        Aplicar Filtros
      </Button>
    </div>
  )
}
