/**
 * Enlaces viejos al armado: normalizan a `?pg=` (paralelo_gestion_id).
 */
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { buildHorariosArmadoUrl, buildOfertaParaleloDetalleFromHorarios } from '@application-institucional/horarios/config/paths';
import { syncArmadoSearchParams } from '@application-institucional/horarios/utils/syncArmadoSearchParams';

/** Desde `/institucional/horarios/plantilla` */
export const ArmadoGestionRedirectFromPlantillaPath = () => {
    const location = useLocation();
    const sp = new URLSearchParams(location.search);
    const pg = Number(sp.get('pg'));
    if (Number.isFinite(pg) && pg > 0) {
        return <Navigate replace to={buildHorariosArmadoUrl(pg, { tab: sp.get('tab') || 'plan' })} />;
    }
    sp.delete('paralelo');
    if (!sp.get('tab') || sp.get('tab') === 'gestion') sp.set('tab', 'plan');
    return <Navigate replace to={`/institucional/horarios/armado?${sp.toString()}`} />;
};

/** Desde `/institucional/horarios/paralelo/:paraleloId/gestion` */
export const ArmadoGestionRedirectFromParaleloPath = () => {
    const { paraleloId } = useParams();
    const location = useLocation();
    const sp = new URLSearchParams(location.search);
    const pg = Number(sp.get('pg'));
    if (Number.isFinite(pg) && pg > 0) {
        const target = buildOfertaParaleloDetalleFromHorarios(pg);
        return <Navigate replace to={target.pathname} state={target.state} />;
    }
    if (paraleloId) {
        const next = syncArmadoSearchParams(sp, { tab: 'plan' });
        next.delete('pg');
        next.set('paralelo', String(paraleloId));
        return <Navigate replace to={`/institucional/horarios/armado?${next.toString()}`} />;
    }
    return <Navigate replace to="/institucional/horarios/armado" />;
};
