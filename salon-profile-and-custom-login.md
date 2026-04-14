# Task: Salon Profile and Custom Login Integration

## Status
- **Phase 1: Analysis & Schema Check**: COMPLETED ✅
- **Phase 2: Admin Dashboard Enhancements**: COMPLETED ✅
- **Phase 3: Salon Profile Detail Page**: COMPLETED ✅
- **Phase 4: Team & User Management Logic**: COMPLETED ✅
- **Phase 5: Personalized Login Route**: COMPLETED ✅

## Description
This task involves enhancing the Salon Management section in the Admin Panel to provide a comprehensive profile for each salon, including professional and user management. Additionally, it implements a personalized login page for each salon using a slug-based URL structure (e.g., `/login/[slug]`).

## Requirements
- [ ] Make salon rows clickable in the Admin Dashboard.
- [ ] Create a "Salon Profile" page with:
    - [ ] Plan/Subscription details.
    - [ ] Key stats (Visits, Clients, Revenue).
    - [ ] Tenure calculation (since registration).
    - [ ] Team Management (consolidated view of Staff + Related Users).
- [ ] Implement Team Management actions:
    - [ ] Add new members (Professional/Receptionist/Admin).
    - [ ] Edit existing members (Role, Name, Contact).
    - [ ] Manual password reset (Admin types new password).
    - [ ] Option to send a password reset link (Placeholder for email integration).
    - [ ] Delete members with confirmation.
- [ ] Personalized Login Page:
    - [ ] URL: `/[locale]/login/[slug]`
    - [ ] Adapt to salon branding (Logo, Salon Name).
    - [ ] Integrated with existing auth logic.

---

## Technical Architecture

### 1. Data Retrieval
- **New Server Action**: `getSalonFullDetails(idOrSlug: string)`
    - Fetches Salon, Plan info, Stats (counts), Staff list, and Related Users.

### 2. UI/UX (Frontend Specialist)
- **Salon Detail Page**: Implementation of a modern, aesthetic dashboard profile.
- **Branded Login Card**: A dynamic component that fetches salon metadata based on the URL parameter.

### 3. Logic & Security (Backend Specialist)
- **Auth**: Reusing `next-auth` credentials provider.
- **Dynamic Routing**: Creating `app/[locale]/login/[slug]/page.tsx`.

---

## Progress Tracking

### Phase 1: Server Actions & Backend
- [ ] Implement `getSalonFullDetails` in `lib/actions/admin.ts`.
- [ ] Implement team management actions (upsert, delete, reset password).

### Phase 2: Navigation & Lists
- [ ] Update `app/[locale]/admin/salons/page.tsx` to link rows to `/admin/salons/[id]`.

### Phase 3: Profile Detail UI
- [ ] Create `app/[locale]/admin/salons/[id]/page.tsx`.
- [ ] Design and build the profile subsections (Stats, Team, Users).

### Phase 4: Personalized Login Experience
- [ ] Create `app/[locale]/login/[slug]/page.tsx`.
- [ ] Ensure the login form works and redirects correctly.

---

## Verification Criteria
- [ ] Row click in Admin Salons redirects correctly.
- [ ] Profile page shows correct data for Staff and Users.
- [ ] Password reset (manual) works and user can then log in with new password.
- [ ] Navigating to `/pt/login/gina-nail` shows Gina Nail branding.
- [ ] Logging in from the personalized page works as expected.
