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
 * El diseño visual reutiliza las clases del workspace académico
 * (`sd-tabs-shell`, `cfg-academico-tabs-shell`, `sd-tab-label`, `cfg-academico-tab-panel`),
 * de modo que se ve homogéneo con el resto del sistema. La única pieza propia es el punto de
 * color de carrera + contador en la etiqueta de cada pestaña.
 */

import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs } from 'antd';
import TableListView from '../TableListView';
import { groupByCarrera, SIN_CARRERA_KEY } from '@application/utils';
import './carrera-tabs-list-view.css';

const wrapTabPanel = (node) => <div className="cfg-academico-tab-panel">{node}</div>;

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

const CarreraTabsListView = ({
  // Datos a repartir en tabs
  rows = [],
  getCarrera,
  urlParam = 'carrera',

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
        children: wrapTabPanel(renderTabla(grupo.rows)),
      })),
    // renderTabla depende de props de tabla; recalcular con grupos y esas props.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      grupos,
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
