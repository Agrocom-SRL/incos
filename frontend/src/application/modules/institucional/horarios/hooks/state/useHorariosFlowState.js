import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const HORARIOS_STEPS = [
    { key: 'gestion', label: 'Gestion', path: '/institucional/horarios' },
    { key: 'plantilla', label: 'Plantilla', path: '/institucional/horarios/plantilla' },
    { key: 'armado', label: 'Armado', path: '/institucional/horarios/armado' },
    { key: 'conflictos', label: 'Conflictos', path: '/institucional/horarios/conflictos' },
    { key: 'publicacion', label: 'Publicacion', path: '/institucional/horarios/publicacion' },
];

export const useHorariosFlowState = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const currentStep = useMemo(() => {
        return HORARIOS_STEPS.find((step) => step.path === location.pathname) || HORARIOS_STEPS[0];
    }, [location.pathname]);

    const currentIndex = useMemo(() => {
        return HORARIOS_STEPS.findIndex((step) => step.key === currentStep.key);
    }, [currentStep.key]);

    const goToStep = (stepKey) => {
        const target = HORARIOS_STEPS.find((step) => step.key === stepKey);
        if (!target) return;
        navigate(target.path);
    };

    const goNextStep = () => {
        const next = HORARIOS_STEPS[currentIndex + 1];
        if (!next) return;
        navigate(next.path);
    };

    const goPrevStep = () => {
        const prev = HORARIOS_STEPS[currentIndex - 1];
        if (!prev) return;
        navigate(prev.path);
    };

    return {
        steps: HORARIOS_STEPS,
        currentStep,
        currentIndex,
        isFirstStep: currentIndex <= 0,
        isLastStep: currentIndex >= HORARIOS_STEPS.length - 1,
        goToStep,
        goNextStep,
        goPrevStep,
    };
};
