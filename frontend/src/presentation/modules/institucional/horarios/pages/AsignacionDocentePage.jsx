import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Card,
  Col,
  Flex,
  Row,
  Select,
  Spin,
  Statistic,
  Table,
  Typography,
  Button,
  Space,
} from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import { useAuthContext } from '@application-auth';
import { useAsignacionDocenteContext } from '@application-institucional/horarios';
import {
  canEditarAsignacion,
  canEliminarAsignacion,
  canGestionarColor,
  canVerCarga,
} from '@application-institucional/horarios/config/asignacionDocentePermisos';
import { useDocentesApi } from '@application-docentes/hooks/api';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import DocenteColorPickerModal from '../components/molecules/DocenteColorPickerModal';
import { buildAsignacionDocenteColumns } from '../config/asignacionDocenteTableColumns';
import '../styles/asignacion-docente.css';

const { Text } = Typography;

const AsignacionDocentePage = () => {
  const navigate = useNavigate();
  const { hasPermiso } = useAuthContext();
  const { docentes = [] } = useDocentesApi();
  const {
    gestiones,
    selectedGestionId,
    planesHabilitados,
    selectedGestionPlanId,
    paralelosGestion,
    selectedParaleloGestionId,
    gestionSeleccionada,
    planSeleccionado,
    paraleloSeleccionado,
    matrizRows,
    cobertura,
    cargaPorDocente,
    loadingMatriz,
    savingOfertaId,
    loadingCatalogos,
    planesCatalogLoading,
    paralelosCatalogLoading,
    errorCatalogos,
    catalogosListos,
    onGestionChange,
    onPlanChange,
    onParaleloChange,
    onSelectDocente,
    onQuitarAsignacion,
    colorPicker,
    closeColorPicker,
    onColorSaved,
    openColorPickerForDocente,
    updateDocenteColor,
    fetchColoresSugeridos,
  } = useAsignacionDocenteContext();

  const puedeEditar = canEditarAsignacion(hasPermiso);
  const puedeEliminar = canEliminarAsignacion(hasPermiso);
  const puedeColor = canGestionarColor(hasPermiso);
  const puedeVerDashboard = canVerCarga(hasPermiso);

  const docenteOptions = useMemo(
    () =>
      docentes.map((d) => ({
        value: d.id,
        label: d.nombreCompleto || d.nombre || `Docente #${d.id}`,
      })),
    [docentes]
  );

  const columns = useMemo(
    () =>
      buildAsignacionDocenteColumns({
        docenteOptions,
        cargaPorDocente,
        savingOfertaId,
        onSelectDocente,
        onQuitarAsignacion,
        onAssignColor: openColorPickerForDocente,
        canEditar: puedeEditar,
        canEliminar: puedeEliminar,
        canColor: puedeColor,
      }),
    [
      docenteOptions,
      cargaPorDocente,
      savingOfertaId,
      onSelectDocente,
      onQuitarAsignacion,
      openColorPickerForDocente,
      puedeEditar,
      puedeEliminar,
      puedeColor,
    ]
  );

  const breadcrumbItems = [
    { title: 'Inicio', href: '/' },
    { title: 'Institucional', href: '/institucional/horarios' },
    { title: 'Asignación docente' },
  ];

  return (
    <>
      <PageHeaderArea>
        <PageHeader
          title="Asignación docente por oferta"
          breadcrumbItems={breadcrumbItems}
          actions={
            puedeVerDashboard && selectedGestionId ? (
              <Button
                type="primary"
                icon={<BarChartOutlined />}
                onClick={() =>
                  navigate(`/institucional/horarios/carga-docentes/${selectedGestionId}`)
                }
              >
                Dashboard de carga
              </Button>
            ) : null
          }
        />
      </PageHeaderArea>

      <MainContent>
        {errorCatalogos ? (
          <Alert type="error" showIcon title={errorCatalogos} style={{ marginBottom: 16 }} />
        ) : null}

        <Alert
          type="info"
          showIcon
          closable
          style={{ marginBottom: 16 }}
          title="Flujo operativo — asignación docente"
          description={
            <Space orientation="vertical" size={8} style={{ width: '100%' }}>
              <span>
                Vista masiva por gestión/plan/paralelo. Para una materia concreta, use{' '}
                <strong>Oferta académica → detalle del paralelo</strong> (tabla de cursos). El armado de bloques
                semanal es en <strong>Gestión de horarios</strong>.
              </span>
              <Button size="small" onClick={() => navigate('/institucional/oferta')}>
                Ir a oferta académica
              </Button>
            </Space>
          }
        />

        {selectedGestionId && !planesCatalogLoading && planesHabilitados.length === 0 ? (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            title="Sin planes habilitados en esta gestión"
            description={
              <Space orientation="vertical" size={8}>
                <span>
                  El seeder <code>19-gestiones-planes</code> vincula planes a la gestión vigente (id=1). Si el listado
                  está vacío, ejecute los seeders o habilite un plan en Oferta académica → paso Planes.
                </span>
                <Button size="small" type="primary" onClick={() => navigate('/institucional/oferta')}>
                  Habilitar plan en oferta
                </Button>
              </Space>
            }
          />
        ) : null}

        {selectedGestionPlanId && !paralelosCatalogLoading && paralelosGestion.length === 0 ? (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            title="Sin paralelos de gestión"
            description="Genere paralelos de gestión en Oferta académica (paso 3) para el plan seleccionado."
          />
        ) : null}

        <Card className="asignacion-docente-filters" size="small">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Text type="secondary">Gestión</Text>
              <Select
                style={{ width: '100%', marginTop: 4 }}
                placeholder="Seleccione gestión"
                value={
                  gestiones.some((g) => g.id === selectedGestionId)
                    ? selectedGestionId
                    : undefined
                }
                loading={loadingCatalogos && !gestiones.length}
                options={gestiones.map((g) => ({
                  value: Number(g.id) || g.id,
                  label: `${g.nombre || g.codigo || `Gestión ${g.id}`}${
                    g.codigo ? ` (${g.codigo})` : ''
                  }${g.vigente ? ' · vigente' : ''}`,
                }))}
                onChange={onGestionChange}
              />
            </Col>
            <Col xs={24} md={8}>
              <Text type="secondary">Plan habilitado</Text>
              <Select
                style={{ width: '100%', marginTop: 4 }}
                placeholder="Seleccione plan"
                disabled={!selectedGestionId}
                loading={planesCatalogLoading}
                value={
                  planesHabilitados.some((p) => p.id === selectedGestionPlanId)
                    ? selectedGestionPlanId
                    : undefined
                }
                options={planesHabilitados.map((p) => ({
                  value: Number(p.id) || p.id,
                  label:
                    p.carreraNombre && p.nombre
                      ? `${p.carreraNombre} — ${p.nombre}`
                      : p.nombre || p.planNombre || `Plan ${p.id}`,
                }))}
                onChange={onPlanChange}
              />
            </Col>
            <Col xs={24} md={8}>
              <Text type="secondary">Paralelo-gestión</Text>
              <Select
                style={{ width: '100%', marginTop: 4 }}
                placeholder="Seleccione paralelo"
                disabled={!selectedGestionPlanId}
                loading={paralelosCatalogLoading}
                value={
                  paralelosGestion.some((pg) => pg.id === selectedParaleloGestionId)
                    ? selectedParaleloGestionId
                    : undefined
                }
                options={paralelosGestion.map((pg) => ({
                  value: Number(pg.id) || pg.id,
                  label: [pg.paraleloNombre, pg.turno, pg.aulaCodigo].filter(Boolean).join(' · '),
                }))}
                onChange={onParaleloChange}
              />
            </Col>
          </Row>
        </Card>

        {cobertura && selectedParaleloGestionId ? (
          <Card size="small" className="asignacion-docente-cobertura">
            <Flex gap={24} wrap="wrap">
              <Statistic title="Cursos ofertados" value={cobertura.cursos_total} />
              <Statistic title="Con docente" value={cobertura.cursos_con_docente} />
              <Statistic title="Sin docente" value={cobertura.cursos_sin_docente} />
              <Statistic title="Cobertura" value={cobertura.cobertura_pct} suffix="%" />
            </Flex>
          </Card>
        ) : null}

        <Card
          title={
            paraleloSeleccionado
              ? `${paraleloSeleccionado.paraleloNombre ?? 'Paralelo'} — ${gestionSeleccionada?.nombre ?? ''} / ${planSeleccionado?.nombre ?? ''}`
              : 'Matriz de asignación'
          }
        >
          {!selectedParaleloGestionId ? (
            <Alert
              type="info"
              showIcon
              title="Seleccione gestión, plan y paralelo para cargar la matriz de asignación."
              description={
                catalogosListos && !selectedParaleloGestionId
                  ? 'Elija un paralelo-gestión en los filtros superiores.'
                  : undefined
              }
            />
          ) : (
            <Spin spinning={loadingMatriz}>
              <Table
                rowKey="key"
                columns={columns}
                dataSource={matrizRows}
                pagination={false}
                size="middle"
                locale={{ emptyText: 'No hay cursos ofertados en este paralelo' }}
              />
            </Spin>
          )}
        </Card>
      </MainContent>

      <DocenteColorPickerModal
        open={colorPicker.open}
        docenteId={colorPicker.docenteId}
        docenteNombre={colorPicker.docenteNombre}
        onClose={closeColorPicker}
        onSaved={onColorSaved}
        fetchColoresSugeridos={fetchColoresSugeridos}
        updateDocenteColor={updateDocenteColor}
      />
    </>
  );
};

export default AsignacionDocentePage;
