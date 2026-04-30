import { Space } from 'antd';
import { useHorariosFlow } from '@application-institucional/horarios';
import { StepPill } from '../atoms';

const HorariosFlowSteps = () => {
    const { steps, currentStep, currentIndex, goToStep } = useHorariosFlow();
    return (
        <Space wrap style={{ width: '100%' }}>
            {steps.map((step) => (
                <StepPill
                    key={step.key}
                    index={steps.findIndex((item) => item.key === step.key) + 1}
                    label={step.label}
                    isActive={step.key === currentStep?.key}
                    isCompleted={steps.findIndex((item) => item.key === step.key) < currentIndex}
                    onClick={() => goToStep(step.key)}
                />
            ))}
        </Space>
    );
};

export default HorariosFlowSteps;
