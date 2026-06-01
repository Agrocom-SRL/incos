import { useEffect } from 'react';
import { HorariosArmadoContext } from '@application-institucional/horarios/context';
import { useGestionHorariosArmadoState } from '@application-institucional/horarios/hooks/state/useGestionHorariosArmadoState';
import { useGestionHorariosPlantillaState } from '@application-institucional/horarios/hooks/state/useGestionHorariosPlantillaState';
import { mergeGrillaWithOfertaCursos } from '@application-institucional/horarios/mappers/grillaHorarioMapper';

export const HorariosArmadoProvider = ({ children }) => {
    const armadoState = useGestionHorariosArmadoState();
    const ofertaParalelo = useGestionHorariosPlantillaState();

    useEffect(() => {
        if (!ofertaParalelo.filasOferta?.length) return;
        const merged = mergeGrillaWithOfertaCursos(
            armadoState.serverSchedules,
            ofertaParalelo.filasOferta,
        );
        armadoState.setDraftSchedules(merged);
    }, [ofertaParalelo.filasOferta, armadoState.serverSchedules, armadoState.setDraftSchedules]);

    const value = {
        ...armadoState,
        ofertaParalelo,
    };
    return <HorariosArmadoContext.Provider value={value}>{children}</HorariosArmadoContext.Provider>;
};
