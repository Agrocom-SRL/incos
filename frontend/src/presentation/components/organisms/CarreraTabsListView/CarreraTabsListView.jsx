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
 * Segundo nivel opcional (`subGroup`): dentro de cada carrera, un filtro de CHIPS de color
 * por sub-grupo (p. ej. curso/paralelo), con "Todos" primero y una opción "Sin asignar"
 * dinámica. Cada chip lleva el color del paralelo y el mismo paralelo mantiene el mismo color
 * en todas las carreras (mapa global). Si no se pasa `subGroup`, la pestaña muestra la tabla.
 *
 * El diseño visual reutiliza las clases del workspace académico
 * (`sd-tabs-shell`, `cfg-academico-tabs-shell`, `sd-tab-label`, `cfg-academico-tab-panel`),
 * de modo que se ve homogéneo con el resto del sistema. Las piezas propias son el punto de
 * color de carrera + contador en cada pestaña y los chips de color del segundo nivel.
 */

import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs } from 'antd';
import TableListView from '../TableListView';
import { groupByCarrera, SIN_CARRERA_KEY } from '@application/utils';
import {
  buildParaleloColorMap,
  PARALELO_ALL_COLOR,
  PARALELO_SIN_COLOR,
} from './paraleloPalette';
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

/** Un chip del filtro por curso/paralelo. Activo = relleno con el color del paralelo. */
const SubgrupoChip = ({ label, count, color, active, onClick }) => (
  <button
    type="button"
    className={'carrera-chip' + (active ? ' carrera-chip--active' : '')}
    style={{ '--chip-color': color }}
    aria-pressed={active}
    onClick={onClick}
  >
    <span className="carrera-chip__dot" aria-hidden />
    <span className="carrera-chip__text">{label}</span>
    <span className="carrera-chip__count">{count}</span>
  </button>
);

/**
 * Panel de una carrera: filtro de chips opcional por sub-grupo (curso/paralelo) + tabla.
 * Cada carrera conserva su propia selección (instancia montada por `destroyOnHidden={false}`).
 * `colorMap` (colorKey → color) llega del organismo para que el mismo paralelo tenga el
 * mismo color en todas las carreras.
 */
const CarreraTabPanel = ({ rows, subGroup, renderTabla, colorMap }) => {
  const [active, setActive] = useState(SUB_ALL);

  const subGrupos = useMemo(() => {
    if (!subGroup?.getSubgrupo) return { ordered: [], sin: [] };
    const map = new Map();
    const sin = [];
    rows.forEach((row) => {
      const sub = subGroup.getSubgrupo(row) || null;
      const id = sub?.id ?? null;
      const nombre = sub?.nombre ?? null;
      const colorKey = sub?.colorKey ?? nombre;
      const rawKey = id != null ? `id:${id}` : nombre;
      if (!rawKey) {
        sin.push(row);
        return;
      }
      const key = String(rawKey);
      if (!map.has(key)) map.set(key, { key, nombre: nombre || 'Curso', colorKey, rows: [] });
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

  const chips = [
    {
      value: SUB_ALL,
      label: subGroup.allLabel || 'Todos',
      count: rows.length,
      color: PARALELO_ALL_COLOR,
    },
    ...subGrupos.ordered.map((g) => ({
      value: g.key,
      label: g.nombre,
      count: g.rows.length,
      color: colorMap?.[g.colorKey] || PARALELO_SIN_COLOR,
    })),
    ...(subGrupos.sin.length
      ? [
          {
            value: SUB_SIN,
            label: subGroup.sinLabel || 'Sin asignar',
            count: subGrupos.sin.length,
            color: PARALELO_SIN_COLOR,
          },
        ]
      : []),
  ];

  const activeSafe = chips.some((c) => c.value === active) ? active : SUB_ALL;
  const activeRows =
    activeSafe === SUB_ALL
      ? rows
      : activeSafe === SUB_SIN
        ? subGrupos.sin
        : subGrupos.ordered.find((g) => g.key === activeSafe)?.rows ?? rows;

  return wrapTabPanel(
    <>
      <div className="carrera-subfilter" role="group" aria-label="Filtrar por paralelo">
        {chips.map((chip) => (
          <SubgrupoChip
            key={chip.value}
            label={chip.label}
            count={chip.count}
            color={chip.color}
            active={chip.value === activeSafe}
            onClick={() => setActive(chip.value)}
          />
        ))}
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
  showSearch = true,
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

  // Mapa global colorKey → color: mismo paralelo, mismo color en TODAS las carreras.
  const colorMap = useMemo(() => {
    if (!subGroup?.getSubgrupo) return null;
    const keys = rows
      .map((row) => {
        const sub = subGroup.getSubgrupo(row);
        return sub?.colorKey ?? sub?.nombre ?? null;
      })
      .filter(Boolean);
    return buildParaleloColorMap(keys);
  }, [rows, subGroup]);

  const renderTabla = (data) => (
    <TableListView
      embedded
      data={data}
      loading={loading}
      error={error}
      searchText={searchText}
      onSearchChange={onSearchChange}
      searchPlaceholder={searchPlaceholder}
      showSearch={showSearch}
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
          <CarreraTabPanel
            rows={grupo.rows}
            subGroup={subGroup}
            colorMap={colorMap}
            renderTabla={renderTabla}
          />
        ),
      })),
    // renderTabla depende de props de tabla; recalcular con grupos y esas props.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      grupos,
      subGroup,
      colorMap,
      columns,
      loading,
      error,
      searchText,
      onSearchChange,
      showSearch,
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
