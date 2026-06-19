# Plan: Dynamic Service Categories

## Overview
Implement custom service category management (add/delete) stored dynamically in `Salon.settings`.

## Success Criteria
- Salon owners can add new custom categories.
- Salon owners can delete existing categories.
- Deleting a category automatically moves services in that category to the first available category.
- Custom categories group correctly on the service catalog and online booking portal.

## Proposed Changes
- **Backend (`lib/actions/dashboard.ts`)**: Add server actions to update categories and handle cascading reassignment of services.
- **Frontend (`app/[locale]/dashboard/servicos/page.tsx`)**: Implement a "Gerir Categorias" modal to add/delete categories.

## Verification
- Run manual tests in services dashboard and booking interface.
