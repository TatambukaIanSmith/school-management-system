# Bursar Fees Management Guide

## Overview
The School Registration System provides a comprehensive fees management system designed specifically for the Bursar role. This guide explains how to track, record, and manage student fees across multiple payment methods.

---

## Accessing the Fees System

1. **Login** with your Bursar account credentials
2. From the **Dashboard**, you'll see:
   - Total Collected
   - Outstanding Fees
   - Fully Paid Students
   - Defaulters Count
3. Click **"Manage Fees"** or navigate to **Fees** from the sidebar

---

## Recording Payments

### Step-by-Step Process

1. **Find the Student**
   - Use the search bar to find by name or student ID
   - Or scroll through the student list

2. **Click "Record Payment"** button next to the student

3. **Fill in Payment Details**:
   - **Amount**: Enter the amount paid (in UGX)
   - **Payment Method**: Select from organized categories:
     
     **Global Payment Methods:**
     - **Cash** - Physical cash payments
     - **Bank Transfer** - Direct bank deposits
     - **Credit Card** - Credit card payments
     - **Debit Card** - Debit card payments
     - **Cheque** - Cheque payments
     - **Wire Transfer** - International wire transfers
     - **PayPal** - PayPal transactions
     
     **Mobile Money (Uganda):**
     - **MTN Mobile Money** - MTN MoMo transactions
     - **Airtel Money** - Airtel Money transactions
     
     **Other:**
     - **Other Payment Method** - Any other payment type
   
   - **Receipt/Transaction Number**: 
     - For Mobile Money: Enter transaction ID (e.g., `MTN-123456789`)
     - For Bank Transfer: Enter reference number
     - For Cards: Enter authorization code
     - For Cash/Cheque: Enter receipt number (e.g., `Receipt #001`)
   
   - **Notes** (Optional): Add any additional information

4. **Click "Record Payment"** to save

---

## Tracking Payments by Method

### Mobile Money Payments (MTN & Airtel)

**Recording MTN Mobile Money:**
1. Select "MTN Mobile Money" as payment method
2. Enter the MTN transaction ID in the Receipt field
3. The system will color-code MTN payments in yellow for easy identification

**Recording Airtel Money:**
1. Select "Airtel Money" as payment method
2. Enter the Airtel transaction ID in the Receipt field
3. The system will color-code Airtel payments in red for easy identification

### Bank Transfers
1. Select "Bank Transfer" as payment method
2. Enter the bank reference number
3. Bank transfers are color-coded in blue

### Cash Payments
1. Select "Cash" as payment method
2. Enter your internal receipt number
3. Cash payments are color-coded in gray

---

## Viewing Payment History

### For Individual Students

1. Click the **"History"** button next to any student
2. You'll see:
   - Complete payment history
   - Payment method for each transaction (color-coded)
   - Transaction dates and times
   - Receipt/Transaction numbers
   - Who recorded each payment
   - Running balance

3. **Export Individual History**:
   - Click "Export Payment History" at the bottom of the modal
   - Downloads a CSV file with all transactions for that student

### Payment Status Indicators

- **Green Badge (Paid)**: Student has paid 100% of fees
- **Yellow Badge (Partial)**: Student has made partial payment
- **Red Badge (Unpaid)**: Student hasn't made any payment

---

## Filtering and Searching

### Search Students
- Type in the search box to find students by:
  - Full name
  - Student ID

### Filter by Payment Status
Use the dropdown to filter:
- **All Students**: Show everyone
- **Fully Paid**: Only students who paid 100%
- **Partial Payment**: Students with partial payments
- **Unpaid**: Students with no payments

---

## Exporting Reports

### 1. Export All Fees Report
- Click **"Export All"** button
- Downloads CSV with:
  - Student ID
  - Full Name
  - Class
  - Total Due
  - Total Paid
  - Balance
  - Status

### 2. Export by Payment Method
- Click **"By Payment Method"** button
- Downloads comprehensive report with:
  - **Summary Section**: Total transactions and amounts per payment method
  - **Detailed Section**: All transactions sorted by date
  - Shows which students paid via MTN, Airtel, Bank, Cash, etc.

**Use Cases:**
- Reconcile MTN Mobile Money transactions
- Reconcile Airtel Money transactions
- Track bank deposits
- Audit cash collections

### 3. Export Individual Student History
- Open student's payment history
- Click "Export Payment History"
- Downloads all transactions for that specific student

---

## Dashboard Features

Your Bursar Dashboard shows:

### Financial Stats
- **Total Collected**: Sum of all payments received
- **Outstanding**: Total amount still owed
- **Fully Paid**: Number of students who paid in full
- **Defaulters**: Students with no payments made

### Recent Payments Widget
- Shows last 5 payments received
- Color-coded by payment method
- Displays amount, student name, and date

### Collection by Class Widget
- Visual progress bars showing collection rate per class
- Collected vs Outstanding amounts
- Percentage completion

---

## Fee Structure

The system automatically assigns fees based on class:
- **Senior 1-2**: UGX 500,000 per term
- **Senior 3-4**: UGX 550,000 per term
- **Senior 5-6**: UGX 600,000 per term

---

## Best Practices

### For Mobile Money Payments
1. Always verify the transaction ID before recording
2. Check your mobile money statement to confirm receipt
3. Use the transaction ID as the receipt number
4. Record payments immediately after confirmation

### For Bank Transfers
1. Wait for bank confirmation before recording
2. Use the bank reference number as receipt
3. Note the bank name in the Notes field if needed

### For Cash Payments
1. Issue a physical receipt to the student/parent
2. Use sequential receipt numbers (e.g., Receipt #001, #002)
3. Keep a physical receipt book for backup

### Daily Reconciliation
1. Export "By Payment Method" report at end of day
2. Match MTN transactions with your MTN statement
3. Match Airtel transactions with your Airtel statement
4. Match bank transfers with bank statement
5. Count physical cash against cash receipts

---

## Troubleshooting

### Payment Not Showing
- Refresh the page
- Check if you clicked "Record Payment" button
- Verify the student ID is correct

### Wrong Payment Recorded
- Contact the Administrator to correct the record
- Keep notes of the error for audit trail

### Export Not Working
- Ensure you have data to export
- Try a different browser if issues persist
- Check that pop-ups are not blocked

---

## Security Tips

1. **Never share** your login credentials
2. **Log out** when leaving your workstation
3. **Verify** transaction IDs before recording
4. **Keep backups** of exported reports
5. **Reconcile daily** to catch errors early

---

## Support

For technical issues or questions:
- Contact the System Administrator
- Check the Help Center in the application
- Refer to the main documentation

---

**Last Updated**: April 2026
**Version**: 1.0
