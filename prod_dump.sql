--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_salon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_staff_id_fkey;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_salon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_appointment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.support_tickets DROP CONSTRAINT IF EXISTS support_tickets_salon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.staff_services DROP CONSTRAINT IF EXISTS staff_services_staff_id_fkey;
ALTER TABLE IF EXISTS ONLY public.staff_services DROP CONSTRAINT IF EXISTS staff_services_service_id_fkey;
ALTER TABLE IF EXISTS ONLY public.staff DROP CONSTRAINT IF EXISTS staff_salon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS "sessions_userId_fkey";
ALTER TABLE IF EXISTS ONLY public.services DROP CONSTRAINT IF EXISTS services_salon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.salons DROP CONSTRAINT IF EXISTS salons_owner_id_fkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_salon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.clients DROP CONSTRAINT IF EXISTS clients_salon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cash_closings DROP CONSTRAINT IF EXISTS cash_closings_salon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_salon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS appointments_staff_id_fkey;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS appointments_service_id_fkey;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS appointments_salon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS appointments_client_id_fkey;
ALTER TABLE IF EXISTS ONLY public.accounts DROP CONSTRAINT IF EXISTS "accounts_userId_fkey";
ALTER TABLE IF EXISTS ONLY public._usersalons DROP CONSTRAINT IF EXISTS "_usersalons_B_fkey";
ALTER TABLE IF EXISTS ONLY public._usersalons DROP CONSTRAINT IF EXISTS "_usersalons_A_fkey";
DROP INDEX IF EXISTS public.verification_tokens_token_key;
DROP INDEX IF EXISTS public.verification_tokens_identifier_token_key;
DROP INDEX IF EXISTS public.users_salon_id_idx;
DROP INDEX IF EXISTS public.users_email_salon_id_key;
DROP INDEX IF EXISTS public.users_email_key;
DROP INDEX IF EXISTS public.transactions_staff_id_idx;
DROP INDEX IF EXISTS public.transactions_salon_id_created_at_idx;
DROP INDEX IF EXISTS public.transactions_product_id_idx;
DROP INDEX IF EXISTS public.transactions_appointment_id_idx;
DROP INDEX IF EXISTS public.support_tickets_salon_id_idx;
DROP INDEX IF EXISTS public.staff_user_id_key;
DROP INDEX IF EXISTS public.staff_services_service_id_idx;
DROP INDEX IF EXISTS public.staff_salon_id_idx;
DROP INDEX IF EXISTS public."sessions_userId_idx";
DROP INDEX IF EXISTS public."sessions_sessionToken_key";
DROP INDEX IF EXISTS public.services_salon_id_idx;
DROP INDEX IF EXISTS public.salons_slug_key;
DROP INDEX IF EXISTS public.salons_owner_id_idx;
DROP INDEX IF EXISTS public.products_salon_id_idx;
DROP INDEX IF EXISTS public.clients_salon_id_idx;
DROP INDEX IF EXISTS public.cash_closings_salon_id_idx;
DROP INDEX IF EXISTS public.audit_logs_user_id_idx;
DROP INDEX IF EXISTS public.audit_logs_salon_id_idx;
DROP INDEX IF EXISTS public.appointments_staff_id_idx;
DROP INDEX IF EXISTS public.appointments_service_id_idx;
DROP INDEX IF EXISTS public.appointments_salon_id_starts_at_idx;
DROP INDEX IF EXISTS public.appointments_client_id_idx;
DROP INDEX IF EXISTS public."accounts_userId_idx";
DROP INDEX IF EXISTS public."accounts_provider_providerAccountId_key";
DROP INDEX IF EXISTS public."_usersalons_B_index";
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_pkey;
ALTER TABLE IF EXISTS ONLY public.support_tickets DROP CONSTRAINT IF EXISTS support_tickets_pkey;
ALTER TABLE IF EXISTS ONLY public.staff_services DROP CONSTRAINT IF EXISTS staff_services_pkey;
ALTER TABLE IF EXISTS ONLY public.staff DROP CONSTRAINT IF EXISTS staff_pkey;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.services DROP CONSTRAINT IF EXISTS services_pkey;
ALTER TABLE IF EXISTS ONLY public.salons DROP CONSTRAINT IF EXISTS salons_pkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_pkey;
ALTER TABLE IF EXISTS ONLY public.global_configs DROP CONSTRAINT IF EXISTS global_configs_pkey;
ALTER TABLE IF EXISTS ONLY public.clients DROP CONSTRAINT IF EXISTS clients_pkey;
ALTER TABLE IF EXISTS ONLY public.cash_closings DROP CONSTRAINT IF EXISTS cash_closings_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS appointments_pkey;
ALTER TABLE IF EXISTS ONLY public.announcements DROP CONSTRAINT IF EXISTS announcements_pkey;
ALTER TABLE IF EXISTS ONLY public.accounts DROP CONSTRAINT IF EXISTS accounts_pkey;
ALTER TABLE IF EXISTS ONLY public._usersalons DROP CONSTRAINT IF EXISTS "_usersalons_AB_pkey";
DROP TABLE IF EXISTS public.verification_tokens;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.transactions;
DROP TABLE IF EXISTS public.support_tickets;
DROP TABLE IF EXISTS public.staff_services;
DROP TABLE IF EXISTS public.staff;
DROP TABLE IF EXISTS public.sessions;
DROP TABLE IF EXISTS public.services;
DROP TABLE IF EXISTS public.salons;
DROP TABLE IF EXISTS public.products;
DROP TABLE IF EXISTS public.global_configs;
DROP TABLE IF EXISTS public.clients;
DROP TABLE IF EXISTS public.cash_closings;
DROP TABLE IF EXISTS public.audit_logs;
DROP TABLE IF EXISTS public.appointments;
DROP TABLE IF EXISTS public.announcements;
DROP TABLE IF EXISTS public.accounts;
DROP TABLE IF EXISTS public._usersalons;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _usersalons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._usersalons (
    "A" text NOT NULL,
    "B" text NOT NULL
);


