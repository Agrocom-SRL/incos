/**
 * P1 del Centralizador — paralelos del instituto en gestión vigente,
 * agrupados por carrera (`CarreraTabsListView`, mismo patrón que
 * `InscripcionesList.jsx`/`NivelacionListarPage.jsx`). Columnas: Paralelo
 * (nombre + turno), N° asignaturas, N° estudiantes, acción "Abrir".
 *
 * Menú propio (hermano de Calificaciones). El centralizador se arma por
 * PARALELO: aquí se elige uno y se navega a su resultado anual (P2).
 */

import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex, Typography } from 'antd';
import { PageTemplate } from '@templates';
import { CarreraTabsListView } from '@organisms';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { allSpacing } from '@theme/tokens';
import { useParalelosCentralizador } from '@application-academico/centralizador/hooks/useParalelosCentralizador.js';
import { centralizadorParaleloPath } from '@application-academico/centralizador/utils/centralizadorPaths.js';
import { createCentralizadorParalelosColumns } from '../config/centralizadorParalelosColumns.jsx';
import '@configuracion/academico/styles/academico-form-page.css';
import '../styles/centralizador.css';

const { Paragraph } = Typography;

/** Accessor de carrera para agrupar por tabs (shape del dashboard de paralelos). */
const getCarreraParalelo = (record) => ({
  id: record.carreraId,
  nombre: record.carreraNombre,
  colorHex: record.carreraColorHex,
});

const CentralizadorPage = () => {
  const navigate = useNavigate();
  const { paralelos, isLoading, error, breadcrumbItems } = useParalelosCentralizador();

  const handleAbrir = useCallback(
    (paralelo) => {
      if (paralelo?.paraleloGestionId == null) return;
      navigate(centralizadorParaleloPath(paralelo.paraleloGestionId));
    },
    [navigate],
  );

  const columns = useMemo(
    () => createCentralizadorParalelosColumns({ onAbrir: handleAbrir }),
    [handleAbrir],
  );

  return (
    <PageTemplate
      header={<PageHeader title="Centralizador de calificaciones" breadcrumbItems={breadcrumbItems} />}
      sidebar={null}
    >
      <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
        <section className="cfg-academico-workspace">
          <header className="cfg-academico-workspace__header">
            <ListPanelHeader title="Paralelos en gestión" />
            <Paragraph type="secondary" className="cfg-academico-workspace__desc">
              Elija un paralelo en gestión vigente para ver el centralizador de calificaciones.
              El centralizador se arma por paralelo: cada asignatura es una columna de la matriz.
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
            defaultSort={{ field: 'paralelo', order: 'ascend' }}
            loadingTip="Cargando paralelos..."
            emptyText="No hay paralelos en gestión vigente."
          />
        </section>
      </Flex>
    </PageTemplate>
  );
};

export default CentralizadorPage;
