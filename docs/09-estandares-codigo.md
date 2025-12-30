# 09 - ESTÁNDARES DE CÓDIGO Y BUENAS PRÁCTICAS
## Sistema de Gestión Académica - Instituto INCOS Santa Cruz

**Versión:** 1.0  
**Fecha:** Diciembre 2025  
**Estado:** Documento Base Consolidado

---

## 1. INTRODUCCIÓN

### 1.1 Propósito

Este documento establece los **estándares de código, convenciones de nomenclatura y buenas prácticas** que deben seguirse durante el desarrollo del Sistema de Gestión Académica del Instituto INCOS.

### 1.2 Objetivos

- **Consistencia:** Código uniforme y predecible
- **Legibilidad:** Código fácil de leer y entender
- **Mantenibilidad:** Código fácil de modificar y extender
- **Calidad:** Reducir bugs y problemas de producción

### 1.3 Herramientas de Calidad

- **ESLint:** Análisis estático de código JavaScript
- **Prettier:** Formateo automático de código
- **Husky:** Git hooks para validación pre-commit
- **Jest:** Framework de testing

---

## 2. CONVENCIONES DE NOMENCLATURA

### 2.1 JavaScript/Node.js

#### Variables y Funciones
```javascript
// ✅ CORRECTO: camelCase
const nombreEstudiante = 'Juan Pérez';
const calcularPromedio = (notas) => { ... };
let estadoActual = 'ACTIVO';

// ❌ INCORRECTO
const NombreEstudiante = 'Juan Pérez';  // PascalCase (solo para clases)
const nombre_estudiante = 'Juan Pérez'; // snake_case (solo BD)
const NOMBRE_ESTUDIANTE = 'Juan Pérez'; // SCREAMING_SNAKE_CASE (solo constantes)
```

#### Clases y Constructores
```javascript
// ✅ CORRECTO: PascalCase
class EstudianteService { ... }
class CalificacionController { ... }
class NotaValueObject { ... }

// ❌ INCORRECTO
class estudianteService { ... }
class calificacion_controller { ... }
```

#### Constantes
```javascript
// ✅ CORRECTO: SCREAMING_SNAKE_CASE
const MAX_INTENTOS_LOGIN = 5;
const NOTA_MINIMA_APROBACION = 60;
const ESTADOS_ACADEMICOS = {
  REGULAR: 'REGULAR',
  NIVELACION: 'NIVELACION',
  RETIRADO: 'RETIRADO'
};

// ❌ INCORRECTO
const maxIntentosLogin = 5;
const NotaMinimaAprobacion = 60;
```

#### Archivos
```javascript
// ✅ CORRECTO: kebab-case para archivos, PascalCase para clases
// Archivos:
estudiante.service.js
calificacion.controller.js
crear-estudiante.use-case.js

// Contenido:
class EstudianteService { ... }
class CalificacionController { ... }
class CrearEstudianteUseCase { ... }
```

#### Funciones Booleanas
```javascript
// ✅ CORRECTO: Prefijos is, has, can, should
const isEstudianteActivo = (estudiante) => { ... };
const hasPermisoEditar = (usuario, recurso) => { ... };
const canInscribirse = (estudiante, gestión) => { ... };
const shouldNotificarEstudiante = (evento) => { ... };

// ❌ INCORRECTO
const estudianteActivo = (estudiante) => { ... };
const permisoEditar = (usuario, recurso) => { ... };
```

### 2.2 Base de Datos (MySQL)

#### Tablas
```sql
-- ✅ CORRECTO: snake_case, plural
CREATE TABLE estudiantes ( ... );
CREATE TABLE inscripciones_materias ( ... );
CREATE TABLE becas_descuentos ( ... );

-- ❌ INCORRECTO
CREATE TABLE Estudiante ( ... );      -- PascalCase
CREATE TABLE estudiante ( ... );      -- Singular
CREATE TABLE inscripcionesMateria ( ... ); -- camelCase
```

