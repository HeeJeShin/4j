import { Capacities } from "@/types";

interface CongestionLevelProps {
    level: number;
    capacities: Capacities;
    recommended: number;
    maximum: number;
}

const levelLabels = [
    { level: 1, label: "안전", color: "bg-emerald-500" },
    { level: 2, label: "여유", color: "bg-green-400" },
    { level: 3, label: "혼잡", color: "bg-yellow-400" },
    { level: 4, label: "위험", color: "bg-orange-500" },
    { level: 5, label: "매우 위험", color: "bg-red-500" },
];

export default function CongestionLevel({
    capacities,
    recommended,
    maximum,
}: CongestionLevelProps) {
    const capacityValues = [
        capacities.level1,
        capacities.level2,
        capacities.level3,
        capacities.level4,
        capacities.level5,
    ];

    return (
        <div className="space-y-4">
            {/* 권장/최대 인원 */}
            <div className="grid grid-cols-2 gap-4 text-center">
                <div className="rounded-lg bg-emerald-50 p-4">
                    <p className="text-sm text-zinc-600">권장 인원</p>
                    <p className="text-2xl font-bold text-emerald-600">
                        {recommended.toLocaleString()}명
                    </p>
                </div>
                <div className="rounded-lg bg-amber-50 p-4">
                    <p className="text-sm text-zinc-600">최대 인원</p>
                    <p className="text-2xl font-bold text-amber-600">
                        {maximum.toLocaleString()}명
                    </p>
                </div>
            </div>

            {/* 혼잡도 레벨 바 */}
            <div className="space-y-2">
                <p className="text-sm font-medium text-zinc-700">혼잡도별 수용인원</p>
                <div className="flex gap-1 rounded-lg overflow-hidden">
                    {levelLabels.map((item, index) => (
                        <div
                            key={item.level}
                            className={`flex-1 ${item.color} py-2 text-center`}
                        >
                            <p className="text-xs text-white font-medium">{item.label}</p>
                            <p className="text-sm text-white font-bold">
                                {capacityValues[index].toLocaleString()}명
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
