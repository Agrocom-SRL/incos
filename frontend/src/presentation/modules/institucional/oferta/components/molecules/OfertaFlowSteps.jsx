import { Space } from 'antd';
import { StepPill } from '@institucional/horarios/components/atoms';

const FLOW_STEPS = [
  { key: 0, label: 'Gestión' },
  { key: 1, label: 'Planes' },
  { key: 2, label: 'Paralelos + Oferta' },
];

const OfertaFlowSteps = ({ currentStep, canGoToStep, onGoToStep }) => (
  <Space wrap className="oferta-flow-steps" style={{ width: '100%' }}>
    {FLOW_STEPS.map((step, index) => (
      <StepPill
        key={step.key}
        index={index + 1}
        label={step.label}
        isActive={step.key === currentStep}
        isCompleted={step.key < currentStep}
        onClick={() => {
          if (canGoToStep(step.key)) {
            onGoToStep(step.key);
          }
        }}
      />
    ))}
  </Space>
);

export default OfertaFlowSteps;
