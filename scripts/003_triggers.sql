-- agendar.pro Triggers e Functions
-- Automações do sistema

-- ============================================
-- FUNÇÃO: Atualizar updated_at automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger nas tabelas relevantes
DROP TRIGGER IF EXISTS update_salons_updated_at ON salons;
CREATE TRIGGER update_salons_updated_at
  BEFORE UPDATE ON salons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNÇÃO: Criar salão e staff owner após signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_salon_id UUID;
  salon_name TEXT;
  salon_slug TEXT;
BEGIN
  -- Obter nome do salão dos metadados ou usar padrão
  salon_name := COALESCE(NEW.raw_user_meta_data ->> 'salon_name', 'Meu Salão');
  
  -- Gerar slug único baseado no nome
  salon_slug := LOWER(REGEXP_REPLACE(salon_name, '[^a-zA-Z0-9]', '-', 'g'));
  salon_slug := salon_slug || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
  
  -- Criar o salão
  INSERT INTO public.salons (owner_id, name, slug)
  VALUES (NEW.id, salon_name, salon_slug)
  RETURNING id INTO new_salon_id;
  
  -- Criar o staff owner
  INSERT INTO public.staff (salon_id, user_id, name, email, role)
  VALUES (
    new_salon_id,
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Proprietário'),
    NEW.email,
    'owner'
  );
  
  RETURN NEW;
END;
$$;

-- Trigger para criar salão após signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FUNÇÃO: Atualizar estatísticas do cliente após agendamento
-- ============================================
CREATE OR REPLACE FUNCTION update_client_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') THEN
    UPDATE clients
    SET 
      visit_count = visit_count + 1,
      total_spent = total_spent + NEW.price,
      last_visit = NEW.ends_at,
      loyalty_points = loyalty_points + FLOOR(NEW.price)
    WHERE id = NEW.client_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_client_stats_trigger ON appointments;
CREATE TRIGGER update_client_stats_trigger
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_client_stats();

-- ============================================
-- FUNÇÃO: Criar transação ao completar agendamento
-- ============================================
CREATE OR REPLACE FUNCTION create_appointment_transaction()
RETURNS TRIGGER AS $$
DECLARE
  staff_commission DECIMAL(5,2);
  commission_amount DECIMAL(10,2);
BEGIN
  IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') THEN
    -- Buscar taxa de comissão do staff
    SELECT commission_rate INTO staff_commission
    FROM staff WHERE id = NEW.staff_id;
    
    -- Criar transação de receita
    INSERT INTO transactions (salon_id, appointment_id, staff_id, type, amount, description)
    VALUES (NEW.salon_id, NEW.id, NEW.staff_id, 'income', NEW.price, 'Serviço concluído');
    
    -- Criar transação de comissão se aplicável
    IF staff_commission > 0 THEN
      commission_amount := NEW.price * (staff_commission / 100);
      INSERT INTO transactions (salon_id, appointment_id, staff_id, type, amount, description)
      VALUES (NEW.salon_id, NEW.id, NEW.staff_id, 'commission', commission_amount, 'Comissão do profissional');
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_appointment_transaction_trigger ON appointments;
CREATE TRIGGER create_appointment_transaction_trigger
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION create_appointment_transaction();
