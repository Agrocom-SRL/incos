/**
 * Estado vacío del listado de inscripciones (organismo).
 * Distingue "sin datos" de "sin resultados por filtro" y ofrece la acción para
 * poblar (nueva inscripción) o limpiar filtros.
 * @param {{
 *   hasFilters: boolean,
 *   onClearFilters: () => void,
 *   onNew: () => void,
 *   canCreate?: boolean,
 * }} props
 */
import { InboxOutlined, PlusOutlined, ClearOutlined } from '@ant-design/icons';
import { Button } from 'antd';

const MatriculaEmptyState = ({ hasFilters, onClearFilters, onNew, canCreate = true }) => (
  <div className="matricula-v2-empty">
    <div className="matricula-v2-empty__icon" aria-hidden>
      <InboxOutlined />
    </div>
    <div className="matricula-v2-empty__title">
      {hasFilters ? 'Sin resultados' : 'Aún no hay inscripciones'}
    </div>
    <p className="matricula-v2-empty__hint">
      {hasFilters
        ? 'Ningún estudiante coincide con los filtros aplicados. Ajusta la búsqueda o límpialos para ver toda la lista.'
        : 'Registra la primera inscripción de la gestión para que aparezca en esta lista.'}
    </p>
    <div className="matricula-v2-empty__actions">
      {hasFilters ? (
        <Button icon={<ClearOutlined />} onClick={onClearFilters}>
          Limpiar filtros
        </Button>
      ) : null}
      {canCreate ? (
        <Button type="primary" icon={<PlusOutlined />} onClick={onNew}>
          Nueva inscripción
        </Button>
      ) : null}
    </div>
  </div>
);

export default MatriculaEmptyState;
