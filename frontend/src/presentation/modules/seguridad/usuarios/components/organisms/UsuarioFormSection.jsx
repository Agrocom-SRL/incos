/**
 * Sección plana del wizard de usuario (SEG): encabezado simple (título + descripción)
 * y rejilla de campos reutilizando `CfgAcademicoFormFieldGrid` (FormField labelLayout vertical).
 *
 * A diferencia de `CfgAcademicoFormWorkspace`, NO envuelve en tarjeta (sin borde/sombra):
 * el contenedor visual es el workspace/pestaña del wizard, evitando "card dentro de card".
 *
 * Atomic Design: organismo del módulo Seguridad (compone la molécula de grid de campos).
 */
import { Typography } from 'antd';
import { CfgAcademicoFormFieldGrid } from '@configuracion/academico/components/organisms/CfgAcademicoFormWorkspace';

const { Title, Paragraph } = Typography;

export default function UsuarioFormSection({
  title,
  description = null,
  fields = [],
  form,
  resolveOptions = () => [],
  readOnly = false,
  afterField = {},
  beforeFields = null,
  footer = null,
  children = null,
}) {
  return (
    <section className="seg-usuario-form-section">
      {title || description ? (
        <header className="seg-usuario-form-section__header">
          {title ? (
            <Title level={5} className="seg-usuario-form-section__title">
              {title}
            </Title>
          ) : null}
          {description ? (
            <Paragraph type="secondary" className="seg-usuario-form-section__desc">
              {description}
            </Paragraph>
          ) : null}
        </header>
      ) : null}

      {beforeFields ? (
        <div className="seg-usuario-form-section__before">{beforeFields}</div>
      ) : null}

      <CfgAcademicoFormFieldGrid
        fields={fields}
        form={form}
        resolveOptions={resolveOptions}
        readOnly={readOnly}
        afterField={afterField}
      />

      {children}

      {footer ? <div className="seg-usuario-form-section__footer">{footer}</div> : null}
    </section>
  );
}