#### Columnas
```sql
-- ✅ CORRECTO: snake_case
nombre_completo VARCHAR(200)
fecha_nacimiento DATE
estado_academico ENUM(...)
created_at TIMESTAMP

-- ❌ INCORRECTO
nombreCompleto VARCHAR(200)    -- camelCase
FechaNacimiento DATE          -- PascalCase
```

#### Claves Foráneas
```sql
-- ✅ CORRECTO: {tabla_referencia}_id
estudiante_id INT
carrera_id INT
gestion_id INT

-- ❌ INCORRECTO
id_estudiante INT
EstudianteId INT
```

### 2.3 React/Frontend

#### Componentes
```javascript
// ✅ CORRECTO: PascalCase
function EstudianteCard() { ... }
const CalificacionesTable = () => { ... };
export default InscripcionForm;

// ❌ INCORRECTO
function estudianteCard() { ... }
const calificaciones_table = () => { ... };
```

#### Props
```javascript
// ✅ CORRECTO: camelCase
<EstudianteCard 
  nombreCompleto="Juan Pérez"
  codigoEstudiante="EST-2025-0001"
  onEditClick={handleEdit}
/>

// ❌ INCORRECTO
<EstudianteCard 
  nombre_completo="Juan Pérez"    // snake_case
  CodigoEstudiante="EST-2025-0001" // PascalCase
/>
```

#### Custom Hooks
```javascript
// ✅ CORRECTO: Prefijo 'use' + camelCase
const useEstudiante = (id) => { ... };
const useCalificaciones = (cursoId) => { ... };
const useAuth = () => { ... };

// ❌ INCORRECTO
const estudiante = (id) => { ... };  // Falta prefijo 'use'
const UseCalificaciones = () => { ... }; // PascalCase
```

**Convenciones de Nombres por Tipo de Hook:**

**Hooks de API (Llamadas al Backend):**
```javascript
// ✅ CORRECTO: Formato use[Entidad]Api
const useEstudiantesApi = () => { ... };
const useBecasApi = () => { ... };
const useCarrerasApi = () => { ... };

// ❌ INCORRECTO
const useEstudiantes = () => { ... };  // No indica que es para API
const useFetchEstudiantes = () => { ... }; // No sigue el patrón
```

**Hooks de Feature (Lógica de UI por Feature):**
```javascript
// ✅ CORRECTO: Formato use[Entidad][Feature]
const useEstudiantesList = () => { ... };
const useEstudiantesBecas = () => { ... };
const useEstudiantesLicencias = () => { ... };

// ❌ INCORRECTO
const useEstudiantesTable = () => { ... };  // Demasiado genérico
const useList = () => { ... }; // No indica entidad
```

**Hooks Genéricos (Reutilizables):**
```javascript
// ✅ CORRECTO: Formato use[Funcionalidad]
const useTableData = () => { ... };
const useFormData = () => { ... };
const usePagination = () => { ... };

// ❌ INCORRECTO
const useEstudiantesTableData = () => { ... }; // No es genérico
const tableData = () => { ... }; // Falta prefijo 'use'
```

---

## 3. ESTRUCTURA DE CÓDIGO

### 3.1 Orden de Elementos en Archivos

```javascript
// 1. Imports externos
import express from 'express';
import jwt from 'jsonwebtoken';

// 2. Imports internos
import { EstudianteService } from '../services/EstudianteService.js';
import { ValidationError } from '../errors/ValidationError.js';

// 3. Imports de tipos (si usa TypeScript)
import type { Request, Response } from 'express';

// 4. Constantes
const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 20;

// 5. Funciones auxiliares privadas
function formatearNombreCompleto(nombres, apellidoPaterno, apellidoMaterno) {
  // ...
}

// 6. Clase o función principal
export class EstudianteController {
  // ...
}

// 7. Exports
export default EstudianteController;
```

### 3.2 Orden de Métodos en Clases

