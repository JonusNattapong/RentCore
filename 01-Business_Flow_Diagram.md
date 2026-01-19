# 1. Business Flow Diagram

## 1.1 Tenant Registration Flow
```
1. Tenant registers (web portal/mobile)
2. System creates tenant record
3. Staff verifies ID card + documents (optional upload)
4. Staff activates tenant account
```

## 1.2 Monthly Lease Flow
```
1. Staff creates lease contract
2. System generates lease with start_date, end_date, deposit_amount
3. Room status changes: VACANT → OCCUPIED_MONTHLY
4. System auto-generates invoice on billing_day (cron job)
5. Tenant receives invoice notification
6. Tenant uploads payment slip
7. Staff reviews slip → CONFIRM or REJECT
8. If CONFIRM: Invoice status UNPAID → PAID, update room payment status
9. If REJECT: Staff adds note, tenant re-uploads
10. After confirm: Invoice is LOCKED (cannot be modified)
```

## 1.3 Daily Stay Flow (Reservation & Check-in/out)
```
1. Tenant checks availability (dates + room)
2. Staff creates reservation (or tenant via portal)
3. System checks for overlap (exclusion constraint)
4. Room status: VACANT → RESERVED
5. Tenant checks in → status: CHECKED_IN, room: OCCUPIED_DAILY
6. Upon checkout → status: CHECKED_OUT, room: VACANT
7. Invoice created automatically (nights × price_per_night)
8. Payment flow same as monthly
```

## 1.4 Payment Confirmation Flow
```
1. Tenant uploads slip → payment_status: SUBMITTED
2. Staff reviews slip details (amount, date, account)
3. If valid: staff CONFIRM → status: CONFIRMED
   - Invoice status: UNPAID → PAID (if full payment) or WAITING_CONFIRM → PAID
   - Invoice is LOCKED
   - Audit log created
4. If invalid: staff REJECT → status: REJECTED
   - Tenant notified, can re-upload
5. Partial payment allowed → invoice shows balance_due
```

## 1.5 Invoice Generation Flow (Monthly)
```
1. Cron job runs daily (e.g., 00:01)
2. Find leases with billing_day = today
3. For each active lease:
   a. Calculate period: previous_month_billing_day to yesterday
   b. Calculate base rent
   c. Read water/electric meter (manual input or automated)
   d. Add common fee (if applicable)
   e. Calculate penalty (if overdue)
   f. Create invoice with status UNPAID
   g. Create invoice_items for each charge
   h. Generate invoice_no (BRANCH-YYYYMM-XXXXX)
4. Send notification to tenant
```

## 1.6 Maintenance Flow
```
1. Staff/Tenant reports issue
2. Staff changes room status: any → MAINTENANCE
3. Staff creates maintenance ticket (not in current schema - suggest add)
4. Maintenance staff resolves
5. Staff changes status back to VACANT/OCCUPIED
```

## 1.7 Lease Termination Flow
```
1. Tenant requests termination (or staff initiates)
2. Staff calculates:
   - Pro-rated rent
   - Unused deposit refund
   - Outstanding invoices
3. Staff generates final invoice (may have negative amount for refund)
4. Tenant pays outstanding balance
5. Staff confirms all payments
6. Staff updates lease: status ACTIVE → ENDED, moved_out_at = NOW()
7. Room status: OCCUPIED_MONTHLY → VACANT (after cleaning)
```

## 1.8 Overdue Handling Flow
```
1. Cron job runs daily
2. Find invoices with due_date < today AND status NOT IN (PAID, VOID)
3. Change status: UNPAID → OVERDUE
4. Send reminder notification
5. If overdue > X days → add penalty (configurable per branch)
6. Generate new invoice item for penalty
```

## 1.9 Audit Flow (All Critical Actions)
```
For each critical action (CREATE/UPDATE/DELETE/CONFIRM/LOCK/VOID):
1. Capture user_id, timestamp
2. Capture entity_type + entity_id
3. Store before_json (old values) + after_json (new values)
4. Store ip_address, user_agent
5. Write to audit_logs table
```
