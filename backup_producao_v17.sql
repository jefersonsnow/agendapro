--
-- PostgreSQL database dump
--

\restrict zfTjzua8jzPFL30OujDlMHyMeJBbEmieNi5FNeSWknkPqjSOzvMC6Dy8WgvZFRE

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.9 (Ubuntu 17.9-1.pgdg24.04+1)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _usersalons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._usersalons (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public._usersalons OWNER TO postgres;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.accounts OWNER TO postgres;

--
-- Name: announcements; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.announcements OWNER TO postgres;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.appointments OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: cash_closings; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.cash_closings OWNER TO postgres;

--
-- Name: clients; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.clients OWNER TO postgres;

--
-- Name: global_configs; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.global_configs OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: salons; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.salons OWNER TO postgres;

--
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.services OWNER TO postgres;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: staff; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.staff OWNER TO postgres;

--
-- Name: staff_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_services (
    staff_id text NOT NULL,
    service_id text NOT NULL
);


ALTER TABLE public.staff_services OWNER TO postgres;

--
-- Name: support_tickets; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.support_tickets OWNER TO postgres;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
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
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: verification_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.verification_tokens (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.verification_tokens OWNER TO postgres;

--
-- Data for Name: _usersalons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._usersalons ("A", "B") FROM stdin;
\.


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accounts (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.announcements (id, title, content, type, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointments (id, salon_id, client_id, staff_id, service_id, starts_at, ends_at, status, price, notes, source, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, salon_id, user_id, action, entity, entity_id, details, created_at) FROM stdin;
\.


--
-- Data for Name: cash_closings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cash_closings (id, salon_id, opened_at, closed_at, opening_balance, closing_balance, total_income, total_expense, status, notes, created_at) FROM stdin;
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clients (id, salon_id, name, email, phone, address, nif, notes, loyalty_points, total_spent, visit_count, created_at, last_visit, password) FROM stdin;
\.


--
-- Data for Name: global_configs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.global_configs (id, landing_page, kiwify_configs, stripe_configs, support_config, promotion_config, seo_config, updated_at) FROM stdin;
singleton	{}	{}	{}	{}	{}	\N	2026-04-13 23:22:43.892
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, salon_id, name, description, price, stock_quantity, category, image_url, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: salons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.salons (id, owner_id, name, slug, description, address, phone, email, logo_url, cover_url, working_hours, settings, created_at, updated_at, plan, status, locale, timezone, translations, trial_ends_at, nif) FROM stdin;
b2ac3d65-2b6a-4edd-9e3b-1ae0f13ee3ec	3b154202-2bb7-4e46-9f4c-27d5d7b392ba	Admin	admin-sww	\N	PT, Rua da Minas, 12, 5000-471	+351910664744	\N	\N	\N	\N	\N	2026-04-13 23:19:43.679	2026-04-13 23:22:34.121	premium	active	pt	Europe/Lisbon	\N	2026-05-13 23:19:43.641	312372434
584fd949-332c-41b7-9cd5-6e73622ab2fb	d1b73d0e-8fe8-4bb6-9dc9-7af1deb8ab8f	Administrador do Sistema	administrador-do-sistema-u7m	\N	PT, Rua das Minas, 12, 5000-471	+351910664744	\N	\N	\N	\N	\N	2026-04-14 15:34:51.001	2026-04-14 15:34:51.001	free	trial	pt	Europe/Lisbon	\N	2026-05-14 15:34:50.986	312372434
2fbf5d65-4585-4ef8-acf7-44ea72135ee9	59080b2c-082f-4b59-9bde-074598226128	teste	teste-3i9	\N	PT, Rua das Minas, 12, 5000-471	+351910664744	\N	\N	\N	\N	\N	2026-04-14 15:37:12.459	2026-04-14 15:37:12.459	free	trial	pt	Europe/Lisbon	\N	2026-05-14 15:37:12.45	312372434
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.services (id, salon_id, name, description, duration_minutes, price, category, image_url, is_active, display_order, translations, created_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff (id, salon_id, user_id, name, email, phone, role, avatar_url, bio, commission_rate, working_hours, is_active, color, created_at) FROM stdin;
\.


--
-- Data for Name: staff_services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff_services (staff_id, service_id) FROM stdin;
\.


--
-- Data for Name: support_tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.support_tickets (id, salon_id, subject, message, status, priority, response, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, salon_id, appointment_id, staff_id, type, amount, description, payment_method, created_at, product_id) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, "emailVerified", password, image, role, locale, created_at, updated_at) FROM stdin;
3b154202-2bb7-4e46-9f4c-27d5d7b392ba	Jeferson Neves	jeferson_sjc@hotmail.com	\N	$2b$10$12GZ7TuVPh/fl7LNYnEil.knPTe/CvzXOeXCJFsMxKxRAo6bRfwli	\N	admin	pt	2026-04-13 23:19:43.662	2026-04-13 23:21:12.538
59080b2c-082f-4b59-9bde-074598226128	teste teste	teste@teste.com	\N	$2b$10$fue8NlTJpSJO3Uu5L8ZlKOBiSDxLX3e5kFkOBjg.eV0rvC1/od6Re	\N	owner	pt	2026-04-14 15:37:12.454	2026-04-14 15:37:12.454
d1b73d0e-8fe8-4bb6-9dc9-7af1deb8ab8f	Jeferson Neves	animenet2010@gmail.com	\N	$2b$10$KpBQEN3NaZluFPlCDyLMjuDA3yG3h8p9.oscvxlT4Qd4sQI1Ps7uK	\N	owner	pt	2026-04-14 15:34:50.991	2026-04-14 15:53:24.556
\.


--
-- Data for Name: verification_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.verification_tokens (identifier, token, expires) FROM stdin;
\.


--
-- Name: _usersalons _usersalons_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._usersalons
    ADD CONSTRAINT "_usersalons_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: cash_closings cash_closings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cash_closings
    ADD CONSTRAINT cash_closings_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: global_configs global_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.global_configs
    ADD CONSTRAINT global_configs_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: salons salons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salons
    ADD CONSTRAINT salons_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);


--
-- Name: staff_services staff_services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_services
    ADD CONSTRAINT staff_services_pkey PRIMARY KEY (staff_id, service_id);


--
-- Name: support_tickets support_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: _usersalons_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_usersalons_B_index" ON public._usersalons USING btree ("B");


--
-- Name: accounts_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON public.accounts USING btree (provider, "providerAccountId");


--
-- Name: accounts_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "accounts_userId_idx" ON public.accounts USING btree ("userId");


--
-- Name: appointments_client_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX appointments_client_id_idx ON public.appointments USING btree (client_id);


--
-- Name: appointments_salon_id_starts_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX appointments_salon_id_starts_at_idx ON public.appointments USING btree (salon_id, starts_at);


--
-- Name: appointments_service_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX appointments_service_id_idx ON public.appointments USING btree (service_id);


--
-- Name: appointments_staff_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX appointments_staff_id_idx ON public.appointments USING btree (staff_id);


--
-- Name: audit_logs_salon_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_salon_id_idx ON public.audit_logs USING btree (salon_id);


--
-- Name: audit_logs_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_user_id_idx ON public.audit_logs USING btree (user_id);


--
-- Name: cash_closings_salon_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cash_closings_salon_id_idx ON public.cash_closings USING btree (salon_id);


--
-- Name: clients_salon_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clients_salon_id_idx ON public.clients USING btree (salon_id);


--
-- Name: products_salon_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_salon_id_idx ON public.products USING btree (salon_id);


--
-- Name: salons_owner_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX salons_owner_id_idx ON public.salons USING btree (owner_id);


--
-- Name: salons_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX salons_slug_key ON public.salons USING btree (slug);


--
-- Name: services_salon_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX services_salon_id_idx ON public.services USING btree (salon_id);


--
-- Name: sessions_sessionToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "sessions_sessionToken_key" ON public.sessions USING btree ("sessionToken");


--
-- Name: sessions_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sessions_userId_idx" ON public.sessions USING btree ("userId");


--
-- Name: staff_salon_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX staff_salon_id_idx ON public.staff USING btree (salon_id);


--
-- Name: staff_services_service_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX staff_services_service_id_idx ON public.staff_services USING btree (service_id);


--
-- Name: staff_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX staff_user_id_key ON public.staff USING btree (user_id);


--
-- Name: support_tickets_salon_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX support_tickets_salon_id_idx ON public.support_tickets USING btree (salon_id);


--
-- Name: transactions_appointment_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX transactions_appointment_id_idx ON public.transactions USING btree (appointment_id);


--
-- Name: transactions_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX transactions_product_id_idx ON public.transactions USING btree (product_id);


--
-- Name: transactions_salon_id_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX transactions_salon_id_created_at_idx ON public.transactions USING btree (salon_id, created_at);


--
-- Name: transactions_staff_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX transactions_staff_id_idx ON public.transactions USING btree (staff_id);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: verification_tokens_identifier_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX verification_tokens_identifier_token_key ON public.verification_tokens USING btree (identifier, token);


--
-- Name: verification_tokens_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX verification_tokens_token_key ON public.verification_tokens USING btree (token);


--
-- Name: _usersalons _usersalons_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._usersalons
    ADD CONSTRAINT "_usersalons_A_fkey" FOREIGN KEY ("A") REFERENCES public.salons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _usersalons _usersalons_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._usersalons
    ADD CONSTRAINT "_usersalons_B_fkey" FOREIGN KEY ("B") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: accounts accounts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: appointments appointments_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: appointments appointments_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: appointments appointments_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: appointments appointments_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: audit_logs audit_logs_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cash_closings cash_closings_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cash_closings
    ADD CONSTRAINT cash_closings_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: clients clients_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: products products_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: salons salons_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salons
    ADD CONSTRAINT salons_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: services services_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sessions sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: staff staff_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: staff_services staff_services_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_services
    ADD CONSTRAINT staff_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: staff_services staff_services_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_services
    ADD CONSTRAINT staff_services_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: support_tickets support_tickets_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transactions transactions_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transactions transactions_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict zfTjzua8jzPFL30OujDlMHyMeJBbEmieNi5FNeSWknkPqjSOzvMC6Dy8WgvZFRE

