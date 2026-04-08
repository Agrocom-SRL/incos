import { Checkbox, Tooltip } from 'antd';
import '@modules/seguridad/styles/seguridad.css';

/** Orden de columnas: capa Acceso (1) + Operaciones (5) + Flujos (3) */
const ACCIONES_GRILLA = [
  { key: 'LISTAR', header: 'LISTAR', capa: 'acceso' },
  { key: 'DETALLE', header: 'DETALLE', capa: 'ops' },
  { key: 'CREAR', header: 'CREAR', capa: 'ops' },
  { key: 'EDITAR', header: 'EDITAR', capa: 'ops' },
  { key: 'ELIMINAR', header: 'ELIMINAR', capa: 'ops' },
  { key: 'ACTIVAR', header: 'ACTIVAR', capa: 'ops' },
  { key: 'APROBAR', header: 'APROBAR', capa: 'flujos' },
  { key: 'EXPORTAR', header: 'EXPORTAR', capa: 'flujos' },
  { key: 'GENERAR_PDF', header: 'PDF', capa: 'flujos' },
];

const ACCION_AYUDA = {
  LISTAR: 'Ver listados y buscar; no implica abrir ficha ni modificar datos.',
  DETALLE: 'Abrir ficha o detalle de un registro concreto.',
  CREAR: 'Registrar registros nuevos (alta). No cubre modificar algo que ya existe.',
  EDITAR:
    'Guardar cambios sobre registros ya existentes (incluye el “Guardar” del formulario de edición). No es lo mismo que CREAR.',
  ELIMINAR: 'Borrar o anular registros según las reglas del módulo.',
  ACTIVAR: 'Activar o rehabilitar registros cuando el flujo lo permita.',
  APROBAR: 'Aprobar o rechazar solicitudes en flujos con validación.',
  EXPORTAR: 'Descargar reportes o exportaciones (p. ej. Excel) según el módulo.',
  GENERAR_PDF: 'Generar documentos PDF según el módulo.',
};

const GRUPO_UI_LABELS = {
  mat_admision: 'Admisión',
  mat_inscripcion: 'Matrículas',
  mat_aportes: 'Aportes',
  mat_becas: 'Becas',
  mat_pasantias: 'Pasantías estudiantiles',
  mat_documentos: 'Documentos',
  aca_calificaciones: 'Calificaciones',
  aca_nivelaciones: 'Nivelaciones',
  aca_traspasos: 'Traspasos',
  aca_transitabilidad: 'Transitabilidad',
  aca_historial: 'Historial',
  aca_avance: 'Avance académico',
  aca_licencias_est: 'Licencias estudiantiles',
  doc_docentes: 'Docentes',
  doc_licencias: 'Licencias docentes',
  doc_supervision: 'Supervisión',
  doc_pasantias: 'Pasantías docentes',
  fin_pagos: 'Pagos',
  fin_adicionales: 'Pagos adicionales',
  fin_reportes: 'Reportes de pagos',
  cfg_pagos: 'Config. de pagos',
  inst_gestion: 'Gestión actual',
  inst_cronograma: 'Cronogramas',
  inst_oferta: 'Oferta académica',
  inst_horarios: 'Horarios',
  inst_pasadas: 'Gestiones pasadas',
  cfg_academico: 'Config. académica',
  cfg_documentacion: 'Config. documentación',
  cfg_complementario: 'Datos complementarios',
  cfg_convenios: 'Convenios',
  cfg_historial: 'Historial actividades',
  rep_avance: 'Avance académico',
  rep_asistencia: 'Asistencia',
  rep_desercion: 'Deserción',
  rep_solicitudes: 'Solicitudes',
  seg_usuarios: 'Usuarios',
  seg_roles: 'Roles y permisos',
};

function labelGrupoUi(grupoUi) {
  const k = String(grupoUi || '');
  return GRUPO_UI_LABELS[k] ?? k;
}

function estaEnDelta(delta, grupo, accion) {
  const key = `${grupo.grupoUi}:${accion}`;
  if (Object.prototype.hasOwnProperty.call(delta, key)) {
    return delta[key].habilitado;
  }
  return undefined;
}

/**
 * Grilla de permisos por dominio (v2): filas = grupos de sidebar, columnas = acciones por capas.
 * @param {Array<{ grupoUi: string, rutaSidebar: string, codigos: string[], accionesValidas: string[], accionesAsignadas: string[] }>} grupos
 * @param {Record<string, { permiso_codigo: string, accion: string, habilitado: boolean }>} delta
 */
export default function PermisosDominioPicker({
  grupos = [],
  delta = {},
  toggleAccion,
  disabled = false,
}) {
  const renderCelda = (grupo, accion) => {
    if (!(grupo.accionesValidas || []).includes(accion)) {
      return (
        <td key={accion} className="seg-grilla__celda-na">
          —
        </td>
      );
    }
    const asignada =
      estaEnDelta(delta, grupo, accion) ?? (grupo.accionesAsignadas || []).includes(accion);
    return (
      <td key={accion} className="seg-grilla__celda-check">
        <Checkbox
          checked={asignada}
          disabled={disabled}
          onChange={() => toggleAccion(grupo, accion)}
        />
      </td>
    );
  };

  if (!grupos.length) {
    return <div className="seg-picker__empty">Sin permisos para este dominio.</div>;
  }

  return (
    <div className="seg-picker seg-grilla-v2">
      <div className="seg-grilla-v2__scroll">
        <table className="seg-grilla-v2__table">
          <thead>
            <tr>
              <th rowSpan={2} className="seg-grilla-v2__th-func">
                Funcionalidad
              </th>
              <th colSpan={1} className="seg-grilla-v2__capa seg-grilla-v2__capa--acceso">
                Acceso
              </th>
              <th colSpan={5} className="seg-grilla-v2__capa seg-grilla-v2__capa--ops">
                Operaciones
              </th>
              <th colSpan={3} className="seg-grilla-v2__capa seg-grilla-v2__capa--flujos">
                Flujos
              </th>
            </tr>
            <tr>
              {ACCIONES_GRILLA.map(({ key, header, capa }) => (
                <th
                  key={key}
                  className={`seg-grilla-v2__th-acc seg-grilla-v2__th-acc--${capa}`}
                >
                  <Tooltip title={ACCION_AYUDA[key] || key}>
                    <span>{header}</span>
                  </Tooltip>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grupos.map((grupo) => (
              <tr key={grupo.grupoUi}>
                <td className="seg-grilla-v2__td-func">
                  <div className="seg-grilla__grupo-titulo">{labelGrupoUi(grupo.grupoUi)}</div>
                  <div className="seg-grilla__grupo-ruta">{grupo.rutaSidebar || '—'}</div>
                </td>
                {ACCIONES_GRILLA.map(({ key }) => renderCelda(grupo, key))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
