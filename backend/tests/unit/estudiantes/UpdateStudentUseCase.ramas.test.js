import { describe, it, expect, jest } from '@jest/globals';
import { UpdateStudentUseCase } from '../../../src/application/use-cases/estudiantes/UpdateStudentUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

const plano = (o) => ({ ...o, toPlainObject: () => o });

const repo = () => ({
  findAll: jest.fn().mockResolvedValue({}),
  findBy: jest.fn().mockResolvedValue(null),
  findById: jest.fn().mockResolvedValue(null),
  create: jest.fn(async (d) => ({ id: 100, ...d })),
  update: jest.fn(async (id, d) => ({ id, ...d })),
  delete: jest.fn().mockResolvedValue(true),
});

const crear = (extra = {}) => {
  const deps = {
    studentRepository: {
      ...repo(),
      findById: jest.fn().mockResolvedValue({ id: 5, ci: '111', studentCode: '20250001' }),
      findAll: jest.fn().mockResolvedValue({ students: [] }),
    },
    studentGuardianRepository: repo(),
    studentDisabilityRepository: repo(),
    studentOriginRepository: repo(),
    studentDocumentDeliveryRepository: repo(),
    studentAcademicDataRepository: repo(),
    configuracionSistemaRepository: repo(),
    managementRepository: repo(),
    institutionRepository: repo(),
    transitabilityRepository: repo(),
    transferRepository: repo(),
    documentacionRepository: repo(),
    logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    ...extra,
  };
  return { deps, useCase: new UpdateStudentUseCase(deps) };
};

describe('UpdateStudentUseCase · documentación de traspaso', () => {
  it('devuelve los ids de documentación TRASPASO, tolerando entidades y errores', async () => {
    const { useCase, deps } = crear();
    deps.documentacionRepository.findAll.mockResolvedValue({
      documentations: [{ id: 3 }, plano({ id: '4' }), null, { id: 'x' }, { toPlainObject: () => ({ id: null }) }],
    });
    expect(await useCase._getTraspasoDocumentacionIds()).toEqual([3, 4]);
    deps.documentacionRepository.findAll.mockRejectedValue(new Error('db'));
    expect(await useCase._getTraspasoDocumentacionIds()).toEqual([]);
    expect(deps.logger.warn).toHaveBeenCalled();
    const { useCase: sin } = crear({ documentacionRepository: null });
    expect(await sin._getTraspasoDocumentacionIds()).toEqual([]);
  });
});

describe('UpdateStudentUseCase · transitabilidad', () => {
  const datos = { institucionNombre: 'UE', tipoInstitucion: 'UETHP', carreraOrigen: 'Mecánica', dependencia: 'Fiscal' };

  it('omite el upsert sin repos, sin datos o con datos incompletos', async () => {
    const { useCase, deps } = crear();
    expect(await useCase._createOrUpdateTransitability(null, datos)).toBeNull();
    expect(await useCase._createOrUpdateTransitability({ id: 5 }, { institucionNombre: 'UE' })).toBeNull();
    expect(deps.logger.warn).toHaveBeenCalled();
    const { useCase: sin } = crear({ institutionRepository: null });
    expect(await sin._createOrUpdateTransitability({ id: 5 }, datos)).toBeNull();
  });

  it('crea institución y transitabilidad cuando no existen', async () => {
    const { useCase, deps } = crear();
    const r = await useCase._createOrUpdateTransitability({ id: 5 }, { ...datos, estado: 'APROBADO' });
    expect(deps.institutionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ nombre: 'UE', tipo: 'UETHP', dependencia: 'Fiscal' })
    );
    expect(deps.transitabilityRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ estudianteId: 5, institucionOrigenId: 100, estado: 'APROBADO' })
    );
    expect(r.id).toBe(100);
  });

  it('reutiliza la institución, la actualiza y actualiza la transitabilidad existente', async () => {
    const { useCase, deps } = crear();
    deps.institutionRepository.findBy.mockResolvedValue(plano({ id: 9 }));
    deps.transitabilityRepository.findBy.mockResolvedValue(plano({ id: 33 }));
    await useCase._createOrUpdateTransitability(
      { id: 5 },
      { ...datos, codigoSie: 'S1', departamentoId: 2, distritoEducativo: 'D1' }
    );
    expect(deps.institutionRepository.update).toHaveBeenCalledWith(
      9,
      expect.objectContaining({ dependencia: 'Fiscal', codigoSie: 'S1', departamentoId: 2, distritoEducativo: 'D1' })
    );
    expect(deps.institutionRepository.create).not.toHaveBeenCalled();
    expect(deps.transitabilityRepository.update).toHaveBeenCalledWith(33, expect.objectContaining({ estado: 'SOLICITADO' }));
  });

  it('no actualiza la institución si no hay cambios', async () => {
    const { useCase, deps } = crear();
    deps.institutionRepository.findBy.mockResolvedValue({ id: 9 });
    await useCase._createOrUpdateTransitability({ id: 5 }, { institucionNombre: 'UE', tipoInstitucion: 'CEA', carreraOrigen: 'X' });
    expect(deps.institutionRepository.update).not.toHaveBeenCalled();
  });
});

