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

import { Col } from 'antd';
import { FormField, FormSubsection, DocumentoItem, DataList, DataCards } from '@molecules';
import { isSubsection, isList, isDocumento, isCards } from '../utils/fieldTypes';

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
      <Col key={field.name} {...columns}>
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
      <Col key={field.name} {...columns}>
        <DataList
          data={field.items}
          loading={field.loading}
          emptyMessage={field.emptyMessage}
          renderItem={field.renderItem}
          onSelect={field.onSelect}
          selectedItem={field.selectedItem}
          isSelected={field.isSelected}
          loadingText={field.loadingText}
        />
      </Col>
    );
  }

  // Si es un campo de tipo cards, renderizar DataCards directamente
  // El enricher ya agregó items, loading, emptyMessage, renderItem al campo con sus valores por defecto
  // Solo extraer los datos del field y pasarlos como props individuales a DataCards
  if (isCards(field)) {
    return (
      <Col key={field.name} {...columns}>
        <DataCards
          data={field.items}
          loading={field.loading}
          emptyMessage={field.emptyMessage}
          renderItem={field.renderItem}
          onSelect={field.onSelect}
          selectedItem={field.selectedItem}
          isSelected={field.isSelected}
          loadingText={field.loadingText}
        />
      </Col>
    );
  }

  // Para otros tipos de campos, usar FormField
  return (
    <Col key={field.name} {...columns}>
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
