/**
 * Molécula: resumen compacto del curso elegido (costos/cupo/fechas/horarios),
 * pasos "Grupo y requisitos" y "Pago inicial" de Inscribir participante (CAP).
 *
 * Reusa `InfoLinesCell` (mismo lenguaje icono+texto que ya usa la tarjeta del
 * paso "Curso") en vez de las cajas de ancho fijo de `fin-pago-reg-resumen`
 * (pagos-registrar.css): el detalle de horarios es de longitud variable
 * (varios bloques día/hora) y no cabe bien en una caja homogénea junto a
 * valores cortos como el costo — se ve descuadrado.
 *
 * Recibe el curso ya mapeado; no llama hooks.
 */

import { CalendarOutlined, ClockCircleOutlined, DollarOutlined, TeamOutlined } from '@ant-design/icons';
import { InfoLinesCell } from '@atoms';
import CostoCursoLabel from '@capacitacion/components/atoms/CostoCursoLabel';
import CursoGratuitoPill from '@capacitacion/components/atoms/CursoGratuitoPill';
import '../../styles/inscribir-participante.css';

const CursoCapacitacionResumen = ({ curso }) => {
  if (!curso) return null;

  return (
    <div className="curso-cap-resumen">
      <div className="curso-cap-resumen__title">{curso.titulo}</div>
      <InfoLinesCell
        lines={[
          curso.esGratuito ? { icon: <DollarOutlined />, label: <CursoGratuitoPill /> } : null,
          curso.tieneCosto
            ? {
                icon: <DollarOutlined />,
                label: (
                  <>
                    Curso: <CostoCursoLabel costo={curso.costo} />
                  </>
                ),
              }
            : null,
          curso.cobraMatricula
            ? {
                icon: <DollarOutlined />,
                label: (
                  <>
                    Matrícula: <CostoCursoLabel costo={curso.costoMatricula} />
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
          { icon: <ClockCircleOutlined />, label: curso.horariosDetalle || 'Grupos por definir' },
        ].filter(Boolean)}
      />
    </div>
  );
};

export default CursoCapacitacionResumen;
