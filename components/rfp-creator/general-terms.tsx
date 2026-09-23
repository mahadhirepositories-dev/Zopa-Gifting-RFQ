/* eslint-disable @typescript-eslint/no-explicit-any */
import { Icon } from "@/components/svg";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { MultiSelectOptimized } from "@/components/multi-select/multi-select";
import { Country, State, City } from "country-state-city";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Clock,
  GripVertical,
  MapPin,
  Edit,
  Trash2,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";
// import { AIGeneralTermsModal } from "./ai-terms-modal";

interface DeliveryLocation {
  name: string;
  state: string;
  latitude: string;
  longitude: string;
}

interface GeneralTermsData {
  generalTerms: string;
  selectedTerms: string[];
  customTerms: string[];
  customTermIds: Record<string, number>;
  deliveryTimeValue?: number;
  deliveryTimeUnit?: string;
  deliveryLocations?: DeliveryLocation[];
  [key: string]: any;
}

interface GeneralTermsProps {
  data: GeneralTermsData;
  onChange: (data: GeneralTermsData) => void;
  errors: {
    customTerms?: string;
    deliveryTimeValue?: string;
    deliveryLocations?: string;
    [key: string]: string | undefined;
  };
  setErrors?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  selectedSubCategory?: number;
  disabled?: boolean;
  boqItems?: any[];
  projectName?: string;
}

interface CityOption {
  value: string; // Format: "cityName|stateName|latitude|longitude"
  label: string; // Display: "cityName, stateName"
  latitude?: string;
  longitude?: string;
}

