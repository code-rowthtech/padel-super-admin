import React from "react";
import CourtDataDisplay from "./CourtDataDisplay";

// Example usage component
const CourtDataDisplayExample = () => {
  // Your API response
  const apiResponse = {
    status: "200",
    success: true,
    count: 2,
    data: [
      {
        _id: "69295414e071a3b6993395c7",
        courtName: "Court 1",
        register_club_id: {
          _id: "69295414e3230ac71d218a38",
          clubName: "The Court Line Club",
          businessHours: [
            {
              time: "06:00 AM - 11:00 PM",
              day: "Friday",
              _id: "69295413e071a3b6993395c2",
            },
          ],
          features: ["shed"],
        },
        slot: [
          {
            _id: "69295414e071a3b69933961c",
            businessHours: [
              {
                time: "06:00 AM - 11:00 PM",
                day: "Friday",
                _id: "69295413e071a3b6993395c2",
              },
            ],
            slotTimes: [
              {
                _id: "6929910623c92e13e270cbfc",
                time: "6 am",
                amount: 1000,
                status: "available",
                availabilityStatus: "available",
                courtIdsForSlot: [],
              },
              {
                _id: "6929910623c92e13e270cbfd",
                time: "7 am",
                amount: 1000,
                status: "available",
                availabilityStatus: "available",
                courtIdsForSlot: [],
              },
              {
                _id: "6929910623c92e13e270cc0a",
                time: "8 pm",
                amount: 1000,
                status: "booked",
                availabilityStatus: "available",
                courtIdsForSlot: [],
              },
            ],
          },
        ],
      },
      {
        _id: "69295414e071a3b6993395c8",
        courtName: "Court 2",
        register_club_id: {
          _id: "69295414e3230ac71d218a38",
          clubName: "The Court Line Club",
          businessHours: [
            {
              time: "06:00 AM - 11:00 PM",
              day: "Friday",
              _id: "69295413e071a3b6993395c2",
            },
          ],
          features: ["shed"],
        },
        slot: [
          {
            _id: "69295414e071a3b69933961c",
            businessHours: [
              {
                time: "06:00 AM - 11:00 PM",
                day: "Friday",
                _id: "69295413e071a3b6993395c2",
              },
            ],
            slotTimes: [
              {
                _id: "6929910623c92e13e270cbfc",
                time: "6 am",
                amount: 1000,
                status: "available",
                availabilityStatus: "available",
                courtIdsForSlot: [],
              },
              {
                _id: "6929910623c92e13e270cc07",
                time: "5 pm",
                amount: 1000,
                status: "booked",
                availabilityStatus: "available",
                courtIdsForSlot: [],
              },
            ],
          },
        ],
      },
    ],
    allSlotTimes: [
      "1 pm",
      "2 pm",
      "3 pm",
      "4 pm",
      "5 pm",
      "6 am",
      "6 pm",
      "7 am",
      "7 pm",
      "8 am",
      "8 pm",
      "9 am",
      "9 pm",
      "10 am",
      "10 pm",
      "11 am",
      "12 pm",
    ],
    allCourtNames: ["Court 1", "Court 2"],
  };

  return (
    <div className="container mt-4">
      <CourtDataDisplay apiResponse={apiResponse} />
    </div>
  );
};

export default CourtDataDisplayExample;
