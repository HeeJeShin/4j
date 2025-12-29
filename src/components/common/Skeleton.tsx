interface SkeletonProps {
    className?: string;
}

export default function Skeleton({ className = "" }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse bg-zinc-200 rounded ${className}`}
        />
    );
}

export function AnalysisSkeleton() {
    return (
        <div className="mt-4 rounded bg-zinc-50 p-4">
            <Skeleton className="h-5 w-32 mb-3" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-4 w-36" />
            </div>
        </div>
    );
}
