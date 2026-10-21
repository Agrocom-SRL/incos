import { StudentScholarshipMapper } from '../../../src/infrastructure/mappers/StudentScholarshipMapper.js';
import { StudentScholarship } from '../../../src/domain/entities/StudentScholarship.js';
import {
  entityToPresentation,
  entitiesToPresentation,
} from '../../../src/application/mappers/estudiantes/StudentScholarshipMapper.js';

describe('StudentScholarshipMapper (infraestructura)', () => {
  const modelo = {
    id: 4,
    activo: true,
    estudianteId: 5,
    becaDescuentoId: 2,
    gestionId: 3,
    fechaSolicitud: '2026-02-01',
    estado: 'ACTIVA',
    documentosCompletos: 1,
    fechaInicioEntregaDocumentos: '2026-02-02',
    fechaFinEntregaDocumentos: '2026-02-20',
    observaciones: 'ok',
  };

  it('toEntity devuelve null sin modelo', () => {
    expect(StudentScholarshipMapper.toEntity(null)).toBeNull();
  });

  it('toEntity convierte columnas a campos de dominio', () => {
    const entity = StudentScholarshipMapper.toEntity(modelo);
    expect(entity).toBeInstanceOf(StudentScholarship);
    expect(entity).toMatchObject({
      id: 4,
      studentId: 5,
      scholarshipId: 2,
      managementId: 3,
      requestDate: '2026-02-01',
      state: 'ACTIVA',
      documentsComplete: true,
      documentDeliveryStartDate: '2026-02-02',
      documentDeliveryEndDate: '2026-02-20',
      observations: 'ok',
    });
  });

  it('documentosCompletos 0 se convierte en false', () => {
    expect(StudentScholarshipMapper.toEntity({ ...modelo, documentosCompletos: 0 }).documentsComplete).toBe(false);
  });

  it('toModel solo incluye los campos presentes y normaliza vacíos', () => {
    expect(StudentScholarshipMapper.toModel({
      studentId: 5,
scholarshipId: 2,
managementId: 3,
state: 'PENDIENTE',
observations: '',
      documentDeliveryStartDate: '',
    })).toEqual({
      estudianteId: 5,
      becaDescuentoId: 2,
      gestionId: 3,
      estado: 'PENDIENTE',
      fechaInicioEntregaDocumentos: null,
      observaciones: null,
    });
  });

  it('toModelForUpdate incluye activo y solo lo enviado', () => {
    expect(StudentScholarshipMapper.toModelForUpdate({ state: 'ANULADA', documentsComplete: false, active: false }))
      .toEqual({ estado: 'ANULADA', documentosCompletos: false, activo: false });
    expect(StudentScholarshipMapper.toModelForUpdate({})).toEqual({});
  });

  it('toEntityList filtra nulos', () => {
    expect(StudentScholarshipMapper.toEntityList([modelo, null])).toHaveLength(1);
    expect(StudentScholarshipMapper.toEntityList(null)).toEqual([]);
  });

  describe('mapper de aplicación (presentación)', () => {
    it('entityToPresentation devuelve null sin entrada', () => {
      expect(entityToPresentation(null)).toBeNull();
    });

    it('entityToPresentation expone los campos de dominio con claves en español', () => {
      const entity = StudentScholarshipMapper.toEntity(modelo);
      expect(entityToPresentation(entity)).toEqual({
        id: 4,
        activo: true,
        estudianteId: 5,
        becaDescuentoId: 2,
        gestionId: 3,
        fechaSolicitud: '2026-02-01',
        estado: 'ACTIVA',
        documentosCompletos: true,
        fechaInicioEntregaDocumentos: '2026-02-02',
        fechaFinEntregaDocumentos: '2026-02-20',
        observaciones: 'ok',
      });
    });

    it('entitiesToPresentation tolera entradas no array', () => {
      expect(entitiesToPresentation(undefined)).toEqual([]);
    });
  });
});
