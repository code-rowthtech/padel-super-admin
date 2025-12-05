# Copy Functionality - Quick Reference

## ✅ What Works Where

```
Desktop Chrome/Edge/Firefox  → Screenshot + Details ✅
Desktop Safari (macOS)       → Screenshot + Details ✅
iPhone/iPad Safari           → Screenshot ✅ (URL separate)
Android Chrome/Samsung       → Screenshot + Details ✅
Older Browsers              → Text Details Only ✅
```

## 🚀 Usage

```javascript
import { copyMatchCardWithScreenshot } from '../utils/matchCopy';

// In your component
const handleCopy = async (e) => {
  e.stopPropagation();
  const matchCardElement = matchCardRef.current;
  await copyMatchCardWithScreenshot(matchCardElement, matchData);
};
```

## 📱 Platform-Specific Behavior

### Desktop (Chrome/Firefox/Edge/Safari)
- **Copies**: Screenshot image + match details
- **Paste**: Works in Word, Slack, Notes, etc.
- **Message**: "Screenshot and details copied!"

### iOS Safari (iPhone/iPad)
- **Copies**: Screenshot first, then URL
- **Paste**: Image in Notes, URL on second paste
- **Message**: "Screenshot copied! Tap to copy link."

### Android (Chrome/Samsung/Firefox)
- **Copies**: Screenshot image + details
- **Paste**: Works in WhatsApp, Messages, etc.
- **Message**: "Screenshot copied!"

### Fallback (All Browsers)
- **Copies**: Text details + URL
- **Paste**: Text in any app
- **Message**: "Match details copied!"

## 🔧 Requirements

### Browser Versions (Minimum)
- Chrome: 76+ (2019)
- Firefox: 87+ (2021)
- Safari: 13.1+ (2020)
- iOS Safari: 13.4+ (2020)
- Edge: 79+ (2020)

### Dependencies
```json
{
  "html2canvas": "^1.4.1"  // Already in package.json
}
```

### HTML
```html
<!-- Already in public/index.html -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Nothing copies on iOS | Use HTTPS, ensure user tap triggered it |
| Blank screenshot | Check CORS, ensure element is visible |
| Only text copies | Expected fallback, screenshot failed |
| "Could not copy" error | Check browser version, try HTTPS |

## 🧪 Quick Test

```javascript
// Test in browser console
navigator.clipboard.writeText('test').then(
  () => console.log('✅ Clipboard works'),
  () => console.log('❌ Clipboard blocked')
);
```

## 📊 Success Messages

```javascript
// Desktop
"Screenshot and details copied!"

// iOS
"Screenshot copied! Tap to copy link."

// Fallback
"Match details copied!"

// Error
"Could not copy. Please try again."
```

## 🔒 Security Notes

- ✅ Requires HTTPS on mobile
- ✅ Must be user-initiated (click/tap)
- ✅ No permissions needed
- ✅ Works in incognito mode

## 📝 Match Data Format

```javascript
const matchData = {
  matchDate: "2024-01-15",
  slot: [{ slotTimes: [{ time: "10:00 AM", amount: 500 }] }],
  clubId: { clubName: "Club Name" },
  skillLevel: "intermediate"
};
```

## 🎯 Fallback Chain

```
1. Screenshot + Details (Desktop) ✅
   ↓ fails
2. Screenshot Only (iOS) ✅
   ↓ fails
3. Text Details (Clipboard API) ✅
   ↓ fails
4. Text Details (Legacy) ✅
   ↓ fails
5. Error Message ❌
```

## 💡 Tips

- Always wrap in try-catch
- Use `e.stopPropagation()` to prevent card click
- Test on real devices, not just simulators
- Check console for warnings
- Ensure HTTPS in production

## 📚 Documentation

- Full guide: [COPY_IMPROVEMENTS.md](./COPY_IMPROVEMENTS.md)
- Testing: [COPY_TESTING_GUIDE.md](./COPY_TESTING_GUIDE.md)
- Platform support: [CROSS_PLATFORM_COPY.md](./CROSS_PLATFORM_COPY.md)
