# Fees Management System - Complete Overview

## System Capabilities

### ✅ What the Bursar Can Do

1. **Record Payments** from multiple sources:
   - Cash payments
   - Bank transfers
   - MTN Mobile Money
   - Airtel Money
   - Cheque payments
   - Other payment methods

2. **Track Payment Status**:
   - View all students with their payment status
   - See who has paid fully, partially, or not at all
   - Monitor outstanding balances in real-time

3. **View Payment History**:
   - Complete transaction history per student
   - Color-coded by payment method for easy identification
   - Transaction dates, times, and receipt numbers
   - Who recorded each payment

4. **Generate Reports**:
   - Export all fees data to CSV
   - Export by payment method (MTN, Airtel, Bank, Cash)
   - Export individual student payment history
   - Summary reports with totals per payment method

5. **Search and Filter**:
   - Search by student name or ID
   - Filter by payment status (Paid/Partial/Unpaid)
   - Quick access to any student's records

---

## Payment Methods Supported

### Global Payment Methods

#### 1. Cash
- **Color Code**: Green badge
- **Receipt Format**: Receipt #XXX
- **Use Case**: Physical cash payments at school
- **Tracking**: Sequential receipt numbers

#### 2. Bank Transfer
- **Color Code**: Blue badge
- **Reference Format**: Bank reference number
- **Use Case**: Direct deposits to school bank account
- **Tracking**: Bank reference for statement matching

#### 3. Credit Card
- **Color Code**: Purple badge
- **Reference Format**: Authorization code
- **Use Case**: Credit card payments (if school has POS)
- **Tracking**: Card authorization code

#### 4. Debit Card
- **Color Code**: Purple badge
- **Reference Format**: Authorization code
- **Use Case**: Debit card payments (if school has POS)
- **Tracking**: Card authorization code

#### 5. Cheque
- **Color Code**: Indigo badge
- **Reference Format**: Cheque number
- **Use Case**: Cheque payments
- **Tracking**: Cheque number and bank details

#### 6. Wire Transfer
- **Color Code**: Blue badge
- **Reference Format**: Wire reference number
- **Use Case**: International wire transfers
- **Tracking**: Wire transfer reference

#### 7. PayPal
- **Color Code**: Purple badge
- **Reference Format**: PayPal transaction ID
- **Use Case**: Online PayPal payments
- **Tracking**: PayPal transaction ID

### Mobile Money (Uganda)

#### 8. MTN Mobile Money
- **Color Code**: Yellow badge
- **Transaction ID Format**: MTN-XXXXXXXXX
- **Use Case**: Students/parents pay via MTN MoMo
- **Tracking**: Transaction ID recorded for reconciliation

#### 9. Airtel Money
- **Color Code**: Red badge
- **Transaction ID Format**: Airtel-XXXXXXXXX
- **Use Case**: Students/parents pay via Airtel Money
- **Tracking**: Transaction ID recorded for reconciliation

### Other

#### 10. Other Payment Method
- **Color Code**: Gray badge
- **Use Case**: Any other payment method not listed
- **Tracking**: Custom reference number

---

## Workflow Example

### Scenario: Student Pays via MTN Mobile Money

1. **Parent/Student Action**:
   - Opens MTN Mobile Money app
   - Sends UGX 500,000 to school's registered number
   - Receives transaction ID: `MTN-987654321`

2. **Bursar Action**:
   - Checks MTN Mobile Money statement
   - Confirms receipt of UGX 500,000
   - Logs into School Registration System
   - Navigates to Fees Management
   - Searches for student by name or ID
   - Clicks "Record Payment"
   - Fills in:
     - Amount: 500,000
     - Method: MTN Mobile Money
     - Receipt: MTN-987654321
     - Notes: "Full term payment"
   - Clicks "Record Payment"

3. **System Action**:
   - Records payment with timestamp
   - Updates student's balance
   - Changes status badge (Unpaid → Paid)
   - Adds to payment history
   - Updates dashboard statistics

4. **Verification**:
   - Bursar clicks "History" to verify
   - Sees payment with yellow MTN badge
   - Transaction ID matches MTN statement

5. **End of Day Reconciliation**:
   - Bursar clicks "By Payment Method" export
   - Opens CSV file
   - Matches all MTN transactions with MTN statement
   - Confirms all payments recorded correctly

---

## Dashboard Statistics

The Bursar Dashboard displays:

### Financial Overview
```
┌─────────────────────────────────────────────────────┐
│  Total Collected    Outstanding    Fully Paid       │
│  UGX 45,000,000    UGX 15,000,000      85          │
│                                                      │
│  Defaulters                                         │
│      12                                             │
└─────────────────────────────────────────────────────┘
```

### Recent Payments
```
┌─────────────────────────────────────────────────────┐
│  John Doe                    UGX 500,000            │
│  MTN Mobile Money • MTN-123456                      │
│  Today at 10:30 AM                                  │
│─────────────────────────────────────────────────────│
│  Jane Smith                  UGX 550,000            │
│  Airtel Money • Airtel-789012                       │
│  Today at 9:15 AM                                   │
└─────────────────────────────────────────────────────┘
```

