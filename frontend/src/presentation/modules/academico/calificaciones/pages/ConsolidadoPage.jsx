/**
 * Registro académico de notas del curso — vista consolidada de solo lectura.
 */

import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Flex, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { BackButton } from '@atoms';
import { allSpacing, allColors, componentConfig, shadows } from '@theme/tokens';
import { useConsolidadoCurso } from '@application-academico/calificaciones/hooks/useConsolidadoCurso.js';
import { cuadernoBimestrePath } from '@application-academico/calificaciones/utils/calificacionesPaths.js';
import CursoProfileHeader from '../components/CursoProfileHeader.jsx';
import ConsolidadoGrid from '../components/ConsolidadoGrid.jsx';
import AjustesCursoDrawer from '../components/AjustesCursoDrawer.jsx';
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
  const [ajustesAbierto, setAjustesAbierto] = useState(false);
  const {
    curso,
    docente,
    estudiantes,
    bimestreTitulos,
    bimestresCalendario,
    bimestreVigente,
    notaMinimaAprobacion,
    profileStats,
    subtituloCurso,
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
      navigate(cuadernoBimestrePath(asignacionId, bimestre));
    },
    [navigate, asignacionId],
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
          <CursoProfileHeader
            materia={curso?.materia}
            sigla={curso?.materiaSigla}
            subtitulo={subtituloCurso}
            carreraColor={curso?.carreraColor}
            stats={profileStats}
            pill={
              docente?.bimestreVigente
                ? `Bimestre ${docente.bimestreVigente}`
                : null
            }
            onAjustes={() => setAjustesAbierto(true)}
            ajustesDisabled={!asignacionId}
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

      <AjustesCursoDrawer
        abierto={ajustesAbierto}
        cursoId={asignacionId}
        onCerrar={() => setAjustesAbierto(false)}
        onGuardado={refetch}
      />
    </Flex>
  );
};

export default ConsolidadoPage;
