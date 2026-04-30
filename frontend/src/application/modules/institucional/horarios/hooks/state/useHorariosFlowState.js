import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HORARIOS_STEPS } from '@application-institucional/horarios/utils/horarios.steps';
import { resolveStepByKey, resolveStepByPath, resolveStepIndex } from '@application-institucional/horarios/utils/flowStepResolvers';

export const useHorariosFlowState = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const { currentStep, currentIndex } = useMemo(() => {
        const step = resolveStepByPath(pathname, HORARIOS_STEPS);
        const index = resolveStepIndex(step.key, HORARIOS_STEPS);
        return { currentStep: step, currentIndex: index };
    }, [pathname]);

    const goToStep = useCallback((stepKey) => {
        const target = resolveStepByKey(stepKey, HORARIOS_STEPS);
        if (!target) return;
        navigate(target.path);
    }, [navigate]);

    const goNextStep = useCallback(() => {
        const next = HORARIOS_STEPS[currentIndex + 1];
        if (!next) return;
        navigate(next.path);
    }, [currentIndex, navigate]);

    const goPrevStep = useCallback(() => {
        const prev = HORARIOS_STEPS[currentIndex - 1];
        if (!prev) return;
        navigate(prev.path);
    }, [currentIndex, navigate]);

    return {
        steps: HORARIOS_STEPS,
        currentStep,
        currentIndex,
        isFirstStep: currentIndex === 0,
        isLastStep: currentIndex === HORARIOS_STEPS.length - 1,
        goToStep,
        goNextStep,
        goPrevStep,
    };
};
