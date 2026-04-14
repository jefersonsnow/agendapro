"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { QrCode, Download, ExternalLink } from "lucide-react"

interface QRCodeModalProps {
  url: string
  salonName: string
}

export default function QRCodeModal({ url, salonName }: QRCodeModalProps) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl shadow-sm">
          <QrCode className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-center">
            QR Code de Agendamento
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6 space-y-6">
          <div className="bg-white p-4 rounded-3xl shadow-xl border-4 border-primary/10">
            <img src={qrUrl} alt="QR Code" className="w-64 h-64" />
          </div>
          <div className="text-center">
            <p className="font-bold text-lg">{salonName}</p>
            <p className="text-sm text-muted-foreground">O seu cliente só precisa de apontar a câmara para reservar!</p>
          </div>
          <div className="flex w-full gap-3 pt-4">
             <Button className="flex-1 h-12 rounded-xl font-bold" onClick={() => window.open(qrUrl, '_blank')}>
                <Download className="h-4 w-4 mr-2" />
                Descarregar
             </Button>
             <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold" onClick={() => window.open(url, '_blank')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Testar Link
             </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
