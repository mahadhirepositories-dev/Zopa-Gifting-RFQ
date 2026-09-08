"use client";

import React, { createContext, useContext, useState } from "react";

interface NavigationContextType {
  rfpId?: string;
  currentSection: string;
  isSubmitted?: boolean;
  isLoggedIn?: boolean;
  navigateToSection: (section: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined,
);

export const NavigationProvider: React.FC<{
  children: React.ReactNode;
  rfpId?: string;
  initialSection?: string;
  initialIsSubmitted?: boolean;
  onSectionChange?: (section: string) => void;
  isLoggedIn?: boolean;
}> = ({
  children,
  rfpId,
  initialSection = "company",
  initialIsSubmitted = false,
  onSectionChange,
  isLoggedIn = false,
}) => {
  const [currentSection, setCurrentSection] = useState(initialSection);
  const [prevInitialSection, setPrevInitialSection] = useState(initialSection);
  if (initialSection !== prevInitialSection) {
    setPrevInitialSection(initialSection);
    setCurrentSection(initialSection);
  }

  const navigateToSection = (section: string) => {
    setCurrentSection(section);
    if (onSectionChange) {
      onSectionChange(section);
    }
  };

  return (
    <NavigationContext.Provider
      value={{
        rfpId,
        currentSection,
        isSubmitted: initialIsSubmitted,
        isLoggedIn,
        navigateToSection,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    return {
      rfpId: undefined,
      currentSection: "company",
      isSubmitted: false,
      isLoggedIn: false,
      navigateToSection: () => {},
    };
  }
  return context;
};
