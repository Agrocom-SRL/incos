/**
 * FormularioInscripcionPdfGenerator
 *
 * Servicio de infraestructura que generará el FORMULARIO DE INSCRIPCIÓN a partir de una plantilla PDF.
 * Esqueleto base para la migración desde BoletaInscripcionWordGenerator (Word + PizZip).
 *
 * Tecnología: pdf-lib (misma que ActaCompromisoPdfGenerator). Usa IncosPDFLibBase.
 *
 * Estructura (título, subtítulo, secciones):
 * - Título: FORMULARIO DE INSCRIPCIÓN
 * - Subtítulo: GESTIÓN {año} (gestión desde caso de uso / BD)
 * - I. DATOS PERSONALES
 * - II. DATOS ACADÉMICOS
 * - III. DOCUMENTOS RECEPCIONADOS
 *
 * El contenido de cada sección se añadirá durante la migración (datos desde options.student, etc.).
 *
 * @module FormularioInscripcionPdfGenerator
 */

import { IncosPDFLibBase } from './IncosPDFLibBase.js';
import { IncosPDFBase } from './IncosPDFBase.js';

export class FormularioInscripcionPdfGenerator extends IncosPDFLibBase {
    /**
     * @param {Object} params - Dependencias inyectadas
     * @param {ILogger} [params.logger] - Logger para registro de eventos
     */
    constructor({ logger } = {}) {
        super({ logger });
    }

    /**
     * Genera un PDF de Formulario de Inscripción a partir de la plantilla.
     * Retorna Buffer. El guardado en uploads lo hace el caso de uso / almacenamiento.
     *
     * @param {Object} [options] - Opciones (estructura análoga a Acta: gestion, student, fechaActual)
     * @param {string|number} [options.gestion] - Año de gestión (desde BD, caso de uso)
     * @param {Object} [options.student] - Datos del estudiante (vista_estudiante_datos_personales normalizados)
     * @param {string} [options.fechaActual] - Fecha actual para el documento
     * @returns {Promise<Buffer>} Contenido del PDF generado
     */
    async generate(options = {}) {
        try {
            const pdfDoc = await this._loadTemplate('Plantilla.pdf');
            const pages = pdfDoc.getPages();
            const firstPage = pages[0];
            this._initializeDocumentState(pdfDoc, firstPage, true);

            await this._buildHeader(options);
            await this._buildDatosPersonales(options);
            await this._buildDatosAcademicos(options);
            await this._buildDocumentosRecepcionados(options);
            await this._buildFirma(options);

            const pdfBuffer = await this._saveDocument(pdfDoc);

            if (this.logger) {
                this.logger.info('[FormularioInscripcionPdfGenerator] Formulario de inscripción PDF generado (buffer)', {
                    size: pdfBuffer.length,
                });
            }

            return pdfBuffer;
        } catch (error) {
            if (this.logger) {
                this.logger.error('[FormularioInscripcionPdfGenerator] Error al generar formulario de inscripción PDF', {
                    error: error.message,
                    stack: error.stack,
                });
            }
            throw error;
        }
    }

    // ============================================
    // MÉTODOS DE CONSTRUCCIÓN (como ActaCompromiso: título, subtítulo, secciones)
    // ============================================

    /**
     * Construye el encabezado del documento (título y subtítulo).
     * Gestión desde caso de uso (BD). Acentos: GESTIÓN.
     *
     * @private
     * @param {Object} options - Opciones de generación
     * @returns {Promise<void>}
     */
    async _buildHeader(options) {
        const T = IncosPDFBase.FORMULARIO_TEXTS;
        const codigo = (options.student?.codigoEstudiante ?? options.student?.codigo_estudiante ?? '').toString().trim();
        await this._drawRegistrationBox(T.REGISTRO_HEADER_LABEL, codigo || '—');
        
        // Dibujar cuadro de foto 3x3 debajo del código de registro
        await this._drawPhotoBox(options.photoPath || null);

        await this._addInstitutionalHeader(IncosPDFBase.INSTITUTIONAL_HEADER_LINES);
        await this._addDocumentTitle(IncosPDFBase.INSTITUTE.name, false);
        await this._addDocumentTitle(IncosPDFBase.DOCUMENT_TITLES.FORMULARIO_INSCRIPCION);

        if (options.gestion) {
            const gestionYear = String(options.gestion);
            await this._addSubtitle(`GESTIÓN ${gestionYear}`);
        }
    }

