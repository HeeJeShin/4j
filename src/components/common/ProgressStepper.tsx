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
    <div className="w-full py-8">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isLast = index === steps.length - 1;

          return (
            <div key={stepNumber} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    isActive
                      ? `${step.color} text-white`
                      : isCompleted
                      ? "bg-zinc-400 text-white"
                      : "bg-zinc-200 text-zinc-500"
                  }`}
                >
                  {isCompleted ? "✓" : stepNumber}
                </div>
                <p
                  className={`mt-2 text-sm font-medium ${
                    isActive ? "text-zinc-900" : "text-zinc-500"
                  }`}
                >
                  {step.label}
                </p>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={`flex-1 h-1 mx-4 transition-colors ${
                    isCompleted ? "bg-zinc-400" : "bg-zinc-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
