/**
 * PasantiaInformePdfGenerator (módulo TUT · pasantías)
 *
 * Genera los dos informes formales de la práctica laboral a partir de la
 * plantilla institucional (Plantilla.pdf) con pdf-lib, replicando los
 * formularios reales del instituto (un generador, dos modos por `tipo`):
 * - VERIFICACION_EMPRESA: "INFORME DE VERIFICACIÓN DE LA EMPRESA Y DE SU
 *   ACTIVIDAD PARA REALIZAR LA PASANTÍA LABORAL".
 * - CONVALIDACION_TRABAJO: "INFORME DE CONVALIDACIÓN DE CERTIFICADO DE
 *   TRABAJO".
 *
 * Estructura común de ambos documentos (formato real):
 * A / VIA / DE / REF / FECHA / ANTECEDENTES / RESULTADOS / CONCLUSIONES /
 * FIRMA DOCENTE. Nombres de persona en orden institucional
 * APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES (la vista 168 ya los arma).
 *
 * Patrón ViabilidadProyectoPdfGenerator: extiende IncosPDFLibBase, retorna
 * Buffer (el use case lo guarda vía uploadsStorage).
 *
 * @implements {IPasantiaInformePdfGenerator}
 */

import { IncosPDFLibBase } from '../IncosPDFLibBase.js';
import { TIPOS_INFORME_PASANTIA, RESULTADOS_INFORME_PASANTIA } from '../../../../domain/constants/pasantias.constants.js';

const TITULOS = {
  [TIPOS_INFORME_PASANTIA.VERIFICACION_EMPRESA]:
    'INFORME DE VERIFICACIÓN DE LA EMPRESA Y DE SU ACTIVIDAD PARA REALIZAR LA PASANTÍA LABORAL',
  [TIPOS_INFORME_PASANTIA.CONVALIDACION_TRABAJO]:
    'INFORME DE CONVALIDACIÓN DE CERTIFICADO DE TRABAJO',
};

const REFERENCIAS = {
  [TIPOS_INFORME_PASANTIA.VERIFICACION_EMPRESA]:
    'INFORME DE VERIFICACIÓN DE LA EMPRESA Y DE SU ACTIVIDAD PARA LA PASANTÍA LABORAL.',
  [TIPOS_INFORME_PASANTIA.CONVALIDACION_TRABAJO]:
    'INFORME DE CONVALIDACIÓN DE TRABAJO POR PASANTÍA LABORAL.',
};

export class PasantiaInformePdfGenerator extends IncosPDFLibBase {
  /**
   * @param {Object} params
   * @param {ILogger} [params.logger]
   */
  constructor({ logger } = {}) {
    super({ logger });
  }

