/**
 * CarreraTabsListView - Organismo: listado en tabs por carrera.
 *
 * Atomic Design: ORGANISM
 * Toma un dataset plano y lo reparte en pestañas por carrera (una por carrera + una
 * "Sin carrera" dinámica para las filas sin carrera asignada), reutilizando `TableListView`
 * dentro de cada pestaña. Comparte estado de búsqueda entre pestañas (una sola fuente de
 * verdad en el provider) y sincroniza la pestaña activa con la URL (`?carrera=`), igual que
 * `AcademicoPage` / `OfertaGestionPlanesPage`.
 *
 * Segundo nivel opcional (`subGroup`): dentro de cada carrera, un filtro segmentado (pills)
 * por sub-grupo (p. ej. curso/paralelo), con "Todos" primero y una opción "Sin asignar"
 * dinámica. Si no se pasa `subGroup`, la pestaña muestra directamente la tabla.
 *
 * El diseño visual reutiliza las clases del workspace académico
 * (`sd-tabs-shell`, `cfg-academico-tabs-shell`, `sd-tab-label`, `cfg-academico-tab-panel`),
 * de modo que se ve homogéneo con el resto del sistema. Las piezas propias son el punto de
 * color de carrera + contador en cada pestaña y el filtro segmentado del segundo nivel.
 */

import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Segmented, Tabs } from 'antd';
import TableListView from '../TableListView';
import { groupByCarrera, SIN_CARRERA_KEY } from '@application/utils';
import './carrera-tabs-list-view.css';

const wrapTabPanel = (node) => <div className="cfg-academico-tab-panel">{node}</div>;

const SUB_ALL = '__sub_all__';
const SUB_SIN = '__sub_sin__';

const CarreraTabLabel = ({ grupo }) => (
  <span className="sd-tab-label carrera-tab-label">
    <span
      className={
        'carrera-tab-label__dot' +
        (grupo.esSinCarrera ? ' carrera-tab-label__dot--empty' : '')
      }
      style={grupo.colorHex ? { backgroundColor: grupo.colorHex } : undefined}
      aria-hidden
    />
    <span className="carrera-tab-label__text">{grupo.nombre}</span>
    <span className="carrera-tab-label__count">{grupo.rows.length}</span>
  </span>
);

/**
 * Panel de una carrera: filtro segmentado opcional por sub-grupo (curso/paralelo) + tabla.
 * Cada carrera conserva su propia selección (instancia montada por `destroyOnHidden={false}`).
 */
const CarreraTabPanel = ({ rows, subGroup, renderTabla }) => {
  const [active, setActive] = useState(SUB_ALL);

  const subGrupos = useMemo(() => {
    if (!subGroup?.getSubgrupo) return { ordered: [], sin: [] };
    const map = new Map();
    const sin = [];
    rows.forEach((row) => {
      const sub = subGroup.getSubgrupo(row) || null;
      const id = sub?.id ?? null;
      const nombre = sub?.nombre ?? null;
      const rawKey = id != null ? `id:${id}` : nombre;
      if (!rawKey) {
        sin.push(row);
        return;
      }
      const key = String(rawKey);
      if (!map.has(key)) map.set(key, { key, nombre: nombre || 'Curso', rows: [] });
      map.get(key).rows.push(row);
    });
    const ordered = [...map.values()].sort((a, b) =>
      String(a.nombre).localeCompare(String(b.nombre), 'es', { numeric: true, sensitivity: 'base' }),
    );
    return { ordered, sin };
  }, [rows, subGroup]);

  // Sin sub-grupo configurado o sin cursos reales: tabla directa (evita filtro redundante).
  if (!subGroup?.getSubgrupo || subGrupos.ordered.length === 0) {
    return wrapTabPanel(renderTabla(rows));
  }

  const options = [
    { label: `${subGroup.allLabel || 'Todos'} (${rows.length})`, value: SUB_ALL },
    ...subGrupos.ordered.map((g) => ({ label: `${g.nombre} (${g.rows.length})`, value: g.key })),
    ...(subGrupos.sin.length
      ? [{ label: `${subGroup.sinLabel || 'Sin asignar'} (${subGrupos.sin.length})`, value: SUB_SIN }]
      : []),
  ];

  const activeSafe = options.some((o) => o.value === active) ? active : SUB_ALL;
  const activeRows =
    activeSafe === SUB_ALL
      ? rows
      : activeSafe === SUB_SIN
        ? subGrupos.sin
        : subGrupos.ordered.find((g) => g.key === activeSafe)?.rows ?? rows;

  return wrapTabPanel(
    <>
      <div className="carrera-subfilter">
        <Segmented
          className="carrera-subfilter__segmented"
          options={options}
          value={activeSafe}
          onChange={setActive}
          size="small"
        />
      </div>
      {renderTabla(activeRows)}
    </>,
  );
};

const CarreraTabsListView = ({
  // Datos a repartir en tabs
  rows = [],
  getCarrera,
  urlParam = 'carrera',

  // Segundo nivel opcional (curso/paralelo) como filtro segmentado dentro de cada carrera.
  // { getSubgrupo: (row) => ({ id?, nombre? }) | null, allLabel?, sinLabel? }
  subGroup = null,

  // Passthrough hacia TableListView (comportamiento de cada pestaña)
  columns = [],
  loading = false,
  error = null,
  searchText = '',
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  rowKey,
  searchColSpan = 10,
  searchStyle,
  tableClassName = '',
  pagination,
  defaultSort,
  loadingTip = 'Cargando...',
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const grupos = useMemo(() => groupByCarrera(rows, getCarrera), [rows, getCarrera]);

  const renderTabla = (data) => (
    <TableListView
      embedded
      data={data}
      loading={loading}
      error={error}
      searchText={searchText}
      onSearchChange={onSearchChange}
      searchPlaceholder={searchPlaceholder}
      columns={columns}
      rowKey={rowKey}
      searchColSpan={searchColSpan}
      searchStyle={searchStyle}
      tableClassName={tableClassName}
      pagination={pagination}
      defaultSort={defaultSort}
      loadingTip={loadingTip}
    />
  );

  const tabItems = useMemo(
    () =>
      grupos.map((grupo) => ({
        key: grupo.key,
        label: <CarreraTabLabel grupo={grupo} />,
        children: (
          <CarreraTabPanel rows={grupo.rows} subGroup={subGroup} renderTabla={renderTabla} />
        ),
      })),
    // renderTabla depende de props de tabla; recalcular con grupos y esas props.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      grupos,
      subGroup,
      columns,
      loading,
      error,
      searchText,
      onSearchChange,
      pagination,
      defaultSort,
      tableClassName,
    ],
  );

  const keys = tabItems.map((t) => t.key);
  const requested = searchParams.get(urlParam);
  const activeKey =
    requested && keys.includes(requested) ? requested : keys[0] ?? SIN_CARRERA_KEY;

  const onChange = (key) => {
    const next = new URLSearchParams(searchParams);
    next.set(urlParam, key);
    setSearchParams(next, { replace: true });
  };

  // Aún sin datos (carga inicial): una única tabla vacía con su spinner, sin tabs vacíos.
  if (!tabItems.length) {
    return wrapTabPanel(renderTabla([]));
  }

  return (
    <div className="sd-tabs-shell cfg-academico-tabs-shell carrera-tabs-shell">
      <Tabs
        className="sd-tabs cfg-academico-workspace__tabs carrera-tabs"
        activeKey={activeKey}
        items={tabItems}
        onChange={onChange}
        destroyOnHidden={false}
      />
    </div>
  );
};

export default CarreraTabsListView;
