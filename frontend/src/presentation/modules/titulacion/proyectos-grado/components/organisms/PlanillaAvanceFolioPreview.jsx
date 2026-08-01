/**
 * Organismo: preview en pantalla de la planilla de avance de tutorías "10 en
 * 10" (TIT, Requisito 3 — extensión 2026-07-31).
 *
 * Réplica en pantalla del Excel exportado: un `article.tit-planilla-sheet`
 * por folio de hasta 10 estudiantes (nómina + nº de tutorías del bimestre +
 * % de avance + resultado), y una hoja final de firmas de docentes tutores +
 * cuadro de % sobre el roster. Inspirado en el lenguaje visual del folio del
 * Libro de registro, pero con clases y componente PROPIOS de Titulación
 * (`styles/planilla-avance.css`) — no se reutiliza el organismo de Libros.
 */

import { Empty } from 'antd';
import { StatusPill } from '@atoms';
import {
  formatResultadoTutoria,
  getResultadoTutoriaPillClass,
} from '@application-titulacion/utils/titulacionPills';
import { BIMESTRE_OPTIONS } from '@application-titulacion/proyectos-grado/utils/bimestreOptions';
import '../../styles/planilla-avance.css';

const formatCi = (ci, expedicion) => [ci, expedicion].filter(Boolean).join(' ') || '—';

const nombreBimestre = (numero) =>
  BIMESTRE_OPTIONS.find((b) => b.value === numero)?.label || (numero != null ? `Bimestre ${numero}` : '—');

/** % del roster (evita división por cero). */
const pct = (parte, total) => (total > 0 ? Math.round((parte / total) * 100) : 0);

const PlanillaAvanceFolioPreview = ({ cabecera, folios = [], resumenTutores = [], tally }) => (
  <>
    {folios.map((folio, idx) => (
      <article className="tit-planilla-sheet" key={`folio-${idx + 1}`}>
        <div className="tit-planilla-sheet__band">
          Planilla de avance de tutoría — Folio {idx + 1} de {folios.length}
        </div>

        <div className="tit-planilla-sheet__meta">
          <div className="tit-planilla-sheet__meta-col">
            <div className="tit-planilla-sheet__meta-row">
              <span className="tit-planilla-sheet__meta-label">Carrera</span>
              <span className="tit-planilla-sheet__meta-value">{cabecera?.carreraNombre || '—'}</span>
            </div>
            <div className="tit-planilla-sheet__meta-row">
              <span className="tit-planilla-sheet__meta-label">Nivel</span>
              <span className="tit-planilla-sheet__meta-value">3er año</span>
            </div>
          </div>
          <div className="tit-planilla-sheet__meta-col">
            <div className="tit-planilla-sheet__meta-row">
              <span className="tit-planilla-sheet__meta-label">Gestión</span>
              <span className="tit-planilla-sheet__meta-value">{cabecera?.gestionAnio ?? '—'}</span>
            </div>
            <div className="tit-planilla-sheet__meta-row">
              <span className="tit-planilla-sheet__meta-label">Bimestre</span>
              <span className="tit-planilla-sheet__meta-value">{nombreBimestre(cabecera?.bimestre)}</span>
            </div>
          </div>
        </div>

        <div className="tit-planilla-sheet__table-wrap">
          <table className="tit-planilla-sheet__table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Nómina</th>
                <th>C.I.</th>
                <th>Tutor</th>
                <th>N° tutorías</th>
                <th>% avance</th>
                <th>Observaciones</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {folio.map((fila) => (
                <tr key={fila.estudianteId}>
                  <td>{fila.numeroOrden}</td>
                  <td className="tit-planilla-sheet__nomina">{fila.nombreCompleto}</td>
                  <td>{formatCi(fila.ci, fila.expedicion)}</td>
                  <td>{fila.tutorNombre || 'Sin tutor asignado'}</td>
                  <td>{fila.totalTutoriasBimestre}</td>
                  <td>{fila.porcentajeAvance != null ? `${fila.porcentajeAvance}%` : '—'}</td>
                  <td className="tit-planilla-sheet__observaciones">
                    {fila.ultimaObservacion || 'Sin observaciones'}
                  </td>
                  <td>
                    <StatusPill
                      label={formatResultadoTutoria(fila.resultadoTutoria)}
                      className={getResultadoTutoriaPillClass(fila.resultadoTutoria)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    ))}

    <article className="tit-planilla-sheet">
      <div className="tit-planilla-sheet__band">Firmas de docentes tutores</div>

      {resumenTutores.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No hay docentes tutores en el roster de esta carrera y bimestre."
          style={{ padding: 'var(--spacing-lg)' }}
        />
      ) : (
        <div className="tit-planilla-firmas">
          {resumenTutores.map((tutor) => (
            <div className="tit-planilla-firma" key={tutor}>
              <div className="tit-planilla-firma__line" />
              <span className="tit-planilla-firma__label">{tutor}</span>
            </div>
          ))}
        </div>
      )}

      <div className="tit-planilla-tally">
        <div className="tit-planilla-tally__item">
          <span className="tit-planilla-tally__value">{pct(tally?.aprobados, tally?.total)}%</span>
          <span className="tit-planilla-tally__label">Aprobados ({tally?.aprobados ?? 0})</span>
        </div>
        <div className="tit-planilla-tally__item">
          <span className="tit-planilla-tally__value">{pct(tally?.reprobados, tally?.total)}%</span>
          <span className="tit-planilla-tally__label">Reprobados ({tally?.reprobados ?? 0})</span>
        </div>
        <div className="tit-planilla-tally__item">
          <span className="tit-planilla-tally__value">{pct(tally?.abandonos, tally?.total)}%</span>
          <span className="tit-planilla-tally__label">Abandonos ({tally?.abandonos ?? 0})</span>
        </div>
        <div className="tit-planilla-tally__item">
          <span className="tit-planilla-tally__value">{pct(tally?.enProceso, tally?.total)}%</span>
          <span className="tit-planilla-tally__label">En proceso ({tally?.enProceso ?? 0})</span>
        </div>
      </div>
    </article>
  </>
);

export default PlanillaAvanceFolioPreview;
