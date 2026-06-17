/**
 * Listado general de licencias estudiantiles (ACA-ASI-LIC · LISTAR).
 * Wrapper delgado del organismo LicenciasTableView: filtro por estado + CTA "Solicitar licencia".
 * La carga vive en LicenciasProvider (montado en el connector).
 */

import { useMemo } from 'react';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';
import {
  LICENCIA_SOLICITAR_PATH,
  LICENCIAS_PATH,
} from '@application-academico/asistencia/utils/asistenciaPaths.js';
import LicenciasTableView from '@academico/asistencia/components/LicenciasTableView.jsx';

const LicenciasListPage = () => {
  const breadcrumbItems = useMemo(
    () => createBreadcrumbItems('ACA-ASI-LIC', 'ACA-ASI', null),
    [],
  );

  return (
    <LicenciasTableView
      title="Licencias estudiantiles"
      breadcrumbItems={breadcrumbItems}
      descripcion="Solicitudes de licencia de los estudiantes: periodo, motivo y estado de aprobación. El tope es de 15 días por gestión."
      solicitarPath={LICENCIA_SOLICITAR_PATH}
      returnListPath={LICENCIAS_PATH}
      mostrarFiltroEstado
    />
  );
};

export default LicenciasListPage;
