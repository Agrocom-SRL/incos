/**
 * Columnas del listado de cursos de capacitación (módulo CAP).
 *
 * Lenguaje visual de CarrerasList / PagosList: numeración + IdentidadCelda +
 * celdas multi-línea (InfoLinesCell) + StatusPill + toggle de estado del patrón
 * catálogo (createCatalogoEstadoColumn, inactivo = gris) + TableActions.
 *
 * Montos Bs SIN decimales (formatBs, criterio de Finanzas). Ordenamiento en
 * CLIENTE sobre el dataset completo (modo loadAll del provider): cada columna
 * ordenable declara `sortCompare`.
 */

import {
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  FileExcelOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { StatusPill, IdentidadCelda, InfoLinesCell } from '@atoms';
import { TableActions } from '@molecules';
import { createCatalogoEstadoColumn } from '@presentation/utils/tableColumns/createSimpleCatalogTableColumns';
import { formatBs } from '@application/utils/formatters';
import { CAPACITACION_PERMISOS } from '@application-capacitacion/utils/capacitacionPermisos';
import {
  formatEstadoCurso,
  getEstadoCursoPillClass,
} from '@application-capacitacion/utils/capacitacionPills';
import {
  CURSOS_CAP_LIST_PATH,
  cursoCapDetallePath,
  cursoCapEditarPath,
} from '@application-capacitacion/config/paths';
import CostoCursoLabel from '@capacitacion/components/atoms/CostoCursoLabel';
import CursoGratuitoPill from '@capacitacion/components/atoms/CursoGratuitoPill';

export const createCursosCapacitacionTableColumns = ({
  navigate,
  listNavState,
  refetch,
  onToggleEstado,
  onExportarInscritos,
  exportandoInscritosId,
  deleteFn,
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
      title: 'Curso',
      key: 'curso',
      width: 260,
      render: (_, record) => (
        <div className="cfg-identidad-clamp2" title={record.titulo || undefined}>
          <IdentidadCelda nombre={(record.titulo || 'Sin título').toUpperCase()} />
        </div>
      ),
      sorter: true,
      sortCompare: (a, b) =>
        (a.titulo || '').localeCompare(b.titulo || '', 'es', { sensitivity: 'base' }),
    },
    {
      title: 'Estado',
      key: 'estadoCurso',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <StatusPill
          label={formatEstadoCurso(record.estado)}
          className={getEstadoCursoPillClass(record.estado)}
        />
      ),
      sorter: true,
      sortCompare: (a, b) => (a.estado || '').localeCompare(b.estado || ''),
    },
    {
      title: 'Costos y fechas',
      key: 'costoFechas',
      width: 240,
      render: (_, record) => (
        <InfoLinesCell
          lines={[
            record.esGratuito
              ? { icon: <DollarOutlined />, label: <CursoGratuitoPill /> }
              : null,
            !record.esGratuito && record.tieneCosto
              ? {
                  icon: <DollarOutlined />,
                  label: (
                    <>
                      Curso: <CostoCursoLabel costo={record.costo} />
                    </>
                  ),
                }
              : null,
            !record.esGratuito && record.cobraMatricula
              ? {
                  icon: <DollarOutlined />,
                  label: (
                    <>
                      Matrícula: <CostoCursoLabel costo={record.costoMatricula} />
                    </>
                  ),
                }
              : null,
            record.fechasLabel
              ? { icon: <CalendarOutlined />, label: record.fechasLabel }
              : null,
            record.modalidadLabel ? { label: `Modalidad: ${record.modalidadLabel}` } : null,
          ].filter(Boolean)}
        />
      ),
      sorter: true,
      sortCompare: (a, b) =>
        (Number(a.costo) || 0) + (Number(a.costoMatricula) || 0) -
        ((Number(b.costo) || 0) + (Number(b.costoMatricula) || 0)),
    },
    {
      title: 'Horarios',
      key: 'horarios',
      width: 220,
      render: (_, record) => (
        <InfoLinesCell
          lines={[
            ...record.horariosLineas.map((linea, i) => ({
              key: `bloque-${i}`,
              icon: <ClockCircleOutlined />,
              label: linea,
            })),
          ]}
        />
      ),
    },
    {
      title: 'Cupo',
      key: 'cupo',
      width: 160,
      render: (_, record) => (
        <InfoLinesCell
          lines={[
            {
              icon: <TeamOutlined />,
              label:
                record.cupoMaximo != null
                  ? `${record.inscritosCount} / ${record.cupoMaximo} inscritos`
                  : `${record.inscritosCount} inscritos`,
            },
            record.cupoMaximo != null
              ? { label: `${record.cupoDisponible} disponibles` }
              : null,
          ].filter(Boolean)}
        />
      ),
      sorter: true,
      sortCompare: (a, b) => (Number(a.inscritosCount) || 0) - (Number(b.inscritosCount) || 0),
    },
    // Toggle activo/inactivo (PATCH /:id/estado, acción ACTIVAR — fail-closed sin permiso).
    createCatalogoEstadoColumn({
      permisoCodigo: CAPACITACION_PERMISOS.curso,
      onToggle: onToggleEstado,
    }),
    {
      title: 'Acciones',
      key: 'acciones',
      width: 140,
      align: 'right',
      render: (_, record) => {
        const itemName = `el curso «${record.titulo}»`;
        const itemDetails = [
          { label: 'Curso', value: record.titulo },
          { label: 'Estado', value: formatEstadoCurso(record.estado) },
          {
            label: 'Costo del curso',
            value: record.tieneCosto ? `Bs ${formatBs(record.costo)}` : 'No aplica',
            icon: <DollarOutlined />,
          },
          {
            label: 'Matrícula',
            value: record.cobraMatricula ? `Bs ${formatBs(record.costoMatricula)}` : 'No aplica',
            icon: <DollarOutlined />,
          },
          { label: 'Fechas', value: record.fechasLabel, icon: <CalendarOutlined /> },
          {
            label: 'Inscritos',
            value: record.inscritosCount != null ? String(record.inscritosCount) : null,
            icon: <TeamOutlined />,
          },
        ].filter((d) => d.value != null && d.value !== '');

        const extraActions = onExportarInscritos
          ? [
              {
                key: 'exportarInscritos',
                icon: <FileExcelOutlined />,
                variant: 'view',
                tooltip: 'Exportar lista de inscritos',
                permiso: CAPACITACION_PERMISOS.inscripcion,
                accion: 'EXPORTAR',
                disabled: exportandoInscritosId === record.id,
                onClick: () => onExportarInscritos(record),
              },
            ]
          : [];

        return (
          <TableActions
            record={record}
            navigate={navigate}
            refetch={refetch}
            deleteFn={deleteFn}
            itemName={itemName}
            itemDetails={itemDetails}
            onView={() => navigate(cursoCapDetallePath(record.id), { state: listNavState })}
            onEdit={() =>
              navigate(cursoCapEditarPath(record.id), {
                state: { ...listNavState, returnListPath: CURSOS_CAP_LIST_PATH },
              })
            }
            editTitle="Editar curso"
            extraActions={extraActions}
            permisos={{
              ver: { codigo: CAPACITACION_PERMISOS.curso, accion: 'DETALLE' },
              editar: { codigo: CAPACITACION_PERMISOS.curso, accion: 'EDITAR' },
              eliminar: { codigo: CAPACITACION_PERMISOS.curso, accion: 'ELIMINAR' },
            }}
          />
        );
      },
    },
  ];
};