```javascript
class EstudianteController {
  // 1. Constructor
  constructor(estudianteService) {
    this.estudianteService = estudianteService;
  }
  
  // 2. Métodos públicos (en orden alfabético o lógico)
  async crear(req, res, next) { ... }
  async listar(req, res, next) { ... }
  async obtenerPorId(req, res, next) { ... }
  async actualizar(req, res, next) { ... }
  async eliminar(req, res, next) { ... }
  
  // 3. Métodos privados (prefijo _)
  _validarDatos(data) { ... }
  _calcularEdad(fechaNacimiento) { ... }
}
```

---

## 4. MEJORES PRÁCTICAS DE CÓDIGO

### 4.1 Funciones

#### Tamaño de Funciones
```javascript
// ✅ CORRECTO: Funciones pequeñas y específicas (< 50 líneas)
function calcularNotaFinal(nota1er, nota2do, nota3er, notaPractico) {
  const sumaParciales = nota1er + nota2do;
  const sumaTotal = sumaParciales + nota3er + notaPractico;
  return sumaTotal / 4;
}

function determinarEstadoAprobacion(notaFinal) {
  return notaFinal >= 60 ? 'APROBADO' : 'REPROBADO';
}

// ❌ INCORRECTO: Función muy larga (> 100 líneas)
function procesarCalificaciones(estudiante, materias, ...) {
  // 150 líneas de código haciendo muchas cosas...
}
```

#### Parámetros de Funciones
```javascript
// ✅ CORRECTO: Máximo 3-4 parámetros, usar objetos para más
function crearEstudiante({ nombres, apellidoPaterno, ci, carreraId, ... }) {
  // Fácil de extender sin romper firma
}

// ❌ INCORRECTO: Demasiados parámetros
function crearEstudiante(nombres, apellidoPaterno, apellidoMaterno, ci, 
  expedicion, complemento, fechaNacimiento, genero, celular, email, ...) {
  // 15+ parámetros = difícil de usar
}
```

#### Retorno Temprano
```javascript
// ✅ CORRECTO: Guard clauses (retorno temprano)
function puedeInscribirse(estudiante, gestión) {
  if (!estudiante.estadoAcademico === 'REGULAR') {
    return false;
  }
  
  if (gestión.estado !== 'INSCRIPCION_ABIERTA') {
    return false;
  }
  
  if (estudiante.tieneDeudas) {
    return false;
  }
  
  return true;
}

// ❌ INCORRECTO: Anidación profunda
function puedeInscribirse(estudiante, gestión) {
  if (estudiante.estadoAcademico === 'REGULAR') {
    if (gestión.estado === 'INSCRIPCION_ABIERTA') {
      if (!estudiante.tieneDeudas) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } else {
    return false;
  }
}
```

### 4.2 Variables

#### Nombres Descriptivos
```javascript
// ✅ CORRECTO: Nombres descriptivos
const estudiantesActivos = await obtenerEstudiantesPorEstado('ACTIVO');
const notaMinimaAprobacion = 60;
const tiempoEsperaSegundos = 30;

// ❌ INCORRECTO: Nombres crípticos
const e = await getE('ACTIVO');  // ¿Qué es 'e'?
const n = 60;                    // ¿Qué es 'n'?
const t = 30;                    // ¿Qué es 't'?
```

#### Evitar Variables Mágicas
```javascript
// ✅ CORRECTO: Constantes con nombres
const NOTA_MINIMA_APROBACION = 60;
const MAX_INTENTOS_NIVELACION = 3;

if (notaFinal >= NOTA_MINIMA_APROBACION) {
  return 'APROBADO';
}

// ❌ INCORRECTO: Números mágicos
if (notaFinal >= 60) {  // ¿Por qué 60?
  return 'APROBADO';
}
```

### 4.3 Comentarios