### Collection by Class
```
┌─────────────────────────────────────────────────────┐
│  Senior 1        ████████████░░░░░░░░  65%         │
│  Collected: UGX 6,500,000 | Outstanding: 3,500,000 │
│                                                      │
│  Senior 2        ███████████████░░░░░  78%         │
│  Collected: UGX 7,800,000 | Outstanding: 2,200,000 │
└─────────────────────────────────────────────────────┘
```

---

## Export Reports

### 1. All Fees Report (fees_report_2026-04-20.csv)
```csv
Student ID,Full Name,Class,Total Due,Total Paid,Balance,Status
S001,John Doe,Senior 1,500000,500000,0,Paid
S002,Jane Smith,Senior 2,500000,250000,250000,Partial
S003,Bob Wilson,Senior 3,550000,0,550000,Unpaid
```

### 2. Payment Methods Report (payment_methods_report_2026-04-20.csv)
```csv
Payment Method Summary Report
Generated:,4/20/2026 3:45 PM

Payment Method,Total Transactions,Total Amount (UGX)
MTN Mobile Money,45,22500000
Airtel Money,28,14000000
Bank Transfer,15,7500000
Cash,12,6000000

Detailed Transactions
Date,Time,Student ID,Student Name,Class,Amount,Payment Method,Receipt/Transaction,Recorded By
4/20/2026,10:30 AM,S001,John Doe,Senior 1,500000,MTN Mobile Money,MTN-123456,Bursar Name
4/20/2026,9:15 AM,S002,Jane Smith,Senior 2,550000,Airtel Money,Airtel-789012,Bursar Name
```

### 3. Individual Payment History (payment_history_S001_2026-04-20.csv)
```csv
Date,Time,Amount,Payment Method,Receipt/Transaction,Notes,Recorded By
4/20/2026,10:30 AM,500000,MTN Mobile Money,MTN-123456,Full term payment,Bursar Name
3/15/2026,2:00 PM,250000,Cash,Receipt #045,Partial payment,Bursar Name
```

---

## Reconciliation Process

### Daily Reconciliation Checklist

**End of Each Day:**

1. ☐ Export "By Payment Method" report
2. ☐ Check MTN Mobile Money statement
   - Match all MTN transactions
   - Verify amounts and transaction IDs
3. ☐ Check Airtel Money statement
   - Match all Airtel transactions
   - Verify amounts and transaction IDs
4. ☐ Check bank statement
   - Match all bank transfers
   - Verify reference numbers
5. ☐ Count physical cash
   - Match against cash receipts
   - Verify receipt numbers are sequential
6. ☐ Note any discrepancies
7. ☐ Update reconciliation log

**Weekly Reconciliation:**

1. ☐ Export all fees report
2. ☐ Compare with previous week
3. ☐ Verify collection targets
4. ☐ Identify defaulters
5. ☐ Generate summary for management

**Monthly Reconciliation:**

1. ☐ Full audit of all payment methods
2. ☐ Generate monthly collection report
3. ☐ Compare with budget/targets
4. ☐ Submit to management
5. ☐ Archive all reports

---

## Access Control

### Who Can Access Fees Management?

✅ **Administrator** - Full access to all features
✅ **Bursar** - Full access to fees management
✅ **Secretary** - Can view and record payments

❌ **Other Roles** - No access to fees management

---

## Data Storage

- All payment data stored in **localStorage** (browser)
- Can be synced to **Supabase** database (if configured)
- Export reports regularly for backup
- Keep physical copies of critical reports

---

## Security Features

1. **Role-Based Access**: Only authorized roles can access fees
2. **Audit Trail**: Every payment records who entered it
3. **Timestamp**: All transactions have date and time
4. **Receipt Numbers**: Unique identifiers for each transaction
5. **Export Capability**: Regular backups via CSV export

---

## Future Enhancements (Potential)

- SMS notifications to parents on payment receipt
- Email receipts automatically sent
- Integration with mobile money APIs for automatic recording
- Bank API integration for automatic reconciliation
- Payment reminders for outstanding balances
- Installment payment plans
- Late payment penalties calculation
- Discount management for early payments

---

## Quick Reference

### Common Tasks

| Task | Steps |
|------|-------|
| Record MTN payment | Fees → Find student → Record Payment → Select "MTN Mobile Money" → Enter transaction ID |
| View payment history | Fees → Find student → Click "History" |
| Export MTN transactions | Fees → Click "By Payment Method" → Open CSV → Filter MTN rows |
| Check defaulters | Dashboard → View "Defaulters" stat → Or Fees → Filter "Unpaid" |
| Daily reconciliation | Fees → Export "By Payment Method" → Match with statements |

---

**System Status**: ✅ Fully Operational
**Last Updated**: April 2026
**Version**: 1.0