describe('UpdateStudentUseCase · traspaso', () => {
  const datos = { institucionNombre: 'ITT Sur', carreraOrigen: 'Redes', codigoRude: 'R1' };

  it('omite el upsert si faltan repos o datos mínimos', async () => {
    const { useCase } = crear();
    expect(await useCase._createOrUpdateTransfer(null, datos)).toBeNull();
    expect(await useCase._createOrUpdateTransfer({ id: 5 }, { institucionNombre: 'x' })).toBeNull();
    const { useCase: sin } = crear({ transferRepository: null });
    expect(await sin._createOrUpdateTransfer({ id: 5 }, datos)).toBeNull();
  });

  it('crea institución ITT y traspaso nuevos', async () => {
    const { useCase, deps } = crear();
    await useCase._createOrUpdateTransfer({ id: 5 }, { ...datos, anioCursado: 'PRIMERO' });
    expect(deps.institutionRepository.create).toHaveBeenCalledWith(expect.objectContaining({ tipo: 'ITT' }));
    expect(deps.transferRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ estudianteId: 5, codigoRude: 'R1', anioCursado: 'PRIMERO', estado: 'SOLICITADO' })
    );
  });

  it('actualiza institución y traspaso existentes', async () => {
    const { useCase, deps } = crear();
    deps.institutionRepository.findBy.mockResolvedValue({ id: 9 });
    deps.transferRepository.findBy.mockResolvedValue({ id: 44 });
    await useCase._createOrUpdateTransfer(
      { id: 5 },
      { ...datos, dependencia: 'Privada', departamentoId: 1, distritoEducativo: 'D2' }
    );
    expect(deps.institutionRepository.update).toHaveBeenCalled();
    expect(deps.transferRepository.update).toHaveBeenCalledWith(44, expect.objectContaining({ carreraOrigen: 'Redes' }));
  });
});

