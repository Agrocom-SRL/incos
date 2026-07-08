/**
 * Hook: useScholarshipsSection
 *
 * Single Responsibility: normalizar el array de becas asignadas de un estudiante
 * (con las variantes de nombre de campo que llegan del backend, ej. `state`/`estado`)
 * a un shape listo para renderizar en @organisms/ScholarshipsSection, incluyendo el
 * texto/detalle que necesita TableActions para el diálogo de eliminación.
 *
 * Usado por: ScholarshipsSection (Presentation Layer)
 */

import { useMemo } from 'react';

/**
 * @typedef {Object} ScholarshipSectionItem
 * @property {string|number} key
 * @property {Object} raw - Beca original (para `record` de TableActions y `onDeleteBeca`)
 * @property {string} scholarshipName
 * @property {string} [scholarshipCode]
 * @property {string} [estado] - Estado normalizado (PENDIENTE|ACTIVA|FINALIZADA|RECHAZADA|...)
 * @property {number} [pct] - Porcentaje de descuento
 * @property {string|Date} [requestDate] - Fecha de solicitud sin formatear
 * @property {string} [managementLabel] - Código o año de la gestión
 * @property {boolean} [docsOk]
 * @property {string} [observations]
 * @property {string} itemName - Texto para el diálogo de confirmación de TableActions
 * @property {Array<{label: string, value: string}>} itemDetails - Detalle para TableActions
 */

/**
 * Normaliza las becas asignadas de un estudiante para su presentación en cards.
 *
 * @param {Array<Object>} [scholarships] - Becas asignadas del estudiante
 * @returns {ScholarshipSectionItem[]}
 */
export const useScholarshipsSection = (scholarships = []) => {
  return useMemo(() => {
    return (scholarships || []).map((s, i) => {
      const scholarshipName = s.scholarshipName || `Beca ${i + 1}`;
      const managementLabel = s.managementCode || s.managementYear;

      const itemDetails = [
        { label: 'Beca', value: s.scholarshipName },
        { label: 'Código', value: s.scholarshipCode },
        { label: 'Gestión', value: managementLabel },
      ].filter((d) => d.value);

      return {
        key: s.id ?? i,
        raw: s,
        scholarshipName,
        scholarshipCode: s.scholarshipCode,
        estado: s.state || s.estado,
        pct: s.scholarshipPercentage,
        requestDate: s.requestDate || s.fechaSolicitud,
        managementLabel,
        docsOk: s.documentsComplete ?? s.documentosCompletos,
        observations: s.observations,
        itemName: `la beca ${s.scholarshipName || s.scholarshipCode || 'asignada'}`,
        itemDetails,
      };
    });
  }, [scholarships]);
};
