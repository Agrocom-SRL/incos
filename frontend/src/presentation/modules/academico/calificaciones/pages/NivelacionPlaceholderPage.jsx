import { useParams } from 'react-router-dom';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';
import CursoSeccionPlaceholder from '../components/CursoSeccionPlaceholder.jsx';
import '../styles/calificaciones.css';

const NivelacionPlaceholderPage = () => {
  const { docenteId, asignacionId } = useParams();
  const breadcrumbItems = createBreadcrumbItems('ACA-CAL-CUADERNO', 'ACA-CAL', 'Nivelación');

  return (
    <PageTemplate
      header={<PageHeader title="Nivelación" breadcrumbItems={breadcrumbItems} />}
      sidebar={null}
    >
      <CursoSeccionPlaceholder docenteId={docenteId} asignacionId={asignacionId} titulo="Nivelación" />
    </PageTemplate>
  );
};

export default NivelacionPlaceholderPage;