  /**
   * @param {Object} options - Ver IPasantiaInformePdfGenerator.generate
   * @returns {Promise<Buffer>}
   */
  async generate(options = {}) {
    try {
      const { tipo } = options;
      const pdfDoc = await this._loadTemplate('Plantilla.pdf');
      const firstPage = pdfDoc.getPages()[0];
      this._initializeDocumentState(pdfDoc, firstPage, true);

      await this._addDocumentTitle(
        tipo === TIPOS_INFORME_PASANTIA.CONVALIDACION_TRABAJO
          ? 'INFORME DE CONVALIDACIÓN'
          : 'INFORME DE VERIFICACIÓN'
      );
      await this._addSubtitle(TITULOS[tipo] ?? 'INFORME DE PASANTÍA LABORAL');
      this._addSpace();

      await this._buildEncabezadoMemo(options);
      await this._buildAntecedentes(options);
      await this._buildResultados(options);
      await this._buildConclusiones(options);

      const pdfBuffer = await this._saveDocument(pdfDoc);
      this.logger?.info('[PasantiaInformePdfGenerator] PDF generado (buffer)', {
        tipo,
        size: pdfBuffer.length,
      });
      return pdfBuffer;
    } catch (error) {
      this.logger?.error('[PasantiaInformePdfGenerator] Error al generar PDF', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Bloque A / VIA / DE / REF / FECHA del formato real.
   * @private
   */
  async _buildEncabezadoMemo(options) {
    const informe = options.informe || {};
    const docenteNombre =
      options.docenteNombre || options.pasantia?.docenteSupervisorNombre || '';

    await this._addLabelValue('A:', informe.destinatario || 'Rectorado, vía Dirección Académica');
    await this._addLabelValue('VIA:', 'Dirección Académica — Instituto Técnico INCOS Santa Cruz');
    await this._addLabelValue('DE:', `${docenteNombre} — Docente Instituto Técnico INCOS Santa Cruz`);
    await this._addLabelValue('REF.:', REFERENCIAS[options.tipo] ?? '');
    if (informe.fechaEmision) {
      await this._addLabelValue('FECHA:', `Santa Cruz, ${informe.fechaEmision}`);
    }
    this._addSpace();
  }

  /**
   * ANTECEDENTES: texto normativo fijo del formulario (R.M. 487/2023).
   * @private
   */
  async _buildAntecedentes(options) {
    await this._addSection('ANTECEDENTES');
    if (options.tipo === TIPOS_INFORME_PASANTIA.CONVALIDACION_TRABAJO) {
      await this._addParagraph(
        'Mediante el presente informe se hace conocer a las autoridades del Instituto ' +
          'Técnico INCOS Santa Cruz, sobre la supervisión realizada para la ' +
          '"Convalidación de Actividades Laborales para la Práctica Laboral", tal como ' +
          'se encuentra enmarcado en la Resolución Ministerial No. 487/2023, donde se ' +
          'establece el reconocimiento de la actividad laboral para su valoración de ' +
          'Dirección Académica bajo informes de supervisión.'
      );
    } else {
      await this._addParagraph(
        'Mediante el presente informe se hace conocer a las autoridades del Instituto ' +
          'Técnico INCOS Santa Cruz, sobre la verificación realizada a la empresa, para ' +
          'que el estudiante realice sus prácticas laborales, tal como exige la ' +
          'Resolución Ministerial No. 487/2023, donde se establece que el estudiante ' +
          'tiene que realizar práctica laboral de 300 a 360 horas laborales para su ' +
          'valoración de Dirección Académica bajo informes de supervisión; para ello la ' +
          'empresa tiene que estar legalmente constituida.'
      );
    }
    this._addSpace();
  }

  /**
   * RESULTADOS: datos de la verificación (pasantía) o de la supervisión de la
   * actividad laboral (convalidación).
   * @private
   */
  async _buildResultados(options) {
    const pasantia = options.pasantia || {};
    const informe = options.informe || {};

    if (options.tipo === TIPOS_INFORME_PASANTIA.CONVALIDACION_TRABAJO) {
      await this._addSection('RESULTADOS DE LA SUPERVISIÓN DE LA ACTIVIDAD LABORAL DEL ESTUDIANTE');
      await this._addLabelValue('Empresa/Institución:', pasantia.empresaNombre || '');
      if (pasantia.empresaTipoSocietario) {
        await this._addLabelValue('Constituida como:', pasantia.empresaTipoSocietario);
      }
      await this._buildDatosEmpresa(pasantia);
      this._addSpace();
      await this._addLabelValue('Estudiante:', pasantia.estudianteNombre || '');
      if (pasantia.carreraNombre) {
        await this._addLabelValue('Carrera (3er año):', pasantia.carreraNombre);
      }
      if (pasantia.cargoPuesto) {
        const desde = pasantia.fechaInicio ? ` desde el ${pasantia.fechaInicio} hasta la presente fecha` : '';
        await this._addLabelValue('Cargo que desempeña:', `${pasantia.cargoPuesto}${desde}`);
      }
      if (pasantia.funciones) {
        await this._addBulletPoint(`Entre sus funciones primordiales realiza: ${pasantia.funciones}`);
      }
      if (pasantia.tipoContrato) {
        const area = pasantia.areaDepartamento ? ` y es del área ${pasantia.areaDepartamento}` : '';
        await this._addBulletPoint(
          `En la empresa cuenta con un contrato laboral ${String(pasantia.tipoContrato).toLowerCase()}${area}.`
        );
      }
      if (informe.evaluacionCualitativa) {
        await this._addBulletPoint(informe.evaluacionCualitativa);
      }
    } else {
      await this._addSection('RESULTADOS DE LA VERIFICACIÓN DE LA EMPRESA Y SU ACTIVIDAD PRINCIPAL');
      if (informe.numeroMemo) {
        await this._addParagraph(
          `Dando cumplimiento al ${informe.numeroMemo} para la verificación de la ` +
            'empresa/institución para pasantía laboral, se hace conocer lo siguiente:'
        );
      }
      if (informe.fechaVerificacion) {
        await this._addLabelValue('Fecha de la verificación:', informe.fechaVerificacion);
      }
      await this._addLabelValue('Empresa/Institución:', pasantia.empresaNombre || '');
      await this._addLabelValue(
        'En funcionamiento:',
        pasantia.empresaEnFuncionamiento === false ? 'NO' : 'SÍ'
      );
      if (pasantia.empresaTipoSocietario) {
        await this._addLabelValue('Tipo societario:', pasantia.empresaTipoSocietario);
      }
      await this._buildDatosEmpresa(pasantia);
    }
    this._addSpace();
  }

  /**
   * Datos comunes de la empresa (dirección, NIT, sector).
   * @private
   */
  async _buildDatosEmpresa(pasantia) {
    if (pasantia.empresaDireccion) {
      await this._addLabelValue('Ubicada en:', pasantia.empresaDireccion);
    }
    if (pasantia.empresaNit) {
      await this._addLabelValue('NIT:', pasantia.empresaNit);
    }
    if (pasantia.empresaSectorActividad) {
      await this._addLabelValue('Actividad económica (sector):', pasantia.empresaSectorActividad);
    }
  }

  /**
   * CONCLUSIONES + cierre + FIRMA DOCENTE del formato real.
   * @private
   */
  async _buildConclusiones(options) {
    const pasantia = options.pasantia || {};
    const informe = options.informe || {};
    const esViable = informe.resultado !== RESULTADOS_INFORME_PASANTIA.NO_VIABLE;
    const docenteNombre =
      options.docenteNombre || pasantia.docenteSupervisorNombre || '';

    await this._addSection('CONCLUSIONES');

    if (informe.areaRelacionada) {
      await this._addLabelValue(
        'Área relacionada con la carrera:',
        informe.areaRelacionada
      );
    }
    if (pasantia.cargoPuesto) {
      await this._addLabelValue('Cargo del estudiante:', pasantia.cargoPuesto);
    }

    if (options.tipo === TIPOS_INFORME_PASANTIA.CONVALIDACION_TRABAJO) {
      await this._addParagraph(
        esViable
          ? 'La empresa demuestra la formalidad correspondiente en relación a los ' +
              'aspectos legales de constitución y la contratación de personal está de ' +
              'acuerdo a la Ley General del Trabajo, por lo que se puede dar VALIDEZ A ' +
              'LA SOLICITUD DE CONVALIDACIÓN. Se adjunta el formulario de seguimiento ' +
              'del instituto debidamente llenado y sellado por la empresa.'
          : 'De la supervisión realizada se concluye que NO corresponde dar validez a ' +
            'la solicitud de convalidación de actividades laborales.'
      );
    } else {
      await this._addParagraph(
        esViable
          ? 'La empresa demuestra la formalidad correspondiente en relación a los ' +
              'aspectos legales de constitución, tal como exigen las leyes bolivianas, ' +
              'por lo que se debe dar VIABILIDAD a la solicitud de autorización para la ' +
              'realización de la pasantía laboral.'
          : 'De la verificación realizada se concluye que NO es viable la solicitud de ' +
            'autorización para la realización de la pasantía laboral.'
      );
    }

    await this._addLabelValue('Resultado:', informe.resultado || '');
    if (informe.contenido) {
      await this._addParagraph(informe.contenido);
    }
    await this._addParagraph('Es todo cuanto puedo informar sobre la solicitud del estudiante.');

    await this._addSignatureBlock({
      lines: ['FIRMA DOCENTE', docenteNombre],
    });
  }
}
