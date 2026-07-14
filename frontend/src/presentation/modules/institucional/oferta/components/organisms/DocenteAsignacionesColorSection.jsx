/**
 * Toolbar de color del docente (picker + guardar) — usado en el tab Horario semanal.
 *
 * Fail-closed: sin `docentes.asignar` EDITAR no se pinta NADA (ni el picker) —
 * rama DOCENTE (solo lectura de sus asignaciones) no debe ver controles de edición.
 * Código alineado al que exige el backend en PUT /docentes/:id/color
 * (verificarPermisoCualquiera institucional.horarios.color-docente | docentes.asignar).
 */
import { Flex, Form } from 'antd';
import { usePermiso } from '@application-auth';
import { ActionButton } from '@atoms';
import { FormField } from '@molecules';
import { DOCENTE_COLOR_FIELD } from '@docentes/config/docenteColorField';

const DocenteAsignacionesColorSection = ({ form, saving, onSave }) => {
  const puedeEditarColor = usePermiso('docentes.asignar', 'EDITAR');
  if (!puedeEditarColor) return null;

  return (
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
            permiso="docentes.asignar"
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
};

export default DocenteAsignacionesColorSection;
