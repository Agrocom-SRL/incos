/**
 * Molécula: franja del curso elegido (título + costos/cupo/fechas/horarios)
 * dentro del resumen de cierre de Inscribir participante (CAP)
 * (`InscripcionCapSeleccionResumen`).
 *
 * Reusa `InfoLinesCell` (mismo lenguaje icono+texto que ya usa la tarjeta del
 * paso "Curso") en vez de cajas de ancho fijo: el detalle de horarios es de
 * longitud variable (varios bloques día/hora) y no cabe bien en una caja
 * homogénea junto a valores cortos como el costo. Estilos de la franja
 * (`.curso-cap-resumen*`): materias-planilla.css, junto a `.insc-resumen*`.
 *
 * `estadoPagoCursoExterno` (curso con entidad certificadora: el costo se deposita a
 * ella) rotula el costo del curso «Pagado a la entidad» / «Pendiente de acreditar
 * con depósito»; `null` en cursos normales.
 *
 * `mostrarHorarios` se apaga cuando el resumen ya detalla los horarios del grupo
 * elegido (evita repetirlos). Recibe el curso ya mapeado; no llama hooks.
 */

import { CalendarOutlined, ClockCircleOutlined, DollarOutlined, TeamOutlined } from '@ant-design/icons';
import { InfoLinesCell } from '@atoms';
import { StatusPill } from '@atoms';
import {
  formatEstadoCursoExterno,
  getEstadoCursoExternoPillClass,
} from '@application-capacitacion/utils/capacitacionPills';
import CostoCursoLabel from '@capacitacion/components/atoms/CostoCursoLabel';
import CursoGratuitoPill from '@capacitacion/components/atoms/CursoGratuitoPill';

const CursoCapacitacionResumen = ({
  curso,
  mostrarHorarios = true,
  mostrarMatricula = true,
  estadoPagoCursoExterno = null,
}) => {
  if (!curso) return null;

  return (
    <div className="curso-cap-resumen">
      <div className="curso-cap-resumen__title">{curso.tituloCompleto}</div>
      <InfoLinesCell
        lines={[
          curso.esGratuito ? { icon: <DollarOutlined />, label: <CursoGratuitoPill /> } : null,
          curso.tieneCosto
            ? {
                icon: <DollarOutlined />,
                label: (
                  <>
                    Curso: <CostoCursoLabel costo={curso.costo} />
                    {estadoPagoCursoExterno ? (
                      <>
                        {' '}
                        <StatusPill
                          label={formatEstadoCursoExterno(estadoPagoCursoExterno)}
                          className={getEstadoCursoExternoPillClass(estadoPagoCursoExterno)}
                        />
                      </>
                    ) : null}
                  </>
                ),
              }
            : null,
          curso.cobraMatricula && mostrarMatricula
            ? {
                icon: <DollarOutlined />,
                label: (
                  <>
                    Matrícula: <CostoCursoLabel costo={curso.matriculaMin} costoMax={curso.matriculaMax} />
                  </>
                ),
              }
            : null,
          {
            icon: <TeamOutlined />,
            label:
              curso.cupoMaximo != null
                ? `${curso.inscritosCount} / ${curso.cupoMaximo} inscritos`
                : `${curso.inscritosCount} inscritos`,
          },
          curso.fechasLabel ? { icon: <CalendarOutlined />, label: curso.fechasLabel } : null,
          mostrarHorarios
            ? { icon: <ClockCircleOutlined />, label: curso.horariosDetalle || 'Grupos por definir' }
            : null,
        ].filter(Boolean)}
      />
    </div>
  );
};

export default CursoCapacitacionResumen;
