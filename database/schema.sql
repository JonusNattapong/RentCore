-- PostgreSQL DDL สำหรับระบบห้องเช่า (รายเดือน + รายวัน) ตาม ERD ที่ให้ไว้
-- แนะนำใช้ PostgreSQL 14+
-- เปิดใช้ extension ที่จำเป็น

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- =========================
-- 1) ENUM TYPES
-- =========================

DO $$ BEGIN
    CREATE TYPE room_status AS ENUM (
        'VACANT',
        'RESERVED',
        'OCCUPIED_MONTHLY',
        'OCCUPIED_DAILY',
        'MAINTENANCE',
        'CLOSED'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE price_type AS ENUM (
        'MONTHLY',
        'DAILY'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE lease_status AS ENUM (
        'ACTIVE',
        'ENDED',
        'CANCELLED'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE daily_stay_status AS ENUM (
        'RESERVED',
        'CHECKED_IN',
        'CHECKED_OUT',
        'CANCELLED'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE invoice_status AS ENUM (
        'UNPAID',
        'WAITING_CONFIRM',
        'PAID',
        'OVERDUE',
        'VOID'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE invoice_item_type AS ENUM (
        'RENT',
        'WATER',
        'ELECTRIC',
        'COMMON_FEE',
        'PENALTY',
        'OTHER'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM (
        'TRANSFER',
        'CASH',
        'OTHER'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM (
        'SUBMITTED',
        'CONFIRMED',
        'REJECTED'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE audit_action AS ENUM (
        'CREATE',
        'UPDATE',
        'DELETE',
        'CONFIRM',
        'LOCK',
        'UNLOCK',
        'VOID'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================
-- 2) COMMON: UPDATED_AT TRIGGER
-- =========================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- 3) MASTER DATA: BRANCH/BUILDING/FLOOR/ROOM/PRICE
-- =========================

CREATE TABLE IF NOT EXISTS branches (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            text NOT NULL UNIQUE,
    name            text NOT NULL,
    address         text,
    phone           text,
    is_active       boolean NOT NULL DEFAULT true,
    created_at      timestamptz NOT NULL DEFAULT NOW(),
    updated_at      timestamptz NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_branches_updated_at
BEFORE UPDATE ON branches
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS buildings (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id       uuid NOT NULL REFERENCES branches(id),
    name            text NOT NULL,
    sort_order      int NOT NULL DEFAULT 0,
    is_active       boolean NOT NULL DEFAULT true,
    created_at      timestamptz NOT NULL DEFAULT NOW(),
    updated_at      timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_buildings_branch_id ON buildings(branch_id);

CREATE TRIGGER trg_buildings_updated_at
BEFORE UPDATE ON buildings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS floors (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    building_id     uuid NOT NULL REFERENCES buildings(id),
    name            text NOT NULL,
    floor_no        int NOT NULL,
    sort_order      int NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT NOW(),
    updated_at      timestamptz NOT NULL DEFAULT NOW(),
    UNIQUE(building_id, floor_no)
);

CREATE INDEX IF NOT EXISTS idx_floors_building_id ON floors(building_id);

CREATE TRIGGER trg_floors_updated_at
BEFORE UPDATE ON floors
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS rooms (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    floor_id        uuid NOT NULL REFERENCES floors(id),
    branch_id       uuid NOT NULL REFERENCES branches(id),
    room_no         text NOT NULL,
    room_type       text,
    capacity        int NOT NULL DEFAULT 1,
    status          room_status NOT NULL DEFAULT 'VACANT',
    area_sqm        numeric(10,2),
    is_active       boolean NOT NULL DEFAULT true,
    created_at      timestamptz NOT NULL DEFAULT NOW(),
    updated_at      timestamptz NOT NULL DEFAULT NOW(),
    UNIQUE(branch_id, room_no)
);

CREATE INDEX IF NOT EXISTS idx_rooms_branch_status ON rooms(branch_id, status);
CREATE INDEX IF NOT EXISTS idx_rooms_floor_id ON rooms(floor_id);

CREATE TRIGGER trg_rooms_updated_at
BEFORE UPDATE ON rooms
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS room_prices (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id         uuid NOT NULL REFERENCES rooms(id),
    price_type      price_type NOT NULL,
    price_amount    numeric(12,2) NOT NULL CHECK (price_amount >= 0),
    effective_from  date NOT NULL,
    effective_to    date,
    is_active       boolean NOT NULL DEFAULT true,
    created_at      timestamptz NOT NULL DEFAULT NOW(),
    updated_at      timestamptz NOT NULL DEFAULT NOW(),
    CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

CREATE INDEX IF NOT EXISTS idx_room_prices_room_type_from ON room_prices(room_id, price_type, effective_from);

CREATE TRIGGER trg_room_prices_updated_at
BEFORE UPDATE ON room_prices
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================
-- 4) TENANT + LEASE (MONTHLY) + DAILY_STAYS (DAILY)
-- =========================

CREATE TABLE IF NOT EXISTS tenants (
    id                      uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_code             text UNIQUE,
    full_name               text NOT NULL,
    phone                   text,
    email                   text,
    id_card_no              text,
    address                 text,
    emergency_contact_name  text,
    emergency_contact_phone text,
    is_active               boolean NOT NULL DEFAULT true,
    created_at              timestamptz NOT NULL DEFAULT NOW(),
    updated_at              timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenants_phone ON tenants(phone);
CREATE INDEX IF NOT EXISTS idx_tenants_name ON tenants(full_name);

CREATE TRIGGER trg_tenants_updated_at
BEFORE UPDATE ON tenants
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS leases (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id         uuid NOT NULL REFERENCES rooms(id),
    tenant_id       uuid NOT NULL REFERENCES tenants(id),
    branch_id       uuid NOT NULL REFERENCES branches(id),
    start_date      date NOT NULL,
    end_date        date,
    rent_monthly    numeric(12,2) NOT NULL CHECK (rent_monthly >= 0),
    deposit_amount  numeric(12,2) NOT NULL DEFAULT 0 CHECK (deposit_amount >= 0),
    billing_day     int NOT NULL DEFAULT 1 CHECK (billing_day BETWEEN 1 AND 28),
    status          lease_status NOT NULL DEFAULT 'ACTIVE',
    moved_in_at     timestamptz,
    moved_out_at    timestamptz,
    created_at      timestamptz NOT NULL DEFAULT NOW(),
    updated_at      timestamptz NOT NULL DEFAULT NOW(),
    CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_leases_branch_status ON leases(branch_id, status);
CREATE INDEX IF NOT EXISTS idx_leases_room_id ON leases(room_id);
CREATE INDEX IF NOT EXISTS idx_leases_tenant_id ON leases(tenant_id);

CREATE TRIGGER trg_leases_updated_at
BEFORE UPDATE ON leases
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS daily_stays (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id         uuid NOT NULL REFERENCES rooms(id),
    tenant_id       uuid NOT NULL REFERENCES tenants(id),
    branch_id       uuid NOT NULL REFERENCES branches(id),
    check_in_at     timestamptz NOT NULL,
    check_out_at    timestamptz NOT NULL,
    nights          int NOT NULL CHECK (nights >= 1),
    price_per_night numeric(12,2) NOT NULL CHECK (price_per_night >= 0),
    total_amount    numeric(12,2) NOT NULL CHECK (total_amount >= 0),
    status          daily_stay_status NOT NULL DEFAULT 'RESERVED',
    created_at      timestamptz NOT NULL DEFAULT NOW(),
    updated_at      timestamptz NOT NULL DEFAULT NOW(),
    CHECK (check_out_at > check_in_at)
);

CREATE INDEX IF NOT EXISTS idx_daily_stays_room_time ON daily_stays(room_id, check_in_at, check_out_at);
CREATE INDEX IF NOT EXISTS idx_daily_stays_branch_status ON daily_stays(branch_id, status);

CREATE TRIGGER trg_daily_stays_updated_at
BEFORE UPDATE ON daily_stays
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE daily_stays
ADD CONSTRAINT daily_stays_no_overlap
EXCLUDE USING gist (
    room_id WITH =,
    tstzrange(check_in_at, check_out_at, '[)') WITH &&
)
WHERE (status IN ('RESERVED', 'CHECKED_IN'));

-- =========================
-- 5) USERS / ROLES / PERMISSIONS
-- =========================

CREATE TABLE IF NOT EXISTS roles (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            text NOT NULL UNIQUE,
    description     text,
    is_active       boolean NOT NULL DEFAULT true,
    created_at      timestamptz NOT NULL DEFAULT NOW(),
    updated_at      timestamptz NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_roles_updated_at
BEFORE UPDATE ON roles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS permissions (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            text NOT NULL UNIQUE,
    description     text,
    module          text,
    created_at      timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id         uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id   uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at      timestamptz NOT NULL DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
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

CREATE INDEX IF NOT EXISTS idx_users_branch_id ON users(branch_id);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================
-- 6) INVOICE / ITEMS / PAYMENTS / SLIPS
-- =========================

CREATE TABLE IF NOT EXISTS invoices (
    id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    lease_id             uuid REFERENCES leases(id),
    branch_id            uuid NOT NULL REFERENCES branches(id),
    room_id              uuid NOT NULL REFERENCES rooms(id),
    invoice_no           text NOT NULL,
    period_start         date NOT NULL,
    period_end           date NOT NULL,
    issued_date          date NOT NULL DEFAULT CURRENT_DATE,
    due_date             date NOT NULL,
    subtotal             numeric(12,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    discount             numeric(12,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
    penalty              numeric(12,2) NOT NULL DEFAULT 0 CHECK (penalty >= 0),
    total                numeric(12,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
    status               invoice_status NOT NULL DEFAULT 'UNPAID',
    is_locked            boolean NOT NULL DEFAULT false,
    locked_at            timestamptz,
    locked_by_user_id    uuid REFERENCES users(id),
    void_reason          text,
    created_at           timestamptz NOT NULL DEFAULT NOW(),
    updated_at           timestamptz NOT NULL DEFAULT NOW(),
    CHECK (period_end >= period_start)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_invoices_branch_invoice_no
ON invoices(branch_id, invoice_no);

CREATE INDEX IF NOT EXISTS idx_invoices_branch_status ON invoices(branch_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_room_period ON invoices(room_id, period_start, period_end);

CREATE TRIGGER trg_invoices_updated_at
BEFORE UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS invoice_items (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id      uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    item_type       invoice_item_type NOT NULL,
    description     text,
    quantity        numeric(12,3) NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit            text,
    unit_price      numeric(12,2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
    amount          numeric(12,2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
    created_at      timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

CREATE TABLE IF NOT EXISTS payments (
    id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id           uuid NOT NULL REFERENCES invoices(id),
    branch_id            uuid NOT NULL REFERENCES branches(id),
    tenant_id            uuid REFERENCES tenants(id),
    received_by_user_id  uuid REFERENCES users(id),
    paid_at              timestamptz NOT NULL DEFAULT NOW(),
    amount               numeric(12,2) NOT NULL CHECK (amount > 0),
    method               payment_method NOT NULL DEFAULT 'TRANSFER',
    reference_no         text,
    status               payment_status NOT NULL DEFAULT 'SUBMITTED',
    note                 text,
    created_at           timestamptz NOT NULL DEFAULT NOW(),
    updated_at           timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_branch_status ON payments(branch_id, status);

CREATE TRIGGER trg_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS payment_slips (
    id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id           uuid NOT NULL UNIQUE REFERENCES payments(id) ON DELETE CASCADE,
    file_url             text NOT NULL,
    file_hash            text NOT NULL,
    original_filename    text,
    mime_type            text,
    file_size            int,
    uploaded_at          timestamptz NOT NULL DEFAULT NOW(),
    uploaded_by_tenant_id uuid REFERENCES tenants(id)
);

CREATE INDEX IF NOT EXISTS idx_payment_slips_uploaded_by ON payment_slips(uploaded_by_tenant_id);

-- =========================
-- 7) AUDIT LOGS
-- =========================

CREATE TABLE IF NOT EXISTS audit_logs (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         uuid REFERENCES users(id),
    branch_id       uuid REFERENCES branches(id),
    action          audit_action NOT NULL,
    entity_type     text NOT NULL,
    entity_id       uuid,
    before_json     jsonb,
    after_json      jsonb,
    ip_address      text,
    user_agent      text,
    created_at      timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_branch_time ON audit_logs(branch_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- =========================
-- 8) VIEW: INVOICE PAYMENT SUMMARY
-- =========================

CREATE OR REPLACE VIEW v_invoice_payment_summary AS
SELECT
    i.id AS invoice_id,
    i.branch_id,
    i.invoice_no,
    i.total,
    COALESCE(SUM(CASE WHEN p.status = 'CONFIRMED' THEN p.amount ELSE 0 END), 0) AS paid_confirmed,
    (i.total - COALESCE(SUM(CASE WHEN p.status = 'CONFIRMED' THEN p.amount ELSE 0 END), 0)) AS balance_due
FROM invoices i
LEFT JOIN payments p ON p.invoice_id = i.id
GROUP BY i.id;
