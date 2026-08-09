/**
 * P1 nivel 1 de Nivelación — paralelos del instituto en gestión vigente,
 * agrupados por carrera (`CarreraTabsListView`, mismo patrón que
 * `InscripcionesList.jsx`/`HistorialSelectorPage.jsx`). Columnas: Paralelo,
 * N° estudiantes, N° pendientes de nivelación, acción "Ver grilla".
 */

import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex, Typography } from 'antd';
import { PageTemplate } from '@templates';
import { CarreraTabsListView } from '@organisms';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { allSpacing } from '@theme/tokens';
import { useParalelosNivelacion } from '@application-academico/nivelaciones/hooks/useParalelosNivelacion.js';
import { nivelacionParaleloPath } from '@application-academico/nivelaciones/utils/nivelacionPaths.js';
import { createNivelacionParalelosColumns } from '../config/nivelacionParalelosColumns.jsx';
import '@configuracion/academico/styles/academico-form-page.css';
import '../styles/nivelaciones.css';

const { Paragraph } = Typography;

/** Accessor de carrera para agrupar por tabs (shape del dashboard de paralelos). */
const getCarreraParalelo = (record) => ({
  id: record.carreraId,
  nombre: record.carreraNombre,
  colorHex: record.carreraColorHex,
});

const NivelacionListarPage = () => {
  const navigate = useNavigate();
  const { paralelos, isLoading, error, breadcrumbItems } = useParalelosNivelacion();

  const handleVerGrilla = useCallback(
    (paralelo) => {
      if (paralelo?.paraleloGestionId == null) return;
      navigate(nivelacionParaleloPath(paralelo.paraleloGestionId));
    },
    [navigate],
  );

  const columns = useMemo(
    () => createNivelacionParalelosColumns({ onVerGrilla: handleVerGrilla }),
    [handleVerGrilla],
  );

  return (
    <PageTemplate
      header={<PageHeader title="Nivelaciones" breadcrumbItems={breadcrumbItems} />}
      sidebar={null}
    >
      <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
        <section className="cfg-academico-workspace">
          <header className="cfg-academico-workspace__header">
            <ListPanelHeader title="Paralelos en gestión" />
            <Paragraph type="secondary" className="cfg-academico-workspace__desc">
              Elija un paralelo para ver sus materias arrastradas/pendientes de nivelación.
              Materias reprobadas de gestiones anteriores que aún no fueron resueltas con un
              examen extraordinario o una decisión administrativa.
            </Paragraph>
          </header>
          <CarreraTabsListView
            rows={paralelos}
            getCarrera={getCarreraParalelo}
            loading={isLoading}
            error={error}
            showSearch={false}
            columns={columns}
            rowKey={(record) => record.paraleloGestionId}
            defaultSort={{ field: 'totalPendientes', order: 'descend' }}
            loadingTip="Cargando paralelos..."
            emptyText="No hay paralelos en gestión vigente."
          />
        </section>
      </Flex>
    </PageTemplate>
  );
};

export default NivelacionListarPage;
