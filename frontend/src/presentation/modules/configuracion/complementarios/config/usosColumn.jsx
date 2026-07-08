/**
 * Columna "Usos" compartida por los catálogos complementarios (discapacidades,
 * apoderados, idiomas, estados civiles). Se inserta vía `extraColumns` del factory
 * `createSimpleCatalogTableColumns` (queda entre descripción/identidad y acciones).
 *
 * Consume los conteos del backend: `cantidadEstudiantes`, `cantidadDocentes`,
 * `cantidadPersonal` (números, 0 por defecto). Orden numérico por estudiantes,
 * mismo estilo que la columna "Carga académica" de carreras.
 */
import CatalogoUsosCell from '@configuracion-complementarios/components/atoms/CatalogoUsosCell';

export const usosColumn = {
  title: 'Usos',
  key: 'usos',
  width: 160,
  render: (_, record) => (
    <CatalogoUsosCell
      cantidadEstudiantes={record.cantidadEstudiantes ?? 0}
      cantidadDocentes={record.cantidadDocentes ?? 0}
      cantidadPersonal={record.cantidadPersonal ?? 0}
    />
  ),
  sorter: true,
  sortCompare: (a, b) =>
    (Number(a.cantidadEstudiantes) || 0) - (Number(b.cantidadEstudiantes) || 0),
};
