import { describe, it, expect } from 'vitest';
import {
  ROLES_POR_CATEGORIA,
  categoriaDesdeUsuario,
  ciCredencialPorDefecto,
  getCreatePageInitialValues,
  getEditPageInitialValues,
  errMsg,
  loadRolesErrorMessage,
  buildCreatePayload,
  fieldsToValidateOnFinish,
  fieldsToValidateOnFinishEdit,
  perfilFieldNamesForCategory,
  getCategoriaResetPatch,
} from '../useSeguridadUsuarioCreatePage.helpers';

describe('categorías de usuario', () => {
  it('deduce la categoría desde el tipo de referencia', () => {
    expect(categoriaDesdeUsuario({ tipo_referencia: 'ESTUDIANTE' })).toBe('ASIGNAR_ESTUDIANTE');
    expect(categoriaDesdeUsuario({ tipo_referencia: 'DOCENTE' })).toBe('ASIGNAR_DOCENTE');
    for (const t of ['RECTOR', 'DIRECTOR', 'SECRETARIA']) {
      expect(categoriaDesdeUsuario({ tipo_referencia: t })).toBe('PERSONAL_INSTITUCIONAL');
    }
    expect(categoriaDesdeUsuario(null)).toBe('ACCESO_SISTEMA');
    expect(ROLES_POR_CATEGORIA.ASIGNAR_DOCENTE).toEqual(['DOCENTE']);
  });
  it('usa el CI como credencial solo si tiene 4+ dígitos', () => {
    expect(ciCredencialPorDefecto('12-345 LP')).toBe('12345');
    expect(ciCredencialPorDefecto('12')).toBeUndefined();
    expect(ciCredencialPorDefecto(null)).toBeUndefined();
  });
});

describe('valores iniciales', () => {
  it('creación base y con precarga de docente o estudiante', () => {
    expect(getCreatePageInitialValues()).toEqual({ categoria_creacion: 'ACCESO_SISTEMA' });
    const d = getCreatePageInitialValues({ prefillDocenteUsuario: { docenteId: 3, ci: '123456', nombreCompleto: 'Ana', emailPersonal: 'a@x', ciCompleto: '123456 LP' } });
    expect(d).toMatchObject({ categoria_creacion: 'ASIGNAR_DOCENTE', docente_id: 3, username: '123456', password: '123456', vinculo_nombre_display: 'Ana' });
    const e = getCreatePageInitialValues({ prefillEstudianteUsuario: { estudianteId: 4, ciCompleto: '7654321 CB', codigo: 'E1' } });
    expect(e).toMatchObject({ categoria_creacion: 'ASIGNAR_ESTUDIANTE', estudiante_id: 4, username: '7654321', vinculo_codigo_display: 'E1' });
    expect(getCreatePageInitialValues({ prefillDocenteUsuario: { docenteId: 0 } })).toEqual({ categoria_creacion: 'ACCESO_SISTEMA' });
  });
  it('edición por categoría', () => {
    const lineas = [{ etiqueta: 'ci', valor: '123' }, { etiqueta: 'Email personal', valor: 'a@b' }, { etiqueta: 'Código estudiante', valor: 'E9' }];
    const est = getEditPageInitialValues({ tipo_referencia: 'ESTUDIANTE', referencia_id: 5, username: 'u', rol: { id: 2 }, vinculo_perfil: { nombre_completo: 'N', lineas } });
    expect(est).toMatchObject({ categoria_creacion: 'ASIGNAR_ESTUDIANTE', estudiante_id: 5, rol_id: 2, vinculo_ci_display: '123', vinculo_email_display: 'a@b', vinculo_codigo_display: 'E9' });
    const doc = getEditPageInitialValues({ tipo_referencia: 'DOCENTE', referencia_id: 6 });
    expect(doc.docente_id).toBe(6);
    const pers = getEditPageInitialValues({ personal: { ci: '1', firstName: 'A' } });
    expect(pers.personal).toMatchObject({ ci: '1', firstName: 'A', phone: undefined });
    expect(getEditPageInitialValues(null).categoria_creacion).toBe('ACCESO_SISTEMA');
  });
});

describe('mensajes de error', () => {
  it('errMsg y loadRolesErrorMessage', () => {
    expect(errMsg({ error: { details: [{ message: 'a' }, { message: 'b' }] } })).toBe('a. b');
    expect(errMsg({ error: 'texto' })).toBe('texto');
    expect(errMsg({ error: { message: 'm' } })).toBe('m');
    expect(errMsg(null)).toBe('Error');
    const net = new TypeError('Failed to fetch');
    expect(loadRolesErrorMessage(net)).toMatch(/No se pudo conectar con el API/);
    expect(loadRolesErrorMessage({ error: 'x' })).toBe('x');
  });
});

