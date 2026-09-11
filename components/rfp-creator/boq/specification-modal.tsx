import React, { useState } from "react";
import { Loader2, Sparkles, CheckCircle2, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button"; // Assuming you have shadcn button
import { toast } from "react-toastify";

interface SpecificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  description: string;
  onSpecificationGenerated: (specification: string) => void;
}

export const SpecificationModal: React.FC<SpecificationModalProps> = ({
  isOpen,
  onClose,
  category,
  description,
  onSpecificationGenerated,
}) => {
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [generatedSpec, setGeneratedSpec] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stage, setStage] = useState<"init" | "questions" | "complete">("init");

  const generateQuestions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/generate-spec-questions", {
        method: "POST",
        body: JSON.stringify({ category, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuestions(data.questions);
      setStage("questions");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate AI questions");
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = (skip = false) => {
    const newAnswers = {
      ...answers,
      [currentQuestionIndex]: skip ? "Not specified" : currentAnswer,
    };
    setAnswers(newAnswers);
    setCurrentAnswer("");

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      generateFinalSpec(newAnswers);
    }
  };

  const generateFinalSpec = async (finalAnswers: Record<number, string>) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/build-specification", {
        method: "POST",
        body: JSON.stringify({
          category,
          description,
          questions,
          answers: finalAnswers,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGeneratedSpec(data.specification);
      setStage("complete");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate specification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUse = () => {
    onSpecificationGenerated(generatedSpec);
    handleClose();
  };

  const handleClose = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setGeneratedSpec("");
    setStage("init");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-blue-600 text-white rounded-t-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">AI Spec Generator</span>
          </div>
          <button onClick={handleClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grow">
          {stage === "init" && (
            <div className="text-center py-8">
              <h3 className="text-lg font-bold mb-2">
                Create Specs for {description}
              </h3>
              <p className="text-gray-500 mb-6">
                Our AI will ask 5-7 questions to build a perfect specification.
              </p>
              <Button onClick={generateQuestions} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  <Sparkles className="mr-2" />
                )}
                Start AI Agent
              </Button>
            </div>
          )}

          {stage === "questions" && !isLoading && (
            <div>
              <div className="mb-4 text-sm text-gray-500 flex justify-between">
                <span>
                  Question {currentQuestionIndex + 1}/{questions.length}
                </span>
                <span>
                  {Math.round((currentQuestionIndex / questions.length) * 100)}%
                </span>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg mb-4 text-lg font-medium text-gray-800">
                {questions[currentQuestionIndex]}
              </div>
              <textarea
                className="w-full border rounded-md p-3 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                rows={3}
                placeholder="Type your answer..."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && submitAnswer()
                }
                autoFocus
              />
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => submitAnswer()}>
                  Next
                </Button>
                <Button variant="outline" onClick={() => submitAnswer(true)}>
                  Skip
                </Button>
              </div>
            </div>
          )}

          {stage === "complete" && (
            <div>
              <div className="flex items-center gap-2 text-green-600 mb-4 font-semibold">
                <CheckCircle2 className="w-5 h-5" /> Specification Ready
              </div>
              <div className="bg-gray-50 p-4 rounded border font-mono text-sm whitespace-pre-wrap mb-4 max-h-60 overflow-y-auto">
                {generatedSpec}
              </div>
              <Button className="w-full" onClick={handleUse}>
                <ChevronRight className="mr-2 w-4 h-4" /> Use This Specification
              </Button>
            </div>
          )}

          {isLoading && stage !== "init" && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-500">Thinking...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
