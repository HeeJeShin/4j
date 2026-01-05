"use client";

import { useState } from "react";
import Image from "next/image";
import { Button, FileUpload, AnalysisSkeleton } from "@/components/common";
import { AnalysisResult } from "@/types";

interface Step2AnalysisProps {
  floorPlan: File | null;
  setFloorPlan: (file: File | null) => void;
  floorPlanPreview: string | null;
  setFloorPlanPreview: (preview: string | null) => void;
  analysisResult: AnalysisResult | null;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setTotalArea: (area: string) => void;
}

export default function Step2Analysis({
  floorPlan,
  setFloorPlan,
  floorPlanPreview,
  setFloorPlanPreview,
  analysisResult,
  setAnalysisResult,
  setTotalArea,
}: Step2AnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [notFloorPlanError, setNotFloorPlanError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setFloorPlan(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setFloorPlanPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setAnalysisResult(null);
    setNotFloorPlanError(null);
  };

  const handleAnalyzeImage = async () => {
    if (!floorPlan) return;

    setIsAnalyzing(true);
    setNotFloorPlanError(null);
    try {
      const formData = new FormData();
      formData.append("image", floorPlan);
      formData.append("boothSize", "9");

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error === "NOT_FLOOR_PLAN") {
        setNotFloorPlanError(data.detectedContent || "알 수 없는 이미지");
        return;
      }

      if (!response.ok) throw new Error("분석 실패");

      setAnalysisResult(data as AnalysisResult);

      if (data.estimatedTotalArea) {
        setTotalArea(data.estimatedTotalArea.toString());
      }
    } catch (error) {
      console.error("이미지 분석 오류:", error);
      alert("이미지 분석 중 오류가 발생했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="rounded-lg bg-white p-8 shadow-sm">
      <h2 className="mb-6 text-base font-semibold text-zinc-900">
        AI로 도면 분석하기
      </h2>

      <div className="space-y-5">
        <div className="space-y-3">
          <FileUpload
            label="행사장 도면 첨부하기"
            onFileSelect={handleFileSelect}
            accept="image/*"
          />

          {floorPlanPreview && (
            <div className="rounded border border-zinc-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-500">*미리보기</span>
                <button
                  onClick={() => {
                    setFloorPlan(null);
                    setFloorPlanPreview(null);
                    setAnalysisResult(null);
                    setNotFloorPlanError(null);
                  }}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  ✕
                </button>
              </div>
              <div className="relative w-full h-64">
                <Image
                  src={floorPlanPreview}
                  alt="도면 미리보기"
                  fill
                  className="object-contain"
                />
              </div>

              <div className="mt-3 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAnalyzeImage}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? "분석 중..." : "AI로 도면 분석하기"}
                </Button>
              </div>

              {isAnalyzing && <AnalysisSkeleton />}

              {!isAnalyzing && notFloorPlanError && (
                <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-4 text-center">
                  <p className="text-3xl mb-2">🤔</p>
                  <p className="font-medium text-amber-800 mb-1">
                    어라? 이건 도면이 아닌 것 같아요!
                  </p>
                  <p className="text-sm text-amber-600">
                    AI가 보기엔 <span className="font-semibold">&quot;{notFloorPlanError}&quot;</span> 같은데...
                  </p>
                  <p className="text-xs text-amber-500 mt-2">
                    행사장 도면을 올려주시면 멋지게 분석해드릴게요 ✨
                  </p>
                </div>
              )}

              {!isAnalyzing && !notFloorPlanError && analysisResult && (
                <div className="mt-4 rounded bg-emerald-50 border border-emerald-200 p-4 text-sm">
                  <p className="font-medium text-emerald-900 mb-2">✓ AI 분석 완료</p>
                  <div className="space-y-1 text-emerald-700">
                    <p>• 부스 개수: {analysisResult.boothCount}개</p>
                    <p>• 출입구: {analysisResult.entranceCount}개</p>
                    <p>• 존 구분: {analysisResult.zones?.join(", ")}</p>
                    <p>• 추정 면적: {analysisResult.estimatedTotalArea?.toLocaleString()}㎡</p>
                    {analysisResult.estimatedDimensions && (
                      <p>• 추정 크기: {analysisResult.estimatedDimensions.width}m x {analysisResult.estimatedDimensions.height}m</p>
                    )}
                    {analysisResult.areaCalculationMethod && (
                      <p className="text-xs text-emerald-600 mt-1">({analysisResult.areaCalculationMethod})</p>
                    )}
                    {analysisResult.features?.length > 0 && (
                      <p>• 특징: {analysisResult.features.join(", ")}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {!floorPlan && (
          <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-8 text-center">
            <p className="text-sm text-zinc-500">
              도면 이미지를 업로드하면 AI가 자동으로 분석하여<br />
              면적, 부스 개수, 출입구 등을 추정합니다.
            </p>
            <p className="text-xs text-zinc-400 mt-2">
              * 1단계에서 면적을 입력했다면 이 단계를 건너뛸 수 있습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
