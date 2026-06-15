/**
 * Registro académico de notas del curso — vista consolidada de solo lectura.
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Flex, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { BackButton } from '@atoms';
import { allSpacing, allColors, componentConfig, shadows } from '@theme/tokens';
import { useConsolidadoCurso } from '@application-academico/calificaciones/hooks/useConsolidadoCurso.js';
import {
  bimestreConsolidadoPath,
  cuadernoBimestrePath,
} from '@application-academico/calificaciones/utils/calificacionesPaths.js';
import {
  ESTADO_BIMESTRE_HEADER,
  resolverEstadoBimestreHeader,
} from '@application-academico/calificaciones/utils/bimestreConsolidadoUtils.js';
import CursoHeaderCard from '../components/CursoHeaderCard.jsx';
import ConsolidadoGrid from '../components/ConsolidadoGrid.jsx';
import '@presentation/styles/pages/detail-page.css';
import '../styles/calificaciones.css';

const sectionCardProps = {
  style: {
    borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
    boxShadow: shadows.shadowElevation2,
    border: `1px solid ${allColors.colorBorder}`,
    backgroundColor: allColors.colorBgContainer,
  },
  styles: {
    body: { padding: 0 },
  },
};

const ConsolidadoPage = () => {
  const navigate = useNavigate();
  const {
    curso,
    docente,
    estudiantes,
    bimestreTitulos,
    bimestresCalendario = [],
    bimestreVigente,
    notaMinimaAprobacion,
    isLoading,
    error,
    refetch,
    breadcrumbItems,
    volverPath,
    asignacionId,
  } = useConsolidadoCurso();

  const handleAbrirCuaderno = useCallback(
    (bimestre) => {
      if (!asignacionId) return;
      const meta = bimestresCalendario.find(
        (b) => Number(b.numero ?? b.numeroOrden ?? b.numero_orden) === Number(bimestre),
      );
      const estado = resolverEstadoBimestreHeader(
        bimestre,
        bimestreVigente,
        meta?.estadoCalendario ?? meta?.estado_calendario,
      );
      if (estado === ESTADO_BIMESTRE_HEADER.CERRADO) {
        navigate(bimestreConsolidadoPath(asignacionId, bimestre));
        return;
      }
      navigate(cuadernoBimestrePath(asignacionId, bimestre));
    },
    [navigate, asignacionId, bimestreVigente, bimestresCalendario],
  );

  const headerActions = (
    <BackButton
      icon={<ArrowLeftOutlined />}
      onClick={() => navigate(volverPath)}
      aria-label="Volver a mis cursos"
    />
  );

  if (isLoading && !curso) {
    return (
      <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
        <PageHeaderArea>
          <PageHeader
            title="Registro académico de notas"
            breadcrumbItems={breadcrumbItems}
            actions={headerActions}
          />
        </PageHeaderArea>
        <MainContent>
          <Spin tip="Cargando registro académico…" spinning>
            <div className="cal-consolidado-page__spin-nest" aria-hidden />
          </Spin>
        </MainContent>
      </Flex>
    );
  }

  if (error && !curso) {
    return (
      <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
        <PageHeaderArea>
          <PageHeader
            title="Registro académico de notas"
            breadcrumbItems={breadcrumbItems}
            actions={headerActions}
          />
        </PageHeaderArea>
        <MainContent>
          <Alert
            type="error"
            showIcon
            title="No se pudo cargar el registro académico"
            description={typeof error === 'string' ? error : String(error)}
            action={
              <Button size="small" onClick={refetch}>
                Reintentar
              </Button>
            }
          />
        </MainContent>
      </Flex>
    );
  }

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title="Registro académico de notas"
          breadcrumbItems={breadcrumbItems}
          actions={headerActions}
        />
      </PageHeaderArea>

      <MainContent>
        <Flex vertical gap={allSpacing.marginLG} className="sd cal-consolidado">
          <CursoHeaderCard
            curso={curso}
            docente={docente}
            bimestreActual={docente?.bimestreVigente ?? null}
            estudiantesCount={estudiantes.length}
          />

          <Card className="cal-consolidado__hoja" {...sectionCardProps}>
            <ConsolidadoGrid
              estudiantes={estudiantes}
              bimestreTitulos={bimestreTitulos}
              bimestresCalendario={bimestresCalendario}
              bimestreVigente={bimestreVigente}
              notaMinimaAprobacion={notaMinimaAprobacion}
              onAbrirCuaderno={handleAbrirCuaderno}
            />
          </Card>
        </Flex>
      </MainContent>
    </Flex>
  );
};

export default ConsolidadoPage;
