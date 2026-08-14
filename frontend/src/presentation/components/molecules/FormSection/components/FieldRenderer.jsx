/**
 * FieldRenderer - Componente para renderizar diferentes tipos de campos
 * 
 * Single Responsibility: Renderizar un campo según su tipo
 * 
 * Clean Architecture:
 * - Presentation Layer: Componente que solo maneja UI
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo decide qué componente renderizar según el tipo
 * - Open/Closed: Extensible agregando nuevos tipos sin modificar código existente
 * - Strategy Pattern: Diferentes estrategias de renderizado según el tipo
 * 
 * Este componente separa la lógica de renderizado de FormSection,
 * aplicando el principio de Single Responsibility.
 */

import { Col, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { FormField, FormSubsection, DocumentoItem, DataList, DataCards, ActivityList } from '@molecules';
import { TimetableCalendar } from '@organisms';
import { isSubsection, isList, isDocumento, isCards, isActivity, isTimetable } from '../utils/fieldTypes';
import { fieldRowKey } from '../utils/fieldColumns';

/**
 * Contexto de la cabecera de un campo `list`: el enricher (capa de aplicación)
 * entrega datos planos `{ count, hint }` y aquí se convierten en UI.
 *
 * @param {{count?: number, hint?: string}|ReactNode|null} headerExtra
 * @returns {ReactNode|null}
 */
const buildListHeaderExtra = (headerExtra) => {
  if (!headerExtra || typeof headerExtra !== 'object') return headerExtra ?? null;
  if (headerExtra.count == null && !headerExtra.hint) return null;
  return (
    <>
      {headerExtra.count != null ? (
        <span className="data-list__count">{headerExtra.count}</span>
      ) : null}
      {headerExtra.hint ? <span>{headerExtra.hint}</span> : null}
    </>
  );
};

/** Acción de reintento del estado vacío cuando la carga del campo `list` falló. */
const buildListRetryAction = (onRetry) =>
  typeof onRetry === 'function' ? (
    <Button size="small" icon={<ReloadOutlined />} onClick={onRetry}>
      Reintentar
    </Button>
  ) : null;

/**
 * Renderiza un campo según su tipo
 * 
 * @param {Object} props
 * @param {Object} props.field - Campo a renderizar
 * @param {number} props.index - Índice del campo en el array
 * @param {Object} props.form - Instancia del formulario de Ant Design
 * @param {Function} props.resolveOptions - Función para resolver opciones de campos
 * @param {number} props.minAge - Edad mínima para campos de fecha
 * @param {boolean} props.readOnly - Si el componente está en modo solo lectura
 * @param {Function} props.getColumns - Función para obtener configuración de columnas
 * @param {Function} props.shouldShowField - Función para verificar si el campo debe mostrarse
 * @returns {ReactNode|null} Componente renderizado o null
 */
const FieldRenderer = ({
  field,
  index,
  form,
  resolveOptions,
  minAge,
  readOnly,
  getColumns,
  shouldShowField,
}) => {
  // Si es una sub-sección, renderizarla usando FormSubsection
  if (isSubsection(field)) {
    return (
      <FormSubsection
        key={`subsection-${field.subsectionIndex !== undefined ? field.subsectionIndex : index}`}
        subsectionTitle={field.subsectionTitle}
        fields={field.fields || []}
        form={form}
        resolveOptions={resolveOptions}
        minAge={minAge}
        readOnly={readOnly}
        conditional={field.conditional || false}
        dependsOn={field.dependsOn}
        showIf={field.showIf}
        showDeleteButton={field.showDeleteButton || false}
        onDelete={field.onDelete || null}
      />
    );
  }

  // Verificar si el campo debe mostrarse
  if (!shouldShowField(field)) {
    return null;
  }

  // Obtener configuración de columnas
  const columns = getColumns(field);

  // Si es un campo de tipo documento, renderizar DocumentoItem
  if (isDocumento(field)) {
    return (
      <Col key={fieldRowKey(field, index)} {...columns}>
        <DocumentoItem
          documento={field.documento}
          form={form}
          readOnly={readOnly}
        />
      </Col>
    );
  }

  // Si es un campo de tipo lista, renderizar DataList directamente
  // El enricher ya agregó items, loading, emptyMessage, renderItem al campo con sus valores por defecto
  // Solo extraer los datos del field y pasarlos como props individuales a DataList
  if (isList(field)) {
    return (
      <Col key={fieldRowKey(field, index)} {...columns}>
        <DataList
          data={field.items}
          groups={field.groups}
          loading={field.loading}
          emptyTitle={field.emptyTitle}
          emptyMessage={field.emptyMessage}
          emptyAction={buildListRetryAction(field.onRetry)}
          status={field.status}
          renderItem={field.renderItem}
          onSelect={field.onSelect}
          selectedItem={field.selectedItem}
          isSelected={field.isSelected}
          loadingText={field.loadingText}
          header={field.header}
          headerExtra={buildListHeaderExtra(field.headerExtra)}
          className={field.className || ''}
        />
      </Col>
    );
  }

  // Si es un campo de tipo cards, renderizar DataCards directamente
  // El enricher ya agregó items, loading, emptyMessage, renderItem al campo con sus valores por defecto
  // Solo extraer los datos del field y pasarlos como props individuales a DataCards
  if (isCards(field)) {
    return (
      <Col key={fieldRowKey(field, index)} {...columns}>
        <DataCards
          data={field.items}
          loading={field.loading}
          emptyMessage={field.emptyMessage}
          renderItem={field.renderItem}
          onSelect={field.onSelect}
          selectedItem={field.selectedItem}
          isSelected={field.isSelected}
          loadingText={field.loadingText}
          className={field.className || ''}
        />
      </Col>
    );
  }

  // Si es un campo de tipo activity, renderizar ActivityList directamente
  // El enricher ya agregó activities, loading, emptyMessage al campo con sus valores por defecto
  // Solo extraer los datos del field y pasarlos como props individuales a ActivityList
  if (isActivity(field)) {
    return (
      <Col key={fieldRowKey(field, index)} {...columns}>
        <ActivityList
          activities={field.activities}
          loading={field.loading}
          emptyMessage={field.emptyMessage}
          loadingText={field.loadingText}
          gap={field.gap}
          onItemClick={field.onItemClick || null}
          accentColors={field.accentColors}
          className={field.className || ''}
        />
      </Col>
    );
  }

  // Si es un campo de tipo timetable, renderizar TimetableCalendar directamente
  // El enricher ya agregó schedule, loading, config al campo con sus valores por defecto
  // Solo extraer los datos del field y pasarlos como props individuales a TimetableCalendar
  if (isTimetable(field)) {
    return (
      <Col key={fieldRowKey(field, index)} {...columns}>
        <TimetableCalendar
          schedule={field.schedule || []}
          config={field.config || {}}
          onClassClick={field.onClassClick || null}
          loading={field.loading || false}
        />
      </Col>
    );
  }

  // Para otros tipos de campos, usar FormField
  return (
    <Col key={fieldRowKey(field, index)} {...columns}>
      <FormField
        field={field}
        form={form}
        resolveOptions={resolveOptions}
        minAge={minAge}
        readOnly={readOnly}
      />
    </Col>
  );
};

export default FieldRenderer;
