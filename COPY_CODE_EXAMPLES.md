# Copy Functionality - Code Examples

## Basic Usage

### In Your Component

```javascript
import React, { useRef } from 'react';
import { copyMatchCardWithScreenshot } from '../utils/matchCopy';

const MatchCard = ({ match }) => {
  const matchCardRef = useRef(null);

  const handleCopy = async (e) => {
    e.stopPropagation(); // Prevent card click event
    await copyMatchCardWithScreenshot(matchCardRef.current, match);
  };

  return (
    <div ref={matchCardRef} className="match-card">
      {/* Match card content */}
      <button onClick={handleCopy}>
        <i className="bi bi-copy" />
      </button>
    </div>
  );
};
```

## Advanced Usage

### With Loading State

```javascript
const MatchCard = ({ match }) => {
  const matchCardRef = useRef(null);
  const [copying, setCopying] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    setCopying(true);
    
    try {
      await copyMatchCardWithScreenshot(matchCardRef.current, match);
    } catch (error) {
      console.error('Copy failed:', error);
    } finally {
      setCopying(false);
    }
  };

  return (
    <div ref={matchCardRef} className="match-card">
      <button onClick={handleCopy} disabled={copying}>
        {copying ? (
          <i className="bi bi-hourglass-split" />
        ) : (
          <i className="bi bi-copy" />
        )}
      </button>
    </div>
  );
};
```

### With Analytics Tracking

```javascript
const handleCopy = async (e) => {
  e.stopPropagation();
  
  // Track copy attempt
  analytics.track('copy_match_card_clicked', {
    matchId: match._id,
    platform: navigator.platform,
    userAgent: navigator.userAgent
  });

  try {
    await copyMatchCardWithScreenshot(matchCardRef.current, match);
    
    // Track success
    analytics.track('copy_match_card_success', {
      matchId: match._id,
      method: 'screenshot'
    });
  } catch (error) {
    // Track failure
    analytics.track('copy_match_card_failed', {
      matchId: match._id,
      error: error.message
    });
  }
};
```

### With Custom Success Message

```javascript
import { showSuccess } from '../helpers/Toast';

const handleCopy = async (e) => {
  e.stopPropagation();
  
  try {
    await copyMatchCardWithScreenshot(matchCardRef.current, match);
    
    // Custom message based on platform
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      showSuccess('📸 Screenshot saved! Paste in Notes app');
    } else {
      showSuccess('✅ Ready to paste anywhere!');
    }
  } catch (error) {
    showError('❌ Copy failed. Please try again.');
  }
};
```

## Testing Examples

### Manual Browser Test

```javascript
// Open browser console and run:

// Test 1: Check clipboard API
console.log('Clipboard API:', !!navigator.clipboard);
console.log('ClipboardItem:', !!window.ClipboardItem);
console.log('html2canvas:', !!window.html2canvas);

// Test 2: Test text copy
navigator.clipboard.writeText('Test').then(
  () => console.log('✅ Text copy works'),
  (err) => console.log('❌ Text copy failed:', err)
);

// Test 3: Test image copy (requires user interaction)
// Click a button that runs this:
fetch('https://via.placeholder.com/150')
  .then(r => r.blob())
  .then(blob => {
    return navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);
  })
  .then(() => console.log('✅ Image copy works'))
  .catch(err => console.log('❌ Image copy failed:', err));
```

### Jest Unit Test

```javascript
import { copyMatchCardWithScreenshot } from '../utils/matchCopy';
import { showSuccess, showError } from '../helpers/Toast';

jest.mock('../helpers/Toast');

describe('copyMatchCardWithScreenshot', () => {
  const mockMatchData = {
    matchDate: '2024-01-15',
    slot: [{ slotTimes: [{ time: '10:00 AM', amount: 500 }] }],
    clubId: { clubName: 'Test Club' },
    skillLevel: 'intermediate'
  };

  beforeEach(() => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(() => Promise.resolve()),
        write: jest.fn(() => Promise.resolve())
      }
    });
    
    // Mock html2canvas
    window.html2canvas = jest.fn(() => 
      Promise.resolve({
        toBlob: (callback) => callback(new Blob(['test'], { type: 'image/png' }))
      })
    );
  });

  it('should copy match card successfully', async () => {
    const element = document.createElement('div');
    await copyMatchCardWithScreenshot(element, mockMatchData);
    
    expect(showSuccess).toHaveBeenCalled();
  });

  it('should fallback to text if screenshot fails', async () => {
    window.html2canvas = jest.fn(() => Promise.reject('Error'));
    
    const element = document.createElement('div');
    await copyMatchCardWithScreenshot(element, mockMatchData);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(showSuccess).toHaveBeenCalledWith(
      expect.stringContaining('details')
    );
  });
});
```

