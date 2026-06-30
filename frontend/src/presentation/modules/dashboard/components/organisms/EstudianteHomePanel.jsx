/**
 * EstudianteHomePanel — inicio del estudiante (rama ESTUDIANTE del Dashboard).
 *
 * Replica el layout del dashboard admin con datos propios del estudiante:
 *  - MainContent: banner de bienvenida + su carrera + "Mis docentes".
 *  - InfoSidebar: "Mis sesiones" + "Actividades recientes".
 *
 * Se monta dentro de `DashboardPageShell` (mismo marco que el dashboard admin).
 * SOLO LECTURA / navegación. Reutiliza las moléculas del dashboard (parametrizadas).
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Card, Flex, Spin, Typography } from 'antd';
import { allColors, allSpacing, componentConfig, shadows, typography } from '@theme/tokens';
import { MainContent, InfoSidebar } from '@templates';
import { useEstudianteHome } from '@application-dashboard/hooks/useEstudianteHome.js';
import { PERSONAS_VISIBLE } from '../../constants';
import {
  DashboardWelcomeBanner,
  DashboardCarrerasSection,
  DashboardUltimosPersonasBlock,
  DashboardEstudiantesResumenCard,
  DashboardActividadesRecientesCard,
  DashboardPersonasOverflowModal,
} from '../molecules';

const { Title, Text } = Typography;

/** Estilo de tarjeta homogéneo con el resto del dashboard (tokens, sin literales). */
const CARD_STYLE = {
  borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
  boxShadow: shadows.shadowElevation2,
  border: `1px solid ${allColors.colorBorder}`,
  backgroundColor: allColors.colorBgContainer,
};

const EstudianteHomePanel = () => {
  const navigate = useNavigate();
  const { estudiante, carrera, docentes, actividades, stats, loading, error } =
    useEstudianteHome();

  const [docentesOverflow, setDocentesOverflow] = useState({ open: false, items: [] });

  const abrirDocentesRestantes = () =>
    setDocentesOverflow({ open: true, items: docentes.slice(PERSONAS_VISIBLE) });
  const cerrarDocentesOverflow = () => setDocentesOverflow((m) => ({ ...m, open: false }));

  /** Navega solo a rutas internas seguras provistas por el backend. */
  const navegarSeguro = (path) => {
    if (typeof path === 'string' && path.startsWith('/')) {
      navigate(path);
    }
  };

  const bannerDescription = carrera?.label || 'Bienvenido a tu portal del estudiante';

  return (
    <>
      <MainContent>
        <Spin spinning={loading}>
          <Flex vertical gap="large">
            {error ? (
              <Alert
                type="warning"
                showIcon
                title="No se pudo cargar tu resumen en vivo"
                description={error}
              />
            ) : null}

            <DashboardWelcomeBanner
              title={`Hola, ${estudiante.nombre}`}
              description={bannerDescription}
              showVerCarreras={false}
              showRegistrarEstudiante={false}
            />

            {carrera ? (
              <DashboardCarrerasSection
                carreras={[carrera]}
                title="Mi carrera"
                detalleInteractivo={false}
              />
            ) : null}

            <Card style={CARD_STYLE} styles={{ body: { padding: `${componentConfig.Card.paddingLG}px` } }}>
              {docentes.length === 0 ? (
                <Flex vertical gap={allSpacing.margin}>
                  <Title
                    level={5}
                    style={{
                      color: allColors.colorPrimary,
                      fontSize: `${typography.fontSizeHeading5}px`,
                      fontWeight: typography.fontWeightStrong,
                      margin: 0,
                    }}
                  >
                    Mis docentes
                  </Title>
                  <Text type="secondary" style={{ fontSize: `${typography.fontSizeSM}px` }}>
                    Aún no tienes docentes asignados.
                  </Text>
                </Flex>
              ) : (
                <DashboardUltimosPersonasBlock
                  title="Mis docentes"
                  people={docentes}
                  descriptionPrefix=""
                  overflowTooltip="Ver más docentes"
                  onOverflowClick={abrirDocentesRestantes}
                />
              )}
            </Card>
          </Flex>
        </Spin>
      </MainContent>

      <InfoSidebar>
        <Spin spinning={loading}>
          <Flex vertical gap="large">
            <DashboardEstudiantesResumenCard
              title="Mis sesiones"
              todayLabel="Hoy"
              monthLabel="Este mes"
              unidad="sesiones"
              todayCount={stats.sesionesHoy}
              monthCount={stats.sesionesMes}
            />
            <DashboardActividadesRecientesCard
              actividades={actividades}
              onRowNavigate={navegarSeguro}
            />
          </Flex>
        </Spin>
      </InfoSidebar>

      <DashboardPersonasOverflowModal
        open={docentesOverflow.open}
        title="Mis docentes"
        items={docentesOverflow.items}
        onClose={cerrarDocentesOverflow}
      />
    </>
  );
};

export default EstudianteHomePanel;
