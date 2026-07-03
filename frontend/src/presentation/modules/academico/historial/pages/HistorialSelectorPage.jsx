/**
 * HistorialSelectorPage — landing del Historial académico (permiso LISTAR).
 *
 * Muestra de ENTRADA la lista completa de estudiantes agrupada en tabs por
 * carrera (patrón gemelo de EstudiantesList: CarreraTabsListView sobre
 * `GET /estudiantes`), con un buscador arriba como filtro: con ≥2 caracteres se
 * muestran los resultados de `GET /estudiantes/search` (debounced) y al vaciarse
 * vuelve el padrón. En ambas vistas la acción única "Ver historial" navega al
 * transcript `/academico/historial/academico/:id`.
 *
 * Página "dumb": compone template + shell CFG Académico y consume el hook de
 * estado `useHistorialSelector`. La rama ESTUDIANTE (redirección a su propio
 * historial) se resuelve antes, en el connector.
 */

import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex, Typography } from 'antd';
import { PageTemplate } from '@templates';
import { CarreraTabsListView, TableListView } from '@organisms';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { SearchBar } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';
import { useHistorialSelector } from '@application-academico/historial/hooks/state/useHistorialSelector.js';
import { historialAcademicoPath } from '@application-academico/historial/utils/historialPaths.js';
import { createHistorialSelectorColumns } from '../config/historialSelectorColumns.jsx';
import '@configuracion/academico/styles/academico-form-page.css';
import '../styles/historial.css';

const { Paragraph } = Typography;

/** Accessor de carrera para agrupar por tabs (shape plano del listado de estudiantes). */
const getCarreraEstudiante = (record) => ({
  nombre: record.carreraNombre,
  codigo: record.carreraCodigo,
  colorHex: record.carreraColorHex,
});

const HistorialSelectorPage = () => {
  const navigate = useNavigate();
  const {
    query,
    onQueryChange,
    modoBusqueda,
    estudiantesLista,
    listaLoading,
    listaError,
    tablePagination,
    resultadosBusqueda,
    busquedaLoading,
    busquedaError,
  } = useHistorialSelector();

  const breadcrumbItems = useMemo(
    () => createBreadcrumbItems('ACA-HIS', 'ACA', 'Historial académico'),
    [],
  );

  const handleVerHistorial = useCallback(
    (estudiante) => {
      if (!estudiante?.id) return;
      navigate(historialAcademicoPath(estudiante.id));
    },
    [navigate],
  );

  const columns = useMemo(
    () => createHistorialSelectorColumns({ onVerHistorial: handleVerHistorial }),
    [handleVerHistorial],
  );

  return (
    <PageTemplate
      header={<PageHeader title="Historial académico" breadcrumbItems={breadcrumbItems} />}
      sidebar={null}
    >
      <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
        <section className="cfg-academico-workspace">
          <header className="cfg-academico-workspace__header">
            <ListPanelHeader title="Seleccionar estudiante" />
            <Paragraph type="secondary" className="cfg-academico-workspace__desc">
              Elija un estudiante de la lista por carrera, o filtre con el buscador, para
              consultar su historial académico (kardex/transcript de todas las gestiones).
            </Paragraph>
            {/* Buscador único de la página (mismo ancho que el del listado de estudiantes). */}
            <div className="historial-selector__buscar" style={{ maxWidth: 520 }}>
              <SearchBar
                placeholder="Buscar por nombre, código o C.I. (mín. 2 caracteres)…"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
              />
            </div>
          </header>

          {modoBusqueda ? (
            <div className="cfg-academico-tab-panel">
              <TableListView
                embedded
                showSearch={false}
                data={resultadosBusqueda}
                loading={busquedaLoading}
                error={busquedaError}
                columns={columns}
                rowKey={(record) => record.id}
                loadingTip="Buscando estudiantes..."
              />
            </div>
          ) : (
            <CarreraTabsListView
              rows={estudiantesLista}
              getCarrera={getCarreraEstudiante}
              loading={listaLoading}
              error={listaError}
              showSearch={false}
              columns={columns}
              rowKey={(record) => record.id}
              pagination={tablePagination}
              defaultSort={{ field: 'estudiante', order: 'ascend' }}
              loadingTip="Cargando estudiantes..."
            />
          )}
        </section>
      </Flex>
    </PageTemplate>
  );
};

export default HistorialSelectorPage;
