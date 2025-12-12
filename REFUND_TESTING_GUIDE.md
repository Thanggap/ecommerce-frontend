# Refund Feature - Testing Guide

## 🎉 Implementation Complete!

### ✅ Backend
- Order model with refund fields
- RefundService for Stripe integration
- Smart cancel logic with auto-refund
- Webhook handlers for refund events
- API schemas updated

### ✅ Frontend
- TypeScript types updated
- OrderDetailPage with refund UI
- Admin Orders page with refund statuses
- Smart cancel button logic
- Refund information display

---

## 🧪 Testing Steps

### **Test 1: Cancel PENDING Order (No Refund)**

1. **Create Order**
   - Add product to cart
   - Go to checkout
   - Fill shipping info
   - Click "Place Order"
   - **DO NOT pay yet**

2. **Cancel Order**
   - Go to Orders page
   - Click on the PENDING order
   - Click "Cancel Order" button
   - Confirm cancellation

3. **Expected Result:**
   - ✅ Order status → CANCELLED
   - ✅ No refund created
   - ✅ Stock NOT deducted (never was)
   - ✅ Button said "Cancel Order" (not "Cancel & Refund")

---

### **Test 2: Cancel CONFIRMED Order (With Refund)**

1. **Create & Pay Order**
   - Add product to cart
   - Checkout with test card: `4242 4242 4242 4242`
   - Complete payment
   - Wait for webhook (order status → CONFIRMED)

2. **Check Order Status**
   - Go to Orders page
   - Order should show status: **CONFIRMED**
   - Stock should be deducted

3. **Cancel Order**
   - Click on the CONFIRMED order
   - Click "Cancel & Refund" button
   - Confirm cancellation

4. **Expected Flow:**
   - ✅ Order status → REFUND_PENDING
   - ✅ Stripe refund created
   - ✅ Refund info displayed in order details
   - ✅ Alert: "Your refund is being processed..."

5. **Wait for Refund Webhook** (~5 seconds)
   - Stripe sends `charge.refunded` event
   - Webhook handler processes it

6. **Final State:**
   - ✅ Order status → REFUNDED
   - ✅ Stock rolled back (increased)
   - ✅ Refund info shows:
     - Refund ID
     - Refund Amount
     - Refund Reason
     - Refunded At timestamp
   - ✅ Alert: "This order has been refunded successfully"

---

### **Test 3: Cannot Cancel PROCESSING Order**

1. **Setup:**
   - Create & pay order (status = CONFIRMED)
   - Admin changes status to PROCESSING

2. **Try to Cancel:**
   - User clicks on order
   - Cancel button should NOT show
   - Alert: "Order is being processed. Contact support to cancel."

3. **Expected Result:**
   - ❌ Cannot cancel
   - ✅ Helpful message displayed

---

### **Test 4: Cannot Cancel SHIPPED Order**

1. **Setup:**
   - Admin changes order status to SHIPPED

2. **Expected:**
   - ❌ Cancel button hidden
   - ✅ Alert: "Cannot cancel shipped orders. Contact support for returns."

---

### **Test 5: Admin View Refunded Orders**

1. **Admin Dashboard:**
   - Go to Admin → Orders
   - Filter by "Refunded"

2. **Expected:**
   - ✅ See all refunded orders
   - ✅ Status chip shows "Refunded" in secondary color
   - ✅ Can view refund details

---

## 🔍 What to Check

### **Backend Logs:**
```
[Refund] Created Stripe refund rfd_xxx for order 123
[Refund] Order 123 status updated to REFUND_PENDING
[Refund Webhook] Order 123 refunded successfully and stock rolled back
[Stock Rollback] Returned 2 to Product XYZ, new stock: 102
```

### **Stripe Dashboard:**
```
Payments → Search order ID
- See payment succeeded
- See refund created
- Status: Refunded
```

### **Database:**
```sql
SELECT id, status, payment_intent_id, refund_id, refund_amount, refunded_at 
FROM orders 
WHERE id = 123;
```

Expected:
- status = 'refunded'
- payment_intent_id = 'pi_xxx'
- refund_id = 'rfd_xxx'
- refund_amount = total_amount
- refunded_at = timestamp

### **Frontend UI:**

