/**
 * Normaliza respuestas de listado con filas en `data.becas` o array directo.
 */
export function mapNestedListResponse(result, rowsKey = 'becas') {
  if (!result?.success) return result;
  const payload = result.data;
  if (Array.isArray(payload)) {
    return {
      success: true,
      data: payload,
      pagination: result.pagination ?? null,
    };
  }
  const rows = payload?.[rowsKey] ?? [];
  const pagination =
    result.pagination ??
    (payload && typeof payload === 'object'
      ? {
          page: payload.page,
          limit: payload.limit,
          total: payload.total,
          totalPages: payload.totalPages,
        }
      : null);
  return { success: true, data: rows, pagination };
}
