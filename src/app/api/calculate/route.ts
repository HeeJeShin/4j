import { NextRequest, NextResponse } from "next/server";

// 행사장 유형별 1인당 면적 (㎡)
const SPACE_PER_PERSON = {
    standing: 0.5,    // 스탠딩
    banquet: 1.5,     // 연회형 (1.3~1.9 평균)
    theater: 0.8,     // 극장형 (0.65~1.0 평균)
    classroom: 2.0,   // 교실형
};

// 기준 밀도 (명/㎡)
const STANDARD_DENSITY = {
    standing: 2.0,
    banquet: 0.7,
    theater: 1.2,
    classroom: 0.5,
};

interface CalculationInput {
    totalArea: number;
    venueType: "standing" | "banquet" | "theater" | "classroom";
    entranceCount?: number;
    aisleWidth?: number;
}

export async function POST(request: NextRequest) {
    try {
        const body: CalculationInput = await request.json();
        const { totalArea, venueType, entranceCount = 2, aisleWidth = 2 } = body;

        if (!totalArea || totalArea <= 0) {
            return NextResponse.json(
                { error: "유효한 면적을 입력해주세요." },
                { status: 400 }
            );
        }

        const spacePerPerson = SPACE_PER_PERSON[venueType];
        const standardDensity = STANDARD_DENSITY[venueType];

        // 1. 물리적 최대 인원 (이론치)
        const theoreticalMax = Math.floor(totalArea / spacePerPerson);

        // 2. 혼잡도 기반 레벨별 인원 계산
        // Level 1 (안전): 기준 밀도의 30%
        // Level 2 (여유): 기준 밀도의 50%
        // Level 3 (혼잡): 기준 밀도의 70%
        // Level 4 (위험): 기준 밀도의 90%
        // Level 5 (매우 위험): 기준 밀도의 110%
        const capacities = {
            level1: Math.floor(totalArea * standardDensity * 0.3),
            level2: Math.floor(totalArea * standardDensity * 0.5),
            level3: Math.floor(totalArea * standardDensity * 0.7),
            level4: Math.floor(totalArea * standardDensity * 0.9),
            level5: Math.floor(totalArea * standardDensity * 1.1),
        };

        // 3. 비상구 처리 가능 인원 (1개당 250~300명)
        const exitCapacity = entranceCount * 275;

        // 4. 통로 병목 계산 (소방 기준: 82명당 1m 필요)
        const requiredAisleWidth = theoreticalMax / 82;
        const bottleneckRisk = requiredAisleWidth > aisleWidth;

        // 5. 권장/최대 인원 산출
        // 권장: Level 2 (여유) 기준
        // 최대: Level 3 (혼잡) 기준, 비상구 처리량 고려
        const recommended = Math.min(capacities.level2, exitCapacity);
        const maximum = Math.min(capacities.level3, exitCapacity);

        // 6. AI 보정 적용 (10~30% 감소)
        const aiCorrectionFactor = 0.85; // 15% 감소
        const correctedRecommended = Math.floor(recommended * aiCorrectionFactor);
        const correctedMaximum = Math.floor(maximum * aiCorrectionFactor);

        return NextResponse.json({
            input: {
                totalArea,
                venueType,
                entranceCount,
                aisleWidth,
            },
            calculation: {
                spacePerPerson,
                theoreticalMax,
                exitCapacity,
                bottleneckRisk,
            },
            capacities: {
                level1: Math.floor(capacities.level1 * aiCorrectionFactor),
                level2: Math.floor(capacities.level2 * aiCorrectionFactor),
                level3: Math.floor(capacities.level3 * aiCorrectionFactor),
                level4: Math.floor(capacities.level4 * aiCorrectionFactor),
                level5: Math.floor(capacities.level5 * aiCorrectionFactor),
            },
            result: {
                recommended: correctedRecommended,
                maximum: correctedMaximum,
                safetyNote:
                    correctedMaximum < theoreticalMax
                        ? "비상구 처리량을 고려하여 최대 인원이 조정되었습니다."
                        : null,
            },
        });
    } catch (error) {
        console.error("계산 오류:", error);
        return NextResponse.json(
            { error: "계산 중 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}