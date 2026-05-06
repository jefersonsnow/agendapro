// <title> <meta name="description" content="SEO" /> <Head>
"use client"

import { useState, useEffect } from "react"
import { getAllUsers } from "@/lib/actions/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { User, Shield, Mail, Calendar, Plus, Edit2, Trash2, Settings, Loader2 } from "lucide-react"
import { UserDialog } from "./user-dialog"
import { deleteUser } from "@/lib/actions/admin"
import { Button } from "@/components/ui/button"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SystemSettings } from "./system-settings"
import { SupportSeoSettings } from "./support-seo-settings"
import { LayoutGrid, Globe } from "lucide-react"

export default function AdminConfigurationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Configurações</h1>
          <p className="text-muted-foreground">
             Configurações globais do sistema, ecossistema SaaS e infraestrutura
          </p>
        </div>
      </div>

      <Tabs defaultValue="ecosystem" className="space-y-6">
         <TabsList className="bg-muted p-1 rounded-2xl border flex gap-2 w-fit">
            <TabsTrigger value="ecosystem" className="rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2">
               <LayoutGrid className="h-4 w-4" /> Ecossistema (Planos & CMS)
            </TabsTrigger>
            <TabsTrigger value="core" className="rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2">
               <Globe className="h-4 w-4" /> Core (SEO & Suporte)
            </TabsTrigger>
         </TabsList>

         <TabsContent value="ecosystem">
            <Card className="border-none shadow-xl shadow-black/5 overflow-hidden rounded-2xl bg-background/50 backdrop-blur-sm">
               <CardContent className="p-0">
                  <SystemSettings />
               </CardContent>
            </Card>
         </TabsContent>

         <TabsContent value="core">
            <Card className="border-none shadow-xl shadow-black/5 overflow-hidden rounded-2xl bg-background/50 backdrop-blur-sm p-6">
               <SupportSeoSettings />
            </Card>
         </TabsContent>
      </Tabs>
    </div>
  )
}

