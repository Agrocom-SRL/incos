/**
 * Renovación de oferta académica (/institucional/oferta/renovar · CREAR).
 *
 * Página de formulario alineada al patrón de CFG Académico (CarreraFormPage /
 * LicenciaSolicitarPage): Flex.page-container → PageHeaderArea(PageHeader +
 * BackButton) → DashboardPageShell → MainContent → un único card
 * `cfg-academico-workspace cfg-academico-form-workspace` con la acción
 * principal («Renovar oferta») ARRIBA, en el header del card, y secciones
 * internas: gestiones (origen y destino lado a lado; el alta de gestión es
 * una página propia que vuelve con el destino preseleccionado), qué renovar
 * y resultado. Nada se publica hasta marcar vigente la nueva gestión.
 *
 * Página delgada: TODA la lógica vive en useRenovarOfertaPage (hooks/state).
 */

import {
  Alert,
  Col,
  Empty,
  Flex,
  Popconfirm,
  Row,
  Select,
  Spin,
  Table,
  Typography,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  PlusCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { ActionButton, BackButton } from '@atoms';
import { cfgFormColProps } from '@organisms/CfgFormWorkspace';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { allSpacing } from '@theme/tokens';
import { useRenovarOfertaPage } from '@application-institucional/oferta';
import { gestionLabel } from '@application-institucional/oferta/hooks/state/ofertaStateShared.js';
import {
  buildRenovarPlanesColumns,
  buildRenovarResumenColumns,
} from '../config/renovarOfertaTableColumns.jsx';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const { Paragraph, Text, Title } = Typography;

const PERMISO_OFERTA = 'institucional.oferta.gestion-plan';

/** Sección plana dentro del card (mismo shell que CfgFormWorkspaceSection). */
const Seccion = ({ title, descripcion = null, children }) => (
  <div className="cfg-academico-form-workspace__section">
    <header className="cfg-academico-form-workspace__section-header">
      <Title level={5} className="cfg-academico-form-workspace__section-title">
        {title}
      </Title>
      {descripcion ? (
        <Paragraph type="secondary" className="cfg-academico-form-workspace__section-desc">
          {descripcion}
        </Paragraph>
      ) : null}
    </header>
    {children}
  </div>
);

/** Campo suelto con el look del form-workspace (label + control + ayuda breve). */
const CampoGestion = ({ label, ayuda, children }) => (
  <Flex vertical gap={allSpacing.marginXS} className="form-field form-field--vertical">
    <Text strong>{label}</Text>
    {children}
    <Text type="secondary" style={{ fontSize: 'var(--font-size-sm)' }}>
      {ayuda}
    </Text>
  </Flex>
);

const RenovarOfertaPage = () => {
  const s = useRenovarOfertaPage();
  const col = cfgFormColProps(12);

  const columnasPlanes = buildRenovarPlanesColumns();
  const columnasResumen = buildRenovarResumenColumns();

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title={s.pageTitle}
          breadcrumbItems={s.breadcrumbItems}
          actions={<BackButton icon={<ArrowLeftOutlined />} onClick={s.navigateBack} />}
        />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Spin spinning={s.cargandoGestiones} tip="Cargando gestiones...">
            <section className="cfg-academico-workspace cfg-academico-form-workspace">
              <header className="cfg-academico-workspace__header">
                <ListPanelHeader
                  title="Renovar oferta"
                  actions={
                    <ActionButton
                      permiso={PERMISO_OFERTA}
                      accion="CREAR"
                      variant="primary"
                      icon={<SyncOutlined />}
                      loading={s.renovando}
                      disabled={!s.puedeRenovar}
                      onClick={s.onRenovar}
                    >
                      Renovar oferta
                    </ActionButton>
                  }
                />
                <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                  Reutiliza paralelos, docentes y horarios de una gestión anterior para armar
                  la oferta de la gestión nueva. Nada se publica hasta marcar vigente la
                  gestión destino.
                </Paragraph>
              </header>

              <div className="cfg-academico-form-workspace__body">
                {s.apiError ? <Alert type="error" showIcon title={s.apiError} /> : null}

                <Flex vertical gap="large" className="cfg-academico-form-workspace__sections">
                  {/* ---- 1. Gestiones (origen y destino lado a lado) ---- */}
                  <Seccion
                    title="Gestiones"
                    descripcion="Elija de qué gestión se copia la oferta y qué gestión la recibe. Si la gestión nueva aún no existe, créela sin perder este flujo."
                  >
                    <Row gutter={[24, 20]} className="cfg-academico-form-workspace__grid">
                      <Col {...col}>
                        <CampoGestion
                          label="Gestión origen"
                          ayuda="Gestión anterior desde la que se copian paralelos, docentes y horarios."
                        >
                          <Select
                            value={s.origenId}
                            onChange={s.onOrigenChange}
                            options={s.opcionesOrigen}
                            placeholder="Seleccione la gestión origen"
                            showSearch
                            optionFilterProp="label"
                            style={{ width: '100%' }}
                          />
                        </CampoGestion>
                      </Col>
                      <Col {...col}>
                        <CampoGestion
                          label="Gestión destino"
                          ayuda="Gestión nueva que recibirá la oferta renovada."
                        >
                          <Select
                            value={s.destinoId}
                            onChange={s.onDestinoChange}
                            options={s.opcionesDestino}
                            placeholder="Seleccione la gestión destino"
                            showSearch
                            optionFilterProp="label"
                            allowClear
                            style={{ width: '100%' }}
                          />
                        </CampoGestion>
                      </Col>
                    </Row>
                    <Flex justify="flex-end" style={{ marginTop: allSpacing.marginSM }}>
                      <ActionButton
                        permiso="institucional.oferta.gestion-plan"
                        accion="CREAR"
                        variant="info"
                        icon={<PlusCircleOutlined />}
                        onClick={s.navigateNuevaGestion}
                      >
                        Crear una gestión nueva
                      </ActionButton>
                    </Flex>
                  </Seccion>

                  {/* ---- 2. Qué renovar ---- */}
                  <Seccion
                    title="Qué renovar"
                    descripcion="Planes habilitados de la gestión origen que se copiarán al destino, y hasta dónde llega la copia."
                  >
                    {s.sinPlanesOrigen ? (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="La gestión origen no tiene planes habilitados para renovar."
                      />
                    ) : (
                      <Flex vertical gap={allSpacing.marginSM}>
                        <Table
                          rowKey={(row) => Number(row.id)}
                          columns={columnasPlanes}
                          dataSource={s.planesOrigen}
                          loading={s.planesLoading}
                          size="middle"
                          pagination={false}
                          rowSelection={{
                            selectedRowKeys: s.seleccionPlanes,
                            onChange: (keys) => s.setSeleccionPlanes(keys.map(Number)),
                          }}
                          locale={{ emptyText: 'Seleccione una gestión origen.' }}
                        />
                        <Text type="secondary">
                          Se renueva la oferta completa: paralelos y cursos, asignaciones docentes
                          y bloques de horario semanal. Los cambios puntuales (un docente, un
                          turno) se ajustan después en Asignación docente y Gestión de horarios.
                        </Text>
                      </Flex>
                    )}
                  </Seccion>

                  {/* ---- 3. Resultado (tras el POST) ---- */}
                  {s.resumen ? (
                    <Seccion
                      title="Resultado de la renovación"
                      descripcion={
                        s.gestionDestino
                          ? `Copia realizada hacia ${gestionLabel(s.gestionDestino)}. Revise los contadores por plan antes de marcar vigente.`
                          : 'Revise los contadores por plan antes de marcar vigente.'
                      }
                    >
                      <Flex vertical gap={allSpacing.marginSM}>
                        <Table
                          rowKey="key"
                          columns={columnasResumen}
                          dataSource={s.resumenPlanes}
                          size="middle"
                          pagination={false}
                          locale={{ emptyText: 'La renovación no devolvió planes.' }}
                        />

                        {s.advertenciasResumen.length ? (
                          <Alert
                            type="warning"
                            showIcon
                            title={<strong>Advertencias de la renovación</strong>}
                            description={
                              <ul style={{ margin: 0, paddingLeft: allSpacing.marginLG }}>
                                {s.advertenciasResumen.map((texto) => (
                                  <li key={texto}>{texto}</li>
                                ))}
                              </ul>
                            }
                          />
                        ) : null}

                        {s.vigenteMarcada ? (
                          <Alert
                            type="success"
                            showIcon
                            title={<strong>La nueva gestión ya es la vigente</strong>}
                            description="La gestión anterior quedó como histórica. Continúe con los planes habilitados del destino."
                          />
                        ) : null}

                        <div className="cfg-academico-form-workspace__footer">
                          <Flex justify="space-between" align="center" gap={allSpacing.marginSM} wrap="wrap">
                            <ActionButton
                              permiso={PERMISO_OFERTA}
                              accion="LISTAR"
                              type="link"
                              onClick={s.navigatePlanesDestino}
                            >
                              Ver planes habilitados →
                            </ActionButton>
                            {!s.vigenteMarcada ? (
                              <Popconfirm
                                title="Marcar vigente la nueva gestión"
                                description="La gestión anterior dejará de ser vigente."
                                okText="Marcar vigente"
                                okButtonProps={{ loading: s.marcandoVigente }}
                                cancelText="Cancelar"
                                onConfirm={s.onMarcarVigente}
                              >
                                <ActionButton
                                  permiso={PERMISO_OFERTA}
                                  accion="ACTIVAR"
                                  variant="success"
                                  icon={<CheckCircleOutlined />}
                                  loading={s.marcandoVigente}
                                >
                                  Marcar vigente la nueva gestión
                                </ActionButton>
                              </Popconfirm>
                            ) : (
                              <Text type="secondary">
                                Gestión {s.gestionDestino ? gestionLabel(s.gestionDestino) : 'destino'} vigente.
                              </Text>
                            )}
                          </Flex>
                        </div>
                      </Flex>
                    </Seccion>
                  ) : null}
                </Flex>
              </div>
            </section>
          </Spin>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default RenovarOfertaPage;
