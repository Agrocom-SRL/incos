/**
 * Columnas de los informes de un trámite de pasantía (módulo TUT · P11-P14).
 *
 * El PDF institucional lo GENERA el backend al emitir/editar el informe
 * (P12/P13); aquí edición (informe·EDITAR) y descarga del PDF por endpoint
 * autenticado (pasantia·EXPORTAR, P14). Con `readOnly` (portal del
 * estudiante) se omite la columna de acciones.
 */

import { CalendarOutlined, DownloadOutlined, FilePdfOutlined } from '@ant-design/icons';
import { StatusPill, IdentidadCelda, InfoLinesCell } from '@atoms';
import { TableActions } from '@molecules';
import { TUTORIAS_PERMISOS } from '@application-tutorias/utils/tutoriasPermisos';
import {
  formatResultadoInforme,
  formatTipoInforme,
  getResultadoInformePillClass,
} from '@application-tutorias/utils/pasantiasPills';

export const createInformesPasantiaTableColumns = ({
  onEditar,
  onDescargar,
  descargandoId = null,
  readOnly = false,
} = {}) => {
  const columns = [
    {
      title: '#',
      key: 'nro',
      width: 56,
      align: 'center',
      render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
    },
    {
      title: 'Informe',
      key: 'informe',
      width: 280,
      render: (_, record) => (
        <IdentidadCelda
          codigo={record.numeroMemo || undefined}
          nombre={formatTipoInforme(record.tipo)}
        />
      ),
    },
    {
      title: 'Emisión',
      key: 'emision',
      width: 210,
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
            label={formatResultadoInforme(record.resultado)}
            className={getResultadoInformePillClass(record.resultado)}
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
            record.tienePdf
              ? { icon: <FilePdfOutlined />, label: record.nombreArchivo || 'Documento PDF' }
              : { label: 'Sin archivo generado' },
          ]}
        />
      ),
    },
  ];

  if (readOnly) {
    return columns;
  }

  return [
    ...columns,
    {
      title: 'Acciones',
      key: 'acciones',
      width: 110,
      align: 'right',
      render: (_, record) => (
        <TableActions
          record={record}
          onEdit={() => onEditar(record)}
          editTitle="Editar informe (regenera el PDF)"
          extraActions={[
            {
              key: 'descargar',
              icon: <DownloadOutlined />,
              variant: 'info',
              tooltip: record.tienePdf
                ? 'Descargar informe (PDF)'
                : 'El informe no tiene archivo generado',
              permiso: TUTORIAS_PERMISOS.pasantia,
              accion: 'EXPORTAR',
              disabled: !record.tienePdf || descargandoId === record.id,
              onClick: () => onDescargar(record),
            },
          ]}
          permisos={{
            editar: { codigo: TUTORIAS_PERMISOS.pasantiaInforme, accion: 'EDITAR' },
          }}
        />
      ),
    },
  ];
};
