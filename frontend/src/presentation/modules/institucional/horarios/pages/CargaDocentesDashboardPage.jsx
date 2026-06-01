import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Card, Drawer, List, Spin, Table, Typography, Button } from 'antd';
import { useAuthContext } from '@application-auth';
import { useCargaDocentesContext } from '@application-institucional/horarios';
import {
  canGestionarColor,
  canVerCarga,
} from '@application-institucional/horarios/config/asignacionDocentePermisos';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { canListarAsignacion } from '@application-institucional/horarios/config/asignacionDocentePermisos';
import KpiCard from '../components/atoms/KpiCard';
import DocenteColorPickerModal from '../components/molecules/DocenteColorPickerModal';
import { buildCargaDocentesColumns } from '../config/asignacionDocenteTableColumns';
import '../styles/asignacion-docente.css';

const { Text } = Typography;

const CargaDocentesDashboardPage = () => {
  const navigate = useNavigate();
  const { hasPermiso } = useAuthContext();
  const {
    gestionId,
    totales,
    docentes,
    loading,
    error,
    drawerDocente,
    drawerCarga,
    drawerLoading,
    openDrawer,
    closeDrawer,
    colorPicker,
    openColorPicker,
    closeColorPicker,
    onColorSaved,
    updateDocenteColor,
    fetchColoresSugeridos,
  } = useCargaDocentesContext();

  const puedeColor = canGestionarColor(hasPermiso);
  const puedeDetalle = canVerCarga(hasPermiso);
  const puedeIrMatriz = canListarAsignacion(hasPermiso);

  const columns = useMemo(
    () =>
      buildCargaDocentesColumns({
        onVerDetalle: openDrawer,
        onAssignColor: openColorPicker,
        canColor: puedeColor,
        canDetalle: puedeDetalle,
      }),
    [openDrawer, openColorPicker, puedeColor, puedeDetalle]
  );

  const breadcrumbItems = [
    { title: 'Inicio', href: '/' },
    { title: 'Institucional', href: '/institucional/horarios' },
    {
      title: 'Asignación docente',
      href: '/institucional/horarios/asignacion-docente',
    },
    { title: 'Carga docentes' },
  ];

  return (
    <>
      <PageHeaderArea>
        <PageHeader
          title={`Carga docente — gestión #${gestionId}`}
          breadcrumbItems={breadcrumbItems}
          actions={
            puedeIrMatriz ? (
              <Button
                type="default"
                onClick={() => navigate('/institucional/horarios/asignacion-docente')}
              >
                Matriz de asignación
              </Button>
            ) : null
          }
        />
      </PageHeaderArea>

      <MainContent>
        {error ? <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} /> : null}

        <Spin spinning={loading}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <KpiCard
              label="Docentes activos"
              value={totales.docentes_activos ?? 0}
              sub="Con al menos una asignación vigente"
              badgeText="Activos"
              intent="info"
              percent={100}
            />
            <KpiCard
              label="Horas semana"
              value={totales.horas_total_semana ?? 0}
              sub="Suma de carga horaria"
              badgeText="Total"
              intent="neutral"
              percent={Math.min(100, ((totales.horas_total_semana ?? 0) / 400) * 100)}
            />
            <KpiCard
              label="Sobrecargados"
              value={totales.docentes_sobrecargados ?? 0}
              sub="Por encima del máximo semanal"
              badgeText="Alerta"
              intent={(totales.docentes_sobrecargados ?? 0) > 0 ? 'danger' : 'success'}
              percent={totales.docentes_activos ? ((totales.docentes_sobrecargados ?? 0) / totales.docentes_activos) * 100 : 0}
            />
            <KpiCard
              label="Cobertura oferta"
              value={`${totales.cobertura ?? 0}%`}
              sub="Cursos con docente en la gestión"
              badgeText="Oferta"
              intent="success"
              percent={totales.cobertura ?? 0}
            />
          </div>

          <Card title="Docentes">
            <Table
              rowKey="docente_id"
              columns={columns}
              dataSource={docentes}
              pagination={{ pageSize: 20, showSizeChanger: true }}
              locale={{ emptyText: 'Sin asignaciones en esta gestión' }}
            />
          </Card>
        </Spin>
      </MainContent>

      <Drawer
        title={drawerDocente?.nombre ?? 'Detalle de carga'}
        open={Boolean(drawerDocente)}
        onClose={closeDrawer}
        width={480}
      >
        <Spin spinning={drawerLoading}>
          {drawerCarga ? (
            <>
              <Text type="secondary">
                Carga: {drawerCarga.carga_actual_semana}/{drawerCarga.max_horas_semana} h semana ·{' '}
                {drawerCarga.carga_actual_mes}/{drawerCarga.max_horas_mes} h mes
              </Text>
              {drawerCarga.sobrecarga ? (
                <Alert
                  type="warning"
                  showIcon
                  style={{ marginTop: 12 }}
                  message="Docente con sobrecarga en esta gestión"
                />
              ) : null}
              <List
                style={{ marginTop: 16 }}
                header="Asignaciones vigentes"
                dataSource={drawerCarga.asignaciones ?? []}
                locale={{ emptyText: 'Sin asignaciones' }}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.asignatura}
                      description={[item.paralelo, item.horas != null ? `${item.horas} h` : null]
                        .filter(Boolean)
                        .join(' · ')}
                    />
                  </List.Item>
                )}
              />
            </>
          ) : (
            !drawerLoading && <Text type="secondary">Seleccione un docente en la tabla.</Text>
          )}
        </Spin>
      </Drawer>

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

export default CargaDocentesDashboardPage;
