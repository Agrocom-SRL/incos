/**
 * Columnas del listado de inscripciones de capacitación (módulo CAP).
 *
 * Lenguaje visual de PagosList: numeración + IdentidadCelda (CI + nombre en
 * orden canónico, ya resuelto por el mapper vía buildFullName) + InfoLinesCell
 * + StatusPill de estado de la inscripción y de estado de pago (resolvers
 * únicos del módulo, ver `capacitacionPills.js`). Montos Bs SIN decimales
 * (formatBs). Orden en cliente (modo loadAll del provider).
 *
 * La columna "Saldo" suma un tag "Vencido" cuando `record.pagoVencido` es
 * true (derivado en el mapper del frontend: `estadoPago === 'PARCIAL'` Y la
 * fecha de compromiso ya pasó — NUNCA se confía solo en `compromisoEstado`
 * del backend, que puede quedar en INCUMPLIDO para siempre aunque la deuda ya
 * se haya saldado). El filtro "Solo con pago vencido" del listado
 * (`useInscripcionesCapacitacionListPage`) usa el mismo flag.
 *
 * Curso con costo EXTERNO (entidad certificadora): "Pagado" y "Saldo" cuentan
 * solo la matrícula (lo que cobra el instituto) y el curso se rotula «Pagado a
 * la entidad» / «Pendiente de acreditar con depósito» (columna Pagado). La
 * acción «Editar» (capacitacion.inscripcion EDITAR) abre la ficha con el modal
 * de edición ya desplegado (`state.abrirEditar`).
 */

