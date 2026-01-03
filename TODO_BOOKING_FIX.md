# Booking Slot Selection Fix - TODO

## Issue
90-minute slot selection has incorrect behavior:
1. Clicking on half-selected preview slots doesn't work correctly
2. When clicking on first slot then second slot's right half, left should unselect and right should select
3. When clicking on already selected first slot, both should unselect
4. When clicking on a new third slot, previous selections should clear and 3rd + 4th half should be selected

## Fix Plan
1. Add helper function to check if a slot is half-selected
2. Fix deselection logic for 90min duration
3. Add proper handling for clicking on half-selected preview slots
4. Ensure new slot selection clears previous half-selections
5. Update the click handler to properly detect and handle all cases

## Changes to Make
- Update `toggleTime` function in Booking.js
- Add `isSlotHalfSelected` helper function
- Fix 90min deselection and selection logic

## Status
- [x] Implement fix for 90min slot selection
- [ ] Test the fix

## Changes Made

### Added helper function:
```javascript
const isSlotHalfSelected = (slotTime, courtId, dateKey) => {
  // Checks if a slot is half-selected for 90min
}
```

### Fixed toggleTime function for 90min:
1. **Clicking on first selected slot** → unselect both (first + preview)
2. **Clicking on left half of second slot** → if left already selected → unselect both, else → switch to left
3. **Clicking on right half of second slot** → if right already selected → unselect both, else → switch to right
4. **Clicking on a new slot** → clears previous half-selections and selects new slot + auto half-selects next

