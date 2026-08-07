/**
 * P1 nivel 2 de Nivelación — grilla estudiantes × asignaturas del paralelo
 * elegido (`/academico/nivelaciones/listar/:paraleloGestionId`). Celda con
 * nota normal o `StatusPill` de evento vigente; clic en el StatusPill navega
 * a `/inscribir` o `/aprobar` con el contexto (ver `nivelacionEventoContexto.js`).
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Flex, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { BackButton, StatusPill } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { useNivelacionParalelo } from '@application-academico/nivelaciones/hooks/useNivelacionParalelo.js';
import {
  NIVELACION_LISTAR_PATH,
  NIVELACION_INSCRIBIR_PATH,
  NIVELACION_APROBAR_PATH,
} from '@application-academico/nivelaciones/utils/nivelacionPaths.js';
import {
  buildAprobarContextoParams,
  buildDetalleEventoContextoParams,
} from '@application-academico/nivelaciones/utils/nivelacionEventoContexto.js';
import { ESTADOS_NIVELACION_PENDIENTES } from '@application-academico/nivelaciones/utils/nivelacionEstados.js';
import { centralizadorParaleloPath } from '@application-academico/centralizador/utils/centralizadorPaths.js';
// Cabecera de contexto reutilizada TAL CUAL de Centralizador (documento de
// diseño B1 nivel 2), a diferencia de CabeceraAsignatura/CeldaEstudiante que
// SÍ se duplican localmente. Su CSS vive en `centralizador.css` (cross-import
// deliberado, mismo criterio que `academico-form-page.css` en Libros/Historial).
import CentralizadorContextoHeader from '@academico/centralizador/components/CentralizadorContextoHeader.jsx';
import { sectionCardProps } from '@presentation-utils/cards/sectionCardProps.js';
import NivelacionGrid from '../components/NivelacionGrid.jsx';
import '@presentation/styles/pages/detail-page.css';
import '@academico/centralizador/styles/centralizador.css';
import '../styles/nivelaciones.css';

const hojaCardProps = {
  ...sectionCardProps,
  styles: { body: { padding: 0 } },
};

const NivelacionParaleloPage = () => {
  const navigate = useNavigate();
  const {
    paraleloGestionId,
    paraleloSeleccionado,
    asignaturas,
    estudiantes,
    totalPendientes,
    isLoading,
    error,
    refetch,
    breadcrumbItems,
  } = useNivelacionParalelo();

  const handleCeldaEventoClick = useCallback(
    (row, asignatura, celda) => {
      const evento = celda.evento;
      const contextoBase = {
        estudianteNombre: row.nombreCompleto,
        estudianteCodigo: row.codigoEstudiante,
        asignaturaSigla: asignatura.sigla,
        asignaturaNombre: asignatura.nombre,
      };

      // Nivelación activa (PROGRAMADA/EN_CURSO): va directo a /aprobar con
      // SOLO el nivelacionId — esa pantalla busca la fila real (con su
      // subjectEnrollmentId, si aplica) en la bandeja que ya carga.
      if (evento.nivelacion && ESTADOS_NIVELACION_PENDIENTES.includes(evento.nivelacion.status)) {
        const params = buildAprobarContextoParams({ nivelacionId: evento.nivelacion.id });
        navigate(`${NIVELACION_APROBAR_PATH}?${params.toString()}`);
        return;
      }

      // Sin nivelación activa: detalle de solo lectura en /inscribir (no hay
      // ancla reutilizable para escribir un evento nuevo desde la grilla).
      const params = buildDetalleEventoContextoParams({
        historialMatriculaId: evento.historialMatriculaId,
        ...contextoBase,
        stateType: evento.stateType,
        transitionDate: evento.transitionDate,
        observations: evento.observations,
        resultingGrade: evento.resultingGrade,
        forcedGrade: evento.forcedGrade,
        esAnclaDirecta: evento.esAnclaDirecta,
        nivelacion: evento.nivelacion,
      });
      navigate(`${NIVELACION_INSCRIBIR_PATH}?${params.toString()}`);
    },
    [navigate],
  );

  const pageHeader = (
    <PageHeader
      title="Grilla de nivelación"
      breadcrumbItems={breadcrumbItems}
      actions={
        <Flex gap={allSpacing.marginSM} wrap="wrap">
          <Button
            variant="info"
            onClick={() => navigate(centralizadorParaleloPath(paraleloGestionId))}
            disabled={paraleloGestionId == null}
          >
            Ver en Centralizador
          </Button>
          <BackButton
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(NIVELACION_LISTAR_PATH)}
            aria-label="Volver a los paralelos"
          >
            Volver
          </BackButton>
        </Flex>
      }
    />
  );

  const renderCuerpo = () => {
    if (error) {
      return (
        <Alert
          type="error"
          showIcon
          title="No se pudo cargar la grilla de nivelación"
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
        <Spin tip="Cargando grilla de nivelación…" spinning>
          <div className="niv-nivelacion__spin-nest" aria-hidden />
        </Spin>
      );
    }

    if (estudiantes.length === 0 || asignaturas.length === 0) {
      return (
        <Alert
          type="warning"
          showIcon
          title={<strong>Sin datos para este paralelo</strong>}
          description="El paralelo no tiene estudiantes matriculados o asignaturas en el plan vigente."
        />
      );
    }

    return (
      <Flex vertical gap={allSpacing.marginLG}>
        <CentralizadorContextoHeader paralelo={paraleloSeleccionado} />

        <Flex wrap="wrap" gap={allSpacing.marginSM} align="center">
          <span className="cal-centralizador-bim__selector-label">Pendientes de nivelación:</span>
          <StatusPill
            label={String(totalPendientes)}
            className={`cfg-materia-pill cfg-materia-pill--${totalPendientes > 0 ? 'warning' : 'default'}`}
          />
        </Flex>

        <Card className="niv-nivelacion-hoja-card" {...hojaCardProps}>
          <NivelacionGrid
            asignaturas={asignaturas}
            estudiantes={estudiantes}
            onCeldaEventoClick={handleCeldaEventoClick}
          />
        </Card>
      </Flex>
    );
  };

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>{pageHeader}</PageHeaderArea>
      <MainContent>
        <Flex vertical gap={allSpacing.marginLG} className="sd niv-nivelacion">
          {renderCuerpo()}
        </Flex>
      </MainContent>
    </Flex>
  );
};

export default NivelacionParaleloPage;
