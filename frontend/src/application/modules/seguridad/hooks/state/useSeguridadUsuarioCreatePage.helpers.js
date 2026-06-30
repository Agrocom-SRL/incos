export const ROLES_POR_CATEGORIA = {
  ACCESO_SISTEMA: ['ADMIN_SISTEMA'],
  PERSONAL_INSTITUCIONAL: ['RECTOR', 'DIR_ACADEMICO', 'DIR_ADMIN', 'SEC_ACADEMICA', 'SEC_ADMIN'],
  ASIGNAR_ESTUDIANTE: ['ESTUDIANTE'],
  ASIGNAR_DOCENTE: ['DOCENTE'],
};

export function categoriaDesdeUsuario(usuario) {
  const tipoRef = usuario?.tipo_referencia;
  if (tipoRef === 'ESTUDIANTE') return 'ASIGNAR_ESTUDIANTE';
  if (tipoRef === 'DOCENTE') return 'ASIGNAR_DOCENTE';
  if (tipoRef === 'RECTOR' || tipoRef === 'DIRECTOR' || tipoRef === 'SECRETARIA') {
    return 'PERSONAL_INSTITUCIONAL';
  }
  return 'ACCESO_SISTEMA';
}

function valorLinea(lineas, etiqueta) {
  const row = (lineas || []).find((ln) => String(ln?.etiqueta || '').toLowerCase() === etiqueta.toLowerCase());
  return row?.valor || undefined;
}

const PERSONAL_FIELD_NAMES = [
  ['personal', 'ci'],
  ['personal', 'expedition'],
  ['personal', 'firstName'],
  ['personal', 'lastName'],
];

/**
 * C.I. como credencial por defecto: número de cédula sin extensión (solo dígitos).
 * Sirve para precargar username/password al alta de estudiantes/docentes; el admin
 * solo confirma o cambia. Devuelve undefined si no hay dígitos válidos.
 */
export function ciCredencialPorDefecto(ci) {
  const digits = String(ci ?? '').replace(/\D/g, '');
  return digits.length >= 4 ? digits : undefined;
}

export function getCreatePageInitialValues({ prefillDocenteUsuario, prefillEstudianteUsuario } = {}) {
  const base = { categoria_creacion: 'ACCESO_SISTEMA' };

  const docenteId = Number(prefillDocenteUsuario?.docenteId);
  if (Number.isFinite(docenteId) && docenteId >= 1) {
    const credDocente = ciCredencialPorDefecto(prefillDocenteUsuario.ci ?? prefillDocenteUsuario.ciCompleto);
    return {
      categoria_creacion: 'ASIGNAR_DOCENTE',
      docente_id: docenteId,
      vinculo_nombre_display: prefillDocenteUsuario.nombreCompleto || undefined,
      vinculo_email_display: prefillDocenteUsuario.emailPersonal || undefined,
      vinculo_ci_display: prefillDocenteUsuario.ciCompleto || undefined,
      vinculo_codigo_display: undefined,
      // C.I. (sin extensión) como usuario y contraseña por defecto (editable)
      username: credDocente,
      password: credDocente,
      password_confirm: credDocente,
    };
  }

  const estudianteId = Number(prefillEstudianteUsuario?.estudianteId);
  if (Number.isFinite(estudianteId) && estudianteId >= 1) {
    const credEstudiante = ciCredencialPorDefecto(
      prefillEstudianteUsuario.ci ?? prefillEstudianteUsuario.ciCompleto
    );
    return {
      categoria_creacion: 'ASIGNAR_ESTUDIANTE',
      estudiante_id: estudianteId,
      vinculo_nombre_display: prefillEstudianteUsuario.nombreCompleto || undefined,
      vinculo_email_display: prefillEstudianteUsuario.emailPersonal || undefined,
      vinculo_ci_display: prefillEstudianteUsuario.ciCompleto || undefined,
      vinculo_codigo_display: prefillEstudianteUsuario.codigo || undefined,
      // C.I. (sin extensión) como usuario y contraseña por defecto (editable)
      username: credEstudiante,
      password: credEstudiante,
      password_confirm: credEstudiante,
    };
  }

  return base;
}

