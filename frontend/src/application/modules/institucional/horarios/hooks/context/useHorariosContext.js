import { useContext } from 'react';
import { HorariosContext } from '@application-institucional/horarios/context';

export const useHorariosContext = () => {
    const ctx = useContext(HorariosContext);
    if (!ctx) {
        throw new Error('useHorariosContext debe usarse dentro de HorariosProvider');
    }
    return ctx;
};

export const useHorariosFlow = () => {
    const ctx = useHorariosContext();
    return {
        steps: ctx.steps,
        currentStep: ctx.currentStep,
        currentIndex: ctx.currentIndex,
        isFirstStep: ctx.isFirstStep,
        isLastStep: ctx.isLastStep,
        goToStep: ctx.goToStep,
        goNextStep: ctx.goNextStep,
        goPrevStep: ctx.goPrevStep,
    };
};
