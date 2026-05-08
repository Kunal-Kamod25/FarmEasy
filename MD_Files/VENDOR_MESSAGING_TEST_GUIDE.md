# Vendor Messaging System - Test Guide

## System Overview
Vendors can now communicate with customers directly from their vendor dashboard. The system allows:
- ✅ See all conversations with customers
- ✅ Send and receive messages
- ✅ Track unread message count
- ✅ Search conversations by customer name
- ✅ Real-time message polling (3-second refresh)

---

## Files Created/Modified

### Backend
1. **backend/routes/vendorRoutes.js**
   - Added messaging routes:
     - `GET /api/vendor/messages/conversations` - Get all conversations
     - `GET /api/vendor/messages/conversation/:conversationId` - Get messages in conversation
     - `POST /api/vendor/messages/send` - Send a message
     - `PUT /api/vendor/messages/:messageId/read` - Mark as read

2. **backend/controllers/messageController.js** (already exists)
   - Used existing methods: `getConversations`, `getMessages`, `sendMessage`, `markAsRead`

### Frontend
1. **frontend/src/components/Vendor/VendorMessages.jsx** (NEW)
   - Full vendor messaging UI component
   - Conversations list (left panel)
   - Message thread view (right panel)
   - Search functionality
   - Real-time message polling

2. **frontend/src/routes/AppRoutes.jsx**
   - Added VendorMessages import
   - Added `/vendor/messages` route

3. **frontend/src/components/Vendor/VendorSidebar.jsx**
   - Added MessageCircle icon
   - Added Messages navigation link

---

## Step-by-Step Test Guide

### Test 1: Access Vendor Messages
**Steps:**
1. Login as a vendor (use vendor account)
2. Go to vendor dashboard
3. Click **"Messages"** in the left sidebar
4. Should see messages panel with conversations list on left side

**Expected Result:** ✅ Messages page loads with empty conversations or existing conversations

---

### Test 2: Send and Receive Messages
**Prerequisites:** You need a customer who has/can place an order from the vendor

**Steps:**
1. As a customer, place an order for a vendor's product
2. Login as that vendor
3. Go to vendor dashboard → Messages
4. You should see the customer in conversations list
5. Click on the conversation
6. Type a message: "Hi, thanks for ordering!"
7. Press **Send** button or Enter
8. Message appears in the chat thread on right

**Expected Result:** ✅ Message appears immediately in thread with timestamp

---

### Test 3: Search Conversations
**Prerequisites:** Have multiple conversations active

**Steps:**
1. Go to vendor messages
2. In the search box, type customer name (e.g., "Kunal" or "Customer")
3. Conversations list filters in real-time
4. Clear search to see all again

**Expected Result:** ✅ Conversations filter correctly as you type

---

### Test 4: Unread Message Indicator
**Prerequisites:** Have incoming messages

**Steps:**
1. As a customer, go to vendor's product detail page
2. Open the chat/messaging feature
3. Send a message to the vendor
4. Without marking as read, logout
5. Login as the vendor
6. Go to Messages
7. Each unread message should show a counter badge

**Expected Result:** ✅ Blue badge with unread count appears on conversation

---

### Test 5: Mark as Read
**Prerequisites:** Have unread messages

**Steps:**
1. Go to vendor messages
2. See a conversation with unread count badge
3. Click on that conversation
4. Messages automatically mark as read
5. Unread badge count should decrease or disappear

**Expected Result:** ✅ Unread count resets when conversation is opened

---

### Test 6: Real-time Message Polling
**Prerequisites:** Two browsers/devices logged in (customer and vendor)

**Steps:**
1. Open vendor messages in one browser
2. In another browser/incognito, login as customer
3. Send a message to the vendor
4. Wait up to 3 seconds
5. Vendor's messages page should refresh automatically
6. New message should appear

**Expected Result:** ✅ Messages appear within 3 seconds without page refresh

---

### Test 7: Mobile Responsiveness
**Steps:**
1. Go to vendor messages
2. Resize browser to mobile size (< 768px)
3. Click on conversation
4. Conversations list should hide, only message thread shows
5. Click back arrow at top to return to conversations
6. Resize back to desktop

**Expected Result:** ✅ Layout switches between mobile/desktop properly

---

