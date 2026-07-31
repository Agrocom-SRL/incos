/**
 * Columnas del catálogo de empresas de pasantía (módulo TUT).
 *
 * Patrón catálogos de Configuración: IdentidadCelda + InfoLinesCell +
 * columna "Estado" con toggle rápido (`createCatalogoEstadoColumn`,
 * `PATCH /empresas/:empresaId/estado` — empresa·ACTIVAR; inactiva = gris,
 * nunca rojo) + TableActions solo con editar (el permiso empresa no tiene
 * DETALLE ni ELIMINAR en el seed — fail-closed).
 */

import { EnvironmentOutlined, PhoneOutlined } from '@ant-design/icons';
import { StatusPill, IdentidadCelda, InfoLinesCell, TruncatedTextCell } from '@atoms';
import { TableActions } from '@molecules';
import { createCatalogoEstadoColumn } from '@presentation/utils/tableColumns/createSimpleCatalogTableColumns';
import { TUTORIAS_PERMISOS } from '@application-titulacion/utils/titulacionPermisos';
import { formatTipoSocietario } from '@application-titulacion/utils/pasantiasPills';

export const createPasantiasEmpresasTableColumns = ({ onEditar, onToggleEstado }) => {
  return [
    {
      title: '#',
      key: 'nro',
      width: 56,
      align: 'center',
      render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
    },
    {
      title: 'Empresa',
      key: 'empresa',
      width: 300,
      render: (_, record) => (
        <div className="cfg-identidad-clamp2" title={record.nombre || undefined}>
          <IdentidadCelda
            codigo={record.nit ? `NIT ${record.nit}` : undefined}
            nombre={(record.nombre || 'Sin nombre').toUpperCase()}
          />
        </div>
      ),
      sorter: true,
      sortCompare: (a, b) =>
        (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' }),
    },
    {
      title: 'Tipo societario',
      key: 'tipoSocietario',
      width: 140,
      align: 'center',
      render: (_, record) =>
        record.tipoSocietario ? (
          <StatusPill
            label={formatTipoSocietario(record.tipoSocietario)}
            className="cfg-materia-pill cfg-materia-pill--default"
          />
        ) : (
          '—'
        ),
      sorter: true,
      sortCompare: (a, b) => (a.tipoSocietario || '').localeCompare(b.tipoSocietario || ''),
    },
    {
      title: 'Contacto',
      key: 'contacto',
      width: 240,
      render: (_, record) => (
        <InfoLinesCell
          lines={[
            record.direccion ? { icon: <EnvironmentOutlined />, label: record.direccion } : null,
            record.telefono ? { icon: <PhoneOutlined />, label: record.telefono } : null,
          ].filter(Boolean)}
        />
      ),
    },
    {
      title: 'Sector / actividad',
      key: 'sectorActividad',
      width: 220,
      render: (_, record) => <TruncatedTextCell text={record.sectorActividad} />,
      sorter: true,
      sortCompare: (a, b) =>
        (a.sectorActividad || '').localeCompare(b.sectorActividad || '', 'es', {
          sensitivity: 'base',
        }),
    },
    createCatalogoEstadoColumn({
      permisoCodigo: TUTORIAS_PERMISOS.pasantiaEmpresa,
      onToggle: onToggleEstado,
    }),
    {
      title: 'Acciones',
      key: 'acciones',
      width: 90,
      align: 'right',
      render: (_, record) => (
        <TableActions
          record={record}
          onEdit={() => onEditar(record)}
          editTitle="Editar empresa"
          permisos={{
            editar: { codigo: TUTORIAS_PERMISOS.pasantiaEmpresa, accion: 'EDITAR' },
          }}
        />
      ),
    },
  ];
};
