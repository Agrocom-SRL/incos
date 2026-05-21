/**
 * Vista general de coordinación — docentes con cursos en la gestión vigente.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Flex,
  Input,
  Spin,
  Table,
  Typography,
} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton } from '@atoms';
import { allSpacing, allColors, componentConfig, shadows } from '@theme/tokens';
import { DashboardPageShell } from '@presentation/modules/dashboard/components/organisms';
import { useVistaAdminDocentes } from '@application-academico/calificaciones/hooks/useVistaAdminDocentes.js';
import {
  docenteCursosPath,
  POLITICA_INSTITUCIONAL_PATH,
} from '@application-academico/calificaciones/utils/calificacionesPaths.js';
import { CALIFICACIONES_PERMISOS } from '@application-academico/calificaciones/utils/calificacionesPermisos.js';
import {
  CoordinacionCarrerasCelda,
  CoordinacionMetricasCelda,
} from '../components/CoordinacionTablaCeldas.jsx';
import '@presentation/styles/pages/detail-page.css';
import '../styles/calificaciones.css';

const { Text } = Typography;

const sectionCardProps = {
  style: {
    borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
    boxShadow: shadows.shadowElevation2,
    border: `1px solid ${allColors.colorBorder}`,
    backgroundColor: allColors.colorBgContainer,
  },
  styles: {
    body: { padding: `${componentConfig.Card.paddingLG}px` },
  },
};

const CeldaConIcono = ({ icon, children }) => (
  <div className="cal-coord-celda">
    <span className="cal-coord-celda__icon" aria-hidden>
      {icon}
    </span>
    <div className="cal-coord-celda__contenido">{children}</div>
  </div>
);

const CoordinacionCalificacionesPage = () => {
  const navigate = useNavigate();
  const {
    docentes,
    gestionVigente,
    isLoading,
    error,
    refetch,
    breadcrumbItems,
    busquedaInput,
    setBusquedaInput,
    esBusquedaActiva,
    busquedaMinChars,
    prelimLimit,
  } = useVistaAdminDocentes();

  const periodoLabel = gestionVigente ?? '—';

  const columnas = useMemo(
    () => [
      {
        title: 'Docente',
        key: 'docente',
        width: 220,
        render: (_, row) => (
          <CeldaConIcono icon={<UserOutlined />}>
            <Text strong>{row.nombre}</Text>
            {row.especialidad ? (
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {row.especialidad}
                </Text>
              </div>
            ) : null}
          </CeldaConIcono>
        ),
      },
      {
        title: 'Carreras',
        key: 'carreras',
        width: 260,
        render: (_, row) => <CoordinacionCarrerasCelda carreras={row.carreras} />,
      },
      {
        title: 'Carga académica',
        key: 'carga',
        width: 160,
        render: (_, row) => (
          <CoordinacionMetricasCelda
            cantidadMaterias={row.cantidadMaterias}
            cantidadCursos={row.cantidadCursos}
            cantidadEstudiantes={row.cantidadEstudiantes}
          />
        ),
      },
      {
        title: '',
        key: 'accion',
        width: 140,
        fixed: 'right',
        render: (_, row) => (
          <ActionButton
            permiso={CALIFICACIONES_PERMISOS.coordinacion}
            accion="LISTAR"
            variant="primary"
            onClick={() => navigate(docenteCursosPath(row.id))}
          >
            Ver cursos
          </ActionButton>
        ),
      },
    ],
    [navigate]
  );

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title="Coordinación de calificaciones"
          breadcrumbItems={breadcrumbItems}
          actions={
            <Flex wrap="wrap" gap={allSpacing.marginSM} justify="flex-end">
              <ActionButton
                permiso={CALIFICACIONES_PERMISOS.politica}
                accion="LISTAR"
                variant="primary"
                onClick={() => navigate(POLITICA_INSTITUCIONAL_PATH)}
              >
                Configuración de notas
              </ActionButton>
            </Flex>
          }
        />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Spin spinning={isLoading} tip="Cargando docentes…">
            <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
              <Alert
                type="info"
                showIcon
                title="Coordinación de calificaciones"
                description={
                  <span>
                    Periodo lectivo <strong>{periodoLabel}</strong>. Docentes con cursos que tienen
                    estudiantes matriculados. Seleccioná uno para revisar sus materias y el cuaderno de
                    notas; el avance por bimestre lo define cada docente en su curso.
                  </span>
                }
              />

              {error ? (
                <Alert
                  type="error"
                  showIcon
                  title="No se pudo cargar el listado"
                  description={String(error)}
                  action={
                    <Button size="small" onClick={refetch}>
                      Reintentar
                    </Button>
                  }
                />
              ) : null}

              <Card className="cal-coordinacion-card" {...sectionCardProps}>
                <Flex vertical gap={allSpacing.marginMD}>
                  <Text strong style={{ fontSize: 16 }}>
                    Docentes
                  </Text>

                  <Input.Search
                    allowClear
                    placeholder="Nombre, especialidad o carrera…"
                    value={busquedaInput}
                    onChange={(e) => setBusquedaInput(e.target.value)}
                    style={{ maxWidth: 480 }}
                  />

                  <Text type="secondary" style={{ fontSize: 13, margin: 0 }}>
                    {esBusquedaActiva
                      ? `Búsqueda activa. Menos de ${busquedaMinChars} caracteres restaura la muestra inicial.`
                      : `Hasta ${prelimLimit} docentes con más estudiantes matriculados. Mínimo ${busquedaMinChars} caracteres para buscar en todo el listado.`}
                  </Text>

                  <Table
                    rowKey="id"
                    loading={isLoading}
                    columns={columnas}
                    dataSource={docentes}
                    scroll={{ x: 820 }}
                    pagination={
                      esBusquedaActiva
                        ? { pageSize: 10, showSizeChanger: true, hideOnSinglePage: true }
                        : { pageSize: prelimLimit, hideOnSinglePage: true }
                    }
                    className="cal-docentes-admin__table cal-coordinacion-table"
                    locale={{
                      emptyText: error
                        ? String(error)
                        : isLoading
                          ? 'Cargando…'
                          : 'Sin docentes con cursos matriculados en el periodo vigente.',
                    }}
                  />
                </Flex>
              </Card>
            </Flex>
          </Spin>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default CoordinacionCalificacionesPage;
