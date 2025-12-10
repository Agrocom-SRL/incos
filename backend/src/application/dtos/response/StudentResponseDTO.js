/**
 * DTO: StudentResponseDTO
 * Data Transfer Object para respuestas de estudiantes
 */
export class StudentResponseDTO {
  constructor(student, includeAcademicData = false, includeDocuments = false) {
    this.id = student.id;
    this.codigoEstudiante = student.codigoEstudiante;
    this.nombres = student.nombres;
    this.apellidoPaterno = student.apellidoPaterno;
    this.apellidoMaterno = student.apellidoMaterno;
    this.fullName = student.fullName || `${student.nombres} ${student.apellidoPaterno} ${student.apellidoMaterno || ''}`.trim();
    this.ci = student.ci;
    this.expedicion = student.expedicion;
    this.ciCompleto = `${student.ci}-${student.expedicion}`;
    this.fechaNacimiento = student.fechaNacimiento;
    this.genero = student.genero;
    this.emailPersonal = student.emailPersonal;
    this.celular = student.celular;
    this.telefonoFijo = student.telefonoFijo;
    this.createdAt = student.createdAt;

    if (includeAcademicData && student.academicData) {
      this.academicData = {
        carrera: student.academicData.carrera,
        gestionIngreso: student.academicData.gestionIngreso,
        estadoAcademico: student.academicData.estadoAcademico,
        unidadEducativaProcedencia: student.academicData.unidadEducativaProcedencia,
        anioEgresoSecundaria: student.academicData.anioEgresoSecundaria,
      };
    }

    if (includeDocuments && student.documents) {
      this.documents = student.documents;
    }
  }

  /**
   * Crea un DTO desde una entidad Student
   * @param {Student} student
   * @param {Object} options
   * @returns {StudentResponseDTO}
   */
  static fromEntity(student, options = {}) {
    return new StudentResponseDTO(
      student,
      options.includeAcademicData || false,
      options.includeDocuments || false
    );
  }

  /**
   * Crea un array de DTOs desde un array de entidades
   * @param {Student[]} students
   * @param {Object} options
   * @returns {StudentResponseDTO[]}
   */
  static fromEntities(students, options = {}) {
    return students.map((student) => StudentResponseDTO.fromEntity(student, options));
  }
}
