import React, { createContext, useContext, useState, useEffect } from 'react';

const SuperAdminContext = createContext();

export const useSuperAdminContext = () => {
  const context = useContext(SuperAdminContext);
  if (!context) {
    throw new Error('useSuperAdminContext must be used within SuperAdminProvider');
  }
  return context;
};

export const SuperAdminProvider = ({ children }) => {
  const [selectedOwnerId, setSelectedOwnerId] = useState(() => {
    // Load from localStorage on mount
    return localStorage.getItem('superAdminSelectedOwnerId') || null;
  });
  const [selectedOwner, setSelectedOwner] = useState(null);

  // Save to localStorage whenever selectedOwnerId changes
  useEffect(() => {
    if (selectedOwnerId) {
      localStorage.setItem('superAdminSelectedOwnerId', selectedOwnerId);
    } else {
      localStorage.removeItem('superAdminSelectedOwnerId');
    }
  }, [selectedOwnerId]);

  const updateSelectedOwner = (ownerId, ownerData = null) => {
    setSelectedOwnerId(ownerId);
    setSelectedOwner(ownerData);
  };

  const clearSelectedOwner = () => {
    setSelectedOwnerId(null);
    setSelectedOwner(null);
    localStorage.removeItem('superAdminSelectedOwnerId');
  };

  return (
    <SuperAdminContext.Provider
      value={{
        selectedOwnerId,
        selectedOwner,
        updateSelectedOwner,
        clearSelectedOwner
      }}
    >
      {children}
    </SuperAdminContext.Provider>
  );
};