### Test 8: Error Handling
**Steps:**
1. Go to vendor messages
2. Unplug internet OR open DevTools Network tab and set to offline
3. Try to send a message
4. Should see error toast at bottom right

**Expected Result:** ✅ Error message appears (e.g., "Failed to send message")

---

## API Testing with Postman

### Route 1: Get All Conversations
```
GET /api/vendor/messages/conversations
Headers:
  Authorization: Bearer {vendor_token}
  
Response:
{
  "success": true,
  "data": {
    "conversations": [
      {
        "conversation_id": "conv_123",
        "other_user_id": 5,
        "other_user_name": "John Farmer",
        "other_user_pic": "/path/to/pic.jpg",
        "last_message": "Thanks for quick delivery!",
        "last_message_time": "2026-04-08T10:30:00Z",
        "unread_count": 2
      }
    ],
    "unread_count": 2,
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

### Route 2: Get Messages in Conversation
```
GET /api/vendor/messages/conversation/{conversationId}
Headers:
  Authorization: Bearer {vendor_token}
  
Response:
{
  "success": true,
  "data": {
    "conversation_id": "conv_123",
    "messages": [
      {
        "id": 1,
        "conversation_id": "conv_123",
        "sender_id": 5,
        "receiver_id": 3,
        "message_text": "Hi, I received the seeds. Great quality!",
        "is_read": true,
        "created_at": "2026-04-08T10:15:00Z"
      }
    ]
  }
}
```

### Route 3: Send Message
```
POST /api/vendor/messages/send
Headers:
  Authorization: Bearer {vendor_token}
  Content-Type: application/json
  
Body:
{
  "conversation_id": "conv_123",
  "message_text": "Thanks for the order!",
  "receiver_id": 5
}

Response:
{
  "success": true,
  "data": {
    "message": {
      "id": 2,
      "conversation_id": "conv_123",
      "sender_id": 3,
      "receiver_id": 5,
      "message_text": "Thanks for the order!",
      "is_read": false,
      "created_at": "2026-04-08T10:30:00Z"
    }
  }
}
```

### Route 4: Mark Message as Read
```
PUT /api/vendor/messages/{messageId}/read
Headers:
  Authorization: Bearer {vendor_token}
  
Response:
{
  "success": true,
  "message": "Message marked as read"
}
```

---

## Check Points ✓

- [ ] Vendor sidebar shows "Messages" link
- [ ] Clicking Messages navigates to `/vendor/messages`
- [ ] Conversations list loads from API
- [ ] Can search conversations by customer name
- [ ] Can click conversation and see message thread
- [ ] Can type and send messages
- [ ] Messages appear immediately in thread
- [ ] Unread count badge shows correctly
- [ ] Open conversation marks messages as read
- [ ] New messages auto-refresh every 3 seconds
- [ ] Mobile view collapses conversations on message view
- [ ] Error toasts appear on API failures
- [ ] API endpoints work in Postman

---

## Common Issues & Solutions

### Issue: Conversations not loading
**Solution:**
- Check backend logs: `npm start` in backend folder
- Verify JWT token is valid: Check localStorage in browser DevTools
- Check messageController methods exist: `getConversations`, `getMessages`, `sendMessage`

### Issue: Messages not sending
**Solution:**
- Check receiver_id is correctly passed
- Verify conversation_id format matches database
- Check SMTP/email not causing issues (look for errors in backend console)

### Issue: Messages not refreshing
**Solution:**
- Check browser console for JavaScript errors
- Verify API URL is correct in config.js (should be http://localhost:5000)
- Look for CORS errors in browser Network tab

### Issue: Styling looks broken
**Solution:**
- Clear browser cache: Ctrl+Shift+R (hard refresh)
- Rebuild Tailwind CSS if needed
- Check Tailwind config in frontend/tailwind.config.js

---

## Success Criteria

✅ All tests pass above
✅ Vendors can see conversations with customers
✅ Vendors can send/receive messages
✅ Messages appear in real-time or within 3 seconds
✅ Unread counts work correctly
✅ Mobile layout works properly
✅ Error handling works (no blank screens on errors)

---

## Next Steps

After testing:
1. Add notification badge to sidebar "Messages" link when unread exists
2. Add sound notification when new message arrives
3. Implement WebSocket for instant messaging (instead of polling)
4. Add message read receipts (✓ seen)
5. Add typing indicators
6. Allow file/image sharing in messages
