/**
 * Molécula: resumen compacto del curso elegido (costo/cupo/fechas/horarios),
 * paso "Pago inicial" de Inscribir participante (CAP).
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
import '../../styles/inscribir-participante.css';

const CursoCapacitacionResumen = ({ curso }) => {
  if (!curso) return null;

  return (
    <div className="curso-cap-resumen">
      <div className="curso-cap-resumen__title">{curso.titulo}</div>
      <InfoLinesCell
        lines={[
          { icon: <DollarOutlined />, label: <CostoCursoLabel costo={curso.costo} /> },
          {
            icon: <TeamOutlined />,
            label:
              curso.cupoMaximo != null
                ? `${curso.inscritosCount} / ${curso.cupoMaximo} inscritos`
                : `${curso.inscritosCount} inscritos`,
          },
          curso.fechasLabel ? { icon: <CalendarOutlined />, label: curso.fechasLabel } : null,
          { icon: <ClockCircleOutlined />, label: curso.horariosDetalle || 'Horario por definir' },
        ].filter(Boolean)}
      />
    </div>
  );
};

export default CursoCapacitacionResumen;
