/**
 * Instancia Ant Design Form y sincronización con selección del wizard.
 */

import { useCallback, useEffect, useRef } from 'react';
import { Form } from 'antd';

export const useMatriculaWizardFormInstance = ({
  selectedStudent,
  selectedParalelo,
  selectedPeriod,
}) => {
  const [form] = Form.useForm();
  const formRef = useRef(null);

  useEffect(() => {
    if (form) formRef.current = form;
  }, [form]);

  useEffect(() => {
    if (form && selectedStudent?.id) {
      form.setFieldsValue({ student_id: selectedStudent.id });
    }
  }, [form, selectedStudent]);

  useEffect(() => {
    if (form && selectedParalelo?.id) {
      form.setFieldsValue({ parallel_id: selectedParalelo.id });
    }
  }, [form, selectedParalelo]);

  useEffect(() => {
    if (form && selectedPeriod?.id != null) {
      form.setFieldsValue({
        periodo_id: selectedPeriod.id,
        periodo: selectedPeriod.id,
      });
    }
  }, [form, selectedPeriod]);

  const getFormValues = useCallback(() => {
    if (!form) {
      console.warn('⚠️ El formulario no está disponible aún');
      return {};
    }
    try {
      return form.getFieldsValue(true);
    } catch (err) {
      console.error('❌ Error al obtener valores del formulario:', err);
      return {};
    }
  }, [form]);

  return { form, getFormValues };
};
