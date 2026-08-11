/**
 * Organismo: tab "Acta de defensa" de la ficha-hub del proyecto (TIT ·
 * extensión 2026-08-01, más anulación P8 del 2026-08-02).
 *
 * Vista de campo a campo, espejo del acta física (§1 del plan): una
 * `DetailInfoCard` POR ACTA (N si el proyecto es PSP grupal — una por
 * integrante ACTIVO, P3), con el número de acta como pill de foliado,
 * fecha/horario del acto, calificación con el resultado del tribunal
 * (APRUEBA en verde / REPRUEBA en ámbar — nunca rojo puro, mismo criterio
 * que el resto del sistema para estados negativos) y el Tribunal Evaluador
 * como lista numerada. Descarga del PDF gated por proyecto·EXPORTAR.
 *
 * El backend NO devuelve nombre/C.I. del estudiante en el acta (solo
 * `estudianteId`, contrato C12): se cruzan aquí contra `proyecto.integrantes`
 * (ya cargados por la ficha), igual que hace `ProyectoIntegrantesSection`.
 *
 * El acta la registra `RegistrarActaDefensaModal` (proyecto·APROBAR) desde la
 * cabecera de la ficha o desde el estado vacío de esta tab. Un acta `EMITIDA`
 * admite anulación (`AnularActaDefensaModal`, mismo permiso APROBAR); un acta
 * `ANULADA` es terminal: se muestra con pill gris (`--inactiva`, nunca rojo)
 * y pierde tanto el botón "Anular acta" (ya no aplica) como "Exportar acta
 * (PDF)" — un acta anulada no debe imprimirse como si fuera válida (criterio
 * propio del frontend; el backend no lo bloquea explícitamente en el PDF).
 */

import { useMemo } from 'react';
import { Alert, Empty, Flex, Typography } from 'antd';
import { DownloadOutlined, FileDoneOutlined, StopOutlined } from '@ant-design/icons';
import { DetailInfoCard } from '@molecules';
import { ActionButton, DetailField, StatusPill } from '@atoms';
import { TITULACION_PERMISOS } from '@application-titulacion/utils/titulacionPermisos';
import {
  ESTADOS_PROYECTO_GRADO,
  formatEstadoActaDefensa,
  formatResultadoActaDefensa,
  getEstadoActaDefensaPillClass,
  getResultadoActaDefensaPillClass,
} from '@application-titulacion/utils/titulacionPills';
import { allSpacing } from '@theme/tokens';

const { Text } = Typography;

/** Estados previos a `DEFENSA` en la máquina de estados (para el texto del estado vacío). */
const INDICE_DEFENSA = ESTADOS_PROYECTO_GRADO.indexOf('DEFENSA');
const esEstadoPrevioDefensa = (estado) => {
  const indice = ESTADOS_PROYECTO_GRADO.indexOf(estado);
  return indice >= 0 && indice < INDICE_DEFENSA;
};

