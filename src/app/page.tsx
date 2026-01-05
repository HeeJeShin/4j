"use client";

import { useState } from "react";
import Image from "next/image";
import { Header } from "@/components/layout";
import { Button, Input, Select, FileUpload, CongestionLevel, AnalysisSkeleton } from "@/components/common";
import { VenueType, CalculationResult, AnalysisResult } from "@/types";

const venueOptions = [
  { value: "standing", label: "스탠딩" },
  { value: "banquet", label: "연회형" },
  { value: "theater", label: "극장형" },
];

export default function Home() {
  const [eventName, setEventName] = useState("");
  const [totalArea, setTotalArea] = useState("");
  const [venueType, setVenueType] = useState<VenueType>("standing");
  const [floorPlan, setFloorPlan] = useState<File | null>(null);
  const [floorPlanPreview, setFloorPlanPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [notFloorPlanError, setNotFloorPlanError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setFloorPlan(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setFloorPlanPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeImage = async () => {
    if (!floorPlan) return;

    setIsAnalyzing(true);
    setNotFloorPlanError(null);
    try {
      const formData = new FormData();
      formData.append("image", floorPlan);
      formData.append("boothSize", "9"); // 기본 부스 크기 9㎡

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      // 도면이 아닌 이미지인 경우
      if (data.error === "NOT_FLOOR_PLAN") {
        setNotFloorPlanError(data.detectedContent || "알 수 없는 이미지");
        return;
      }

      if (!response.ok) throw new Error("분석 실패");

      setAnalysisResult(data as AnalysisResult);

      // 분석된 면적으로 자동 입력
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
    setNotFloorPlanError(null);
  };

  return (
      <div className="min-h-screen bg-zinc-100">
      <Header />

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* 행사정보 입력 카드 */}
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-base font-semibold text-zinc-900">
            행사정보 입력하기
          </h2>

          <div className="space-y-5">
            <Input
                label="행사 명"
                id="eventName"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="행사명을 입력하세요"
            />

            <Input
                  label="행사장 총 면적(㎡)"
                  id="area"
                  type="number"
                  value={totalArea}
                  onChange={(e) => setTotalArea(e.target.value)}
                  placeholder="면적을 모를 경우 AI로 도면 분석을 이용하세요"
              />

              <Select
                  label="행사장 유형 선택"
                  id="venueType"
                  options={venueOptions}
                  value={venueType}
                  onChange={(e) => setVenueType(e.target.value as VenueType)}
              />

            <div className="space-y-3">
              <FileUpload
                  label="행사장 도면 첨부하기"
                  onFileSelect={handleFileSelect}
                  accept="image/*"
              />

              {/* 도면 미리보기 */}
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

                    {/* AI 분석 버튼 */}
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

                    {/* 분석 중 스켈레톤 */}
                    {isAnalyzing && <AnalysisSkeleton />}

                    {/* 도면이 아닌 이미지 에러 */}
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

                    {/* 분석 결과 */}
                    {!isAnalyzing && !notFloorPlanError && analysisResult && (
                        <div className="mt-4 rounded bg-zinc-50 p-4 text-sm">
                      <p className="font-medium text-zinc-900 mb-2">AI 분석 결과</p>
                      <div className="space-y-1 text-zinc-600">
                        <p>• 부스 개수: {analysisResult.boothCount}개</p>
                        <p>• 출입구: {analysisResult.entranceCount}개</p>
                        <p>• 존 구분: {analysisResult.zones?.join(", ")}</p>
                        <p>• 추정 면적: {analysisResult.estimatedTotalArea?.toLocaleString()}㎡</p>
                        {analysisResult.estimatedDimensions && (
                            <p>• 추정 크기: {analysisResult.estimatedDimensions.width}m x {analysisResult.estimatedDimensions.height}m</p>
                        )}
                        {analysisResult.areaCalculationMethod && (
                            <p className="text-xs text-zinc-500 mt-1">({analysisResult.areaCalculationMethod})</p>
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
          </div>

          {/* 버튼 영역 */}
          <div className="mt-8 flex justify-center gap-4">
            <Button variant="secondary" onClick={handleReset}>
              초기화
            </Button>
            <Button
                variant="primary"
                onClick={handleCalculate}
                disabled={isLoading}
            >
              {isLoading ? "계산 중..." : "계산하기"}
            </Button>
          </div>
        </div>

        {/* 계산 결과 카드 */}
        <div className="mt-6 rounded-lg bg-white p-8 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-zinc-900">계산 결과</h2>

          {result ? (
              <>
              {/* 도면 미리보기 (결과에도 표시) */}
                {floorPlanPreview && (
                    <div className="mb-6 relative w-full h-48 rounded border border-zinc-200">
                  <Image
                      src={floorPlanPreview}
                      alt="도면"
                      fill
                      className="object-contain"
                  />
                </div>
                )}

                <CongestionLevel
                    level={2}
                    capacities={result.capacities}
                    recommended={result.result.recommended}
                    maximum={result.result.maximum}
                />

                {result.result.safetyNote && (
                    <p className="mt-4 text-sm text-amber-600">
                  ⚠️ {result.result.safetyNote}
                </p>
                )}

                <div className="mt-6 flex justify-center gap-4">
                <Button variant="secondary" onClick={handleReset}>
                  다시 계산하기
                </Button>
                <Button variant="primary">저장하기</Button>
              </div>
            </>
          ) : (
              <p className="text-sm text-zinc-500">행사정보를 입력해주세요.</p>
          )}
        </div>

        {/* 계산 공식 설명 */}
        <div className="mt-6 rounded-lg bg-white p-6 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-zinc-900">
            행사장 유형별 1인당 면적 기준
          </h3>
          <div className="space-y-2 text-sm text-zinc-600">
            <p>• 스탠딩: 1인당 0.5㎡ (콘서트, 페스티벌, 전시 오프닝)</p>
            <p>• 연회형: 1인당 1.3~1.9㎡ (테이블 배치 행사)</p>
            <p>• 극장형: 1인당 0.65~1.0㎡ (좌석 배치 행사)</p>
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            * 계산된 인원은 혼잡도, 비상구 처리량, 동선을 고려하여 AI 보정이 적용됩니다.
          </p>
        </div>
      </main>
    </div>
  );
}