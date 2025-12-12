# Return & Refund Feature - Frontend Implementation Summary

## Overview
Frontend UI cho complete return and refund system với admin management interface.

## Files Modified

### 1. TypeScript Types
**File:** `src/services/Order.ts`

```typescript
// Added to IOrder interface
return_requested_at?: string;

// New API methods
adminGetPendingReturns(page, size)
adminApproveReturn(orderId)
adminRejectReturn(orderId, rejectionReason)
```

### 2. Order Detail Page (User View)
**File:** `src/pages/orders/OrderDetailPage.tsx`

#### Status Handling
```typescript
// Added status colors
case 'return_requested': return 'warning';
case 'return_approved': return 'info';

// Added status labels
case 'return_requested': return 'Return Requested';
case 'return_approved': return 'Return Approved';
```

#### Return Request Logic
```typescript
canRequestReturn() {
  // Can only return DELIVERED orders within 7 days
  if (order.status !== 'delivered') return false;
  
  const daysSinceDelivery = Math.floor(
    (now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return daysSinceDelivery <= 7;
}
```

#### Button Text
```typescript
getCancelButtonText() {
  if (order.status === 'pending') return 'Cancel Order';
  if (order.status === 'confirmed') return 'Cancel & Refund';
  if (order.status === 'delivered') return 'Request Return';
  return 'Cancel Order';
}
```

#### UI Components Added

**Return Request Info Box**
```tsx
{order.return_requested_at && order.status === 'return_requested' && (
  <Box bgcolor="info.light">
    <Typography>Return Request Pending</Typography>
    <Typography>Requested At: {formatDate(order.return_requested_at)}</Typography>
    {order.refund_reason && <Typography>Reason: {order.refund_reason}</Typography>}
    <Alert>Your return request is being reviewed by our team.</Alert>
  </Box>
)}
```

**Status-Specific Alerts**
- `return_requested`: "Return request pending admin approval."
- `return_approved`: "Return approved! Refund is being processed."
- `refund_pending`: "Your refund is being processed..."
- `refunded`: "This order has been refunded successfully."

### 3. Admin Orders Page
**File:** `src/pages/admin/AdminOrders.tsx`

```typescript
const ORDER_STATUSES = [
  { value: "pending", label: "Pending", color: "warning" },
  { value: "confirmed", label: "Confirmed", color: "info" },
  { value: "processing", label: "Processing", color: "info" },
  { value: "shipped", label: "Shipped", color: "primary" },
  { value: "delivered", label: "Delivered", color: "success" },
  { value: "cancelled", label: "Cancelled", color: "error" },
  { value: "return_requested", label: "Return Requested", color: "warning" },
  { value: "return_approved", label: "Return Approved", color: "info" },
  { value: "refund_pending", label: "Refund Pending", color: "warning" },
  { value: "refunded", label: "Refunded", color: "secondary" },
];
```

### 4. Admin Return Management Page (NEW!)
**File:** `src/pages/admin/AdminReturnManagement.tsx`

#### Features
- **List View**: All pending return requests (status = return_requested)
- **Stats Card**: Count of pending returns
- **Table Columns**:
  - Order ID
  - Customer (name + email)
  - Amount
  - Delivered date
  - Days since delivery (color-coded chip)
  - Status
  - Actions (View, Approve, Reject)

#### Actions

**Approve Return**
```typescript
handleApprove(orderId)
- Confirm dialog: "Approve this return request and initiate refund?"
- Calls: adminApproveReturn(orderId)
- On success: Refreshes list
- Backend: Auto creates Stripe refund → REFUND_PENDING → REFUNDED
```

**Reject Return**
```typescript
handleReject(orderId)
- Opens rejection dialog
- Requires rejection reason input
- Calls: adminRejectReturn(orderId, rejectionReason)
- On success: Reverts order to DELIVERED
```

#### UI Components

