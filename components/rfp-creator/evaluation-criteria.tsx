/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useState,
  useEffect,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Remove } from "@/components/svg";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { z } from "zod";

interface CriterionOption {
  id: string;
  criteria?: string;
  label?: string;
}

export interface EvaluationCriteriaHandle {
  validate: () => boolean;
}

interface EvaluationCriteriaProps {
  data?: string[] | any;
  onChange: (data: string[]) => void;
  errors: { evaluationCriteria?: string };
  disabled?: boolean;
}

// Define Zod schema for validation
export const evaluationCriteriasSchema = z.object({
  criteria: z
    .array(z.string())
    .min(1, "At least one evaluation criterion must be selected")
    .refine(
      (items) => {
        // check for unique items
        const uniqueItems = new Set(items);
        return uniqueItems.size === items.length;
      },
      { message: "Evaluation criteria must be unique" },
    ),
});

// Hoisted outside the component — it takes no props, so it doesn't need to
// be redeclared every render. Declaring it inside EvaluationCriteria gave it
// a new identity on every render, which React treats as a different
// component type and remounts (losing state, plus the react-hooks/static-components lint error).
const PredefinedCriteriaSkeleton = () => (
  <div className="space-y-3">
    {[...Array(10)].map((_, index) => (
      <div key={index} className="flex items-center space-x-3">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-full max-w-xs" />
      </div>
    ))}
  </div>
);

export const EvaluationCriteria = forwardRef<
  EvaluationCriteriaHandle,
  EvaluationCriteriaProps
>(({ data, onChange, errors, disabled }, ref) => {
  const [criteriaOptions, setCriteriaOptions] = useState<CriterionOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCustomCriteria, setNewCustomCriteria] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedCriteria = useMemo(
    () => (Array.isArray(data) ? data : []),
    [data],
  );

  useImperativeHandle(ref, () => ({
    validate: () => {
      return validateCriteria(selectedCriteria);
    },
  }));

  useEffect(() => {
    const fetchCriteria = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/evaluation-criteria");
        if (!response.ok) {
          throw new Error("Failed to fetch criteria");
        }
        const criteria = await response.json();
        setCriteriaOptions(criteria);
      } catch (error) {
        console.error("Error fetching criteria:", error);
        setCriteriaOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCriteria();
  }, []);

  // validate criteria with Zod
  const validateCriteria = (criteriaList: string[]) => {
    try {
      evaluationCriteriasSchema.parse({ criteria: criteriaList });
      setErrorMessage(null);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMsg = error.issues[0]?.message || "Invalid criteria";
        setErrorMessage(errorMsg);
        return false;
      }
      setErrorMessage("Validation error occurred");
      return false;
    }
  };

  const handleCriteriaChange = (criteriaText: string, checked: boolean) => {
    let newData;
    if (checked) {
      newData = [...selectedCriteria, criteriaText];
    } else {
      newData = selectedCriteria.filter((item) => item !== criteriaText);
    }

    // Validate before updating parent
    validateCriteria(newData);
    onChange(newData);
  };

  const handleAddCustomCriteria = () => {
    if (newCustomCriteria.trim()) {
      if (selectedCriteria.includes(newCustomCriteria)) {
        setErrorMessage("This criteria already exists");
        return;
      }

      // Validate custom criteria length
      if (newCustomCriteria.length > 100) {
        setErrorMessage("Criteria cannot exceed 100 characters");
        return;
      }

      const invalidCharsRegex = /[<>{}]/;
      if (invalidCharsRegex.test(newCustomCriteria)) {
        setErrorMessage("Criteria contains invalid characters");
        return;
      }

      const newData = [...selectedCriteria, newCustomCriteria.trim()];

      if (validateCriteria(newData)) {
        onChange(newData);
        setNewCustomCriteria("");
        setErrorMessage(null);
      }
    }
  };

  const handleCustomCriteriaKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddCustomCriteria();
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }
    const newData = Array.from(selectedCriteria);
    const [reorderedItem] = newData.splice(result.source.index, 1);
    newData.splice(result.destination.index, 0, reorderedItem);
    onChange(newData);
  };

  const removeCriteria = (index: number) => {
    const newData = selectedCriteria.filter((_, i) => i !== index);
    onChange(newData);

    // If criteria becomes empty, show validation error
    if (newData.length === 0) {
      validateCriteria(newData);
    }
  };

  const getCriteriaText = (option: CriterionOption) => {
    return option.criteria || option.label || "";
  };

  return (
    <div className="bg-background rounded-lg">
      {/* <h2 className="text-2xl font-bold mb-6">5. Evaluation Criteria</h2> */}

      <div className="space-y-6">
        {/* Predefined Options Section */}
        <div className="space-y-3">
          <Label>Predefined Criteria</Label>

          {isLoading ? (
            <PredefinedCriteriaSkeleton />
          ) : (
            <div className="space-y-3">
              {criteriaOptions.length > 0 ? (
                criteriaOptions.map((option) => {
                  const criteriaText = getCriteriaText(option);
                  return (
                    <div
                      key={option.id}
                      className="flex items-center space-x-3"
                    >
                      <Checkbox
                        id={`predefined-${option.id}`}
                        checked={selectedCriteria.includes(criteriaText)}
                        onCheckedChange={(checked) =>
                          handleCriteriaChange(criteriaText, checked as boolean)
                        }
                        disabled={disabled}
                      />
                      <Label
                        htmlFor={`predefined-${option.id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {criteriaText}
                      </Label>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">
                  No predefined criteria available.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Custom Criteria Section */}
        <div className="space-y-3">
          <Label htmlFor="custom-criteria">Custom Criteria</Label>
          <div className="flex gap-2">
            <Input
              id="custom-criteria"
              type="text"
              value={newCustomCriteria}
              onChange={(e) => setNewCustomCriteria(e.target.value)}
              onKeyDown={handleCustomCriteriaKeyDown}
              placeholder="Add custom evaluation criteria"
              className="flex-1"
              disabled={disabled}
            />
            <Button
              onClick={handleAddCustomCriteria}
              disabled={!newCustomCriteria.trim() || disabled}
            >
              Add
            </Button>
          </div>
        </div>

        {/* Error Messages */}
        {errorMessage && (
          <div className="text-destructive text-sm">{errorMessage}</div>
        )}

        {errors.evaluationCriteria && (
          <div className="text-destructive text-sm">
            {errors.evaluationCriteria}
          </div>
        )}

        {/* Selected Criteria Section */}
        <div className="space-y-3">
          <Label>Selected Criteria</Label>

          {selectedCriteria.length > 0 ? (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="criteria">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {selectedCriteria.map((criteria, index) => (
                      <Draggable
                        key={`${criteria}-${index}`}
                        draggableId={`${criteria}-${index}`}
                        index={index}
                        isDragDisabled={disabled}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              "transition-shadow",
                              snapshot.isDragging && "shadow-lg",
                            )}
                          >
                            <CardContent className="flex items-center justify-between p-3">
                              <div className="flex items-center flex-1 space-x-3">
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-move text-muted-foreground hover:text-foreground"
                                >
                                  ⠿
                                </div>
                                <span className="text-sm">{criteria}</span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCriteria(index)}
                                className="text-destructive hover:text-destructive/80 h-8 w-8 p-0"
                                disabled={disabled}
                              >
                                <Remove
                                  expandedCategory={""}
                                  categoryName={""}
                                />
                              </Button>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No criteria selected yet. Select predefined criteria or add
                  custom criteria.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
});
