// <title> <meta name="description" content="SEO" /> <Head>
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Calendar, Mail } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted/30 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Calendar className="h-8 w-8" />
            <span className="text-2xl font-bold">agendar.pro</span>
          </div>
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Verifique o seu email</CardTitle>
              <CardDescription>
                Enviámos um link de confirmação para o seu email. Clique no link para ativar a sua conta.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4 text-sm text-muted-foreground">
                Não recebeu o email? Verifique a pasta de spam ou tente novamente.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/login">Voltar ao login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
