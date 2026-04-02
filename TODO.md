# Flight Booking - Update MyTickets Tabs Task

## Task: Change MyTickets tabs to "Tất cả, Hoạt động, Đã checkin, Chờ hoàn, Đã hoàn"

**Status: [IN PROGRESS]**

### Steps (0/6 completed):

- [ ] **Step 1:** Create this TODO.md ✅
- [ ] **Step 2:** Update FILTER_TABS array in `Frontend/my-app/src/components/Myticker.jsx` to new 5 tabs
- [ ] **Step 3:** Extend STATUS_CONFIG object with new statuses: checked_in, pending_refund, refunded  
- [ ] **Step 4:** Update normalizeStatus function to map API statuses: CHECKED_IN→'checked_in', refund statuses→'pending_refund'/'refunded'
- [ ] **Step 5:** Adjust action buttons: hide "Check-in" for checked_in/refunded statuses
- [ ] **Step 6:** Test filtering/counts with API data, verify UI, attempt_completion

### Files to edit:
- `Frontend/my-app/src/components/Myticker.jsx` (all changes)

### Notes:
- API statuses: ACTIVE→active (Hoạt động), CHECKED_IN→checked_in (Đã checkin)
- Assume: PENDING_REFUND→Chờ hoàn, REFUNDED→Đã hoàn (adjust if different statuses appear)
- CSS unchanged - supports dynamic tabs perfectly
- No backend changes needed

**Next: Step 2 - Edit FILTER_TABS**
