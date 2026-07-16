/**
 * Columnas del listado de pagos de aporte (módulo Finanzas).
 *
 * Lenguaje visual de CarrerasList / LicenciasListPage: numeración + IdentidadCelda +
 * celdas multi-línea + StatusPill. El ESTADO del pago (Sin pagos / Parcial /
 * Cancelado) NO tiene columna propia: vive bajo el nombre del estudiante
 * (PagoEstudianteCell) y se DERIVA en el front (no del `estado` crudo del backend).
 *
 * Set de columnas: # · Estudiante · Pagado · Descuento · Saldo · Acciones.
 *
 * Ordenamiento SERVER-SIDE: cada columna ordenable declara `sortField` = campo de
 * la vista (contrato con backend). La tabla notifica el cambio de sorter al
 * provider, que recarga el dataset completo ordenado (no se ordena en cliente).
 *   Estudiante → estudiante_apellido_paterno
 *   Pagado     → total_pagado
 *   Descuento  → beca_porcentaje
 *   Saldo      → saldo_pendiente
 *
 * El nombre del estudiante ya viene del mapper en orden APELLIDO_PATERNO
 * APELLIDO_MATERNO NOMBRES (vía buildFullName) — no se reordena aquí.
 *
 * Acciones de fila (TableActions): ver (→ ficha), editar (→ ficha en modo edición).
 * Permisos SOLO `finanzas.pago.*` (NO el legacy `matricula.pago.aporte.*`).
 */

import {
  CalendarOutlined,
  DollarOutlined,
  IdcardOutlined,
  NumberOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { StatusPill } from '@atoms';
import { TableActions } from '@molecules';
import PagoEstudianteCell from '@finanzas/pagos/components/atoms/PagoEstudianteCell';
import PagoPagadoCell from '@finanzas/pagos/components/atoms/PagoPagadoCell';
import PagoDescuentoCell from '@finanzas/pagos/components/atoms/PagoDescuentoCell';
import PagoSaldoCell from '@finanzas/pagos/components/atoms/PagoSaldoCell';
import { FINANZAS_PERMISOS } from '@application-finanzas/utils/finanzasPermisos';
import {
  derivarEstadoPago,
  getDescuentoPillClass,
  getSaldoPillClass,
} from '@application-finanzas/utils/pagosPills';
import { pagoDetallePath, PAGOS_LIST_PATH } from '@application-finanzas/config/paths';

/** Longitud máxima del nombre de beca en el subtexto del pill de descuento. */
const BECA_NOMBRE_MAX = 50;

/** Formatea un monto en bolivianos (Bs 1.234,50). */
const formatBolivianos = (value) => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return `Bs ${safe.toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const getGestionLabel = (record) => {
  const { nombre, anio } = record.gestion || {};
  return nombre || (anio != null ? String(anio) : null);
};

/** Trunca un texto a `max` caracteres con ellipsis (sin cortar a media palabra fea). */
const truncar = (text, max) => {
  const value = String(text ?? '').trim();
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
};

/** ¿El registro tiene beca con descuento efectivo? */
const tieneBeca = (record) =>
  (Number(record.becaPorcentaje) || 0) > 0 || (Number(record.descuentoBeca) || 0) > 0;

export const createPagosTableColumns = ({ navigate, listNavState, refetch }) => {
  return [
    {
      title: '#',
      key: 'nro',
      width: 56,
      align: 'center',
      render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
    },
    {
      title: 'Estudiante',
      key: 'estudiante',
      ellipsis: true,
      render: (_, record) => (
        <PagoEstudianteCell
          codigo={record.estudiante?.codigoEstudiante}
          nombre={record.estudiante?.nombreCompleto || 'Sin nombre'}
          estadoKey={derivarEstadoPago(record)}
        />
      ),
      sorter: true,
      sortField: 'estudiante_apellido_paterno',
    },
    {
      title: 'Pagado',
      key: 'totalPagado',
      width: 200,
      render: (_, record) => (
        <PagoPagadoCell
          total={formatBolivianos(record.totalPagado)}
          cantidadPagos={Number(record.cantidadPagos) || 0}
          gestionLabel={getGestionLabel(record)}
        />
      ),
      sorter: true,
      sortField: 'total_pagado',
    },
    {
      title: 'Descuento',
      key: 'descuento',
      width: 220,
      render: (_, record) => {
        if (!tieneBeca(record)) {
          return <StatusPill label="Sin beca" className="pago-pill pago-pill--neutro" />;
        }
        const nombre = record.becaNombre ? truncar(record.becaNombre, BECA_NOMBRE_MAX) : null;
        return (
          <PagoDescuentoCell
            porcentaje={record.becaPorcentaje}
            montoLabel={formatBolivianos(record.descuentoBeca)}
            nombre={nombre}
            nombreCompleto={record.becaNombre}
            pillClass={getDescuentoPillClass(record.becaPorcentaje)}
          />
        );
      },
      sorter: true,
      sortField: 'beca_porcentaje',
    },
    {
      title: 'Saldo',
      key: 'saldoPendiente',
      width: 220,
      render: (_, record) => {
        const saldo = Number(record.saldoPendiente) || 0;
        const saldado = saldo <= 0;
        return (
          <PagoSaldoCell
            aporte={formatBolivianos(record.montoBase)}
            cubierto={formatBolivianos(
              (Number(record.descuentoBeca) || 0) + (Number(record.totalPagado) || 0),
            )}
            saldoLabel={saldado ? 'Cancelado' : formatBolivianos(saldo)}
            saldoPillClass={getSaldoPillClass(saldo)}
          />
        );
      },
      sorter: true,
      sortField: 'saldo_pendiente',
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 140,
      align: 'right',
      render: (_, record) => {
        const nombreCompleto = record.estudiante?.nombreCompleto || 'Sin nombre';
        const itemName = `el pago de ${nombreCompleto}`;
        const itemDetails = [
          { label: 'Estudiante', value: nombreCompleto, icon: <UserOutlined /> },
          {
            label: 'Código',
            value: record.estudiante?.codigoEstudiante,
            icon: <IdcardOutlined />,
          },
          { label: 'Gestión', value: getGestionLabel(record), icon: <CalendarOutlined /> },
          {
            label: 'Monto a pagar',
            value: formatBolivianos(record.montoObligatorio),
            icon: <DollarOutlined />,
          },
          {
            label: 'Total pagado',
            value: formatBolivianos(record.totalPagado),
            icon: <DollarOutlined />,
          },
          {
            label: 'Pagos',
            value: record.cantidadPagos != null ? String(record.cantidadPagos) : null,
            icon: <NumberOutlined />,
          },
        ].filter((d) => d.value != null && d.value !== '');

        return (
          <TableActions
            record={record}
            navigate={navigate}
            refetch={refetch}
            itemName={itemName}
            itemDetails={itemDetails}
            onView={() => navigate(pagoDetallePath(record.id), { state: listNavState })}
            onEdit={() =>
              navigate(pagoDetallePath(record.id), {
                state: { ...listNavState, returnListPath: PAGOS_LIST_PATH, modo: 'editar' },
              })
            }
            editTitle="Editar pago"
            permisos={{
              ver: { codigo: FINANZAS_PERMISOS.pagoVer, accion: 'DETALLE' },
              editar: { codigo: FINANZAS_PERMISOS.pagoEditar, accion: 'EDITAR' },
              eliminar: { codigo: FINANZAS_PERMISOS.pagoEditar, accion: 'ELIMINAR' },
            }}
          />
        );
      },
    },
  ];
};
