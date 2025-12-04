# Copy Functionality Testing Guide

## Quick Test Checklist

### Desktop Testing
- [ ] Chrome/Edge (Windows/Mac/Linux)
- [ ] Firefox (Windows/Mac/Linux)
- [ ] Safari (macOS only)

### Mobile Testing
- [ ] iOS Safari (iPhone/iPad)
- [ ] Chrome Mobile (Android)
- [ ] Samsung Internet (Android)
- [ ] Firefox Mobile (Android/iOS)

## Testing Steps

### 1. Desktop Browsers

**Chrome/Edge/Firefox:**
1. Click the copy button on any match card
2. Open any app (Word, Notes, Slack, etc.)
3. Press Ctrl+V (Windows/Linux) or Cmd+V (Mac)
4. **Expected**: Screenshot image appears with match details

**Safari (macOS):**
1. Click the copy button on any match card
2. Open Notes or Pages
3. Press Cmd+V
4. **Expected**: Screenshot image appears

### 2. iOS Safari (iPhone/iPad)

**Test 1: Screenshot Copy**
1. Tap the copy button
2. Open Notes app
3. Long press and tap "Paste"
4. **Expected**: Screenshot image appears
5. **Note**: URL is copied separately after image

**Test 2: Share Functionality**
1. Tap the share button
2. Select WhatsApp/Instagram/Messages
3. **Expected**: Native share sheet opens with URL

### 3. Android Browsers

**Chrome/Samsung Internet:**
1. Tap the copy button
2. Open any messaging app
3. Long press and tap "Paste"
4. **Expected**: Screenshot image with details

**Firefox Mobile:**
1. Tap the copy button
2. Open any app
3. Long press and tap "Paste"
4. **Expected**: Screenshot or text details

## Expected Behavior by Platform

### ✅ Desktop (Chrome/Edge/Firefox)
- Screenshot + match details copied together
- Paste works in all apps
- Success message: "Screenshot and details copied!"

### ✅ Desktop Safari (macOS)
- Screenshot + match details copied
- Works in native macOS apps
- Success message: "Screenshot and details copied!"

### ✅ iOS Safari
- Screenshot copied first
- URL copied separately (automatic)
- Success message: "Screenshot copied! Tap to copy link."
- May require second paste for URL

### ✅ Android Chrome/Samsung
- Screenshot + match details copied together
- Works in all apps
- Success message: "Screenshot copied!"

### ⚠️ Fallback Scenarios
- If screenshot fails: Text details copied
- If clipboard unavailable: Legacy copy method used
- Success message: "Match details copied!"

## Common Issues & Solutions

### Issue: "Could not copy to clipboard"
**Cause**: Browser security restrictions or no user interaction
**Solution**: Ensure copy is triggered by user click/tap

### Issue: Nothing pastes on iOS
**Cause**: iOS clipboard restrictions
**Solution**: 
1. Try pasting in Notes app first
2. Ensure you're tapping (not clicking if using simulator)
3. Check iOS version (requires iOS 13+)

### Issue: Only text pastes, no image
**Cause**: html2canvas failed or browser doesn't support ClipboardItem
**Solution**: This is expected fallback behavior - text details still work

### Issue: Works on desktop but not mobile
**Cause**: Mobile browsers have stricter clipboard policies
**Solution**: Ensure HTTPS is used (required for clipboard API on mobile)

## Browser Requirements

### Minimum Versions
- **Chrome**: 76+ (2019)
- **Firefox**: 87+ (2021)
- **Safari**: 13.1+ (2020)
- **Edge**: 79+ (2020)
- **iOS Safari**: 13.4+ (2020)
- **Chrome Android**: 84+ (2020)

### Required Features
- Clipboard API (navigator.clipboard)
- ClipboardItem support
- Blob support
- Canvas API (for screenshots)

## Testing in Different Scenarios

### 1. HTTPS vs HTTP
- ✅ HTTPS: Full functionality
- ⚠️ HTTP: May fall back to text-only (browser security)

### 2. Incognito/Private Mode
- ✅ Should work normally
- ⚠️ Some browsers may restrict clipboard in private mode

### 3. Cross-Origin
- ✅ Same origin: Full functionality
- ⚠️ Cross-origin: May need CORS headers for images

### 4. PWA/Installed App
- ✅ Should work like native app
- ✅ May have better clipboard access

## Debugging Tips

### Check Browser Console
```javascript
// Test clipboard API availability
console.log('Clipboard API:', !!navigator.clipboard);
console.log('ClipboardItem:', !!window.ClipboardItem);
console.log('html2canvas:', !!window.html2canvas);

// Test iOS detection
console.log('Is iOS:', /iPad|iPhone|iPod/.test(navigator.userAgent));
console.log('Is Safari:', /^((?!chrome|android).)*safari/i.test(navigator.userAgent));
```

### Test Copy Manually
```javascript
// In browser console
const testCopy = async () => {
  try {
    await navigator.clipboard.writeText('Test');
    console.log('✅ Text copy works');
  } catch (e) {
    console.error('❌ Text copy failed:', e);
  }
};
testCopy();
```

## Success Criteria

### Must Work
- ✅ Desktop Chrome/Edge/Firefox: Screenshot + details
- ✅ iOS Safari: Screenshot (image paste works)
- ✅ Android Chrome: Screenshot + details
- ✅ All platforms: Text fallback if screenshot fails

### Nice to Have
- ✅ Safari desktop: Screenshot + details
- ✅ Firefox mobile: Screenshot + details
- ✅ Older browsers: Text-only fallback

## Reporting Issues

When reporting copy issues, include:
1. Device (iPhone 13, Samsung S21, etc.)
2. OS version (iOS 16.5, Android 13, etc.)
3. Browser and version (Safari 16.5, Chrome 120, etc.)
4. What was copied (screenshot, text, nothing)
5. Where you tried to paste (Notes, WhatsApp, etc.)
6. Console errors (if any)
7. Whether you're on HTTPS or HTTP
