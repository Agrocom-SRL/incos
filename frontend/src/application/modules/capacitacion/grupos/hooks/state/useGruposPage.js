/**
 * Hook de pantalla: menú «Grupos» (CAP · LISTAR) con dos tabs, patrón de CFG
 * Académico/Recursos: `?tab=horarios|grupos` (inválido o ausente → «Horarios»),
 * cambio de tab con `replace` y acción del header del tab activo (solo «Horarios»
 * crea: «Nuevo horario»).
 */

import { useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { horariosNavigationState } from '@application-capacitacion/grupos/config/gruposNavigation';
import {
  GRUPOS_TAB_GRUPOS,
  GRUPOS_TAB_HORARIOS,
  horarioCapRegistrarPath,
} from '@application-capacitacion/config/paths';

const TABS_VALIDOS = [GRUPOS_TAB_HORARIOS, GRUPOS_TAB_GRUPOS];

/** Tab activo según `?tab=`; cualquier otro valor cae en «Horarios». */
export const resolveGruposTab = (requested) =>
  TABS_VALIDOS.includes(requested) ? requested : GRUPOS_TAB_HORARIOS;

export const useGruposPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeKey = resolveGruposTab(searchParams.get('tab'));

  const onTabChange = useCallback(
    (key) => setSearchParams({ tab: key }, { replace: true }),
    [setSearchParams],
  );

  const handleNuevoHorario = useCallback(() => {
    navigate(horarioCapRegistrarPath, { state: horariosNavigationState() });
  }, [navigate]);

  const breadcrumbItems = useMemo(
    () => [{ title: 'Inicio', href: '/' }, { title: 'Capacitación' }, { title: 'Grupos' }],
    [],
  );

  return { activeKey, onTabChange, handleNuevoHorario, breadcrumbItems };
};