describe('UpdateStudentUseCase · correlativo y gestión vigente', () => {
  it('ensureAdmisionCorrelativoForYear crea la clave solo si falta', async () => {
    const { useCase, deps } = crear();
    await useCase.ensureAdmisionCorrelativoForYear(2026);
    expect(deps.configuracionSistemaRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'admision_gestion_2026', value: '0' })
    );
    deps.configuracionSistemaRepository.create.mockClear();
    deps.configuracionSistemaRepository.findBy.mockResolvedValue({ id: 1 });
    await useCase.ensureAdmisionCorrelativoForYear(2026);
    await useCase.ensureAdmisionCorrelativoForYear('2026');
    await useCase.ensureAdmisionCorrelativoForYear(NaN);
    expect(deps.configuracionSistemaRepository.create).not.toHaveBeenCalled();
  });

  it('_getCurrentManagement resuelve la gestión vigente o null', async () => {
    const { useCase, deps } = crear();
    deps.configuracionSistemaRepository.findBy.mockResolvedValue({ value: '2026' });
    deps.managementRepository.findBy.mockResolvedValue({ id: 3 });
    expect(await useCase._getCurrentManagement()).toEqual({ id: 3 });
    expect(deps.managementRepository.findBy).toHaveBeenCalledWith({ year: 2026, vigente: true });

    deps.managementRepository.findBy.mockResolvedValue(undefined);
    expect(await useCase._getCurrentManagement()).toBeNull();
    deps.configuracionSistemaRepository.findBy.mockResolvedValue({ value: 'abc' });
    expect(await useCase._getCurrentManagement()).toBeNull();
    deps.configuracionSistemaRepository.findBy.mockResolvedValue(null);
    expect(await useCase._getCurrentManagement()).toBeNull();
    deps.configuracionSistemaRepository.findBy.mockRejectedValue(new Error('db'));
    expect(await useCase._getCurrentManagement()).toBeNull();
    const { useCase: sin } = crear({ managementRepository: null });
    expect(await sin._getCurrentManagement()).toBeNull();
  });

  it('_resolveGestionAndCarreraForAcademicUpdate: NUEVO usa la vigente y sin carrera', async () => {
    const { useCase, deps } = crear();
    deps.configuracionSistemaRepository.findBy.mockResolvedValue({ value: '2026' });
    deps.managementRepository.findBy.mockResolvedValue(plano({ id: 3 }));
    // Entidad sin id directo: se lee desde toPlainObject
    deps.managementRepository.findBy.mockResolvedValue({ toPlainObject: () => ({ id: 3 }) });
    expect(await useCase._resolveGestionAndCarreraForAcademicUpdate({ tipoAdmision: 'NUEVO', carreraId: 4 }, 5)).toEqual({
      tipoAdmision: 'NUEVO',
      isNuevo: true,
      gestionIngresoId: 3,
      carreraId: null,
    });
  });

  it('NUEVO sin gestión vigente avisa; ANTIGUO normaliza ids numéricos, texto y vacíos', async () => {
    const { useCase, deps } = crear({ managementRepository: null });
    const r = await useCase._resolveGestionAndCarreraForAcademicUpdate({ tipoAdmision: 'NUEVO' }, 5);
    expect(r.gestionIngresoId).toBeNull();
    expect(deps.logger.warn).toHaveBeenCalled();
    expect(
      await useCase._resolveGestionAndCarreraForAcademicUpdate({ tipoAdmision: 'ANTIGUO', gestionIngresoId: '7', carreraId: 2 }, 5)
    ).toMatchObject({ gestionIngresoId: 7, carreraId: 2 });
    expect(
      await useCase._resolveGestionAndCarreraForAcademicUpdate({ tipoAdmision: 'ANTIGUO', gestionIngresoId: 8, carreraId: '3' }, 5)
    ).toMatchObject({ gestionIngresoId: 8, carreraId: 3 });
    expect(
      await useCase._resolveGestionAndCarreraForAcademicUpdate({ tipoAdmision: 'ANTIGUO', gestionIngresoId: '', carreraId: '' }, 5)
    ).toMatchObject({ gestionIngresoId: null, carreraId: null });
  });
});

