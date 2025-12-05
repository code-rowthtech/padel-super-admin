# Copy Functionality Flow Diagram

## Overall Flow

```
User Clicks Copy Button
         |
         v
    Check Platform
         |
    ┌────┴────┐
    |         |
Desktop    Mobile
    |         |
    |    ┌────┴────┐
    |    |         |
    |  iOS/Safari Android
    |    |         |
    v    v         v
```

## Detailed Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    User Clicks Copy Button                   │
└────────────────────────────┬────────────────────────────────┘
                             │
                             v
┌─────────────────────────────────────────────────────────────┐
│              Check if Clipboard API Available                │
└────────────────────────────┬────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                   YES               NO
                    │                 │
                    v                 v
         ┌──────────────────┐  ┌──────────────────┐
         │ Try Screenshot   │  │ Legacy Fallback  │
         │  (html2canvas)   │  │  (execCommand)   │
         └────────┬─────────┘  └────────┬─────────┘
                  │                     │
         ┌────────┴────────┐            │
         │                 │            │
      SUCCESS           FAIL            │
         │                 │            │
         v                 v            v
┌─────────────────┐ ┌──────────────────────────────┐
│ Detect Platform │ │   Copy Text Details Only     │
└────────┬────────┘ └──────────────┬───────────────┘
         │                         │
    ┌────┴────┐                    │
    │         │                    │
Desktop    iOS/Safari              │
    │         │                    │
    v         v                    v
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  DESKTOP:                                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Try: ClipboardItem with image/png + text/plain       │   │
│  │  ├─ Success → "Screenshot and details copied!"       │   │
│  │  └─ Fail → Try image only → Try text only            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  iOS/SAFARI:                                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Try: ClipboardItem with image/png only               │   │
│  │  ├─ Success → Copy URL separately after 100ms        │   │
│  │  │           → "Screenshot copied! Tap to copy link." │   │
│  │  └─ Fail → Try text only                             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ANDROID:                                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Try: ClipboardItem with image/png + text/plain       │   │
│  │  ├─ Success → "Screenshot copied!"                   │   │
│  │  └─ Fail → Try image only → Try text only            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                             │
                             v
┌─────────────────────────────────────────────────────────────┐
│                    Show Success Message                       │
│                           OR                                  │
│                    Show Error Message                         │
└─────────────────────────────────────────────────────────────┘
```

## Platform Detection Logic

```
┌─────────────────────────────────────────────────────────────┐
│                    Check User Agent                           │
└────────────────────────────┬────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
              /iPad|iPhone|iPod/   Other
                    │                 │
                    v                 v
              ┌──────────┐      ┌──────────┐
              │   iOS    │      │ Desktop/ │
              │  Safari  │      │ Android  │
              └──────────┘      └──────────┘
                    │                 │
                    v                 v
         Copy image first,    Copy image + text
         then URL separate         together
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Try Primary Method                         │
└────────────────────────────┬────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                SUCCESS             FAIL
                    │                 │
                    v                 v
         ┌──────────────────┐  ┌──────────────────┐
         │ Show Success Msg │  │ Try Fallback #1  │
         └──────────────────┘  └────────┬─────────┘
                                        │
                               ┌────────┴────────┐
                               │                 │
                           SUCCESS             FAIL
                               │                 │
                               v                 v
                    ┌──────────────────┐  ┌──────────────────┐
                    │ Show Success Msg │  │ Try Fallback #2  │
                    └──────────────────┘  └────────┬─────────┘
                                                   │
                                          ┌────────┴────────┐
                                          │                 │
                                      SUCCESS             FAIL
                                          │                 │
                                          v                 v
                               ┌──────────────────┐  ┌──────────────────┐
                               │ Show Success Msg │  │ Show Error Msg   │
                               └──────────────────┘  └──────────────────┘
```

## Screenshot Capture Process

```
┌─────────────────────────────────────────────────────────────┐
│              Get Match Card DOM Element                       │
└────────────────────────────┬────────────────────────────────┘
                             │
                             v
┌─────────────────────────────────────────────────────────────┐
│         html2canvas(element, options)                         │
│         - backgroundColor: '#ffffff'                          │
│         - scale: 2 (high quality)                             │
│         - useCORS: true                                       │
│         - allowTaint: true                                    │
└────────────────────────────┬────────────────────────────────┘
                             │
                             v
┌─────────────────────────────────────────────────────────────┐
│              Convert Canvas to Blob                           │
│              canvas.toBlob(callback, 'image/png', 0.95)       │
└────────────────────────────┬────────────────────────────────┘
                             │
                             v
┌─────────────────────────────────────────────────────────────┐
│              Create ClipboardItem                             │
│              new ClipboardItem({ 'image/png': blob })         │
└────────────────────────────┬────────────────────────────────┘
                             │
                             v
