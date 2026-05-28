/**
 * Detalle transaccional del plan — matriz + prerrequisitos.
 * Patrón: PoliticaInstitucionalPage (layout) + armado horarios (header).
 */

import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Button, Flex, Spin, Tabs } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton, Card } from '@atoms';
import { useAuthContext } from '@application-auth';
import { useNavigate } from 'react-router-dom';
import { usePlanDetallePage } from '@application-configuracion/academico/hooks';
import { planEditarPath } from '@application-configuracion/academico/config/paths';
import PlanDetalleHeader from '@configuracion/academico/components/PlanDetalleHeader';
import PlanMatrizTab from '@configuracion/academico/components/PlanMatrizTab';
import PlanPrerrequisitosTab from '@configuracion/academico/components/PlanPrerrequisitosTab';
import '@presentation/styles/pages/detail-page.css';
import '../styles/academico-form-page.css';
import '../styles/plan-detalle.css';

const TAB_MATRIZ = 'matriz';
const TAB_PRERREQUISITOS = 'prerrequisitos';

const PlanDetallePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasPermiso } = useAuthContext();

  const {
    isInvalidId,
    loading,
    error,
    planMeta,
    periodos,
    matrizRows,
    asignaturaCatalog,
    validacionPorPeriodo,
    carrera,
    carreraColor,
    breadcrumbItems,
    handleVolver,
    handleMarcarVigente,
    marcarVigenteLoading,
    savingCellId,
    handleCellChange,
    refetch,
    planId,
    api,
  } = usePlanDetallePage();

  const puedeMatriz = hasPermiso('configuracion.plan-estudio', 'DETALLE');
  const puedeEditarAsignaturas = hasPermiso('configuracion.plan-estudio.asignaturas', 'EDITAR');
  const puedeActivar = hasPermiso('configuracion.plan-estudio', 'ACTIVAR');
  const puedeEditarPlan = hasPermiso('configuracion.plan-estudio', 'EDITAR');
  const puedePrerrequisitos =
    hasPermiso('configuracion.plan-estudio.prerrequisitos', 'LISTAR')
    || hasPermiso('configuracion.plan-estudio.prerrequisitos', 'DETALLE');

  const tabItems = useMemo(() => {
    const items = [];
    if (puedeMatriz) {
      items.push({
        key: TAB_MATRIZ,
        label: 'Matriz del plan',
        children: (
          <PlanMatrizTab
            periodos={periodos}
            matrizRows={matrizRows}
            planMeta={planMeta}
            validacionPorPeriodo={validacionPorPeriodo}
            savingCellId={savingCellId}
            onCellChange={handleCellChange}
            puedeEditar={puedeEditarAsignaturas}
          />
        ),
      });
    }
    if (puedePrerrequisitos) {
      items.push({
        key: TAB_PRERREQUISITOS,
        label: 'Prerrequisitos',
        children: (
          <PlanPrerrequisitosTab
            planId={planId}
            asignaturaCatalog={asignaturaCatalog}
            api={api}
          />
        ),
      });
    }
    return items;
  }, [
    api,
    asignaturaCatalog,
    handleCellChange,
    matrizRows,
    periodos,
    planId,
    planMeta,
    puedeEditarAsignaturas,
    puedeMatriz,
    puedePrerrequisitos,
    savingCellId,
    validacionPorPeriodo,
  ]);

  const activeKey = useMemo(() => {
    const requested = searchParams.get('tab');
    const keys = tabItems.map((t) => t.key);
    if (requested && keys.includes(requested)) {
      return requested;
    }
    return keys[0] ?? TAB_MATRIZ;
  }, [searchParams, tabItems]);

  const onTabChange = (key) => {
    setSearchParams({ tab: key }, { replace: true });
  };

  if (isInvalidId) {
    return (
      <PageTemplate
        header={
          <PageHeader
            title="Detalle del plan"
            breadcrumbItems={breadcrumbItems}
            actions={<BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver} />}
          />
        }
      >
        <Alert type="error" showIcon message="Identificador de plan inválido" />
      </PageTemplate>
    );
  }

  if (!tabItems.length) {
    return (
      <PageTemplate
        header={
          <PageHeader
            title="Detalle del plan"
            breadcrumbItems={breadcrumbItems}
            actions={<BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver} />}
          />
        }
      >
        <Alert type="warning" showIcon message="No tiene permisos para ver este plan." />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      header={
        <PageHeader
          title={planMeta?.nombre_plan || 'Detalle del plan'}
          breadcrumbItems={breadcrumbItems}
          actions={<BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver} />}
        />
      }
    >
      <div className="cfg-plan-detalle-page">
        <Spin spinning={loading} tip="Cargando plan de estudio…">
          <Flex vertical gap="large" style={{ width: '100%' }}>
            {error ? (
              <Alert
                type="error"
                showIcon
                message={error}
                action={
                  <Button size="small" onClick={refetch}>
                    Reintentar
                  </Button>
                }
              />
            ) : null}

            {planMeta ? (
              <>
                <PlanDetalleHeader planMeta={planMeta} carrera={carrera} carreraColor={carreraColor} />

                <Flex gap={8} wrap="wrap">
                  {puedeEditarPlan ? (
                    <ActionButton
                      permiso="configuracion.plan-estudio"
                      accion="EDITAR"
                      variant="default"
                      onClick={() => navigate(planEditarPath(planId))}
                    >
                      Editar plan
                    </ActionButton>
                  ) : null}
                  <ActionButton
                    permiso="configuracion.plan-estudio"
                    accion="ACTIVAR"
                    variant="primary"
                    loading={marcarVigenteLoading}
                    disabled={planMeta.vigente}
                    onClick={handleMarcarVigente}
                  >
                    {planMeta.vigente ? 'Ya es el plan vigente' : 'Marcar vigente'}
                  </ActionButton>
                </Flex>

                <Card
                  headerColor="primary"
                  variant="outlined"
                  shadow={false}
                  className="cfg-academico-resumen-card"
                  styles={{ body: { padding: '16px 24px' } }}
                >
                  <Tabs activeKey={activeKey} items={tabItems} onChange={onTabChange} />
                </Card>
              </>
            ) : null}
          </Flex>
        </Spin>
      </div>
    </PageTemplate>
  );
};

export default PlanDetallePage;
