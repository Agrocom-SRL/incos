// hooks/useTextCapitalization.js
/**
 * Hook para manejar capitalización automática de texto
 * 
 * Single Responsibility: Capitalizar texto en campos específicos
 */

/**
 * Capitaliza la primera letra de cada palabra
 */
export const capitalizeText = (text) => {
  if (!text) return text;
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Hook para manejar capitalización en campos de texto
 */
export const useTextCapitalization = (fieldName, form) => {
  const shouldCapitalize = ['nombres', 'apellidoPaterno', 'apellidoMaterno'].includes(fieldName);

  const handleCapitalizeChange = (e) => {
    if (!shouldCapitalize || !form) return;
    const value = e.target.value;
    const capitalizedValue = capitalizeText(value);
    form.setFieldsValue({ [fieldName]: capitalizedValue });
  };

  const handleCapitalizeBlur = (e) => {
    if (!shouldCapitalize || !form) return;
    const value = e.target.value;
    const capitalizedValue = capitalizeText(value);
    if (value !== capitalizedValue) {
      form.setFieldsValue({ [fieldName]: capitalizedValue });
    }
  };

  return {
    shouldCapitalize,
    handleCapitalizeChange,
    handleCapitalizeBlur,
  };
};