#### Comentarios Útiles
```javascript
// ✅ CORRECTO: Comentar el "por qué", no el "qué"
// Usamos bcrypt con 10 salt rounds por balance entre seguridad y rendimiento
const passwordHash = await bcrypt.hash(password, 10);

// RN-EST-006: Becas 100% requieren aprobación del Rector (Reglamento Interno 2024)
if (becaPorcentaje === 100 && !aprobadoPorRector) {
  throw new Error('Becas 100% requieren aprobación del Rector');
}

// ❌ INCORRECTO: Comentar lo obvio
// Obtener estudiante por ID
const estudiante = await estudianteRepository.findById(id);

// Sumar las notas
const suma = nota1 + nota2;
```

#### Comentarios TODO
```javascript
// ✅ CORRECTO: TODOs específicos con responsable y fecha
// TODO (Juan Pérez, 2025-12-15): Implementar notificación por email cuando se aprueba beca
// TODO (María López, 2026-01-10): Migrar a función asíncrona para mejor rendimiento

// ❌ INCORRECTO: TODOs vagos
// TODO: arreglar esto
// TODO: mejorar
```

### 4.4 Manejo de Errores

#### Try-Catch Específicos
```javascript
// ✅ CORRECTO: Manejo específico de errores
async function crearEstudiante(data) {
  try {
    const estudiante = await estudianteRepository.save(data);
    return estudiante;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new ValidationError('El CI ya está registrado');
    }
    
    if (error.name === 'ValidationError') {
      throw new ValidationError(error.message);
    }
    
    // Error inesperado
    logger.error('Error al crear estudiante:', error);
    throw new InternalServerError('Error al crear estudiante');
  }
}

// ❌ INCORRECTO: Tragar errores
async function crearEstudiante(data) {
  try {
    return await estudianteRepository.save(data);
  } catch (error) {
    console.log(error); // ❌ Solo console.log
    return null;        // ❌ Retornar null oculta el error
  }
}
```

#### Validaciones Explícitas
```javascript
// ✅ CORRECTO: Validaciones explícitas
function validarEdadMinima(fechaNacimiento) {
  if (!fechaNacimiento) {
    throw new ValidationError('Fecha de nacimiento es requerida');
  }
  
  const edad = calcularEdad(fechaNacimiento);
  
  if (edad < 16) {
    throw new ValidationError('El estudiante debe tener al menos 16 años');
  }
  
  return true;
}

// ❌ INCORRECTO: Validaciones implícitas
function validarEdadMinima(fechaNacimiento) {
  return calcularEdad(fechaNacimiento) >= 16; // ¿Por qué falló?
}
```

### 4.5 Programación Funcional

#### Inmutabilidad
```javascript
// ✅ CORRECTO: No mutar objetos/arrays
const estudiantesActivos = estudiantes.filter(e => e.estado === 'ACTIVO');
const nuevaBeca = { ...becaExistente, porcentaje: 50 };

// ❌ INCORRECTO: Mutación directa
estudiantes.push(nuevoEstudiante); // Modifica array original
becaExistente.porcentaje = 50;    // Modifica objeto original
```

#### Métodos de Arrays
```javascript
// ✅ CORRECTO: Usar métodos funcionales
const estudiantesAprobados = inscripciones
  .filter(i => i.notaFinal >= 60)
  .map(i => i.estudiante);

const promedioGeneral = notas.reduce((sum, nota) => sum + nota, 0) / notas.length;

// ❌ INCORRECTO: Usar loops cuando no es necesario
const estudiantesAprobados = [];
for (let i = 0; i < inscripciones.length; i++) {
  if (inscripciones[i].notaFinal >= 60) {
    estudiantesAprobados.push(inscripciones[i].estudiante);
  }
}
```

### 4.6 Async/Await

