"use client";

import { useState } from "react";
import { Input, Select } from "@/components/common";
import { VenueType } from "@/types";

interface Step1EventInfoProps {
  eventName: string;
  setEventName: (value: string) => void;
  totalArea: string;
  setTotalArea: (value: string) => void;
  venueType: VenueType;
  setVenueType: (value: VenueType) => void;
}

const venueOptions = [
  { value: "standing", label: "스탠딩" },
  { value: "banquet", label: "연회형" },
  { value: "theater", label: "극장형" },
  { value: "classroom", label: "교실형" },
];

export default function Step1EventInfo({
  eventName,
  setEventName,
  totalArea,
  setTotalArea,
  venueType,
  setVenueType,
}: Step1EventInfoProps) {
  const [showCalculationInfo, setShowCalculationInfo] = useState(false);

  return (
    <div className="rounded-lg bg-white p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-zinc-900">
          행사정보 입력하기
        </h2>

        {/* 계산 기준 정보 버튼 */}
        <button
          onClick={() => setShowCalculationInfo(!showCalculationInfo)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-full transition-colors"
          title="계산 기준 및 방식 보기"
        >
          <span className="text-sm">📊</span>
          <span>계산 기준</span>
        </button>
      </div>

      {/* 계산 기준 설명 패널 */}
      {showCalculationInfo && (
        <div className="mb-6 rounded-lg border-2 border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <h3 className="font-semibold text-emerald-900">계산 기준 및 방식</h3>
            </div>
            <button
              onClick={() => setShowCalculationInfo(false)}
              className="text-emerald-400 hover:text-emerald-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4 text-sm text-emerald-800">
            {/* 1인당 면적 기준 */}
            <div className="bg-white/70 rounded p-3">
              <p className="font-medium mb-2">행사장 유형별 1인당 면적 기준</p>
              <div className="space-y-1 text-xs text-emerald-700">
                <p>• 스탠딩: 1인당 0.5㎡ (콘서트, 페스티벌, 전시 오프닝)</p>
                <p>• 연회형: 1인당 1.5㎡ (테이블 배치 행사)</p>
                <p>• 극장형: 1인당 0.8㎡ (좌석 배치 행사)</p>
                <p>• 교실형: 1인당 2.0㎡ (세미나, 교육)</p>
              </div>
            </div>

            {/* 계산 공식 */}
            <div className="bg-white/70 rounded p-3">
              <p className="font-medium mb-2">혼잡도별 수용인원 계산 공식</p>
              <div className="bg-zinc-50 rounded p-2 text-xs border border-zinc-200">
                <p className="font-mono text-emerald-700">
                  수용인원 = 면적 × 기준밀도 × 혼잡도비율 × AI보정(0.85)
                </p>
              </div>
            </div>

            {/* 혼잡도 레벨 */}
            <div className="bg-white/70 rounded p-3">
              <p className="font-medium mb-2">혼잡도 레벨별 기준</p>
              <div className="space-y-1 text-xs text-emerald-700">
                <p>• Level 1 (안전): 기준 밀도의 30%</p>
                <p>• Level 2 (여유): 기준 밀도의 50% → <strong>권장 인원</strong></p>
                <p>• Level 3 (혼잡): 기준 밀도의 70% → <strong>최대 인원</strong></p>
                <p>• Level 4 (위험): 기준 밀도의 90%</p>
                <p>• Level 5 (매우 위험): 기준 밀도의 110%</p>
              </div>
            </div>

            {/* AI 보정 */}
            <div className="bg-white/70 rounded p-3">
              <p className="font-medium mb-2">AI 안전 보정</p>
              <p className="text-xs text-emerald-700">
                실제 상황의 동선, 병목 현상 등을 고려하여 모든 계산값에 15% 감소 적용
              </p>
            </div>

            {/* 출입구 */}
            <div className="bg-white/70 rounded p-3">
              <p className="font-medium mb-2">출입구 처리 용량</p>
              <p className="text-xs text-emerald-700">
                출입구 1개당 275명 처리 가능 (권장 인원 산출 시 고려)
              </p>
            </div>
          </div>
        </div>
      )}

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
          placeholder="면적을 모를 경우 다음 단계에서 AI로 도면 분석을 이용하세요"
        />

        <Select
          label="행사장 유형 선택"
          id="venueType"
          options={venueOptions}
          value={venueType}
          onChange={(e) => setVenueType(e.target.value as VenueType)}
        />
      </div>
    </div>
  );
}
