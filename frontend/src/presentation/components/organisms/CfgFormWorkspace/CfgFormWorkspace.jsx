/**
 * Tarjeta de formulario CFG — mismo shell "workspace" que las listas en tabs
 * (header con ListPanelHeader + body). Promovido desde `configuracion/academico`
 * a organismo compartido: lo usan los ABM de Configuración → Académico y otros
 * formularios que replican el mismo patrón visual (licencias, cronograma,
 * wizard de usuario, pagos/compromiso).
 *
 * Estilos: las clases `cfg-academico-workspace*` / `cfg-academico-form-workspace*`
 * viven en `configuracion/academico/styles/academico-form-page.css`. Ese CSS ya es
 * importado directamente por cada página consumidora (patrón existente compartido
 * entre módulos) — no se duplica aquí.
 */
import { Col, Flex, Row, Typography } from 'antd';
import { FormField } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { fieldRowKey } from '@molecules/FormSection/utils/fieldColumns';

import { cfgFormColProps } from './cfgFormColProps';

const { Paragraph, Title } = Typography;

export const CfgFormFieldGrid = ({
  fields = [],
  form,
  resolveOptions = () => [],
  readOnly = false,
  afterField = {},
}) => {
  if (!fields.length) {
    return null;
  }

  const hiddenFields = fields.filter((f) => f.type === 'hidden');
  const visibleFields = fields.filter((f) => f.type !== 'hidden');

  return (
    <>
      {hiddenFields.map((field, index) => (
        <FormField
          key={fieldRowKey(field, index)}
          field={field}
          form={form}
          resolveOptions={resolveOptions}
          readOnly={readOnly}
          labelLayout="vertical"
        />
      ))}
      <Row gutter={[24, 20]} className="cfg-academico-form-workspace__grid">
        {visibleFields.map((field, index) => {
          const after = afterField[field.name];
          return (
            <Col
              key={fieldRowKey(field, index)}
              {...cfgFormColProps(field.span)}
              className={field.type === 'imageUpload' ? 'cfg-academico-form-col--image' : undefined}
            >
              <FormField
                field={field}
                form={form}
                resolveOptions={resolveOptions}
                readOnly={readOnly}
                labelLayout="vertical"
              />
              {after ?? null}
            </Col>
          );
        })}
      </Row>
    </>
  );
};

/**
 * Sección plana dentro de un `CfgFormWorkspace` (sin tarjeta propia — el
 * contenedor visual es la tarjeta del workspace padre). Mismo patrón que
 * `seguridad/usuarios/components/organisms/UsuarioFormSection.jsx`, para
 * evitar "card dentro de card" cuando un formulario agrupa varios sectores
 * de campos dentro de una única tarjeta (ver prop `sections`).
 */
const CfgFormWorkspaceSection = ({
  title,
  description = null,
  fields = [],
  form,
  resolveOptions,
  readOnly = false,
  afterField = {},
  beforeFields = null,
  children = null,
}) => (
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

    <CfgFormFieldGrid
      fields={fields}
      form={form}
      resolveOptions={resolveOptions}
      readOnly={readOnly}
      afterField={afterField}
    />

    {children}
  </div>
);

const CfgFormWorkspace = ({
  title,
  description = null,
  headerActions = null,
  fields = [],
  sections = null,
  form,
  resolveOptions,
  readOnly = false,
  afterField = {},
  beforeFields = null,
  footer = null,
}) => (
  <section className="cfg-academico-workspace cfg-academico-form-workspace">
    <header className="cfg-academico-workspace__header">
      <ListPanelHeader title={title} actions={headerActions} />
      {description ? (
        <Paragraph type="secondary" className="cfg-academico-workspace__desc">
          {description}
        </Paragraph>
      ) : null}
    </header>

    <div className="cfg-academico-form-workspace__body">
      {beforeFields ? (
        <div className="cfg-academico-form-workspace__before-fields">{beforeFields}</div>
      ) : null}
      {Array.isArray(sections) && sections.length ? (
        <Flex vertical gap="large" className="cfg-academico-form-workspace__sections">
          {sections.map((section, index) => (
            <CfgFormWorkspaceSection
              key={section.key ?? section.title ?? index}
              title={section.title}
              description={section.description}
              fields={section.fields}
              form={form}
              resolveOptions={resolveOptions}
              readOnly={readOnly}
              afterField={section.afterField ?? afterField}
              beforeFields={section.beforeFields}
            >
              {section.children}
            </CfgFormWorkspaceSection>
          ))}
        </Flex>
      ) : (
        <CfgFormFieldGrid
          fields={fields}
          form={form}
          resolveOptions={resolveOptions}
          readOnly={readOnly}
          afterField={afterField}
        />
      )}
      {footer ? <div className="cfg-academico-form-workspace__footer">{footer}</div> : null}
    </div>
  </section>
);

export default CfgFormWorkspace;