export function getEditPageInitialValues(usuario) {
  const categoria = categoriaDesdeUsuario(usuario);
  const values = {
    categoria_creacion: categoria,
    rol_id: usuario?.rol?.id,
    username: usuario?.username || undefined,
    password: undefined,
    password_confirm: undefined,
  };

  if (categoria === 'ASIGNAR_ESTUDIANTE') {
    values.estudiante_id = usuario?.referencia_id || undefined;
    values.vinculo_nombre_display = usuario?.vinculo_perfil?.nombre_completo || undefined;
    values.vinculo_ci_display = valorLinea(usuario?.vinculo_perfil?.lineas, 'CI');
    values.vinculo_email_display = valorLinea(usuario?.vinculo_perfil?.lineas, 'Email personal');
    values.vinculo_codigo_display = valorLinea(usuario?.vinculo_perfil?.lineas, 'Código estudiante');
  }
  if (categoria === 'ASIGNAR_DOCENTE') {
    values.docente_id = usuario?.referencia_id || undefined;
    values.vinculo_nombre_display = usuario?.vinculo_perfil?.nombre_completo || undefined;
    values.vinculo_ci_display = valorLinea(usuario?.vinculo_perfil?.lineas, 'CI');
    values.vinculo_email_display = valorLinea(usuario?.vinculo_perfil?.lineas, 'Email personal');
  }
  if (categoria === 'PERSONAL_INSTITUCIONAL' || categoria === 'ACCESO_SISTEMA') {
    const p = usuario?.personal || {};
    values.personal = {
      ci: p.ci || undefined,
      expedition: p.expedition || undefined,
      firstName: p.firstName || undefined,
      lastName: p.lastName || undefined,
      motherLastName: p.motherLastName || undefined,
      birthDate: p.birthDate || undefined,
      gender: p.gender || undefined,
      civilStatusId: p.civilStatusId || undefined,
      personalEmail: p.personalEmail || undefined,
      phone: p.phone || undefined,
      mobilePhone: p.mobilePhone || undefined,
      address: p.address || undefined,
      municipalityId: p.municipalityId || undefined,
    };
  }
  return values;
}

export function errMsg(json) {
  const e = json?.error;
  if (json?.error?.details?.length) {
    return json.error.details.map((d) => d.message).join('. ');
  }
  return typeof e === 'string' ? e : e?.message || 'Error';
}

export function loadRolesErrorMessage(e) {
  const msg = e?.message || '';
  if (e?.name === 'TypeError' && (msg.includes('fetch') || msg.includes('Load failed'))) {
    return 'No se pudo conectar con el API. Inicie el backend en el puerto 3000 (p. ej. npm run dev en la carpeta backend) o revise VITE_API_URL / VITE_API_BASE_URL.';
  }
  return errMsg(e);
}

function personalPayloadFromForm(personal) {
  if (!personal || typeof personal !== 'object') return undefined;
  const p = { ...personal };
  delete p.departamentoId;
  delete p.provinciaId;

  const birth = p.birthDate;
  if (birth) {
    try {
      if (typeof birth === 'object' && typeof birth.format === 'function') {
        p.birthDate = birth.format('YYYY-MM-DD');
      } else if (birth instanceof Date && !Number.isNaN(birth.getTime())) {
        p.birthDate = birth.toISOString().slice(0, 10);
      } else if (typeof birth === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(birth)) {
        const [dd, mm, yyyy] = birth.split('-');
        p.birthDate = `${yyyy}-${mm}-${dd}`;
      }
    } catch {
      // El backend validará el formato
    }
  }

  Object.keys(p).forEach((k) => {
    if (p[k] === '' || p[k] === undefined) delete p[k];
  });
  return Object.keys(p).length ? p : undefined;
}