#### Manejo Correcto
```javascript
// ✅ CORRECTO: Await en funciones async
async function obtenerEstudianteConInscripciones(id) {
  const estudiante = await estudianteRepository.findById(id);
  const inscripciones = await inscripcionRepository.findByEstudianteId(id);
  
  return { ...estudiante, inscripciones };
}

// ✅ CORRECTO: Operaciones paralelas con Promise.all
async function obtenerDatosCompletos(id) {
  const [estudiante, inscripciones, becas] = await Promise.all([
    estudianteRepository.findById(id),
    inscripcionRepository.findByEstudianteId(id),
    becaRepository.findByEstudianteId(id)
  ]);
  
  return { estudiante, inscripciones, becas };
}

// ❌ INCORRECTO: Olvidar await
async function obtenerEstudiante(id) {
  const estudiante = estudianteRepository.findById(id); // ❌ Falta await
  return estudiante; // Retorna Promise, no el estudiante
}
```

---

## 5. ORGANIZACIÓN DE CÓDIGO

### 5.1 Principios SOLID

#### Single Responsibility Principle (SRP)
```javascript
// ✅ CORRECTO: Una clase, una responsabilidad
class EstudianteRepository {
  async findById(id) { ... }
  async save(estudiante) { ... }
  async update(id, data) { ... }
  async delete(id) { ... }
}

class EstudianteValidator {
  validarDatosCreacion(data) { ... }
  validarCI(ci, expedicion) { ... }
  validarEmail(email) { ... }
}

// ❌ INCORRECTO: Clase con múltiples responsabilidades
class EstudianteManager {
  // Persistencia
  async save(estudiante) { ... }
  async delete(id) { ... }
  
  // Validación
  validarDatos(data) { ... }
  
  // Envío de emails
  enviarEmailBienvenida(email) { ... }
  
  // Generación de PDFs
  generarHistorialPDF(id) { ... }
}
```

#### Dependency Injection
```javascript
// ✅ CORRECTO: Inyección de dependencias
class CrearEstudianteUseCase {
  constructor(estudianteRepository, becaRepository, emailService) {
    this.estudianteRepository = estudianteRepository;
    this.becaRepository = becaRepository;
    this.emailService = emailService;
  }
  
  async execute(data) {
    // Usar las dependencias inyectadas
  }
}

// Uso
const useCase = new CrearEstudianteUseCase(
  new EstudianteRepository(),
  new BecaRepository(),
  new EmailService()
);

// ❌ INCORRECTO: Dependencias hardcodeadas
class CrearEstudianteUseCase {
  async execute(data) {
    const repository = new EstudianteRepository(); // ❌ Hardcoded
    const emailService = new EmailService();      // ❌ Hardcoded
    // ...
  }
}
```

### 5.2 DRY (Don't Repeat Yourself)

```javascript
// ✅ CORRECTO: Extraer código duplicado
function formatearNombreCompleto(nombres, apellidoPaterno, apellidoMaterno) {
  return `${nombres} ${apellidoPaterno} ${apellidoMaterno || ''}`.trim();
}

const nombreEstudiante = formatearNombreCompleto(
  estudiante.nombres, 
  estudiante.apellidoPaterno, 
  estudiante.apellidoMaterno
);

const nombreDocente = formatearNombreCompleto(
  docente.nombres, 
  docente.apellidoPaterno, 
  docente.apellidoMaterno
);

// ❌ INCORRECTO: Duplicación de código
const nombreEstudiante = `${estudiante.nombres} ${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno || ''}`.trim();
const nombreDocente = `${docente.nombres} ${docente.apellidoPaterno} ${docente.apellidoMaterno || ''}`.trim();
```

---

## 6. CONFIGURACIÓN DE HERRAMIENTAS

### 6.1 ESLint (.eslintrc.json)

```json
{
  "env": {
    "node": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended",
    "airbnb-base"
  ],
  "parserOptions": {
    "ecmaVersion": 2021,
    "sourceType": "module"
  },
  "rules": {
    "no-console": "warn",
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "max-len": ["error", { "code": 100, "ignoreComments": true }],
    "indent": ["error", 2],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "comma-dangle": ["error", "never"],
    "arrow-parens": ["error", "always"],
    "no-param-reassign": ["error", { "props": false }]
  }
}
```

