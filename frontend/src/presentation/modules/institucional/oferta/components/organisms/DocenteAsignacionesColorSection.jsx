/**
 * Toolbar de color del docente (picker + guardar) — usado en el tab Horario semanal.
 */
import { Flex, Form } from 'antd';
import { ActionButton } from '@atoms';
import { FormField } from '@molecules';
import { DOCENTE_COLOR_FIELD } from '@docentes/config/docenteColorField';

const DocenteAsignacionesColorSection = ({ form, saving, onSave }) => (
  <Form form={form} layout="horizontal" className="cfg-academico-form docente-asignaciones-color-tab__form">
    <Flex
      justify="flex-end"
      align="flex-start"
      gap={16}
      wrap="wrap"
      className="docente-asignaciones-color-tab__toolbar"
    >
      <FormField field={DOCENTE_COLOR_FIELD} form={form} labelLayout="horizontal" />
      <div className="docente-asignaciones-color-tab__actions">
        <ActionButton
          permiso="docentes.editar"
          accion="EDITAR"
          variant="primary"
          loading={saving}
          onClick={onSave}
        >
          Guardar color
        </ActionButton>
      </div>
    </Flex>
  </Form>
);

export default DocenteAsignacionesColorSection;
