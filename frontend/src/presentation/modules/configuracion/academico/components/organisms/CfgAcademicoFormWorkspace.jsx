/**
 * Tarjeta de formulario CFG Académico — mismo shell que AcademicoPage (workspace + header/body).
 */
import { Col, Row, Typography } from 'antd';
import { FormField } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { fieldRowKey } from '@molecules/FormSection/utils/fieldColumns';

const { Paragraph } = Typography;

/** Columnas 2× desde tablet; ancho completo si span 24 */
export const cfgAcademicoFormColProps = (span = 12) => {
  if (!span || span >= 24) {
    return { xs: 24 };
  }
  return { xs: 24, sm: 24, md: 12, lg: 12, xl: 12, xxl: 12 };
};

export const CfgAcademicoFormFieldGrid = ({
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
              {...cfgAcademicoFormColProps(field.span)}
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

const CfgAcademicoFormWorkspace = ({
  title,
  description = null,
  headerActions = null,
  fields = [],
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
      <CfgAcademicoFormFieldGrid
        fields={fields}
        form={form}
        resolveOptions={resolveOptions}
        readOnly={readOnly}
        afterField={afterField}
      />
      {footer ? <div className="cfg-academico-form-workspace__footer">{footer}</div> : null}
    </div>
  </section>
);

export default CfgAcademicoFormWorkspace;
