/**
 * Columnas de ESTUDIANTE (grano individual) para la sección por carrera del
 * reporte de becas (`BecasCarreraSection`). Réplica del kit `fin-planilla`
 * (cabecera verde, columnas numéricas `fin-num`), mismo espíritu que
 * `createCuentasPorCobrarColumns`: una tabla plana por carrera, sin anidar
 * tablas dentro de celdas.
 *
 * El Nº y las filas de grupo/total (banda de paralelo, banda de totales de
 * carrera) los arma `BecasCarreraSection` envolviendo estas columnas; aquí
 * solo se define el render por defecto para filas de estudiante.
 *
 * En vez de una única columna "% Beca" + "Descuento (Bs)", se abre UNA
 * columna POR TRAMO (25%/50%/75%/100%, derivados de `porcentajes`, sin
 * hardcodear): la celda del tramo que corresponde al estudiante muestra su
 * descuento en Bs; las demás quedan con un guion. Así la matriz deja ver de
 * un vistazo cuántos estudiantes hay (y cuánto Bs) por tramo.
 */

import { Tooltip } from 'antd';
import StatusPill from '@atoms/StatusPill';
import { buildFullName } from '@application/utils/formatters';
import { formatBs } from '@finanzas/reportes/config/cuentasPorCobrarColumns';
import { becaPorcentajeKey } from '@application-finanzas/mappers/becasReporteMapper';

/**
 * @param {number[]} [porcentajes] - tramos de beca presentes en la gestión (p. ej. [25,50,75,100]).
 * @returns {Array} Columnas de AntD Table (grano estudiante).
 */
export const createBecasEstudianteColumns = (porcentajes = []) => [
  {
    title: 'Nº',
    key: 'nro',
    width: 44,
    align: 'center',
    className: 'fin-num--center',
  },
  {
    title: 'Estudiante',
    key: 'estudiante',
    width: 260,
    ellipsis: true,
    render: (_, record) =>
      buildFullName(record.nombres, record.apellidoPaterno, record.apellidoMaterno, 'Sin nombre'),
  },
  {
    title: 'CI',
    key: 'ci',
    width: 100,
    className: 'fin-num--center',
    render: (_, record) => record.ci || '—',
  },
  {
    title: 'Tipo de beca',
    key: 'beca',
    width: 200,
    ellipsis: true,
    render: (_, record) => {
      const label = record.becaNombre || 'Con beca';
      return (
        <Tooltip title={label}>
          <StatusPill label={label} className="cobranza-pill cobranza-pill--beca" />
        </Tooltip>
      );
    },
  },
  ...porcentajes.map((porcentaje) => ({
    title: `${porcentaje}%`,
    key: becaPorcentajeKey(porcentaje),
    width: 96,
    className: 'fin-num',
    render: (_, record) =>
      Number(record.becaPorcentaje) === Number(porcentaje)
        ? `${formatBs(record.montoDescuento)} Bs`
        : '—',
  })),
  {
    // Neto a pagar: base − descuento de la beca (no el monto base bruto), para
    // que se vea de un vistazo cuánto le queda al estudiante tras el %.
    title: 'Aporte base (Bs)',
    key: 'montoBase',
    width: 130,
    className: 'fin-num',
    render: (_, record) =>
      `${formatBs((record.montoBase || 0) - (record.montoDescuento || 0))} Bs`,
  },
];

export default createBecasEstudianteColumns;
