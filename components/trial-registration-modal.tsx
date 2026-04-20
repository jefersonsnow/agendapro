"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle } from "lucide-react"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { signUpFreeTrial } from "@/lib/actions/auth"

// NIF Validation for Portugal
function validatePortugalNIF(nif: string) {
  if (!/^\d{9}$/.test(nif)) return false
  const firstChar = nif[0]
  if (!['1', '2', '3', '5', '6', '8', '9'].includes(firstChar)) return false

  let checkSum = 0
  for (let i = 0; i < 8; i++) {
    checkSum += parseInt(nif[i]) * (9 - i)
  }
  const checkDigit = 11 - (checkSum % 11)
  const finalDigit = checkDigit >= 10 ? 0 : checkDigit
  return finalDigit === parseInt(nif[8])
}

const EUROPEAN_COUNTRIES = [
  { code: "PT", name: "Portugal 🇵🇹" },
  { code: "BR", name: "Brasil 🇧🇷" },
  { code: "ES", name: "España 🇪🇸" },
  { code: "FR", name: "France 🇫🇷" },
  { code: "IT", name: "Italia 🇮🇹" },
  { code: "DE", name: "Deutschland 🇩🇪" },
  { code: "GB", name: "United Kingdom 🇬🇧" },
  { code: "CH", name: "Suisse 🇨🇭" },
  { code: "BE", name: "Belgique 🇧🇪" },
  { code: "NL", name: "Nederland 🇳🇱" },
  { code: "LU", name: "Luxembourg 🇱🇺" },
  { code: "IE", name: "Ireland 🇮🇪" },
  { code: "AD", name: "Andorra 🇦🇩" },
  { code: "MC", name: "Monaco 🇲🇨" },
  { code: "AT", name: "Österreich 🇦🇹" },
  { code: "DK", name: "Danmark 🇩🇰" },
  { code: "SE", name: "Sverige 🇸🇪" },
  { code: "NO", name: "Norge 🇳🇴" },
  { code: "PL", name: "Polska 🇵🇱" },
  { code: "CZ", name: "Česko 🇨🇿" },
  { code: "HR", name: "Hrvatska 🇭🇷" },
  { code: "GR", name: "Elláda 🇬🇷" },
] as const

interface TrialRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TrialRegistrationModal({ isOpen, onClose }: TrialRegistrationModalProps) {
  const t = useTranslations("Modal.trial")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const formSchema = z.object({
    name: z.string().min(3, t("errors.min3")),
    salonName: z.string().min(2, t("errors.min2")),
    email: z.string().email(t("errors.email")),
    password: z.string().min(6, t("errors.min6")),
    country: z.string(),
    street: z.string().min(3, t("errors.street")),
    number: z.string().min(1, t("errors.number")),
    zipCode: z.string().min(4, t("errors.zip")),
    nif: z.string().min(9, t("errors.nifMin")),
    phone: z.string().min(9, t("errors.phone")),
  }).refine((data) => {
    if (data.country === "PT") {
      return validatePortugalNIF(data.nif)
    }
    return true 
  }, {
    message: t("errors.nifInvalid"),
    path: ["nif"],
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      salonName: "",
      email: "",
      password: "",
      country: "PT",
      street: "",
      number: "",
      zipCode: "",
      nif: "",
      phone: "",
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const fullAddress = `${values.country}, ${values.street}, ${values.number}, ${values.zipCode}`
      const result = await signUpFreeTrial({
        ...values,
        address: fullAddress
      })

      if (result.success) {
        setIsSuccess(true)
      } else {
        toast.error(t("error"))
      }
    } catch (error: any) {
      toast.error(error.message || t("error"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    if (isSuccess) {
       setTimeout(() => setIsSuccess(false), 300) // Reset after animation
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        {isSuccess ? (
          <div className="py-12 flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
              <CheckCircle className="h-14 w-14 text-green-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-primary tracking-tight">{t("successTitle")}</h2>
              <p className="text-lg text-muted-foreground max-w-[400px] mx-auto leading-relaxed">
                {t("success")}
              </p>
            </div>
            <Button onClick={handleClose} className="w-full max-w-xs h-14 rounded-2xl font-black text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20">
              Fechar
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary">{t("title")}</DialogTitle>
              <DialogDescription>{t("subtitle")}</DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.name")}</FormLabel>
                        <FormControl>
                          <Input placeholder="António Silva" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="salonName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.salonName")}</FormLabel>
                        <FormControl>
                          <Input placeholder="Meu Salão Elite" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.email")}</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.password")}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="******" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.country")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("form.selectCountry")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EUROPEAN_COUNTRIES.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("form.street")}</FormLabel>
                          <FormControl>
                            <Input placeholder="Rua das Flores" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.number")}</FormLabel>
                        <FormControl>
                          <Input placeholder="123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.zip")}</FormLabel>
                        <FormControl>
                          <Input placeholder="4000-000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nif"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.nif")}</FormLabel>
                        <FormControl>
                          <Input placeholder="213..." {...field} />
                        </FormControl>
                        <FormDescription>{t("form.nifDesc")}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.phone")}</FormLabel>
                      <FormControl>
                        <Input placeholder="+351 912345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full h-12 rounded-xl font-bold bg-primary hover:bg-primary/90" disabled={isLoading}>
                    {isLoading ? t("form.creating") : t("form.submit")}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
