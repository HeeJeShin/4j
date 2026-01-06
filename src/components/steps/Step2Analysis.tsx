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
  const [showPromptInfo, setShowPromptInfo] = useState(false);

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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-zinc-900">
          AI로 도면 분석하기
        </h2>

        {/* AI 프롬프트 정보 버튼 */}
        <button
          onClick={() => setShowPromptInfo(!showPromptInfo)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-full transition-colors"
          title="AI가 어떻게 분석하는지 보기"
        >
          <span className="text-sm">🤖</span>
          <span>AI 분석 원리</span>
        </button>
      </div>

      {/* AI 프롬프트 설명 패널 */}
      {showPromptInfo && (
        <div className="mb-6 rounded-lg border-2 border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <h3 className="font-semibold text-emerald-900">AI가 도면을 분석하는 방법</h3>
            </div>
            <button
              onClick={() => setShowPromptInfo(false)}
              className="text-emerald-400 hover:text-emerald-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4 text-sm text-emerald-800">
            <div className="bg-white/70 rounded p-3">
              <p className="font-medium mb-2">AI에게 보내는 질문 (프롬프트)</p>
              <div className="bg-zinc-50 p-3 rounded border border-zinc-200 text-xs font-mono text-zinc-700 whitespace-pre-wrap">
{`이 행사장/전시장 도면 이미지를 정밀하게 분석해주세요.

분석 항목:
1. 부스 개수: P1, P2, S1, S2 등 번호가 붙은 모든 부스
2. 통로 및 빈 공간 비율 (0~1)
3. 출입구 개수
4. 존(Zone) 구분
5. 특이사항: 무대, 라운지, 접수대 등

반드시 아래 JSON 형식으로만 응답:
{
  "boothCount": 숫자,
  "emptySpaceRatio": 0.0,
  "entranceCount": 숫자,
  "zones": [],
  "features": [],
  "estimatedTotalArea": 숫자,
  "analysis": "설명"
}`}
              </div>
            </div>

            <div className="bg-white/70 rounded p-3">
              <p className="font-medium mb-2">분석 과정 (3초 소요)</p>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-semibold">1.</span>
                  <div>
                    <p className="font-medium">이미지 업로드</p>
                    <p className="text-emerald-600">도면 이미지를 Gemini AI로 전송</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-semibold">2.</span>
                  <div>
                    <p className="font-medium">패턴 인식</p>
                    <p className="text-emerald-600">부스, 통로, 출입구 등 자동 감지</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-semibold">3.</span>
                  <div>
                    <p className="font-medium">구조화된 데이터 반환</p>
                    <p className="text-emerald-600">JSON 형식으로 분석 결과 전달</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-semibold">4.</span>
                  <div>
                    <p className="font-medium">화면에 표시</p>
                    <p className="text-emerald-600">부스 개수, 면적 등 결과 시각화</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FileUpload
              label="행사장 도면 첨부하기"
              onFileSelect={handleFileSelect}
              accept="image/*"
            />

            {/* 툴팁 아이콘 */}
            <div className="group relative">
              <button
                className="text-zinc-400 hover:text-zinc-600 text-sm"
                type="button"
              >
                ℹ️
              </button>
              <div className="hidden group-hover:block absolute right-0 top-6 z-10 w-64 bg-zinc-900 text-white text-xs rounded-lg p-3 shadow-lg">
                <p className="font-semibold mb-1">🤖 AI가 자동으로 분석합니다</p>
                <p className="text-zinc-300">
                  • 부스 개수 자동 카운팅<br/>
                  • 출입구 위치 파악<br/>
                  • 전체 면적 추정<br/>
                  • 존(Zone) 구분
                </p>
                <div className="absolute -top-1 right-4 w-2 h-2 bg-zinc-900 transform rotate-45"></div>
              </div>
            </div>
          </div>

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

              {/* AI 분석 버튼 + 설명 */}
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAnalyzeImage}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? "🤖 AI 분석 중..." : "🤖 AI로 도면 분석하기"}
                  </Button>

                  {/* 분석 중 표시 */}
                  {isAnalyzing && (
                    <span className="text-xs text-emerald-600 animate-pulse">
                      Gemini가 열심히 분석 중...
                    </span>
                  )}
                </div>

                {!isAnalyzing && !analysisResult && (
                  <p className="text-xs text-center text-zinc-500">
                    💡 버튼을 누르면 AI가 3초 안에 도면을 분석합니다
                  </p>
                )}
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
                <div className="mt-4 rounded bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 p-4 text-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">✨</span>
                    <p className="font-semibold text-emerald-900">AI 분석 완료!</p>
                    <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                      3초 소요
                    </span>
                  </div>
                  <div className="space-y-1.5 text-zinc-700">
                    <p>• 부스 개수: <strong>{analysisResult.boothCount}개</strong></p>
                    <p>• 출입구: <strong>{analysisResult.entranceCount}개</strong></p>
                    {analysisResult.zones && analysisResult.zones.length > 0 && (
                      <p>• 존 구분: <strong>{analysisResult.zones.join(", ")}</strong></p>
                    )}
                    <p>• 추정 면적: <strong>{analysisResult.estimatedTotalArea?.toLocaleString()}㎡</strong></p>
                    {analysisResult.estimatedDimensions && (
                      <p>• 추정 크기: <strong>{analysisResult.estimatedDimensions.width}m × {analysisResult.estimatedDimensions.height}m</strong></p>
                    )}
                    {analysisResult.areaCalculationMethod && (
                      <p className="text-xs text-emerald-600 mt-2 pl-4">
                        ({analysisResult.areaCalculationMethod})
                      </p>
                    )}
                    {analysisResult.features && analysisResult.features.length > 0 && (
                      <p>• 특징: <strong>{analysisResult.features.join(", ")}</strong></p>
                    )}
                  </div>

                  {/* Gemini 크레딧 */}
                  <div className="mt-3 pt-3 border-t border-emerald-200">
                    <p className="text-xs text-emerald-600 text-center">
                      Powered by Google Gemini Vision AI
                    </p>
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
