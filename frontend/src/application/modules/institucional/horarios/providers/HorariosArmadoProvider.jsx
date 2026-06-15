import { useEffect, useRef, useState } from 'react';
import { App } from 'antd';
import { HorariosArmadoContext } from '@application-institucional/horarios/context';
import { useGestionHorariosArmadoState } from '@application-institucional/horarios/hooks/state/useGestionHorariosArmadoState';
import { useArmadoOfertaLectura } from '@application-institucional/horarios/hooks/state/useArmadoOfertaLectura';
import { useAsignacionDocenteApi } from '@application-institucional/horarios/hooks/api/useAsignacionDocenteApi';
import { indexAsignacionesPorOferta } from '@application-institucional/horarios/mappers/asignacionDocenteMatrizMapper';
import { mergeGrillaWithOfertaCursos } from '@application-institucional/horarios/mappers/grillaHorarioMapper';
import { courseSchedulesSignature } from '@application-institucional/horarios/utils/courseSchedulesSignature';

export const HorariosArmadoProvider = ({ children }) => {
    const { notification } = App.useApp();
    const armadoState = useGestionHorariosArmadoState(notification);
    const ofertaLectura = useArmadoOfertaLectura(armadoState.paraleloGestionId);
    const { fetchAsignacionesSilent } = useAsignacionDocenteApi();
    const [asignacionesPorOferta, setAsignacionesPorOferta] = useState(null);
    const lastDraftSigRef = useRef('');

    useEffect(() => {
        const pgId = armadoState.paraleloGestionId;
        if (!pgId) {
            setAsignacionesPorOferta(null);
            return;
        }
        let cancelled = false;
        (async () => {
            const res = await fetchAsignacionesSilent({
                paralelo_gestion_id: pgId,
                vigente: true,
                page: 1,
                limit: 200,
            });
            if (cancelled) return;
            if (res.success) {
                const rows = res.data?.asignaciones ?? [];
                setAsignacionesPorOferta(indexAsignacionesPorOferta(rows));
            } else {
                setAsignacionesPorOferta(null);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [armadoState.paraleloGestionId, fetchAsignacionesSilent]);

    useEffect(() => {
        const merged = mergeGrillaWithOfertaCursos(
            armadoState.serverSchedules,
            ofertaLectura.filasOferta ?? [],
            asignacionesPorOferta,
        );
        const sig = courseSchedulesSignature(merged);
        if (sig === lastDraftSigRef.current) return;
        lastDraftSigRef.current = sig;

        armadoState.setDraftSchedules((prev) => {
            if (courseSchedulesSignature(prev) === sig) return prev;
            return merged;
        });
    }, [
        armadoState.serverSchedules,
        ofertaLectura.filasOferta,
        asignacionesPorOferta,
        armadoState.setDraftSchedules,
    ]);

    const value = {
        ...armadoState,
        refetchOferta: ofertaLectura.refetchOferta,
    };
    return <HorariosArmadoContext.Provider value={value}>{children}</HorariosArmadoContext.Provider>;
};
