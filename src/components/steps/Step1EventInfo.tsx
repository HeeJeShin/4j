"use client";

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
  return (
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

      {/* 계산 공식 설명 */}
      <div className="mt-8 rounded-lg bg-zinc-50 p-6">
        <h3 className="mb-3 text-sm font-semibold text-zinc-900">
          행사장 유형별 1인당 면적 기준
        </h3>
        <div className="space-y-2 text-sm text-zinc-600">
          <p>• 스탠딩: 1인당 0.5㎡ (콘서트, 페스티벌, 전시 오프닝)</p>
          <p>• 연회형: 1인당 1.3~1.9㎡ (테이블 배치 행사)</p>
          <p>• 극장형: 1인당 0.65~1.0㎡ (좌석 배치 행사)</p>
          <p>• 교실형: 1인당 2.0㎡ (세미나, 교육)</p>
        </div>
        <p className="mt-4 text-xs text-zinc-500">
          * 계산된 인원은 혼잡도, 비상구 처리량, 동선을 고려하여 AI 보정이 적용됩니다.
        </p>
      </div>
    </div>
  );
}