┌─────────────────────────────────────────────────────────────┐
│              Write to Clipboard                               │
│              navigator.clipboard.write([clipboardItem])       │
└─────────────────────────────────────────────────────────────┘
```

## Legacy Fallback Process

```
┌─────────────────────────────────────────────────────────────┐
│              Create Hidden Textarea                           │
│              - position: fixed                                │
│              - left: -999999px                                │
│              - value: matchText                               │
└────────────────────────────┬────────────────────────────────┘
                             │
                             v
┌─────────────────────────────────────────────────────────────┐
│              Append to Document Body                          │
└────────────────────────────┬────────────────────────────────┘
                             │
                             v
┌─────────────────────────────────────────────────────────────┐
│              Focus and Select Text                            │
│              textarea.focus()                                 │
│              textarea.select()                                │
└────────────────────────────┬────────────────────────────────┘
                             │
                             v
┌─────────────────────────────────────────────────────────────┐
│              Execute Copy Command                             │
│              document.execCommand('copy')                     │
└────────────────────────────┬────────────────────────────────┘
                             │
                             v
┌─────────────────────────────────────────────────────────────┐
│              Remove Textarea from DOM                         │
│              document.body.removeChild(textarea)              │
└─────────────────────────────────────────────────────────────┘
```

## Success Message Decision Tree

```
                    Platform Check
                         │
        ┌────────────────┼────────────────┐
        │                │                │
    Desktop          iOS/Safari        Android
        │                │                │
        v                v                v
Screenshot + Text   Screenshot Only   Screenshot + Text
        │                │                │
        v                v                v
"Screenshot and    "Screenshot copied!  "Screenshot
 details copied!"   Tap to copy link."   copied!"
```

## Browser Compatibility Check

```
┌─────────────────────────────────────────────────────────────┐
│              Check Browser Capabilities                       │
└────────────────────────────┬────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
              Modern Browser    Old Browser
                    │                 │
                    v                 v
         ┌──────────────────┐  ┌──────────────────┐
         │ navigator.clipboard│ │ execCommand      │
         │ ClipboardItem    │  │ (legacy)         │
         │ html2canvas      │  │                  │
         └────────┬─────────┘  └────────┬─────────┘
                  │                     │
                  v                     v
         Full Functionality    Text Only Fallback
```

## Data Flow

```
Match Data Object
      │
      v
┌─────────────────────────────────────────────────────────────┐
│  matchData = {                                                │
│    matchDate: "2024-01-15",                                   │
│    slot: [{ slotTimes: [{ time: "10:00 AM", amount: 500 }]}],│
│    clubId: { clubName: "Club Name" },                         │
│    skillLevel: "intermediate"                                 │
│  }                                                            │
└────────────────────────────┬────────────────────────────────┘
                             │
                             v
┌─────────────────────────────────────────────────────────────┐
│              Format Match Details Text                        │
│  "Match Details:                                              │
│   Date: 15 Jan                                                │
│   Time: 10-11AM                                               │
│   Club: Club Name                                             │
│   Level: Intermediate                                         │
│   Price: ₹500                                                 │
│   Link: https://..."                                          │
└────────────────────────────┬────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
              Screenshot          Text Only
                    │                 │
                    v                 v
         ┌──────────────────┐  ┌──────────────────┐
         │ Image + Text     │  │ Text Details     │
         │ to Clipboard     │  │ to Clipboard     │
         └──────────────────┘  └──────────────────┘
```

## Timeline (Typical Execution)

```
0ms    │ User clicks copy button
       │
10ms   │ Check platform and capabilities
       │
20ms   │ Start html2canvas capture
       │
200ms  │ Canvas rendering complete
       │
250ms  │ Convert to blob
       │
300ms  │ Create ClipboardItem
       │
350ms  │ Write to clipboard
       │
400ms  │ Show success message
       │
       v (iOS only)
500ms  │ Copy URL separately
```

## Memory Management

```
┌─────────────────────────────────────────────────────────────┐
│              Create Canvas (html2canvas)                      │
│              Memory: ~2-5MB                                   │
└────────────────────────────┬────────────────────────────────┘
                             │
                             v
┌─────────────────────────────────────────────────────────────┐
│              Convert to Blob                                  │
│              Memory: ~1-3MB                                   │
└────────────────────────────┬────────────────────────────────┘
                             │
                             v
┌─────────────────────────────────────────────────────────────┐
│              Copy to Clipboard                                │
│              (Browser manages memory)                         │
└────────────────────────────┬────────────────────────────────┘
                             │
                             v
┌─────────────────────────────────────────────────────────────┐
│              Automatic Cleanup                                │
│              - Canvas garbage collected                       │
│              - Blob released by browser                       │
│              - No memory leaks                                │
└─────────────────────────────────────────────────────────────┘
```
