/**
 * Coordinación de Asistencia — elegir docente (pantalla previa del admin).
 * Gemelo de calificaciones/CoordinacionPage. Al elegir un docente navega a sus cursos.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Flex, Input, Table, Tag, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton } from '@atoms';
import { DashboardPageShell } from '@presentation/modules/dashboard/components/organisms';
import { useVistaAdminAsistenciaDocentes } from '@application-academico/asistencia/hooks/useVistaAdminAsistenciaDocentes.js';
import { MIS_CURSOS_PATH } from '@application-academico/asistencia/utils/asistenciaPaths.js';
import { ASISTENCIA_PERMISOS } from '@application-academico/asistencia/utils/asistenciaPermisos.js';

const { Text } = Typography;

const CoordinacionAsistenciaPage = () => {
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
  } = useVistaAdminAsistenciaDocentes();

  const columnas = useMemo(
    () => [
      {
        title: 'Docente',
        key: 'docente',
        width: 240,
        render: (_, row) => (
          <Flex align="center" gap="small">
            <UserOutlined />
            <div>
              <Text strong>{row.nombre}</Text>
              {row.especialidad ? (
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {row.especialidad}
                  </Text>
                </div>
              ) : null}
            </div>
          </Flex>
        ),
      },
      {
        title: 'Carreras',
        key: 'carreras',
        render: (_, row) => (
          <Flex wrap="wrap" gap={4}>
            {(row.carreras ?? []).map((c) => (
              <Tag key={c.nombre}>{c.nombre}</Tag>
            ))}
          </Flex>
        ),
      },
      {
        title: 'Carga académica',
        key: 'carga',
        width: 200,
        render: (_, row) => (
          <Text type="secondary" style={{ fontSize: 13 }}>
            {row.cantidadMaterias} materias · {row.cantidadCursos} cursos ·{' '}
            {row.cantidadEstudiantes} estudiantes
          </Text>
        ),
      },
      {
        title: '',
        key: 'accion',
        width: 140,
        fixed: 'right',
        render: (_, row) => (
          <ActionButton
            permiso={ASISTENCIA_PERMISOS.coordinacion}
            accion="LISTAR"
            variant="primary"
            onClick={() =>
              navigate(MIS_CURSOS_PATH, {
                state: { docenteId: row.id, docenteNombre: row.nombre },
              })
            }
          >
            Ver cursos
          </ActionButton>
        ),
      },
    ],
    [navigate],
  );

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader title="Coordinación de asistencia" breadcrumbItems={breadcrumbItems} />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Flex vertical gap="middle" style={{ width: '100%', minWidth: 0 }}>
            <Alert
              type="info"
              showIcon
              title="Coordinación de asistencia"
              description={
                <span>
                  Periodo lectivo <strong>{gestionVigente ?? '—'}</strong>. Docentes con cursos que
                  tienen estudiantes matriculados. Seleccioná uno para revisar sus materias y tomar
                  asistencia.
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

            <Card>
              <Flex vertical gap="middle">
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
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default CoordinacionAsistenciaPage;