**Order Detail Page:**
- [ ] Status chip shows correct color
- [ ] Cancel button text matches status
- [ ] Refund info box displays when refund exists
- [ ] Status alerts show appropriate messages
- [ ] Cancel button hidden for shipped/delivered

**Admin Orders:**
- [ ] Filter by refund_pending works
- [ ] Filter by refunded works
- [ ] Status chips show correct colors
- [ ] Can update order status

---

## 📱 Test Scenarios Matrix

| Order Status | Can Cancel? | Button Text | What Happens | Final Status |
|--------------|-------------|-------------|--------------|--------------|
| PENDING | ✅ Yes | "Cancel Order" | Instant cancel | CANCELLED |
| CONFIRMED | ✅ Yes | "Cancel & Refund" | Create refund | REFUND_PENDING → REFUNDED |
| PROCESSING | ❌ No | Hidden | Show alert | - |
| SHIPPED | ❌ No | Hidden | Show alert | - |
| DELIVERED | ❌ No | Hidden | Show alert | - |
| CANCELLED | ❌ No | Hidden | Already cancelled | - |
| REFUND_PENDING | ❌ No | Hidden | Refund processing | - |
| REFUNDED | ❌ No | Hidden | Already refunded | - |

---

## 🐛 Common Issues & Fixes

### **Issue 1: Webhook not triggering**
**Symptom:** Order stays REFUND_PENDING, never becomes REFUNDED

**Fix:**
- Check Stripe CLI is running: `stripe listen --forward-to localhost:8000/webhook/stripe`
- Check backend logs for webhook errors
- Verify webhook secret in .env matches CLI output

---

### **Issue 2: Stock not rolling back**
**Symptom:** Refund succeeds but stock unchanged

**Fix:**
- Check backend logs for `[Stock Rollback]` messages
- Verify order items have correct product_id
- Check if rollback_stock_on_cancel() is being called

---

### **Issue 3: Refund fails in Stripe**
**Symptom:** Error creating refund

**Possible causes:**
- Payment intent not captured
- Already refunded
- Insufficient balance (live mode)

**Fix:**
- Check Stripe Dashboard for payment status
- Verify payment_intent_id is saved correctly
- Use test mode for testing

---

### **Issue 4: Database columns missing**
**Symptom:** Error: column "payment_intent_id" does not exist

**Fix:**
```bash
# Run migration
psql -U user -d database -f migrations/add_refund_columns.sql
```

---

## ✅ Full Test Checklist

### Backend:
- [ ] Order model has refund columns
- [ ] payment_intent_id saved when payment succeeds
- [ ] RefundService.create_refund() works
- [ ] Webhook handles charge.refunded event
- [ ] Stock rollback on refund success
- [ ] API returns refund info in order response

### Frontend:
- [ ] IOrder interface has refund fields
- [ ] Cancel button shows for PENDING/CONFIRMED only
- [ ] Button text changes based on status
- [ ] Refund info box displays correctly
- [ ] Status alerts show for each status
- [ ] Admin page has refund statuses
- [ ] Status colors correct

### Integration:
- [ ] Create → Pay → Cancel → Refund flow works
- [ ] Webhooks update order status automatically
- [ ] Stock deducted on payment
- [ ] Stock rolled back on refund
- [ ] Refund appears in Stripe Dashboard
- [ ] No errors in browser console
- [ ] No errors in backend logs

---

## 🎯 Success Criteria

**All green means feature is ready for production:**

✅ User can cancel PENDING orders instantly
✅ User can cancel CONFIRMED orders with auto-refund
✅ Refund creates successfully in Stripe
✅ Webhook updates order to REFUNDED
✅ Stock rolls back automatically
✅ UI shows refund information
✅ Admin can filter and view refunded orders
✅ Appropriate error messages for non-cancelable orders
✅ No console errors or warnings
✅ Mobile responsive UI

---

## 🚀 Production Deployment

1. ✅ Run DB migration
2. ✅ Deploy backend code
3. ✅ Verify webhook endpoint in Stripe Dashboard
4. ✅ Deploy frontend code
5. ✅ Test with real test cards
6. ✅ Monitor logs for errors
7. ✅ Communicate changes to team

**Happy Testing!** 🎉
