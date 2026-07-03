/**
 * MiHorarioPage — calendario semanal del docente AUTENTICADO (portal del docente).
 *
 * Página liviana de solo lectura: PageTemplate + PageHeader + grilla semanal
 * (`DocenteHorarioSemanalGrid`) alimentada por los bloques del mi-resumen-docente
 * (`useDocenteHome` ya agrupa `horarioBloques` → courseSchedules con
 * `mapHorarioBloquesToCourseSchedules`, mismo mapper que el dashboard).
 * La identidad se resuelve en servidor; no recibe ids del cliente.
 */

import { Alert, Button, Card, Empty, Flex, Spin, Typography } from 'antd';
import { allColors, allSpacing, componentConfig, shadows, typography } from '@theme/tokens';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { useDocenteHome } from '@application-dashboard/hooks/useDocenteHome.js';
import DocenteHorarioSemanalGrid from '@docentes/components/organisms/DocenteHorarioSemanalGrid';

const { Text } = Typography;

const BREADCRUMB_ITEMS = [{ title: 'Inicio', href: '/' }, { title: 'Mi horario' }];

const MiHorarioPage = () => {
  const { gestion, horarioCursos, loading, error, refetch } = useDocenteHome();

  const gestionLabel = [gestion.nombre, gestion.bimestreNombre].filter(Boolean).join(' · ');

  return (
    <PageTemplate
      header={<PageHeader title="Mi horario" breadcrumbItems={BREADCRUMB_ITEMS} />}
      sidebar={null}
    >
      <Spin spinning={loading} size="large" tip="Cargando tu horario…">
        <Flex vertical gap={allSpacing.margin} style={{ width: '100%', minWidth: 0 }}>
          {error ? (
            <Alert
              type="warning"
              showIcon
              title="No se pudo cargar tu horario"
              description={error}
              action={
                <Button size="small" onClick={refetch}>
                  Reintentar
                </Button>
              }
            />
          ) : null}

          <Card
            style={{
              borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
              boxShadow: shadows.shadowElevation2,
              border: `1px solid ${allColors.colorBorder}`,
              backgroundColor: allColors.colorBgContainer,
            }}
            styles={{ body: { padding: `${allSpacing.margin}px` } }}
          >
            <Flex vertical gap={allSpacing.marginSM}>
              {gestionLabel ? (
                <Text type="secondary" style={{ fontSize: `${typography.fontSizeSM}px` }}>
                  Bloques de clase publicados en la {gestionLabel}.
                </Text>
              ) : null}
              {horarioCursos.length > 0 ? (
                <DocenteHorarioSemanalGrid courseSchedules={horarioCursos} />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Aún no tienes bloques de horario publicados en la gestión vigente."
                />
              )}
            </Flex>
          </Card>
        </Flex>
      </Spin>
    </PageTemplate>
  );
};

export default MiHorarioPage;
