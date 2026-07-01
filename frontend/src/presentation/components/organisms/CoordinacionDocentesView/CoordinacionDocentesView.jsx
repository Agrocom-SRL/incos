/**
 * Vista de coordinación · "elegir docente" — pantalla previa del admin.
 * Componente de página COMPARTIDO: Calificaciones y Asistencia (mismos datos,
 * distinto título/permiso/ruta). Cada menú lo envuelve pasando su hook + config.
 */

import { useMemo } from 'react';
import { Alert, Button, Card, Flex, Input, Table, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { sectionCardProps } from '@presentation-utils/cards/sectionCardProps.js';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import {
  CoordDocCarrerasCelda,
  CoordDocCeldaConIcono,
  CoordDocMetricasCelda,
} from './celdas.jsx';
import '@presentation/styles/components/coordinacion-docentes.css';

const { Text } = Typography;

const CoordinacionDocentesView = ({
  title,
  breadcrumbItems,
  headerActions = null,
  infoTitle,
  infoDescription,
  searchPlaceholder = 'Nombre, especialidad o carrera…',
  emptyText = 'Sin docentes con cursos matriculados en el periodo vigente.',
  docentes,
  isLoading,
  error,
  refetch,
  busquedaInput,
  setBusquedaInput,
  esBusquedaActiva,
  busquedaMinChars,
  prelimLimit,
  accionPermiso,
  accionLabel = 'Ver cursos',
  onElegirDocente,
}) => {
  const columnas = useMemo(
    () => [
      {
        title: 'Docente',
        key: 'docente',
        width: 220,
        render: (_, row) => (
          <CoordDocCeldaConIcono icon={<UserOutlined />}>
            <Text strong>{row.nombre}</Text>
            {row.especialidad ? (
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {row.especialidad}
                </Text>
              </div>
            ) : null}
          </CoordDocCeldaConIcono>
        ),
      },
      {
        title: 'Carreras',
        key: 'carreras',
        width: 260,
        render: (_, row) => <CoordDocCarrerasCelda carreras={row.carreras} />,
      },
      {
        title: 'Carga académica',
        key: 'carga',
        width: 160,
        render: (_, row) => (
          <CoordDocMetricasCelda
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
            permiso={accionPermiso}
            accion="LISTAR"
            variant="primary"
            onClick={() => onElegirDocente?.(row)}
          >
            {accionLabel}
          </ActionButton>
        ),
      },
    ],
    [accionPermiso, accionLabel, onElegirDocente]
  );

  return (
    <Flex
      vertical
      gap="large"
      className="page-container"
      style={{ width: '100%' }}
    >
      <PageHeaderArea>
        <PageHeader
          title={title}
          breadcrumbItems={breadcrumbItems}
          actions={headerActions}
        />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Flex
            vertical
            gap={allSpacing.marginLG}
            style={{ width: '100%', minWidth: 0 }}
          >
            <Alert
              type="info"
              showIcon
              title={infoTitle ?? title}
              description={infoDescription}
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

            <Card {...sectionCardProps}>
              <Flex vertical gap={allSpacing.marginMD}>
                <Text strong style={{ fontSize: 16 }}>
                  Docentes
                </Text>

                <Input.Search
                  allowClear
                  placeholder={searchPlaceholder}
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
                  className="coord-doc-table"
                  pagination={
                    esBusquedaActiva
                      ? {
                          pageSize: 10,
                          showSizeChanger: true,
                          hideOnSinglePage: true,
                        }
                      : { pageSize: prelimLimit, hideOnSinglePage: true }
                  }
                  locale={{
                    emptyText: error
                      ? String(error)
                      : isLoading
                        ? 'Cargando…'
                        : emptyText,
                  }}
                />
              </Flex>
            </Card>
          </Flex>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default CoordinacionDocentesView;