describe('buildCreatePayload', () => {
  it('limpia campos de UI y normaliza el vínculo', () => {
    const p = buildCreatePayload({ username: ' u ', password: 'p', password_confirm: 'p', vinculo_nombre_display: 'x', rol_id: 1, categoria_creacion: 'ASIGNAR_DOCENTE', docente_id: '8' });
    expect(p).toEqual({ username: 'u', password: 'p', rol_id: 1, categoria_creacion: 'ASIGNAR_DOCENTE', docente_id: 8 });
    expect(buildCreatePayload({ categoria_creacion: 'ASIGNAR_ESTUDIANTE', estudiante_id: '2' }).estudiante_id).toBe(2);
  });
  it('en edición omite la contraseña vacía', () => {
    expect(buildCreatePayload({ username: 'u', password: '  ' }, { isEditMode: true })).not.toHaveProperty('password');
    expect(buildCreatePayload({ username: 'u', password: '' })).toHaveProperty('password');
  });
  it('normaliza la fecha de nacimiento y limpia vacíos', () => {
    const base = { categoria_creacion: 'ACCESO_SISTEMA' };
    const conDayjs = buildCreatePayload({ ...base, personal: { birthDate: { format: () => '2000-01-02' }, departamentoId: 1, provinciaId: 2, phone: '' } });
    expect(conDayjs.personal).toEqual({ birthDate: '2000-01-02' });
    expect(buildCreatePayload({ ...base, personal: { birthDate: '05-03-1999' } }).personal.birthDate).toBe('1999-03-05');
    expect(buildCreatePayload({ ...base, personal: { birthDate: new Date(Date.UTC(2001, 0, 5)) } }).personal.birthDate).toBe('2001-01-05');
    expect(buildCreatePayload({ ...base, personal: { phone: '' } })).not.toHaveProperty('personal');
    expect(buildCreatePayload({ ...base, personal: 'x' })).not.toHaveProperty('personal');
  });
});

describe('campos a validar y reseteo', () => {
  it('campos de validación por categoría', () => {
    expect(fieldsToValidateOnFinish('ASIGNAR_ESTUDIANTE')).toContain('estudiante_id');
    expect(fieldsToValidateOnFinish('ASIGNAR_DOCENTE')).toContain('docente_id');
    expect(fieldsToValidateOnFinish('ACCESO_SISTEMA')).toContainEqual(['personal', 'ci']);
    expect(fieldsToValidateOnFinishEdit('ASIGNAR_ESTUDIANTE')).not.toContain('password');
    expect(fieldsToValidateOnFinishEdit('ASIGNAR_DOCENTE')).toContain('docente_id');
    expect(fieldsToValidateOnFinishEdit('PERSONAL_INSTITUCIONAL')).toContainEqual(['personal', 'lastName']);
    expect(perfilFieldNamesForCategory('ASIGNAR_ESTUDIANTE')).toEqual(['estudiante_id']);
    expect(perfilFieldNamesForCategory('ASIGNAR_DOCENTE')).toEqual(['docente_id']);
    expect(perfilFieldNamesForCategory('PERSONAL_INSTITUCIONAL')).toContain('rol_id');
    expect(perfilFieldNamesForCategory('ACCESO_SISTEMA')).not.toContain('rol_id');
    expect(perfilFieldNamesForCategory('otra')).toEqual([]);
  });
  it('parche de reseteo al cambiar de categoría', () => {
    expect(getCategoriaResetPatch('ASIGNAR_ESTUDIANTE', 'ASIGNAR_DOCENTE')).toHaveProperty('vinculo_nombre_display', undefined);
    expect(getCategoriaResetPatch('ASIGNAR_ESTUDIANTE', 'ASIGNAR_ESTUDIANTE')).not.toHaveProperty('vinculo_nombre_display');
    expect(getCategoriaResetPatch('ASIGNAR_DOCENTE', 'ACCESO_SISTEMA')).toHaveProperty('estudiante_id', undefined);
    expect(getCategoriaResetPatch('ASIGNAR_DOCENTE', 'ASIGNAR_DOCENTE')).not.toHaveProperty('vinculo_ci_display');
    const otra = getCategoriaResetPatch('ACCESO_SISTEMA');
    expect(Object.keys(otra)).toEqual(expect.arrayContaining(['docente_id', 'estudiante_id', 'vinculo_codigo_display']));
  });
});