### React Testing Library Test

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MatchCard from './MatchCard';

describe('MatchCard Copy Functionality', () => {
  const mockMatch = {
    matchDate: '2024-01-15',
    slot: [{ slotTimes: [{ time: '10:00 AM', amount: 500 }] }],
    clubId: { clubName: 'Test Club' },
    skillLevel: 'intermediate'
  };

  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(() => Promise.resolve()),
        write: jest.fn(() => Promise.resolve())
      }
    });
  });

  it('should copy when copy button is clicked', async () => {
    render(<MatchCard match={mockMatch} />);
    
    const copyButton = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(navigator.clipboard.write).toHaveBeenCalled();
    });
  });

  it('should show loading state while copying', async () => {
    render(<MatchCard match={mockMatch} />);
    
    const copyButton = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(copyButton);
    
    expect(copyButton).toBeDisabled();
    
    await waitFor(() => {
      expect(copyButton).not.toBeDisabled();
    });
  });
});
```

### Cypress E2E Test

```javascript
describe('Match Card Copy', () => {
  beforeEach(() => {
    cy.visit('/open-matches');
    cy.wait(1000); // Wait for matches to load
  });

  it('should copy match card on desktop', () => {
    // Grant clipboard permission
    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, 'write').resolves();
    });

    // Click copy button
    cy.get('.match-card').first().find('[data-testid="copy-button"]').click();

    // Check success message
    cy.contains('copied').should('be.visible');
  });

  it('should copy match card on mobile', () => {
    cy.viewport('iphone-x');
    
    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, 'write').resolves();
    });

    cy.get('.match-card').first().find('[data-testid="copy-button"]').click();
    cy.contains('copied').should('be.visible');
  });
});
```

## Debugging Examples

### Add Debug Logging

```javascript
export const copyMatchCardWithScreenshot = async (matchCardElement, matchData) => {
  console.log('🔍 Copy started', {
    hasElement: !!matchCardElement,
    hasClipboard: !!navigator.clipboard,
    hasHtml2canvas: !!window.html2canvas,
    platform: navigator.platform,
    userAgent: navigator.userAgent
  });

  try {
    // ... existing code ...
    
    console.log('✅ Copy successful');
  } catch (error) {
    console.error('❌ Copy failed', {
      error: error.message,
      stack: error.stack
    });
  }
};
```

### Check Browser Capabilities

```javascript
const checkCopyCapabilities = () => {
  const capabilities = {
    clipboardAPI: !!navigator.clipboard,
    clipboardItem: !!window.ClipboardItem,
    html2canvas: !!window.html2canvas,
    writeText: !!navigator.clipboard?.writeText,
    write: !!navigator.clipboard?.write,
    isSecureContext: window.isSecureContext,
    isHTTPS: window.location.protocol === 'https:',
    platform: navigator.platform,
    userAgent: navigator.userAgent
  };

  console.table(capabilities);
  return capabilities;
};

// Run in console
checkCopyCapabilities();
```

### Monitor Copy Performance

```javascript
const handleCopy = async (e) => {
  e.stopPropagation();
  
  const startTime = performance.now();
  
  try {
    await copyMatchCardWithScreenshot(matchCardRef.current, match);
    
    const duration = performance.now() - startTime;
    console.log(`✅ Copy completed in ${duration.toFixed(2)}ms`);
    
    // Track performance
    if (duration > 1000) {
      console.warn('⚠️ Copy took longer than 1 second');
    }
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`❌ Copy failed after ${duration.toFixed(2)}ms`);
  }
};
```

## Integration Examples

### With Share API

```javascript
const handleShare = async (e) => {
  e.stopPropagation();
  
  // Try native share first (mobile)
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Padel Match',
        text: `Check out this match on ${formatMatchDate(match.matchDate)}`,
        url: window.location.href
      });
      return;
    } catch (err) {
      console.log('Share cancelled or failed:', err);
    }
  }
  
  // Fallback to copy
  await copyMatchCardWithScreenshot(matchCardRef.current, match);
};
```

### With Download Option

```javascript
const handleCopyOrDownload = async (e) => {
  e.stopPropagation();
  
  try {
    // Try copy first
    await copyMatchCardWithScreenshot(matchCardRef.current, match);
  } catch (error) {
    // Fallback to download
    const canvas = await window.html2canvas(matchCardRef.current);
    const link = document.createElement('a');
    link.download = `match-${match._id}.png`;
    link.href = canvas.toDataURL();
    link.click();
    showSuccess('Match card downloaded!');
  }
};
```

### With QR Code

```javascript
import QRCode from 'qrcode';

