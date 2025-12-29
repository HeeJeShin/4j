import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

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

        // 이미지를 base64로 변환
        const bytes = await image.arrayBuffer();
        const base64 = Buffer.from(bytes).toString("base64");

        // Gemini 모델 초기화
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            이 행사장/전시장 도면을 분석해주세요.
            분석 항목:
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
        return NextResponse.json(
            { error: "이미지 분석 중 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}