--
-- Name: accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accounts (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


--
-- Name: announcements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.announcements (
    id text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    type text DEFAULT 'info'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: appointments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointments (
    id text NOT NULL,
    salon_id text NOT NULL,
    client_id text NOT NULL,
    staff_id text NOT NULL,
    service_id text NOT NULL,
    starts_at timestamp(3) without time zone NOT NULL,
    ends_at timestamp(3) without time zone NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    price numeric(10,2) NOT NULL,
    notes text,
    source text DEFAULT 'online'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    salon_id text,
    user_id text,
    action text NOT NULL,
    entity text NOT NULL,
    entity_id text,
    details text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: cash_closings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cash_closings (
    id text NOT NULL,
    salon_id text NOT NULL,
    opened_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    closed_at timestamp(3) without time zone,
    opening_balance numeric(10,2) DEFAULT 0.00 NOT NULL,
    closing_balance numeric(10,2),
    total_income numeric(10,2) DEFAULT 0.00 NOT NULL,
    total_expense numeric(10,2) DEFAULT 0.00 NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients (
    id text NOT NULL,
    salon_id text NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    address text,
    nif text,
    notes text,
    loyalty_points integer DEFAULT 0 NOT NULL,
    total_spent numeric(10,2) DEFAULT 0.00 NOT NULL,
    visit_count integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_visit timestamp(3) without time zone,
    password text
);


--
-- Name: global_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.global_configs (
    id text DEFAULT 'singleton'::text NOT NULL,
    landing_page text,
    kiwify_configs text,
    stripe_configs text,
    support_config text,
    promotion_config text,
    seo_config text,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id text NOT NULL,
    salon_id text NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    stock_quantity integer DEFAULT 0 NOT NULL,
    category text DEFAULT 'Geral'::text NOT NULL,
    image_url text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: salons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.salons (
    id text NOT NULL,
    owner_id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    address text,
    phone text,
    email text,
    logo_url text,
    cover_url text,
    working_hours text,
    settings text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    plan text DEFAULT 'free'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    locale text DEFAULT 'pt'::text NOT NULL,
    timezone text DEFAULT 'Europe/Lisbon'::text NOT NULL,
    translations text,
    trial_ends_at timestamp(3) without time zone,
    nif text
);


--
-- Name: services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services (
    id text NOT NULL,
    salon_id text NOT NULL,
    name text NOT NULL,
    description text,
    duration_minutes integer NOT NULL,
    price numeric(10,2) NOT NULL,
    category text DEFAULT 'Geral'::text NOT NULL,
    image_url text,
    is_active boolean DEFAULT true NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    translations text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


--
-- Name: staff; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff (
    id text NOT NULL,
    salon_id text NOT NULL,
    user_id text,
    name text NOT NULL,
    email text,
    phone text,
    role text DEFAULT 'professional'::text NOT NULL,
    avatar_url text,
    bio text,
    commission_rate numeric(5,2) DEFAULT 0.00 NOT NULL,
    working_hours text,
    is_active boolean DEFAULT true NOT NULL,
    color text DEFAULT '#0D9488'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: staff_services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff_services (
    staff_id text NOT NULL,
    service_id text NOT NULL
);


--
-- Name: support_tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_tickets (
    id text NOT NULL,
    salon_id text NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    response text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id text NOT NULL,
    salon_id text NOT NULL,
    appointment_id text,
    staff_id text,
    type text NOT NULL,
    amount numeric(10,2) NOT NULL,
    description text,
    payment_method text DEFAULT 'cash'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    product_id text
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    name text,
    email text,
    "emailVerified" timestamp(3) without time zone,
    password text,
    image text,
    role text DEFAULT 'owner'::text NOT NULL,
    locale text DEFAULT 'pt'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    salon_id text
);


--
-- Name: verification_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.verification_tokens (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


--
-- Data for Name: _usersalons; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._usersalons ("A", "B") FROM stdin;
\.


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.accounts (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.announcements (id, title, content, type, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.appointments (id, salon_id, client_id, staff_id, service_id, starts_at, ends_at, status, price, notes, source, created_at, updated_at) FROM stdin;
31efbd2a-6459-490a-b5a8-a762dd3c92e2	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	4a61d69c-d4e4-47b7-ae6c-b84a643655e8	a9535fad-bfe0-49fc-88f0-54bd16235526	bb43d5fb-ca3c-4422-85b4-24ebf5333df7	2026-04-15 09:00:00	2026-04-15 09:45:00	completed	40.00	\N	online	2026-04-15 21:39:35.667	2026-04-15 21:46:20.181
593babef-13ee-4930-aa8a-6a4d99705c1f	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	707dc4f6-11c1-449c-aa12-a45d9edb8359	a9535fad-bfe0-49fc-88f0-54bd16235526	c2687d26-7418-45d9-84bd-d2bd446d54ed	2026-04-14 09:00:00	2026-04-14 13:00:00	completed	220.00	\N	online	2026-04-15 21:37:39.192	2026-04-15 21:48:10.715
dd2a01e3-8040-4cc9-8759-ed9188b8770d	584fd949-332c-41b7-9cd5-6e73622ab2fb	ea58fc61-8b45-44ac-913a-afc3378afba5	379844dd-38be-483c-971c-bed8e8f914c7	76a9d76c-6daf-4efb-95d9-727a002a6e42	2026-04-27 12:00:00	2026-04-27 13:15:00	pending	28.00	\N	online	2026-04-17 11:28:17.121	2026-04-17 11:28:17.121
de85601f-dd62-4167-bbe5-9ff7378bb0c9	584fd949-332c-41b7-9cd5-6e73622ab2fb	3ebf5440-2b12-4bc4-9589-96a086f19aa6	379844dd-38be-483c-971c-bed8e8f914c7	25c331fd-6ff5-4307-85d1-f273ad4d0c82	2026-04-24 10:00:00	2026-04-24 10:30:00	pending	15.00	\N	online	2026-04-17 11:29:53.739	2026-04-17 11:29:53.739
3a3e4de8-5ee9-49f7-bb75-71d9164b2fd7	584fd949-332c-41b7-9cd5-6e73622ab2fb	5e9b43c6-47bc-49ec-8a31-26fbe6461dc7	379844dd-38be-483c-971c-bed8e8f914c7	25c331fd-6ff5-4307-85d1-f273ad4d0c82	2026-04-17 09:00:00	2026-04-17 09:30:00	completed	15.00	\N	online	2026-04-16 17:28:43.351	2026-04-17 11:33:48.908
2d3845cf-683f-46a6-963d-227916109059	584fd949-332c-41b7-9cd5-6e73622ab2fb	1cb4ebaf-5327-4886-998f-0b251e4fc2e6	379844dd-38be-483c-971c-bed8e8f914c7	67754ff2-ecb0-43d4-8e37-6f5499d83709	2026-04-17 10:00:00	2026-04-17 10:30:00	completed	25.00	\N	online	2026-04-16 17:32:37.712	2026-04-17 11:34:03.197
d6eef9fe-1a6e-4bb7-83c1-f9667909b9d5	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	c9c3882d-37a3-491b-aad0-a3fb2be318be	a9535fad-bfe0-49fc-88f0-54bd16235526	77e16e20-6594-467b-8538-d4f90be7cf19	2026-04-16 09:00:00	2026-04-16 10:00:00	completed	50.00	\N	online	2026-04-15 21:21:37.319	2026-04-18 16:47:33.735
78db6ce4-9eab-487f-95b7-7eb79aebcc3c	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	4a61d69c-d4e4-47b7-ae6c-b84a643655e8	a9535fad-bfe0-49fc-88f0-54bd16235526	77e16e20-6594-467b-8538-d4f90be7cf19	2026-04-16 12:00:00	2026-04-16 13:00:00	completed	50.00	\N	online	2026-04-15 20:10:18.192	2026-04-18 16:47:38.614
7facbf8f-4ad7-4d76-91cf-ec99d18d98fe	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	707dc4f6-11c1-449c-aa12-a45d9edb8359	453d9dfb-6de1-4b4d-9cd5-32df5503b6d6	c81f19cb-998a-42ca-b045-e9fa60418aa3	2026-04-16 12:00:00	2026-04-16 14:00:00	completed	75.00	\N	online	2026-04-15 20:39:37.538	2026-04-18 16:47:47.265
c5149b35-1d8f-4a05-b445-70e00f2195db	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	4a61d69c-d4e4-47b7-ae6c-b84a643655e8	a9535fad-bfe0-49fc-88f0-54bd16235526	bb43d5fb-ca3c-4422-85b4-24ebf5333df7	2026-04-17 10:00:00	2026-04-17 10:45:00	completed	40.00	\N	online	2026-04-15 21:23:50.78	2026-04-18 16:47:51.185
c7d06535-fc86-403c-bf55-38d55a69c82f	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	c9c3882d-37a3-491b-aad0-a3fb2be318be	453d9dfb-6de1-4b4d-9cd5-32df5503b6d6	c2687d26-7418-45d9-84bd-d2bd446d54ed	2026-04-18 10:00:00	2026-04-18 14:00:00	completed	220.00	\N	online	2026-04-15 21:33:45.671	2026-04-18 16:48:08.324
48509400-7140-47f9-9e48-c0a0d8b4b358	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	707dc4f6-11c1-449c-aa12-a45d9edb8359	fb3667c1-2e3f-46f8-bdd3-3b2acc04bd62	77e16e20-6594-467b-8538-d4f90be7cf19	2026-04-17 09:00:00	2026-04-17 10:00:00	completed	50.00	\N	online	2026-04-15 20:38:48.644	2026-04-18 16:55:05.898
57fa8d75-2da7-404a-b80a-6213896bfe2c	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	c9c3882d-37a3-491b-aad0-a3fb2be318be	a9535fad-bfe0-49fc-88f0-54bd16235526	bb43d5fb-ca3c-4422-85b4-24ebf5333df7	2026-04-20 09:00:00	2026-04-20 09:45:00	pending	40.00	\N	online	2026-04-18 16:56:44.358	2026-04-18 16:56:55.708
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, salon_id, user_id, action, entity, entity_id, details, created_at) FROM stdin;
386430cd-0d9b-49cc-ac1e-28285a602b60	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_salon_settings	salon	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	\N	2026-04-15 18:49:22.569
e6b3be91-7e98-45ca-baff-0dab54cf6799	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_salon_settings	salon	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	\N	2026-04-15 18:52:17.515
aa3b6e7e-98e3-42c5-b2e4-f5c6dad2985c	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_salon_settings	salon	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	\N	2026-04-15 18:53:21.437
dd2d3446-ade7-455f-90cf-cf2bdecef6e4	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_salon_settings	salon	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	\N	2026-04-15 18:53:30.612
67aceb91-2462-4556-b837-ad5915f0c367	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_salon_settings	salon	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	\N	2026-04-15 18:54:33.589
fe24b2e5-7f19-49d2-b68e-b8103b168769	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_salon_settings	salon	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	\N	2026-04-15 18:55:42.359
e2204423-3ecc-4ac4-9ad1-0d6c71eec7f0	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_salon_settings	salon	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	\N	2026-04-15 18:56:27.007
4e1eb2ba-5ac4-4c99-a53b-11312ede0b03	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_salon_settings	salon	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	\N	2026-04-15 18:56:50.519
c4c57c48-3750-475e-afc2-eda214bb28d8	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_salon_settings	salon	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	\N	2026-04-15 18:57:06.506
6c842238-7a0f-45a9-9ea9-9dc9d60a9fce	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_salon_settings	salon	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	\N	2026-04-15 18:57:22.044
9b4aef4b-ce66-42e1-be21-e5f91db27173	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	create_staff	staff	a9535fad-bfe0-49fc-88f0-54bd16235526	\N	2026-04-15 19:54:58.058
09166b3f-3aa7-490f-a6d5-f0eee175d2fc	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	create_staff	staff	fb3667c1-2e3f-46f8-bdd3-3b2acc04bd62	\N	2026-04-15 19:57:25.79
b69186ed-4ba1-4dd5-9b94-039e46648744	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	create_staff	staff	453d9dfb-6de1-4b4d-9cd5-32df5503b6d6	\N	2026-04-15 19:58:48.624
97bcdf3f-3ec2-4d9f-b031-394cedc379a9	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	create_service	service	77e16e20-6594-467b-8538-d4f90be7cf19	\N	2026-04-15 20:01:20.835
9a2500d1-0755-40bc-a20b-03eee8fc8dbf	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	create_service	service	13da598c-786d-4a78-9fb1-f21114b69df6	\N	2026-04-15 20:01:53.489
3bbc9fb1-26e1-4fb2-a86a-17af8744fb6c	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	create_service	service	c81f19cb-998a-42ca-b045-e9fa60418aa3	\N	2026-04-15 20:02:21.66
fdde1a6f-84ed-4f02-9310-fb0eb65aca0c	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	create_service	service	58a46055-2519-46bd-aee5-c9710ec1aaf3	\N	2026-04-15 20:03:12.321
d26c970a-1d94-4aa6-a0a9-7ffb282d143a	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	create_service	service	745ca5c9-8938-4171-91ec-2a5885fb0830	\N	2026-04-15 20:03:39.417
956d735e-07b7-4784-871a-93df833ff613	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	create_service	service	417a2d43-2916-4578-b54d-92a30a86a0fb	\N	2026-04-15 20:04:03.87
8a25aaca-711f-4d36-b876-9d8f24392eb4	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	create_service	service	732452bc-31ab-4dac-87dd-30b20ccd38e7	\N	2026-04-15 20:04:34.052
eecbbf7d-e0fb-43ac-b7be-a0ebbbeb4c86	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	create_service	service	c2687d26-7418-45d9-84bd-d2bd446d54ed	\N	2026-04-15 20:05:03.791
dac784aa-616f-4cf3-8131-539d242d4ca6	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	create_service	service	9340aa9b-e177-4ece-b66b-93c29b1c764e	\N	2026-04-15 20:05:40.962
0cdfd587-f80d-40be-bc4b-0d249b2499c6	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	create_service	service	bb43d5fb-ca3c-4422-85b4-24ebf5333df7	\N	2026-04-15 20:06:06.585
844c1889-87b1-4b15-a258-2823e37fdc26	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_profile	user	59080b2c-082f-4b59-9bde-074598226128	\N	2026-04-15 20:07:18.276
fe13efc1-bac4-48a0-9115-0c1eae3ff2d7	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_staff	staff	a9535fad-bfe0-49fc-88f0-54bd16235526	\N	2026-04-15 20:07:54.611
84e72455-daa8-4db9-b8eb-8cc39f291e16	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_salon_settings	salon	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	\N	2026-04-15 20:10:12.278
e8cacf5f-a0b1-472b-913a-a2900d23a23d	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_staff	staff	fb3667c1-2e3f-46f8-bdd3-3b2acc04bd62	\N	2026-04-15 20:18:05.982
9024ceca-6275-4afa-a099-3ac729cf0f81	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_staff	staff	453d9dfb-6de1-4b4d-9cd5-32df5503b6d6	\N	2026-04-15 20:18:17.525
e11a1def-6dff-413d-b871-accefa9102fb	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_salon_settings	salon	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	\N	2026-04-15 20:18:33.47
59ee7f95-b804-4fb7-bb4c-4e2d31a1b1f8	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_staff	staff	fb3667c1-2e3f-46f8-bdd3-3b2acc04bd62	\N	2026-04-15 20:18:46.856
3823137e-b2c3-48ac-86d7-5f14263a4876	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_staff	staff	fb3667c1-2e3f-46f8-bdd3-3b2acc04bd62	\N	2026-04-15 20:22:03.717
c936faf4-7536-478f-8df0-4fcf879c7714	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_staff	staff	fb3667c1-2e3f-46f8-bdd3-3b2acc04bd62	\N	2026-04-15 20:22:09.385
9ae3873d-a28b-4977-90ca-6007aa85360a	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_staff	staff	fb3667c1-2e3f-46f8-bdd3-3b2acc04bd62	\N	2026-04-15 20:25:56.526
626a2900-afea-40d2-9509-acb6dd195350	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_staff	staff	453d9dfb-6de1-4b4d-9cd5-32df5503b6d6	\N	2026-04-15 20:26:52.093
fda676c5-fa68-40e7-ae92-68c7acb242bd	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	delete_appointment	appointment	663a1637-5726-4f93-8505-295ecfb2b8a3	\N	2026-04-15 20:30:30.944
2351a36b-db5a-491a-86a2-ff262c0b3c46	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	delete_appointment	appointment	af3cc389-a400-4f8c-9a99-ea0fbc398dc9	\N	2026-04-15 20:37:13.717
2edd8d9f-00bd-4ebd-83ac-8334ef5e2c4d	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_appointment	appointment	7facbf8f-4ad7-4d76-91cf-ec99d18d98fe	\N	2026-04-15 20:41:39.239
5b01c449-717d-495a-802e-941fbe47526a	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_appointment	appointment	48509400-7140-47f9-9e48-c0a0d8b4b358	\N	2026-04-15 20:41:42.464
a533b2fb-881b-4490-87e9-46b917eadf40	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_salon_settings	salon	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	\N	2026-04-15 20:54:40.281
bf71c747-64fb-410c-884d-d13b5e81ab8d	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_salon_settings	salon	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	\N	2026-04-15 20:59:02.878
2b1d70c3-ab4b-40de-812a-d9a707cc48b4	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_salon_settings	salon	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	\N	2026-04-15 21:13:04.857
d71f48a3-5320-43eb-bffc-56aad7680b17	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_salon_settings	salon	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	\N	2026-04-15 21:15:56.607
75527397-1445-47d3-aa25-b77098474de4	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_salon_settings	salon	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	\N	2026-04-15 21:16:48.427
5b8fd313-da6a-43c4-8a54-bdf8414aa066	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_salon_settings	salon	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	\N	2026-04-15 21:17:05.619
4ce7ed25-b781-4f9c-aa11-6fd696a9d12f	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_salon_settings	salon	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	\N	2026-04-15 21:17:36.151
8425abc2-7267-44fe-a195-8eb200d1c1c5	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_salon_settings	salon	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	\N	2026-04-15 21:17:56.668
c79a5cb3-f0df-4667-a179-60d44196add3	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_salon_settings	salon	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	\N	2026-04-15 21:18:16.027
81636576-0d6d-4dfb-9ec5-82fe943f5188	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_salon_settings	salon	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	\N	2026-04-15 21:18:31.543
c32eb204-c951-402c-b296-d863d45ff214	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_salon_settings	salon	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	\N	2026-04-15 21:18:35.309
c80e1900-deb8-4298-8bb0-0186e4ca91ab	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_salon_settings	salon	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	\N	2026-04-15 21:18:49.671
b6a19405-1ab2-4893-a087-794020e725d6	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_salon_settings	salon	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	\N	2026-04-15 21:19:04.317
45b89a0b-c381-4b02-a353-b17c5fbfe676	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_salon_settings	salon	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	\N	2026-04-15 21:19:16.289
e0df1bca-66a4-494a-a2e1-07a2df672ba4	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	create_support_ticket	support_ticket	new	\N	2026-04-15 21:20:03.425
2bf52e10-b3f0-40a5-9367-d810d3c3b74f	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	create_appointment	appointment	c5149b35-1d8f-4a05-b445-70e00f2195db	\N	2026-04-15 21:23:50.786
b051392e-3311-4924-a958-b3a044eeffb1	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	create_appointment	appointment	5c1c5676-23e7-4dcf-98d6-57ab3dff73d9	\N	2026-04-15 21:24:41.75
19e24b5a-421d-4e3f-88e5-58258a0cd6c7	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	delete_appointment	appointment	5c1c5676-23e7-4dcf-98d6-57ab3dff73d9	\N	2026-04-15 21:25:57.827
4f23a52a-1cb8-46b4-b791-6cf687072e45	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	create_staff	staff	da6d4409-a78c-4ead-8e79-a23d93c043e3	\N	2026-04-15 21:27:02.481
b1649f50-1d9e-4c15-80e2-9d8147eeb658	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	ffe14376-0fc0-4d9f-a7b2-86b0eabbd31c	create_appointment	appointment	5e3ac27e-e0dd-4a9f-8e8d-94ae1c9bab5a	\N	2026-04-15 21:27:51.189
050b5201-91e9-4c78-8f38-b71a33512701	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	delete_appointment	appointment	5e3ac27e-e0dd-4a9f-8e8d-94ae1c9bab5a	\N	2026-04-15 21:33:00.105
e00fb857-f225-4350-819d-302a930dde48	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	create_appointment	appointment	c7d06535-fc86-403c-bf55-38d55a69c82f	\N	2026-04-15 21:33:45.785
4d37d8a5-a09f-4c42-8850-25d5b7722060	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_appointment	appointment	d6eef9fe-1a6e-4bb7-83c1-f9667909b9d5	\N	2026-04-15 21:35:10.903
022909cc-28e1-492f-b98d-a74956e41164	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_appointment	appointment	78db6ce4-9eab-487f-95b7-7eb79aebcc3c	\N	2026-04-15 21:35:16.277
0838210c-4a67-4479-a709-6527a2aaf1f4	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_appointment	appointment	7facbf8f-4ad7-4d76-91cf-ec99d18d98fe	\N	2026-04-15 21:35:20.219
8bd46060-55cf-401b-bf3d-1a242e0a5aa1	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_appointment	appointment	d6eef9fe-1a6e-4bb7-83c1-f9667909b9d5	\N	2026-04-15 21:37:00.726
54ed11cd-4f67-4b69-81ca-ed506cf297a1	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_appointment	appointment	d6eef9fe-1a6e-4bb7-83c1-f9667909b9d5	\N	2026-04-15 21:37:06.955
98c2b632-d74c-4932-8086-f1802a760668	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_appointment	appointment	78db6ce4-9eab-487f-95b7-7eb79aebcc3c	\N	2026-04-15 21:37:10.705
2020fbaa-b489-4a47-a936-51d0cbfad97c	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_appointment	appointment	7facbf8f-4ad7-4d76-91cf-ec99d18d98fe	\N	2026-04-15 21:37:17.912
32905a35-928b-4a6c-a82e-e24099be96ea	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	create_appointment	appointment	593babef-13ee-4930-aa8a-6a4d99705c1f	\N	2026-04-15 21:37:39.206
06ea9db1-1832-4592-8bd0-9e508d91c92d	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	create_appointment	appointment	31efbd2a-6459-490a-b5a8-a762dd3c92e2	\N	2026-04-15 21:39:35.681
6e2bf3e8-4ad4-4014-a3ae-8e7ee0482a93	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_appointment	appointment	593babef-13ee-4930-aa8a-6a4d99705c1f	\N	2026-04-15 21:46:07.605
437acf5e-c65c-4f0e-a5aa-9141149e0c68	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_appointment	appointment	31efbd2a-6459-490a-b5a8-a762dd3c92e2	\N	2026-04-15 21:46:13.564
933f068d-eaf8-4b49-8dab-26ca9df4333c	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_appointment	appointment	31efbd2a-6459-490a-b5a8-a762dd3c92e2	\N	2026-04-15 21:46:20.195
6f189e95-34e4-4f95-850c-ef41b9193ef2	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	ffe14376-0fc0-4d9f-a7b2-86b0eabbd31c	update_appointment	appointment	593babef-13ee-4930-aa8a-6a4d99705c1f	\N	2026-04-15 21:48:05.187
944899bd-d9f6-4ce0-a4f3-2c6623a0216f	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	ffe14376-0fc0-4d9f-a7b2-86b0eabbd31c	update_appointment	appointment	593babef-13ee-4930-aa8a-6a4d99705c1f	\N	2026-04-15 21:48:10.736
be015cb7-d7d5-4e05-956d-64c7b69c5d9e	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_salon_settings	salon	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	\N	2026-04-15 21:49:44.741
96b9cc80-b340-44fe-b62f-b307b4ce26ce	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_salon_settings	salon	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	\N	2026-04-15 21:50:02.602
3b0b04a9-498d-4918-9795-6fba5df2c429	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_salon_settings	salon	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	\N	2026-04-15 21:50:15.776
e51fcbe4-42a6-4d34-ac49-5b07cb92c8cf	584fd949-332c-41b7-9cd5-6e73622ab2fb	d1b73d0e-8fe8-4bb6-9dc9-7af1deb8ab8f	update_salon_settings	salon	584fd949-332c-41b7-9cd5-6e73622ab2fb	\N	2026-04-16 16:25:00.524
e0a4eeec-35ed-4ff1-bb40-f515a029bbb1	584fd949-332c-41b7-9cd5-6e73622ab2fb	d1b73d0e-8fe8-4bb6-9dc9-7af1deb8ab8f	update_salon_settings	salon	584fd949-332c-41b7-9cd5-6e73622ab2fb	\N	2026-04-16 16:28:22.592
f2a9c348-5737-4b12-8e55-d6dcafeb0c31	584fd949-332c-41b7-9cd5-6e73622ab2fb	d1b73d0e-8fe8-4bb6-9dc9-7af1deb8ab8f	update_salon_settings	salon	584fd949-332c-41b7-9cd5-6e73622ab2fb	\N	2026-04-16 16:29:33.559
42f340a0-7e8c-4186-94cf-db5ed8f91ffc	584fd949-332c-41b7-9cd5-6e73622ab2fb	d1b73d0e-8fe8-4bb6-9dc9-7af1deb8ab8f	update_salon_settings	salon	584fd949-332c-41b7-9cd5-6e73622ab2fb	\N	2026-04-16 16:41:58.569
c99c39e6-2bb4-4419-83ca-da5458af6d7c	584fd949-332c-41b7-9cd5-6e73622ab2fb	d1b73d0e-8fe8-4bb6-9dc9-7af1deb8ab8f	create_staff	staff	379844dd-38be-483c-971c-bed8e8f914c7	\N	2026-04-16 16:43:20.289
2dc3326d-bb11-48fc-9100-d3422c2ba576	584fd949-332c-41b7-9cd5-6e73622ab2fb	d1b73d0e-8fe8-4bb6-9dc9-7af1deb8ab8f	create_service	service	25c331fd-6ff5-4307-85d1-f273ad4d0c82	\N	2026-04-16 16:44:42.337
61b69a85-ab49-4b37-af94-f070c66d5f7f	584fd949-332c-41b7-9cd5-6e73622ab2fb	d1b73d0e-8fe8-4bb6-9dc9-7af1deb8ab8f	create_service	service	274067fd-a8ee-4b30-8e5a-0f3819996054	\N	2026-04-16 16:45:10.801
4366ffbd-7c45-41a3-ada4-383e32b5c5c5	584fd949-332c-41b7-9cd5-6e73622ab2fb	d1b73d0e-8fe8-4bb6-9dc9-7af1deb8ab8f	create_service	service	d6257674-5c23-4d32-bfeb-8d9b9ffe0148	\N	2026-04-16 16:45:38.292
8fd1112f-68f6-439b-a472-cd0cadf3a3b9	584fd949-332c-41b7-9cd5-6e73622ab2fb	d1b73d0e-8fe8-4bb6-9dc9-7af1deb8ab8f	create_service	service	76a9d76c-6daf-4efb-95d9-727a002a6e42	\N	2026-04-16 16:46:22.49
b7998a10-dbd8-4129-bd0e-f5bb32874698	584fd949-332c-41b7-9cd5-6e73622ab2fb	d1b73d0e-8fe8-4bb6-9dc9-7af1deb8ab8f	create_service	service	69615c76-92c3-4242-bba0-154c6cb67dbc	\N	2026-04-16 16:46:44.425
7f99273e-5b8f-48e0-b280-b9b3087e243b	584fd949-332c-41b7-9cd5-6e73622ab2fb	d1b73d0e-8fe8-4bb6-9dc9-7af1deb8ab8f	create_service	service	67754ff2-ecb0-43d4-8e37-6f5499d83709	\N	2026-04-16 16:47:02.676
b8338b62-c507-4a9d-af73-46f58b47040a	584fd949-332c-41b7-9cd5-6e73622ab2fb	d1b73d0e-8fe8-4bb6-9dc9-7af1deb8ab8f	create_service	service	64d25140-42ef-49f2-a61c-74c7b6813c7f	\N	2026-04-16 16:47:30.926
62176305-1205-40aa-9d03-31bbb3a59013	584fd949-332c-41b7-9cd5-6e73622ab2fb	d1b73d0e-8fe8-4bb6-9dc9-7af1deb8ab8f	create_service	service	2ef61416-4898-4730-82ed-0c708c74d383	\N	2026-04-16 16:48:09.18
c79ea5b5-36d4-43d6-a702-b45ed4b1c6d8	584fd949-332c-41b7-9cd5-6e73622ab2fb	d1b73d0e-8fe8-4bb6-9dc9-7af1deb8ab8f	create_service	service	48aefaa7-4dc4-41f9-aab7-e541b1d706b0	\N	2026-04-16 16:48:28.748
08345459-82d6-4fb4-9b86-fea4fb444892	584fd949-332c-41b7-9cd5-6e73622ab2fb	d1b73d0e-8fe8-4bb6-9dc9-7af1deb8ab8f	update_salon_settings	salon	584fd949-332c-41b7-9cd5-6e73622ab2fb	\N	2026-04-16 17:27:31.073
894c1a7d-8b35-4eac-9d4a-21cc481aad41	584fd949-332c-41b7-9cd5-6e73622ab2fb	d1b73d0e-8fe8-4bb6-9dc9-7af1deb8ab8f	update_salon_settings	salon	584fd949-332c-41b7-9cd5-6e73622ab2fb	\N	2026-04-16 17:29:06.82
236b5154-228c-4902-861e-b61d11aa0a15	584fd949-332c-41b7-9cd5-6e73622ab2fb	d1b73d0e-8fe8-4bb6-9dc9-7af1deb8ab8f	update_salon_settings	salon	584fd949-332c-41b7-9cd5-6e73622ab2fb	\N	2026-04-16 17:29:45.921
2e3eb51d-e02d-43bb-9e1a-edf713437c58	584fd949-332c-41b7-9cd5-6e73622ab2fb	d1b73d0e-8fe8-4bb6-9dc9-7af1deb8ab8f	update_salon_settings	salon	584fd949-332c-41b7-9cd5-6e73622ab2fb	\N	2026-04-16 17:31:04.218
f30cd289-7303-4bdb-b906-022e87cb413b	584fd949-332c-41b7-9cd5-6e73622ab2fb	d1b73d0e-8fe8-4bb6-9dc9-7af1deb8ab8f	update_salon_settings	salon	584fd949-332c-41b7-9cd5-6e73622ab2fb	\N	2026-04-16 17:31:41.296
9bc41eb6-fbb8-4a18-aa90-0ca2ffe4c62a	584fd949-332c-41b7-9cd5-6e73622ab2fb	d1b73d0e-8fe8-4bb6-9dc9-7af1deb8ab8f	update_appointment	appointment	3a3e4de8-5ee9-49f7-bb75-71d9164b2fd7	\N	2026-04-17 11:33:48.916
4715540b-8dc2-4fea-83ef-072eb43181d0	584fd949-332c-41b7-9cd5-6e73622ab2fb	d1b73d0e-8fe8-4bb6-9dc9-7af1deb8ab8f	update_appointment	appointment	2d3845cf-683f-46a6-963d-227916109059	\N	2026-04-17 11:33:55.844
c1d0ebb2-a9e1-4091-bf7d-f46ec7769955	584fd949-332c-41b7-9cd5-6e73622ab2fb	d1b73d0e-8fe8-4bb6-9dc9-7af1deb8ab8f	update_appointment	appointment	2d3845cf-683f-46a6-963d-227916109059	\N	2026-04-17 11:34:03.214
93691aae-60ec-408d-bb36-fb74b0294ae9	584fd949-332c-41b7-9cd5-6e73622ab2fb	d1b73d0e-8fe8-4bb6-9dc9-7af1deb8ab8f	update_salon_settings	salon	584fd949-332c-41b7-9cd5-6e73622ab2fb	\N	2026-04-17 11:39:13.61
38b29ad2-22df-493e-9c53-ce8de8e10cfb	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_appointment	appointment	d6eef9fe-1a6e-4bb7-83c1-f9667909b9d5	\N	2026-04-18 16:47:33.75
14f99814-54d2-4af4-8e78-77abf9670c21	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_appointment	appointment	78db6ce4-9eab-487f-95b7-7eb79aebcc3c	\N	2026-04-18 16:47:38.622
5dbbf288-9b0c-463d-afdb-9add9bc5dbe2	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_appointment	appointment	48509400-7140-47f9-9e48-c0a0d8b4b358	\N	2026-04-18 16:47:43.231
4317e3ae-6ca4-4983-8b27-7443f0bc3b91	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_appointment	appointment	7facbf8f-4ad7-4d76-91cf-ec99d18d98fe	\N	2026-04-18 16:47:47.273
87123c27-5149-4669-aac6-6696420e2524	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_appointment	appointment	c5149b35-1d8f-4a05-b445-70e00f2195db	\N	2026-04-18 16:47:51.196
c22cb70b-9716-46fb-bfa6-bf067e40dd9c	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_appointment	appointment	c7d06535-fc86-403c-bf55-38d55a69c82f	\N	2026-04-18 16:48:08.334
4d0e19e9-e729-4e3c-89bc-f7193070764d	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_client	client	c9c3882d-37a3-491b-aad0-a3fb2be318be	\N	2026-04-18 16:52:33.546
f26c75a4-9fd8-4648-8e83-59ab80f8eda2	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_appointment	appointment	48509400-7140-47f9-9e48-c0a0d8b4b358	\N	2026-04-18 16:54:59.274
f47e23fd-ce9a-47d8-80a4-5c4e031c9c2a	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_appointment	appointment	48509400-7140-47f9-9e48-c0a0d8b4b358	\N	2026-04-18 16:55:05.909
fd29c323-cbd2-4ffa-bd18-dac4b7e24495	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	create_appointment	appointment	57fa8d75-2da7-404a-b80a-6213896bfe2c	\N	2026-04-18 16:56:44.369
05635475-7e62-4481-9726-cbf6e85a5a27	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_appointment	appointment	57fa8d75-2da7-404a-b80a-6213896bfe2c	\N	2026-04-18 16:56:51.183
2823dbe1-978e-40fa-8b2e-3df8d780b06b	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	update_appointment	appointment	57fa8d75-2da7-404a-b80a-6213896bfe2c	\N	2026-04-18 16:56:55.718
\.


--
-- Data for Name: cash_closings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cash_closings (id, salon_id, opened_at, closed_at, opening_balance, closing_balance, total_income, total_expense, status, notes, created_at) FROM stdin;
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.clients (id, salon_id, name, email, phone, address, nif, notes, loyalty_points, total_spent, visit_count, created_at, last_visit, password) FROM stdin;
ea58fc61-8b45-44ac-913a-afc3378afba5	584fd949-332c-41b7-9cd5-6e73622ab2fb	Gilberto Jaques 	\N	965526062	\N	\N	\N	0	0.00	0	2026-04-17 11:28:17.102	\N	\N
3ebf5440-2b12-4bc4-9589-96a086f19aa6	584fd949-332c-41b7-9cd5-6e73622ab2fb	Alan	\N	999999999	\N	\N	\N	0	0.00	0	2026-04-17 11:29:53.729	\N	\N
5e9b43c6-47bc-49ec-8a31-26fbe6461dc7	584fd949-332c-41b7-9cd5-6e73622ab2fb	João Silva	\N	912912912	\N	\N	\N	1	15.00	1	2026-04-16 17:28:43.343	2026-04-17 09:00:00	\N
1cb4ebaf-5327-4886-998f-0b251e4fc2e6	584fd949-332c-41b7-9cd5-6e73622ab2fb	Marcos Antonio	\N	912912923	\N	\N	\N	1	25.00	1	2026-04-16 17:32:37.702	2026-04-17 10:00:00	\N
707dc4f6-11c1-449c-aa12-a45d9edb8359	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	Cristina Ribeiro	\N	914925936	\N	\N	\N	3	345.00	3	2026-04-15 20:28:50.024	2026-04-17 09:00:00	\N
4a61d69c-d4e4-47b7-ae6c-b84a643655e8	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	Emanuela	\N	910911912	\N	\N	\N	3	130.00	3	2026-04-15 20:10:18.18	2026-04-17 10:00:00	\N
c9c3882d-37a3-491b-aad0-a3fb2be318be	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	Joana Silva	\N	914725836	Rua albufeira, 13 	312372434	Cliente com alergia a amendoim	2	270.00	2	2026-04-15 21:21:37.305	2026-04-18 10:00:00	\N
\.


--
-- Data for Name: global_configs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.global_configs (id, landing_page, kiwify_configs, stripe_configs, support_config, promotion_config, seo_config, updated_at) FROM stdin;
singleton	{"heroTitle1":"","heroTitle2":"","heroDesc":"","featuresTitle":"","featuresDesc":"","plansTitle":"","plansDesc":"","plans":{"free":{"price":0,"appointments_per_month":50,"staff":1,"clients":100,"services":3,"qr_code":false,"logo":false,"cover":false,"reports":false,"commissions":false,"professional_export":false},"basic":{"price":29,"appointments_per_month":-1,"staff":5,"clients":500,"services":20,"qr_code":true,"logo":true,"cover":true,"reports":false,"commissions":false,"professional_export":false},"premium":{"price":39,"appointments_per_month":-1,"staff":-1,"clients":-1,"services":-1,"qr_code":true,"logo":true,"cover":true,"reports":true,"commissions":true,"professional_export":true}}}	{"webhookSecret":"","productBasicId":"","productPremiumId":""}	{"secretKey":"","publishableKey":"","webhookSecret":"","productBasicId":"","productPremiumId":""}	{"whatsappNumber":""}	{"enabled":true,"promo_text":"","trial_days":30}	{"metaTitle":"","metaDescription":"","metaKeywords":"","fbPixelId":"","googleAnalyticsId":"","ogImageUrl":""}	2026-04-16 15:55:31.631
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, salon_id, name, description, price, stock_quantity, category, image_url, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: salons; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.salons (id, owner_id, name, slug, description, address, phone, email, logo_url, cover_url, working_hours, settings, created_at, updated_at, plan, status, locale, timezone, translations, trial_ends_at, nif) FROM stdin;
2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	Crislene Hair	teste-3i9	✨ Realçando a sua beleza natural com cortes, cores e tratamentos exclusivos. Eleve sua autoestima e saia deslumbrante! 💇‍♀️💖 Agende seu momento.	PT, Rua das Minas, 12, 5000-471	+351910664744	crisleneneves@outlook.pt	https://yoryxemxmgneknhmrgpx.supabase.co/storage/v1/object/public/uploads/salon-media/59080b2c-082f-4b59-9bde-074598226128-1776278540255.png	https://yoryxemxmgneknhmrgpx.supabase.co/storage/v1/object/public/uploads/salon-media/59080b2c-082f-4b59-9bde-074598226128-1776287582038.png	{"monday":{"open":"09:00","close":"18:00"},"tuesday":{"open":"09:00","close":"18:00"},"wednesday":{"open":"09:00","close":"18:00"},"thursday":{"open":"09:00","close":"18:00"},"friday":{"open":"09:00","close":"18:00"},"saturday":{"open":"09:00","close":"18:00"},"sunday":null}	{"theme":"luxury","social_instagram":"https://www.instagram.com/crislene_k/","social_facebook":"https://www.facebook.com/cristiane.hair.52/","social_whatsapp":"+351910664744","gallery_urls":["https://img.antoniettasp.com.br/2026/corte-de-cabelo-feminino-em-camadas-1.jpg","https://kioshisako.com.br/wp-content/uploads/2025/09/Cortes-de-cabelo-feminino-em-v-1-819x1024.png","https://i.pinimg.com/474x/0a/73/4d/0a734df33d9ff1d23bf82a3dea1ec30e.jpg","https://i.pinimg.com/originals/04/ae/db/04aedb4445e3e28ec3ecf6f202918712.jpg"],"about_link":"","amenities":["wifi","hygiene","staff","kids","ac","parking"],"amenities_layout":"ticker","amenities_style":"card","amenities_color":"theme","services_layout":"carousel","services_style":"card","services_subtitles":{"pt":"Crislene Hair: Onde sua beleza encontra a elegância."}}	2026-04-14 15:37:12.459	2026-04-15 21:50:15.763	free	trial	pt	Europe/Lisbon	{"en":{"name":"Crislene Hair","description":"✨ Highlighting your natural beauty with exclusive cuts, colors and treatments. Raise your self-esteem and look stunning! 💇‍♀️💖 Schedule your moment."}}	2026-05-14 15:37:12.45	312372434
584fd949-332c-41b7-9cd5-6e73622ab2fb	d1b73d0e-8fe8-4bb6-9dc9-7af1deb8ab8f	Barbearia Neves	barbearia-neves	Barbearia tradicional, especialista em cortes e barbas masculinas.	PT, Rua das Minas, 12, 5000-471	+351910664744	animenet2010@gmail.com	https://yoryxemxmgneknhmrgpx.supabase.co/storage/v1/object/public/uploads/salon-media/d1b73d0e-8fe8-4bb6-9dc9-7af1deb8ab8f-1776356596982.png	https://yoryxemxmgneknhmrgpx.supabase.co/storage/v1/object/public/uploads/salon-media/d1b73d0e-8fe8-4bb6-9dc9-7af1deb8ab8f-1776357714660.png	{"monday":{"open":"09:00","close":"18:00"},"tuesday":{"open":"09:00","close":"18:00"},"wednesday":{"open":"09:00","close":"18:00"},"thursday":{"open":"09:00","close":"18:00"},"friday":{"open":"09:00","close":"18:00"},"saturday":{"open":"09:00","close":"18:00"},"sunday":null}	{"theme":"dark","social_instagram":"","social_facebook":"","social_whatsapp":"+351910664744","gallery_urls":["https://i0.wp.com/www.canalmasculino.com.br/wp-content/uploads/2017/05/cortes-cabelo-masculino-classicos-01.jpg?fit=570%2C570&ssl=1","https://i0.wp.com/www.canalmasculino.com.br/wp-content/uploads/2017/05/cortes-cabelo-masculino-classicos-16-570x570.jpg?resize=570%2C570","https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh9ADqnrIySJnvAF8PjwQc-nI8NAcuFl5h6301aHd81sxlp8sgOkmfjOTrPLXiCC0nadSwMYd4VyOKX9zPB1EC7o19j-mc6XVmE76q6D4sccIbEtKIw_k9LpkZE9vhAjzfEdH4bTRtbzD4/s1600/modeladores-masculinos-penteado-pompadour+%25282%2529.jpg","https://i.pinimg.com/originals/18/c6/f3/18c6f3520a27ea78339f3dc72714ab96.jpg"],"about_link":"","amenities":["wifi","parking","ac","hygiene","staff","kids"],"amenities_layout":"ticker","amenities_style":"minimal","amenities_color":"theme","services_layout":"carousel","services_style":"card","services_subtitles":{}}	2026-04-14 15:34:51.001	2026-04-17 11:40:28.338	free	trial	pt	Europe/Lisbon	{"en":{"name":"Barbearia Neves","description":"Traditional barbershop, specializing in men's cuts and beards."},"de":{"name":"Barbearia Neves","description":"Traditioneller Friseursalon, spezialisiert auf Herrenschnitte und Bärte."}}	2026-05-14 15:34:50.986	312372434
b2ac3d65-2b6a-4edd-9e3b-1ae0f13ee3ec	3b154202-2bb7-4e46-9f4c-27d5d7b392ba	Admin	admin	\N	PT, Rua da Minas, 12, 5000-471	+351910664744	\N	\N	\N	\N	\N	2026-04-13 23:19:43.679	2026-04-13 23:22:34.121	premium	active	pt	Europe/Lisbon	\N	2026-05-13 23:19:43.641	312372434
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.services (id, salon_id, name, description, duration_minutes, price, category, image_url, is_active, display_order, translations, created_at) FROM stdin;
77e16e20-6594-467b-8538-d4f90be7cf19	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	Corte Feminino Signature	Signature\tInclui aconselhamento visagista, lavagem relaxante com massagem capilar e corte personalizado.	60	50.00	Cabelo	\N	t	0	{"en":{"name":"Signature Women's Cut","description":"Signature Includes visa advice, relaxing wash with hair massage and personalized cut."}}	2026-04-15 20:01:20.825
13da598c-786d-4a78-9fb1-f21114b69df6	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	Brushing (Secagem/Styling)	Lavagem com produtos específicos e secagem (liso ou com ondas/volume).	60	30.00	Cabelo	\N	t	0	{"en":{"name":"Brushing (Drying/Styling)","description":"Washing with specific products and drying (smooth or with waves/volume)."}}	2026-04-15 20:01:53.482
c81f19cb-998a-42ca-b045-e9fa60418aa3	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	Coloração Global	Aplicação de cor em todo o cabelo ou retoque de raiz (tintas com ou sem amoníaco).	120	75.00	Cabelo	\N	t	0	{"en":{"name":"Global Coloring","description":"Application of color throughout the hair or root touch-up (dyes with or without ammonia)."}}	2026-04-15 20:02:21.654
58a46055-2519-46bd-aee5-c9710ec1aaf3	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	Balayage / Morena Iluminada	Técnica de aclaramento à mão livre para um efeito degradê natural e sofisticado.	200	180.00	Cabelo	\N	t	0	{"en":{"name":"Balayage / Bright Brunette","description":"Freehand lightening technique for a natural and sophisticated gradient effect."}}	2026-04-15 20:03:12.314
745ca5c9-8938-4171-91ec-2a5885fb0830	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	Nuances / Madeixas	Reflexos tradicionais com folha de alumínio para iluminar ou loiros totais.	135	140.00	Cabelo	\N	t	0	{"en":{"name":"Nuances / Highlights","description":"Traditional reflections with aluminum foil for lightening or total blonde."}}	2026-04-15 20:03:39.411
417a2d43-2916-4578-b54d-92a30a86a0fb	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	Tratamento de Hidratação Profunda	Reposição de água e nutrientes para fios desidratados e sem brilho.	45	45.00	Cabelo	\N	t	0	{"en":{"name":"Deep Hydration Treatment","description":"Replacement of water and nutrients for dehydrated and dull hair."}}	2026-04-15 20:04:03.863
732452bc-31ab-4dac-87dd-30b20ccd38e7	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	Reconstrução Capilar (SOS)	Tratamento intensivo com queratina e aminoácidos para cabelos danificados por química.	60	60.00	Cabelo	\N	t	0	{"en":{"name":"Hair Reconstruction (SOS)","description":"Intensive treatment with keratin and amino acids for chemically damaged hair."}}	2026-04-15 20:04:34.046
c2687d26-7418-45d9-84bd-d2bd446d54ed	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	Alisamento de Queratina	Redução de volume e frizz, conferindo brilho extremo e um liso duradouro.	240	220.00	Cabelo	\N	t	0	{"en":{"name":"Keratin Straightening","description":"Reduction of volume and frizz, providing extreme shine and long-lasting smoothness."}}	2026-04-15 20:05:03.784
9340aa9b-e177-4ece-b66b-93c29b1c764e	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	Penteado de Ocasião	Apanhados, semi-apanhados ou tranças elaboradas para eventos e festas.	90	70.00	Cabelo	\N	t	0	{"en":{"name":"Occasion Hairstyle","description":"Updos, semi-updos or elaborate braids for events and parties."}}	2026-04-15 20:05:40.956
bb43d5fb-ca3c-4422-85b4-24ebf5333df7	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	Gloss / Matização	Banho de brilho para neutralizar tons indesejados e renovar a cor entre colorações.	45	40.00	Cabelo	\N	t	0	{"en":{"name":"Gloss / Tint","description":"Shine bath to neutralize unwanted tones and renew color between colorings."}}	2026-04-15 20:06:06.578
274067fd-a8ee-4b30-8e5a-0f3819996054	584fd949-332c-41b7-9cd5-6e73622ab2fb	Barba de Cavalheiro	Aparo e desenho da barba com máquina e tesoura, finalizado com óleo.	30	13.00	Barba	\N	t	0	{"en":{"name":"Gentleman's Beard","description":"Trimming and shaping the beard with clippers and scissors, finished with oil."},"de":{"name":"Herrenbart","description":"Trimmen und Formen des Bartes mit Haarschneidemaschine und Schere, abschließend mit Öl."}}	2026-04-16 16:45:10.787
d6257674-5c23-4d32-bfeb-8d9b9ffe0148	584fd949-332c-41b7-9cd5-6e73622ab2fb	Ritual da Toalha Quente	Barbear clássico com navalha, espuma artesanal e toalhas quentes/frias.	40	20.00	Barba	\N	t	0	{"en":{"name":"Hot Towel Ritual","description":"Classic shave with razor, artisanal foam and hot/cold towels."},"de":{"name":"Heißes Handtuch-Ritual","description":"Klassische Rasur mit Rasiermesser, handgemachtem Schaum und heißen/kalten Handtüchern."}}	2026-04-16 16:45:38.279
69615c76-92c3-4242-bba0-154c6cb67dbc	584fd949-332c-41b7-9cd5-6e73622ab2fb	Corte Degradê (Fade)	Especialidade técnica com transição suave, focada em tendências modernas.	30	22.00	Cabelo	\N	t	0	{"en":{"name":"Gradient Cut (Fade)","description":"Technical specialty with smooth transition, focused on modern trends."},"de":{"name":"Verlaufsschnitt (Fade)","description":"Technische Spezialität mit fließendem Übergang, fokussiert auf moderne Trends."}}	2026-04-16 16:46:44.411
67754ff2-ecb0-43d4-8e37-6f5499d83709	584fd949-332c-41b7-9cd5-6e73622ab2fb	Camuflagem de Cabelos Brancos	Coloração discreta para tons acinzentados, mantendo o aspeto natural.	30	25.00	Cabelo	\N	t	0	{"en":{"name":"White Hair Camouflage","description":"Discreet coloring for gray tones, maintaining a natural appearance."},"de":{"name":"Weiße Haartarnung","description":"Dezente Farbgebung für Grautöne, die ein natürliches Aussehen erhält."}}	2026-04-16 16:47:02.662
2ef61416-4898-4730-82ed-0c708c74d383	584fd949-332c-41b7-9cd5-6e73622ab2fb	Massagem Capilar e Tónico	Lavagem profunda com massagem revigorante e aplicação de tónico antigo.	20	12.00	Cabelo	\N	t	0	{"en":{"name":"Hair Massage and Tonic","description":"Deep wash with invigorating massage and application of old toner."},"de":{"name":"Haarmassage und Tonic","description":"Tiefenreinigung mit belebender Massage und Auftragen von altem Toner."}}	2026-04-16 16:48:09.166
48aefaa7-4dc4-41f9-aab7-e541b1d706b0	584fd949-332c-41b7-9cd5-6e73622ab2fb	Corte "Aprendiz" (Infantil)	Corte para os pequenos (até 12 anos), com paciência e estilo.	30	15.00	Cabelo	\N	t	0	{"en":{"name":"Cut \\"Apprentice\\" (Children)","description":"Cut for little ones (up to 12 years old), with patience and style."},"de":{"name":"Schnitt „Lehrling“ (Kinder)","description":"Mit Geduld und Stil für die Kleinsten (bis 12 Jahre) geschnitten."}}	2026-04-16 16:48:28.734
25c331fd-6ff5-4307-85d1-f273ad4d0c82	584fd949-332c-41b7-9cd5-6e73622ab2fb	Corte Neves (Clássico)	Corte tradicional à tesoura ou máquina, com acabamento refinado e lavagem.	30	15.00	Cabelo	\N	t	0	{"en":{"name":"Corte Neves (Classic)","description":"Traditional cut with scissors or machine, with refined finishing and washing."},"de":{"name":"Corte Neves (Klassisch)","description":"Traditioneller Schnitt mit Schere oder Maschine, mit raffinierter Endbearbeitung und Wäsche."}}	2026-04-16 16:44:42.324
76a9d76c-6daf-4efb-95d9-727a002a6e42	584fd949-332c-41b7-9cd5-6e73622ab2fb	Combo: Corte & Barba	O serviço completo da casa: corte de cabelo e tratamento de barba.	75	28.00	Cabelo	\N	t	0	{"en":{"name":"Combo: Cut","description":"The house's full service: haircut and beard treatment."},"de":{"name":"Kombination: Schneiden","description":"Der Full-Service des Hauses: Haarschnitt und Bartpflege."}}	2026-04-16 16:46:22.477
64d25140-42ef-49f2-a61c-74c7b6813c7f	584fd949-332c-41b7-9cd5-6e73622ab2fb	Limpeza de Pele (Black Mask)	Remoção de impurezas e pontos negros com máscara de carvão ativado.\t10€ - 15€\t20 - 30 min\n8. Design de Sobrancelha	30	15.00	Estética	\N	t	0	{"en":{"name":"Skin Cleansing (Black Mask)","description":"Removing impurities and blackheads with an activated charcoal mask.\\t€10 - €15 20 - 30 min\\n8. Eyebrow Design"},"de":{"name":"Hautreinigung (Schwarze Maske)","description":"Entfernen von Unreinheiten und Mitessern mit einer Aktivkohlemaske.\\t10 € - 15 € 20 - 30 Min\\n8. Augenbrauen-Design"}}	2026-04-16 16:47:30.914
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.staff (id, salon_id, user_id, name, email, phone, role, avatar_url, bio, commission_rate, working_hours, is_active, color, created_at) FROM stdin;
da6d4409-a78c-4ead-8e79-a23d93c043e3	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	ffe14376-0fc0-4d9f-a7b2-86b0eabbd31c	Secretaria	rececionista@rececionista.com	+351987654321	receptionist	\N	\N	0.00	\N	t	#16A34A	2026-04-15 21:27:02.473
a9535fad-bfe0-49fc-88f0-54bd16235526	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	Crislene Neves	teste@teste.com	+351910664744	owner	https://img.freepik.com/psd-premium/uma-renderizacao-de-desenho-animado-3d-de-uma-bela-garota-morena-com-longos-cabelos-rizados-brilhantes-sorrindo-e-posando_1252624-50591.jpg?semt=ais_hybrid&w=740&q=80	Com mais de 10 anos de trajetória no universo da beleza, Crislene não apenas domina as tesouras e pincéis; ela entende que cada cabelo carrega uma história e cada transformação é um resgate da autoestima.	0.00	\N	t	#DB2777	2026-04-15 19:54:58.044
379844dd-38be-483c-971c-bed8e8f914c7	584fd949-332c-41b7-9cd5-6e73622ab2fb	\N	Jeferson Neves	animenet2010@gmail.com	+351910664744	owner	\N	\N	0.00	\N	t	#CA8A04	2026-04-16 16:43:20.282
fb3667c1-2e3f-46f8-bdd3-3b2acc04bd62	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	f8d8c720-eda6-4033-b46d-679519cc718b	Davi Neves	davineves@funcionario.com	+351911911911	professional	\N	"Expert em beleza há mais de 10 anos. Especialista em transformações que elevam sua essência e autoestima. ✨"	30.00	{"monday":{"enabled":true,"open":"09:00","close":"18:00","hasBreak":false,"breakStart":"13:00","breakEnd":"14:00"},"wednesday":{"enabled":true,"open":"09:00","close":"18:00","hasBreak":false,"breakStart":"13:00","breakEnd":"14:00"},"friday":{"enabled":true,"open":"09:00","close":"18:00","hasBreak":false,"breakStart":"13:00","breakEnd":"14:00"}}	t	#2563EB	2026-04-15 19:57:25.783
453d9dfb-6de1-4b4d-9cd5-32df5503b6d6	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	d27f5f3b-68e0-41fd-81d7-e32f49ddd35b	Yan Neves	yanneves@funcionario.com	+351912912912	professional	\N	"Expert em beleza há mais de 10 anos. Especialista em transformações que elevam sua essência e autoestima. ✨"	30.00	{"tuesday":{"enabled":true,"open":"09:00","close":"19:00","hasBreak":false,"breakStart":"13:00","breakEnd":"14:00"},"thursday":{"enabled":true,"open":"09:00","close":"19:00","hasBreak":false,"breakStart":"13:00","breakEnd":"14:00"},"saturday":{"enabled":true,"open":"09:00","close":"19:00","hasBreak":false,"breakStart":"13:00","breakEnd":"14:00"}}	t	#CA8A04	2026-04-15 19:58:48.617
\.


--
-- Data for Name: staff_services; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.staff_services (staff_id, service_id) FROM stdin;
\.


--
-- Data for Name: support_tickets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.support_tickets (id, salon_id, subject, message, status, priority, response, created_at, updated_at) FROM stdin;
9e6e68e6-b54c-4361-af84-da7ac02674b9	2fbf5d65-4585-4ef8-acf7-44ea72135ee9	Teste de ticket	Teste de Descrição de ticket	resolved	medium	Teste de solução	2026-04-15 21:20:03.411	2026-04-15 21:20:23.219
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.transactions (id, salon_id, appointment_id, staff_id, type, amount, description, payment_method, created_at, product_id) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, email, "emailVerified", password, image, role, locale, created_at, updated_at, salon_id) FROM stdin;
d27f5f3b-68e0-41fd-81d7-e32f49ddd35b	Yan Neves	yanneves@funcionario.com	\N	$2b$10$Knq2qRm99VDmcmoZzuNYve3Jifka5pGCDyo9/tP12rgvhqphvmKEe	\N	professional	pt	2026-04-15 19:58:48.607	2026-04-15 19:58:48.607	\N
f8d8c720-eda6-4033-b46d-679519cc718b	Davi Neves	davineves@funcionario.com	\N	$2b$10$F9SUqhcsLJ1E3QnM6cWquuAUnOeTmMGYZ2XFq64lt.VAeJNbMlnwi	\N	professional	pt	2026-04-15 19:57:25.771	2026-04-15 20:25:56.516	\N
ffe14376-0fc0-4d9f-a7b2-86b0eabbd31c	Secretaria	rececionista@rececionista.com	\N	$2b$10$zK.xNUcKCh2K5xpccX/gtu455tfCMgHcg.EAilaG71ZQKJnlNWcMO	\N	receptionist	pt	2026-04-15 21:27:02.463	2026-04-15 21:27:02.463	\N
3b154202-2bb7-4e46-9f4c-27d5d7b392ba	Jeferson Neves	jeferson_sjc@hotmail.com	\N	$2b$10$zmD7PWj8hh/ZSiFOZNm7hO1jDl272GEsnIxeGYI60it0rhyBHUpMC	\N	admin	pt	2026-04-13 23:19:43.662	2026-04-13 23:21:12.538	\N
d1b73d0e-8fe8-4bb6-9dc9-7af1deb8ab8f	Jeferson Neves	animenet2010@gmail.com	\N	$2b$10$zmD7PWj8hh/ZSiFOZNm7hO1jDl272GEsnIxeGYI60it0rhyBHUpMC	\N	owner	pt	2026-04-14 15:34:50.991	2026-04-18 16:40:17.48	584fd949-332c-41b7-9cd5-6e73622ab2fb
59080b2c-082f-4b59-9bde-074598226128	Crislene Neves	crisleneneves@outlook.pt	\N	$2b$10$zmD7PWj8hh/ZSiFOZNm7hO1jDl272GEsnIxeGYI60it0rhyBHUpMC	https://img.freepik.com/psd-premium/uma-renderizacao-de-desenho-animado-3d-de-uma-bela-garota-morena-com-longos-cabelos-rizados-brilhantes-sorrindo-e-posando_1252624-50591.jpg?semt=ais_hybrid&w=740&q=80	owner	pt	2026-04-14 15:37:12.454	2026-04-15 20:07:54.595	2fbf5d65-4585-4ef8-acf7-44ea72135ee9
\.


--
-- Data for Name: verification_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.verification_tokens (identifier, token, expires) FROM stdin;
\.


--
-- Name: _usersalons _usersalons_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._usersalons
    ADD CONSTRAINT "_usersalons_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: cash_closings cash_closings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_closings
    ADD CONSTRAINT cash_closings_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: global_configs global_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.global_configs
    ADD CONSTRAINT global_configs_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: salons salons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salons
    ADD CONSTRAINT salons_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);


--
-- Name: staff_services staff_services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_services
    ADD CONSTRAINT staff_services_pkey PRIMARY KEY (staff_id, service_id);


--
-- Name: support_tickets support_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: _usersalons_B_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_usersalons_B_index" ON public._usersalons USING btree ("B");


--
-- Name: accounts_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON public.accounts USING btree (provider, "providerAccountId");


--
-- Name: accounts_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "accounts_userId_idx" ON public.accounts USING btree ("userId");


--
-- Name: appointments_client_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX appointments_client_id_idx ON public.appointments USING btree (client_id);


--
-- Name: appointments_salon_id_starts_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX appointments_salon_id_starts_at_idx ON public.appointments USING btree (salon_id, starts_at);


--
-- Name: appointments_service_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX appointments_service_id_idx ON public.appointments USING btree (service_id);


--
-- Name: appointments_staff_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX appointments_staff_id_idx ON public.appointments USING btree (staff_id);


--
-- Name: audit_logs_salon_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_salon_id_idx ON public.audit_logs USING btree (salon_id);


--
-- Name: audit_logs_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_user_id_idx ON public.audit_logs USING btree (user_id);


--
-- Name: cash_closings_salon_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cash_closings_salon_id_idx ON public.cash_closings USING btree (salon_id);


--
-- Name: clients_salon_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX clients_salon_id_idx ON public.clients USING btree (salon_id);


--
-- Name: products_salon_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_salon_id_idx ON public.products USING btree (salon_id);


--
-- Name: salons_owner_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX salons_owner_id_idx ON public.salons USING btree (owner_id);


--
-- Name: salons_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX salons_slug_key ON public.salons USING btree (slug);


--
-- Name: services_salon_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX services_salon_id_idx ON public.services USING btree (salon_id);


--
-- Name: sessions_sessionToken_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "sessions_sessionToken_key" ON public.sessions USING btree ("sessionToken");


--
-- Name: sessions_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "sessions_userId_idx" ON public.sessions USING btree ("userId");


--
-- Name: staff_salon_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX staff_salon_id_idx ON public.staff USING btree (salon_id);


--
-- Name: staff_services_service_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX staff_services_service_id_idx ON public.staff_services USING btree (service_id);


--
-- Name: staff_user_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX staff_user_id_key ON public.staff USING btree (user_id);


--
-- Name: support_tickets_salon_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tickets_salon_id_idx ON public.support_tickets USING btree (salon_id);


--
-- Name: transactions_appointment_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX transactions_appointment_id_idx ON public.transactions USING btree (appointment_id);


--
-- Name: transactions_product_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX transactions_product_id_idx ON public.transactions USING btree (product_id);


--
-- Name: transactions_salon_id_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX transactions_salon_id_created_at_idx ON public.transactions USING btree (salon_id, created_at);


--
-- Name: transactions_staff_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX transactions_staff_id_idx ON public.transactions USING btree (staff_id);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_email_salon_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_salon_id_key ON public.users USING btree (email, salon_id);


--
-- Name: users_salon_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_salon_id_idx ON public.users USING btree (salon_id);


--
-- Name: verification_tokens_identifier_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX verification_tokens_identifier_token_key ON public.verification_tokens USING btree (identifier, token);


--
-- Name: verification_tokens_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX verification_tokens_token_key ON public.verification_tokens USING btree (token);


--
-- Name: _usersalons _usersalons_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._usersalons
    ADD CONSTRAINT "_usersalons_A_fkey" FOREIGN KEY ("A") REFERENCES public.salons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _usersalons _usersalons_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._usersalons
    ADD CONSTRAINT "_usersalons_B_fkey" FOREIGN KEY ("B") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: accounts accounts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: appointments appointments_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: appointments appointments_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: appointments appointments_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: appointments appointments_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: audit_logs audit_logs_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cash_closings cash_closings_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_closings
    ADD CONSTRAINT cash_closings_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: clients clients_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: products products_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: salons salons_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salons
    ADD CONSTRAINT salons_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: services services_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sessions sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: staff staff_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: staff_services staff_services_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_services
    ADD CONSTRAINT staff_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: staff_services staff_services_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_services
    ADD CONSTRAINT staff_services_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: support_tickets support_tickets_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transactions transactions_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transactions transactions_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: users users_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