const ActaCard = ({ acta, descargando, onExportarPdf, onAnular }) => {
  const esAnulada = acta.estado === 'ANULADA';

  return (
    <DetailInfoCard
      title={`Acta de defensa · ${acta.estudianteNombre || 'Estudiante'}`}
      icon={<FileDoneOutlined />}
      cols={3}
      extra={
        <Flex align="center" gap={allSpacing.marginSM} wrap>
          <StatusPill
            label={acta.numeroActaFormateado}
            className="cfg-materia-pill cfg-materia-pill--accent"
          />
          {esAnulada ? (
            <StatusPill
              label={formatEstadoActaDefensa(acta.estado)}
              className={getEstadoActaDefensaPillClass(acta.estado)}
            />
          ) : null}
          {!esAnulada && onExportarPdf ? (
            <ActionButton
              permiso={TITULACION_PERMISOS.proyecto}
              accion="EXPORTAR"
              variant="info"
              icon={<DownloadOutlined />}
              loading={descargando}
              onClick={() => onExportarPdf(acta)}
            >
              Exportar acta (PDF)
            </ActionButton>
          ) : null}
          {!esAnulada && onAnular ? (
            <ActionButton
              permiso={TITULACION_PERMISOS.proyecto}
              accion="APROBAR"
              variant="danger"
              icon={<StopOutlined />}
              onClick={() => onAnular(acta)}
            >
              Anular acta
            </ActionButton>
          ) : null}
        </Flex>
      }
    >
      <DetailField label="Estudiante">{acta.estudianteNombre || '—'}</DetailField>
      <DetailField label="C.I.">{acta.estudianteCi || '—'}</DetailField>
      <DetailField label="Fecha de defensa">{acta.fechaDefensaLabel || '—'}</DetailField>
      <DetailField label="Horario">
        {acta.horaInicio
          ? `${acta.horaInicio}${acta.horaConclusion ? ` – ${acta.horaConclusion}` : ''}`
          : '—'}
      </DetailField>
      <DetailField label="Calificación final" span={2}>
        <Flex align="center" gap={allSpacing.marginXS}>
          <Text strong>
            {acta.calificacionFinal != null ? `${acta.calificacionFinal} / 100` : '—'}
          </Text>
          <StatusPill
            label={formatResultadoActaDefensa(acta.resultado)}
            className={getResultadoActaDefensaPillClass(acta.resultado)}
          />
        </Flex>
      </DetailField>
      <DetailField label="Tribunal Evaluador" span={3}>
        {acta.tribunal.length === 0 ? (
          '—'
        ) : (
          <Flex vertical gap={allSpacing.marginXS}>
            {acta.tribunal.map((miembro, index) => (
              <Flex key={miembro.id ?? index} gap={allSpacing.marginXS} align="baseline" wrap>
                <Text strong>{index + 1}.-</Text>
                <Text>{miembro.nombreCompleto}</Text>
                <Text type="secondary">({miembro.cargo})</Text>
              </Flex>
            ))}
          </Flex>
        )}
      </DetailField>
      {acta.observaciones ? (
        <DetailField label="Observaciones" span={3}>
          {acta.observaciones}
        </DetailField>
      ) : null}
    </DetailInfoCard>
  );
};

const ProyectoActaDefensaSection = ({
  proyecto,
  actas = [],
  loading = false,
  error = null,
  puedeRegistrar = false,
  descargandoId = null,
  onRegistrar,
  onExportarPdf,
  onAnular,
}) => {
  const estadoProyecto = proyecto?.estado ?? null;

  /** El backend no incluye nombre/C.I. del estudiante en el acta: se cruza contra los integrantes ya cargados. */
  const integrantesPorEstudianteId = useMemo(
    () => new Map((proyecto?.integrantes ?? []).map((i) => [i.estudianteId, i])),
    [proyecto?.integrantes],
  );

  const actasEnriquecidas = useMemo(
    () =>
      actas.map((acta) => {
        const integrante = integrantesPorEstudianteId.get(acta.estudianteId);
        return {
          ...acta,
          estudianteNombre: integrante?.nombreCompleto ?? null,
          estudianteCi: integrante?.ci ?? null,
        };
      }),
    [actas, integrantesPorEstudianteId],
  );

  if (error) {
    return (
      <div className="sd-tab-body">
        <Alert
          type="error"
          showIcon
          title="No se pudo cargar el acta de defensa"
          description={error}
        />
      </div>
    );
  }

  if (actasEnriquecidas.length === 0 && !loading) {
    return (
      <div className="sd-tab-body">
        <DetailInfoCard title="Acta de defensa" icon={<FileDoneOutlined />} cols={1}>
          <Empty description="Aún no se registró el acta de defensa de grado.">
            {esEstadoPrevioDefensa(estadoProyecto) ? (
              <Text type="secondary">
                El acta se habilita cuando el proyecto llega a la etapa de Defensa.
              </Text>
            ) : estadoProyecto === 'DEFENSA' && puedeRegistrar ? (
              <ActionButton
                permiso={TITULACION_PERMISOS.proyecto}
                accion="APROBAR"
                variant="primary"
                icon={<FileDoneOutlined />}
                onClick={onRegistrar}
              >
                Registrar acta de defensa
              </ActionButton>
            ) : null}
          </Empty>
        </DetailInfoCard>
      </div>
    );
  }

  return (
    <div className="sd-tab-body">
      {actasEnriquecidas.map((acta) => (
        <ActaCard
          key={acta.id}
          acta={acta}
          descargando={descargandoId === acta.id}
          onExportarPdf={onExportarPdf}
          onAnular={onAnular}
        />
      ))}
    </div>
  );
};

export default ProyectoActaDefensaSection;
