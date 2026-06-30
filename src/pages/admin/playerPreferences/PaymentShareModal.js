import React, { useMemo, useRef, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import html2canvas from "html2canvas";
import { logo } from "../../../assets/files";
import { showError, showSuccess } from "../../../helpers/Toast";

const formatAmount = (amount) => {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) return "0";
  return Number.isInteger(numericAmount) ? String(numericAmount) : numericAmount.toFixed(2);
};

const getPlayerName = (player) =>
  player?.customerId?.name ||
  player?.playerName ||
  player?.name ||
  player?.userId?.name ||
  "Player";

const getPlayerPhone = (player) =>
  player?.customerId?.phoneNumber ||
  player?.playerPhone ||
  player?.phoneNumber ||
  player?.userId?.phoneNumber ||
  "";

const getClubName = (match) => match?.clubId?.clubName || match?.clubId?.name || "N/A";

const getCourtName = (match) =>
  match?.slot?.[0]?.courtName ||
  match?.courtName ||
  "N/A";

const getMatchDate = (match) => {
  const date = match?.matchDate || match?.bookingDate || match?.slot?.[0]?.bookingDate;
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getMatchTime = (match) => {
  if (match?.startTime && match?.endTime) return `${match.startTime} - ${match.endTime}`;
  if (match?.matchTime) return String(match.matchTime).replaceAll(",", ", ");
  const times = (match?.slot || [])
    .flatMap((slot) => slot?.slotTimes || [])
    .map((slotTime) => slotTime?.bookingTime || slotTime?.time)
    .filter(Boolean);
  return times.length ? [...new Set(times)].join(", ") : "N/A";
};

const getFeeBreakdown = (match, paymentData) => {
  const slotTotal = (match?.slot || []).reduce((sum, slot) => (
    sum + (slot?.slotTimes || []).reduce((slotSum, slotTime) => slotSum + Number(slotTime?.amount || 0), 0)
  ), 0);
  const total = Number(
    paymentData?.totalCourtAmount ??
    match?.totalCourtAmount ??
    match?.totalMatchPayment ??
    match?.matchFee ??
    match?.fee ??
    slotTotal ??
    0,
  );
  const share = Number(
    paymentData?.matchShare ??
    paymentData?.share ??
    match?.perPlayerMatchShare ??
    match?.perPlayerShare ??
    (total > 0 ? total / 4 : 0),
  );
  const platformFee = Number(paymentData?.platformFee ?? match?.platformFee ?? 1);
  const gstOnPlatformFee = Number(
    paymentData?.gstOnPlatformFee ??
    paymentData?.platformFeeGst ??
    match?.platformFeeGst ??
    platformFee * 0.18,
  );
  const payable = Number(
    paymentData?.paymentAmount ??
    paymentData?.amount ??
    paymentData?.payable ??
    match?.playerPayableAmount ??
    share + platformFee + gstOnPlatformFee,
  );

  return { total, share, platformFee, gstOnPlatformFee, payable };
};

const PaymentShareModal = ({ show, onHide, match, player, paymentData }) => {
  const cardRef = useRef(null);
  const [copyingImage, setCopyingImage] = useState(false);
  const [sharingPayment, setSharingPayment] = useState(false);
  const paymentLink = paymentData?.appPaymentLink || paymentData?.paymentLink || "";
  const fee = useMemo(() => getFeeBreakdown(match, paymentData), [match, paymentData]);
  const playerName = getPlayerName(player);
  const playerPhone = getPlayerPhone(player);
  const clubName = getClubName(match);
  const courtName = getCourtName(match);
  const matchDate = getMatchDate(match);
  const matchTime = getMatchTime(match);
  const canAttemptNativeShare = Boolean(navigator?.share && navigator?.canShare);

  const caption = useMemo(() => [
    "Your open match payment is ready.",
    "",
    `Player: ${playerName}`,
    `Club: ${clubName}`,
    `Court: ${courtName}`,
    `Date: ${matchDate}`,
    `Time: ${matchTime}`,
    `Amount Payable: Rs. ${formatAmount(fee.payable)}`,
    "",
    `Pay here: ${paymentLink}`,
  ].join("\n"), [clubName, courtName, fee.payable, matchDate, matchTime, paymentLink, playerName]);

  const copyText = async (text, successMessage) => {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      showSuccess(successMessage);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    showSuccess(successMessage);
  };

  const getScreenshotBlob = async () => {
    if (!cardRef.current) return null;
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
    });
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  };

  const copyScreenshot = async () => {
    setCopyingImage(true);
    try {
      const blob = await getScreenshotBlob();
      if (!blob) throw new Error("Could not create screenshot");

      if (navigator?.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        showSuccess("Payment screenshot copied");
        return;
      }

      showError("This browser cannot copy images. Please use the caption copy option.");
    } catch (error) {
      showError(error?.message || "Unable to copy payment screenshot");
    } finally {
      setCopyingImage(false);
    }
  };

  const shareToWhatsApp = async () => {
    setSharingPayment(true);
    try {
      const blob = await getScreenshotBlob();
      if (!blob) throw new Error("Could not create screenshot");

      const file = new File([blob], "open-match-payment.png", { type: "image/png" });
      const sharePayload = {
        title: "Open Match Payment",
        text: caption,
        files: [file],
      };

      if (navigator?.canShare?.({ files: [file] }) && navigator?.share) {
        await navigator.share(sharePayload);
        showSuccess("Payment screenshot ready to share");
        return;
      }

      if (navigator?.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        showSuccess("Screenshot copied. Paste it in WhatsApp Web, then copy the caption.");
        return;
      }

      showError("This browser cannot copy or share the screenshot. Please try from mobile Chrome.");
    } catch (error) {
      if (error?.name === "AbortError") return;
      showError(error?.message || "Unable to share payment screenshot");
    } finally {
      setSharingPayment(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title style={{ color: "#1f41bb", fontSize: 18, fontWeight: 700 }}>
          Share Payment Request
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ background: "#f8fafc" }}>
        <div className="d-flex flex-column flex-lg-row gap-3 align-items-start">
          <div
            ref={cardRef}
            style={{
              background: "#fff",
              border: "1px solid #d8dee6",
              borderRadius: 8,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.10)",
              color: "#111827",
              maxWidth: 380,
              overflow: "hidden",
              width: "100%",
            }}
          >
            <div style={{ background: "#1f41bb", color: "#fff", padding: "14px 16px" }}>
              <div className="d-flex align-items-center gap-2">
                <img src={logo} alt="Padel" style={{ background: "#fff", borderRadius: 6, height: 34, objectFit: "contain", padding: 4, width: 34 }} />
                <div>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>Open Match Payment</div>
                  <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.2 }}>Payment Breakdown</div>
                </div>
              </div>
            </div>

            <div style={{ padding: 16 }}>
              <div style={{ borderBottom: "1px solid #edf1f5", paddingBottom: 12 }}>
                <div style={{ color: "#64748b", fontSize: 12 }}>Player</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{playerName}</div>
                {playerPhone && <div style={{ color: "#64748b", fontSize: 12 }}>{playerPhone}</div>}
              </div>

              <div style={{ display: "grid", gap: 8, padding: "12px 0" }}>
                {[
                  ["Club", clubName],
                  ["Court", courtName],
                  ["Date", matchDate],
                  ["Time", matchTime],
                  ["Skill Level", match?.skillLevel || "Any"],
                  ["Match Type", match?.gender || "Open Match"],
                ].map(([label, value]) => (
                  <div key={label} className="d-flex justify-content-between gap-3" style={{ fontSize: 13 }}>
                    <span style={{ color: "#64748b" }}>{label}</span>
                    <strong style={{ textAlign: "right" }}>{value}</strong>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: "1px solid #edf1f5", paddingTop: 10 }}>
                {[
                  ["Total Court Amount", fee.total],
                  ["Player Share", fee.share],
                  ["Platform Fee", fee.platformFee],
                  ["GST on Platform Fee", fee.gstOnPlatformFee],
                ].map(([label, value]) => (
                  <div key={label} className="d-flex justify-content-between gap-3" style={{ fontSize: 13, marginBottom: 8 }}>
                    <span style={{ color: "#475569" }}>{label}</span>
                    <strong>Rs. {formatAmount(value)}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center" style={{ background: "#ecfdf5", color: "#047857", padding: "14px 16px" }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Amount Payable</span>
              <span style={{ fontSize: 19, fontWeight: 800 }}>Rs. {formatAmount(fee.payable)}</span>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
            <label className="fw-semibold mb-2" style={{ color: "#111827", fontSize: 13 }}>
              Caption with payment link
            </label>
            <textarea
              readOnly
              value={caption}
              style={{
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                fontFamily: "Arial, sans-serif",
                fontSize: 13,
                lineHeight: 1.45,
                minHeight: 230,
                padding: 12,
                resize: "vertical",
                width: "100%",
              }}
            />
            <div className="d-flex flex-wrap gap-2 mt-3">
              <Button size="sm" onClick={copyScreenshot} disabled={copyingImage} style={{ backgroundColor: "#1f41bb", border: "none", fontWeight: 600 }}>
                {copyingImage ? "Copying..." : "Copy Screenshot"}
              </Button>
              <Button size="sm" variant="outline-primary" onClick={() => copyText(caption, "Payment caption copied")}>
                Copy Caption
              </Button>
              <Button size="sm" variant="outline-success" onClick={shareToWhatsApp} disabled={sharingPayment}>
                {sharingPayment ? "Preparing..." : canAttemptNativeShare ? "Share to WhatsApp" : "Copy Image for WhatsApp"}
              </Button>
              <Button size="sm" variant="outline-secondary" onClick={() => window.open("https://web.whatsapp.com/", "_blank", "noopener,noreferrer")}>
                Open WhatsApp Web
              </Button>
            </div>
            <div className="text-muted mt-2" style={{ fontSize: 12, lineHeight: 1.4 }}>
              Direct image sharing works on supported mobile browsers. On desktop, copy the screenshot, paste it in WhatsApp Web, then copy the caption.
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PaymentShareModal;
