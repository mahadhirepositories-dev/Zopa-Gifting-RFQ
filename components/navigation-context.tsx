"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface NavigationContextType {
  rfpId?: string;
  currentSection: string;
  activeSection: string;
  isSubmitted?: boolean;
  isLoggedIn?: boolean;
  navigateToSection: (section: string, skipValidation?: boolean) => void;
  canNavigateToSection: (section: string) => boolean;
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
  initialIsSubmitted,
  onSectionChange,
  isLoggedIn,
}) => {
  const [currentSection, setCurrentSection] = useState(initialSection);
  const [prevInitialSection, setPrevInitialSection] = useState(initialSection);

  if (initialSection !== prevInitialSection) {
    setPrevInitialSection(initialSection);
    setCurrentSection(initialSection);
  }

  console.log(isLoggedIn, "dadada");
  const canNavigateToSection = useCallback(
    (_section: string) => {
      return true;
    },
    [],
  );

  const navigateToSection = useCallback(
    (section: string) => {
      if (!canNavigateToSection(section)) return;
      setCurrentSection(section);
      if (onSectionChange) {
        onSectionChange(section);
      }
    },
    [canNavigateToSection, onSectionChange],
  );

  return (
    <NavigationContext.Provider
      value={{
        rfpId,
        currentSection,
        activeSection: currentSection,
        isSubmitted: initialIsSubmitted,
        isLoggedIn,
        navigateToSection,
        canNavigateToSection,
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
      activeSection: "company",
      isSubmitted: false,
      isLoggedIn: false,
      navigateToSection: () => {},
      canNavigateToSection: () => true,
    };
  }
  return context;
};
