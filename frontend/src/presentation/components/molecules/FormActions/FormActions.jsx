// components/molecules/FormActions/FormActions.jsx
/**
 * FormActions: Molécula para acciones del formulario (botones)
 * 
 * Single Responsibility: Agrupar y organizar los botones de acción del formulario
 */

import { Space, Form } from 'antd';
import Button from '@atoms/button';

const FormActions = ({
  mode = 'create',
  loading = false,
  onReset,
  onCancel,
  submitLabel,
  resetLabel = 'Limpiar Formulario',
  cancelLabel = 'Cancelar',
}) => {
  return (
    <Form.Item>
      <Space size="middle">
        <Button
          variant="primary"
          size="large"
          htmlType="submit"
          loading={loading}
        >
          {submitLabel || (mode === 'create' ? 'Registrar Estudiante' : 'Guardar Cambios')}
        </Button>
        <Button
          variant="secondary"
          size="large"
          onClick={onReset}
        >
          {resetLabel}
        </Button>
        <Button
          variant="secondary"
          size="large"
          onClick={onCancel}
        >
          {cancelLabel}
        </Button>
      </Space>
    </Form.Item>
  );
};

export default FormActions;