const handleCopyWithQR = async (e) => {
  e.stopPropagation();
  
  // Generate QR code
  const qrDataUrl = await QRCode.toDataURL(window.location.href);
  
  // Add QR to card temporarily
  const qrImg = document.createElement('img');
  qrImg.src = qrDataUrl;
  qrImg.style.position = 'absolute';
  qrImg.style.bottom = '10px';
  qrImg.style.right = '10px';
  qrImg.style.width = '80px';
  matchCardRef.current.appendChild(qrImg);
  
  // Copy with QR
  await copyMatchCardWithScreenshot(matchCardRef.current, match);
  
  // Remove QR
  matchCardRef.current.removeChild(qrImg);
};
```

## Error Handling Examples

### Comprehensive Error Handling

```javascript
const handleCopy = async (e) => {
  e.stopPropagation();
  
  try {
    await copyMatchCardWithScreenshot(matchCardRef.current, match);
  } catch (error) {
    // Specific error handling
    if (error.name === 'NotAllowedError') {
      showError('Please allow clipboard access in your browser settings');
    } else if (error.name === 'SecurityError') {
      showError('Clipboard access is not allowed on this page');
    } else if (error.message.includes('html2canvas')) {
      showError('Screenshot failed. Copying text details instead.');
      // Fallback to text
      const text = formatMatchText(match);
      await navigator.clipboard.writeText(text);
    } else {
      showError('Copy failed. Please try again.');
    }
    
    // Log for debugging
    console.error('Copy error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }
};
```

### Retry Logic

```javascript
const copyWithRetry = async (element, data, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await copyMatchCardWithScreenshot(element, data);
      return; // Success
    } catch (error) {
      console.warn(`Copy attempt ${i + 1} failed:`, error);
      
      if (i === maxRetries - 1) {
        throw error; // Last attempt failed
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
};
```

## Custom Implementations

### Copy Multiple Matches

```javascript
const copyMultipleMatches = async (matches) => {
  const matchTexts = matches.map(match => 
    `Match: ${formatMatchDate(match.matchDate)} | ${formatTimes(match.slot)}\n` +
    `Club: ${match.clubId.clubName}\n` +
    `Level: ${match.skillLevel}\n` +
    `Price: ₹${calculateMatchPrice(match.slot)}\n`
  ).join('\n---\n\n');

  try {
    await navigator.clipboard.writeText(matchTexts);
    showSuccess(`${matches.length} matches copied!`);
  } catch (error) {
    showError('Could not copy matches');
  }
};
```

### Copy as Markdown

```javascript
const copyAsMarkdown = async (match) => {
  const markdown = `
# Padel Match

**Date:** ${formatMatchDate(match.matchDate)}  
**Time:** ${formatTimes(match.slot)}  
**Club:** ${match.clubId.clubName}  
**Level:** ${match.skillLevel}  
**Price:** ₹${calculateMatchPrice(match.slot)}  

[View Match](${window.location.href})
  `.trim();

  try {
    await navigator.clipboard.writeText(markdown);
    showSuccess('Match details copied as Markdown!');
  } catch (error) {
    showError('Could not copy');
  }
};
```

### Copy as JSON

```javascript
const copyAsJSON = async (match) => {
  const json = JSON.stringify({
    date: match.matchDate,
    time: formatTimes(match.slot),
    club: match.clubId.clubName,
    level: match.skillLevel,
    price: calculateMatchPrice(match.slot),
    url: window.location.href
  }, null, 2);

  try {
    await navigator.clipboard.writeText(json);
    showSuccess('Match data copied as JSON!');
  } catch (error) {
    showError('Could not copy');
  }
};
```
