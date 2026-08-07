/**
 * B2 `/academico/nivelaciones/inscribir` — dos entradas (documento de diseño):
 *
 * 1) Deep-link con querystring de contexto (desde la grilla, P1 nivel 2):
 *    el Drawer se abre DIRECTO sobre la landing, en modo `crear` (si trae
 *    ancla real) o `detalle` (solo lectura, caso más común hoy — ver
 *    `nivelacionEventoContexto.js`).
 * 2) Landing SIN contexto (acceso por menú): buscador de estudiante calcado
 *    de `HistorialSelectorPage.jsx`. GAP CONOCIDO: no existe todavía un
 *    endpoint de "materias pendientes de un estudiante" (Fase D del plan de
 *    datos, "Gap 2") — seleccionar un estudiante aquí muestra ese estado
 *    "próximamente" en vez de fabricar datos; el flujo que SÍ funciona hoy
 *    es la entrada 1 (deep-link desde la grilla).
 */

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Flex, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { CarreraTabsListView, TableListView } from '@organisms';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { SearchBar } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { useNivelacionSelector } from '@application-academico/nivelaciones/hooks/useNivelacionSelector.js';
import {
  parseCrearEventoContexto,
  parseDetalleEventoContexto,
} from '@application-academico/nivelaciones/utils/nivelacionEventoContexto.js';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs';
import { createNivelacionSelectorColumns } from '../config/nivelacionSelectorColumns.jsx';
import EventoHistorialDrawer from '../components/EventoHistorialDrawer.jsx';
import '@configuracion/academico/styles/academico-form-page.css';
import '../styles/nivelaciones.css';

const { Paragraph } = Typography;

/** Accessor de carrera para agrupar por tabs (shape plano del listado de estudiantes). */
const getCarreraEstudiante = (record) => ({
  nombre: record.carreraNombre,
  codigo: record.carreraCodigo,
  colorHex: record.carreraColorHex,
});

const NivelacionInscribirPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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
    estudianteSeleccionado,
    seleccionarEstudiante,
    limpiarSeleccion,
  } = useNivelacionSelector();

  const contextoCrear = parseCrearEventoContexto(searchParams);
  const contextoDetalle = !contextoCrear ? parseDetalleEventoContexto(searchParams) : null;
  const tieneContextoUrl = Boolean(contextoCrear || contextoDetalle);

  const cerrarDrawerContexto = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const columns = useMemo(
    () => createNivelacionSelectorColumns({ onSeleccionar: seleccionarEstudiante }),
    [seleccionarEstudiante],
  );

  const breadcrumbItems = useMemo(
    () => createBreadcrumbItems('ACA-NIV-INSCRIBIR', 'ACA-NIV'),
    [],
  );

  return (
    <PageTemplate
      header={<PageHeader title="Registrar evento de nivelación" breadcrumbItems={breadcrumbItems} />}
      sidebar={null}
    >
      <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
        <section className="cfg-academico-workspace">
          <header className="cfg-academico-workspace__header">
            <ListPanelHeader title="Seleccionar estudiante" />
            <Paragraph type="secondary" className="cfg-academico-workspace__desc">
              Elija un estudiante de la lista por carrera, o filtre con el buscador, para
              registrar un evento de nivelación. También puede llegar directo desde la grilla
              de un paralelo (menú Nivelaciones → Ver grilla).
            </Paragraph>
            <div className="historial-selector__buscar" style={{ maxWidth: 520 }}>
              <SearchBar
                placeholder="Buscar por nombre, código o C.I. (mín. 2 caracteres)…"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
              />
            </div>
          </header>

          {estudianteSeleccionado ? (
            <Alert
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
              title={`Materias pendientes de ${estudianteSeleccionado.nombreCompleto} — próximamente`}
              description="Esta búsqueda todavía no tiene un endpoint que resuelva las materias arrastradas/pendientes de un estudiante concreto (gap documentado en el plan de datos de Nivelación). Por ahora, ingrese a Nivelaciones → un paralelo → la grilla del curso y haga clic en el estado de la materia arrastrada."
              action={
                <a onClick={limpiarSeleccion} role="button" tabIndex={0}>
                  Elegir otro estudiante
                </a>
              }
              className="niv-ajustes-drawer__alert"
              style={{ marginBottom: 16 }}
            />
          ) : null}

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

      <EventoHistorialDrawer
        abierto={tieneContextoUrl}
        modo={contextoCrear ? 'crear' : 'detalle'}
        contexto={contextoCrear?.contexto ?? contextoDetalle}
        ancla={contextoCrear?.ancla}
        detalle={contextoDetalle}
        onCerrar={cerrarDrawerContexto}
      />
    </PageTemplate>
  );
};

export default NivelacionInscribirPage;
