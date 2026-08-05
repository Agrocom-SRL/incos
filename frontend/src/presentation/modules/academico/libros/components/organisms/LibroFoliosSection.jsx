/**
 * Organismo: sección "Folios registrados" de la ficha del libro (P2 ·
 * LibroDetailPage). El libro es compartido por las 3 carreras del instituto,
 * así que los folios se reparten en un tab por carrera (patrón
 * `sd-tabs-shell`/`sd-tab-label` de las fichas de detalle, p. ej.
 * `DocentesDetail`). Cada tab trae su propio botón "Exportar libro", que
 * exporta SOLO las hojas de esa carrera (no el libro completo — para eso
 * está "Generar todos los folios" en la cabecera).
 *
 * Orden de tabs: canónico institucional (Contaduría → Administración →
 * Informática, `ORDEN_CARRERAS_LIBRO`), NO alfabético — mismo criterio que
 * `ordenCarreraLibro` en el backend (generación y export del libro).
 */

import { useMemo } from 'react';
import { Empty, Flex, Table, Tabs } from 'antd';
import { FileExcelOutlined, FileTextOutlined } from '@ant-design/icons';
import { ActionButton, CarreraDotCell } from '@atoms';
import { DetailInfoCard } from '@molecules';
import { groupByCarrera } from '@application/utils';
import { LIBROS_PERMISOS } from '@application-academico/libros/utils/librosPermisos';
import { allSpacing } from '@theme/tokens';

/** Orden canónico institucional del libro físico — espejo de `ORDEN_CARRERAS_LIBRO` (backend). */
const ORDEN_CARRERAS_LIBRO = ['CON-GEN', 'ADM-EMP', 'SIS-INF'];
const ordenCarreraLibro = (codigo) => {
  const idx = ORDEN_CARRERAS_LIBRO.indexOf(String(codigo ?? '').toUpperCase());
  return idx === -1 ? ORDEN_CARRERAS_LIBRO.length : idx;
};

const getCarreraFolio = (folio) => ({
  id: folio.carreraId,
  nombre: folio.carreraNombre,
  codigo: folio.carreraCodigo,
  colorHex: folio.carreraColorHex,
});

const LibroFoliosSection = ({ folios = [], columns = [], onExportar, exportando = false }) => {
  const grupos = useMemo(() => {
    const base = groupByCarrera(folios, getCarreraFolio);
    return [...base].sort((a, b) => {
      if (a.esSinCarrera !== b.esSinCarrera) return a.esSinCarrera ? 1 : -1;
      return ordenCarreraLibro(a.codigo) - ordenCarreraLibro(b.codigo);
    });
  }, [folios]);

  const tabItems = useMemo(
    () =>
      grupos.map((grupo) => ({
        key: grupo.key,
        label: (
          <span className="sd-tab-label">
            <CarreraDotCell nombre={grupo.nombre} colorHex={grupo.colorHex} /> ({grupo.rows.length})
          </span>
        ),
        children: (
          <>
            {!grupo.esSinCarrera ? (
              <Flex justify="flex-end" style={{ marginBottom: allSpacing.marginSM }}>
                <ActionButton
                  permiso={LIBROS_PERMISOS.libro}
                  accion="EXPORTAR"
                  variant="info"
                  icon={<FileExcelOutlined />}
                  loading={exportando}
                  onClick={() => onExportar?.(grupo.id)}
                >
                  Exportar libro
                </ActionButton>
              </Flex>
            ) : null}
            <Table
              dataSource={grupo.rows}
              columns={columns}
              rowKey={(record) => record.id}
              size="small"
              pagination={false}
            />
          </>
        ),
      })),
    [grupos, columns, exportando, onExportar],
  );

  return (
    <DetailInfoCard title={`Folios registrados (${folios.length})`} icon={<FileTextOutlined />} cols={1}>
      {folios.length > 0 ? (
        <div className="sd-tabs-shell">
          <Tabs className="sd-tabs" items={tabItems} />
        </div>
      ) : (
        <Empty description="Este libro aún no tiene folios generados. Use «Generar todos los folios»." />
      )}
    </DetailInfoCard>
  );
};

export default LibroFoliosSection;
