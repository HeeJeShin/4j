"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout";
import { Button, Select } from "@/components/common";

interface Capacities {
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  level5: number;
}

type IntervalType = "1min" | "10min" | "1hour";

const intervalOptions = [
  { value: "1min", label: "1분" },
  { value: "10min", label: "10분" },
  { value: "1hour", label: "1시간" },
];

// 데모용으로 빠르게 업데이트 (실제 시간 대신)
const demoIntervalMs: Record<IntervalType, number> = {
  "1min": 3000,    // 3초
  "10min": 5000,   // 5초
  "1hour": 10000,  // 10초
};

const levelInfo = [
  { level: 1, label: "쾌적", color: "bg-green-500", textColor: "text-green-600", bgLight: "bg-green-50" },
  { level: 2, label: "여유", color: "bg-blue-500", textColor: "text-blue-600", bgLight: "bg-blue-50" },
  { level: 3, label: "혼잡", color: "bg-yellow-500", textColor: "text-yellow-600", bgLight: "bg-yellow-50" },
  { level: 4, label: "매우혼잡", color: "bg-orange-500", textColor: "text-orange-600", bgLight: "bg-orange-50" },
  { level: 5, label: "위험", color: "bg-red-500", textColor: "text-red-600", bgLight: "bg-red-50" },
];