    /**
     * I. DATOS PERSONALES.
     * Orden: identificación personal → lugar/fecha y domicilio → datos del trabajo → contacto de emergencia.
     *
     * @private
     * @param {Object} options - Opciones de generación
     * @returns {Promise<void>}
     */
    async _buildDatosPersonales(options) {
        await this._addSection(IncosPDFBase.FORMULARIO_SECTION_TITLES.DATOS_PERSONALES);

        // Bloque 1: Identificación personal (nombres, grid CI/género/etc., detalle discapacidad)
        await this._buildIdentificacionPersonal(options);

        // Bloque 2: Lugar y Fecha de Nacimiento, Domicilio
        await this._buildLugarFechaNacimientoYDomicilio(options);

        // Bloque 3: Datos del trabajo (trabaja, empresa, cargo)
        await this._buildDatosTrabajo(options);

        // Bloque 4: Contacto de emergencia (apoderado) — al final del sector
        await this._buildContactoEmergencia(options);

        this._addSpace();
    }

    /**
     * Bloque 1 de DATOS PERSONALES: Identificación personal.
     * Orquesta los 3 sub-bloques: datos básicos, discapacidad, y datos de origen.
     *
     * @private
     * @param {Object} options - Opciones de generación (options.student)
     * @returns {Promise<void>}
     */
    async _buildIdentificacionPersonal(options) {
        const T = IncosPDFBase.FORMULARIO_TEXTS;
        const s = options.student || {};

        // Campo de nombres y apellidos con recuadro (valor en bold, tamaño del título, color negro)
        const nombresVal = [s.apellidoPaterno, s.apellidoMaterno, s.nombres]
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
        // valueBold=true y valueFontSize=title.size para usar tamaño del título (14) con Helvetica-Bold
        await this._addBoxedField(T.NOMBRES_APELLIDOS_LABEL, nombresVal || '—', true, IncosPDFBase.FONTS.title.size);

        // Bloque 1: Datos básicos (CI, Género, Celular, Correo, Estado civil, Grupo sanguíneo)
        await this._buildDatosBasicosIdentificacion(options);

        // Bloque 2: Discapacidad y detalle
        await this._buildDiscapacidadIdentificacion(options);

        // Bloque 3: Edad, Fecha de nacimiento, Nacionalidad, Idioma principal
        await this._buildDatosOrigenIdentificacion(options);
    }

    /**
     * Bloque 1.1: Datos básicos de identificación.
     * Grid 2 columnas: CI, Celular, Estado civil (izq) | Género, Correo, Tipo sangre (der)
     *
     * @private
     * @param {Object} options - Opciones de generación (options.student)
     * @returns {Promise<void>}
     */
    async _buildDatosBasicosIdentificacion(options) {
        const T = IncosPDFBase.FORMULARIO_TEXTS;
        const s = options.student || {};

        const leftColumnItems = [];
        const rightColumnItems = [];

        // Columna izquierda: C.I., Celular, Estado civil
        const ci = (s.ci ?? '').toString().trim();
        const exp = (s.expedicion ?? '').toString().trim();
        if (ci || exp) {
            const ciVal = [ci, exp].filter(Boolean).join(' ').trim();
            leftColumnItems.push({ label: T.CI_LABEL, value: ciVal || '—' });
        }
        const celularVal = (s.celular ?? '').toString().trim();
        if (celularVal) {
            leftColumnItems.push({ label: T.CELULAR_LABEL, value: celularVal });
        }
        if (s.estadoCivilNombre) {
            leftColumnItems.push({ label: T.ESTADO_CIVIL_LABEL, value: s.estadoCivilNombre });
        }

        // Columna derecha: Género, Correo, Tipo sangre
        if (s.genero) {
            const g = String(s.genero).toLowerCase();
            const generoVal = g === 'masculino' ? 'Masculino' : g === 'femenino' ? 'Femenino' : g === 'otro' ? 'Otro' : s.genero;
            rightColumnItems.push({ label: T.GENERO_LABEL, value: generoVal });
        }
        const emailVal = (s.emailPersonal ?? '').toString().trim();
        if (emailVal) {
            rightColumnItems.push({ label: T.EMAIL_LABEL, value: emailVal });
        }
        if (s.tipoSangre) {
            rightColumnItems.push({ label: T.TIPO_SANGRE_LABEL, value: s.tipoSangre });
        }

        // Dibujar grid de 2 columnas (35% izquierda, 65% derecha)
        if (leftColumnItems.length > 0 || rightColumnItems.length > 0) {
            await this._addBoxedFieldGrid(leftColumnItems, rightColumnItems, 35);
        }
    }

