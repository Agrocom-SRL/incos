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
 */

import { Tooltip } from 'antd';
import StatusPill from '@atoms/StatusPill';
import { buildFullName } from '@application/utils/formatters';
import { formatBs } from '@finanzas/reportes/config/cuentasPorCobrarColumns';

/**
 * @returns {Array} Columnas de AntD Table (grano estudiante).
 */
export const createBecasEstudianteColumns = () => [
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
  {
    title: '% Beca',
    key: 'becaPorcentaje',
    width: 84,
    className: 'fin-num--center',
    render: (_, record) => `${record.becaPorcentaje}%`,
  },
  {
    title: 'Descuento (Bs)',
    key: 'montoDescuento',
    width: 130,
    className: 'fin-num',
    render: (_, record) => `${formatBs(record.montoDescuento)} Bs`,
  },
  {
    title: 'Monto base (Bs)',
    key: 'montoBase',
    width: 130,
    className: 'fin-num',
    render: (_, record) => `${formatBs(record.montoBase)} Bs`,
  },
];

export default createBecasEstudianteColumns;
