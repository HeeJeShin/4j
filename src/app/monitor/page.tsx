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
  const [showPreview, setShowPreview] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{
    level: number;
    count: number;
    time: string;
  }>>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
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
      minute: "2-digit"
    });

    setHistory(prev => [...prev.slice(-19), { time: timeStr, count: newCount, level }]);

    // Level 3 이상이면 카톡 메시지 추가
    if (level >= 3 && showPreview) {
      setChatMessages(prev => [...prev, { level, count: newCount, time: timeStr }]);
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

  // 채팅 메시지 추가 시 스크롤 아래로 이동
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleStart = () => {
    setIsRunning(true);
    setHistory([]);
    setChatMessages([]);
    generateRandomCount();
  };

  const handleStop = () => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
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
      {/* 아이폰 목업 + 카카오톡 대화 */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setShowPreview(false)}
        >
          {/* 아이폰 목업 */}
          <div
            className="w-[360px] h-[720px] rounded-[50px] p-3 shadow-2xl bg-gradient-to-br from-zinc-800 via-zinc-900 to-black"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 노치 */}
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-10"></div>

            {/* 화면 */}
            <div className="w-full h-full bg-white rounded-[38px] overflow-hidden relative">
              {/* 상태바 */}
              <div className="absolute top-0 left-0 right-0 h-10 flex items-center justify-between px-6 pt-2 text-zinc-800 text-xs z-10 bg-white">
                <span className="font-semibold">9:41</span>
                <div className="flex items-center gap-1">
                  <span>📶</span>
                  <span>📡</span>
                  <span>🔋</span>
                </div>
              </div>

              {/* 카카오톡 대화 화면 */}
              <div className="w-full h-full pt-10">
                {/* 채팅방 헤더 */}
                <div className="bg-zinc-100 border-b border-zinc-200 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button className="text-zinc-600">←</button>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                        💬
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-800">4J 혼잡도 알림</p>
                        <p className="text-xs text-zinc-500">실시간 모니터링</p>
                      </div>
                    </div>
                  </div>
                  <button className="text-zinc-600 text-lg">☰</button>
                </div>

                {/* 대화 내용 */}
                <div className="h-[calc(100%-120px)] overflow-y-auto bg-sky-100 p-4 space-y-3">
                  {/* 시스템 메시지 */}
                  <div className="flex justify-center">
                    <div className="bg-white/80 px-3 py-1 rounded-full text-xs text-zinc-600">
                      {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                    </div>
                  </div>

                  {/* 채팅 메시지 목록 */}
                  {chatMessages.length === 0 && (
                    <div className="flex flex-col items-start">
                      <div className="flex items-end gap-2 max-w-[80%]">
                        <div className="bg-yellow-300 rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
                          <p className="text-sm text-zinc-800">
                            실시간 혼잡도 모니터링이 시작되면 알림을 보내드립니다.
                          </p>
                        </div>
                        <span className="text-xs text-zinc-500 mb-1 whitespace-nowrap">방금</span>
                      </div>
                    </div>
                  )}

                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className="flex flex-col items-start animate-slide-in">
                      <div className="flex items-end gap-2 max-w-[80%]">
                        <div className="bg-yellow-300 rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
                          <div className="flex items-start gap-2 mb-1">
                            <span className="text-sm">
                              {msg.level === 3 && "⚠️"}
                              {msg.level === 4 && "🚨"}
                              {msg.level === 5 && "🆘"}
                            </span>
                            <p className={`font-bold text-base ${levelInfo[msg.level - 1].textColor}`}>
                              {levelInfo[msg.level - 1].label} 상태 알림!
                            </p>
                          </div>
                          <div className="text-xs text-zinc-800 space-y-1">
                            <p>현재 인원: <strong className="text-zinc-900">{msg.count.toLocaleString()}명</strong></p>
                            <p>기준 인원: {capacities[`level${msg.level}` as keyof Capacities].toLocaleString()}명</p>
                            <p className="mt-2 text-zinc-700">
                              {msg.level === 3 && "입장 속도 조절이 필요합니다"}
                              {msg.level === 4 && "⚠️ 입장을 제한해주세요!"}
                              {msg.level === 5 && "🚨 즉시 인원 통제 필요!"}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-zinc-500 mb-1 whitespace-nowrap">{msg.time}</span>
                      </div>
                    </div>
                  ))}

                  {/* 스크롤 끝 마커 */}
                  <div ref={chatEndRef} />
                </div>

                {/* 입력창 (disabled) */}
                <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-zinc-200 px-3 py-2 pointer-events-none opacity-60">
                  <div className="flex items-center gap-2">
                    <button className="text-zinc-400 text-lg" disabled>+</button>
                    <div className="flex-1 bg-zinc-100 rounded-full px-3 py-1.5">
                      <p className="text-xs text-zinc-400">메시지를 입력하세요</p>
                    </div>
                    <button className="text-zinc-400 text-lg" disabled>😊</button>
                  </div>
                </div>
              </div>
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
          <div className="flex flex-col items-center gap-4 border-t border-zinc-100 pt-6">
            <div className="flex items-center justify-center gap-4">
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

            {/* 카카오톡 알림 미리보기 버튼 */}
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-zinc-800 font-medium rounded-lg shadow-sm transition-colors text-sm"
            >
              <span className="text-lg">💬</span>
              <span>{showPreview ? "미리보기 닫기" : "카톡 알림 미리보기"}</span>
            </button>
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
            <div className="overflow-x-auto max-h-48 overflow-y-auto">
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
