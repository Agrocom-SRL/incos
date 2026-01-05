/**
 * FormSection: Molécula para renderizar secciones de formulario
 * 
 * Single Responsibility: Renderizar una sección de formulario con campos organizados
 * 
 * Clean Architecture:
 * - Presentation Layer: Componente que solo maneja UI
 * - Toda la lógica está en hooks especializados
 * 
 * Atomic Design: Molécula
 * - Usa moléculas (FormField, FormSubsection) y átomos (Card)
 * - Usa componentes nativos de Ant Design (Row, Col)
 * - Usa hooks personalizados para separar lógica de presentación
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo renderiza UI, la lógica está en hooks
 * - Open/Closed: Extensible agregando nuevos tipos de campos sin modificar código existente
 * - Dependency Inversion: Depende de hooks (abstracciones)
 * 
 * Estructura:
 * - Opcionalmente muestra un título si se proporciona
 * - Renderiza campos usando FormField
 * - Soporta campos condicionales basados en valores del formulario
 * - Soporta subsecciones usando FormSubsection
 */

import { Row, Col } from 'antd';
import { Card } from '@atoms';
import { FormField, FormSubsection, DocumentoItem } from '@molecules';
import { useFormSectionFields } from './hooks/useFormSectionFields';
import { isSubsection } from './utils/fieldTypes';

const FormSection = ({
  title,
  fields = [],
  form,
  resolveOptions = () => [],
  minAge = null,
  readOnly = false,
}) => {
  // Hook que compone toda la lógica de campos de la sección
  const {
    fields: safeFields,
    shouldShowField,
    getColumns,
    hasFields,
  } = useFormSectionFields({
    fields,
    form,
  });

  // Si no hay campos, no renderizar nada
  if (!hasFields) {
    return null;
  }

  return (
    <Card
      className="form-section"
      title={title || null}
      variant="outlined"
      shadow={false}
      headerColor="primary"
    >
      {/* Campos del formulario */}
      <Row gutter={[24, 16]} className="form-section-fields">
        {safeFields.map((field, index) => {
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

          // Verificar si el campo debe mostrarse (usando helper del hook)
          if (!shouldShowField(field)) {
            return null;
          }

          // Obtener configuración de columnas (usando helper del hook)
          const columns = getColumns(field);

          // Si es un campo de tipo documento, renderizar DocumentoItem
          if (field.type === 'documento' && field.documento) {
            return (
              <Col
                key={field.name}
                {...columns}
              >
                <DocumentoItem
                  documento={field.documento}
                  form={form}
                  readOnly={readOnly}
                />
              </Col>
            );
          }

          // Para otros tipos de campos, usar FormField
          return (
            <Col
              key={field.name}
              {...columns}
            >
              <FormField
                field={field}
                form={form}
                resolveOptions={resolveOptions}
                minAge={minAge}
                readOnly={readOnly}
              />
            </Col>
          );
        })}
      </Row>
    </Card>
  );
};

export default FormSection;

