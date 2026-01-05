interface Step {
  label: string;
  color: string;
}

interface ProgressStepperProps {
  currentStep: number;
  steps: Step[];
}

export default function ProgressStepper({ currentStep, steps }: ProgressStepperProps) {
  return (
    <div className="w-full py-10">
      <div className="flex items-center justify-center gap-8 max-w-4xl mx-auto px-6">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isLast = index === steps.length - 1;

          return (
            <div key={stepNumber} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center relative min-w-[120px]">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                    isActive
                      ? `${step.color} text-white shadow-lg scale-110`
                      : isCompleted
                      ? "bg-emerald-500 text-white shadow-md"
                      : "bg-zinc-200 text-zinc-400"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                <p
                  className={`mt-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                    isActive ? "text-zinc-900" : isCompleted ? "text-zinc-700" : "text-zinc-400"
                  }`}
                >
                  {step.label}
                </p>

                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute -bottom-6 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                )}
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="w-24 h-0.5 mx-4 relative">
                  <div className="absolute inset-0 bg-zinc-200 rounded-full" />
                  <div
                    className={`absolute inset-0 rounded-full transition-all duration-500 ${
                      isCompleted ? "bg-emerald-500 w-full" : "bg-transparent w-0"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
