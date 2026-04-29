import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login - AgendarPro | Gestão de Marcações Online com Gestão e Marcação por Telemóvel",
  description: "Aceda ao seu painel de gestão AgendarPro. Organize a sua agenda, controle comissões e receba marcações online, tudo na palma da sua mão.",
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
