"use client";

interface Step {
  id: number;
  label: string;
}

interface StepWizardProps {
  steps: Step[];
  currentStep: number;
}

export default function StepWizard({ steps, currentStep }: StepWizardProps) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center flex-1 last:flex-none">
          {/* Dot */}
          <div className="flex flex-col items-center">
            <div
              className={`step-dot ${
                currentStep === step.id
                  ? "active"
                  : currentStep > step.id
                  ? "completed"
                  : "pending"
              }`}
            >
              {currentStep > step.id ? (
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <span>{step.id}</span>
              )}
            </div>
            <span
              className={`text-xs mt-1 whitespace-nowrap ${
                currentStep === step.id
                  ? "text-[#35D07F] font-medium"
                  : currentStep > step.id
                  ? "text-gray-400"
                  : "text-gray-600"
              }`}
            >
              {step.label}
            </span>
          </div>

          {/* Line */}
          {i < steps.length - 1 && (
            <div
              className={`step-line mb-4 mx-1 ${
                currentStep > step.id ? "completed" : ""
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
