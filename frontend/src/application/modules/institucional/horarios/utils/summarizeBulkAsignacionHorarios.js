/**
 * @param {{ completo?: boolean, resultados?: Array<{ success?: boolean, error?: string }> }|null|undefined} data
 * @returns {string|null}
 */
export function summarizeBulkAsignacionHorarios(data) {
  if (!data || data.completo !== false) return null;
  const fails = (data.resultados || []).filter((r) => r && r.success === false);
  const msgs = [...new Set(fails.map((f) => f.error).filter(Boolean))];
  if (msgs.length) return msgs.join(' ');
  return 'No se guardaron todos los bloques solicitados.';
}
