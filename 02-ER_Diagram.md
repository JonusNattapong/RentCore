# 2. ER Diagram (Entity Relationships)

## Text Diagram

```
┌─────────────────┐
│    BRANCHES     │
├─────────────────┤
│ id (PK)         │
│ code            │
│ name            │
│ address         │
│ phone           │
│ is_active       │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │ 1
         │
         │ N
    ┌────┴────────────────────────────────────────┐
    │                                             │
    │ N                                           │ N
┌───┴─────────┐                           ┌──────┴────────┐
│  BUILDINGS   │                           │     USERS      │
├──────────────┤                           ├───────────────┤
│ id (PK)      │                           │ id (PK)        │
│ branch_id FK │                           │ branch_id FK   │
│ name         │                           │ role_id FK     │
│ sort_order   │                           │ username       │
│ is_active    │                           │ password_hash  │
│ created_at   │                           │ full_name      │
│ updated_at   │                           │ email          │
└──────┬───────┘                           │ phone          │
       │ 1                                │ is_active      │
       │                                  │ last_login_at  │
       │ N                                │ created_at     │
  ┌────┴───────┐                          │ updated_at     │
  │  FLOORS    │                          └───────┬────────┘
  ├────────────┤                                  │ 1
  │ id (PK)    │                                  │
  │ building FK│                                  │ N
  │ name       │                          ┌───────┴────────┐
  │ floor_no   │                          │     ROLES       │
  │ sort_order │                          ├───────────────┤
  │ created_at │                          │ id (PK)        │
  │ updated_at │                          │ name           │
  └─────┬──────┘                          │ description    │
        │ 1                               │ is_active      │
        │                                 │ created_at     │
        │ N                               │ updated_at     │
   ┌────┴───────┐                          └───────┬────────┘
   │   ROOMS    │                                  │ 1
   ├────────────┤                                  │
   │ id (PK)    │                                  │ M
   │ floor_id FK│                          ┌───────┴────────┐
   │ branch_id FK│                         │ ROLE_PERMISSIONS │
   │ room_no    │                          ├─────────────────┤
   │ room_type  │                          │ role_id FK      │
   │ capacity   │                          │ permission_id FK│
   │ status     │                          │ created_at      │
   │ area_sqm   │                          └────────┬─────────┘
   │ is_active  │                                   │ N
   │ created_at │                           ┌────────┴────────┐
   │ updated_at │                           │  PERMISSIONS    │
   └─────┬──────┘                           ├────────────────┤
         │ 1                                │ id (PK)         │
         │                                  │ code            │
         │ N                                │ description     │
   ┌─────┴─────────────┐                   │ module          │
   │   ROOM_PRICES     │                   │ created_at      │
   ├──────────────────┤                   └─────────────────┘
   │ id (PK)          │
   │ room_id FK       │        ┌──────────────────────┐
   │ price_type       │        │      TENANTS         │
   │ price_amount     │        ├──────────────────────┤
   │ effective_from   │        │ id (PK)              │
   │ effective_to     │        │ tenant_code          │
   │ is_active        │        │ full_name            │
   │ created_at       │        │ phone                │
   │ updated_at       │        │ email                │
   └──────────────────┘        │ id_card_no           │
                              │ address              │
                              │ emergency_contact    │
                              │ is_active            │
                              │ created_at           │
                              │ updated_at           │
                              └──────────┬───────────┘
                                         │ 1
                                         │
                                         │ N
                               ┌─────────┴───────────┐
                               │                     │
                               │ N                   │ N
                         ┌─────┴──────┐      ┌──────┴───────┐
                         │   LEASES   │      │ DAILY_STAYS  │
                         ├────────────┤      ├──────────────┤
                         │ id (PK)    │      │ id (PK)       │
                         │ room_id FK │      │ room_id FK    │
                         │ tenant FK  │      │ tenant FK     │
                         │ branch FK  │      │ branch FK     │
                         │ start_date │      │ check_in_at   │
                         │ end_date   │      │ check_out_at  │
                         │ rent_month │      │ nights        │
                         │ deposit    │      │ price_night   │
                         │ billing_day│      │ total_amount  │
                         │ status     │      │ status        │
                         │ moved_in   │      │ created_at    │
                         │ moved_out  │      │ updated_at    │
                         │ created_at │      └──────────────┘
                         │ updated_at │              │ 1
                         └──────┬─────┘              │
                                │ 1                  │
                                │                    │ N
                                │ N            ┌─────┴────────┐
                         ┌──────┴──────┐       │   INVOICES   │
                         │  INVOICES   │       ├──────────────┤
                         ├─────────────┤       │ id (PK)       │
                         │ id (PK)     │       │ lease_id FK   │
                         │ lease_id FK │       │ branch_id FK  │
                         │ branch_id FK│       │ room_id FK    │
                         │ room_id FK  │       │ invoice_no    │
                         │ invoice_no  │       │ period_start  │
                         │ period_srt  │       │ period_end    │
                         │ period_end  │       │ issued_date   │
                         │ issued_date│       │ due_date      │
                         │ due_date    │       │ subtotal      │
                         │ subtotal    │       │ discount      │
                         │ discount    │       │ penalty       │
                         │ penalty     │       │ total         │
                         │ total       │       │ status        │
                         │ status      │       │ is_locked     │
                         │ is_locked   │       │ locked_at     │
                         │ locked_at   │       │ locked_by FK  │
                         │ locked_by FK│       │ void_reason   │
                         │ void_reason │       │ created_at    │
                         │ created_at  │       │ updated_at    │
                         │ updated_at  │       └────────┬───────┘
                         └──────┬──────┘                │ 1
                                │ 1                      │
                                │                        │ N
                                │ N                ┌─────┴────────┐
                         ┌──────┴───────┐            │   PAYMENTS   │
                         │ INVOICE_ITEMS│            ├──────────────┤
                         ├──────────────┤            │ id (PK)       │
                         │ id (PK)      │            │ invoice_id FK│
                         │ invoice_id FK│            │ branch_id FK │
                         │ item_type    │            │ tenant_id FK │
                         │ description  │            │ received_by FK
                         │ quantity     │            │ paid_at       │
                         │ unit         │            │ amount        │
                         │ unit_price   │            │ method        │
                         │ amount       │            │ reference_no  │
                         │ created_at   │            │ status        │
                         └──────────────┘            │ note          │
                                                     │ created_at   │
                                                     │ updated_at   │
                                                     └──────┬───────┘
                                                            │ 1
                                                            │
                                                            │ N
                                                      ┌─────┴────────┐
                                                      │PAYMENT_SLIPS │
                                                      ├──────────────┤
                                                      │ id (PK)      │
                                                      │ payment_id FK│
                                                      │ file_url     │
                                                      │ file_hash    │
                                                      │ original_fn  │
                                                      │ mime_type    │
                                                      │ file_size    │
                                                      │ uploaded_at  │
                                                      │ uploaded_by FK
                                                      └──────────────┘


┌─────────────────┐
│   AUDIT_LOGS   │
├─────────────────┤
│ id (PK)        │
│ user_id FK     │
│ branch_id FK   │
│ action         │
│ entity_type    │
│ entity_id      │
│ before_json    │
│ after_json     │
│ ip_address     │
│ user_agent     │
│ created_at     │
└─────────────────┘
```

