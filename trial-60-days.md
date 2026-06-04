# Plano de Tarefas: 60 Dias Grátis

Este ficheiro serve como o plano de execução para atualizar o sistema de 30 para 60 dias de trial.

## Overview
Ajustar todas as referências ao trial de 30 dias para 60 dias grátis em toda a aplicação (backend, base de dados, traduções e páginas públicas).

## Success Criteria
* Todos os novos registos de salões recebem 60 dias de teste.
* As traduções em todos os 6 idiomas mostram "60 dias" em vez de "30 dias".
* Todos os componentes visuais (banners, modais, landing pages) exibem 60 dias.

## Task Breakdown

### Fase 1: Backend & Configuração
* [x] **T1:** Atualizar fallback de `trial_days` e mensagens de e-mail de ativação em `lib/actions/auth.ts` (Agent: `backend-specialist`).
* [x] **T2:** Atualizar estados padrões e fallbacks nos painéis de administração `admin/system/page.tsx` e `admin/users/support-seo-settings.tsx` (Agent: `backend-specialist`).

### Fase 2: Localização (JSON)
* [x] **T3:** Atualizar as mensagens e termos "30" para "60" em `messages/pt.json`, `en.json`, `es.json`, `de.json`, `it.json`, `fr.json` (Agent: `frontend-specialist`).

### Fase 3: Componentes Visuais
* [x] **T4:** Atualizar landing page principal (`app/[locale]/page.tsx`), banner de trial (`components/trial-status-banner.tsx`), página de confirmação (`confirmar-registo/page.tsx`) e FAQ (`dashboard/ajuda/page.tsx`) (Agent: `frontend-specialist`).

### Fase X: Verificação
* [x] Executar build do projeto (`npm run build`).
* [x] Validar conformidade de lint e funcionamento geral.

## ✅ PHASE X COMPLETE
- Build: ✅ Success
- Localisation check: ✅ Pass
- Database update: ✅ Current config is 60 days
- Date: 2026-06-04
