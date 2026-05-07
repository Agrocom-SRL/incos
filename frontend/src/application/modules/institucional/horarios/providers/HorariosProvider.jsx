import { HorariosContext } from '@application-institucional/horarios/context';
import { useGestionHorariosDashboardState, useHorariosFlowState } from '@application-institucional/horarios/hooks';

export const HorariosProvider = ({ children }) => {
    const flowState = useHorariosFlowState();
    const dashboardState = useGestionHorariosDashboardState();
    const value = { ...flowState, ...dashboardState };
    return <HorariosContext.Provider value={value}>{children}</HorariosContext.Provider>;
};