    /**
     * Bloque 1.2: Discapacidad y detalle.
     * Grid 2 columnas: Discapacidad (izq) | Detalle discapacidad (der)
     *
     * @private
     * @param {Object} options - Opciones de generación (options.student)
     * @returns {Promise<void>}
     */
    async _buildDiscapacidadIdentificacion(options) {
        const T = IncosPDFBase.FORMULARIO_TEXTS;
        const s = options.student || {};

        const leftColumnItems = [];
        const rightColumnItems = [];

        // Columna izquierda: Discapacidad
        if (s.tieneDiscapacidad !== undefined && s.tieneDiscapacidad !== null) {
            const disc = s.tieneDiscapacidad === true || s.tieneDiscapacidad === 1 ? 'Sí' : 'No';
            leftColumnItems.push({ label: T.DISCAPACIDAD_LABEL, value: disc });
        }

        // Columna derecha: Detalle discapacidad (solo TIPO y GRADO)
        const tieneDisc = s.tieneDiscapacidad === true || s.tieneDiscapacidad === 1;
        const list = Array.isArray(s.discapacidades) ? s.discapacidades : [];
        if (tieneDisc && list.length > 0) {
            const detalleVal = this._buildDetalleDiscapacidad(list);
            if (detalleVal) {
                rightColumnItems.push({ label: T.DETALLE_DISCAPACIDAD_LABEL, value: detalleVal });
            }
        }

        // Dibujar grid de 2 columnas (35% izquierda, 65% derecha)
        // Siempre respeta el porcentaje incluso si una columna está vacía (comportamiento por defecto)
        if (leftColumnItems.length > 0 || rightColumnItems.length > 0) {
            await this._addBoxedFieldGrid(leftColumnItems, rightColumnItems, 35);
        }
    }

    /**
     * Bloque 1.3: Datos de origen (edad, fecha nacimiento, nacionalidad, idioma).
     * Grid 2 columnas: Edad, Nacionalidad (izq) | Fecha de nacimiento, Idioma principal (der)
     *
     * @private
     * @param {Object} options - Opciones de generación (options.student)
     * @returns {Promise<void>}
     */
    async _buildDatosOrigenIdentificacion(options) {
        const T = IncosPDFBase.FORMULARIO_TEXTS;
        const s = options.student || {};
        const origenes = Array.isArray(s.origenes) ? s.origenes : [];
        const principal = origenes.find((o) => o.es_principal === 1 || o.es_principal === true) || origenes[0];

        // Preparar datos para nacionalidad e idioma
        const tipoOrigenRaw = (principal?.tipo_origen ?? principal?.tipoOrigen ?? '').toString().trim().toUpperCase();
        const nacionalidad = tipoOrigenRaw === 'BOLIVIANA' ? 'Boliviana'
            : tipoOrigenRaw === 'EXTRANJERA' ? 'Extranjera'
                : tipoOrigenRaw === 'DOBLE_NACIONALIDAD' ? 'Doble Nacionalidad'
                    : tipoOrigenRaw || '—';
        const idiomaPrincipal = (principal?.idioma_materno_nombre ?? principal?.idiomaMaternoNombre ?? '').toString().trim();

        const leftColumnItems = [];
        const rightColumnItems = [];

        // Columna izquierda: Edad, Nacionalidad
        const edad = (s.edad ?? '').toString().trim();
        if (edad && edad !== '—') {
            leftColumnItems.push({ label: T.EDAD_LABEL, value: `${edad} años` });
        }
        if (nacionalidad && nacionalidad !== '—') {
            leftColumnItems.push({ label: T.NACIONALIDAD_LABEL, value: nacionalidad });
        }

        // Columna derecha: Fecha de nacimiento, Idioma principal
        const fechaLiteral = (s.fechaNacimientoLiteral ?? '').toString().trim();
        if (fechaLiteral && fechaLiteral !== '—') {
            rightColumnItems.push({ label: T.FECHA_NACIMIENTO_LABEL, value: fechaLiteral });
        }
        if (idiomaPrincipal) {
            rightColumnItems.push({ label: T.IDIOMA_PRINCIPAL_LABEL, value: idiomaPrincipal });
        }

        // Dibujar grid de 2 columnas (35% izquierda, 65% derecha)
        if (leftColumnItems.length > 0 || rightColumnItems.length > 0) {
            await this._addBoxedFieldGrid(leftColumnItems, rightColumnItems, 35);
        }
    }

