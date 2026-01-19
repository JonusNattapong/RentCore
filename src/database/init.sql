-- PostgreSQL DDL for RentCore System (Hybrid Rental Management)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 1. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE room_status AS ENUM (
        'VACANT', 'RESERVED', 'OCCUPIED_MONTHLY', 'OCCUPIED_DAILY', 'MAINTENANCE', 'CLOSED'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE lease_status AS ENUM ('ACTIVE', 'ENDED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE daily_stay_status AS ENUM (
        'RESERVED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE invoice_status AS ENUM (
        'UNPAID', 'WAITING_CONFIRM', 'PAID', 'OVERDUE', 'VOID'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('SUBMITTED', 'CONFIRMED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('CASH', 'TRANSFER', 'CREDIT_CARD', 'QR_PROMPTPAY', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. TABLES
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    water_rate NUMERIC(10,2) NOT NULL DEFAULT 15.00,
    electric_rate NUMERIC(10,2) NOT NULL DEFAULT 7.00,
    promptpay_id TEXT,
    bank_account_no TEXT,
    bank_account_name TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS buildings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES branches(id),
    name TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS floors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    building_id UUID NOT NULL REFERENCES buildings(id),
    name TEXT NOT NULL,
    floor_no INT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(building_id, floor_no)
);

CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    floor_id UUID NOT NULL REFERENCES floors(id),
    branch_id UUID NOT NULL REFERENCES branches(id),
    room_no TEXT NOT NULL,
    room_type TEXT,
    capacity INT NOT NULL DEFAULT 1,
    status room_status NOT NULL DEFAULT 'VACANT',
    area_sqm NUMERIC(10,2),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(branch_id, room_no)
);

CREATE TABLE IF NOT EXISTS meter_readings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id         UUID NOT NULL REFERENCES rooms(id),
    branch_id       UUID NOT NULL REFERENCES branches(id),
    meter_type      TEXT NOT NULL, -- 'WATER', 'ELECTRIC'
    previous_value  NUMERIC(12,2) NOT NULL DEFAULT 0,
    current_value   NUMERIC(12,2) NOT NULL,
    consumed        NUMERIC(12,2) GENERATED ALWAYS AS (current_value - previous_value) STORED,
    reading_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meter_readings_room_date ON meter_readings(room_id, reading_date DESC);

CREATE TABLE IF NOT EXISTS room_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id),
    price_type TEXT NOT NULL, -- 'MONTHLY', 'DAILY'
    price_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_code TEXT UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    id_card_no TEXT,
    address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    branch_id UUID NOT NULL REFERENCES branches(id),
    start_date DATE NOT NULL,
    end_date DATE,
    rent_monthly NUMERIC(12,2) NOT NULL DEFAULT 0,
    deposit_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    billing_day INT NOT NULL DEFAULT 1,
    status lease_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lease_id UUID REFERENCES leases(id),
    room_id UUID NOT NULL REFERENCES rooms(id),
    branch_id UUID NOT NULL REFERENCES branches(id),
    invoice_no TEXT NOT NULL,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    status invoice_status NOT NULL DEFAULT 'UNPAID',
    payment_token TEXT UNIQUE,
    is_locked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(branch_id, invoice_no)
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    branch_id UUID NOT NULL REFERENCES branches(id),
    tenant_id UUID REFERENCES tenants(id),
    received_by_user_id UUID REFERENCES users(id),
    amount NUMERIC(12,2) NOT NULL,
    method payment_method NOT NULL DEFAULT 'TRANSFER',
    reference_no TEXT,
    note TEXT,
    paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status payment_status NOT NULL DEFAULT 'SUBMITTED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_slips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL UNIQUE REFERENCES payments(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_hash TEXT NOT NULL,
    original_filename TEXT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_items (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id      uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    item_type       TEXT NOT NULL,
    description     text,
    quantity        numeric(12,3) NOT NULL DEFAULT 1,
    unit            text,
    unit_price      numeric(12,2) NOT NULL DEFAULT 0,
    amount          numeric(12,2) NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            text NOT NULL UNIQUE,
    description     text,
    is_active       boolean NOT NULL DEFAULT true,
    created_at      timestamptz NOT NULL DEFAULT NOW(),
    updated_at      timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id       uuid REFERENCES branches(id),
    role_id         uuid NOT NULL REFERENCES roles(id),
    username        text NOT NULL UNIQUE,
    password_hash   text NOT NULL,
    full_name       text NOT NULL,
    email           text,
    phone           text,
    is_active       boolean NOT NULL DEFAULT true,
    last_login_at   timestamptz,
    created_at      timestamptz NOT NULL DEFAULT NOW(),
    updated_at      timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         uuid REFERENCES users(id),
    branch_id       uuid REFERENCES branches(id),
    action          TEXT NOT NULL,
    entity_type     text NOT NULL,
    entity_id       uuid,
    before_json     jsonb,
    after_json      jsonb,
    ip_address      text,
    user_agent      text,
    created_at      timestamptz NOT NULL DEFAULT NOW()
);

-- TRIGGERS
DROP TRIGGER IF EXISTS trg_branches_updated_at ON branches;
CREATE TRIGGER trg_branches_updated_at BEFORE UPDATE ON branches FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_buildings_updated_at ON buildings;
CREATE TRIGGER trg_buildings_updated_at BEFORE UPDATE ON buildings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_rooms_updated_at ON rooms;
CREATE TRIGGER trg_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_tenants_updated_at ON tenants;
CREATE TRIGGER trg_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_leases_updated_at ON leases;
CREATE TRIGGER trg_leases_updated_at BEFORE UPDATE ON leases FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_invoices_updated_at ON invoices;
CREATE TRIGGER trg_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION set_updated_at();
