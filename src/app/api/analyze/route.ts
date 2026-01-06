import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

// Mock 데이터 (로컬 테스트용)
const MOCK_ANALYSIS_RESULT = {
    isFloorPlan: true,
    boothCount: 24,
    emptySpaceRatio: 0.35,
    entranceCount: 3,
    zones: ["Zone A", "Zone B", "Zone C"],
    features: ["메인 무대", "안내 데스크", "휴게 라운지"],
    analysis: "[MOCK] 전시장 도면입니다. 24개의 부스가 3개 존으로 구분되어 있습니다.",
    estimatedDimensions: {
        width: 50,
        height: 40
    },
    estimatedTotalArea: 2000,
    areaCalculationMethod: "[MOCK] 테스트용 샘플 데이터"
};

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const image = formData.get("image") as File;
        const boothSize = Number(formData.get("boothSize")) || 9;

        if (!image) {
            return NextResponse.json(
                { error: "이미지가 필요합니다." },
                { status: 400 }
            );
        }

        // Mock 에러 모드: MOCK_ERROR=quota 설정 시 할당량 초과 에러 시뮬레이션
        if (process.env.MOCK_ERROR === "quota") {
            console.log("[MOCK MODE] 할당량 초과 에러 시뮬레이션");
            await new Promise(resolve => setTimeout(resolve, 1000));
            return NextResponse.json(
                { error: "429 Resource has been exhausted (quota)" },
                { status: 500 }
            );
        }

        // Mock 모드: USE_MOCK_DATA=true 설정 시 API 호출 없이 샘플 데이터 반환
        if (process.env.USE_MOCK_DATA === "true") {
            console.log("[MOCK MODE] 샘플 데이터 반환");
            // 실제 분석처럼 약간의 딜레이 추가
            await new Promise(resolve => setTimeout(resolve, 1500));

            return NextResponse.json({
                ...MOCK_ANALYSIS_RESULT,
                boothSize,
                estimatedBoothArea: MOCK_ANALYSIS_RESULT.boothCount * boothSize,
            });
        }

        // 이미지를 base64로 변환
        const bytes = await image.arrayBuffer();
        const base64 = Buffer.from(bytes).toString("base64");

        // Gemini 모델 초기화
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            먼저 이 이미지가 행사장/전시장 도면인지 판단해주세요.

            도면이 아닌 경우 (사람 사진, 풍경, 음식, 동물, 일반 사진 등):
            {
              "isFloorPlan": false,
              "detectedContent": "감지된 이미지 내용 (예: 고양이, 음식 사진, 풍경 등)"
            }

            도면인 경우, 다음을 분석해주세요:
            1. 부스 개수 (P1, P2, S1, S2 등 번호가 붙은 부스들)
            2. 통로 및 빈 공간 비율 (0~1 사이 값)
            3. 출입구 개수
            4. 존(Zone) 구분
            5. 특이사항 (무대, 라운지 등)
            6. 도면에 표시된 치수나 스케일을 참고하여 행사장 총 면적(㎡)을 추정해주세요.
               - 도면에 치수가 있으면 그것을 기준으로 계산
               - 치수가 없으면 일반적인 부스 크기(3m x 3m = 9㎡)를 기준으로 추정
               - 전체 공간의 가로 x 세로 크기를 추정하여 계산

            다음 JSON 형식으로만 응답해주세요:
            {
              "isFloorPlan": true,
              "boothCount": 숫자,
              "emptySpaceRatio": 0~1 사이 소수,
              "entranceCount": 숫자,
              "zones": ["Zone 1", "Zone 2"],
              "features": ["Conference Stage", "Open Lounge"],
              "analysis": "간단한 분석 설명",
              "estimatedDimensions": {
                "width": 가로 길이(m),
                "height": 세로 길이(m)
              },
              "estimatedTotalArea": 추정 총 면적(㎡),
              "areaCalculationMethod": "면적 계산 방법 설명 (예: 도면 치수 기준, 부스 크기 기준 추정 등)"
            }
        `;

        // Gemini Vision API 호출
        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: image.type || "image/jpeg",
                    data: base64,
                },
            },
            prompt,
        ]);

        const response = result.response;
        const text = response.text();

        // JSON 파싱
        const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
        const analysisResult = JSON.parse(jsonStr);

        // 도면이 아닌 경우 에러 반환
        if (analysisResult.isFloorPlan === false) {
            return NextResponse.json(
                {
                    error: "NOT_FLOOR_PLAN",
                    detectedContent: analysisResult.detectedContent,
                },
                { status: 400 }
            );
        }

        // AI가 면적을 추정하지 못한 경우 부스 기반으로 계산
        let totalArea = analysisResult.estimatedTotalArea;
        if (!totalArea || totalArea <= 0) {
            const boothArea = analysisResult.boothCount * boothSize;
            totalArea = Math.round(boothArea / (1 - analysisResult.emptySpaceRatio));
        }

        return NextResponse.json({
            ...analysisResult,
            boothSize,
            estimatedBoothArea: analysisResult.boothCount * boothSize,
            estimatedTotalArea: totalArea,
        });
    } catch (error) {
        console.error("분석 오류:", error);
        const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}