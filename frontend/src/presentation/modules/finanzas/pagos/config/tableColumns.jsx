/**
 * Columnas del listado de pagos de aporte (módulo Finanzas).
 *
 * Lenguaje visual de CarrerasList / LicenciasListPage: numeración + IdentidadCelda +
 * celdas multi-línea + StatusPill. El ESTADO del pago (PENDIENTE/PARCIAL/CANCELADO)
 * NO tiene columna propia: vive bajo el nombre del estudiante (PagoEstudianteCell,
 * gemelo de LicenciaEstudianteCell). Saldo y avance se muestran con StatusPill.
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
import PagoGestionCell from '@finanzas/pagos/components/atoms/PagoGestionCell';
import PagoMontoCell from '@finanzas/pagos/components/atoms/PagoMontoCell';
import { FINANZAS_PERMISOS } from '@application-finanzas/utils/finanzasPermisos';
import {
  getSaldoPillClass,
  getPorcentajeCubiertoPillClass,
} from '@application-finanzas/utils/pagosPills';
import { pagoDetallePath, PAGOS_LIST_PATH } from '@application-finanzas/config/paths';

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

/** % cubierto del aporte (0–100), derivado de total pagado / monto obligatorio. */
const getPorcentajeCubierto = (record) => {
  const obligatorio = Number(record.montoObligatorio) || 0;
  if (obligatorio <= 0) return 100;
  const pagado = Number(record.totalPagado) || 0;
  return Math.min(Math.round((pagado / obligatorio) * 100), 100);
};

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
      fixed: 'left',
      ellipsis: true,
      render: (_, record) => (
        <PagoEstudianteCell
          codigo={record.estudiante?.codigoEstudiante}
          nombre={record.estudiante?.nombreCompleto || 'Sin nombre'}
          estado={record.estado}
        />
      ),
      sorter: true,
      sortCompare: (a, b) =>
        String(a.estudiante?.nombreCompleto || '').localeCompare(
          String(b.estudiante?.nombreCompleto || ''),
          'es',
          { sensitivity: 'base' },
        ),
    },
    {
      title: 'Gestión',
      key: 'gestion',
      width: 200,
      render: (_, record) => (
        <PagoGestionCell gestionLabel={getGestionLabel(record)} gestionAnio={record.gestion?.anio} />
      ),
      sorter: true,
      sortCompare: (a, b) =>
        String(getGestionLabel(a) || '').localeCompare(String(getGestionLabel(b) || ''), 'es', {
          sensitivity: 'base',
        }),
    },
    {
      title: 'Monto a pagar',
      key: 'montoObligatorio',
      width: 200,
      align: 'right',
      render: (_, record) => (
        <PagoMontoCell
          valor={formatBolivianos(record.montoObligatorio)}
          sub={
            record.descuentoBeca > 0
              ? `Base ${formatBolivianos(record.montoBase)} · Beca -${formatBolivianos(record.descuentoBeca)}`
              : `Base ${formatBolivianos(record.montoBase)}`
          }
        />
      ),
      sorter: true,
      sortCompare: (a, b) => (a.montoObligatorio || 0) - (b.montoObligatorio || 0),
    },
    {
      title: 'Pagado',
      key: 'totalPagado',
      width: 180,
      align: 'right',
      render: (_, record) => {
        const porcentaje = getPorcentajeCubierto(record);
        return (
          <PagoMontoCell
            valor={formatBolivianos(record.totalPagado)}
            sub={
              <StatusPill
                label={`${porcentaje}% cubierto`}
                className={getPorcentajeCubiertoPillClass(porcentaje)}
              />
            }
          />
        );
      },
      sorter: true,
      sortCompare: (a, b) => (a.totalPagado || 0) - (b.totalPagado || 0),
    },
    {
      title: 'Saldo pendiente',
      key: 'saldoPendiente',
      width: 170,
      align: 'right',
      render: (_, record) => {
        const saldo = record.saldoPendiente || 0;
        return (
          <StatusPill label={formatBolivianos(saldo)} className={getSaldoPillClass(saldo)} />
        );
      },
      sorter: true,
      sortCompare: (a, b) => (a.saldoPendiente || 0) - (b.saldoPendiente || 0),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      fixed: 'right',
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
