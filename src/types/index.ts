export type VenueType = "standing" | "banquet" | "theater";

export interface EventInfo {
    eventName: string;
    totalArea: number;
    venueType: VenueType;
    floorPlan?: File;
}

export interface AnalysisResult {
    boothCount: number;
    emptySpaceRatio: number;
    entranceCount: number;
    zones: string[];
    features: string[];
    analysis: string;
    boothSize: number;
    estimatedBoothArea: number;
    estimatedTotalArea: number;
    estimatedDimensions?: {
        width: number;
        height: number;
    };
    areaCalculationMethod?: string;
}

export interface Capacities {
    level1: number;
    level2: number;
    level3: number;
    level4: number;
    level5: number;
}

export interface CalculationResult {
    input: {
        totalArea: number;
        venueType: VenueType;
        entranceCount: number;
        aisleWidth: number;
    };
    calculation: {
        spacePerPerson: number;
        theoreticalMax: number;
        exitCapacity: number;
        bottleneckRisk: boolean;
    };
    capacities: Capacities;
    result: {
        recommended: number;
        maximum: number;
        safetyNote: string | null;
    };
}