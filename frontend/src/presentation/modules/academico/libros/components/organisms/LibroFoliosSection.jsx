/**
 * Organismo: sección "Folios registrados" de la ficha del libro (P2 ·
 * LibroDetailPage). Muestra solo los folios VIGENTES (BORRADOR) — los
 * ANULADOS (p. ej. superados por un reajuste de "Generar todos los folios")
 * tienen su propia página, sin mezclar. El libro es
 * compartido por las 3 carreras del instituto, así que los folios vigentes
 * se reparten en un tab por carrera (patrón `sd-tabs-shell`/`sd-tab-label`
 * de las fichas de detalle, p. ej. `DocentesDetail`). "Exportar libro" vive
 * en `tabBarExtraContent` (mismo patrón que `GestionHorariosArmadoPage`:
 * acción alineada a la barra de tabs, no flotando sobre la tabla) y exporta
 * SOLO las hojas de la carrera activa (no el libro completo — para eso está
 * "Generar todos los folios" en la cabecera).
 *
 * Orden de tabs: canónico institucional (Contaduría → Administración →
 * Informática, `ORDEN_CARRERAS_LIBRO`), NO alfabético — mismo criterio que
 * `ordenCarreraLibro` en el backend (generación y export del libro).
 */

import { useMemo, useState } from 'react';
import { Empty, Table, Tabs } from 'antd';
import { FileExcelOutlined, FileTextOutlined } from '@ant-design/icons';
import { ActionButton, CarreraDotCell } from '@atoms';
import { DetailInfoCard } from '@molecules';
import { groupByCarrera } from '@application/utils';
import { LIBROS_PERMISOS } from '@application-academico/libros/utils/librosPermisos';

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
  const vigentes = useMemo(() => folios.filter((f) => f.estado !== 'ANULADO'), [folios]);

  const grupos = useMemo(() => {
    const base = groupByCarrera(vigentes, getCarreraFolio);
    return [...base].sort((a, b) => {
      if (a.esSinCarrera !== b.esSinCarrera) return a.esSinCarrera ? 1 : -1;
      return ordenCarreraLibro(a.codigo) - ordenCarreraLibro(b.codigo);
    });
  }, [vigentes]);

  const [activeKey, setActiveKey] = useState(grupos[0]?.key);
  const grupoActivo = grupos.find((g) => g.key === activeKey) ?? grupos[0];

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
          <div className="sd-tab-body-no-bg">
            <Table
              dataSource={grupo.rows}
              columns={columns}
              rowKey={(record) => record.id}
              size="small"
              pagination={false}
            />
          </div>
        ),
      })),
    [grupos, columns],
  );

  return (
    <DetailInfoCard title={`Folios registrados (${vigentes.length})`} icon={<FileTextOutlined />} cols={1}>
      {vigentes.length > 0 ? (
        <div className="sd-tabs-shell">
          <Tabs
            className="sd-tabs"
            items={tabItems}
            activeKey={grupoActivo?.key}
            onChange={setActiveKey}
            tabBarExtraContent={
              grupoActivo && !grupoActivo.esSinCarrera ? (
                <ActionButton
                  permiso={LIBROS_PERMISOS.libro}
                  accion="EXPORTAR"
                  variant="info"
                  icon={<FileExcelOutlined />}
                  loading={exportando}
                  onClick={() => onExportar?.(grupoActivo.id)}
                >
                  Exportar libro
                </ActionButton>
              ) : null
            }
          />
        </div>
      ) : (
        <Empty description="Este libro aún no tiene folios generados. Use «Generar todos los folios»." />
      )}
    </DetailInfoCard>
  );
};

export default LibroFoliosSection;
