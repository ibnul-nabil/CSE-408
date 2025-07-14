import React from 'react';
import { CalendarIcon, MapIcon, RouteIcon, CheckCircle, ChevronRight } from 'lucide-react';
import './StepIndicator.css';

const StepIndicator = ({ currentStep }) => {
  const steps = [
    { number: 1, title: "Tour Details", icon: CalendarIcon },
    { number: 2, title: "Add Places", icon: MapIcon },
    { number: 3, title: "Route Preview", icon: RouteIcon },
    { number: 4, title: "Confirm Tour", icon: CheckCircle }
  ];

  return (
    <div className="step-indicator">
      {steps.map((step, index) => (
        <div key={step.number} className="step-item">
          <div className={`step-icon ${currentStep >= step.number ? 'active' : ''}`}>
            <step.icon className="step-icon-svg" />
          </div>
          <div className="step-content">
            <p className={`step-title ${currentStep >= step.number ? 'active' : ''}`}>
              {step.title}
            </p>
          </div>
          {index < steps.length - 1 && (
            <ChevronRight className="step-chevron" />
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator; 