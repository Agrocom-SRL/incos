/**
 * EnrollmentsListPage — pantalla de listado de inscripciones (consumidora del molde).
 *
 * Responsabilidad ÚNICA: declarar los SLOTS específicos del feature y delegar TODO
 * lo demás al template ListPage, alimentado por enrollments.config. Sin lógica de
 * estado ni de render genérico: la mecánica vive en useListPage; las piezas propias
 * (tarjeta, acciones de fila/cabecera, barra masiva, skeleton) entran por slots.
 */
import { ListPage } from '@ui/templates/ListPage/ListPage';
import { enrollmentsConfig } from './enrollments.config';
import { StudentCard } from './StudentCard';
import { BulkActionsBar } from './BulkActionsBar';
import { EnrollmentHeaderActions } from './sections/EnrollmentHeaderActions';

const noop = () => {};

// Handlers de fila/tarjeta (mock: no-op hasta integrar backend/navegación).
// Objeto único compartido por columnas (buildColumns) y cardRender → sin divergencia.
const rowActions = {
  onOpen: noop,
  onView: noop,
  onEdit: noop,
  onPrint: noop,
  onEmail: noop,
  onReport: noop,
  onDelete: noop,
  onNew: noop,
};

export function EnrollmentsListPage() {
  return (
    <ListPage
      config={enrollmentsConfig}
      rowActions={rowActions}
      headerActions={(api) => (
        <EnrollmentHeaderActions
          careerSelectOptions={api.facetSelectOptions}
          selectedCareerForExport={api.selectedFacetForExport}
          onSelectCareer={api.setSelectedFacetForExport}
          onExport={api.onExport}
          onNew={noop}
        />
      )}
      cardRender={(row, handlers) => <StudentCard row={row} {...handlers} />}
      bulkActions={(keys, api) => (
        <BulkActionsBar
          selectedCount={keys.length}
          onBulkNotify={api.onBulkNotify}
          onBulkExport={api.onBulkExport}
          onBulkDelete={api.onBulkDelete}
        />
      )}
    />
  );
}

export default EnrollmentsListPage;
