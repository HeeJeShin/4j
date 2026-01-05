"use client";

import Image from "next/image";
import { Button, CongestionLevel } from "@/components/common";
import { CalculationResult } from "@/types";

interface Step3ResultsProps {
  result: CalculationResult | null;
  floorPlanPreview: string | null;
  onReset: () => void;
}

export default function Step3Results({
  result,
  floorPlanPreview,
  onReset,
}: Step3ResultsProps) {
  const handleSave = () => {
    if (!result) return;

    // TODO: 저장 기능 구현
    const data = {
      timestamp: new Date().toISOString(),
      result,
    };

    console.log("저장할 데이터:", data);
    alert("저장 기능은 추후 구현 예정입니다.");
  };

  return (
    <div className="rounded-lg bg-white p-8 shadow-sm">
      <h2 className="mb-6 text-base font-semibold text-zinc-900">계산 결과</h2>

      {result ? (
        <>
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
            <Button variant="secondary" onClick={onReset}>
              다시 계산하기
            </Button>
            <Button variant="primary" onClick={handleSave}>
              저장하기
            </Button>
          </div>
        </>
      ) : (
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-12 text-center">
          <p className="text-lg text-zinc-500 mb-2">계산 결과가 없습니다</p>
          <p className="text-sm text-zinc-400">
            이전 단계에서 정보를 입력하고 계산을 진행해주세요.
          </p>
        </div>
      )}
    </div>
  );
}
