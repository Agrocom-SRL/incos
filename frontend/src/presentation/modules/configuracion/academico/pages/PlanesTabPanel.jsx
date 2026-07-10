/**
 * Tab «Planes de estudio» — selector horizontal + documento a ancho completo.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Flex, Spin } from 'antd';
import { CopyOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { usePlanesTabPanel, usePlanNuevaVersion } from '@application-configuracion/academico/hooks';
import { usePlanesTabDocumento } from '@application-configuracion/academico/hooks/features/usePlanesTabDocumento';
import { buildPlanDocumentoThemeVars } from '@application-configuracion/academico/utils/planDocumentoTheme';
import {
  planDetallePath,
  planNuevaPath,
} from '@application-configuracion/academico/config/paths';
import { planesListNavigationState } from '@application-configuracion/academico/config/academicoNavigation';
import { PLAN_ESTUDIO_PERMISO } from '@application-configuracion/academico/config/planEstudioPermisos';
import PlanesCarreraSidebar from '@configuracion/academico/components/organisms/PlanesCarreraSidebar';
import PlanEstudioDocumentoView from '@configuracion/academico/components/organisms/PlanEstudioDocumentoView';
import { ActionButton, Text } from '@atoms';
import '../styles/planes-tab.css';
import '../styles/plan-documento.css';

const PlanesTabPanel = ({ embedded = false }) => {
  const navigate = useNavigate();
  const listNavState = useMemo(() => planesListNavigationState(), []);

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

  const { creandoVersion, crearNuevaVersion } = usePlanNuevaVersion({ navState: listNavState });

  const themeVars = useMemo(
    () => buildPlanDocumentoThemeVars(carreraSeleccionada?.colorHex),
    [carreraSeleccionada?.colorHex],
  );

  const error = catalogError || documentoError;

  const handleVerFichaCompleta = () => {
    if (!planId) return;
    navigate(planDetallePath(planId), { state: listNavState });
  };

  const handleNuevaVersion = () => {
    if (!planId) return;
    crearNuevaVersion(planId);
  };

  const handleNuevoPlan = () => {
    navigate(planNuevaPath, { state: listNavState });
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
        <div className="cfg-planes-selector-wrap__header">
          <Text strong className="cfg-planes-selector-wrap__label">
            Carrera
          </Text>

          <div className="cfg-planes-selector-wrap__actions">
            {planId != null ? (
              <ActionButton
                permiso={PLAN_ESTUDIO_PERMISO}
                accion="DETALLE"
                icon={<EyeOutlined />}
                onClick={handleVerFichaCompleta}
              >
                Ver ficha completa
              </ActionButton>
            ) : null}

            {planVigente ? (
              <ActionButton
                permiso={PLAN_ESTUDIO_PERMISO}
                accion="CREAR"
                variant="alternative"
                icon={<CopyOutlined />}
                loading={creandoVersion}
                onClick={handleNuevaVersion}
              >
                Nueva versión (RM)
              </ActionButton>
            ) : null}

            {carreraSeleccionada && !planVigente ? (
              <ActionButton
                permiso={PLAN_ESTUDIO_PERMISO}
                accion="CREAR"
                variant="primary"
                icon={<PlusOutlined />}
                onClick={handleNuevoPlan}
              >
                Nuevo plan
              </ActionButton>
            ) : null}
          </div>
        </div>

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
