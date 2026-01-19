/**
 * Servicio de generación de PDFs
 * Usa PDFKit para generar documentos PDF
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class PDFGenerator {
  /**
   * Genera el ACTA DE COMPROMISO para la entrega de documentos
   * @param {Object} data - Datos del estudiante y del acta
   * @param {string} outputPath - Ruta donde guardar el PDF
   * @returns {Promise<string>} Ruta del archivo generado
   */
  static async generateCompromisoActa(data, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        // Crear directorio si no existe
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        // Crear documento PDF
        const doc = new PDFDocument({
          size: 'LETTER',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });

        // Pipe al archivo
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Encabezado - Nombre del instituto (centrado)
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('INSTITUTO COMERCIAL DE LA NACION INCOS SANTA CRUZ', {
            align: 'center',
          })
          .font('Helvetica')
          .text('PIONEROS EN EDUCACION SUPERIOR', {
            align: 'center',
          })
          .moveDown(1);

        // Título principal (centrado, más grande)
        doc
          .fontSize(16)
          .font('Helvetica-Bold')
          .text('ACTA DE COMPROMISO PARA LA ENTREGA DE DOCUMENTOS', {
            align: 'center',
          })
          .moveDown(1.5);

        // Sección I: FECHA DE REGISTRO
        doc
          .fontSize(11)
          .font('Helvetica-Bold')
          .text('I. FECHA DE REGISTRO', { continued: false })
          .font('Helvetica')
          .text(`En la Ciudad de ${data.ciudad || 'Santa Cruz de la Sierra'},`, { indent: 20 })
          .text(`${data.dia || new Date().getDate()} del mes de ${data.mes || PDFGenerator.getMonthName(new Date().getMonth())} de ${data.anio || new Date().getFullYear()}.`, { indent: 20 })
          .moveDown(0.8);

        // Sección II: NOMBRE COMPLETO Y NUMERO DE IDENTIFICACION
        doc
          .font('Helvetica-Bold')
          .text('II. NOMBRE COMPLETO Y NUMERO DE IDENTIFICACION', {
            continued: false,
          })
          .font('Helvetica')
          .text(`Yo ${data.nombreCompleto || ''}`, { indent: 20 })
          .text(`con C.I. Nº ${data.ci || ''} ${data.expedicion || 'S.C.'}`, { indent: 20 })
          .moveDown(0.8);

        // Sección III: AÑO Y CARRERA A LA QUE POSTULA
        // Solo mostrar esta sección si hay datos académicos (carrera, año, paralelo)
        const tieneDatosAcademicos = data.carrera || data.anioCarrera || data.paralelo;
        
        if (tieneDatosAcademicos) {
          doc
            .font('Helvetica-Bold')
            .text('III. AÑO Y CARRERA A LA QUE POSTULA', { continued: false })
            .font('Helvetica');
          
          if (data.anioCarrera) {
            doc.text(`Del ${data.anioCarrera} Año`, { indent: 20 });
          }
          if (data.paralelo) {
            doc.text(`Paralelo: ${data.paralelo}`, { indent: 20 });
          }
          if (data.carrera) {
            doc.text(`Carrera: ${data.carrera}`, { indent: 20 });
          }
          
          doc.moveDown(0.8);
        }

        // Sección III o IV: REQUISITOS (el número depende si se mostró la sección de carrera)
        const seccionRequisitosNumero = tieneDatosAcademicos ? 'IV' : 'III';
        doc
          .font('Helvetica-Bold')
          .text(`${seccionRequisitosNumero}. Marcar con una "X" en el recuadro los requisitos que ya fueron presentados.`, {
            continued: false
          })
          .moveDown(0.5);

        // Usar documentos reales de la base de datos si están disponibles
        // Si no, usar lista por defecto
        const requisitos = data.documentosRequeridos && data.documentosRequeridos.length > 0
          ? data.documentosRequeridos
          : [
              'Copia de simple del Diploma de Bachiller',
              'Copia Simple Certificado de nacimiento',
              'Copia simple del Carnet de identidad',
              'Una foto 3 x 3 fondo rojo',
              'Folder con nepaco',
            ];

        requisitos.forEach((requisito, index) => {
          // Marcar con X los documentos ENTREGADOS (interpretación común: X = entregado)
          const tieneX = data.documentosEntregados?.includes(index);
          const yPos = doc.y;
          
          // Dibujar recuadro (checkbox)
          doc
            .rect(70, yPos - 2, 12, 12)
            .stroke();
          
          // Si tiene X, dibujarla centrada en el recuadro (documento entregado)
          if (tieneX) {
            doc
              .font('Helvetica-Bold')
              .fontSize(12)
              .text('X', 72, yPos - 1, { width: 10, align: 'center' });
          }
          
          // Texto del requisito
          doc
            .font('Helvetica')
            .fontSize(11)
            .text(requisito, 90, yPos, { width: 450 });
        });

        doc.moveDown(1);

        // COMPROMISO
        doc
          .font('Helvetica')
          .fontSize(11)
          .text('Me comprometo completar la documentación Faltante.', { indent: 20 })
          .text(`En un plazo máximo de ${data.plazoMaximo || '10'} días, a partir de la fecha de registro.`, { indent: 20 })
          .moveDown(0.8);

        // MOTIVOS
        doc
          .font('Helvetica')
          .fontSize(11)
          .text('Mencione los motivos por lo que no ha presentado los mencionados documentos:', { indent: 20 })
          .moveDown(0.3);

        // Área de texto para motivos (con borde)
        const motivoY = doc.y;
        doc
          .rect(50, motivoY, 500, 60)
          .stroke()
          .font('Helvetica')
          .fontSize(10)
          .text(data.motivos || 'Actualización de carta aval del presente año.', 55, motivoY + 5, {
            width: 490,
            align: 'left',
          });

        doc.y = motivoY + 65;
        doc.moveDown(0.8);

        // DECLARACIÓN FINAL
        doc
          .font('Helvetica')
          .fontSize(10)
          .text(
            'Una vez vencido el plazo y en caso de no haber completado los requisitos exigidos por el Instituto Técnico INCOS SANTA CRUZ; me sujeto a las disposiciones de las Autoridades del Instituto.',
            { indent: 20 }
          )
          .moveDown(1.5);

        // FIRMA
        doc
          .font('Helvetica')
          .fontSize(11)
          .text('Firma', { indent: 20 })
          .moveDown(0.5)
          .text('_________________________', { indent: 20 })
          .moveDown(0.3)
          .text(`C.I. ${data.ci || ''} ${data.expedicion || 'S.C.'}`, { indent: 20 });

        // Finalizar documento
        doc.end();

        stream.on('finish', () => {
          resolve(outputPath);
        });

        stream.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Genera el RECIBO DE PAGO del aporte voluntario
   * @param {Object} data - Datos del pago y del estudiante
   * @param {string} outputPath - Ruta donde guardar el PDF
   * @returns {Promise<string>} Ruta del archivo generado
   */
  static async generateReciboPago(data, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        // Crear directorio si no existe
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        // Crear documento PDF
        const doc = new PDFDocument({
          size: 'LETTER',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });

        // Pipe al archivo
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Encabezado - Nombre del instituto (centrado)
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('INSTITUTO COMERCIAL DE LA NACION INCOS SANTA CRUZ', {
            align: 'center',
          })
          .font('Helvetica')
          .text('PIONEROS EN EDUCACION SUPERIOR', {
            align: 'center',
          })
          .moveDown(1.5);

        // Título principal (centrado, más grande)
        doc
          .fontSize(16)
          .font('Helvetica-Bold')
          .text('RECIBO DE PAGO - APORTE VOLUNTARIO', {
            align: 'center',
          })
          .moveDown(1);

        // Número de recibo y fecha
        doc
          .fontSize(11)
          .font('Helvetica')
          .text(`Recibo Nº: ${data.numeroRecibo || 'N/A'}`, { align: 'left' })
          .text(`Fecha: ${data.fechaPago || new Date().toLocaleDateString('es-BO')}`, {
            align: 'left',
          })
          .moveDown(1);

        // Línea separadora
        doc
          .moveTo(50, doc.y)
          .lineTo(550, doc.y)
          .stroke()
          .moveDown(1);

        // Datos del estudiante
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('DATOS DEL ESTUDIANTE', { continued: false })
          .moveDown(0.5)
          .font('Helvetica')
          .fontSize(11)
          .text(`Nombre: ${data.nombreCompleto || 'N/A'}`, { indent: 20 })
          .text(`C.I.: ${data.ci || 'N/A'}`, { indent: 20 });

        if (data.carrera) {
          doc.text(`Carrera: ${data.carrera}`, { indent: 20 });
        }
        if (data.gestion) {
          doc.text(`Gestión: ${data.gestion}`, { indent: 20 });
        }

        doc.moveDown(1);

        // Línea separadora
        doc
          .moveTo(50, doc.y)
          .lineTo(550, doc.y)
          .stroke()
          .moveDown(1);

        // Detalle del pago
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('DETALLE DEL PAGO', { continued: false })
          .moveDown(0.5)
          .font('Helvetica')
          .fontSize(11);

        // Tabla de detalles
        const tableTop = doc.y;
        const tableLeft = 70;
        const tableWidth = 480;

        // Fila: Concepto
        doc
          .font('Helvetica-Bold')
          .text('Concepto:', tableLeft, tableTop, { width: 150 })
          .font('Helvetica')
          .text(data.concepto || 'Aporte Voluntario Anual', tableLeft + 150, tableTop, {
            width: 330,
          });

        const row2Y = tableTop + 25;
        // Fila: Monto Total
        doc
          .font('Helvetica-Bold')
          .text('Monto Total:', tableLeft, row2Y, { width: 150 })
          .font('Helvetica')
          .text(`Bs. ${(data.montoTotal || 0).toFixed(2)}`, tableLeft + 150, row2Y, {
            width: 330,
          });

        const row3Y = row2Y + 25;
        // Fila: Descuento por Beca
        if (data.descuentoBeca > 0) {
          doc
            .font('Helvetica-Bold')
            .text('Descuento por Beca:', tableLeft, row3Y, { width: 150 })
            .font('Helvetica')
            .text(`Bs. ${data.descuentoBeca.toFixed(2)}`, tableLeft + 150, row3Y, {
              width: 330,
            });
        }

        const row4Y = row3Y + (data.descuentoBeca > 0 ? 25 : 0);
        // Fila: Monto a Pagar
        const montoAPagar = (data.montoTotal || 0) - (data.descuentoBeca || 0);
        doc
          .font('Helvetica-Bold')
          .fontSize(12)
          .text('MONTO A PAGAR:', tableLeft, row4Y, { width: 150 })
          .font('Helvetica')
          .fontSize(12)
          .text(`Bs. ${montoAPagar.toFixed(2)}`, tableLeft + 150, row4Y, {
            width: 330,
          });

        const row5Y = row4Y + 30;
        // Fila: Método de Pago
        doc
          .font('Helvetica-Bold')
          .fontSize(11)
          .text('Método de Pago:', tableLeft, row5Y, { width: 150 })
          .font('Helvetica')
          .fontSize(11)
          .text(data.metodoPago || 'N/A', tableLeft + 150, row5Y, { width: 330 });

        if (data.numeroTransaccion) {
          const row6Y = row5Y + 25;
          doc
            .font('Helvetica-Bold')
            .text('Número de Transacción:', tableLeft, row6Y, { width: 150 })
            .font('Helvetica')
            .text(data.numeroTransaccion, tableLeft + 150, row6Y, { width: 330 });
        }

        if (data.banco) {
          const row7Y = (data.numeroTransaccion ? row5Y + 50 : row5Y + 25);
          doc
            .font('Helvetica-Bold')
            .text('Banco:', tableLeft, row7Y, { width: 150 })
            .font('Helvetica')
            .text(data.banco, tableLeft + 150, row7Y, { width: 330 });
        }

        // Estado del pago
        doc.moveDown(1.5);
        doc
          .fontSize(11)
          .font('Helvetica-Bold')
          .text(`Estado: ${data.estado || 'PENDIENTE'}`, { align: 'left' });

        doc.moveDown(2);

        // Línea separadora
        doc
          .moveTo(50, doc.y)
          .lineTo(550, doc.y)
          .stroke()
          .moveDown(1.5);

        // Firmas
        doc
          .fontSize(11)
          .font('Helvetica')
          .text('_________________________', { indent: 20 })
          .moveDown(0.3)
          .text('Firma del Estudiante', { indent: 20 })
          .moveDown(1.5);

        doc
          .text('_________________________', { indent: 350 })
          .moveDown(0.3)
          .text('Firma del Cajero', { indent: 350 });

        // Finalizar documento
        doc.end();

        stream.on('finish', () => {
          resolve(outputPath);
        });

        stream.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Genera el FORMULARIO DE INSCRIPCIÓN
   * @param {Object} data - Datos del estudiante y de la inscripción
   * @param {string} outputPath - Ruta donde guardar el PDF
   * @returns {Promise<string>} Ruta del archivo generado
   */
  static async generateFormularioInscripcion(data, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        // Crear directorio si no existe
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        // Crear documento PDF
        const doc = new PDFDocument({
          size: 'LETTER',
          margins: { top: 30, bottom: 30, left: 40, right: 40 },
        });

        // Pipe al archivo
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Variables de posición
        const leftMargin = 50;
        const fieldWidth = 200;
        const checkboxSize = 10;
        const lineHeight = 15;
        let currentY = 30;

        // ============================================
        // ENCABEZADO
        // ============================================
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('INSTITUTO COMERCIAL DE LA NACION INCOS SANTA CRUZ', leftMargin, currentY, {
            align: 'center',
            width: 500,
          });
        currentY += 18;
        
        doc
          .fontSize(10)
          .font('Helvetica')
          .text('PIONEROS EN EDUCACION SUPERIOR', leftMargin, currentY, {
            align: 'center',
            width: 500,
          });
        currentY += 20;
        
        doc
          .fontSize(16)
          .text('FORMULARIO DE INSCRIPCIÓN', leftMargin, currentY, {
            align: 'center',
            width: 500,
          });
        currentY += 18;
        
        doc
          .fontSize(12)
          .text(`GESTIÓN ${data.gestionYear || new Date().getFullYear()}`, leftMargin, currentY, {
            align: 'center',
            width: 500,
          });
        currentY += 25;

        // ============================================
        // SECCIÓN 1: DATOS PERSONALES
        // ============================================
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('1. DATOS PERSONALES', leftMargin, currentY);
        currentY += 20;

        // Nombres y Apellidos
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('Nombres y Apellidos:', leftMargin, currentY);
        currentY += lineHeight;
        
        doc
          .font('Helvetica')
          .text(`Apellido Paterno: ${data.apellidoPaterno || ''}`, leftMargin, currentY);
        currentY += lineHeight;
        
        doc
          .text(`Apellido Materno: ${data.apellidoMaterno || ''}`, leftMargin, currentY);
        currentY += lineHeight;
        
        doc
          .text(`Nombres: ${data.nombres || ''}`, leftMargin, currentY);
        currentY += lineHeight + 5;

        // C.I. Nº
        doc
          .font('Helvetica-Bold')
          .text(`C.I. Nº: ${data.ci || ''} ${data.expedicion || ''}`, leftMargin, currentY);
        currentY += lineHeight;

        // Género con checkboxes circulares
        doc
          .font('Helvetica')
          .text('Género:', leftMargin, currentY);
        const generoX = leftMargin + 60;
        const generoY = currentY - 2;
        // Checkbox Masculino
        doc.circle(generoX, generoY + 5, checkboxSize / 2).stroke();
        if (data.genero === 'Masculino' || data.genero === 'M') {
          doc.circle(generoX, generoY + 5, checkboxSize / 2 - 2).fill();
        }
        doc.text('Masculino O', generoX + 10, generoY);
        // Checkbox Femenino
        const femeninoX = generoX + 100;
        doc.circle(femeninoX, generoY + 5, checkboxSize / 2).stroke();
        if (data.genero === 'Femenino' || data.genero === 'F') {
          doc.circle(femeninoX, generoY + 5, checkboxSize / 2 - 2).fill();
        }
        doc.text('Femenino O', femeninoX + 10, generoY);
        currentY += lineHeight;

        // Grupo Sanguíneo
        doc
          .text(`Grupo Sanguíneo: ${data.tipoSangre || ''}`, leftMargin, currentY);
        currentY += lineHeight;

        // Correo Electrónico
        doc
          .text(`Correo Electrónico: ${data.emailPersonal || ''}`, leftMargin, currentY);
        currentY += lineHeight;

        // Estado Civil con checkboxes
        doc
          .text('Estado Civil:', leftMargin, currentY);
        const estadoCivilX = leftMargin + 80;
        const estadoCivilY = currentY - 2;
        const estados = ['Soltero(a)', 'Casado(a)', 'Concubinato'];
        estados.forEach((estado, index) => {
          const x = estadoCivilX + (index * 100);
          doc.circle(x, estadoCivilY + 5, checkboxSize / 2).stroke();
          if (data.estadoCivil && data.estadoCivil.toLowerCase().includes(estado.toLowerCase().replace('(a)', '').replace('(', '').replace(')', ''))) {
            doc.circle(x, estadoCivilY + 5, checkboxSize / 2 - 2).fill();
          }
          doc.text(`${estado} O`, x + 10, estadoCivilY);
        });
        currentY += lineHeight;

        // Discapacidad con checkboxes
        doc
          .text('Discapacidad:', leftMargin, currentY);
        const discapacidadX = leftMargin + 80;
        const discapacidadY = currentY - 2;
        // Sí
        doc.circle(discapacidadX, discapacidadY + 5, checkboxSize / 2).stroke();
        if (data.tieneDiscapacidad) {
          doc.circle(discapacidadX, discapacidadY + 5, checkboxSize / 2 - 2).fill();
        }
        doc.text('Si) O', discapacidadX + 10, discapacidadY);
        // No
        const noX = discapacidadX + 60;
        doc.circle(noX, discapacidadY + 5, checkboxSize / 2).stroke();
        if (!data.tieneDiscapacidad) {
          doc.circle(noX, discapacidadY + 5, checkboxSize / 2 - 2).fill();
        }
        doc.text('No) O', noX + 10, discapacidadY);
        currentY += lineHeight + 5;

        // Lugar y Fecha de Nacimiento
        doc
          .font('Helvetica-Bold')
          .text('Lugar y Fecha de Nacimiento:', leftMargin, currentY);
        currentY += lineHeight;
        
        doc
          .font('Helvetica')
          .text(`Localidad: ${data.ciudadNacimiento || ''}`, leftMargin, currentY);
        currentY += lineHeight;
        
        doc
          .text(`Provincia: ${data.provincia || ''}`, leftMargin, currentY);
        currentY += lineHeight;
        
        doc
          .text(`Departamento: ${data.departamento || ''}`, leftMargin, currentY);
        currentY += lineHeight;
        
        // Fecha (Día, Mes, Año)
        doc
          .text(`Día: ${data.fechaNacimiento ? data.fechaNacimiento.split('/')[0] : ''}`, leftMargin, currentY);
        doc
          .text(`Mes: ${data.fechaNacimiento ? data.fechaNacimiento.split('/')[1] : ''}`, leftMargin + 80, currentY);
        doc
          .text(`Año: ${data.fechaNacimiento ? data.fechaNacimiento.split('/')[2] : ''}`, leftMargin + 160, currentY);
        currentY += lineHeight;
        
        doc
          .text(`Nacionalidad: ${data.nacionalidad || 'Boliviana'}`, leftMargin, currentY);
        currentY += lineHeight;
        
        doc
          .text(`Edad: ${data.edad || ''}`, leftMargin, currentY);
        currentY += lineHeight + 5;

        // Domicilio
        doc
          .text(`Domicilio: ${data.direccion || ''}`, leftMargin, currentY);
        currentY += lineHeight;

        // Idioma de origen
        doc
          .text(`Idioma de origen: ${data.idiomaMaterno || ''}`, leftMargin, currentY);
        currentY += lineHeight;

        // Celular
        doc
          .text(`Celular: ${data.celular || ''}`, leftMargin, currentY);
        currentY += 20;

        // ============================================
        // SECCIÓN 2: DATOS ACADÉMICOS
        // ============================================
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('2. DATOS ACADÉMICOS', leftMargin, currentY);
        currentY += 20;

        // Carrera con checkboxes (solo las 3 carreras del seeder)
        doc
          .fontSize(10)
          .font('Helvetica')
          .text('Carrera:', leftMargin, currentY);
        const carreraY = currentY - 2;
        const carreras = ['Sistemas Informáticos', 'Administración de Empresas', 'Contaduría General'];
        carreras.forEach((carrera, index) => {
          const x = leftMargin + (index % 2) * 250;
          const y = carreraY + (Math.floor(index / 2) * lineHeight);
          doc.circle(x + 60, y + 5, checkboxSize / 2).stroke();
          if (data.carrera && data.carrera.toLowerCase().includes(carrera.toLowerCase().split(' ')[0])) {
            doc.circle(x + 60, y + 5, checkboxSize / 2 - 2).fill();
          }
          doc.text(`${carrera} O`, x + 70, y);
        });
        currentY += lineHeight * 2 + 5;

        // Año con checkboxes
        doc
          .text('Año:', leftMargin, currentY);
        const anioY = currentY - 2;
        const anios = ['Primer Año', 'Segundo Año', 'Tercer Año'];
        anios.forEach((anio, index) => {
          const x = leftMargin + (index * 150);
          doc.circle(x + 40, anioY + 5, checkboxSize / 2).stroke();
          if (data.anio && data.anio.toLowerCase().includes(anio.toLowerCase().split(' ')[0])) {
            doc.circle(x + 40, anioY + 5, checkboxSize / 2 - 2).fill();
          }
          doc.text(`${anio} O`, x + 50, anioY);
        });
        currentY += lineHeight + 15;

        // ============================================
        // SECCIÓN 3: DOCUMENTOS RECEPCIONADOS
        // ============================================
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('3. DOCUMENTOS RECEPCIONADOS', leftMargin, currentY);
        currentY += 20;

        const documentos = [
          { nombre: 'Fotocopia Carnet de Identidad', entregado: data.documentos?.ci || false },
          { nombre: 'Fotocopia Certificado de Nacimiento', entregado: data.documentos?.certificadoNacimiento || false },
          { nombre: 'Fotocopia de Título de Bachiller', entregado: data.documentos?.diplomaBachiller || false },
          { nombre: 'Aporte Voluntario', entregado: data.documentos?.aporteVoluntario || false },
        ];

        documentos.forEach((docItem) => {
          const checkboxX = leftMargin;
          const checkboxY = currentY - 2;
          // Dibujar checkbox circular
          doc.circle(checkboxX + 5, checkboxY + 5, checkboxSize / 2).stroke();
          
          // Si está entregado, marcar con círculo relleno
          if (docItem.entregado) {
            doc.circle(checkboxX + 5, checkboxY + 5, checkboxSize / 2 - 2).fill();
          }
          
          // Texto del documento
          doc
            .font('Helvetica')
            .fontSize(10)
            .text(`${docItem.nombre} O`, checkboxX + 15, checkboxY);
          
          currentY += lineHeight;
        });

        currentY += 20;

        // ============================================
        // FIRMAS
        // ============================================
        doc
          .fontSize(10)
          .text('Firma Estudiante', leftMargin, currentY);
        currentY += 15;
        doc
          .moveTo(leftMargin, currentY)
          .lineTo(leftMargin + 200, currentY)
          .stroke();
        currentY += 20;
        
        doc
          .text('Responsable Inscripción', leftMargin, currentY);
        currentY += 15;
        doc
          .moveTo(leftMargin, currentY)
          .lineTo(leftMargin + 200, currentY)
          .stroke();
        currentY += 20;

        // ============================================
        // FOOTER - DISCLAIMER
        // ============================================
        doc
          .fontSize(8)
          .font('Helvetica-Oblique')
          .text(
            'El llenado del presente formulario es responsabilidad plena del postulante (estudiante) y los documentos adjuntos respaldan los requisitos establecidos por la R.M. 0001/2026',
            leftMargin,
            currentY,
            {
              align: 'center',
              width: 500,
            }
          );

        // Finalizar documento
        doc.end();

        stream.on('finish', () => {
          resolve(outputPath);
        });

        stream.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Obtiene el nombre del mes en español
   * @param {number} monthIndex - Índice del mes (0-11)
   * @returns {string} Nombre del mes
   */
  static getMonthName(monthIndex) {
    const meses = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return meses[monthIndex] || '';
  }
}