describe('UpdateStudentUseCase · tipo de admisión', () => {
  it('elimina transitabilidad y traspaso cuando el tipo final no corresponde', async () => {
    const { useCase, deps } = crear();
    deps.transitabilityRepository.findBy.mockResolvedValue(plano({ id: 1 }));
    deps.transferRepository.findBy.mockResolvedValue({ id: 2 });
    await useCase._removeTransitabilidadAndTraspasoIfNotApplicable(5, { tipoAdmision: 'NUEVO' }, 'NUEVO');
    expect(deps.transitabilityRepository.delete).toHaveBeenCalledWith(1);
    expect(deps.transferRepository.delete).toHaveBeenCalledWith(2);
  });

  it('conserva el registro que corresponde al tipo y no hace nada sin tipoAdmision', async () => {
    const { useCase, deps } = crear();
    deps.transitabilityRepository.findBy.mockResolvedValue({ id: 1 });
    deps.transferRepository.findBy.mockResolvedValue({ id: 2 });
    await useCase._removeTransitabilidadAndTraspasoIfNotApplicable(5, {}, 'NUEVO');
    await useCase._removeTransitabilidadAndTraspasoIfNotApplicable(5, { tipoAdmision: 'TRASPASO' }, 'TRASPASO');
    expect(deps.transferRepository.delete).not.toHaveBeenCalled();
    expect(deps.transitabilityRepository.delete).toHaveBeenCalledTimes(1);
    deps.transitabilityRepository.delete.mockClear();
    await useCase._removeTransitabilidadAndTraspasoIfNotApplicable(5, { tipoAdmision: 'TRANSITABILIDAD' }, 'TRANSITABILIDAD');
    expect(deps.transitabilityRepository.delete).not.toHaveBeenCalled();
  });

  it('un fallo al eliminar no bloquea (solo avisa)', async () => {
    const { useCase, deps } = crear();
    deps.transitabilityRepository.findBy.mockRejectedValue(new Error('x'));
    deps.transferRepository.findBy.mockRejectedValue(new Error('y'));
    await expect(
      useCase._removeTransitabilidadAndTraspasoIfNotApplicable(5, { tipoAdmision: 'NUEVO' }, 'NUEVO')
    ).resolves.toBeUndefined();
    expect(deps.logger.warn).toHaveBeenCalledTimes(2);
  });

  it('_shouldUpdateStudentCode cubre cambio de tipo, de gestión y primera creación', () => {
    const { useCase } = crear();
    const existente = {};
    expect(useCase._shouldUpdateStudentCode(existente, { tipoAdmision: 'ANTIGUO' }, 'ANTIGUO', 1, 'NUEVO', 1)).toBe(true);
    expect(useCase._shouldUpdateStudentCode(existente, { gestionIngresoId: 2 }, 'ANTIGUO', 2, 'ANTIGUO', 1)).toBe(true);
    expect(useCase._shouldUpdateStudentCode(existente, { tipoAdmision: 'ANTIGUO' }, 'ANTIGUO', 2, 'ANTIGUO', 1)).toBe(true);
    expect(useCase._shouldUpdateStudentCode(existente, { carreraId: 2 }, 'ANTIGUO', 1, 'ANTIGUO', 1)).toBe(false);
    expect(useCase._shouldUpdateStudentCode(null, {}, 'NUEVO', 3, null, null)).toBe(true);
    expect(useCase._shouldUpdateStudentCode(null, {}, 'NUEVO', null, null, null)).toBe(false);
  });

  it('_updateStudentCodeForNewManagement guarda el nuevo código', async () => {
    const { useCase, deps } = crear();
    jest.spyOn(useCase, 'generateStudentCode').mockResolvedValue('20260009');
    await useCase._updateStudentCodeForNewManagement(5, 3, { studentCode: '20250001' }, { admissionType: 'NUEVO' }, 'ANTIGUO', 3);
    expect(deps.studentRepository.update).toHaveBeenCalledWith(5, { studentCode: '20260009' });
  });

  it('_ensureAdmisionCorrelativoForGestionIfNeeded resuelve el año o avisa del fallo', async () => {
    const { useCase, deps } = crear();
    await useCase._ensureAdmisionCorrelativoForGestionIfNeeded(null);
    expect(deps.managementRepository.findById).not.toHaveBeenCalled();
    deps.managementRepository.findById.mockResolvedValue(plano({ year: 2024 }));
    await useCase._ensureAdmisionCorrelativoForGestionIfNeeded(3);
    expect(deps.configuracionSistemaRepository.create).toHaveBeenCalledWith(expect.objectContaining({ key: 'admision_gestion_2024' }));
    deps.managementRepository.findById.mockRejectedValue(new Error('db'));
    await useCase._ensureAdmisionCorrelativoForGestionIfNeeded(3);
    expect(deps.logger.warn).toHaveBeenCalled();
  });
});

