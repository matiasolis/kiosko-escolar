-- Migración inicial de la base de datos del Kiosco Escolar
-- PostgreSQL 16
-- Basada en el modelo relacional diseñado para el proyecto.
-- Ejecutar una sola vez sobre una base nueva.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE student_modality AS ENUM ('digital', 'collaborator');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE stock_movement_type AS ENUM ('in', 'out', 'adjustment');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending','confirmed','preparing','ready','completed','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE pickup_type AS ENUM ('immediate', 'recess');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('cash', 'mercadopago', 'bank_transfer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending','approved','rejected','partially_paid','refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE purchase_status AS ENUM ('draft', 'received', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE expense_category AS ENUM ('utilities','supplies','maintenance','transportation','other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE cash_register_status AS ENUM ('open', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE cash_direction AS ENUM ('in', 'out');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE cash_movement_kind AS ENUM ('sale','expense','contribution','withdrawal','adjustment');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notification_category AS ENUM ('order','stock','payment','general','system');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notification_priority AS ENUM ('low','normal','high');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(254) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  display_name VARCHAR(20) NOT NULL,
  student_modality student_modality,
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  blocked_at TIMESTAMPTZ,
  blocked_by_user_id UUID,
  block_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by_user_id UUID,
  updated_by_user_id UUID
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email_lower ON users (LOWER(email));

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(40) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS auth_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(30) NOT NULL,
  provider_subject VARCHAR(255) NOT NULL,
  password_hash TEXT,
  email_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_subject),
  CONSTRAINT chk_auth_password_provider CHECK (
    (provider = 'password' AND password_hash IS NOT NULL) OR provider <> 'password'
  )
);

