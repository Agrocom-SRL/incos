/**
 * Tab «Planes de estudio» — selector horizontal + documento a ancho completo.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Flex, Spin } from 'antd';
import { useAuthContext } from '@application-auth';
import { usePlanesTabPanel } from '@application-configuracion/academico/hooks';
import { usePlanesTabDocumento } from '@application-configuracion/academico/hooks/features/usePlanesTabDocumento';
import { planDetallePath } from '@application-configuracion/academico/config/paths';
import { planesListNavigationState } from '@application-configuracion/academico/config/academicoNavigation';
import { buildPlanDocumentoThemeVars } from '@application-configuracion/academico/utils/planDocumentoTheme';
import PlanesCarreraSidebar from '@configuracion/academico/components/organisms/PlanesCarreraSidebar';
import PlanEstudioDocumentoView from '@configuracion/academico/components/organisms/PlanEstudioDocumentoView';
import { Text } from '@atoms';
import '../styles/planes-tab.css';
import '../styles/plan-documento.css';

const PlanesTabPanel = ({ embedded = false }) => {
  const navigate = useNavigate();
  const listNavState = useMemo(() => planesListNavigationState(), []);
  const { hasPermiso } = useAuthContext();
  const puedeDetalle = hasPermiso('configuracion.plan-estudio', 'DETALLE');

  const {
    carreras,
    loading: loadingCatalog,
    error: catalogError,
    refetch: refetchCatalog,
    selectedCarreraId,
    setSelectedCarreraId,
    carreraSeleccionada,
    planVigente,
  } = usePlanesTabPanel();

  const planId = planVigente?.id ?? null;

  const {
    periodos,
    planMeta,
    prereqSiglaByAsignaturaId,
    loading: loadingDocumento,
    error: documentoError,
    refetch: refetchDocumento,
  } = usePlanesTabDocumento(planId);

  const themeVars = useMemo(
    () => buildPlanDocumentoThemeVars(carreraSeleccionada?.colorHex),
    [carreraSeleccionada?.colorHex],
  );

  const error = catalogError || documentoError;

  const handleEditarMatriz = () => {
    if (!planId) return;
    navigate(planDetallePath(planId), { state: listNavState });
  };

  return (
    <div className={`cfg-planes-tab${embedded ? ' cfg-planes-tab--embedded' : ''}`}>
      {error ? (
        <Alert
          type="error"
          showIcon
          className="cfg-planes-tab__alert"
          title={typeof error === 'string' ? error : 'Error al cargar planes'}
          action={
            <Button
              size="small"
              onClick={() => {
                refetchCatalog();
                refetchDocumento();
              }}
            >
              Reintentar
            </Button>
          }
        />
      ) : null}

      <div className="cfg-planes-selector-wrap">
        <Text strong className="cfg-planes-selector-wrap__label">
          Carrera
        </Text>
        {loadingCatalog ? (
          <Flex justify="center" className="cfg-planes-carrera-list__empty">
            <Spin size="small" />
          </Flex>
        ) : carreras.length === 0 ? (
          <Text type="secondary" className="cfg-planes-carrera-list__empty">
            Sin carreras
          </Text>
        ) : (
          <PlanesCarreraSidebar
            carreras={carreras}
            selectedCarreraId={selectedCarreraId}
            onSelectCarrera={setSelectedCarreraId}
          />
        )}
      </div>

      <div className="cfg-planes-document">
        {carreraSeleccionada ? (
          <PlanEstudioDocumentoView
            carrera={carreraSeleccionada}
            planMeta={planMeta ?? planVigente}
            periodos={periodos}
            prereqSiglaByAsignaturaId={prereqSiglaByAsignaturaId}
            themeVars={themeVars}
            loading={planId != null && loadingDocumento}
            puedeEditar={puedeDetalle && Boolean(planId)}
            onEditarMatriz={handleEditarMatriz}
          />
        ) : (
          <Flex align="center" justify="center" className="cfg-planes-main__placeholder">
            <Text type="secondary">Seleccione una carrera</Text>
          </Flex>
        )}
      </div>
    </div>
  );
};

export default PlanesTabPanel;
