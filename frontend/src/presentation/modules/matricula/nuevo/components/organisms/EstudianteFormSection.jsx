/**
 * Sección plana del wizard de admisión (MAT), análoga a `seguridad/usuarios/components/organisms/UsuarioFormSection.jsx`
 * pero con soporte de condicionales/subsecciones/documento (reutiliza `FormSection` vía deep-import, sin tocarlo);
 * candidata a promoverse a `@organisms` compartido si aparece un segundo consumidor fuera de este wizard.
 *
 * Atomic Design: organismo del módulo Matrícula → Admisión (compone moléculas FieldRenderer/FormField).
 */
import { useMemo } from 'react';
import { Col, Row, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { IconButton } from '@atoms';
import { cfgFormColProps } from '@organisms';
import { useFormSectionFields } from '@molecules/FormSection/hooks/useFormSectionFields';
import { shouldShowConditionalField } from '@molecules/FormSection/hooks/useConditionalField';
import FieldRenderer from '@molecules/FormSection/components/FieldRenderer';
import { fieldRowKey } from '@molecules/FormSection/utils/fieldColumns';
import { isSubsection } from '@molecules/FormSection/utils/fieldTypes';

const { Text, Title, Paragraph } = Typography;

// Etiqueta arriba y a la izquierda con input a ancho completo (mismo look que
// CfgFormFieldGrid, que pasa labelLayout="vertical" a FormField). FormField también
// respeta field.labelLayout, así que se inyecta por campo sin tocar FieldRenderer
// ni FormSubsection (compartidos). Se propaga a los campos internos de subsecciones.
const withVerticalLabels = (fields) =>
  fields.map((field) => {
    if (isSubsection(field)) {
      return {
        ...field,
        fields: (field.fields || []).map((f) => ({ ...f, labelLayout: f.labelLayout ?? 'vertical' })),
      };
    }
    return { ...field, labelLayout: field.labelLayout ?? 'vertical' };
  });

export default function EstudianteFormSection({
  title = null,
  description = null,
  fields = [],
  form,
  resolveOptions = () => [],
  minAge = null,
  readOnly = false,
  beforeFields = null,
  children = null,
  footer = null,
}) {
  const { fields: safeFields, allFormValues, shouldShowField, hasFields } = useFormSectionFields({
    fields,
    form,
  });
  const verticalFields = useMemo(() => withVerticalLabels(safeFields), [safeFields]);

  // Subsección con el lenguaje visual actualizado: panel suave con título/descripción
  // a la izquierda y botón de eliminar (contactos dinámicos), en lugar del divisor
  // centrado legacy de FormSubsection. La condicionalidad y los campos internos usan
  // los mismos helpers compartidos, así que el comportamiento no cambia.
  const renderModernSubsection = (field, index) => {
    const visible = shouldShowConditionalField({
      conditional: field.conditional || false,
      dependsOn: field.dependsOn,
      showIf: field.showIf,
      allFormValues,
    });
    const innerFields = Array.isArray(field.fields) ? field.fields : [];
    if (!visible || !innerFields.length) return null;

    return (
      <Col span={24} key={`subsection-${field.subsectionIndex ?? field.subsectionTitle ?? index}`}>
        <div className="est-wizard-subsection">
          <div className="est-wizard-subsection__header">
            <Text strong className="est-wizard-subsection__title">
              {field.subsectionTitle}
            </Text>
            {field.showDeleteButton && field.onDelete ? (
              <IconButton
                icon={<DeleteOutlined />}
                variant="error"
                onClick={field.onDelete}
                disabled={readOnly}
              />
            ) : null}
          </div>
          {field.description ? (
            <Paragraph type="secondary" className="est-wizard-subsection__desc">
              {field.description}
            </Paragraph>
          ) : null}
          <Row gutter={[24, 20]} className="cfg-academico-form-workspace__grid">
            {innerFields.map((innerField, innerIndex) => (
              <FieldRenderer
                key={fieldRowKey(innerField, innerIndex)}
                field={innerField}
                index={innerIndex}
                form={form}
                resolveOptions={resolveOptions}
                minAge={minAge}
                readOnly={readOnly}
                getColumns={(f) => cfgFormColProps(f.span)}
                shouldShowField={shouldShowField}
              />
            ))}
          </Row>
        </div>
      </Col>
    );
  };

  if (!hasFields && !children && !beforeFields) {
    return null;
  }

  return (
    <div className="cfg-academico-form-workspace__section">
      {title || description ? (
        <header className="cfg-academico-form-workspace__section-header">
          {title ? (
            <Title level={5} className="cfg-academico-form-workspace__section-title">
              {title}
            </Title>
          ) : null}
          {description ? (
            <Paragraph type="secondary" className="cfg-academico-form-workspace__section-desc">
              {description}
            </Paragraph>
          ) : null}
        </header>
      ) : null}

      {beforeFields ? (
        <div className="cfg-academico-form-workspace__before-fields">{beforeFields}</div>
      ) : null}

      {hasFields ? (
        <Row gutter={[24, 20]} className="cfg-academico-form-workspace__grid">
          {verticalFields.map((field, index) =>
            isSubsection(field) ? (
              renderModernSubsection(field, index)
            ) : (
              <FieldRenderer
                key={fieldRowKey(field, index)}
                field={field}
                index={index}
                form={form}
                resolveOptions={resolveOptions}
                minAge={minAge}
                readOnly={readOnly}
                getColumns={(f) => cfgFormColProps(f.span)}
                shouldShowField={shouldShowField}
              />
            )
          )}
        </Row>
      ) : null}

      {children}

      {footer ? <div className="cfg-academico-form-workspace__footer">{footer}</div> : null}
    </div>
  );
}