    /**
     * Construye el texto de detalle desde discapacidades (vista_base_estudiante_discapacidades).
     * Solo incluye TIPO y GRADO (sin DESCRIPCION ni CAUSA).
     *
     * @private
     * @param {Array<Object>} discapacidades - Items de la vista (snake_case o camelCase)
     * @returns {string}
     */
    _buildDetalleDiscapacidad(discapacidades) {
        const sep = ' — ';
        const segmentSep = '. ';

        const parts = discapacidades.map((d) => {
            const tipo = (d.tipo_discapacidad_nombre ?? d.tipoDiscapacidadNombre ?? '').toString().trim();
            const grado = (d.grado_discapacidad ?? d.gradoDiscapacidad ?? '').toString().trim();

            const segments = [];
            if (tipo) segments.push(`Tipo: ${tipo}`);
            if (grado) segments.push(`Grado: ${grado}`);

            return segments.join(segmentSep);
        }).filter((p) => p.length > 0);

        return parts.join(sep);
    }

    /**
     * Formatea el texto de la columna PARALELO por materia (paralelo - turno (periodo)).
     * Usa datos por materia desde vista_estudiante_inscripcion_actual; si faltan, usa fallback.
     *
     * @private
     * @param {Object} materia - { paraleloNombre, paraleloTurno, periodoNombre }
     * @param {string} fallbackParaleloLabel - Texto único de inscripción cuando la materia no trae paralelo/periodo
     * @returns {string}
     */
    _formatParaleloColumna(materia, fallbackParaleloLabel) {
        let pNombre = (materia.paraleloNombre ?? materia.paralelo_nombre ?? '').toString().trim();
        const pTurno = (materia.paraleloTurno ?? materia.paralelo_turno ?? '').toString().trim();
        const periodo = (materia.periodoNombre ?? materia.periodo_nombre ?? '').toString().trim();
        if (pNombre) {
            const palabras = pNombre.toLowerCase().split(' ');
            pNombre = palabras.map(p => (p ? p.charAt(0).toUpperCase() + p.slice(1) : '')).join(' ');
        }
        const part = [pNombre, pTurno].filter(Boolean).join(' - ');
        if (part) {
            return periodo ? `${part} (${periodo})` : part;
        }
        if (periodo) return periodo;
        return fallbackParaleloLabel || '—';
    }

