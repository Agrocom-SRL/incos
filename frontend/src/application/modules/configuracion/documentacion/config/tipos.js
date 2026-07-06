/**
 * Configuración canónica de los 4 tipos de documentación con pantalla propia.
 *
 * El modelo `documentacion` es UNA sola tabla con un ENUM `tipoDocumento` de 9
 * valores (ver `TIPOS_DOCUMENTO_SISTEMA` en el backend), pero solo 4 tienen
 * pantalla de administración + permiso propio (los otros 5 los deniega el
 * backend explícitamente — ver `resolverPermisoDocumentacion` en
 * `documentacion.routes.js`). Esta es la ÚNICA fuente de verdad de esos 4 tipos
 * en el frontend: páginas, conectores y rutas leen de aquí (no se repite el
 * ENUM/permiso suelto en cada archivo).
 */

export const DOCUMENTACION_TIPOS = {
  inscripcion: {
    tipoKey: 'inscripcion',
    tipoDocumento: 'INSCRIPCION',
    permisoCodigo: 'configuracion.documentacion.inscripcion',
    label: 'Inscripción',
    entidadLabel: 'el documento de inscripción',
  },
  becas: {
    tipoKey: 'becas',
    tipoDocumento: 'BECA',
    permisoCodigo: 'configuracion.documentacion.becas',
    label: 'Becas',
    entidadLabel: 'el documento de becas',
  },
  pasantias: {
    tipoKey: 'pasantias',
    tipoDocumento: 'PASANTIA',
    permisoCodigo: 'configuracion.documentacion.pasantias',
    label: 'Pasantías',
    entidadLabel: 'el documento de pasantías',
  },
  traslado: {
    tipoKey: 'traslado',
    tipoDocumento: 'TRASPASO',
    permisoCodigo: 'configuracion.documentacion.traslado',
    label: 'Traslado',
    entidadLabel: 'el documento de traslado',
  },
};

export const DOCUMENTACION_TIPO_KEYS = Object.keys(DOCUMENTACION_TIPOS);

export const getDocumentacionTipoConfig = (tipoKey) => DOCUMENTACION_TIPOS[tipoKey] ?? null;
