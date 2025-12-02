import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { FaCopy, FaCheck } from "react-icons/fa";

const CourtDataDisplay = ({ apiResponse }) => {
  const [copied, setCopied] = useState(false);

  const formatCourtData = () => {
    if (!apiResponse?.data) return "";

    let text = `Club: ${apiResponse.data[0]?.register_club_id?.clubName || "N/A"}\n`;
    text += `Business Hours: ${apiResponse.data[0]?.register_club_id?.businessHours?.[0]?.time || "N/A"}\n`;
    text += `Day: ${apiResponse.data[0]?.register_club_id?.businessHours?.[0]?.day || "N/A"}\n\n`;

    apiResponse.data.forEach((court) => {
      text += `Court: ${court.courtName}\n`;
      text += `Time Slots:\n`;
      
      court.slot?.[0]?.slotTimes?.forEach((slot) => {
        text += `  - ${slot.time} | Amount: ${slot.amount} | Status: ${slot.status} | Availability: ${slot.availabilityStatus}\n`;
      });
      
      text += `\n`;
    });

    text += `All Available Times: ${apiResponse.allSlotTimes?.join(", ")}\n`;
    text += `All Courts: ${apiResponse.allCourtNames?.join(", ")}`;

    return text;
  };

  const handleCopy = () => {
    const textData = formatCourtData();
    navigator.clipboard.writeText(textData).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0" style={{ fontFamily: "Poppins", color: "#374151" }}>
          Court Information
        </h5>
        <Button
          size="sm"
          onClick={handleCopy}
          className="d-flex align-items-center gap-2"
          style={{
            backgroundColor: copied ? "#22c55e" : "#374151",
            border: "none",
            fontFamily: "Poppins",
            fontSize: "12px",
          }}
        >
          {copied ? <FaCheck /> : <FaCopy />}
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>

      <div
        className="p-3 rounded"
        style={{
          backgroundColor: "#f8f9fa",
          fontFamily: "monospace",
          fontSize: "13px",
          maxHeight: "60vh",
          overflowY: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {formatCourtData()}
      </div>
    </div>
  );
};

export default CourtDataDisplay;
