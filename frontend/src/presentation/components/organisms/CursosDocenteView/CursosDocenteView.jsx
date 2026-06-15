/**
 * Vista de "mis cursos" del docente (propios o vista coordinación).
 * Componente de página COMPARTIDO: Calificaciones (cards con progreso por
 * bimestre) y Asistencia (cards simples). Cada menú lo envuelve con su hook,
 * sus textos y el render de cada card (acción + extra).
 */

import { Alert, Button, Card, Flex, Spin, Typography } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { allSpacing } from '@theme/tokens';
import { sectionCardProps } from '@presentation-utils/cards/sectionCardProps.js';
import CursosDocenteSkeleton from './CursosDocenteSkeleton.jsx';
import '@presentation/styles/pages/detail-page.css';
import '@presentation/styles/components/curso-card.css';

const { Text } = Typography;

const CursosDocenteView = ({
  title,
  breadcrumbItems,
  headerActions = null,
  cursos,
  isLoading,
  error,
  refetch,
  infoTitle,
  infoDescription = null,
  emptyTitle,
  panelTitle = 'Cursos asignados',
  skeletonCount = 4,
  renderCard,
}) => {
  const header = (
    <PageHeader
      title={title}
      breadcrumbItems={breadcrumbItems}
      actions={headerActions}
    />
  );

  const sinCursos = !isLoading && !error && (cursos?.length ?? 0) === 0;

  return (
    <PageTemplate header={header} sidebar={null}>
      <div className="cursos-docente-inicio sd">
        <Spin spinning={isLoading} tip="Cargando cursos…">
          <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%' }}>
            {infoDescription ? (
              <Alert
                type="info"
                showIcon
                title={infoTitle ?? title}
                description={infoDescription}
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

            {sinCursos ? (
              <Alert type="info" showIcon title={emptyTitle} />
            ) : null}

            {isLoading ? <CursosDocenteSkeleton count={skeletonCount} /> : null}

            {!isLoading && cursos?.length ? (
              <Card className="cursos-docente__panel" {...sectionCardProps}>
                <Flex vertical gap={allSpacing.marginMD}>
                  <Text strong style={{ fontSize: 16 }}>
                    {panelTitle}
                  </Text>
                  <div className="cursos-docente__grid">
                    {cursos.map((curso) => renderCard(curso))}
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

export default CursosDocenteView;
