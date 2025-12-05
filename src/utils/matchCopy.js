import { showSuccess, showError } from '../helpers/Toast';

const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isSafari = () => /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

/**
 * Captures a screenshot of a match card and copies it along with the page URL
 * @param {HTMLElement} matchCardElement - The match card DOM element to capture
 * @param {Object} matchData - Match data for fallback text
 * @returns {Promise<void>}
 */
export const copyMatchCardWithScreenshot = async (matchCardElement, matchData) => {
  try {
    const pageUrl = window.location.href;
    const matchText = `Match Details:\nDate: ${formatMatchDate(matchData.matchDate)}\nTime: ${formatTimes(matchData.slot)}\nClub: ${matchData?.clubId?.clubName || 'Unknown Club'}\nLevel: ${matchData?.skillLevel || 'N/A'}\nPrice: ₹${calculateMatchPrice(matchData?.slot)}\nLink: ${pageUrl}`;

    // Check if clipboard API is available
    if (!navigator.clipboard) {
      fallbackCopyText(matchText);
      showSuccess('Match details copied!');
      return;
    }

    // Try screenshot capture
    if (window.html2canvas && matchCardElement) {
      try {
        const canvas = await window.html2canvas(matchCardElement, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          width: matchCardElement.offsetWidth,
          height: matchCardElement.offsetHeight
        });

        const blob = await new Promise(resolve => {
          canvas.toBlob(resolve, 'image/png', 0.95);
        });

        // iOS Safari: Copy image only, then text separately
        if (isIOS() || isSafari()) {
          try {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            showSuccess('Screenshot copied! Tap to copy link.');
            
            // Offer to copy text after a delay
            setTimeout(async () => {
              try {
                await navigator.clipboard.writeText(pageUrl);
              } catch (e) {
                console.warn('Could not copy URL:', e);
              }
            }, 100);
            return;
          } catch (iosError) {
            console.warn('iOS clipboard failed:', iosError);
            // Fall through to text-only
          }
        }

        // Desktop browsers: Try image + text together
        if (window.ClipboardItem) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                'image/png': blob,
                'text/plain': new Blob([matchText], { type: 'text/plain' })
              })
            ]);
            showSuccess('Screenshot and details copied!');
            return;
          } catch (multiError) {
            // Try image only
            try {
              await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
              await navigator.clipboard.writeText(matchText);
              showSuccess('Screenshot copied!');
              return;
            } catch (imageError) {
              console.warn('Image copy failed:', imageError);
            }
          }
        }
      } catch (canvasError) {
        console.warn('Screenshot capture failed:', canvasError);
      }
    }

    // Final fallback: text only
    try {
      await navigator.clipboard.writeText(matchText);
      showSuccess('Match details copied!');
    } catch (textError) {
      fallbackCopyText(matchText);
      showSuccess('Match details copied!');
    }
    
  } catch (error) {
    console.error('Copy failed:', error);
    showError('Could not copy. Please try again.');
  }
};

// Legacy fallback for older browsers
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

// Helper functions (extracted from the component)
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

  const lastPeriod = times[times.length - 1].period;
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
    .toFixed(0);
};