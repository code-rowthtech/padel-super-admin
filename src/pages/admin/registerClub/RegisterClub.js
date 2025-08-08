import React, { useState, useEffect } from "react";
import ClubRegistrationLayout from "./RegistrationLayout";
import VenueDetails from "./steps/VenueDetails";
import Images from "./steps/Images";
import Pricing from "./steps/Pricing";
import { useSelector } from "react-redux";

const RegisterClub = () => {
  const registerID = sessionStorage.getItem("registerId");
  const currentStep = registerID ? 3 : 1;
  const [step, setStep] = useState(currentStep);
  const [formData, setFormData] = useState({
    // Venue Details
    courtName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    courtCount: "",
    courtTypes: { indoor: false, outdoor: false },
    features: {
      changingRooms: false,
      parking: false,
      shower: false,
      chillPad: false,
      coaching: false,
    },

    // Images
    images: [],
    businessHours: {
      Monday: { start: "06:00 AM", end: "11:00 PM" },
      Tuesday: { start: "06:00 AM", end: "11:00 PM" },
      Wednesday: { start: "06:00 AM", end: "11:00 PM" },
      Thursday: { start: "06:00 AM", end: "11:00 PM" },
      Friday: { start: "06:00 AM", end: "11:00 PM" },
      Saturday: { start: "06:00 AM", end: "11:00 PM" },
      Sunday: { start: "06:00 AM", end: "11:00 PM" },
    },
    termsAccepted: false,

    // Pricing will be added later
  });

  const updateFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const goNext = () => setStep((prev) => prev + 1);
  const goBack = () => setStep((prev) => prev - 1);

  const registerId = useSelector((state) => state?.club?.clubData?.data?._id);
  useEffect(() => {
    if (registerId) {
      sessionStorage.setItem("registerId", registerId);
    }
  }, [registerId]);
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <VenueDetails
            formData={formData}
            onNext={goNext}
            updateFormData={updateFormData}
          />
        );
      case 2:
        return (
          <Images
            formData={formData}
            onNext={goNext}
            onBack={goBack}
            updateFormData={updateFormData}
          />
        );
      case 3:
        return (
          <Pricing
            formData={formData}
            onBack={goBack}
            updateFormData={updateFormData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ClubRegistrationLayout currentStep={step}>
      {renderStepContent()}
    </ClubRegistrationLayout>
  );
};

export default RegisterClub;
