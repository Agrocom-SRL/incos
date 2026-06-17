/**
 * Vista de tabla de licencias estudiantiles (organismo compartido por el listado general
 * y la bandeja de pendientes). Replica el lenguaje visual de DocentesList / CarrerasList:
 * PageTemplate → PageHeader → workspace (.cfg-academico-workspace) con ListPanelHeader +
 * descripción + TableListView embebido. La acción "ver" (y los accesos rápidos aprobar/rechazar)
 * abren el LicenciaDecisionDrawer: ficha + decisión inline en la misma pantalla.
 *
 * La carga/decisión vive en LicenciasProvider; la interacción (filtros, drawer) en
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
import { useAuthContext } from '@application-auth';
import { useLicenciasPantalla } from '@application-academico/asistencia/hooks/state/useLicenciasPantalla.js';
import { ASISTENCIA_PERMISOS } from '@application-academico/asistencia/utils/asistenciaPermisos.js';
import { ESTADO_LICENCIA_OPTIONS } from '@application-academico/asistencia/utils/licenciasEstados.js';
import { createLicenciasTableColumns } from '@academico/asistencia/config/licenciasTableColumns.jsx';
import LicenciaDecisionDrawer from './LicenciaDecisionDrawer.jsx';
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
  const { hasPermiso } = useAuthContext();

  const {
    licencias,
    loading,
    error,
    estado,
    setEstado,
    searchText,
    setSearchText,
    drawerAbierto,
    licenciaActiva,
    decisionInicial,
    verLicencia,
    cerrarDrawer,
    confirmarDecision,
    decidiendo,
  } = useLicenciasPantalla();

  const puedeDecidir = hasPermiso(ASISTENCIA_PERMISOS.licenciaAprobar, 'APROBAR');

  const columns = useMemo(
    () =>
      createLicenciasTableColumns({
        onVer: (licencia) => verLicencia(licencia),
        onAprobar: (licencia) => verLicencia(licencia, 'APROBAR'),
        onRechazar: (licencia) => verLicencia(licencia, 'RECHAZAR'),
      }),
    [verLicencia],
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

      <LicenciaDecisionDrawer
        open={drawerAbierto}
        licencia={licenciaActiva}
        puedeDecidir={puedeDecidir}
        decisionInicial={decisionInicial}
        guardando={decidiendo}
        onCerrar={cerrarDrawer}
        onDecidir={confirmarDecision}
      />
    </PageTemplate>
  );
};

export default LicenciasTableView;
