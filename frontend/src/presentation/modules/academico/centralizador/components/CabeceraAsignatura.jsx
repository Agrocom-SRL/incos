/**
 * Cabecera de columna de asignatura del centralizador, en 2 bloques separados
 * por un borde blanco:
 *   1) sigla (negrita, grande)
 *   2) nombre de la materia + docente (tenue, '—' si no hay)
 * Tooltip "sigla — nombre — docente" por si el texto se trunca.
 *
 * Compartida por la matriz por bimestre (P3) y el resultado anual (P2).
 */

import { Tooltip } from 'antd';

const CabeceraAsignatura = ({ sigla, nombre, docenteNombre }) => {
  const tooltip = [sigla, nombre, docenteNombre].filter(Boolean).join(' — ');
  return (
    <Tooltip title={tooltip} placement="top">
      <span className="cal-centralizador-grid__asig-head">
        <span className="cal-centralizador-grid__asig-sigla">{sigla ?? nombre}</span>
        <span className="cal-centralizador-grid__asig-detalle">
          <span className="cal-centralizador-grid__asig-nombre">{nombre}</span>
          <span className="cal-centralizador-grid__asig-docente">{docenteNombre ?? '—'}</span>
        </span>
      </span>
    </Tooltip>
  );
};

export default CabeceraAsignatura;
