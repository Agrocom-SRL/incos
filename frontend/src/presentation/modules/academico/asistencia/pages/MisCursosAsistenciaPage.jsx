/**
 * Mis cursos de Asistencia — cursos del docente (propio o vista coordinación).
 * Cada curso lleva a su planilla diaria (registro de asistencia).
 */

import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Empty, Flex, Spin, Tag, Typography } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton } from '@atoms';
import { DashboardPageShell } from '@presentation/modules/dashboard/components/organisms';
import { useMisCursosAsistencia } from '@application-academico/asistencia/hooks/useMisCursosAsistencia.js';
import { ASISTENCIA_PERMISOS } from '@application-academico/asistencia/utils/asistenciaPermisos.js';

const { Text } = Typography;

const MisCursosAsistenciaPage = () => {
  const navigate = useNavigate();
  const { titulo, cursos, docente, isLoading, error, refetch, breadcrumbItems, cursoPath } =
    useMisCursosAsistencia();

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader title={titulo} breadcrumbItems={breadcrumbItems} />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Flex vertical gap="middle" style={{ width: '100%', minWidth: 0 }}>
            <Alert
              type="info"
              showIcon
              title="Registro de asistencia"
              description={
                <span>
                  Periodo lectivo <strong>{docente?.gestionVigente ?? '—'}</strong>. Elegí un curso
                  para tomar la asistencia diaria de sus estudiantes.
                </span>
              }
            />

            {error ? (
              <Alert
                type="error"
                showIcon
                title="No se pudieron cargar tus cursos"
                description={String(error)}
                action={
                  <Button size="small" onClick={refetch}>
                    Reintentar
                  </Button>
                }
              />
            ) : null}

            <Spin spinning={isLoading}>
              {!isLoading && (cursos?.length ?? 0) === 0 && !error ? (
                <Empty description="Sin cursos asignados en el periodo vigente." />
              ) : (
                <Flex wrap="wrap" gap="middle">
                  {(cursos ?? []).map((curso) => (
                    <Card
                      key={curso.id}
                      style={{ width: 320, borderTop: `3px solid ${curso.carreraColor}` }}
                      styles={{ body: { padding: 16 } }}
                    >
                      <Flex vertical gap="small">
                        <Text strong style={{ fontSize: 15 }}>
                          {curso.materia}
                        </Text>
                        <Flex wrap="wrap" gap={4}>
                          {curso.materiaSigla ? <Tag>{curso.materiaSigla}</Tag> : null}
                          {curso.paralelo ? <Tag color="blue">{curso.paralelo}</Tag> : null}
                          {curso.turno ? <Tag>{curso.turno}</Tag> : null}
                        </Flex>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {curso.carrera}
                        </Text>
                        <Flex align="center" gap="small">
                          <TeamOutlined />
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            {curso.estudiantes} estudiantes
                          </Text>
                        </Flex>
                        <ActionButton
                          permiso={ASISTENCIA_PERMISOS.registroVer}
                          accion="LISTAR"
                          variant="primary"
                          onClick={() => navigate(cursoPath(curso.id))}
                        >
                          Tomar asistencia
                        </ActionButton>
                      </Flex>
                    </Card>
                  ))}
                </Flex>
              )}
            </Spin>
          </Flex>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default MisCursosAsistenciaPage;