### 6.2 Prettier (.prettierrc)

```json
{
  "semi": true,
  "trailingComma": "none",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### 6.3 Husky (Pre-commit Hook)

```json
// package.json
{
  "scripts": {
    "lint": "eslint src/**/*.js",
    "lint:fix": "eslint src/**/*.js --fix",
    "format": "prettier --write \"src/**/*.js\"",
    "test": "jest"
  },
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint && npm test"
    }
  }
}
```

---

## 7. DOCUMENTACIÓN DE CÓDIGO

### 7.1 JSDoc

```javascript
/**
 * Crea un nuevo estudiante en el sistema
 * 
 * @param {Object} data - Datos del estudiante
 * @param {string} data.nombres - Nombres del estudiante
 * @param {string} data.apellidoPaterno - Apellido paterno
 * @param {string} data.ci - Cédula de identidad
 * @param {number} data.carreraId - ID de la carrera
 * @returns {Promise<Estudiante>} Estudiante creado
 * @throws {ValidationError} Si los datos son inválidos
 * @throws {ConflictError} Si el CI ya está registrado
 * 
 * @example
 * const estudiante = await crearEstudiante({
 *   nombres: 'Juan Carlos',
 *   apellidoPaterno: 'Pérez',
 *   ci: '12345678',
 *   carreraId: 1
 * });
 */
async function crearEstudiante(data) {
  // ...
}
```

### 7.2 README.md en Módulos

```markdown
# Módulo de Estudiantes

## Descripción
Gestión completa de estudiantes del instituto.

## Estructura
- `controllers/` - Controladores HTTP
- `services/` - Lógica de negocio
- `repositories/` - Acceso a datos
- `validators/` - Validaciones

## Uso
\`\`\`javascript
import { EstudianteController } from './controllers/EstudianteController';
const controller = new EstudianteController();
\`\`\`

## Dependencias
- `sequelize` - ORM
- `express-validator` - Validación de inputs
```

---

## 8. TESTING

### 8.1 Estructura de Tests

```javascript
// ✅ CORRECTO: Tests organizados con describe/it
describe('EstudianteService', () => {
  describe('crearEstudiante', () => {
    it('debe crear un estudiante con datos válidos', async () => {
      // Arrange
      const data = {
        nombres: 'Juan',
        apellidoPaterno: 'Pérez',
        ci: '12345678',
        carreraId: 1
      };
      
      // Act
      const estudiante = await estudianteService.crearEstudiante(data);
      
      // Assert
      expect(estudiante).toBeDefined();
      expect(estudiante.nombres).toBe('Juan');
      expect(estudiante.codigoEstudiante).toMatch(/^EST-\d{4}-\d{4}$/);
    });
    
    it('debe lanzar error si el CI está duplicado', async () => {
      // ...
      await expect(estudianteService.crearEstudiante(data))
        .rejects
        .toThrow('El CI ya está registrado');
    });
  });
});
```

### 8.2 Cobertura de Tests

**Objetivo:** >70% en módulos críticos

```bash
# Ejecutar tests con cobertura
npm run test:coverage

# Ver reporte
open coverage/lcov-report/index.html
```

---

## 9. GIT Y CONTROL DE VERSIONES

### 9.1 Commits Convencionales

**Formato:** `tipo(scope): descripción`

**Tipos:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formateo (sin cambios de código)
- `refactor`: Refactorización
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

**Ejemplos:**
```bash
✅ feat(estudiantes): agregar endpoint para cambiar estado académico
✅ fix(calificaciones): corregir cálculo de nota final
✅ docs(api): actualizar documentación de endpoint de inscripciones
✅ refactor(auth): simplificar lógica de validación de JWT
✅ test(estudiantes): agregar tests para validación de CI

❌ "arreglé un bug"
❌ "cambios varios"
❌ "wip"
```

### 9.2 Branching Strategy

