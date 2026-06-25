/**
 * P2 del Centralizador — bimestres del paralelo.
 *
 * Filas = estudiantes; columnas = promedio por bimestre (1B–4B) + Final.
 * Selector de bimestre (botones 1B–4B) que navega a la matriz por bimestre (P3).
 * Reusa el endpoint centralizador (useCentralizadorParalelo) y la cabecera tipo
 * documento.
 */

import { useNavigate } from 'react-router-dom';
import { Alert, Card, Flex, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { BackButton, Button } from '@atoms';
import { allSpacing } from '@theme/tokens';
import {
  useCentralizadorParalelo,
  BIMESTRES_CENTRALIZADOR,
} from '@application-academico/centralizador/hooks/useCentralizadorParalelo.js';
import {
  CENTRALIZADOR_PATH,
  centralizadorMatrizPath,
} from '@application-academico/centralizador/utils/centralizadorPaths.js';
import { nombreBimestre } from '@application-academico/centralizador/utils/centralizadorDoc.js';
import { sectionCardProps } from '@presentation-utils/cards/sectionCardProps.js';
import CentralizadorContextoHeader from '../components/CentralizadorContextoHeader.jsx';
import CentralizadorBimestresGrid from '../components/CentralizadorBimestresGrid.jsx';
import '@presentation/styles/pages/detail-page.css';
import '../styles/centralizador.css';

const hojaCardProps = {
  ...sectionCardProps,
  styles: { body: { padding: 0 } },
};

const CentralizadorBimestresPage = () => {
  const navigate = useNavigate();
  const {
    paraleloGestionId,
    paraleloSeleccionado,
    bimestrePromedios,
    estudiantes,
    gestionAnio,
    gestionNombre,
    notaMinimaAprobacion,
    isLoading,
    error,
    refetch,
    breadcrumbItems,
  } = useCentralizadorParalelo('ACA-CENTRALIZADOR-BIMESTRES');

  const abrirBimestre = (n) => navigate(centralizadorMatrizPath(paraleloGestionId, n));

  const pageHeader = (
    <PageHeader
      title="Centralizador · bimestres"
      breadcrumbItems={breadcrumbItems}
      actions={
        <BackButton
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(CENTRALIZADOR_PATH)}
          aria-label="Volver a la lista de paralelos"
        >
          Volver
        </BackButton>
      }
    />
  );

  const renderCuerpo = () => {
    if (error) {
      return (
        <Alert
          type="error"
          showIcon
          title="No se pudo cargar el centralizador"
          description={typeof error === 'string' ? error : String(error)}
          action={
            <Button size="small" onClick={refetch}>
              Reintentar
            </Button>
          }
        />
      );
    }

    if (isLoading && estudiantes.length === 0) {
      return (
        <Spin tip="Cargando centralizador…" spinning>
          <div className="cal-centralizador__spin-nest" aria-hidden />
        </Spin>
      );
    }

    if (estudiantes.length === 0) {
      return (
        <Alert
          type="warning"
          showIcon
          title={<strong>Sin estudiantes</strong>}
          description="El paralelo no tiene estudiantes matriculados en la gestión vigente."
        />
      );
    }

    return (
      <Flex vertical gap={allSpacing.marginLG}>
        <CentralizadorContextoHeader
          paralelo={paraleloSeleccionado}
          gestionAnio={gestionAnio}
          gestionNombre={gestionNombre}
        />

        <Flex wrap="wrap" gap={allSpacing.marginSM} align="center">
          <span className="cal-centralizador-bim__selector-label">Ver matriz del bimestre:</span>
          {BIMESTRES_CENTRALIZADOR.map((n) => (
            <Button key={n} variant="info" size="small" onClick={() => abrirBimestre(n)}>
              {nombreBimestre(n)}
            </Button>
          ))}
        </Flex>

        <Card className="cal-centralizador-hoja-card" {...hojaCardProps}>
          <CentralizadorBimestresGrid
            promedios={bimestrePromedios}
            onAbrirBimestre={abrirBimestre}
            gestionAnio={gestionAnio}
            notaMinimaAprobacion={notaMinimaAprobacion}
          />
        </Card>
      </Flex>
    );
  };

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>{pageHeader}</PageHeaderArea>
      <MainContent>
        <Flex vertical gap={allSpacing.marginLG} className="sd cal-centralizador">
          {renderCuerpo()}
        </Flex>
      </MainContent>
    </Flex>
  );
};

export default CentralizadorBimestresPage;