**Days Since Delivery Chip**
- ≤3 days: Green
- 4-5 days: Yellow
- 6-7 days: Orange
- >7 days: Red (shouldn't happen due to backend validation)

**Rejection Dialog**
```tsx
<Dialog>
  <DialogTitle>Reject Return Request</DialogTitle>
  <DialogContent>
    <TextField 
      multiline 
      rows={4}
      label="Rejection Reason"
      placeholder="e.g., Product condition does not meet return policy..."
    />
  </DialogContent>
  <DialogActions>
    <Button>Cancel</Button>
    <Button color="error">Reject Return</Button>
  </DialogActions>
</Dialog>
```

### 5. Routing
**File:** `src/App.tsx`

```tsx
// Added import
import AdminReturnManagement from "./pages/admin/AdminReturnManagement";

// Added route
<Route
  path="/admin/returns"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminReturnManagement />
    </ProtectedRoute>
  }
/>
```

### 6. Navigation
**File:** `src/pages/admin/AdminDashboard.tsx`

```tsx
<Button 
  variant="contained" 
  color="warning" 
  onClick={() => navigate("/admin/returns")}
>
  Return Requests
</Button>
```

## User Flow

### For Customers

#### Scenario 1: DELIVERED Order (within 7 days)
1. Go to My Orders → Click order
2. See "Request Return" button (orange)
3. Click → Confirm dialog
4. Order status → RETURN_REQUESTED
5. See info box: "Return request pending admin approval"
6. Wait for admin review
7. If approved → See "Return approved! Refund is being processed"
8. Status → REFUND_PENDING → REFUNDED
9. See "This order has been refunded successfully"

#### Scenario 2: DELIVERED Order (>7 days)
1. Go to My Orders → Click order
2. No "Request Return" button
3. See alert: "Cannot cancel delivered orders. Contact support."

### For Admins

#### Review Return Requests
1. Admin Dashboard → Click "Return Requests"
2. See table of all pending returns
3. View stats: Number of pending returns
4. See customer info, amount, days since delivery

#### Approve Return
1. Click approve icon (green checkmark)
2. Confirm dialog
3. System auto creates Stripe refund
4. Order removed from pending list
5. Status → RETURN_APPROVED → REFUND_PENDING

#### Reject Return
1. Click reject icon (red X)
2. Rejection dialog opens
3. Enter rejection reason (required)
4. Click "Reject Return"
5. Order removed from pending list
6. Status reverted to DELIVERED
7. Customer can see rejection reason

## Visual Design

### Color Scheme
- **Pending/Warning**: Yellow/Orange - return_requested, refund_pending
- **Info**: Blue - confirmed, processing, return_approved
- **Success**: Green - delivered, refunded
- **Error**: Red - cancelled

### Status Chips
All status chips use:
- Small size
- Appropriate color from theme
- Capitalized text

### Action Buttons
- **View**: Eye icon (default)
- **Approve**: Checkmark icon (green)
- **Reject**: X icon (red)
- All with tooltips

## Error Handling

### User-Side Errors
- No return button if >7 days
- Alert messages for non-returnable statuses
- Disabled buttons during processing

### Admin-Side Errors
- Confirm dialogs for destructive actions
- Required rejection reason
- Disabled buttons during processing
- Error alerts with specific messages

## Testing Checklist

### User Interface
- [ ] DELIVERED order shows "Request Return" button (within 7 days)
- [ ] DELIVERED order hides button (>7 days)
- [ ] Return request shows pending info box
- [ ] Return approved shows success alert
- [ ] Refund pending shows processing alert
- [ ] Refunded shows success alert

### Admin Interface
- [ ] Return requests page shows all return_requested orders
- [ ] Days since delivery chip shows correct color
- [ ] Approve button creates refund
- [ ] Reject button requires reason
- [ ] List refreshes after approve/reject
- [ ] View button navigates to order detail

### Integration
- [ ] User request → appears in admin list
- [ ] Admin approve → user sees updated status
- [ ] Admin reject → user sees revert to delivered
- [ ] Stripe webhook → final status update

## API Endpoints Used

### User Endpoints
```
POST /orders/{id}/cancel
- Used for DELIVERED → RETURN_REQUESTED
```

### Admin Endpoints
```
GET /admin/orders/returns/pending?page=1&size=20
- List all return_requested orders

POST /admin/orders/{id}/returns/approve
- Approve return and initiate refund

POST /admin/orders/{id}/returns/reject?rejection_reason=...
- Reject return request
```

## Next Steps

1. ✅ Frontend UI complete
2. ⏳ Test end-to-end flow
3. ⏳ Add email notifications (optional)
4. ⏳ Add return tracking history (optional)
5. ⏳ Monitor Stripe webhooks in production

---

**Implementation Date:** December 12, 2025  
**Developer:** Thang  
**Status:** Complete - Ready for Testing