import { Flex } from 'antd';
import {
  BookOutlined,
  CalendarOutlined,
  DollarOutlined,
  FilePdfOutlined,
  NumberOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { StatusPill, IdentidadCelda, InfoLinesCell } from '@atoms';
import { TableActions } from '@molecules';
import { formatBs } from '@application/utils/formatters';
import { CAPACITACION_PERMISOS } from '@application-capacitacion/utils/capacitacionPermisos';
import {
  formatEstadoCurso,
  formatEstadoCursoExterno,
  formatEstadoInscripcionCap,
  formatEstadoPagoCap,
  getEstadoCursoExternoPillClass,
  getEstadoInscripcionCapPillClass,
  getEstadoPagoCapPillClass,
  getSaldoCapPillClass,
  ESTADOS_INSCRIPCION_CAP_VIGENTES,
} from '@application-capacitacion/utils/capacitacionPills';
import {
  inscripcionCapDetallePath,
  inscripcionCapRegistrarPagoPath,
} from '@application-capacitacion/config/paths';
import CostoCursoLabel from '@capacitacion/components/atoms/CostoCursoLabel';

export const createInscripcionesCapTableColumns = ({
  navigate,
  listNavState,
  refetch,
  deleteFn,
  onDescargarFormulario,
}) => {
  return [
    {
      title: '#',
      key: 'nro',
      width: 56,
      align: 'center',
      render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
    },
    {
      title: 'Participante',
      key: 'participante',
      width: 260,
      render: (_, record) => (
        <div className="cfg-identidad-clamp2" title={record.participanteNombreCompleto || undefined}>
          <IdentidadCelda
            codigo={record.participanteCiCompleto || undefined}
            nombre={(record.participanteNombreCompleto || 'Sin nombre').toUpperCase()}
          />
        </div>
      ),
      sorter: true,
      sortCompare: (a, b) =>
        (a.participanteNombreCompleto || '').localeCompare(
          b.participanteNombreCompleto || '',
          'es',
          { sensitivity: 'base' },
        ),
    },
    {
      title: 'Curso',
      key: 'curso',
      width: 240,
      render: (_, record) => (
        <InfoLinesCell
          lines={[
            { icon: <BookOutlined />, label: record.capacitacionTitulo },
            record.grupoNombre ? { icon: <TeamOutlined />, label: record.grupoNombre } : null,
            record.capacitacionFechasLabel
              ? { icon: <CalendarOutlined />, label: record.capacitacionFechasLabel }
              : null,
            record.fechaInscripcionLabel
              ? { label: `Inscrito el ${record.fechaInscripcionLabel}` }
              : null,
          ].filter(Boolean)}
        />
      ),
      sorter: true,
      sortCompare: (a, b) =>
        (a.capacitacionTitulo || '').localeCompare(b.capacitacionTitulo || '', 'es', {
          sensitivity: 'base',
        }),
    },
    {
      title: 'Estado',
      key: 'estado',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <StatusPill
          label={formatEstadoInscripcionCap(record.estado)}
          className={getEstadoInscripcionCapPillClass(record.estado)}
        />
      ),
      sorter: true,
      sortCompare: (a, b) => (a.estado || '').localeCompare(b.estado || ''),
    },
    {
      title: 'Pagado',
      key: 'pagado',
      width: 190,
      render: (_, record) => (
        <InfoLinesCell
          lines={[
            {
              icon: <DollarOutlined />,
              label:
                record.montoTotal <= 0 ? (
                  <CostoCursoLabel costo={0} />
                ) : record.montoCobrable <= 0 ? (
                  'Sin cobro en el instituto'
                ) : (
                  `Bs ${formatBs(record.totalPagado)} de Bs ${formatBs(record.montoCobrable)}`
                ),
            },
            record.pagoCursoExterno && record.montoObligatorio > 0
              ? {
                  icon: <BookOutlined />,
                  label: (
                    <>
                      Curso:{' '}
                      <StatusPill
                        label={formatEstadoCursoExterno(record.estadoPagoCurso)}
                        className={getEstadoCursoExternoPillClass(record.estadoPagoCurso)}
                      />
                    </>
                  ),
                }
              : null,
            {
              icon: <NumberOutlined />,
              label: `${record.pagosCount} ${record.pagosCount === 1 ? 'pago' : 'pagos'}`,
            },
          ].filter(Boolean)}
        />
      ),
      sorter: true,
      sortCompare: (a, b) => (Number(a.totalPagado) || 0) - (Number(b.totalPagado) || 0),
    },
    {
      title: 'Saldo',
      key: 'saldo',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Flex vertical gap={2} align="center">
          <StatusPill
            label={record.saldoTotal > 0 ? `Bs ${formatBs(record.saldoTotal)}` : 'Saldado'}
            className={getSaldoCapPillClass(record.saldoTotal)}
          />
          {record.pagoVencido ? (
            <StatusPill label="Vencido" className="cfg-materia-pill cfg-materia-pill--danger" />
          ) : null}
        </Flex>
      ),
      sorter: true,
      sortCompare: (a, b) => (Number(a.saldoTotal) || 0) - (Number(b.saldoTotal) || 0),
    },
    {
      title: 'Estado de pago',
      key: 'estadoPago',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <StatusPill
          label={formatEstadoPagoCap(record.estadoPago)}
          className={getEstadoPagoCapPillClass(record.estadoPago)}
        />
      ),
      sorter: true,
      sortCompare: (a, b) => (a.estadoPago || '').localeCompare(b.estadoPago || ''),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 190,
      align: 'right',
      render: (_, record) => {
        const itemName = `la inscripción de ${record.participanteNombreCompleto}`;
        const itemDetails = [
          {
            label: 'Participante',
            value: record.participanteNombreCompleto,
            icon: <UserOutlined />,
          },
          { label: 'Curso', value: record.capacitacionTitulo, icon: <BookOutlined /> },
          {
            label: 'Estado del curso',
            value: formatEstadoCurso(record.capacitacionEstado),
          },
          {
            label: 'Total pagado',
            value: `Bs ${formatBs(record.totalPagado)}`,
            icon: <DollarOutlined />,
          },
        ].filter((d) => d.value != null && d.value !== '');

        const puedeIrAPagar =
          Number(record.saldoTotal) > 0 &&
          ESTADOS_INSCRIPCION_CAP_VIGENTES.includes(record.estado);
        const extraActions = [
          {
            key: 'formulario-pdf',
            icon: <FilePdfOutlined />,
            variant: 'view',
            tooltip: 'Descargar formulario de inscripción (PDF)',
            permiso: CAPACITACION_PERMISOS.inscripcion,
            accion: 'DETALLE',
            onClick: () => onDescargarFormulario?.(record.id),
          },
          ...(puedeIrAPagar
          ? [
              {
                key: 'pagar',
                icon: <DollarOutlined />,
                variant: 'view',
                tooltip: 'Registrar pago',
                permiso: CAPACITACION_PERMISOS.pago,
                accion: 'CREAR',
                onClick: () =>
                  navigate(inscripcionCapRegistrarPagoPath(record.id), { state: listNavState }),
              },
            ]
          : []),
        ];

        return (
          <TableActions
            record={record}
            navigate={navigate}
            refetch={refetch}
            deleteFn={deleteFn}
            itemName={itemName}
            itemDetails={itemDetails}
            onView={() =>
              navigate(inscripcionCapDetallePath(record.id), { state: listNavState })
            }
            onEdit={() =>
              navigate(inscripcionCapDetallePath(record.id), {
                state: { ...listNavState, abrirEditar: true },
              })
            }
            editTitle="Editar inscripción"
            extraActions={extraActions}
            permisos={{
              ver: { codigo: CAPACITACION_PERMISOS.inscripcion, accion: 'DETALLE' },
              editar: { codigo: CAPACITACION_PERMISOS.inscripcion, accion: 'EDITAR' },
              eliminar: { codigo: CAPACITACION_PERMISOS.inscripcion, accion: 'ELIMINAR' },
            }}
          />
        );
      },
    },
  ];
};
