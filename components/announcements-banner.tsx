"use client"

import { useState, useEffect } from "react"
import { getActiveAnnouncements } from "@/lib/actions/admin"
import { AlertCircle, Info, CheckCircle, Flame, X, Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AnnouncementsBanner() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState<string[]>([])

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const data = await getActiveAnnouncements()
        setAnnouncements(data)
      } finally {
        setLoading(false)
      }
    }
    fetchAnnouncements()
  }, [])

  const activeOnes = announcements.filter(a => !dismissed.includes(a.id))

  if (loading || activeOnes.length === 0) return null

  return (
    <div className="space-y-4 mb-8">
      {activeOnes.map((ann) => {
        const typeStyles = {
          critical: "bg-red-500 text-white border-red-600 shadow-red-200",
          warning: "bg-amber-50 text-amber-900 border-amber-200 shadow-amber-100",
          success: "bg-green-50 text-green-900 border-green-200 shadow-green-100",
          info: "bg-blue-50 text-blue-900 border-blue-200 shadow-blue-100"
        }[ann.type as string] || "bg-muted"

        const iconProps = "h-6 w-6 shrink-0"

        return (
          <div 
            key={ann.id} 
            className={`flex items-center gap-4 p-5 rounded-3xl border-2 shadow-xl animate-in slide-in-from-top duration-500 overflow-hidden relative ${typeStyles as string}`}
          >
            <div className="bg-white/20 p-3 rounded-2xl">
               {ann.type === 'critical' && <Flame className={iconProps} />}
               {ann.type === 'warning' && <AlertCircle className={iconProps} />}
               {ann.type === 'success' && <CheckCircle className={iconProps} />}
               {ann.type === 'info' && <Info className={iconProps} />}
            </div>
            <div className="flex-1 pr-6">
               <h4 className="font-black uppercase tracking-tighter text-sm italic flex items-center gap-2">
                 <Megaphone className="h-3 w-3" />
                 {ann.title}
               </h4>
               <p className="text-sm font-medium opacity-90 leading-tight mt-1">{ann.content}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 p-0 rounded-full hover:bg-black/5" 
              onClick={() => setDismissed([...dismissed, ann.id])}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        )
      })}
    </div>
  )
}
