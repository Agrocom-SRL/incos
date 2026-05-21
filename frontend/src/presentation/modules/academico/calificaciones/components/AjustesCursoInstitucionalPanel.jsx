/**
 * Resumen de la política institucional vigente (referencia antes del override del curso).
 */

import { Alert, Tag, Typography } from 'antd';
import {
  describeAlcanceRegla,
  etiquetaAlcanceEvaluacionFinal,
} from '@application-academico/calificaciones/utils/evaluacionesFinalesReglas.js';
import { reglaAplicaAlCurso } from '@application-academico/calificaciones/utils/reglaAplicaAlCurso.js';
import { POLITICAS_ASISTENCIA } from '@application-academico/calificaciones/utils/politicasAsistencia.js';

const { Text, Paragraph } = Typography;

const etiquetaAsistencia = (codigo) =>
  POLITICAS_ASISTENCIA.find((p) => p.value === codigo)?.label ?? codigo ?? '—';

const Fila = ({ label, value }) => (
  <div className="cal-ajustes-inst__fila">
    <Text type="secondary" className="cal-ajustes-inst__label">
      {label}
    </Text>
    <Text className="cal-ajustes-inst__valor">{value}</Text>
  </div>
);

const AjustesCursoInstitucionalPanel = ({ institucional, curso, gestionVigente }) => {
  if (!institucional) return null;

  const reglas = institucional.evaluacionesFinalesReglas ?? [];
  const pesosBim = institucional.pesosBimestres ?? [25, 25, 25, 25];
  const pad = institucional.politicaAsistenciaDefault ?? {};
  const cursoCtx = {
    carreraNombre: curso?.carreraNombre,
    periodoNombre: curso?.periodoNombre,
  };

  return (
    <section className="cal-ajustes-inst">
      <Alert
        type="info"
        showIcon
        className="cal-ajustes-inst__intro"
        message="Configuración institucional (solo lectura)"
        description={
          <>
            Valores definidos por coordinación para la gestión{' '}
            <strong>{gestionVigente ?? '—'}</strong>. Más abajo podés{' '}
            <strong>ajustar solo este curso</strong>; esos cambios reemplazan la institución para
            la materia y el paralelo actual, sin modificar la política global.
          </>
        }
      />

      {!institucional.configurada ? (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 12 }}
          message="La gestión vigente aún no tiene política institucional guardada"
          description="Hasta que coordinación configure las notas, los cursos usan valores por defecto."
        />
      ) : null}

      <div className="cal-ajustes-inst__bloque">
        <h4 className="cal-ajustes-inst__bloque-titulo">Ponderación teórico / práctico</h4>
        <Fila
          label="Institución"
          value={`${institucional.cuotaTeorico ?? 30}% teórico · ${institucional.cuotaPractico ?? 70}% práctico`}
        />
      </div>

      <div className="cal-ajustes-inst__bloque">
        <h4 className="cal-ajustes-inst__bloque-titulo">Ponderación por bimestre (nota anual)</h4>
        <Fila
          label="Distribución"
          value={pesosBim.map((p, i) => `B${i + 1}: ${p}%`).join(' · ')}
        />
      </div>

      <div className="cal-ajustes-inst__bloque">
        <h4 className="cal-ajustes-inst__bloque-titulo">Evaluaciones finales habilitadas</h4>
        <Paragraph type="secondary" className="cal-ajustes-inst__hint">
          Cada regla puede aplicar a toda la gestión, a una carrera o a un periodo (año del plan).
          Para este curso ({curso?.materiaNombre ?? '—'}) se marca si la regla institucional aplica.
        </Paragraph>
        {reglas.length === 0 ? (
          <Text type="secondary">Sin reglas de evaluaciones finales en la gestión.</Text>
        ) : (
          <ul className="cal-ajustes-inst__reglas">
            {reglas.map((r) => {
              const aplica = reglaAplicaAlCurso(r, cursoCtx);
              return (
                <li key={r.id ?? r.tipoEvaluacionCodigo} className="cal-ajustes-inst__regla">
                  <div className="cal-ajustes-inst__regla-head">
                    <Text strong>{r.tipoEvaluacionNombre}</Text>
                    <Tag color={aplica ? 'success' : 'default'}>
                      {aplica ? 'Aplica a este curso' : 'No aplica a este curso'}
                    </Tag>
                  </div>
                  <Text type="secondary" className="cal-ajustes-inst__regla-meta">
                    Ponderación {r.ponderacion}% ·{' '}
                    {etiquetaAlcanceEvaluacionFinal(r.alcance)} —{' '}
                    {describeAlcanceRegla(r)}
                  </Text>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="cal-ajustes-inst__bloque">
        <h4 className="cal-ajustes-inst__bloque-titulo">Asistencia y aprobación</h4>
        <Fila label="Asistencia (default)" value={etiquetaAsistencia(pad.politica)} />
        <Fila
          label="Nota mínima de aprobación"
          value={String(institucional.notaMinimaAprobacion ?? 61)}
        />
      </div>
    </section>
  );
};

export default AjustesCursoInstitucionalPanel;
