/**
 * Calificaciones — cursos del docente (propio o elegido por coordinación).
 */

import { useCallback, useEffect } from 'react';
import { useAuth } from '@application-auth';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Flex, Spin, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { BackButton } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { useMisCursosCalificaciones } from '@application-academico/calificaciones/hooks/useMisCursosCalificaciones.js';
import { CALIFICACIONES_PERMISOS } from '@application-academico/calificaciones/utils/calificacionesPermisos.js';
import { CALIFICACIONES_PATH } from '@application-academico/calificaciones/utils/calificacionesPaths.js';
import CursoCard from '../components/CursoCard.jsx';
import CalificacionesCursosSkeleton from '../components/CalificacionesCursosSkeleton.jsx';
import { calificacionesSectionCardProps } from '../utils/calificacionesSectionCard.js';
import '@presentation/styles/pages/detail-page.css';
import '../styles/calificaciones.css';

const { Text } = Typography;

const MisCursosPage = () => {
  const navigate = useNavigate();
  const { refreshMe, hasPermiso } = useAuth();
  const puedeVolverCoordinacion = hasPermiso(
    CALIFICACIONES_PERMISOS.coordinacion,
    'LISTAR',
  );

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const {
    titulo,
    subtitulo,
    contextoLinea,
    cursos,
    docente,
    esVistaCoordinacion,
    isLoading,
    error,
    refetch,
    breadcrumbItems,
    cursoPath,
    periodoLectivoLabel,
  } = useMisCursosCalificaciones();

  const handleVolver = useCallback(() => {
    navigate(CALIFICACIONES_PATH);
  }, [navigate]);

  const headerActions =
    esVistaCoordinacion || puedeVolverCoordinacion ? (
      <Flex wrap="wrap" gap={allSpacing.marginSM} justify="flex-end" align="center">
        <BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver} />
      </Flex>
    ) : null;

  const header = (
    <PageHeader title={titulo} breadcrumbItems={breadcrumbItems} actions={headerActions} />
  );

  return (
    <PageTemplate header={header} sidebar={null}>
      <div className="cal-calificaciones-inicio sd">
        <Spin spinning={isLoading} tip="Cargando cursos…">
          <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%' }}>
            {!isLoading && periodoLectivoLabel ? (
              <Alert
                type="info"
                showIcon
                title={esVistaCoordinacion ? 'Cursos del docente' : 'Tus cursos'}
                description={
                  <span>
                    {subtitulo ? (
                      <>
                        {subtitulo}
                        <br />
                      </>
                    ) : null}
                    Periodo lectivo según calendario académico:{' '}
                    <strong>{periodoLectivoLabel}</strong>
                    {contextoLinea ? (
                      <>
                        <br />
                        {contextoLinea}
                      </>
                    ) : null}
                  </span>
                }
              />
            ) : null}

            {error ? (
              <Alert
                type="error"
                showIcon
                title="No se pudieron cargar los cursos"
                description={typeof error === 'string' ? error : String(error)}
                action={
                  <Button size="small" onClick={refetch}>
                    Reintentar
                  </Button>
                }
              />
            ) : null}

            {!isLoading && !error && cursos?.length === 0 ? (
              <Alert
                type="info"
                showIcon
                message={
                  esVistaCoordinacion
                    ? 'Este docente no tiene cursos asignados en la gestión.'
                    : 'No tenés cursos asignados en la gestión vigente.'
                }
              />
            ) : null}

            {isLoading ? (
              <CalificacionesCursosSkeleton count={esVistaCoordinacion ? 3 : 4} />
            ) : null}

            {!isLoading && cursos?.length ? (
              <Card className="cal-calificaciones-inicio__panel" {...calificacionesSectionCardProps}>
                <Flex vertical gap={allSpacing.marginMD}>
                  <Text strong style={{ fontSize: 16 }}>
                    Cursos asignados
                  </Text>
                  <div className="cal-calificaciones-inicio__grid">
                    {cursos.map((curso) => (
                      <CursoCard
                        key={curso.id}
                        curso={curso}
                        cursoPath={cursoPath}
                        bimestreVigente={docente?.bimestreVigente}
                      />
                    ))}
                  </div>
                </Flex>
              </Card>
            ) : null}
          </Flex>
        </Spin>
      </div>
    </PageTemplate>
  );
};

export default MisCursosPage;
