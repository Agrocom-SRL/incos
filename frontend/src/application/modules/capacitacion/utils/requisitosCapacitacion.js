/**
 * Utilidades puras para listas de requisitos (editor del curso y checklist de
 * la inscripción): agregar/quitar filas y alternar entregado.
 */

let contadorFilas = 0;

/** Fila nueva (obligatoria por defecto) con `key` local única para React. */
export const crearRequisitoVacio = () => {
  contadorFilas += 1;
  return { key: `req-local-${contadorFilas}`, id: null, descripcion: '', obligatorio: true };
};

/** Quita la fila `index` (copia). */
export const quitarItem = (lista = [], index) => lista.filter((_, i) => i !== index);

/** Reemplaza campos de la fila `index` (copia). */
export const actualizarItem = (lista = [], index, cambios) =>
  lista.map((item, i) => (i === index ? { ...item, ...cambios } : item));

/**
 * Marca/desmarca un requisito de la inscripción por `requisitoId`. Al marcar
 * como entregado se registra la fecha de hoy si no tenía; al desmarcar se limpia.
 */
export const alternarEntregado = (requisitos = [], requisitoId, entregado, hoy) =>
  requisitos.map((r) =>
    r.requisitoId === requisitoId
      ? { ...r, entregado, fechaEntrega: entregado ? (r.fechaEntrega ?? hoy ?? null) : null }
      : r,
  );

/** ¿El borrador del checklist difiere del persistido (por `requisitoId`)? */
export const hayCambiosRequisitos = (original = [], draft = []) =>
  draft.some((r) => {
    const base = original.find((o) => o.requisitoId === r.requisitoId);
    return base ? base.entregado !== r.entregado : false;
  });
