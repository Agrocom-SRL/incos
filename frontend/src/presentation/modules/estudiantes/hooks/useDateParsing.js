// hooks/useDateParsing.js
/**
 * Hook para manejar parsing de fechas con múltiples formatos
 * 
 * Single Responsibility: Parsear fechas con formatos DD-MM-YYYY o DD/MM/YYYY
 */

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

/**
 * Parsea una fecha con múltiples formatos (DD-MM-YYYY o DD/MM/YYYY)
 */
export const parseDateWithMultipleFormats = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return null;
  
  const cleaned = dateString.trim();
  
  // Intentar parsear con guiones primero (DD-MM-YYYY)
  let parsed = dayjs(cleaned, 'DD-MM-YYYY', true);
  if (parsed.isValid()) {
    return parsed;
  }
  
  // Si no funciona, intentar con barras (DD/MM/YYYY)
  parsed = dayjs(cleaned, 'DD/MM/YYYY', true);
  if (parsed.isValid()) {
    return parsed;
  }
  
  return null;
};

/**
 * Hook para manejar parsing de fechas en DatePicker
 */
export const useDateParsing = (fieldName, format = 'DD-MM-YYYY', form) => {
  const handleDateChange = (date, dateString) => {
    // Si hay un date válido (seleccionado del calendario), pasar directamente
    if (date && dayjs.isDayjs(date) && date.isValid()) {
      return { date, dateString };
    }
    
    // Si hay un dateString (input manual del usuario), intentar parsear ambos formatos
    if (dateString && dateString.trim()) {
      const parsed = parseDateWithMultipleFormats(dateString);
      if (parsed && parsed.isValid()) {
        const formattedString = parsed.format(format);
        if (form) {
          form.setFieldsValue({ [fieldName]: parsed });
        }
        return { date: parsed, dateString: formattedString };
      }
    }
    
    // Si es null (limpiado), pasar directamente
    if (date === null || date === undefined) {
      return { date, dateString };
    }
    
    return { date, dateString };
  };

  const handleBlur = (e) => {
    let inputValue = null;
    if (e?.target?.value) {
      inputValue = e.target.value;
    } else if (e?.target?.input?.value) {
      inputValue = e.target.input.value;
    } else if (typeof e === 'string') {
      inputValue = e;
    }
    
    if (inputValue && inputValue.trim()) {
      const parsed = parseDateWithMultipleFormats(inputValue);
      if (parsed && parsed.isValid() && form) {
        form.setFieldsValue({ [fieldName]: parsed });
      }
    }
  };

  const handlePressEnter = (e) => {
    let inputValue = null;
    if (e?.target?.value) {
      inputValue = e.target.value;
    } else if (e?.target?.input?.value) {
      inputValue = e.target.input.value;
    } else if (typeof e === 'string') {
      inputValue = e;
    }
    
    if (inputValue && inputValue.trim()) {
      const parsed = parseDateWithMultipleFormats(inputValue);
      if (parsed && parsed.isValid() && form) {
        form.setFieldsValue({ [fieldName]: parsed });
      }
    }
  };

  return {
    handleDateChange,
    handleBlur,
    handlePressEnter,
  };
};

