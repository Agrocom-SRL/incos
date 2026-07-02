/**
 * HistorialSelectorPage — landing del Historial académico (permiso LISTAR).
 *
 * Selector/buscador de estudiante (reutiliza la búsqueda de estudiantes vía
 * `useBuscarEstudiantesHistorial`). Al elegir un estudiante navega a su transcript
 * `/academico/historial/academico/:id`.
 *
 * Página "dumb": compone template + shell CFG Académico + organismo selector y
 * consume el hook de búsqueda. La rama ESTUDIANTE (redirección a su propio
 * historial) se resuelve antes, en el connector.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex, Typography } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { allSpacing } from '@theme/tokens';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';
import { useBuscarEstudiantesHistorial } from '@application-academico/historial/hooks/api/useBuscarEstudiantesHistorial.js';
import { historialAcademicoPath } from '@application-academico/historial/utils/historialPaths.js';
import HistorialEstudianteSelector from '../components/HistorialEstudianteSelector.jsx';
import '@configuracion/academico/styles/academico-form-page.css';
import '../styles/historial.css';

const { Paragraph } = Typography;

const HistorialSelectorPage = () => {
  const navigate = useNavigate();
  const { estudiantes, loading, error, buscar } = useBuscarEstudiantesHistorial();

  const breadcrumbItems = useMemo(
    () => createBreadcrumbItems('ACA-HIS', 'ACA', 'Historial académico'),
    [],
  );

  const handleSeleccionar = (estudiante) => {
    if (!estudiante?.id) return;
    navigate(historialAcademicoPath(estudiante.id));
  };

  return (
    <PageTemplate
      header={<PageHeader title="Historial académico" breadcrumbItems={breadcrumbItems} />}
      sidebar={null}
    >
      <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
        <section className="cfg-academico-workspace cfg-academico-form-workspace">
          <header className="cfg-academico-workspace__header">
            <ListPanelHeader title="Seleccionar estudiante" />
            <Paragraph type="secondary" className="cfg-academico-workspace__desc">
              Busque y seleccione al estudiante para consultar su historial académico
              (kardex/transcript de todas las gestiones).
            </Paragraph>
          </header>
          <div className="cfg-academico-form-workspace__body">
            <HistorialEstudianteSelector
              estudiantes={estudiantes}
              loading={loading}
              error={error}
              onBuscar={buscar}
              onSeleccionar={handleSeleccionar}
            />
          </div>
        </section>
      </Flex>
    </PageTemplate>
  );
};

export default HistorialSelectorPage;
