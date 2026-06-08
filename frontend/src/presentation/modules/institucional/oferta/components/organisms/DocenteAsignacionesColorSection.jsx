/**
 * Tab color + carga: picker inline (sin card anidada) y tabla resumen de asignaciones.
 */
import { Flex, Form } from 'antd';
import { ActionButton } from '@atoms';
import { FormField } from '@molecules';
import { DOCENTE_COLOR_FIELD } from '@docentes/config/docenteColorField';
import DocenteAsignacionesResumenTable from './DocenteAsignacionesResumenTable';

const DocenteAsignacionesColorSection = ({ form, saving, onSave, tabla, gestionLabel }) => (
  <Flex vertical gap={24} className="docente-asignaciones-color-tab">

    <DocenteAsignacionesResumenTable tabla={tabla} gestionLabel={gestionLabel} />

    <Form form={form} layout="vertical" className="cfg-academico-form docente-asignaciones-color-tab__form">
      <FormField field={DOCENTE_COLOR_FIELD} form={form} labelLayout="vertical" />
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
    </Form>
  </Flex>
);

export default DocenteAsignacionesColorSection;
