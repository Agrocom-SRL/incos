/**
 * Columnas del listado de inscripciones de capacitación (módulo CAP).
 *
 * Lenguaje visual de PagosList: numeración + IdentidadCelda (CI + nombre en
 * orden canónico, ya resuelto por el mapper vía buildFullName) + InfoLinesCell
 * + StatusPill de estado de la inscripción y de estado de pago (resolvers
 * únicos del módulo, ver `capacitacionPills.js`). Montos Bs SIN decimales
 * (formatBs). Orden en cliente (modo loadAll del provider).
 *
 * Columna «Pagado»: Matrícula y Curso, cada uno con su pill. Curso con costo
 * EXTERNO (entidad certificadora): «Depósito pendiente» hasta acreditar el requisito. La
 * acción «Editar» (capacitacion.inscripcion EDITAR) abre la página de edición
 * de la inscripción (`/:id/editar`).
 */

import { Flex } from 'antd';
import {
  BookOutlined,
  CheckSquareOutlined,
  DollarOutlined,
  FilePdfOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { StatusPill, IdentidadCelda, InfoLinesCell } from '@atoms';
import { TableActions } from '@molecules';
import { formatBs } from '@application/utils/formatters';
import { CAPACITACION_PERMISOS } from '@application-capacitacion/utils/capacitacionPermisos';
import {
  formatEstadoCurso,
  formatEstadoInscripcionCap,
  getEstadoCursoExternoPillClass,
  getEstadoInscripcionCapPillClass,
  getSaldoCapPillClass,
  ESTADOS_INSCRIPCION_CAP_VIGENTES,
} from '@application-capacitacion/utils/capacitacionPills';
import {
  inscripcionCapDetallePath,
  inscripcionCapEditarPath,
  inscripcionCapRegistrarPagoPath,
} from '@application-capacitacion/config/paths';
import CostoCursoLabel from '@capacitacion/components/atoms/CostoCursoLabel';

export const createInscripcionesCapTableColumns = ({
  navigate,
  listNavState,
  refetch,
  deleteFn,
  onDescargarFormulario,
  onGestionarRequisitos,
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
      title: 'Pagado',
      key: 'pagado',
      width: 240,
      render: (_, record) => {
        const matriculaPendiente = Number(record.saldoMatricula) > 0;
        // Curso externo: lo acredita el depósito a la entidad; si no, se cobra en el instituto.
        const cursoPendiente = record.pagoCursoExterno
          ? record.estadoPagoCurso !== 'CANCELADO'
          : Number(record.saldoCurso) > 0;
        return (
          <InfoLinesCell
            lines={[
              record.montoMatricula > 0
                ? {
                    icon: <DollarOutlined />,
                    label: (
                      <>
                        Matrícula:{' '}
                        <StatusPill
                          label={matriculaPendiente ? 'Pendiente' : 'Pagado'}
                          className={getSaldoCapPillClass(matriculaPendiente ? 1 : 0)}
                        />
                      </>
                    ),
                  }
                : null,
              record.montoObligatorio > 0
                ? {
                    icon: <BookOutlined />,
                    label: (
                      <>
                        Curso:{' '}
                        <StatusPill
                          label={
                            cursoPendiente
                              ? record.pagoCursoExterno
                                ? 'Depósito pendiente'
                                : 'Pendiente'
                              : 'Pagado'
                          }
                          className={
                            record.pagoCursoExterno
                              ? getEstadoCursoExternoPillClass(record.estadoPagoCurso)
                              : getSaldoCapPillClass(cursoPendiente ? 1 : 0)
                          }
                        />
                      </>
                    ),
                  }
                : null,
              record.montoTotal <= 0
                ? { icon: <DollarOutlined />, label: <CostoCursoLabel costo={0} /> }
                : null,
            ].filter(Boolean)}
          />
        );
      },
      sorter: true,
      sortCompare: (a, b) => (Number(a.totalPagado) || 0) - (Number(b.totalPagado) || 0),
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
          ...(ESTADOS_INSCRIPCION_CAP_VIGENTES.includes(record.estado)
            ? [
                {
                  key: 'requisitos',
                  icon: <CheckSquareOutlined />,
                  variant: 'alternative',
                  tooltip: 'Marcar requisitos entregados',
                  permiso: CAPACITACION_PERMISOS.inscripcion,
                  accion: 'EDITAR',
                  onClick: () => onGestionarRequisitos?.(record.id),
                },
              ]
            : []),
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
            onEdit={() => navigate(inscripcionCapEditarPath(record.id), { state: listNavState })}
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