describe('UpdateStudentUseCase · datos académicos y código', () => {
  it('actualiza datos académicos existentes según el tipo', async () => {
    const { useCase, deps } = crear();
    await useCase._updateOrCreateAcademicData(5, { tipoAdmision: 'NUEVO' }, plano({ id: 8 }), 'NUEVO', 3, null);
    expect(deps.studentAcademicDataRepository.update).toHaveBeenCalledWith(8, {
      admissionType: 'NUEVO',
      managementId: 3,
      careerId: null,
    });
    deps.studentAcademicDataRepository.update.mockClear();
    await useCase._updateOrCreateAcademicData(5, { gestionIngresoId: 2, carreraId: 4 }, { id: 8 }, 'ANTIGUO', 2, 4);
    expect(deps.studentAcademicDataRepository.update).toHaveBeenCalledWith(8, { managementId: 2, careerId: 4 });
    deps.studentAcademicDataRepository.update.mockClear();
    await useCase._updateOrCreateAcademicData(5, {}, { id: 8 }, 'ANTIGUO', null, null);
    expect(deps.studentAcademicDataRepository.update).not.toHaveBeenCalled();
  });

  it('crea datos académicos si no existían (NUEVO por defecto)', async () => {
    const { useCase, deps } = crear();
    await useCase._updateOrCreateAcademicData(5, {}, null, 'NUEVO', 3, null);
    expect(deps.studentAcademicDataRepository.create).toHaveBeenCalledWith({
      studentId: 5,
      managementId: 3,
      careerId: null,
      admissionType: 'NUEVO',
    });
  });

  describe('generateStudentCode', () => {
    it('sin configuración o sin gestión lanza errores claros', async () => {
      const { useCase } = crear({ configuracionSistemaRepository: null });
      await expect(useCase.generateStudentCode()).rejects.toThrow('configuracionSistemaRepository');
      const { useCase: sinMgmt } = crear({ managementRepository: null });
      await expect(sinMgmt.generateStudentCode(3)).rejects.toThrow('managementRepository');
    });

    it('gestión inexistente o sin año', async () => {
      const { useCase, deps } = crear();
      await expect(useCase.generateStudentCode(3)).rejects.toBeInstanceOf(NotFoundError);
      deps.managementRepository.findById.mockResolvedValue({ id: 3 });
      await expect(useCase.generateStudentCode(3)).rejects.toThrow('no tiene año definido');
    });

    it('con gestión de ingreso arma YYYYNNNN y avanza el correlativo', async () => {
      const { useCase, deps } = crear();
      deps.managementRepository.findById.mockResolvedValue(plano({ year: 2024, code: 'G24' }));
      deps.configuracionSistemaRepository.findBy
        .mockResolvedValueOnce({ id: 1, value: '0' }) // ensure: ya existe
        .mockResolvedValueOnce({ id: 1, value: '41' });
      expect(await useCase.generateStudentCode(3)).toBe('20240042');
      expect(deps.configuracionSistemaRepository.update).toHaveBeenCalledWith(1, { value: '42' });
    });

    it('sin gestión usa la actual; valida configuración y correlativo', async () => {
      const { useCase, deps } = crear();
      await expect(useCase.generateStudentCode()).rejects.toThrow('No se encontró la configuración de gestión actual');
      deps.configuracionSistemaRepository.findBy.mockResolvedValueOnce({ value: 'zz' });
      await expect(useCase.generateStudentCode()).rejects.toThrow('no es un año válido');
      deps.configuracionSistemaRepository.findBy
        .mockResolvedValueOnce({ value: '2026' }) // gestion_actual
        .mockResolvedValueOnce(null) // ensure: no existe -> crea
        .mockResolvedValueOnce(null); // tras asegurarlo sigue sin existir
      await expect(useCase.generateStudentCode()).rejects.toThrow('No se pudo obtener el correlativo');
      deps.configuracionSistemaRepository.findBy
        .mockResolvedValueOnce({ value: '2026' })
        .mockResolvedValueOnce({ id: 2, value: '0' })
        .mockResolvedValueOnce({ id: 2, value: '0' });
      expect(await useCase.generateStudentCode()).toBe('20260001');
    });
  });
});

