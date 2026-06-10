/**
 * Secciones del formulario de una actividad de calendario — mismo shell visual
 * que los ABM de CFG Académico (workspace + grid de campos en span 12). Incluye:
 * etapa (select con color), selector de actividad (modal), switch para personalizar
 * el nombre y switch de "evento de un solo día" (con fecha de fin condicional).
 */

import { Col, Form, Input, Row, Select, Switch, Typography } from 'antd';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { FieldDatePicker } from '@atoms';
import { cfgAcademicoFormColProps } from '@configuracion/academico/components/organisms/CfgAcademicoFormWorkspace';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';
import CronogramaActividadSelectorField from '@institucional/actual/components/atoms/CronogramaActividadSelectorField';

const { Paragraph, Text } = Typography;

const EtapaOption = ({ nombre, color }) => {
  const swatch = sanitizeDocenteColorHex(color);
  return (
    <span className="crono-etapa-option">
      <span
        className="crono-etapa-option__swatch"
        style={swatch ? { backgroundColor: swatch } : undefined}
        aria-hidden
      />
      {nombre}
    </span>
  );
};

const CronogramaActividadFormSections = ({
  periodos = [],
  selectedActividad,
  actividadId,
  onOpenSelector,
  onClearActividad,
  sobrescribirNombre,
  onToggleSobrescribir,
  eventoUnDia,
  onToggleEventoUnDia,
  disabled = false,
  footer = null,
}) => {
  const tieneActividad = actividadId != null && actividadId !== '';
  const mostrarNombre = sobrescribirNombre && tieneActividad;
  const col = cfgAcademicoFormColProps(12);

  const periodoOptions = periodos.map((p) => ({
    value: p.periodoAcademicoId,
    label: p.nombre,
    color: p.color,
  }));

  return (
    <section className="cfg-academico-workspace cfg-academico-form-workspace">
      <header className="cfg-academico-workspace__header">
        <ListPanelHeader title="Datos de la actividad" />
        <Paragraph type="secondary" className="cfg-academico-workspace__desc">
          Programa una actividad dentro de una etapa de la gestión vigente. Elige una actividad del
          catálogo o personaliza su nombre, e indica si ocupa un solo día o un rango de fechas.
        </Paragraph>
      </header>

      <div className="cfg-academico-form-workspace__body">
        <Row gutter={[24, 20]} className="cfg-academico-form-workspace__grid">
          <Col {...col}>
            <Form.Item
              name="periodoAcademicoId"
              label="Etapa / periodo"
              rules={[{ required: true, message: 'Seleccione la etapa.' }]}
              className="form-field form-field--vertical"
            >
              <Select
                placeholder="Selecciona la etapa"
                options={periodoOptions}
                optionRender={(option) => (
                  <EtapaOption nombre={option.data.label} color={option.data.color} />
                )}
                labelRender={(props) => {
                  const opt = periodoOptions.find((o) => o.value === props.value);
                  return <EtapaOption nombre={props.label} color={opt?.color} />;
                }}
              />
            </Form.Item>
          </Col>

          <Col {...col}>
            <Form.Item
              name="actividadId"
              label="Actividad del catálogo"
              tooltip="Búscala en el catálogo maestro. El nombre puede personalizarse después."
              rules={[{ required: true, message: 'Selecciona una actividad del catálogo.' }]}
              className="form-field form-field--vertical"
            >
              <CronogramaActividadSelectorField
                displayName={selectedActividad?.nombre}
                iconName={selectedActividad?.icono}
                disabled={disabled}
                onSearch={onOpenSelector}
                onClear={onClearActividad}
              />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item label="Nombre de la actividad" className="form-field form-field--vertical">
              <span className="crono-switch-line">
                <Switch
                  checked={mostrarNombre}
                  disabled={disabled || !tieneActividad}
                  onChange={onToggleSobrescribir}
                />
                <Text type="secondary">
                  {tieneActividad
                    ? 'Sobrescribir el nombre del catálogo con uno personalizado'
                    : 'Selecciona una actividad para poder personalizar su nombre'}
                </Text>
              </span>
            </Form.Item>
          </Col>

          {mostrarNombre ? (
            <Col xs={24}>
              <Form.Item
                name="nombrePersonalizado"
                label="Nombre personalizado"
                rules={[{ required: true, message: 'Escribe el nombre de la actividad.' }]}
                extra="Este nombre se mostrará en el cronograma en lugar del nombre del catálogo (sugerido a partir de la actividad elegida)."
                className="form-field form-field--vertical"
              >
                <Input
                  maxLength={200}
                  placeholder="Ej.: Presentación de notas del 1er bimestre"
                  disabled={disabled}
                />
              </Form.Item>
            </Col>
          ) : null}

          <Col {...col}>
            <Form.Item
              name="fechaInicio"
              label="Fecha de inicio"
              rules={[{ required: true, message: 'Indique la fecha de inicio.' }]}
              className="form-field form-field--vertical"
            >
              <FieldDatePicker placeholder="dd-mm-aaaa" style={{ width: '100%' }} disabled={disabled} />
            </Form.Item>
          </Col>

          <Col {...col}>
            <Form.Item label="¿Evento de un solo día?" className="form-field form-field--vertical">
              <span className="crono-switch-line">
                <Switch checked={eventoUnDia} disabled={disabled} onChange={onToggleEventoUnDia} />
                <Text type="secondary">
                  {eventoUnDia ? 'Sí, ocupa un solo día' : 'No, tiene fecha de fin'}
                </Text>
              </span>
            </Form.Item>
          </Col>

          {!eventoUnDia ? (
            <Col {...col}>
              <Form.Item
                name="fechaFin"
                label="Fecha de fin"
                rules={[{ required: true, message: 'Indique la fecha de fin.' }]}
                className="form-field form-field--vertical"
              >
                <FieldDatePicker placeholder="dd-mm-aaaa" style={{ width: '100%' }} disabled={disabled} />
              </Form.Item>
            </Col>
          ) : null}
        </Row>

        {footer ? <div className="cfg-academico-form-workspace__footer">{footer}</div> : null}
      </div>
    </section>
  );
};

export default CronogramaActividadFormSections;
