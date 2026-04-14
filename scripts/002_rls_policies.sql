-- agendar.pro Row Level Security Policies
-- Protege os dados de cada salão

-- ============================================
-- SALONS RLS
-- ============================================
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;

-- Owners podem ver e editar seus próprios salões
CREATE POLICY "salons_select_own" ON salons 
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "salons_insert_own" ON salons 
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "salons_update_own" ON salons 
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "salons_delete_own" ON salons 
  FOR DELETE USING (auth.uid() = owner_id);

-- Permitir leitura pública por slug (para página de reservas)
CREATE POLICY "salons_select_public" ON salons 
  FOR SELECT USING (true);

-- ============================================
-- STAFF RLS
-- ============================================
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Owners podem gerenciar staff do seu salão
CREATE POLICY "staff_select" ON staff 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM salons WHERE salons.id = staff.salon_id AND salons.owner_id = auth.uid())
    OR salon_id IN (SELECT id FROM salons) -- Público para página de reservas
  );

CREATE POLICY "staff_insert" ON staff 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM salons WHERE salons.id = staff.salon_id AND salons.owner_id = auth.uid())
  );

CREATE POLICY "staff_update" ON staff 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM salons WHERE salons.id = staff.salon_id AND salons.owner_id = auth.uid())
  );

CREATE POLICY "staff_delete" ON staff 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM salons WHERE salons.id = staff.salon_id AND salons.owner_id = auth.uid())
  );

-- ============================================
-- SERVICES RLS
-- ============================================
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Serviços são públicos para leitura (página de reservas)
CREATE POLICY "services_select" ON services 
  FOR SELECT USING (true);

CREATE POLICY "services_insert" ON services 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM salons WHERE salons.id = services.salon_id AND salons.owner_id = auth.uid())
  );

CREATE POLICY "services_update" ON services 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM salons WHERE salons.id = services.salon_id AND salons.owner_id = auth.uid())
  );

CREATE POLICY "services_delete" ON services 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM salons WHERE salons.id = services.salon_id AND salons.owner_id = auth.uid())
  );

-- ============================================
-- STAFF_SERVICES RLS
-- ============================================
ALTER TABLE staff_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_services_select" ON staff_services 
  FOR SELECT USING (true);

CREATE POLICY "staff_services_insert" ON staff_services 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff 
      JOIN salons ON salons.id = staff.salon_id 
      WHERE staff.id = staff_services.staff_id AND salons.owner_id = auth.uid()
    )
  );

CREATE POLICY "staff_services_delete" ON staff_services 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM staff 
      JOIN salons ON salons.id = staff.salon_id 
      WHERE staff.id = staff_services.staff_id AND salons.owner_id = auth.uid()
    )
  );

-- ============================================
-- CLIENTS RLS
-- ============================================
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Owners podem gerenciar clientes do seu salão
CREATE POLICY "clients_select" ON clients 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM salons WHERE salons.id = clients.salon_id AND salons.owner_id = auth.uid())
  );

CREATE POLICY "clients_insert" ON clients 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM salons WHERE salons.id = clients.salon_id AND salons.owner_id = auth.uid())
    OR true -- Permitir inserção anônima para reservas online
  );

CREATE POLICY "clients_update" ON clients 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM salons WHERE salons.id = clients.salon_id AND salons.owner_id = auth.uid())
  );

CREATE POLICY "clients_delete" ON clients 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM salons WHERE salons.id = clients.salon_id AND salons.owner_id = auth.uid())
  );

-- ============================================
-- APPOINTMENTS RLS
-- ============================================
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "appointments_select" ON appointments 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM salons WHERE salons.id = appointments.salon_id AND salons.owner_id = auth.uid())
  );

CREATE POLICY "appointments_insert" ON appointments 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM salons WHERE salons.id = appointments.salon_id AND salons.owner_id = auth.uid())
    OR true -- Permitir inserção anónima para reservas online
  );

CREATE POLICY "appointments_update" ON appointments 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM salons WHERE salons.id = appointments.salon_id AND salons.owner_id = auth.uid())
  );

CREATE POLICY "appointments_delete" ON appointments 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM salons WHERE salons.id = appointments.salon_id AND salons.owner_id = auth.uid())
  );

-- ============================================
-- TRANSACTIONS RLS
-- ============================================
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions_select" ON transactions 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM salons WHERE salons.id = transactions.salon_id AND salons.owner_id = auth.uid())
  );

CREATE POLICY "transactions_insert" ON transactions 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM salons WHERE salons.id = transactions.salon_id AND salons.owner_id = auth.uid())
  );

CREATE POLICY "transactions_update" ON transactions 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM salons WHERE salons.id = transactions.salon_id AND salons.owner_id = auth.uid())
  );

CREATE POLICY "transactions_delete" ON transactions 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM salons WHERE salons.id = transactions.salon_id AND salons.owner_id = auth.uid())
  );
