/**
 * Columnas de los avances de un proyecto de grado (módulo TIT · T18-T21).
 *
 * Se usa en DOS pantallas:
 *  - Ficha-hub (tutor/admin): descargar (avance·DETALLE, T21) + revisar →
 *    entrada REVISION_AVANCE en la bitácora (bitacora·CREAR, T15).
 *  - Mi proyecto (estudiante): solo descarga (sin `onRevisar`).
 * Descarga SIEMPRE por endpoint autenticado (blob) — nunca URL /uploads.
 */

import { AuditOutlined, CalendarOutlined, DownloadOutlined, PaperClipOutlined } from '@ant-design/icons';
import { StatusPill, IdentidadCelda, InfoLinesCell } from '@atoms';
import { TableActions } from '@molecules';
import { TITULACION_PERMISOS } from '@application-titulacion/utils/titulacionPermisos';
import {
  formatEstadoAvance,
  getEstadoAvancePillClass,
} from '@application-titulacion/utils/titulacionPills';

export const createAvancesTableColumns = ({
  onDescargar = null,
  descargandoId = null,
  onRevisar = null,
} = {}) => {
  return [
    {
      title: '#',
      key: 'nro',
      width: 56,
      align: 'center',
      render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
    },
    {
      title: 'Avance',
      key: 'avance',
      width: 240,
      render: (_, record) => (
        <IdentidadCelda
          codigo={record.numeroAvance != null ? `Avance ${record.numeroAvance}` : undefined}
          nombre={record.titulo || record.nombreArchivo || 'Avance sin título'}
        />
      ),
      sorter: true,
      sortCompare: (a, b) => (a.numeroAvance || 0) - (b.numeroAvance || 0),
    },
    {
      title: 'Archivo',
      key: 'archivo',
      width: 220,
      render: (_, record) => (
        <InfoLinesCell
          lines={[
            { icon: <PaperClipOutlined />, label: record.nombreArchivo || 'Sin archivo' },
            record.tamanoLabel || record.extension
              ? {
                  label: [record.extension?.toUpperCase(), record.tamanoLabel]
                    .filter(Boolean)
                    .join(' · '),
                }
              : null,
          ].filter(Boolean)}
        />
      ),
    },
    {
      title: 'Subido por',
      key: 'subidoPor',
      width: 200,
      render: (_, record) => (
        <InfoLinesCell
          lines={[
            record.subidoPorNombre ? { label: record.subidoPorNombre } : null,
            {
              icon: <CalendarOutlined />,
              label: record.fechaSubidaLabel || 'Sin fecha',
            },
          ].filter(Boolean)}
        />
      ),
    },
    {
      title: 'Revisión',
      key: 'revision',
      width: 170,
      align: 'center',
      render: (_, record) => (
        <InfoLinesCell
          lines={[
            {
              label: (
                <StatusPill
                  label={formatEstadoAvance(record.estadoRevision)}
                  className={getEstadoAvancePillClass(record.estadoRevision)}
                />
              ),
            },
            record.fechaRevisionLabel ? { label: record.fechaRevisionLabel } : null,
          ].filter(Boolean)}
        />
      ),
    },
    // La columna de acciones solo existe si hay al menos un handler (oculta en proyectos CANCELADOS).
    ...(onDescargar || onRevisar
      ? [
          {
            title: 'Acciones',
            key: 'acciones',
            width: 100,
            align: 'right',
            render: (_, record) => (
              <TableActions
                record={record}
                extraActions={[
                  ...(onDescargar
                    ? [
                        {
                          key: 'descargar',
                          icon: <DownloadOutlined />,
                          variant: 'info',
                          tooltip: 'Descargar archivo',
                          permiso: TITULACION_PERMISOS.avance,
                          accion: 'DETALLE',
                          disabled: descargandoId === record.id,
                          onClick: () => onDescargar(record),
                        },
                      ]
                    : []),
                  ...(onRevisar
                    ? [
                        {
                          key: 'revisar',
                          icon: <AuditOutlined />,
                          variant: 'warning',
                          tooltip: 'Revisar avance (entrada de bitácora)',
                          permiso: TITULACION_PERMISOS.bitacora,
                          accion: 'CREAR',
                          onClick: () => onRevisar(record),
                        },
                      ]
                    : []),
                ]}
              />
            ),
          },
        ]
      : []),
  ];
};
