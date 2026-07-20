/**
 * Organismo: contenido del paso "Curso" de Inscribir participante (CAP).
 * Selector del curso de capacitación activo y resumen de costo/cupo/fechas/
 * horarios del curso elegido (reusa `fin-pago-reg-resumen` de
 * pagos-registrar.css). Recibe props ya mapeadas del hook; no llama hooks
 * de fetch.
 */

import { Alert, Empty, Select, Typography } from 'antd';
import { formatBs } from '@application/utils/formatters';
import { formatEstadoCurso } from '@application-capacitacion/utils/capacitacionPills';
import { allSpacing } from '@theme/tokens';

const { Text } = Typography;

const InscribirParticipanteSeccionCurso = ({
  cursos,
  loadingCursos,
  errorCursos,
  cursoSeleccionadoId,
  cursoSeleccionado,
  onCursoChange,
}) => {
  const cursoOptions = cursos.map((curso) => ({
    value: curso.id,
    label: `${curso.titulo} · Bs ${formatBs(curso.costo)} · ${formatEstadoCurso(curso.estado)}`,
  }));

  return (
    <>
      {errorCursos ? (
        <Alert
          type="error"
          showIcon
          title="No se pudieron cargar los cursos"
          description={errorCursos}
          style={{ marginBottom: allSpacing.marginSM }}
        />
      ) : null}

      {!loadingCursos && !errorCursos && cursos.length === 0 ? (
        <Empty description="No hay cursos de capacitación disponibles." />
      ) : (
        <Select
          size="large"
          style={{ width: '100%' }}
          loading={loadingCursos}
          placeholder="Seleccione el curso"
          options={cursoOptions}
          value={cursoSeleccionadoId ?? undefined}
          onChange={onCursoChange}
          showSearch
          optionFilterProp="label"
        />
      )}

      {cursoSeleccionado ? (
        <div className="fin-pago-reg-resumen" style={{ marginTop: allSpacing.marginSM }}>
          <div className="fin-pago-reg-resumen__item">
            <Text type="secondary" className="fin-pago-reg-resumen__label">
              Costo
            </Text>
            <Text strong>Bs {formatBs(cursoSeleccionado.costo)}</Text>
          </div>
          <div className="fin-pago-reg-resumen__item">
            <Text type="secondary" className="fin-pago-reg-resumen__label">
              Cupo
            </Text>
            <Text strong>
              {cursoSeleccionado.cupoMaximo != null
                ? `${cursoSeleccionado.inscritosCount} / ${cursoSeleccionado.cupoMaximo}`
                : `${cursoSeleccionado.inscritosCount} inscritos`}
            </Text>
          </div>
          <div className="fin-pago-reg-resumen__item">
            <Text type="secondary" className="fin-pago-reg-resumen__label">
              Fechas
            </Text>
            <Text strong>{cursoSeleccionado.fechasLabel || '—'}</Text>
          </div>
          <div className="fin-pago-reg-resumen__item">
            <Text type="secondary" className="fin-pago-reg-resumen__label">
              Horarios
            </Text>
            <Text strong>{cursoSeleccionado.horariosDetalle || 'Por definir'}</Text>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default InscribirParticipanteSeccionCurso;
