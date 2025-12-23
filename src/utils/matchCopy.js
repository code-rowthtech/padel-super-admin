import { showSuccess, showError } from '../helpers/Toast';

// Create and show preview modal
const showScreenshotPreview = (canvas, matchText, onCopy) => {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    padding: 20px;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 20px;
    max-width: 90%;
    max-height: 90%;
    overflow: auto;
    text-align: center;
  `;

  const img = document.createElement('img');
  img.src = canvas.toDataURL('image/png', 0.95);
  img.style.cssText = `
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin-bottom: 15px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;

  const title = document.createElement('h3');
  title.textContent = 'Screenshot Preview';
  title.style.cssText = `
    margin: 0 0 15px 0;
    color: #333;
    font-family: 'Poppins', sans-serif;
    font-size: 18px;
  `;

  const textPreview = document.createElement('pre');
  textPreview.textContent = matchText;
  textPreview.style.cssText = `
    background: #f8f9fa;
    padding: 12px;
    border-radius: 8px;
    text-align: left;
    font-size: 14px;
    white-space: pre-wrap;
    margin: 15px 0;
    max-height: 200px;
    overflow: auto;
  `;

  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 10px;
  `;

  const copyBtn = document.createElement('button');
  copyBtn.textContent = 'Copy Image + Details';
  copyBtn.style.cssText = `
    background: linear-gradient(180deg, #0034E4 0%, #001B76 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 15px;
  `;

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.style.cssText = `
    background: #f0f0f0;
    color: #333;
    border: 1px solid #ddd;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    font-size: 15px;
  `;

  copyBtn.onclick = () => {
    document.body.removeChild(modal);
    onCopy();
  };

  cancelBtn.onclick = () => {
    document.body.removeChild(modal);
  };

  modal.onclick = (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  };

  buttonContainer.appendChild(copyBtn);
  buttonContainer.appendChild(cancelBtn);

  content.appendChild(title);
  content.appendChild(img);
  content.appendChild(textPreview);
  content.appendChild(buttonContainer);
  modal.appendChild(content);
  document.body.appendChild(modal);
};

/**
 * Captures a screenshot of a match card and copies both image + text in rich format
 */
export const copyMatchCardWithScreenshot = async (matchCardElement, matchData) => {
  let pageUrl = '';
  let matchText = '';
  let fullPlainText = '';

  try {
    pageUrl = window.location.href;
    matchText = `Match Details:\nDate: ${formatMatchDate(matchData.matchDate)}\nTime: ${formatTimes(matchData.slot)}\nClub: ${matchData?.clubId?.clubName || 'Unknown Club'}\nLevel: ${matchData?.skillLevel || 'N/A'}\nPrice: ₹${calculateMatchPrice(matchData?.slot)}\nLink: ${pageUrl}`;
    fullPlainText = `${matchText}\n\nClick this link to view/join: ${pageUrl}`;

    // Clipboard not supported
    if (!navigator.clipboard) {
      fallbackCopyText(matchText);
      showSuccess('Match details copied (text only)');
      return;
    }

    // html2canvas or element missing
    if (!window.html2canvas || !matchCardElement) {
      await navigator.clipboard.writeText(fullPlainText);
      showSuccess('Match details copied (text only)');
      return;
    }

    // Set crossOrigin on all images to help with CORS
    matchCardElement.querySelectorAll('img').forEach(img => {
      if (img.src && !img.crossOrigin) {
        img.crossOrigin = 'anonymous';
      }
    });

    // Capture screenshot
    const canvas = await window.html2canvas(matchCardElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: false,     // Prefer false if images have proper CORS headers
      logging: true,         // Set to false in production after testing
      width: matchCardElement.offsetWidth,
      height: matchCardElement.offsetHeight,
    });

    // Validate canvas
    const dataUrl = canvas.toDataURL('image/png');
    const isBlank = dataUrl === 'data:,' || 
                    canvas.width === 0 || 
                    canvas.height === 0;

    if (isBlank) {
      console.warn('html2canvas produced blank canvas – falling back to text only');
      await navigator.clipboard.writeText(fullPlainText);
      showSuccess('Match details copied (text only – screenshot failed)');
      return;
    }

    // Valid canvas → show preview
    showScreenshotPreview(canvas, matchText, async () => {
      try {
        const richHtml = `
          <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 600px;">
            <img src="${dataUrl}" alt="Match Screenshot" style="max-width: 100%; height: auto; border-radius: 10px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
            <pre style="background: #f8f9fa; padding: 16px; border-radius: 10px; white-space: pre-wrap; font-size: 15px; margin: 0 0 16px 0;">${matchText}</pre>
            <p style="margin:0; font-size:15px; color:#0066cc; font-weight:bold;">
              Link: <a href="${pageUrl}">${pageUrl}</a>
            </p>
          </div>
        `;

        const htmlBlob = new Blob([richHtml], { type: 'text/html' });
        const textBlob = new Blob([fullPlainText], { type: 'text/plain' });

        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': htmlBlob,
            'text/plain': textBlob,
          }),
        ]);

        showSuccess('Screenshot + Details + Clickable Link Copied!');
      } catch (err) {
        console.error('Rich copy failed:', err);
        await navigator.clipboard.writeText(fullPlainText);
        showSuccess('Text + Link copied (rich format not supported)');
      }
    });

  } catch (error) {
    console.error('copyMatchCardWithScreenshot failed:', error);

    // Final fallback using variables defined outside try
    const fallbackText = fullPlainText || `${matchText}\n\nLink: ${pageUrl}`;

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fallbackText);
        showSuccess('Match details copied (text only)');
      } else {
        fallbackCopyText(matchText || 'Match details');
        showSuccess('Match details copied (legacy fallback)');
      }
    } catch (fallbackErr) {
      console.error('Final fallback also failed:', fallbackErr);
      showError('Failed to copy anything.');
    }
  }
};

// Legacy fallback
const fallbackCopyText = (text) => {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
  } catch (err) {
    console.error('Fallback copy failed:', err);
  }
  document.body.removeChild(textArea);
};

// Helper functions (unchanged)
const formatMatchDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.toLocaleDateString("en-US", { day: "2-digit" });
  const month = date.toLocaleDateString("en-US", { month: "short" });
  return `${day} ${month}`;
};

const formatTimes = (slots) => {
  if (!slots || slots.length === 0) return "N/A";
  const times = slots
    .map((slot) => {
      const time = slot?.slotTimes?.[0]?.time;
      if (!time) return null;

      let hour, period;
      if (/am|pm/i.test(time)) {
        const match = time.match(/(\d+)\s*(am|pm)/i);
        if (match) {
          hour = parseInt(match[1], 10);
          period = match[2].toUpperCase();
        } else {
          return null;
        }
      } else {
        const [hours, minutes] = time.split(":");
        const hourNum = parseInt(hours, 10);
        period = hourNum >= 12 ? "PM" : "AM";
        hour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
      }

      return { hour, period };
    })
    .filter(Boolean);

  if (times.length === 0) return "N/A";

  const formatted = times.map((time, index) => {
    if (index === times.length - 1) {
      return `${time.hour}${time.period}`;
    }
    return time.hour;
  });

  return formatted.join("-") + (slots.length > 3 ? "...." : "");
};

const calculateMatchPrice = (slots) => {
  return slots
    ?.reduce((total, court) => {
      return (
        total +
        court.slotTimes.reduce(
          (sum, slotTime) => sum + Number(slotTime.amount || 0),
          0
        )
      );
    }, 0)
    .toFixed(0) || '0';
};