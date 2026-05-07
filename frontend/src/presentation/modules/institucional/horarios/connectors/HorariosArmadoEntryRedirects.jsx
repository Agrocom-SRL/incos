/**
 * Entradas alternativas al flujo actual de Armado (misma UX que el tab «Gestión»):
 * rutas públicas siguen existiendo por permisos / marcadores / enlaces viejos, pero llevan al destino único `/horarios/armado`.
 *
 * - `/horarios/plantilla?paralelo=…` conserva compatibilidad con URLs que antes abrían oferta desde query.
 * - `/horarios/paralelo/:paraleloId/gestion` conserva compatibilidad con URLs que antes usaban el id en path.
 */
import { Navigate, useLocation, useParams } from 'react-router-dom';

const toArmadoUrl = (searchParams) => {
    const q = searchParams.toString();
    return `/institucional/horarios/armado${q ? `?${q}` : ''}`;
};

/** Desde `/institucional/horarios/plantilla` (query `paralelo` ⇒ tab gestión si no viene `tab`). */
export const ArmadoGestionRedirectFromPlantillaPath = () => {
    const location = useLocation();
    const sp = new URLSearchParams(location.search);
    if (sp.get('paralelo') && !sp.get('tab')) {
        sp.set('tab', 'gestion');
    }
    return <Navigate replace to={toArmadoUrl(sp)} />;
};

/** Desde `/institucional/horarios/paralelo/:paraleloId/gestion` (mezcla params + query). */
export const ArmadoGestionRedirectFromParaleloPath = () => {
    const { paraleloId } = useParams();
    const location = useLocation();
    const sp = new URLSearchParams(location.search);
    if (paraleloId) {
        sp.set('paralelo', String(paraleloId));
    }
    if (!sp.get('tab')) {
        sp.set('tab', 'gestion');
    }
    return <Navigate replace to={toArmadoUrl(sp)} />;
};
