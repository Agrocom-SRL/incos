/**
 * Columnas de la tabla de planes de estudio (tab Académico).
 *
 * Una fila por carrera con su plan vigente embebido (`record.planVigente`,
 * ver `usePlanesTabPanel`). Cuando una carrera tiene además otros planes no
 * vigentes (históricos con estudiantes en curso, versiones clonadas sin
 * publicar, o simplemente dados de baja), `usePlanesTabPanel` agrega una
 * fila EXTRA por cada uno con `planVigente` apuntando a ese plan — esta
 * columna no necesita saberlo: como `plan.vigente` es `false` ahí,
 * `getPlanVigenciaLabel`/`getPlanVigenciaPillClass` ya lo etiquetan
 * "No vigente" sin lógica adicional aquí. Mismo lenguaje visual que
 * `carrerasTableColumns.jsx` / `materiasTableColumns.jsx`: identidad +
 * celdas de negocio + acciones.
 */

import { NumberOutlined, ReadOutlined } from '@ant-design/icons';
import {
  planDetallePath,
  planEditarPath,
} from '@application-configuracion/academico/config/paths';
import { PLAN_ESTUDIO_PERMISO } from '@application-configuracion/academico/config/planEstudioPermisos';
import {
  getPlanVigenciaLabel,
  getPlanVigenciaPillClass,
} from '@application-configuracion/academico/config/planVigenciaPill';
import { formatResolucionLabel } from '@application-configuracion/academico/utils/planDocumentoTheme';
import EstadoTogglePill from '@atoms/EstadoTogglePill';
import IdentidadCelda from '@atoms/IdentidadCelda';
import InfoLinesCell from '@atoms/InfoLinesCell';
import StatusPill from '@atoms/StatusPill';
import CarreraMetricasCell from '@configuracion/academico/components/atoms/CarreraMetricasCell';
import CarreraTituloDotCell from '@configuracion/academico/components/atoms/CarreraTituloDotCell';
import { TableActions } from '@molecules';

/**
 * `rowClassName` para `TableListView` — atenúa la fila cuando el plan de esa
 * fila está `activo=false` (gemelo de `catalogoEstadoRowClassName`, pero
 * mirando `record.planVigente.activo` en vez de `record.activo`: aquí
 * `record` es la fila carrera+plan, no el plan mismo).
 */
export const planesRowClassName = (record) => {
  const plan = record.planVigente;
  if (!plan) return '';
  const activo = plan.activo !== false && plan.activo !== 0;
  return activo ? '' : 'cfg-table-row--inactiva';
};

export const createPlanesTableColumns = ({ navigate, listNavState, refetch, onToggleEstado }) => {
  return [
    {
      title: '#',
      key: 'nro',
      width: 56,
      align: 'center',
      render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
    },
    {
      title: 'Carrera',
      dataIndex: 'nombre',
      ellipsis: true,
      render: (_nombre, record) => (
        <IdentidadCelda
          codigo={record.codigo}
          nombre={(record.nombre || 'Sin nombre').toUpperCase()}
          accentColor={record.colorHex}
        />
      ),
      sorter: true,
      sortCompare: (a, b) =>
        (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' }),
    },
    {
      title: 'Plan vigente',
      key: 'planVigente',
      render: (_, record) => {
        const plan = record.planVigente;
        return (
          <InfoLinesCell
            lines={[
              {
                key: 'nombre',
                icon: <ReadOutlined />,
                label: plan?.nombre_plan ? plan.nombre_plan.toUpperCase() : 'Sin plan vigente',
                style: { fontWeight: 700 },
              },
              {
                key: 'rm',
                icon: <NumberOutlined />,
                label: plan?.resolucion_ministerial
                  ? formatResolucionLabel(plan.resolucion_ministerial)
                  : null,
              },
            ]}
          />
        );
      },
      sorter: true,
      sortCompare: (a, b) =>
        (a.planVigente?.nombre_plan || '').localeCompare(b.planVigente?.nombre_plan || '', 'es', {
          sensitivity: 'base',
        }),
    },
    {
      title: 'Vigencia',
      key: 'vigencia',
      align: 'center',
      render: (_, record) => {
        const plan = record.planVigente;
        if (!plan) {
          return <StatusPill label="Sin plan" className="cfg-materia-pill cfg-materia-pill--default" />;
        }
        return (
          <StatusPill
            label={getPlanVigenciaLabel(plan.vigente)}
            className={getPlanVigenciaPillClass(plan.vigente)}
          />
        );
      },
      sorter: true,
      sortCompare: (a, b) => Number(Boolean(a.planVigente?.vigente)) - Number(Boolean(b.planVigente?.vigente)),
    },

    {
      title: 'Carga académica',
      key: 'resumen',
      render: (_, record) => (
        <CarreraMetricasCell
          cantidadMaterias={record.cantidadMaterias ?? 0}
          cantidadPeriodos={record.cantidadPeriodos ?? 0}
        />
      ),
      sorter: true,
      sortCompare: (a, b) => (Number(a.cantidadMaterias) || 0) - (Number(b.cantidadMaterias) || 0),
    },
    {
      title: 'Estado',
      key: 'estado',
      width: 130,
      align: 'center',
      // `cfg-estado-col`: no se atenúa en filas inactivas (conserva la
      // affordance de reactivar), ver `planesRowClassName` arriba.
      className: 'cfg-estado-col',
      // Independiente de "Vigencia": activo/inactivo se administra a mano
      // (no lo mueve "Publicar como vigente"), ver `usePlanesTabPanel`.
      render: (_, record) => {
        const plan = record.planVigente;
        if (!plan) return null;
        return (
          <EstadoTogglePill
            activo={plan.activo !== false && plan.activo !== 0}
            permiso={PLAN_ESTUDIO_PERMISO}
            accion="ACTIVAR"
            onToggle={(nuevoActivo) => onToggleEstado?.(record, nuevoActivo)}
          />
        );
      },
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 140,
      align: 'right',
      render: (_, record) => {
        const plan = record.planVigente;
        const nombreCarrera = (record.nombre || 'Sin nombre').toUpperCase();
        const itemName = `el plan de estudio de ${nombreCarrera}`;

        // Sin plan (ni vigente ni borrador): nada que ver/editar desde el
        // listado (se crea con "Nuevo plan" en la cabecera). TableActions
        // sin viewPath/onEdit no pinta iconos (mismo patrón fail-closed que
        // sin permiso).
        const planActionsProps = plan
          ? {
              viewPath: '/:id',
              onView: () => navigate(planDetallePath(plan.id), { state: listNavState }),
              onEdit: () => navigate(planEditarPath(plan.id), { state: listNavState }),
            }
          : {};

        return (
          <TableActions
            record={record}
            navigate={navigate}
            refetch={refetch}
            itemName={itemName}
            permisos={{
              ver: { codigo: PLAN_ESTUDIO_PERMISO, accion: 'DETALLE' },
              editar: { codigo: PLAN_ESTUDIO_PERMISO, accion: 'EDITAR' },
            }}
            {...planActionsProps}
          />
        );
      },
    },
  ];
};
