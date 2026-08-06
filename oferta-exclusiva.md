# Plano de Execução: Landing Page /oferta-exclusiva (60 Dias Grátis)

## Overview
Criar uma landing page de alta conversão na rota `/oferta-exclusiva` desenhada especificamente para campanhas de tráfego pago (Meta Ads e Google Ads). A página conterá um formulário inline imediato no Hero para registo direto no **Plano Premium (60 Dias de Teste Grátis)** com zero atrito, rastreio avançado de pixel (Meta `Lead` e Google Ads `conversion`) e links diretos para divulgação do canal de YouTube e redes sociais.

## Key Features & Requirements
1. **Formulário Inline Imediato no Hero:**
   - Campos essenciais: Nome do responsável, Nome do Salão, E-mail, Palavra-passe, Telemóvel e País.
   - Pré-configurado para o plano **Premium (60 Dias Grátis)**.
   - Ao submeter, chama a Server Action `signUpWithDetails` e trata estado de confirmação de e-mail (double opt-in).
2. **Rastreio de Conversão (Meta Ads & Google Ads):**
   - Injeção/Gatilho de scripts do Meta Pixel (`fbq('track', 'PageView')` ao carregar a página e `fbq('track', 'Lead')` ao submeter com sucesso).
   - Evento de conversão para Google Ads (window.gtag).
3. **Seção de Redes Sociais e Canal do YouTube:**
   - Cartões destacados com links oficiais do canal do YouTube (tutoriais do AgendarPro), Instagram, TikTok e WhatsApp de suporte.
   - Design focado, sem distrações e com altíssima taxa de conversão.
4. **Localização & I18n:**
   - Integração com `next-intl` (suporte a `/pt/oferta-exclusiva`, `/en/oferta-exclusiva`, etc.).

## Task Breakdown

### Task 1: Componente de Formulário Inline de Oferta Exclusiva (`components/oferta-exclusiva-form.tsx`)
- Formulário responsivo com validação via `react-hook-form` + `zod`.
- Invocação de `signUpWithDetails` com `plan: "premium"`.
- Triggers de eventos `fbq('track', 'Lead')` e `gtag('event', 'conversion')`.
- Feedback de sucesso (orientando a verificar o e-mail de ativação dos 60 dias).

### Task 2: Página de Vendas `/oferta-exclusiva` (`app/[locale]/oferta-exclusiva/page.tsx`)
- Substituir o `redirect("/")` por um layout premium de conversão (Hero assimétrico, cores contrastantes Obsidian/Teal, sem menu de navegação denso para manter o foco total no formulário).
- Seção de mídia social com destaque para o Canal do YouTube + Instagram + TikTok.

### Task 3: Verificação & Testes
- Testar preenchimento e submissão do formulário.
- Validar criação de `PendingRegistration` no banco de dados com `plan = "premium"`.
- Executar `npm run build` e verificar ausência de erros de compilação ou TypeScript.
