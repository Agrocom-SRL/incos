/**
 * Organismo: tablero de seguimiento de tutorías a docentes (TIT, extensión
 * 2026-08-10) — reemplaza `PlanillaAvanceFolioPreview` (planilla "10 en 10"
 * de 3er año). Un bloque `article.tit-planilla-sheet` POR DOCENTE-TUTOR (sin
 * el patrón de folio de 10 en 10: cada docente ya es su propio bloque
 * natural), con su roster de tutoriados y una única línea de firma al pie —
 * réplica en pantalla de la hoja que exporta el backend (una hoja de Excel
 * por docente). Mismas clases de `styles/planilla-avance.css` del bloque
 * anterior (banda de color, meta-row, tabla, línea de firma): el lenguaje
 * visual encaja igual para este dominio.
 *
 * "Tutorías del mes" con `StatusPill` (mismo criterio que "Obs. pendientes"
 * de `ProyectosGradoList`): hace visible de un vistazo que el filtro de mes
 * SÍ está aplicando — el roster no desaparece entre meses (es roster-driven
 * a propósito), pero la pill sí cambia de "sin tutoría este mes" a la cuenta
 * real, en vez de perderse como un simple "0" entre el resto de columnas.
 *
 * Recibe `docentes` ya resuelto y no vacío — el estado vacío/carga/error lo
 * decide la página (mismo criterio que el organismo retirado).
 */

import { StatusPill } from '@atoms';
import '../../styles/planilla-avance.css';

const formatCi = (ci) => ci || '—';

const SeguimientoTutoriaDocentesTablero = ({ docentes = [] }) => (
  <>
    {docentes.map((docente) => (
      <article className="tit-planilla-sheet" key={docente.docenteId}>
        <div className="tit-planilla-sheet__band">{docente.docenteNombre}</div>

        <div className="tit-planilla-sheet__meta">
          <div className="tit-planilla-sheet__meta-col">
            <div className="tit-planilla-sheet__meta-row">
              <span className="tit-planilla-sheet__meta-label">Carrera(s)</span>
              <span className="tit-planilla-sheet__meta-value">
                {docente.carreras.map((c) => c.carreraNombre).filter(Boolean).join(' / ') || '—'}
              </span>
            </div>
          </div>
          <div className="tit-planilla-sheet__meta-col">
            <div className="tit-planilla-sheet__meta-row">
              <span className="tit-planilla-sheet__meta-label">Tutorías del mes</span>
              <span className="tit-planilla-sheet__meta-value">{docente.tutoriasEjecutadasMes}</span>
            </div>
            <div className="tit-planilla-sheet__meta-row">
              <span className="tit-planilla-sheet__meta-label">Tutoriados</span>
              <span className="tit-planilla-sheet__meta-value">{docente.tutoriados.length}</span>
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
                <th>Proyecto</th>
                <th>Tutorías del mes</th>
                <th>% avance</th>
                <th>Última actividad</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {docente.tutoriados.map((tutoriado, idx) => (
                <tr key={tutoriado.estudianteId}>
                  <td>{idx + 1}</td>
                  <td className="tit-planilla-sheet__nomina">{tutoriado.nombreCompleto}</td>
                  <td>{formatCi(tutoriado.ci)}</td>
                  <td className="tit-planilla-sheet__observaciones">
                    {tutoriado.proyectoTitulo || '—'}
                  </td>
                  <td>
                    {tutoriado.tutoriasEjecutadasMes > 0 ? (
                      <StatusPill
                        label={`${tutoriado.tutoriasEjecutadasMes} tutoría${tutoriado.tutoriasEjecutadasMes === 1 ? '' : 's'}`}
                        className="cfg-materia-pill cfg-materia-pill--success"
                      />
                    ) : (
                      <StatusPill
                        label="Sin tutoría este mes"
                        className="cfg-materia-pill cfg-materia-pill--warning"
                      />
                    )}
                  </td>
                  <td>
                    {tutoriado.porcentajeAvance != null ? `${tutoriado.porcentajeAvance}%` : '—'}
                  </td>
                  <td className="tit-planilla-sheet__observaciones">
                    {tutoriado.ultimaActividad || 'Sin registrar'}
                  </td>
                  <td className="tit-planilla-sheet__observaciones">
                    {tutoriado.ultimaObservacion || 'Sin observaciones'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="tit-planilla-firmas tit-planilla-firmas--single">
          <div className="tit-planilla-firma">
            <div className="tit-planilla-firma__line" />
            <span className="tit-planilla-firma__label">Firma del docente tutor</span>
          </div>
        </div>
      </article>
    ))}
  </>
);

export default SeguimientoTutoriaDocentesTablero;