    /**
     * Lugar y Fecha de Nacimiento, Domicilio, Idioma de origen.
     * Datos desde origenes (vista_base_estudiante_origenes + idiomas), residencia (vista_base_estudiante_residencia)
     * y student (fechaNacimientoLiteral, edad calculados en caso de uso).
     *
     * Dirección según nacionalidad:
     * - Boliviana: localidad-municipio, provincia, departamento
     * - Extranjera: ciudad, país
     * - Doble nacionalidad: usa origen principal (es_principal)
     *
     * Grid 2 columnas: fecha de nacimiento (literal), edad, nacionalidad, idioma principal, idioma secundario, teléfono fijo (solo si existen).
     * Domicilio: dirección/zona primero, luego municipio, provincia, departamento.
     *
     * @private
     * @param {Object} options - Opciones de generación (options.student con fechaNacimientoLiteral, edad)
     * @returns {Promise<void>}
     */
    async _buildLugarFechaNacimientoYDomicilio(options) {
        const T = IncosPDFBase.FORMULARIO_TEXTS;
        const s = options.student || {};
        const origenes = Array.isArray(s.origenes) ? s.origenes : [];
        const principal = origenes.find((o) => o.es_principal === 1 || o.es_principal === true) || origenes[0];

        // Construir dirección según nacionalidad (boliviana vs extranjera)
        const tipoOrigen = (principal?.tipo_origen ?? '').toString().toUpperCase();
        const esBoliviana = tipoOrigen === 'BOLIVIANA' || tipoOrigen === 'BOLIVIANO';
        let lugarVal = '—';

        if (principal) {
            if (esBoliviana) {
                // Boliviana: localidad-municipio, provincia, departamento
                const lugarParts = [
                    principal?.ciudad ?? principal?.ciudad_nacimiento_raw,
                    principal?.nacimiento_municipio_nombre,
                    principal?.nacimiento_provincia_nombre,
                    principal?.nacimiento_departamento_nombre,
                ].filter(Boolean);
                if (lugarParts.length > 0) {
                    // Si hay ciudad y municipio, unir con guion; luego provincia y departamento
                    const ciudadMunicipio = [lugarParts[0], lugarParts[1]].filter(Boolean).join('-');
                    const resto = lugarParts.slice(2).filter(Boolean);
                    lugarVal = [ciudadMunicipio, ...resto].filter(Boolean).join(', ');
                }
            } else {
                // Extranjera: ciudad, país
                const ciudad = (principal?.ciudad ?? principal?.ciudad_nacimiento_raw ?? '').toString().trim();
                const pais = (principal?.pais_nombre ?? principal?.paisNombre ?? '').toString().trim();
                const extParts = [ciudad, pais].filter(Boolean);
                lugarVal = extParts.length > 0 ? extParts.join(', ') : '—';
            }
        }

        // Campos con recuadro en una sola columna (ocupa todo el ancho)
        const singleColumnItems = [];

        // Lugar de nacimiento
        if (lugarVal && lugarVal !== '—') {
            singleColumnItems.push({ label: T.LUGAR_NACIMIENTO_LABEL, value: lugarVal });
        }

        // Domicilio: dirección/zona primero, luego municipio, provincia, departamento
        const domicilioParts = [];
        const direccion = (s.direccion ?? '').toString().trim();
        const zona = (s.zona ?? '').toString().trim();
        if (direccion) domicilioParts.push(direccion);
        if (zona) domicilioParts.push(zona);
        const residenciaMunicipio = s.residenciaMunicipioNombre ?? s.residencia_municipio_nombre;
        const residenciaProvincia = s.residenciaProvinciaNombre ?? s.residencia_provincia_nombre;
        const residenciaDepartamento = s.residenciaDepartamentoNombre ?? s.residencia_departamento_nombre;
        if (residenciaMunicipio) domicilioParts.push(residenciaMunicipio);
        if (residenciaProvincia) domicilioParts.push(residenciaProvincia);
        if (residenciaDepartamento) domicilioParts.push(residenciaDepartamento);

        const domicilioVal = domicilioParts.length > 0 ? domicilioParts.join(', ') : '—';
        if (domicilioVal && domicilioVal !== '—') {
            singleColumnItems.push({ label: T.DOMICILIO_LABEL, value: domicilioVal });
        }

        // Dibujar campos en una sola columna (ocupa todo el ancho)
        // leftColumnWidthPercent=100 indica que es una sola columna que ocupa el 100% del ancho
        if (singleColumnItems.length > 0) {
            await this._addBoxedFieldGrid(singleColumnItems, [], 100, 90);
        }
    }

    /**
     * Bloque 4 de DATOS PERSONALES: Contacto de emergencia (apoderado).
     * No se muestra si no hay apoderado o si todos los datos (parentesco, celular, nombre) son null/vacíos.
     * Si se muestra: título "Contacto de emergencia" y grid (Parentesco, Celular | Nombre). Nombre vacío → "Sin nombre".
     *
     * @private
     * @param {Object} options - Opciones de generación (options.student)
     * @returns {Promise<void>}
     */
    async _buildContactoEmergencia(options) {
        const T = IncosPDFBase.FORMULARIO_TEXTS;
        const s = options.student || {};
        const apoderados = Array.isArray(s.apoderados) ? s.apoderados : [];

        // Obtener el primer apoderado (o el principal si existe)
        const apoderado = apoderados.find((a) => a.es_principal === 1 || a.es_principal === true) || apoderados[0];

        if (!apoderado) {
            return;
        }

        const parentesco = (apoderado.tipo_parentesco_nombre ?? apoderado.tipoParentescoNombre ?? '').toString().trim();
        const celular = (apoderado.celular_1 ?? apoderado.celular1 ?? '').toString().trim();
        const nombres = (apoderado.apoderado_nombres ?? apoderado.apoderadoNombres ?? '').toString().trim();
        const apellidos = (apoderado.apoderado_apellidos ?? apoderado.apoderadoApellidos ?? '').toString().trim();
        const nombreCompleto = [nombres, apellidos].filter(Boolean).join(' ').trim();

        // No mostrar el bloque si no tiene datos (todos null/vacíos)
        if (!parentesco && !celular && !nombreCompleto) {
            return;
        }

        // Separación y título "Contacto de emergencia" para que no queden los datos "al aire"
        this._addSpace(IncosPDFBase.LAYOUT.spacing.subsection);
        await this._addContactoEmergenciaSeparator(T.CONTACTO_EMERGENCIA_TITULO);

        const leftColumnItems = [];
        const rightColumnItems = [];

        if (parentesco) {
            leftColumnItems.push({ label: T.PARENTESCO_LABEL, value: parentesco });
        }
        if (celular) {
            leftColumnItems.push({ label: T.CELULAR_CONTACTO_LABEL, value: celular });
        }

        rightColumnItems.push({
            label: T.DATOS_REFERENCIA_LABEL,
            value: nombreCompleto || T.SIN_NOMBRE_PLACEHOLDER,
        });

        if (leftColumnItems.length > 0 || rightColumnItems.length > 0) {
            await this._addBoxedFieldGrid(leftColumnItems, rightColumnItems, 35);
        }
    }