describe('UpdateStudentUseCase · execute', () => {
  it('actualiza orígenes existentes, crea nuevos y borra los omitidos', async () => {
    const { useCase, deps } = crear();
    deps.studentOriginRepository.findAll.mockResolvedValue({ studentOrigins: [plano({ id: 1 }), { id: 2 }] });
    const r = await useCase.execute(5, {
      origins: [{ id: '1', originType: 'BOLIVIANA', countryId: 1 }, { originType: 'EXTRANJERA' }, { id: 'zz' }],
    });
    expect(deps.studentOriginRepository.update).toHaveBeenCalledWith(1, expect.objectContaining({ countryId: 1, isPrincipal: true }));
    expect(deps.studentOriginRepository.create).toHaveBeenCalledTimes(2);
    expect(deps.studentOriginRepository.delete).toHaveBeenCalledWith(2);
    expect(r.origins).toHaveLength(3);
  });

  it('discapacidades: reemplazo completo', async () => {
    const { useCase, deps } = crear();
    deps.studentDisabilityRepository.findAll.mockResolvedValue({ studentDisabilities: [plano({ id: 4 })] });
    const r = await useCase.execute(5, { disabilities: [{ tipo: 'A' }] });
    expect(deps.studentDisabilityRepository.delete).toHaveBeenCalledWith(4);
    expect(deps.studentDisabilityRepository.create).toHaveBeenCalledWith({ tipo: 'A', studentId: 5 });
    expect(r.disabilities).toHaveLength(1);
  });

  describe('documentación', () => {
    const preparar = (tipo = null) => {
      const ctx = crear();
      ctx.deps.documentacionRepository.findAll.mockResolvedValue({ documentations: [{ id: 9 }] });
      ctx.deps.studentDocumentDeliveryRepository.findAll.mockResolvedValue({
        studentDocumentDeliveries: [
          plano({ id: 1, documentacionId: 2 }),
          plano({ id: 5, documentacionId: 2 }),
          plano({ id: 3, documentacionId: 3 }),
        ],
      });
      ctx.deps.studentAcademicDataRepository.findAll.mockResolvedValue({
        studentAcademicData: tipo ? [plano({ admissionType: tipo })] : [],
      });
      return ctx;
    };

    it('actualiza la última entrega, crea las nuevas y omite las de traspaso si no aplica', async () => {
      const { useCase, deps } = preparar('ANTIGUO');
      const r = await useCase.execute(5, {
        documentation: {
          doc_2: { entregado: true, observaciones: 'x' },
          doc_7: { enTramite: true, observaciones: 'falta' },
          doc_9: { entregado: true },
          doc_x: { entregado: true },
          doc_8: null,
        },
      });
      expect(deps.studentDocumentDeliveryRepository.update).toHaveBeenCalledWith(5, {
        entregado: true,
        enTramite: false,
        fechaEntrega: null,
        observaciones: null,
      });
      expect(deps.studentDocumentDeliveryRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ studentId: 5, documentacionId: 7, observaciones: 'falta', enTramite: true })
      );
      expect(deps.studentDocumentDeliveryRepository.create).toHaveBeenCalledTimes(1);
      expect(r.documentDeliveries).toHaveLength(2);
    });

    it('con tipo TRASPASO (tomado de datos académicos) sí procesa documentos de traspaso', async () => {
      const { useCase, deps } = preparar('TRASPASO');
      await useCase.execute(5, { documentation: { doc_9: { entregado: false } } });
      expect(deps.studentDocumentDeliveryRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ documentacionId: 9 })
      );
    });

    it('ignora documentos duplicados en el mismo request', async () => {
      const { useCase, deps } = preparar('TRASPASO');
      await useCase.execute(5, { documentation: { doc_7: {}, doc_7x: {} }, tipoAdmision: undefined });
      expect(deps.logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Documento duplicado'),
        expect.any(Object)
      );
    });

    it('documentation null limpia sin crear entregas', async () => {
      const { useCase, deps } = preparar();
      const r = await useCase.execute(5, { documentation: null });
      expect(deps.studentDocumentDeliveryRepository.create).not.toHaveBeenCalled();
      expect(r.documentDeliveries).toEqual([]);
    });
  });

  it('transitabilidad/traspaso: un error es no bloqueante', async () => {
    const { useCase, deps } = crear();
    jest.spyOn(useCase, '_createOrUpdateTransitability').mockRejectedValue(new Error('x'));
    await expect(useCase.execute(5, { transitability: {}, transfer: {} })).resolves.toBeDefined();
    expect(deps.logger.error).toHaveBeenCalled();
    const { useCase: otro } = crear();
    const t = jest.spyOn(otro, '_createOrUpdateTransitability').mockResolvedValue(null);
    const f = jest.spyOn(otro, '_createOrUpdateTransfer').mockResolvedValue(null);
    await otro.execute(5, { transitability: { a: 1 }, transfer: { b: 1 } });
    expect(t).toHaveBeenCalled();
    expect(f).toHaveBeenCalled();
  });

  it('cambio de tipo de admisión: regenera el código, asegura correlativo y persiste datos académicos', async () => {
    const { useCase, deps } = crear();
    deps.studentAcademicDataRepository.findAll.mockResolvedValue({
      studentAcademicData: [plano({ id: 8, admissionType: 'NUEVO', managementId: 1 })],
    });
    deps.managementRepository.findById.mockResolvedValue(plano({ year: 2024 }));
    jest.spyOn(useCase, 'generateStudentCode').mockResolvedValue('20240003');
    deps.studentRepository.findById
      .mockResolvedValueOnce({ id: 5, studentCode: '20250001' })
      .mockResolvedValueOnce({ id: 5, studentCode: '20240003' });
    const r = await useCase.execute(5, { tipoAdmision: 'ANTIGUO', gestionIngresoId: 2, carreraId: 4 });
    expect(deps.studentRepository.update).toHaveBeenCalledWith(5, { studentCode: '20240003' });
    expect(deps.studentAcademicDataRepository.update).toHaveBeenCalledWith(8, {
      admissionType: 'ANTIGUO',
      managementId: 2,
      careerId: 4,
    });
    expect(r.student.studentCode).toBe('20240003');
  });

  it('si falla la regeneración del código, el error se propaga con contexto', async () => {
    const { useCase, deps } = crear();
    jest.spyOn(useCase, 'generateStudentCode').mockRejectedValue(new Error('sin correlativo'));
    await expect(useCase.execute(5, { tipoAdmision: 'ANTIGUO', gestionIngresoId: 2 })).rejects.toThrow(
      'No se pudo actualizar el código del estudiante: sin correlativo'
    );
    expect(deps.logger.error).toHaveBeenCalled();
  });
});