function MonitorContent() {
  const searchParams = useSearchParams();
  const [capacities, setCapacities] = useState<Capacities | null>(null);
  const [currentCount, setCurrentCount] = useState(0);
  const [interval, setInterval] = useState<IntervalType>("1min");
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState<{ time: string; count: number; level: number }[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertLevel, setAlertLevel] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // URL 파라미터에서 수용 인원 정보 가져오기
  useEffect(() => {
    const level1 = searchParams.get("level1");
    const level2 = searchParams.get("level2");
    const level3 = searchParams.get("level3");
    const level4 = searchParams.get("level4");
    const level5 = searchParams.get("level5");

    if (level1 && level2 && level3 && level4 && level5) {
      setCapacities({
        level1: Number(level1),
        level2: Number(level2),
        level3: Number(level3),
        level4: Number(level4),
        level5: Number(level5),
      });
      // 초기값은 Level 3(혼잡) 기준으로 설정 - 알럿 테스트용
      setCurrentCount(Math.floor((Number(level2) + Number(level3)) / 2));
    }
  }, [searchParams]);

  // 현재 혼잡도 레벨 계산
  const getCurrentLevel = useCallback((count: number): number => {
    if (!capacities) return 1;
    if (count <= capacities.level1) return 1;
    if (count <= capacities.level2) return 2;
    if (count <= capacities.level3) return 3;
    if (count <= capacities.level4) return 4;
    return 5;
  }, [capacities]);

  // 임의의 인원 값 생성 (시뮬레이션)
  const generateRandomCount = useCallback(() => {
    if (!capacities) return;

    // 현재 값 기준으로 -15% ~ +20% 범위에서 변동
    const variation = currentCount * (Math.random() * 0.35 - 0.15);
    let newCount = Math.round(currentCount + variation);

    // 최소 0, 최대 level5의 110%로 제한
    newCount = Math.max(0, Math.min(newCount, Math.floor(capacities.level5 * 1.1)));

    setCurrentCount(newCount);

    const level = getCurrentLevel(newCount);
    const now = new Date();
    const timeStr = now.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

    setHistory(prev => [...prev.slice(-19), { time: timeStr, count: newCount, level }]);

    // Level 3 이상이면 알럿 표시
    if (level >= 3) {
      setAlertLevel(level);
      setShowAlert(true);
    }
  }, [capacities, currentCount, getCurrentLevel]);

  // 타이머 관리
  useEffect(() => {
    if (isRunning && capacities) {
      timerRef.current = globalThis.setInterval(generateRandomCount, demoIntervalMs[interval]);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, interval, generateRandomCount, capacities]);

  const handleStart = () => {
    setIsRunning(true);
    setHistory([]);
    generateRandomCount();
  };

  const handleStop = () => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  const currentLevel = getCurrentLevel(currentCount);
  const currentLevelInfo = levelInfo[currentLevel - 1];

  if (!capacities) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="rounded-lg bg-white p-8 shadow-sm text-center">
          <p className="text-zinc-500">수용 인원 정보가 없습니다.</p>
          <p className="text-sm text-zinc-400 mt-2">
            먼저 수용인원 계산을 진행해주세요.
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* 알럿 모달 */}
      {showAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className={`mx-4 max-w-md rounded-lg bg-white p-6 shadow-xl ${alertLevel >= 4 ? "animate-pulse" : ""}`}>
            <div className={`mb-4 text-center ${levelInfo[alertLevel - 1].textColor}`}>
              <div className="text-5xl mb-2">
                {alertLevel === 3 && "⚠️"}
                {alertLevel === 4 && "🚨"}
                {alertLevel === 5 && "🆘"}
              </div>
              <h3 className="text-xl font-bold">
                {levelInfo[alertLevel - 1].label} 상태
              </h3>
            </div>
            <p className="text-center text-zinc-700 mb-4">
              현재 인원: <strong>{currentCount.toLocaleString()}명</strong>
              <br />
              기준 인원: {capacities[`level${alertLevel}` as keyof Capacities].toLocaleString()}명
            </p>
            <p className="text-center text-sm text-zinc-500 mb-4">
              {alertLevel === 3 && "혼잡 상태입니다. 입장 속도를 조절해주세요."}
              {alertLevel === 4 && "매우 혼잡합니다! 입장을 제한해주세요."}
              {alertLevel === 5 && "위험 수준입니다! 즉시 인원 통제가 필요합니다."}
            </p>
            <div className="flex justify-center">
              <Button variant="primary" onClick={handleCloseAlert}>
                확인
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* 현재 상태 카드 */}
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-base font-semibold text-zinc-900">
            실시간 혼잡도 모니터링
          </h2>

          {/* 현재 인원 표시 */}
          <div className={`rounded-lg p-6 mb-6 ${currentLevelInfo.bgLight} border-2 ${currentLevel >= 3 ? "border-current animate-pulse" : "border-transparent"}`}>
            <div className="text-center">
              <p className={`text-sm ${currentLevelInfo.textColor} mb-1`}>현재 인원</p>
              <p className={`text-5xl font-bold ${currentLevelInfo.textColor}`}>
                {currentCount.toLocaleString()}
                <span className="text-2xl">명</span>
              </p>
              <div className={`inline-block mt-3 px-4 py-1 rounded-full ${currentLevelInfo.color} text-white font-medium`}>
                Level {currentLevel} - {currentLevelInfo.label}
              </div>
            </div>
          </div>

          {/* 혼잡도 게이지 */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-zinc-500 mb-1">
              <span>0</span>
              <span>{capacities.level5.toLocaleString()}</span>
            </div>
            <div className="h-4 bg-zinc-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${currentLevelInfo.color}`}
                style={{ width: `${Math.min((currentCount / capacities.level5) * 100, 100)}%` }}
              />
            </div>
            <div className="flex mt-1">
              {levelInfo.map((info, idx) => {
                const prevCapacity = idx === 0 ? 0 : capacities[`level${idx}` as keyof Capacities];
                const currCapacity = capacities[`level${idx + 1}` as keyof Capacities];
                const width = ((currCapacity - prevCapacity) / capacities.level5) * 100;
                return (
                  <div
                    key={info.level}
                    className="text-center text-xs"
                    style={{ width: `${width}%` }}
                  >
                    <span className={info.textColor}>{info.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 레벨별 기준 인원 */}
          <div className="grid grid-cols-5 gap-2 mb-6">
            {levelInfo.map((info) => (
              <div
                key={info.level}
                className={`p-3 rounded-lg text-center ${currentLevel === info.level ? info.bgLight + " ring-2 ring-current" : "bg-zinc-50"}`}
              >
                <div className={`text-xs ${info.textColor}`}>{info.label}</div>
                <div className={`text-sm font-bold ${info.textColor}`}>
                  {capacities[`level${info.level}` as keyof Capacities].toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* 컨트롤 영역 */}
          <div className="flex items-center justify-center gap-4 border-t border-zinc-100 pt-6">
            <Select
              label=""
              id="interval"
              options={intervalOptions}
              value={interval}
              onChange={(e) => setInterval(e.target.value as IntervalType)}
              disabled={isRunning}
            />
            {!isRunning ? (
              <Button variant="primary" onClick={handleStart}>
                모니터링 시작
              </Button>
            ) : (
              <Button variant="secondary" onClick={handleStop}>
                모니터링 중지
              </Button>
            )}
          </div>

          {isRunning && (
            <p className="text-center text-xs text-zinc-500 mt-2">
              데모 모드: {interval === "1min" ? "3초" : interval === "10min" ? "5초" : "10초"}마다 업데이트
            </p>
          )}
        </div>

        {/* 히스토리 */}
        {history.length > 0 && (
          <div className="mt-6 rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-zinc-900">
              인원 변동 히스토리
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-zinc-700">시간</th>
                    <th className="px-4 py-2 text-right text-zinc-700">인원</th>
                    <th className="px-4 py-2 text-center text-zinc-700">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {[...history].reverse().map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50">
                      <td className="px-4 py-2 text-zinc-600">{item.time}</td>
                      <td className="px-4 py-2 text-right font-bold text-zinc-900">{item.count.toLocaleString()}명</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white ${levelInfo[item.level - 1].color}`}>
                          {levelInfo[item.level - 1].label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 안내 */}
        <div className="mt-6 rounded-lg bg-amber-50 p-4">
          <p className="text-sm text-amber-700">
            <strong>안내:</strong> 현재 인원은 시뮬레이션 데이터입니다.
            실제 운영 시에는 입장 게이트 시스템과 연동하여 실시간 데이터를 받아야 합니다.
          </p>
        </div>
      </main>
    </>
  );
}

function LoadingFallback() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <div className="rounded-lg bg-white p-8 shadow-sm text-center">
        <p className="text-zinc-500">로딩 중...</p>
      </div>
    </main>
  );
}

export default function MonitorPage() {
  return (
    <div className="min-h-screen bg-zinc-100">
      <Header />
      <Suspense fallback={<LoadingFallback />}>
        <MonitorContent />
      </Suspense>
    </div>
  );
}