    /**
     * Añade el título de subsección "Contacto de emergencia".
     * Separa visualmente el bloque de trabajo del bloque de contacto de emergencia.
     *
     * @private
     * @param {string} titleText - Texto del título (ej. "Contacto de emergencia")
     * @returns {Promise<void>}
     */
    async _addContactoEmergenciaSeparator(titleText) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }

        const margins = IncosPDFBase.LAYOUT.margins;
        const sectionRgb = this._hexToRgb(IncosPDFBase.COLORS.primary);

        // Título de subsección (alineado a la izquierda, fuente section, color primario)
        const sectionFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.section.font);
        const sectionFont = await this._pdfDoc.embedFont(sectionFontName);
        const sectionFontSize = IncosPDFBase.FONTS.section.size;

        this._currentPage.drawText(titleText, {
            x: margins.left,
            y: this._currentY,
            size: sectionFontSize,
            font: sectionFont,
            color: sectionRgb,
        });

        this._currentY = this._currentY - IncosPDFBase.LAYOUT.spacing.bullet;
    }

    /**
     * Bloque 4 de DATOS PERSONALES: Datos del trabajo.
     * Grid 2 columnas: Trabaja (Sí/No), Cargo (izq) | Empresa o institución (der).
     * Datos desde student (trabaja, empresaInstitucion, cargo) - tabla estudiantes.
     *
     * @private
     * @param {Object} options - Opciones de generación (options.student)
     * @returns {Promise<void>}
     */
    async _buildDatosTrabajo(options) {
        const T = IncosPDFBase.FORMULARIO_TEXTS;
        const s = options.student || {};

        const leftColumnItems = [];
        const rightColumnItems = [];

        // Columna izquierda: Trabaja (Sí/No), Cargo
        const trabajaVal = s.trabaja === true || s.trabaja === 1 ? 'Sí' : 'No';
        leftColumnItems.push({ label: T.TRABAJA_LABEL, value: trabajaVal });

        const cargo = (s.cargo ?? '').toString().trim();
        if (cargo) {
            leftColumnItems.push({ label: T.CARGO_LABEL, value: cargo });
        }

        // Columna derecha: Empresa o institución
        const empresaInstitucion = (s.empresaInstitucion ?? s.empresa_institucion ?? '').toString().trim();
        if (empresaInstitucion) {
            rightColumnItems.push({ label: T.EMPRESA_INSTITUCION_LABEL, value: empresaInstitucion });
        }

        if (leftColumnItems.length > 0 || rightColumnItems.length > 0) {
            await this._addBoxedFieldGrid(leftColumnItems, rightColumnItems, 35);
        }
    }

    /**
     * II. DATOS ACADÉMICOS.
     * Una sola tabla a ancho completo (menos márgenes) con: CÓDIGO, ASIGNATURAS CARRERA: [nombre], HORAS, PARALELO.
     * Se eliminaron los campos sueltos de Carrera, Año y Paralelo a la izquierda.
     *
     * @private
     * @param {Object} options - Opciones de generación
     * @param {Object} [options.academicData] - Datos académicos (carreraNombre, carreraCodigo)
     * @param {Object} [options.enrollmentData] - Datos de inscripción (periodoNombre, paraleloLabel, materias[])
     * @returns {Promise<void>}
     */
    async _buildDatosAcademicos(options) {
        await this._addSection(IncosPDFBase.FORMULARIO_SECTION_TITLES.DATOS_ACADEMICOS);

        const academicData = options.academicData || {};
        const enrollmentData = options.enrollmentData || {};

        const carreraNombre = (academicData.carreraNombre || academicData.carrera_nombre || '').toString().trim();
        const fallbackParaleloLabel = (enrollmentData.paraleloLabel || enrollmentData.paralelo_label || '').toString().trim();

        const materias = enrollmentData.materias || [];
        const tableRows = [];
        for (const materia of materias) {
            const sigla = (materia.sigla || '').toString().trim();
            const nombre = (materia.nombre || '').toString().trim();
            const horas = materia.horas !== null && materia.horas !== undefined ? String(materia.horas) : '-';
            if (sigla || nombre) {
                // Columna PARALELO por materia: paralelo - turno (periodo) desde vista_estudiante_inscripcion_actual
                const paraleloTexto = this._formatParaleloColumna(materia, fallbackParaleloLabel);
                tableRows.push([
                    sigla || '-',
                    nombre || '-',
                    horas,
                    paraleloTexto,
                ]);
            }
        }

        if (tableRows.length > 0) {
            // Encabezado: ASIGNATURAS incluye "ASIGNATURAS CARRERA: [nombre]" en el cuadro verde
            const asignaturasHeader = carreraNombre
                ? `ASIGNATURAS CARRERA: ${carreraNombre}`
                : 'ASIGNATURAS';
            const headers = ['CÓDIGO', asignaturasHeader, 'HORAS', 'PARALELO'];
            const columnWidths = [0.18, 0.42, 0.12, 0.28]; // Código, Asignaturas, Horas, Paralelo
            const alignments = ['left', 'left', 'right', 'left'];

            const { width: pageWidth } = this._currentPage.getSize();
            const margins = IncosPDFBase.LAYOUT.margins;
            const fullWidth = pageWidth - margins.left - margins.right;

            await this._addTable(headers, columnWidths, tableRows, fullWidth, alignments, margins.left);
        } else {
            await this._addLabelValue('Datos académicos:', carreraNombre ? `Carrera: ${carreraNombre}. No hay materias inscritas.` : 'No hay datos académicos disponibles');
        }

        this._addSpace();
    }

    /**
     * III. DOCUMENTOS RECEPCIONADOS.
     * Solo se muestra cuando el tipo de admisión es NUEVO.
     * Para antiguo, traspaso o transitabilidad no se incluye esta sección (según reunión sistema).
     *
     * @private
     * @param {Object} options - Opciones de generación
     * @param {Array} [options.entregas] - Lista de entregas de documentos (con entregado: true)
     * @param {Object} [options.academicData] - Datos académicos (tipoAdmision)
     * @returns {Promise<void>}
     */
    async _buildDocumentosRecepcionados(options) {
        const tipoRaw = (options.academicData?.tipoAdmision ?? options.academicData?.tipo_admision ?? options.tipoAdmision ?? '')
            .toString()
            .trim()
            .toUpperCase();
        const soloNuevoMuestraDocumentos = tipoRaw === 'NUEVO';

        if (!soloNuevoMuestraDocumentos) {
            return;
        }

        await this._addSection(IncosPDFBase.FORMULARIO_SECTION_TITLES.DOCUMENTOS_RECEPCIONADOS);

        if (options.entregas && Array.isArray(options.entregas) && options.entregas.length > 0) {
            for (const entrega of options.entregas) {
                const nombreDocumento = entrega.nombre_documento || entrega.nombreDocumento || 'Documento sin nombre';
                await this._addBulletPoint(nombreDocumento);
            }
        } else {
            await this._addBulletPoint('No hay documentos entregados');
        }
    }

    /**
     * Construye el bloque de firma (footer) al final del documento.
     * Usa IncosPDFBase.SIGNATURE para los textos y options.student (ci, expedicion).
     * 
     * Opcionalmente puede usar firma en 2 columnas si se pasa options.signatureTwoColumns = true.
     *
     * @private
     * @param {Object} options - Opciones de generación
     * @param {boolean} [options.signatureTwoColumns] - Si true, muestra 2 firmas en columnas (estudiante y responsable)
     * @returns {Promise<void>}
     */
    async _buildFirma(options) {
        if (options.signatureTwoColumns) {
            await this._addSignatureBlockTwoColumns(options);
        } else {
            // Firma simple (igual que ActaCompromisoPdfGenerator)
            const label = IncosPDFBase.SIGNATURE.LABEL;
            let ci = (IncosPDFBase.SIGNATURE.CI_FORMAT || 'C.I.: {CI} {EXPEDICION}')
                .replace('{CI}', options.student?.ci ?? '')
                .replace('{EXPEDICION}', (options.student?.expedicion ?? '').toString().trim());
            ci = ci.replace(/\s+/g, ' ').trim();
            await this._addSignatureBlock({ lines: [label, ci] });
        }
    }

    /**
     * Construye bloque de firma en 2 columnas (estudiante y responsable).
     * 
     * @private
     * @param {Object} options - Opciones de generación
     * @returns {Promise<void>}
     */
    async _addSignatureBlockTwoColumns(options) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }

        const { width: pageWidth } = this._currentPage.getSize();
        const cfg = IncosPDFBase.LAYOUT;
        const margins = cfg.margins;
        const lineWidth = cfg.signatureLineWidth ?? 150;
        const lineThickness = cfg.signatureLineThickness ?? 1;
        const footerPadding = cfg.signatureFooterPadding ?? 10;
        const templateFooterHeight = cfg.signatureTemplateFooterHeight ?? 0;
        const spaceLineToFirst = cfg.signatureSpacingLineToFirstText ?? 8;
        const spaceBetweenLines = cfg.signatureSpacingBetweenTextLines ?? 4;
        const colGap = 50; // Espacio entre las dos columnas

        const normalFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font);
        const font = await this._pdfDoc.embedFont(normalFontName);
        const fontSize = IncosPDFBase.FONTS.normal.size;
        const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);

        // Bloque de firmas alineado a la derecha: ocupa un poco más de la mitad del ancho y no va centrado
        const totalWidth = pageWidth - margins.left - margins.right;
        const blockWidth = totalWidth * 0.58; // ~58% del ancho (un poco más de la mitad)
        const blockLeftX = margins.left + (totalWidth - blockWidth); // bloque pegado al lado derecho
        const leftColWidth = blockWidth * 0.42; // Estudiante: ~42% del bloque
        const rightColWidth = blockWidth - leftColWidth - colGap; // Resto para Responsable
        const leftColX = blockLeftX;
        const rightColX = blockLeftX + leftColWidth + colGap;

        // Líneas de texto para cada columna
        const leftLines = [
            'Estudiante',
            (IncosPDFBase.SIGNATURE.CI_FORMAT || 'C.I.: {CI} {EXPEDICION}')
                .replace('{CI}', options.student?.ci ?? '')
                .replace('{EXPEDICION}', (options.student?.expedicion ?? '').toString().trim())
                .replace(/\s+/g, ' ')
                .trim(),
        ];
        const rightLines = [
            'Responsable Inscripción',
            '',
        ];

        const blockHeight = lineThickness + spaceLineToFirst +
            Math.max(leftLines.length, rightLines.length) * fontSize +
            Math.max(0, Math.max(leftLines.length, rightLines.length) - 1) * spaceBetweenLines;
        const blockBottomY = margins.bottom + templateFooterHeight + footerPadding;
        const lineY = blockBottomY + blockHeight - lineThickness;

        // Dibujar líneas de firma para ambas columnas
        const halfLine = lineWidth / 2;
        const leftLineCenterX = leftColX + leftColWidth / 2;
        const rightLineCenterX = rightColX + rightColWidth / 2;

        // Línea izquierda (estudiante)
        this._currentPage.drawLine({
            start: { x: leftLineCenterX - halfLine, y: lineY },
            end: { x: leftLineCenterX + halfLine, y: lineY },
            thickness: lineThickness,
            color: textRgb,
        });

        // Línea derecha (responsable)
        this._currentPage.drawLine({
            start: { x: rightLineCenterX - halfLine, y: lineY },
            end: { x: rightLineCenterX + halfLine, y: lineY },
            thickness: lineThickness,
            color: textRgb,
        });

        // Dibujar textos debajo de las líneas
        let textY = lineY - lineThickness - spaceLineToFirst;

        // Columna izquierda
        for (let i = 0; i < leftLines.length; i++) {
            const str = String(leftLines[i] ?? '').trim();
            if (str) {
                const w = font.widthOfTextAtSize(str, fontSize);
                this._currentPage.drawText(str, {
                    x: leftLineCenterX - w / 2,
                    y: textY,
                    size: fontSize,
                    font,
                    color: textRgb,
                });
            }
            textY -= fontSize + (i < leftLines.length - 1 ? spaceBetweenLines : 0);
        }

        // Columna derecha
        textY = lineY - lineThickness - spaceLineToFirst;
        for (let i = 0; i < rightLines.length; i++) {
            const str = String(rightLines[i] ?? '').trim();
            if (str) {
                const w = font.widthOfTextAtSize(str, fontSize);
                this._currentPage.drawText(str, {
                    x: rightLineCenterX - w / 2,
                    y: textY,
                    size: fontSize,
                    font,
                    color: textRgb,
                });
            }
            textY -= fontSize + (i < rightLines.length - 1 ? spaceBetweenLines : 0);
        }
    }
}
