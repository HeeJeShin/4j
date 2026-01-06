"use client";

import { useState } from "react";
import { Header } from "@/components/layout";
import { Button, ProgressStepper } from "@/components/common";
import { Step1EventInfo, Step2Analysis, Step3Results } from "@/components/steps";
import { VenueType, CalculationResult, AnalysisResult } from "@/types";

const steps = [
  { label: "행사 정보 입력", color: "bg-orange-500" },
  { label: "계산하기", color: "bg-orange-500" },
  { label: "결과보기", color: "bg-orange-500" },
];

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [eventName, setEventName] = useState("");
  const [totalArea, setTotalArea] = useState("");
  const [venueType, setVenueType] = useState<VenueType>("standing");
  const [floorPlan, setFloorPlan] = useState<File | null>(null);
  const [floorPlanPreview, setFloorPlanPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleCalculate = async () => {
    if (!totalArea) {
      alert("행사장 면적을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalArea: Number(totalArea),
          venueType,
          entranceCount: analysisResult?.entranceCount || 2,
        }),
      });

      if (!response.ok) throw new Error("계산 실패");

      const data: CalculationResult = await response.json();
      setResult(data);
      setCurrentStep(3);
    } catch (error) {
      console.error("계산 오류:", error);
      alert("계산 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setEventName("");
    setTotalArea("");
    setVenueType("standing");
    setFloorPlan(null);
    setFloorPlanPreview(null);
    setResult(null);
    setAnalysisResult(null);
    setCurrentStep(1);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!eventName.trim()) {
        alert("행사명을 입력해주세요.");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      handleCalculate();
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return eventName.trim() !== "";
    }
    if (currentStep === 2) {
      return totalArea !== "";
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-zinc-100">
      <Header />

      <main className="mx-auto max-w-4xl px-6 py-8">
        <ProgressStepper
          currentStep={currentStep}
          steps={steps}
          onStepChange={(step) => {
            // 이전(또는 현재) 단계만 허용
            if (step <= currentStep) setCurrentStep(step);
          }}
        />

        <div className="mt-8">
          {currentStep === 1 && (
            <Step1EventInfo
              eventName={eventName}
              setEventName={setEventName}
              totalArea={totalArea}
              setTotalArea={setTotalArea}
              venueType={venueType}
              setVenueType={setVenueType}
            />
          )}

          {currentStep === 2 && (
            <Step2Analysis
              floorPlan={floorPlan}
              setFloorPlan={setFloorPlan}
              floorPlanPreview={floorPlanPreview}
              setFloorPlanPreview={setFloorPlanPreview}
              analysisResult={analysisResult}
              setAnalysisResult={setAnalysisResult}
              setTotalArea={setTotalArea}
            />
          )}

          {currentStep === 3 && (
            <Step3Results
              result={result}
              floorPlanPreview={floorPlanPreview}
              onReset={handleReset}
            />
          )}
        </div>

        {currentStep < 3 && (
          <div className="mt-8 flex justify-center gap-4">
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!canProceed() || isLoading}
            >
              {currentStep === 2
                ? isLoading
                  ? "계산 중..."
                  : "계산하기"
                : "다음"}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}