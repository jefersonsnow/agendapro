"use client"

import { useState } from "react"
import { LogOut, UserCog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logoutAdmin } from "@/lib/actions/auth"
import { UserDialog } from "./users/user-dialog"

interface AdminSidebarFooterProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    role?: string | null
  }
}

export function AdminSidebarFooter({ user }: AdminSidebarFooterProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <div className="absolute bottom-0 w-full p-4 border-t bg-background">
        <div className="flex items-center gap-3 mb-4 px-2 group">
          <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold ring-2 ring-orange-600/10">
            {user.name?.[0] || "A"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold truncate text-foreground">{user.name || "Admin"}</p>
            <p className="text-[10px] text-muted-foreground truncate uppercase font-black tracking-widest opacity-60">{user.role}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-orange-50 hover:text-orange-600"
            onClick={() => setDialogOpen(true)}
          >
            <UserCog className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-1">
            <Button 
                variant="ghost" 
                onClick={() => setDialogOpen(true)}
                className="w-full justify-start text-xs font-bold text-muted-foreground hover:text-orange-600 hover:bg-orange-50 rounded-xl"
            >
                <UserCog className="h-4 w-4 mr-2" />
                Editar Perfil
            </Button>
            
            <form action={logoutAdmin}>
                <Button 
                    variant="ghost" 
                    type="submit" 
                    className="w-full justify-start text-xs font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl"
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                </Button>
            </form>
        </div>
      </div>

      <UserDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        onSuccess={() => window.location.reload()} 
        user={user}
      />
    </>
  )
}