```
main (producción)
  ↑
develop (integración)
  ↑
feature/nombre-feature (nuevas funcionalidades)
hotfix/nombre-hotfix (correcciones urgentes)
```

**Ejemplo:**
```bash
# Nueva funcionalidad
git checkout -b feature/inscripciones-materias

# Hotfix
git checkout -b hotfix/calculo-nota-final
```

---

## 10. SEGURIDAD

### 10.1 Validación de Inputs

```javascript
// ✅ CORRECTO: Validar TODOS los inputs
const crearEstudianteValidator = [
  body('nombres').trim().notEmpty().isLength({ max: 100 }),
  body('apellidoPaterno').trim().notEmpty().isLength({ max: 100 }),
  body('ci').trim().notEmpty().matches(/^\d{7,10}$/),
  body('email').optional().isEmail().normalizeEmail(),
  body('carreraId').isInt({ min: 1 })
];

// ❌ INCORRECTO: Confiar en inputs sin validar
function crearEstudiante(req, res) {
  const { nombres, ci, carreraId } = req.body;
  // Usar directamente sin validar ❌
}
```

### 10.2 SQL Injection Prevention

```javascript
// ✅ CORRECTO: Usar ORM con prepared statements
const estudiante = await Estudiante.findOne({
  where: { ci: req.query.ci }
});

// ❌ INCORRECTO: Concatenación de strings
const query = `SELECT * FROM estudiantes WHERE ci = '${req.query.ci}'`;
const estudiante = await db.query(query); // ❌ SQL Injection!
```

### 10.3 Datos Sensibles

```javascript
// ✅ CORRECTO: No loguear datos sensibles
logger.info('Usuario logueado', {
  userId: user.id,
  username: user.username
  // ❌ NO incluir: password, tokens, CI completo
});

// ✅ CORRECTO: Sanitizar responses
function toJSON(estudiante) {
  return {
    id: estudiante.id,
    nombres: estudiante.nombres,
    // ... otros campos públicos
    // ❌ NO incluir: passwordHash, tokens internos
  };
}
```

---

## 11. RENDIMIENTO

### 11.1 Optimización de Consultas

```javascript
// ✅ CORRECTO: Eager loading cuando es necesario
const estudiante = await Estudiante.findByPk(id, {
  include: [
    { model: Carrera },
    { model: Inscripcion, include: [Gestion] }
  ]
});

// ❌ INCORRECTO: N+1 queries
const estudiantes = await Estudiante.findAll();
for (const est of estudiantes) {
  est.carrera = await Carrera.findByPk(est.carreraId); // ❌ N+1
}
```

### 11.2 Caché cuando sea Apropiado

```javascript
// ✅ CORRECTO: Cachear datos que cambian poco
const carreras = await cache.get('carreras') || await Carrera.findAll();
if (!cache.has('carreras')) {
  cache.set('carreras', carreras, 3600); // 1 hora
}

// ❌ INCORRECTO: Consultar BD en cada request para datos estáticos
const carreras = await Carrera.findAll(); // Cada request ❌
```

---

## RESUMEN DE ESTÁNDARES CLAVE

| Aspecto | Estándar |
|---------|----------|
| Variables | camelCase |
| Funciones | camelCase |
| Clases | PascalCase |
| Constantes | SCREAMING_SNAKE_CASE |
| Archivos | kebab-case.extension.js |
| Tablas BD | snake_case (plural) |
| Columnas BD | snake_case |
| Componentes React | PascalCase |
| Longitud de funciones | < 50 líneas |
| Parámetros de función | ≤ 4 (usar objetos si más) |
| Cobertura de tests | > 70% en módulos críticos |
| Formato de commits | tipo(scope): descripción |

---

## CONTROL DE VERSIONES

| Versión | Fecha | Autor | Descripción |
|---------|-------|-------|-------------|
| 1.0 | 2025-12-08 | Equipo de Desarrollo | Estándares iniciales |

---

**FIN DEL DOCUMENTO - 09 ESTÁNDARES DE CÓDIGO**
