import { Alert, Button, Flex, Spin, Table, Typography } from 'antd';
import { ArrowLeftOutlined, ScheduleOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { ActionButton, StatusPill } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { useOfertaParaleloDetalleState } from '@application-institucional/oferta';
import { DashboardPageShell } from '@presentation/modules/dashboard/components/organisms';
import { aulaParaleloLabel, paraleloEstadoPillClass } from '../utils/ofertaParaleloUi';
import '@configuracion/academico/styles/academico-form-page.css';
import '@presentation/styles/pages/detail-page.css';
import '../styles/oferta-academica-page.css';

const { Paragraph, Text } = Typography;

const OfertaParaleloDetallePage = () => {
  const s = useOfertaParaleloDetalleState();
  const carga = s.cargaHorariaResumen;

  const breadcrumbItems = [
    { title: 'Inicio', href: '/' },
    { title: 'Institucional', href: '/institucional' },
    { title: 'Oferta Académica', href: '/institucional/oferta' },
    { title: s.detalle?.paraleloNombre ?? `Paralelo #${s.paraleloGestionId}` },
  ];

  const puedeOfertar =
    s.detalle?.estado === 'BORRADOR' && Boolean(s.detalle?.aulaId) && s.ofertaCursos.length > 0;

  return (
    <Flex vertical gap="large" className="page-container oferta-paralelo-detalle-page" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title={s.pageTitle}
          breadcrumbItems={breadcrumbItems}
          actions={
            <Flex wrap="wrap" gap={allSpacing.marginSM}>
              <Button icon={<ArrowLeftOutlined />} onClick={s.navigateBack}>
                Volver
              </Button>
              {puedeOfertar ? (
                <ActionButton
                  permiso="institucional.oferta.paralelo-gestion"
                  accion="EDITAR"
                  type="primary"
                  onClick={s.onMarcarOfertado}
                >
                  Marcar OFERTADO
                </ActionButton>
              ) : null}
              <ActionButton
                permiso="institucional.horario.armado"
                accion="LISTAR"
                icon={<ScheduleOutlined />}
                onClick={s.navigateHorariosArmado}
              >
                Ver horario
              </ActionButton>
            </Flex>
          }
        />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Spin spinning={s.apiLoading}>
            <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
              {s.apiError ? <Alert type="error" showIcon message={s.apiError} /> : null}

              {carga.materiasEsperadas > 0 && !carga.valido ? (
                <Alert
                  type="warning"
                  showIcon
                  message="Carga horaria del periodo incompleta"
                  description={
                    <>
                      El plan exige <strong>{carga.materiasEsperadas} materias</strong> (
                      {carga.horasPlan} h/sem) en este periodo. Ofertadas:{' '}
                      <strong>{carga.materiasOfertadas}</strong> ({carga.horasOfertadas} h/sem).
                      {carga.faltantes.length > 0
                        ? ` Faltan: ${carga.faltantes.map((f) => f.materiaCodigo ?? f.materiaNombre).filter(Boolean).join(', ')}.`
                        : null}
                    </>
                  }
                />
              ) : null}

              {carga.valido && carga.horasPlan > 0 ? (
                <Alert
                  type="success"
                  showIcon
                  message="Carga horaria del periodo cubierta"
                  description={`${carga.materiasOfertadas} materias · ${carga.horasPlan} h/sem según plan de estudios.`}
                />
              ) : null}

              <section className="cfg-academico-workspace">
                <header className="cfg-academico-workspace__header">
                  <ListPanelHeader title="Datos del paralelo" />
                  {s.detalle ? (
                    <Flex wrap="wrap" gap={allSpacing.marginSM} className="oferta-paralelo-detalle__chips">
                      <StatusPill
                        label={s.detalle.estado ?? '—'}
                        className={paraleloEstadoPillClass(s.detalle.estado)}
                      />
                      {s.detalle.turno ? (
                        <StatusPill
                          label={s.detalle.turno}
                          className="cfg-materia-pill cfg-materia-pill--default"
                        />
                      ) : null}
                    </Flex>
                  ) : null}
                </header>

                <div className="cfg-academico-tab-panel oferta-paralelo-detalle__resumen">
                  {s.detalle ? (
                    <Flex vertical gap={allSpacing.marginSM}>
                      <Paragraph className="oferta-paralelo-detalle__meta-line">
                        <Text type="secondary">Periodo: </Text>
                        <Text strong>{s.detalle.periodoNombre ?? '—'}</Text>
                      </Paragraph>
                      <Paragraph className="oferta-paralelo-detalle__meta-line">
                        <Text type="secondary">Aula: </Text>
                        <Text strong>{aulaParaleloLabel(s.detalle)}</Text>
                      </Paragraph>
                      <Paragraph className="oferta-paralelo-detalle__meta-line">
                        <Text type="secondary">Cupo máximo: </Text>
                        <Text strong>{s.detalle.cupoMaximo ?? '—'}</Text>
                      </Paragraph>
                    </Flex>
                  ) : null}
                </div>
              </section>

              <section className="cfg-academico-workspace">
                <header className="cfg-academico-workspace__header">
                  <ListPanelHeader title="Oferta de cursos del periodo" />
                  <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                    Materias del plan de estudios que deben ofertarse en este paralelo. La suma de
                    horas semanales debe coincidir con la carga del periodo (
                    <strong>{carga.horasPlan || '—'} h/sem</strong>).
                  </Paragraph>
                </header>
                <div className="cfg-academico-tab-panel">
                  <Table
                    rowKey="id"
                    size="middle"
                    pagination={false}
                    dataSource={s.ofertaCursos}
                    className="data-table data-table--oferta-cursos-detalle"
                    columns={[
                      { title: 'Materia', dataIndex: 'materiaNombre', key: 'materia', ellipsis: true },
                      {
                        title: 'Sigla',
                        dataIndex: 'materiaCodigo',
                        width: 100,
                        render: (codigo) =>
                          codigo ? (
                            <StatusPill
                              label={codigo}
                              className="cfg-materia-pill cfg-materia-pill--default"
                            />
                          ) : (
                            '—'
                          ),
                      },
                      {
                        title: 'Horas/sem',
                        dataIndex: 'horasSemanales',
                        width: 100,
                        align: 'center',
                        render: (h) => <Text strong>{h ?? '—'}</Text>,
                      },
                      {
                        title: 'Estado',
                        dataIndex: 'estado',
                        width: 120,
                        render: (estado) => (
                          <StatusPill
                            label={estado ?? '—'}
                            className={
                              String(estado).toUpperCase() === 'ACTIVA'
                                ? 'cfg-materia-pill cfg-materia-pill--activa'
                                : 'cfg-materia-pill cfg-materia-pill--default'
                            }
                          />
                        ),
                      },
                    ]}
                    locale={{
                      emptyText:
                        'Sin cursos en la oferta. Genere la oferta desde Planes vigentes o complete la configuración del paralelo.',
                    }}
                    summary={() =>
                      s.ofertaCursos.length ? (
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0} colSpan={2}>
                            <Text strong>Total horas semanales ofertadas</Text>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={2} align="center">
                            <Text strong>{carga.horasOfertadas}</Text>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={3} />
                        </Table.Summary.Row>
                      ) : null
                    }
                  />
                </div>
              </section>
            </Flex>
          </Spin>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default OfertaParaleloDetallePage;
