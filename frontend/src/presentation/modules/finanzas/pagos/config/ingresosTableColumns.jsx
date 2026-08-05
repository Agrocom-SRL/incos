/**
 * Columnas del listado de Registro de ingresos (módulo Finanzas · FIN-PAG).
 *
 * Listado unificado de transacciones de ingreso (GET /api/v1/ingresos, vista
 * 184 vista_ingresos_listado): 1 fila = 1 pago real, sea aporte académico
 * (pago_cuotas) o pago de capacitación (capacitacion_pagos).
 *
 * Set de columnas: # · Fecha · Persona · Concepto · Monto · Método de pago ·
 * N° recibo · Acciones. Mismo GRANO transaccional que `cuotasTableColumns.jsx`
 * (ficha de un pago), con el lenguaje visual "rico" del listado legacy de
 * pagos (`pagos/config/tableColumns.jsx`): pills `cfg-materia-pill` para los
 * valores con jerarquía (monto, método) y texto plano para los datos de
 * referencia (fecha, concepto, N° recibo).
 *
 * Ordenamiento SERVER-SIDE: cada columna ordenable declara `sortField` = una
 * de las columnas permitidas por el backend (contrato): fecha_pago, monto,
 * numero_recibo, persona_apellido_paterno, persona_codigo, concepto, origen,
 * id_local. La tabla notifica el cambio de sorter al provider, que recarga el
 * dataset completo ordenado (no se ordena en cliente).
 *
 * El nombre de la persona ya viene del backend en orden APELLIDO_PATERNO
 * APELLIDO_MATERNO NOMBRES (`personaNombreCompleto`) — no se reordena aquí.
 *
 * Acciones de fila (TableActions, solo `ver`): navega a la ficha existente
 * según el origen — `/finanzas/pagos/:id` (cabecera de aporte) si
 * origen === 'APORTE', o a la ficha de inscripción de capacitación si
 * origen === 'CAPACITACION'. Permiso `finanzas.pago.ver` acción DETALLE
 * (fail-closed: sin permiso, TableActions no renderiza nada).
 */

import { TableActions } from '@molecules';
import { StatusPill } from '@atoms';
import IngresoPersonaCell from '@finanzas/pagos/components/atoms/IngresoPersonaCell';
import { FINANZAS_PERMISOS } from '@application-finanzas/utils/finanzasPermisos';
import { pagoDetallePath } from '@application-finanzas/config/paths';
import { inscripcionCapDetallePath } from '@application-capacitacion/config/paths';
import { formatBs, formatFecha } from '@finanzas/reportes/config/cuentasPorCobrarColumns';

/** Ruta de ficha según el origen del ingreso (contrato del backend). */
const resolveFichaPath = (record) => {
  if (record.referenciaId == null) return null;
  return record.origen === 'CAPACITACION'
    ? inscripcionCapDetallePath(record.referenciaId)
    : pagoDetallePath(record.referenciaId);
};

export const createIngresosTableColumns = ({ navigate, listNavState }) => {
  return [
    {
      title: '#',
      key: 'nro',
      width: 56,
      align: 'center',
      render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
    },
    {
      title: 'Fecha',
      key: 'fechaPago',
      width: 112,
      align: 'center',
      render: (_, record) => formatFecha(record.fechaPago),
      sorter: true,
      sortField: 'fecha_pago',
    },
    {
      title: 'Persona',
      key: 'persona',
      ellipsis: true,
      render: (_, record) => (
        <IngresoPersonaCell
          codigo={record.personaCodigo}
          nombre={record.personaNombreCompleto}
          origen={record.origen}
        />
      ),
      sorter: true,
      sortField: 'persona_apellido_paterno',
    },
    {
      title: 'Concepto',
      key: 'concepto',
      ellipsis: true,
      render: (_, record) => record.concepto || '—',
      sorter: true,
      sortField: 'concepto',
    },
    {
      title: 'Monto (Bs)',
      key: 'monto',
      width: 130,
      align: 'right',
      render: (_, record) => (
        <StatusPill label={formatBs(record.monto)} className="cfg-materia-pill cfg-materia-pill--info" />
      ),
      sorter: true,
      sortField: 'monto',
    },
    {
      title: 'Método de pago',
      key: 'metodoPago',
      width: 170,
      render: (_, record) =>
        record.metodoPagoNombre ? (
          <StatusPill label={record.metodoPagoNombre} className="cfg-materia-pill cfg-materia-pill--default" />
        ) : (
          '—'
        ),
    },
    {
      title: 'N° recibo',
      key: 'numeroRecibo',
      width: 140,
      render: (_, record) => record.numeroRecibo || '—',
      sorter: true,
      sortField: 'numero_recibo',
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 90,
      align: 'right',
      render: (_, record) => {
        const fichaPath = resolveFichaPath(record);
        if (!fichaPath) return null;
        return (
          <TableActions
            record={record}
            navigate={navigate}
            itemName={`el ingreso de ${record.personaNombreCompleto || 'esta persona'}`}
            onView={() => navigate(fichaPath, { state: listNavState })}
            permisos={{
              ver: { codigo: FINANZAS_PERMISOS.pagoVer, accion: 'DETALLE' },
            }}
          />
        );
      },
    },
  ];
};

export default createIngresosTableColumns;