## Entity Relationships

### 1:N Relationships

- BRANCHES → BUILDINGS (1:N)
- BUILDINGS → FLOORS (1:N)
- FLOORS → ROOMS (1:N)
- BRANCHES → USERS (1:N) - staff assigned to branch
- ROOMS → ROOM_PRICES (1:N) - historical pricing
- ROOMS → LEASES (1:N) - room can have many leases over time
- ROOMS → DAILY_STAYS (1:N) - room can have many stays
- TENANTS → LEASES (1:N) - tenant can have multiple leases
- TENANTS → DAILY_STAYS (1:N) - tenant can have multiple stays
- LEASES → INVOICES (1:N) - lease generates many invoices
- INVOICES → INVOICE_ITEMS (1:N) - invoice has many line items
- INVOICES → PAYMENTS (1:N) - invoice can have multiple partial payments
- USERS → AUDIT_LOGS (1:N) - user performs many actions
- BRANCHES → AUDIT_LOGS (1:N) - audit logs scoped by branch

### 1:1 Relationships

- PAYMENTS → PAYMENT_SLIPS (1:1) - one payment has one proof slip

### N:M Relationships

- ROLES ↔ PERMISSIONS (N:M) - via ROLE_PERMISSIONS

### Self-Referencing

- ROOMS: status constraints prevent overlapping bookings for daily stays

## Key Design Decisions

1. **Denormalization**: `branch_id` in ROOMS, LEASES, DAILY_STAYS for easier filtering
2. **Historical Pricing**: ROOM_PRICES allows tracking price changes over time
3. **Soft Delete**: All tables use `is_active` flag instead of hard delete
4. **Audit Trail**: AUDIT_LOGS captures all critical actions with before/after JSON
5. **Invoice Locking**: Once payment confirmed, invoice becomes read-only
6. **Payment Flexibility**: Supports partial payments and multiple payment methods
7. **Exclusion Constraint**: Prevents overlapping daily stay bookings at DB level
