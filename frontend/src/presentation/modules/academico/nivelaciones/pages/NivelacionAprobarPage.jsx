/**
 * B3 `/academico/nivelaciones/aprobar` — bandeja PLANA (sin tabs por
 * carrera) de nivelaciones PROGRAMADA/EN_CURSO, cruzando todos los
 * paralelos. Acción "Gestionar" abre `ResultadoNivelacionDrawer`. Admite
 * deep-link `?nivelacionId=` desde la grilla (P1 nivel 2): si la fila está
 * en la bandeja (siempre lo está, por construcción: la bandeja YA es
 * PROGRAMADA/EN_CURSO), el Drawer se abre automáticamente.
 */

import { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Flex, Typography } from 'antd';
import { PageTemplate } from '@templates';
import { TableListView } from '@organisms';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { allSpacing } from '@theme/tokens';
import { useNivelacionesPendientes } from '@application-academico/nivelaciones/hooks/useNivelacionesPendientes.js';
import { parseAprobarContexto } from '@application-academico/nivelaciones/utils/nivelacionEventoContexto.js';
import { createNivelacionPendientesColumns } from '../config/nivelacionPendientesColumns.jsx';
import ResultadoNivelacionDrawer from '../components/ResultadoNivelacionDrawer.jsx';
import '@configuracion/academico/styles/academico-form-page.css';
import '../styles/nivelaciones.css';

const { Paragraph } = Typography;

const NivelacionAprobarPage = () => {
  const [searchParams] = useSearchParams();
  const {
    nivelaciones,
    loading,
    error,
    searchText,
    handleSearchChange,
    filaSeleccionada,
    abrirDrawer,
    cerrarDrawer,
    handleGuardarResultado,
    guardandoResultado,
    handleRegistrarDecision,
    guardandoDecision,
    breadcrumbItems,
  } = useNivelacionesPendientes();

  // Deep-link desde la grilla: abre el Drawer apenas la bandeja trae la fila.
  const deepLinkNivelacionId = parseAprobarContexto(searchParams);
  const yaAbrioDeepLinkRef = useRef(false);
  useEffect(() => {
    if (!deepLinkNivelacionId || yaAbrioDeepLinkRef.current || loading) return;
    const fila = nivelaciones.find((n) => n.nivelacionId === deepLinkNivelacionId);
    if (fila) {
      yaAbrioDeepLinkRef.current = true;
      abrirDrawer(fila);
    }
  }, [deepLinkNivelacionId, nivelaciones, loading, abrirDrawer]);

  const columns = useMemo(
    () => createNivelacionPendientesColumns({ onGestionar: abrirDrawer }),
    [abrirDrawer],
  );

  return (
    <PageTemplate
      header={<PageHeader title="Aprobar nivelaciones" breadcrumbItems={breadcrumbItems} />}
      sidebar={null}
    >
      <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
        <section className="cfg-academico-workspace">
          <header className="cfg-academico-workspace__header">
            <ListPanelHeader title="Nivelaciones pendientes" />
            <Paragraph type="secondary" className="cfg-academico-workspace__desc">
              Exámenes de nivelación programados o en curso, cruzando todos los paralelos.
              Registre el resultado del examen o, si corresponde, una decisión administrativa
              de ABANDONO/RETIRADO.
            </Paragraph>
          </header>
          <div className="cfg-academico-tab-panel">
            <TableListView
              embedded
              data={nivelaciones}
              loading={loading}
              error={error}
              searchText={searchText}
              onSearchChange={handleSearchChange}
              searchPlaceholder="Buscar por estudiante, materia o tipo…"
              columns={columns}
              rowKey="nivelacionId"
              searchColSpan={10}
              searchStyle={{ maxWidth: 520 }}
              pagination={false}
              loadingTip="Cargando nivelaciones pendientes..."
              emptyText="No hay nivelaciones pendientes de resolver."
            />
          </div>
        </section>
      </Flex>

      <ResultadoNivelacionDrawer
        abierto={Boolean(filaSeleccionada)}
        fila={filaSeleccionada}
        onCerrar={cerrarDrawer}
        onGuardarResultado={handleGuardarResultado}
        guardandoResultado={guardandoResultado}
        onRegistrarDecision={handleRegistrarDecision}
        guardandoDecision={guardandoDecision}
      />
    </PageTemplate>
  );
};

export default NivelacionAprobarPage;