export function buildCreatePayload(values, { isEditMode = false } = {}) {
  const {
    username,
    password,
    password_confirm: _passwordConfirm,
    vinculo_nombre_display: _vinculoNombre,
    vinculo_email_display: _vinculoEmail,
    rol_id,
    categoria_creacion,
    estudiante_id,
    docente_id,
    personal,
  } = values;

  const base = {
    username: String(username || '').trim(),
    rol_id,
    categoria_creacion,
  };
  if (password != null && String(password).trim() !== '') {
    base.password = password;
  } else if (!isEditMode) {
    base.password = password;
  }

  const out = { ...base };
  if (categoria_creacion === 'ASIGNAR_ESTUDIANTE') {
    out.estudiante_id = estudiante_id != null ? Number(estudiante_id) : undefined;
  }
  if (categoria_creacion === 'ASIGNAR_DOCENTE') {
    out.docente_id = docente_id != null ? Number(docente_id) : undefined;
  }
  if (
    (categoria_creacion === 'PERSONAL_INSTITUCIONAL' || categoria_creacion === 'ACCESO_SISTEMA') &&
    personal &&
    typeof personal === 'object'
  ) {
    const cleaned = personalPayloadFromForm(personal);
    if (cleaned) out.personal = cleaned;
  }
  return out;
}

export function fieldsToValidateOnFinish(categoria) {
  const base = ['categoria_creacion', 'username', 'password', 'password_confirm', 'rol_id'];
  if (categoria === 'ASIGNAR_ESTUDIANTE') base.push('estudiante_id');
  if (categoria === 'ASIGNAR_DOCENTE') base.push('docente_id');
  if (categoria === 'PERSONAL_INSTITUCIONAL' || categoria === 'ACCESO_SISTEMA') {
    base.push(...PERSONAL_FIELD_NAMES);
  }
  return base;
}

export function fieldsToValidateOnFinishEdit(categoria) {
  const base = ['categoria_creacion', 'username', 'rol_id'];
  if (categoria === 'ASIGNAR_ESTUDIANTE') base.push('estudiante_id');
  if (categoria === 'ASIGNAR_DOCENTE') base.push('docente_id');
  if (categoria === 'PERSONAL_INSTITUCIONAL' || categoria === 'ACCESO_SISTEMA') {
    base.push(...PERSONAL_FIELD_NAMES);
  }
  return base;
}

export function perfilFieldNamesForCategory(categoria) {
  if (categoria === 'ASIGNAR_ESTUDIANTE') return ['estudiante_id'];
  if (categoria === 'ASIGNAR_DOCENTE') return ['docente_id'];
  if (categoria === 'PERSONAL_INSTITUCIONAL') {
    return [...PERSONAL_FIELD_NAMES, 'rol_id'];
  }
  if (categoria === 'ACCESO_SISTEMA') {
    return [...PERSONAL_FIELD_NAMES];
  }
  return [];
}

export function getCategoriaResetPatch(categoria, previousCategoria) {
  const patch = { password_confirm: undefined };
  if (categoria === 'ASIGNAR_ESTUDIANTE') {
    patch.docente_id = undefined;
    if (previousCategoria && previousCategoria !== 'ASIGNAR_ESTUDIANTE') {
      patch.vinculo_email_display = undefined;
      patch.vinculo_nombre_display = undefined;
      patch.vinculo_ci_display = undefined;
      patch.vinculo_codigo_display = undefined;
    }
    return patch;
  }

  if (categoria === 'ASIGNAR_DOCENTE') {
    patch.estudiante_id = undefined;
    if (previousCategoria && previousCategoria !== 'ASIGNAR_DOCENTE') {
      patch.vinculo_email_display = undefined;
      patch.vinculo_nombre_display = undefined;
      patch.vinculo_ci_display = undefined;
      patch.vinculo_codigo_display = undefined;
    }
    return patch;
  }

  patch.estudiante_id = undefined;
  patch.docente_id = undefined;
  patch.vinculo_email_display = undefined;
  patch.vinculo_nombre_display = undefined;
  patch.vinculo_ci_display = undefined;
  patch.vinculo_codigo_display = undefined;
  return patch;
}
