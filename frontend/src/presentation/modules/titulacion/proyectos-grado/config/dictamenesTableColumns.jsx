/**
 * Columnas de los dictámenes de un proyecto de grado (módulo TUT · T22-T23).
 *
 * Los dictámenes los GENERA el backend (designación de tutor T10 y
 * transiciones T11); aquí solo lectura + descarga del PDF por endpoint
 * autenticado (proyecto·EXPORTAR, T23).
 */

import { CalendarOutlined, DownloadOutlined, FilePdfOutlined } from '@ant-design/icons';
import { StatusPill, IdentidadCelda, InfoLinesCell } from '@atoms';
import { TableActions } from '@molecules';
import { TUTORIAS_PERMISOS } from '@application-titulacion/utils/titulacionPermisos';
import {
  formatResultadoDictamen,
  formatTipoDictamen,
  getResultadoDictamenPillClass,
} from '@application-titulacion/utils/titulacionPills';

export const createDictamenesTableColumns = ({ onDescargar, descargandoId = null } = {}) => {
  return [
    {
      title: '#',
      key: 'nro',
      width: 56,
      align: 'center',
      render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
    },
    {
      title: 'Dictamen',
      key: 'dictamen',
      width: 260,
      render: (_, record) => (
        <IdentidadCelda
          codigo={record.numeroInforme || undefined}
          nombre={formatTipoDictamen(record.tipo)}
        />
      ),
    },
    {
      title: 'Emisión',
      key: 'emision',
      width: 200,
      render: (_, record) => (
        <InfoLinesCell
          lines={[
            {
              icon: <CalendarOutlined />,
              label: record.fechaEmisionLabel || 'Sin fecha de emisión',
            },
            record.destinatario ? { label: `Para: ${record.destinatario}` } : null,
          ].filter(Boolean)}
        />
      ),
    },
    {
      title: 'Resultado',
      key: 'resultado',
      width: 130,
      align: 'center',
      render: (_, record) =>
        record.resultado ? (
          <StatusPill
            label={formatResultadoDictamen(record.resultado)}
            className={getResultadoDictamenPillClass(record.resultado)}
          />
        ) : (
          '—'
        ),
    },
    {
      title: 'Archivo',
      key: 'archivo',
      width: 200,
      render: (_, record) => (
        <InfoLinesCell
          lines={[
            record.tieneArchivo
              ? { icon: <FilePdfOutlined />, label: record.nombreArchivo || 'Documento PDF' }
              : { label: 'Sin archivo generado' },
          ]}
        />
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 90,
      align: 'right',
      render: (_, record) => (
        <TableActions
          record={record}
          extraActions={[
            {
              key: 'descargar',
              icon: <DownloadOutlined />,
              variant: 'info',
              tooltip: record.tieneArchivo
                ? 'Descargar dictamen (PDF)'
                : 'El dictamen no tiene archivo generado',
              permiso: TUTORIAS_PERMISOS.proyecto,
              accion: 'EXPORTAR',
              disabled: !record.tieneArchivo || descargandoId === record.id,
              onClick: () => onDescargar(record),
            },
          ]}
        />
      ),
    },
  ];
};