// Hoisted outside the component — it takes no props, so it doesn't need to
// be redeclared every render. Declaring it inside the component gave it a
// new identity on every render, which React treats as a different component
// type (remounting it and resetting its state) and trips the
// react-hooks/static-components lint rule.
const CitiesLoadingSkeleton = () => (
  <div className="flex items-center space-x-2">
    <Skeleton className="h-10 w-full" />
  </div>
);export const GeneralTerms: React.FC<GeneralTermsProps> = ({
  data = {} as GeneralTermsData,
  selectedSubCategory,
  onChange,
  errors = {},
  disabled,
  setErrors,
  boqItems = [],
  projectName = "",
}) => {
  const safeData = data || ({} as GeneralTermsData);
  const [predefinedTerms, setPredefinedTerms] = useState<any[]>([]);
  const [customTermInput, setCustomTermInput] = useState("");
  const [addingTerm, setAddingTerm] = useState(false);
  const [deletingTerm, setDeletingTerm] = useState<string | null>(null);
  const [editingTerm, setEditingTerm] = useState<string | null>(null);
  const [editedTermContent, setEditedTermContent] = useState("");
  const editInputRef = useRef<HTMLTextAreaElement | null>(null);
  const timeUnitOptions = ["days", "weeks", "months", "years"];
  const [citiesOptions, setCitiesOptions] = useState<CityOption[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  // Enhanced priority cities
  const priorityCities = useMemo(
    () => [
      "Mumbai, Maharashtra",
      "Delhi, Delhi",
      "Bengaluru, Karnataka",
      "Hyderabad, Telangana",
      "Ahmedabad, Gujarat",
      "Chennai, Tamil Nadu",
      "Kolkata, West Bengal",
      "Surat, Gujarat",
      "Pune, Maharashtra",
      "Jaipur, Rajasthan",
      "Lucknow, Uttar Pradesh",
      "Kanpur, Uttar Pradesh",
      "Nagpur, Maharashtra",
      "Indore, Madhya Pradesh",
      "Thane, Maharashtra",
      "Bhopal, Madhya Pradesh",
      "Visakhapatnam, Andhra Pradesh",
      "Pimpri-Chinchwad, Maharashtra",
      "Patna, Bihar",
      "Vadodara, Gujarat",
      "Ghaziabad, Uttar Pradesh",
      "Ludhiana, Punjab",
      "Nashik, Maharashtra",
      "Coimbatore, Tamil Nadu",
      "Agra, Uttar Pradesh",
      "Madurai, Tamil Nadu",
      "Tiruchirapalli, Tamil Nadu",
      "Salem, Tamil Nadu",
      "Tirunelveli, Tamil Nadu",
      "Tiruppur, Tamil Nadu",
      "Vellore, Tamil Nadu",
      "Erode, Tamil Nadu",
      "Thoothukudi, Tamil Nadu",
    ],
    [],
  );

  const selectedCities = useMemo(() => {
    if (safeData?.deliveryLocations && Array.isArray(safeData.deliveryLocations)) {
      return safeData.deliveryLocations.map(
        (loc) => `${loc.name}|${loc.state}|${loc.latitude}|${loc.longitude}`,
      );
    }
    return [];
  }, [safeData.deliveryLocations]);

  const isCustomTerm = useCallback(
    (term: string) => {
      if (!Array.isArray(safeData?.customTerms)) return false;
      return safeData.customTerms?.includes(term) || false;
    },
    [safeData.customTerms],
  );

  const isDeliveryTimeTerm = useCallback((term: string) => {
    return term.startsWith("Delivery Lead Time:");
  }, []);

  useEffect(() => {
    const initialData = { ...safeData };
    if (!initialData.selectedTerms) initialData.selectedTerms = [];
    if (!Array.isArray(initialData.selectedTerms))
      initialData.selectedTerms = [];
    if (!initialData.customTerms) initialData.customTerms = [];
    if (!Array.isArray(initialData.customTerms)) initialData.customTerms = [];
    if (!initialData.customTermIds) initialData.customTermIds = {};
    if (!initialData.deliveryTimeUnit) initialData.deliveryTimeUnit = "days";
    if (!initialData.deliveryLocations) initialData.deliveryLocations = [];

    if (typeof initialData.deliveryTimeValue === "string") {
      const numValue = parseInt(initialData.deliveryTimeValue, 10);
      initialData.deliveryTimeValue = isNaN(numValue) ? undefined : numValue;
    }

    if (JSON.stringify(initialData) !== JSON.stringify(safeData)) {
      onChange(initialData);
    }
  }, [safeData, onChange]);

  useEffect(() => {
    if (editingTerm && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingTerm]);

  // Load all Indian cities with coordinates
  useEffect(() => {
    const loadAllIndianCities = async () => {
      setLoadingCities(true);
      try {
        const india = Country.getAllCountries().find(
          (country) => country.name === "India",
        );

        if (!india) {
          console.error("Could not find India in the country list");
          setLoadingCities(false);
          return;
        }

        const indianStates = State.getStatesOfCountry(india.isoCode);

        const allCities: CityOption[] = [];

        const processStatesInChunks = async (states: any[], chunkSize = 5) => {
          for (let i = 0; i < states.length; i += chunkSize) {
            const stateChunk = states.slice(i, i + chunkSize);

            const chunkCities = stateChunk.flatMap((state) => {
              const stateCities = City.getCitiesOfState(
                india.isoCode,
                state.isoCode,
              );
              return stateCities.map((city) => ({
                value: `${city.name}|${state.name}|${city.latitude || "0"}|${city.longitude || "0"}`,
                label: `${city.name}, ${state.name}`,
                latitude: city.latitude || undefined,
                longitude: city.longitude || undefined,
              }));
            });

            allCities.push(...chunkCities);

            if (typeof window !== "undefined") {
              await new Promise((resolve) => setTimeout(resolve, 0));
            }
          }
        };

        await processStatesInChunks(indianStates);

        // Find and separate priority cities
        const priorityCitySet = new Set(priorityCities);
        const priorityFound: CityOption[] = [];
        const otherCities: CityOption[] = [];

        allCities.forEach((city) => {
          if (priorityCitySet.has(city.label)) {
            priorityFound.push(city);
          } else {
            otherCities.push(city);
          }
        });

        // Sort other cities alphabetically
        otherCities.sort((a, b) => a.label.localeCompare(b.label));

        setCitiesOptions([...priorityFound, ...otherCities]);
      } catch (error) {
        console.error("Failed to fetch Indian cities:", error);
        setCitiesOptions([]);
      } finally {
        setLoadingCities(false);
      }
    };

    loadAllIndianCities();
  }, [priorityCities]);

  const prevSubCategoryRef = useRef<number | undefined>(undefined);

  const fetchPredefinedTerms = useCallback(async () => {
    if (!selectedSubCategory || disabled) return;
    if (prevSubCategoryRef.current === selectedSubCategory) return;
    prevSubCategoryRef.current = selectedSubCategory;

    try {
      const response = await fetch(`/api/general-terms-frontend`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const options = await response.json();
      const optionsArray = Array.isArray(options) ? options : [options];
      const dataArray = optionsArray?.[0]?.data || [];
      const filteredTerms = dataArray.filter(
        (term: any) => term.secondaryQuestionId === selectedSubCategory,
      );
      setPredefinedTerms(filteredTerms);
      const predefinedTextTerms = filteredTerms.map((term: any) => term.text);
      const existingTerms = safeData.selectedTerms || [];
      const newSelectedTerms = [
        ...predefinedTextTerms,
        ...existingTerms.filter(
          (term) => isCustomTerm(term) && !isDeliveryTimeTerm(term),
        ),
      ];

      const uniqueTerms = Array.from(new Set(newSelectedTerms));

      onChange({
        ...safeData,
        selectedTerms: uniqueTerms,
        customTerms: safeData.customTerms || [],
        customTermIds: safeData.customTermIds || {},
        generalTerms: uniqueTerms.join("\n\n"),
      });
    } catch (error) {
      console.error("Failed to fetch predefined general terms:", error);
      setPredefinedTerms([]);
    }
  }, [
    safeData,
    disabled,
    onChange,
    selectedSubCategory,
    isCustomTerm,
    isDeliveryTimeTerm,
  ]);

  const handleAITermsGenerated = (terms: string[]) => {
    const existingCustomTerms = safeData.customTerms || [];
    const newCustomTerms = [...existingCustomTerms];

    terms.forEach((term) => {
      if (!existingCustomTerms.includes(term)) {
        newCustomTerms.push(term);
      }
    });

    // Update selected terms
    const predefinedTextTerms = predefinedTerms.map((term: any) => term.text);
    const newSelectedTerms = [
      ...predefinedTextTerms,
      ...newCustomTerms.filter((term) => !isDeliveryTimeTerm(term)),
    ];

    onChange({
      ...safeData,
      customTerms: newCustomTerms,
      selectedTerms: newSelectedTerms,
      generalTerms: newSelectedTerms.join("\n\n"),
    });

    toast.success(`${terms.length} AI-generated terms have been added!`);
  };

  const handleAddTerm = () => {
    if (!customTermInput.trim()) return;

    setAddingTerm(true);

    try {
      const newCustomTerms = [
        ...(safeData.customTerms || []),
        customTermInput.trim(),
      ];
      const existingTerms = safeData.selectedTerms || [];
      const newSelectedTerms = [
        ...existingTerms.filter(
          (term) => !isCustomTerm(term) && !isDeliveryTimeTerm(term),
        ),
        ...newCustomTerms,
      ];

      setCustomTermInput("");
      onChange({
        ...safeData,
        customTerms: newCustomTerms,
        selectedTerms: newSelectedTerms,
        generalTerms: newSelectedTerms.join("\n\n"),
      });
      if (
        setErrors &&
        (errors.deliveryLocations ||
          errors.deliveryTimeValue ||
          errors.selectedTerms)
      ) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.deliveryLocations;
          delete newErrors.deliveryTimeValue;
          delete newErrors.selectedTerms;
          return newErrors;
        });
      }
    } finally {
      setAddingTerm(false);
    }
  };

  const handleClearDeliveryTime = () => {
    onChange({
      ...safeData,
      deliveryTimeValue: undefined,
      deliveryTimeUnit: "days",
    });
    if (errors.deliveryTimeValue && setErrors) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.deliveryTimeValue;
        return newErrors;
      });
    }
  };

  const handleRemoveTerm = (termToRemove: string) => {
    setDeletingTerm(termToRemove);

    try {
      const predefinedTextTerms = predefinedTerms.map((term: any) => term.text);
      let newCustomTerms = safeData.customTerms || [];

      if (isCustomTerm(termToRemove)) {
        newCustomTerms = newCustomTerms.filter((term) => term !== termToRemove);
        const newSelectedTerms = [
          ...predefinedTextTerms,
          ...newCustomTerms.filter((term) => !isDeliveryTimeTerm(term)),
        ];

        onChange({
          ...safeData,
          selectedTerms: newSelectedTerms,
          customTerms: newCustomTerms,
          generalTerms: newSelectedTerms.join("\n\n"),
        });
      }
    } finally {
      setDeletingTerm(null);
    }
  };

  const handleStartEditTerm = (term: string) => {
    setEditingTerm(term);
    setEditedTermContent(term);
  };

  const handleSaveEditTerm = () => {
    if (!editingTerm || !editedTermContent.trim()) return;

    try {
      const currentTerms = [...(safeData.selectedTerms || [])];
      const termIndex = currentTerms.findIndex((term) => term === editingTerm);

      if (termIndex === -1) return;
      currentTerms[termIndex] = editedTermContent.trim();
      const newCustomTerms = [...(safeData.customTerms || [])];
      if (isCustomTerm(editingTerm)) {
        const customTermIndex = newCustomTerms.findIndex(
          (term) => term === editingTerm,
        );
        if (customTermIndex !== -1) {
          newCustomTerms[customTermIndex] = editedTermContent.trim();
        }
      }

      onChange({
        ...safeData,
        selectedTerms: currentTerms,
        customTerms: newCustomTerms,
        generalTerms: currentTerms.join("\n\n"),
      });
    } finally {
      setEditingTerm(null);
      setEditedTermContent("");
    }
  };

  const handleCancelEdit = () => {
    setEditingTerm(null);
    setEditedTermContent("");
  };

  const handleTimeValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue =
      value && value.trim() !== "" ? parseInt(value, 10) : undefined;

    onChange({
      ...safeData,
      deliveryTimeValue: numericValue,
    });
    if (
      numericValue &&
      numericValue >= 1 &&
      errors.deliveryTimeValue &&
      setErrors
    ) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.deliveryTimeValue;
        return newErrors;
      });
    }
  };

  const handleTimeUnitChange = (value: string) => {
    onChange({
      ...safeData,
      deliveryTimeUnit: value,
    });
    if (
      safeData.deliveryTimeValue &&
      safeData.deliveryTimeValue >= 1 &&
      errors.deliveryTimeValue &&
      setErrors
    ) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.deliveryTimeValue;
        return newErrors;
      });
    }
  };

  // Parse city value to extract location data
  const parseCityValue = (cityValue: string): DeliveryLocation | null => {
    const parts = cityValue.split("|");
    if (parts.length === 4) {
      return {
        name: parts[0],
        state: parts[1],
        latitude: parts[2],
        longitude: parts[3],
      };
    }
    return null;
  };

  const handleCitiesChange = (values: string[]) => {
    // Convert city values to location objects with coordinates and push
    // straight to the parent via onChange — selectedCities is derived from
    // safeData.deliveryLocations above, so it updates automatically once the
    // parent re-renders with the new data; no separate setState needed here.
    const locations: DeliveryLocation[] = values
      .map(parseCityValue)
      .filter((loc): loc is DeliveryLocation => loc !== null);

    onChange({
      ...safeData,
      deliveryLocations: locations,
    });

    if (values.length > 0 && errors.deliveryLocations && setErrors) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.deliveryLocations;
        return newErrors;
      });
    }
  };

  const handleCitySearch = (searchText: string) => {
    // City search handled by the dropdown component
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    if (!Array.isArray(safeData.selectedTerms)) return;

    const currentTerms = [...safeData.selectedTerms];
    const [reorderedItem] = currentTerms.splice(result.source.index, 1);
    currentTerms.splice(result.destination.index, 0, reorderedItem);
    const combinedTerms = currentTerms.join("\n\n");
    onChange({
      ...safeData,
      selectedTerms: currentTerms,
      generalTerms: combinedTerms,
    });
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        {/* <h2 className="text-2xl font-bold text-gray-800">
          7. General Terms & Conditions
        </h2> */}
        {/* {boqItems && boqItems.length > 0 && (
          <Button
            onClick={() => setShowAIModal(true)}
            disabled={disabled}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Generate with AI
          </Button>
        )} */}
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-900">
            Delivery Lead Time <span className="text-red-500">*</span>
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              className={cn(
                "w-32 h-11 border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl px-3.5 text-[13px] font-mono shadow-2xs text-slate-900 placeholder:text-[#64748B] placeholder:font-mono",
                errors.deliveryTimeValue && "border-destructive focus:ring-destructive",
              )}
              placeholder="Lead Time"
              min="1"
              value={safeData.deliveryTimeValue || ""}
              onChange={handleTimeValueChange}
              disabled={disabled}
            />
            <Select
              value={safeData.deliveryTimeUnit || "days"}
              onValueChange={handleTimeUnitChange}
              disabled={disabled}
            >
              <SelectTrigger className="w-32 h-11 border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl px-3.5 text-[13px] font-mono shadow-2xs text-slate-900 capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeUnitOptions.map((unit) => (
                  <SelectItem key={unit} value={unit} className="capitalize font-mono text-[13px]">
                    {unit.charAt(0).toUpperCase() + unit.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {safeData.deliveryTimeValue && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearDeliveryTime}
                className="text-destructive hover:text-destructive/80 h-11 w-11 p-0 rounded-xl"
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {errors.deliveryTimeValue && (
            <div className="text-destructive text-sm font-medium flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.deliveryTimeValue}
            </div>
          )}
        </div>

        {/* Delivery Location */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-900">
            Delivery Locations <span className="text-red-500">*</span>
          </Label>
          {loadingCities ? (
            <CitiesLoadingSkeleton />
          ) : (
            <MultiSelectOptimized
              options={citiesOptions}
              onValueChange={handleCitiesChange}
              defaultValue={selectedCities}
              placeholder="Select Delivery Locations"
              variant="default"
              maxCount={5}
              onInputChange={handleCitySearch}
              priorityOptions={priorityCities}
              enableVirtualScrolling={true}
              searchDebounceMs={300}
              disabled={disabled}
              showSelectAll={false}
              className={cn(
                "h-11 border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl px-3.5 text-[13px] font-mono shadow-2xs text-slate-900 hover:bg-[#F8FAFC]",
                errors.deliveryLocations && "border-destructive focus:ring-destructive",
              )}
            />
          )}
          {errors.deliveryLocations && (
            <div className="text-destructive text-sm font-medium flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.deliveryLocations}
            </div>
          )}
          {citiesOptions.length > 0 && (
            <div className="text-xs text-[#64748B] font-mono mt-1">
              💡 Tip: Use search to quickly find any city across India.
            </div>
          )}
        </div>

        {/* Customize your own terms */}
        <div className="space-y-2">
          <Label htmlFor="custom-terms" className="text-sm font-semibold text-slate-900">
            Customize your own terms:
          </Label>
          <Textarea
            id="custom-terms"
            value={customTermInput}
            onChange={(e) => {
              setCustomTermInput(e.target.value);
              onChange({
                ...safeData,
                error: undefined,
              });
            }}
            placeholder="Enter your custom terms and conditions here..."
            className={cn(
              "border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl p-3.5 text-[13px] font-mono shadow-2xs text-slate-900 placeholder:text-[#64748B] placeholder:font-mono min-h-[110px]",
              errors.selectedTerms && "border-destructive focus:ring-destructive",
            )}
            rows={4}
            disabled={disabled}
          />
          {errors.selectedTerms && (
            <div className="text-destructive text-sm font-medium mt-2">
              {errors.selectedTerms}
            </div>
          )}
          <div className="mt-3">
            <Button
              onClick={handleAddTerm}
              disabled={disabled || addingTerm}
              className="bg-[#1E6BFF] hover:bg-[#1557d6] text-white font-bold text-xs tracking-wider uppercase px-6 py-2.5 rounded-xl shadow-sm h-10"
            >
              {addingTerm ? "Adding..." : "ADD"}
            </Button>
          </div>
        </div>

        <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl p-5 mt-6 flex items-start gap-3">
          <div className="text-[#1E6BFF] mt-0.5 shrink-0">
            <Icon expandedCategory={false} categoryName="specialTerms" />
          </div>
          <div>
            <h5 className="font-semibold text-slate-900 text-sm">
              Common topics to address in general terms:
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 mt-2">
              <ul className="list-disc pl-5 space-y-1 text-slate-700 font-mono text-[13px]">
                <li>Confidentiality requirements</li>
                <li>Intellectual property rights</li>
                <li>Compliance with laws and regulations</li>
              </ul>
              <ul className="list-disc pl-5 space-y-1 text-slate-700 font-mono text-[13px]">
                <li>Insurance requirements</li>
                <li>Termination clauses</li>
                <li>Dispute resolution process</li>
              </ul>
            </div>
          </div>
        </div>

        {safeData.selectedTerms && safeData.selectedTerms.length > 0 && (
          <div className="space-y-4 mt-8">
            <h3 className="font-bold text-slate-900 text-lg mb-4">
              Selected Terms:
            </h3>
            
            {/* Display delivery lead time */}
            {safeData.deliveryTimeValue && (
              <div className="border border-[#E2E8F0] bg-white rounded-2xl p-5 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-slate-500 shrink-0" />
                  <span className="font-mono text-[13px] text-slate-900 font-medium">
                    Delivery Lead Time: {safeData.deliveryTimeValue}{" "}
                    {safeData.deliveryTimeUnit}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleClearDeliveryTime}
                  className="text-red-500 hover:text-red-600 p-1 transition-colors rounded-lg hover:bg-red-50"
                  disabled={disabled}
                  title="Remove delivery lead time"
                >
                  <X className="h-4 w-4 text-red-500" />
                </button>
              </div>
            )}

            {/* Display delivery locations - only show name and state */}
            {safeData.deliveryLocations && safeData.deliveryLocations.length > 0 && (
              <div className="border border-[#E2E8F0] bg-white rounded-2xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-slate-500 shrink-0" />
                    <span className="font-mono text-[13px] text-slate-900 font-medium">
                      Delivery Locations ({safeData.deliveryLocations.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onChange({ ...safeData, deliveryLocations: [] });

                      if (errors.deliveryLocations && setErrors) {
                        setErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.deliveryLocations;
                          return newErrors;
                        });
                      }
                    }}
                    className="text-red-500 hover:text-red-600 p-1 transition-colors rounded-lg hover:bg-red-50"
                    disabled={disabled}
                    title="Remove delivery locations"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pl-7">
                  {safeData.deliveryLocations.map((location, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-xl text-[12px] font-mono border border-[#E2E8F0] bg-[#F8FAFC] text-slate-800"
                    >
                      {location.name}, {location.state}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {safeData.selectedTerms && safeData.selectedTerms.length > 0 ? (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="terms">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {safeData.selectedTerms.map((term: string, index: number) => (
                        <Draggable
                          key={`${term}-${index}`}
                          draggableId={`${term}-${index}`}
                          index={index}
                          isDragDisabled={disabled || editingTerm === term}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={cn(
                                "border border-[#E2E8F0] bg-white rounded-2xl p-5 shadow-2xs transition-all",
                                snapshot.isDragging && "shadow-lg border-blue-400",
                              )}
                            >
                              {editingTerm === term ? (
                                <div className="space-y-3">
                                  <Textarea
                                    ref={editInputRef}
                                    value={editedTermContent}
                                    onChange={(e) =>
                                      setEditedTermContent(e.target.value)
                                    }
                                    className="min-h-[90px] border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl p-3.5 text-[13px] font-mono text-slate-900"
                                    disabled={disabled}
                                  />
                                  <div className="flex justify-end space-x-2">
                                    <Button
                                      size="sm"
                                      onClick={handleSaveEditTerm}
                                      disabled={disabled}
                                      className="bg-[#1E6BFF] hover:bg-blue-700 text-white rounded-xl px-4 py-2 font-mono text-xs"
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={handleCancelEdit}
                                      disabled={disabled}
                                      className="rounded-xl px-4 py-2 font-mono text-xs"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-start flex-1 gap-3">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="cursor-grab text-slate-400 hover:text-slate-600 mt-0.5 shrink-0"
                                    >
                                      <GripVertical className="h-4 w-4" />
                                    </div>
                                    <span className="font-mono text-[13px] text-slate-900 leading-relaxed flex-1">
                                      {term.trim()}
                                    </span>
                                    {isCustomTerm(term) && (
                                      <Badge
                                        variant="secondary"
                                        className="text-[11px] font-mono bg-blue-50 text-blue-700 border border-blue-200 shrink-0"
                                      >
                                        Custom
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0 mt-0.5">
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditTerm(term)}
                                      className="text-[#1E6BFF] hover:text-blue-700 p-1 rounded-lg hover:bg-blue-50 transition-colors"
                                      disabled={disabled}
                                      title="Edit term"
                                    >
                                      <Edit className="h-4 w-4 text-[#1E6BFF]" />
                                    </button>

                                    {isCustomTerm(term) && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveTerm(term)}
                                        className="text-red-500 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                                        disabled={disabled || deletingTerm === term}
                                        title="Delete term"
                                      >
                                        {deletingTerm === term ? (
                                          <span className="text-xs font-mono">...</span>
                                        ) : (
                                          <Trash2 className="h-4 w-4 text-red-500" />
                                        )}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            ) : (
              <div className="border border-[#E2E8F0] bg-white rounded-2xl p-6 text-center shadow-2xs">
                <p className="font-mono text-[13px] text-[#64748B]">
                  No terms selected yet. Add custom terms or select from
                  predefined options.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* <AIGeneralTermsModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        boqItems={boqItems}
        projectName={projectName}
        onTermsSelected={handleAITermsGenerated}
      /> */}
    </div>
  );
};