CREATE TABLE IF NOT EXISTS kiosk_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(160) NOT NULL,
  logo_url TEXT,
  phone VARCHAR(50),
  opening_time TIME,
  closing_time TIME,
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  closed_message TEXT,
  mercadopago_alias VARCHAR(120),
  payment_cbu VARCHAR(40),
  payment_account_holder VARCHAR(180),
  payment_qr_url TEXT,
  allow_recess_pickup BOOLEAN NOT NULL DEFAULT TRUE,
  notification_sound BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS recess_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settings_id UUID NOT NULL REFERENCES kiosk_settings(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  starts_at TIME NOT NULL,
  ends_at TIME,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_recess_times CHECK (ends_at IS NULL OR ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  icon VARCHAR(80),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name VARCHAR(180) NOT NULL,
  brand VARCHAR(120),
  description TEXT,
  image_url TEXT,
  sku VARCHAR(80) NOT NULL UNIQUE,
  purchase_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  sale_price NUMERIC(12,2) NOT NULL,
  minimum_stock INTEGER NOT NULL DEFAULT 5,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_on_sale BOOLEAN NOT NULL DEFAULT FALSE,
  sale_price_override NUMERIC(12,2),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_products_purchase_cost CHECK (purchase_cost >= 0),
  CONSTRAINT chk_products_sale_price CHECK (sale_price >= 0),
  CONSTRAINT chk_products_minimum_stock CHECK (minimum_stock >= 0),
  CONSTRAINT chk_products_stock_quantity CHECK (stock_quantity >= 0),
  CONSTRAINT chk_products_sale_override CHECK (sale_price_override IS NULL OR sale_price_override > 0)
);

CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(180) NOT NULL,
  contact_name VARCHAR(150),
  phone VARCHAR(50),
  email VARCHAR(254),
  business_category VARCHAR(120),
  delivery_schedule TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS supplier_products (
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  supplier_sku VARCHAR(80),
  last_purchase_cost NUMERIC(12,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (supplier_id, product_id),
  CONSTRAINT chk_supplier_product_cost CHECK (last_purchase_cost IS NULL OR last_purchase_cost >= 0)
);

CREATE TABLE IF NOT EXISTS product_lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  lot_code VARCHAR(100),
  expiration_date DATE,
  received_at TIMESTAMPTZ NOT NULL,
  initial_quantity INTEGER NOT NULL,
  remaining_quantity INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_product_lot_initial CHECK (initial_quantity >= 0),
  CONSTRAINT chk_product_lot_remaining CHECK (remaining_quantity >= 0 AND remaining_quantity <= initial_quantity)
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS supplier_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_number BIGINT GENERATED BY DEFAULT AS IDENTITY UNIQUE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
  status purchase_status NOT NULL DEFAULT 'draft',
  supplier_invoice_number VARCHAR(100),
  purchased_at TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_purchase_subtotal CHECK (subtotal >= 0),
  CONSTRAINT chk_purchase_tax CHECK (tax_total >= 0),
  CONSTRAINT chk_purchase_total CHECK (total >= 0)
);

CREATE TABLE IF NOT EXISTS supplier_purchase_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID NOT NULL REFERENCES supplier_purchases(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name_snapshot VARCHAR(180) NOT NULL,
  quantity_ordered INTEGER NOT NULL,
  quantity_received INTEGER NOT NULL DEFAULT 0,
  unit_cost NUMERIC(12,2) NOT NULL,
  line_total NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_purchase_item_qty_ordered CHECK (quantity_ordered > 0),
  CONSTRAINT chk_purchase_item_qty_received CHECK (quantity_received >= 0 AND quantity_received <= quantity_ordered),
  CONSTRAINT chk_purchase_item_unit_cost CHECK (unit_cost >= 0),
  CONSTRAINT chk_purchase_item_line_total CHECK (line_total >= 0)
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number BIGINT GENERATED BY DEFAULT AS IDENTITY UNIQUE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status order_status NOT NULL DEFAULT 'pending',
  pickup_type pickup_type NOT NULL,
  recess_schedule_id UUID REFERENCES recess_schedules(id) ON DELETE SET NULL,
  pickup_note TEXT,
  customer_note TEXT,
  subtotal NUMERIC(12,2) NOT NULL,
  discount_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL,
  placed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_order_subtotal CHECK (subtotal >= 0),
  CONSTRAINT chk_order_discount CHECK (discount_total >= 0),
  CONSTRAINT chk_order_total CHECK (total >= 0),
  CONSTRAINT chk_order_recess_schedule CHECK (pickup_type = 'immediate' OR recess_schedule_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name_snapshot VARCHAR(180) NOT NULL,
  brand_snapshot VARCHAR(120),
  sku_snapshot VARCHAR(80),
  quantity INTEGER NOT NULL,
  unit_sale_price NUMERIC(12,2) NOT NULL,
  unit_cost_snapshot NUMERIC(12,2) NOT NULL,
  line_discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  line_total NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_order_item_quantity CHECK (quantity > 0),
  CONSTRAINT chk_order_item_sale_price CHECK (unit_sale_price >= 0),
  CONSTRAINT chk_order_item_cost CHECK (unit_cost_snapshot >= 0),
  CONSTRAINT chk_order_item_discount CHECK (line_discount >= 0),
  CONSTRAINT chk_order_item_total CHECK (line_total >= 0)
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  amount NUMERIC(12,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'ARS',
  external_reference VARCHAR(180),
  provider_transaction_id VARCHAR(180),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_payment_amount CHECK (amount > 0),
  CONSTRAINT chk_payment_currency CHECK (currency ~ '^[A-Z]{3}$')
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_provider_transaction
  ON payments(provider_transaction_id) WHERE provider_transaction_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  previous_status payment_status,
  new_status payment_status NOT NULL,
  source VARCHAR(40) NOT NULL,
  provider_event_id VARCHAR(180),
  details TEXT,
  created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_payment_events_provider_event
  ON payment_events(provider_event_id) WHERE provider_event_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_lot_id UUID REFERENCES product_lots(id) ON DELETE RESTRICT,
  movement_type stock_movement_type NOT NULL,
  quantity_delta INTEGER NOT NULL,
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  reason TEXT NOT NULL,
  order_item_id UUID REFERENCES order_items(id) ON DELETE RESTRICT,
  purchase_item_id UUID REFERENCES supplier_purchase_items(id) ON DELETE RESTRICT,
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_stock_before CHECK (quantity_before >= 0),
  CONSTRAINT chk_stock_after CHECK (quantity_after >= 0),
  CONSTRAINT chk_stock_consistency CHECK (quantity_after = quantity_before + quantity_delta),
  CONSTRAINT chk_stock_delta_not_zero CHECK (quantity_delta <> 0),
  CONSTRAINT chk_stock_movement_sign CHECK (
    (movement_type = 'in' AND quantity_delta > 0)
    OR (movement_type = 'out' AND quantity_delta < 0)
    OR (movement_type = 'adjustment')
  )
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description VARCHAR(240) NOT NULL,
  category expense_category NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  incurred_at TIMESTAMPTZ NOT NULL,
  payment_method payment_method,
  receipt_reference VARCHAR(180),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_expense_amount CHECK (amount > 0)
);

CREATE TABLE IF NOT EXISTS cash_registers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_date DATE NOT NULL,
  status cash_register_status NOT NULL DEFAULT 'open',
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  opening_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  opened_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_cash_opening_amount CHECK (opening_amount >= 0)
);

CREATE TABLE IF NOT EXISTS cash_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_register_id UUID NOT NULL REFERENCES cash_registers(id) ON DELETE RESTRICT,
  direction cash_direction NOT NULL,
  kind cash_movement_kind NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  payment_id UUID REFERENCES payments(id) ON DELETE RESTRICT,
  expense_id UUID REFERENCES expenses(id) ON DELETE RESTRICT,
  description TEXT,
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_cash_movement_amount CHECK (amount > 0),
  CONSTRAINT chk_cash_one_source CHECK (NOT (payment_id IS NOT NULL AND expense_id IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS cash_closures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_register_id UUID NOT NULL UNIQUE REFERENCES cash_registers(id) ON DELETE RESTRICT,
  expected_cash NUMERIC(12,2) NOT NULL,
  counted_cash NUMERIC(12,2) NOT NULL,
  difference NUMERIC(12,2) NOT NULL,
  notes TEXT,
  closed_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_cash_expected CHECK (expected_cash >= 0),
  CONSTRAINT chk_cash_counted CHECK (counted_cash >= 0),
  CONSTRAINT chk_cash_difference CHECK (difference = counted_cash - expected_cash)
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(180) NOT NULL,
  message TEXT NOT NULL,
  category notification_category NOT NULL,
  priority notification_priority NOT NULL DEFAULT 'normal',
  action_tab VARCHAR(80),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification_recipients (
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (notification_id, user_id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(120) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id UUID,
  summary TEXT NOT NULL,
  before_data JSONB,
  after_data JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE users
  ADD CONSTRAINT fk_users_blocked_by FOREIGN KEY (blocked_by_user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE users
  ADD CONSTRAINT fk_users_created_by FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE users
  ADD CONSTRAINT fk_users_updated_by FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_customer_placed ON orders(customer_id, placed_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_placed ON orders(status, placed_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_created ON payments(order_id, created_at);
CREATE INDEX IF NOT EXISTS idx_payments_status_created ON payments(status, created_at);
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category_id, is_active);
CREATE INDEX IF NOT EXISTS idx_products_active_name ON products(is_active, name);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_created ON stock_movements(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_order_item ON stock_movements(order_item_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_purchase_item ON stock_movements(purchase_item_id);
CREATE INDEX IF NOT EXISTS idx_supplier_purchases_supplier_date ON supplier_purchases(supplier_id, purchased_at DESC);
CREATE INDEX IF NOT EXISTS idx_supplier_purchase_items_purchase ON supplier_purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date_category ON expenses(incurred_at, category);
CREATE INDEX IF NOT EXISTS idx_cash_movements_register_created ON cash_movements(cash_register_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_recipients_user_read ON notification_recipients(user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_user_id, created_at DESC);

INSERT INTO roles (code, name, description)
VALUES
  ('admin', 'Administrador', 'Acceso administrativo al kiosco'),
  ('cliente', 'Cliente', 'Usuario que realiza pedidos')
ON CONFLICT (code) DO NOTHING;

COMMIT;
