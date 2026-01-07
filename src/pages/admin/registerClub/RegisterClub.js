import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import ClubRegistrationLayout from "./RegistrationLayout";
import VenueDetails from "./steps/VenueDetails";
import Images from "./steps/Images";
import Pricing from "./steps/Pricing";
import PriceSlotUpdate from "../myClub/PriceSlotUpdate";

const defaultFormData = {
  courtName: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  courtCount: "",
  description: "",
  linkedinLink: "",
  xlink: "",
  facebookLink: "",
  instagramLink: "",
  courtTypes: { indoor: false, outdoor: false },
  features: {
    changingRooms: false,
    parking: false,
    shower: false,
    chillPad: false,
    coachingAvailable: false,
  },
  images: [], // <-- **File[]** (only while wizard is open)
  previewUrls: [], // <-- URLs that survive page reload / update
  businessHours: {
    Monday: { start: "05:00 AM", end: "11:00 PM" },
    Tuesday: { start: "05:00 AM", end: "11:00 PM" },
    Wednesday: { start: "05:00 AM", end: "11:00 PM" },
    Thursday: { start: "05:00 AM", end: "11:00 PM" },
    Friday: { start: "05:00 AM", end: "11:00 PM" },
    Saturday: { start: "05:00 AM", end: "11:00 PM" },
    Sunday: { start: "05:00 AM", end: "11:00 PM" },
  },
  termsAccepted: false,
};

const RegisterClub = () => {
  const dispatch = useDispatch();
  const registerID = sessionStorage.getItem("registerId");

  // Initialize step from localStorage or default logic
  const [step, setStep] = useState(() => {
    const savedStep = localStorage.getItem("clubRegistrationStep");
    if (savedStep) {
      return parseInt(savedStep, 10);
    }
    return registerID ? 3 : 1;
  });

  const [updateImage, setUpdateImage] = useState(false);

  // Save step to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("clubRegistrationStep", step.toString());
  }, [step]);

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem("clubFormData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...defaultFormData,
          ...parsed,
          images: [],
          previewUrls: parsed.previewUrls || [],
        };
      } catch (e) {
        console.error("Parse error:", e);
        return defaultFormData;
      }
    }
    return defaultFormData;
  });

  const updateFormData = (newData) => {
    setFormData((prev) => {
      const updated = { ...prev, ...newData };
      const { images, ...toSave } = updated;
      localStorage.setItem("clubFormData", JSON.stringify(toSave));
      return updated;
    });
  };

  const goNext = () => setStep((s) => s + 1);
  const goBack = () => setStep((s) => s - 1);

  const registerId = useSelector((s) => s?.club?.clubData?.data?._id);
  console.log({registerId});
  useEffect(() => {
    if (registerId) sessionStorage.setItem("registerId", registerId);
  }, [registerId]);

  const renderStep = () => {
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
            updateFormData={updateFormData}
            onNext={goNext}
            onBack={goBack}
            updateImage={updateImage}
          />
        );
      case 3:
        return (
          // <Pricing
          //   formData={formData}
          //   updateFormData={updateFormData}
          //   onBack={goBack}
          //   setUpdateImage={setUpdateImage}
          //   onFinalSuccess={() => {
          //     localStorage.removeItem("clubFormData");
          //     localStorage.removeItem("clubRegistrationStep");
          //     localStorage.removeItem("clubImages");
          //     localStorage.removeItem("clubLogo");
          //     sessionStorage.removeItem("registerId");
          //   }}
          // />
           <PriceSlotUpdate
            formData={formData}
            updateFormData={updateFormData}
            onBack={goBack}
            setUpdateImage={setUpdateImage}
            onFinalSuccess={() => {
              localStorage.removeItem("clubFormData");
              localStorage.removeItem("clubRegistrationStep");
              localStorage.removeItem("clubImages");
              localStorage.removeItem("clubLogo");
              sessionStorage.removeItem("registerId");
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ClubRegistrationLayout currentStep={step}>
      {renderStep()}
    </ClubRegistrationLayout>
  );
};

export default RegisterClub;
