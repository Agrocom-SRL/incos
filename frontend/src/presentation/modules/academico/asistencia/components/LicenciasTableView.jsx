/**
 * Vista de tabla de licencias estudiantiles (organismo compartido por el listado general
 * y la bandeja de pendientes). Replica el lenguaje visual de DocentesList / CarrerasList:
 * PageTemplate → PageHeader → workspace (.cfg-academico-workspace) con ListPanelHeader +
 * descripción + TableListView embebido. La acción "ver" navega a la ficha (ACA-ASI-LIC-DET);
 * aprobar/rechazar abren un Modal de confirmación (LicenciaDecisionModal).
 *
 * La carga/decisión vive en LicenciasProvider; la interacción (filtros, modal) en
 * useLicenciasPantalla. Wrappers delgados (páginas) le pasan title/breadcrumbs/CTA/descripción.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex, Select, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { TableListView } from '@organisms';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { ActionButton, Text } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { useLicenciasPantalla } from '@application-academico/asistencia/hooks/state/useLicenciasPantalla.js';
import { ASISTENCIA_PERMISOS } from '@application-academico/asistencia/utils/asistenciaPermisos.js';
import { ESTADO_LICENCIA_OPTIONS } from '@application-academico/asistencia/utils/licenciasEstados.js';
import { licenciaDetallePath } from '@application-academico/asistencia/utils/asistenciaPaths.js';
import { createLicenciasTableColumns } from '@academico/asistencia/config/licenciasTableColumns.jsx';
import LicenciaDecisionModal from './LicenciaDecisionModal.jsx';
import '@configuracion/academico/styles/academico-form-page.css';

const { Paragraph } = Typography;

const TODOS_ESTADOS = '__TODOS__';

/**
 * @param {Object} props
 * @param {string} props.title
 * @param {Array} props.breadcrumbItems
 * @param {string} [props.descripcion]   - lede del workspace bajo el título
 * @param {string} [props.solicitarPath] - ruta del formulario de solicitud (CTA "Solicitar licencia")
 * @param {boolean} [props.mostrarFiltroEstado=true] - oculto en la bandeja (estado fijado a PENDIENTE)
 */
const LicenciasTableView = ({
  title,
  breadcrumbItems,
  descripcion,
  solicitarPath,
  mostrarFiltroEstado = true,
}) => {
  const navigate = useNavigate();

  const {
    licencias,
    loading,
    error,
    estado,
    setEstado,
    searchText,
    setSearchText,
    abrirDecision,
    decisionContext,
    cerrarDecision,
    confirmarDecision,
    decidiendo,
  } = useLicenciasPantalla();

  const listNavState = useMemo(
    () => ({ returnListPath: breadcrumbItems ? undefined : undefined, menuSidebarKey: 'ACA-ASI' }),
    [breadcrumbItems],
  );

  const columns = useMemo(
    () =>
      createLicenciasTableColumns({
        onVer: (licencia) =>
          navigate(licenciaDetallePath(licencia.id), { state: listNavState }),
        onAprobar: (licencia) => abrirDecision(licencia, 'APROBAR'),
        onRechazar: (licencia) => abrirDecision(licencia, 'RECHAZAR'),
      }),
    [navigate, listNavState, abrirDecision],
  );

  const headerActions = (
    <Flex gap={allSpacing.marginSM} align="center" wrap="wrap" justify="flex-end">
      {mostrarFiltroEstado ? (
        <Flex gap={allSpacing.marginXS} align="center">
          <Text type="secondary">Estado</Text>
          <Select
            value={estado ?? TODOS_ESTADOS}
            onChange={(value) => setEstado(value === TODOS_ESTADOS ? undefined : value)}
            style={{ minWidth: 180 }}
            options={[
              { value: TODOS_ESTADOS, label: 'Todos los estados' },
              ...ESTADO_LICENCIA_OPTIONS,
            ]}
          />
        </Flex>
      ) : null}
      {solicitarPath ? (
        <ActionButton
          permiso={ASISTENCIA_PERMISOS.licenciaCrear}
          accion="CREAR"
          variant="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(solicitarPath)}
        >
          Solicitar licencia
        </ActionButton>
      ) : null}
    </Flex>
  );

  return (
    <PageTemplate
      header={<PageHeader breadcrumbItems={breadcrumbItems} />}
      sidebar={null}
    >
      <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
        <section className="cfg-academico-workspace">
          <header className="cfg-academico-workspace__header">
            <ListPanelHeader title={title} actions={headerActions} />
            {descripcion ? (
              <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                {descripcion}
              </Paragraph>
            ) : null}
          </header>
          <div className="cfg-academico-tab-panel">
            <TableListView
              embedded
              data={licencias}
              loading={loading}
              error={error}
              searchText={searchText}
              onSearchChange={(e) => setSearchText(e.target.value)}
              searchPlaceholder="Buscar por estudiante…"
              columns={columns}
              rowKey={(record) => record.id}
              searchColSpan={10}
              searchStyle={{ maxWidth: 520 }}
              defaultSort={{ field: 'fechaInicio', order: 'descend' }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total: ${total} licencias`,
                pageSizeOptions: ['10', '20', '50', '100'],
              }}
              loadingTip="Cargando licencias…"
            />
          </div>
        </section>
      </Flex>

      <LicenciaDecisionModal
        open={Boolean(decisionContext)}
        licencia={decisionContext?.licencia ?? null}
        decision={decisionContext?.decision ?? 'APROBAR'}
        guardando={decidiendo}
        onCerrar={cerrarDecision}
        onConfirmar={confirmarDecision}
      />
    </PageTemplate>
  );
};

export default LicenciasTableView;
