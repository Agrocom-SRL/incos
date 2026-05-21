/**
 * Resumen de la política institucional vigente (referencia antes del override del curso).
 */

import { Alert, Typography } from 'antd';
import {
  CalendarOutlined,
  CheckSquareOutlined,
  FlagOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import {
  describeAlcanceRegla,
  etiquetaAlcanceEvaluacionFinal,
} from '@application-academico/calificaciones/utils/evaluacionesFinalesReglas.js';
import { reglaAplicaAlCurso } from '@application-academico/calificaciones/utils/reglaAplicaAlCurso.js';
import { POLITICAS_ASISTENCIA } from '@application-academico/calificaciones/utils/politicasAsistencia.js';
import EstadoEvaluacionChip from './ajustes/EstadoEvaluacionChip.jsx';
import SeccionAjustes from './ajustes/SeccionAjustes.jsx';

const { Text, Paragraph } = Typography;

const etiquetaAsistencia = (codigo) =>
  POLITICAS_ASISTENCIA.find((p) => p.value === codigo)?.label ?? codigo ?? '—';

const FilaKV = ({ label, value, children }) => (
  <div className="cal-ajustes-inst__fila">
    <span className="cal-ajustes-inst__label">{label}</span>
    <div className="cal-ajustes-inst__valor-wrap">
      {children ?? <span className="cal-ajustes-inst__valor">{value}</span>}
    </div>
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

      <div className="cal-ajustes-inst__zona">
        <SeccionAjustes
          icon={PieChartOutlined}
          titulo="Ponderación teórico / práctico"
          className="cal-ajustes-inst__bloque"
        >
          <FilaKV
            label="Institución"
            value={`${institucional.cuotaTeorico ?? 30}% teórico · ${institucional.cuotaPractico ?? 70}% práctico`}
          />
        </SeccionAjustes>

        <SeccionAjustes
          icon={CalendarOutlined}
          titulo="Ponderación por bimestre (nota anual)"
          className="cal-ajustes-inst__bloque"
        >
          <FilaKV label="Distribución">
            <div className="cal-ajustes-inst__bimestre-chips">
              {pesosBim.map((p, i) => (
                <span key={`b${i + 1}`} className="cal-ajustes-inst__bimestre-chip">
                  B{i + 1}: {p}%
                </span>
              ))}
            </div>
          </FilaKV>
        </SeccionAjustes>

        <SeccionAjustes
          icon={FlagOutlined}
          titulo="Evaluaciones finales habilitadas"
          className="cal-ajustes-inst__bloque"
        >
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
                    <div className="cal-ajustes-inst__regla-line1">
                      <span className="cal-ajustes-inst__regla-nombre">{r.tipoEvaluacionNombre}</span>
                      <EstadoEvaluacionChip aplica={aplica} />
                    </div>
                    <p className="cal-ajustes-inst__regla-meta">
                      Ponderación {r.ponderacion}% · {etiquetaAlcanceEvaluacionFinal(r.alcance)} —{' '}
                      {describeAlcanceRegla(r)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </SeccionAjustes>

        <SeccionAjustes
          icon={CheckSquareOutlined}
          titulo="Asistencia y aprobación"
          className="cal-ajustes-inst__bloque"
        >
          <FilaKV label="Asistencia (default)" value={etiquetaAsistencia(pad.politica)} />
          <FilaKV
            label="Nota mínima de aprobación"
            value={String(institucional.notaMinimaAprobacion ?? 61)}
          />
        </SeccionAjustes>
      </div>
    </section>
  );
};

export default AjustesCursoInstitucionalPanel;
