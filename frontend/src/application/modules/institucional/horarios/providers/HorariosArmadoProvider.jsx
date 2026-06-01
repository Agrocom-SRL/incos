import { useEffect, useRef } from 'react';
import { HorariosArmadoContext } from '@application-institucional/horarios/context';
import { useGestionHorariosArmadoState } from '@application-institucional/horarios/hooks/state/useGestionHorariosArmadoState';
import { useGestionHorariosPlantillaState } from '@application-institucional/horarios/hooks/state/useGestionHorariosPlantillaState';
import { mergeGrillaWithOfertaCursos } from '@application-institucional/horarios/mappers/grillaHorarioMapper';

export const HorariosArmadoProvider = ({ children }) => {
    const armadoState = useGestionHorariosArmadoState();
    const ofertaParalelo = useGestionHorariosPlantillaState();
    const lastDraftSigRef = useRef('');

    useEffect(() => {
        const merged = mergeGrillaWithOfertaCursos(
            armadoState.serverSchedules,
            ofertaParalelo.filasOferta ?? [],
        );
        let sig = '';
        try {
            sig = JSON.stringify(merged);
        } catch {
            sig = String(merged?.length ?? 0);
        }
        if (sig === lastDraftSigRef.current) return;
        lastDraftSigRef.current = sig;

        armadoState.setDraftSchedules((prev) => {
            try {
                if (JSON.stringify(prev) === sig) return prev;
            } catch {
                /* noop */
            }
            return merged;
        });
    }, [armadoState.serverSchedules, ofertaParalelo.filasOferta, armadoState.setDraftSchedules]);

    const value = {
        ...armadoState,
        ofertaParalelo,
    };
    return <HorariosArmadoContext.Provider value={value}>{children}</HorariosArmadoContext.Provider>;
};
