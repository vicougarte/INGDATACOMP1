export type ExpedidoBolivia = 'CB' | 'LP' | 'SC' | 'OR' | 'PT' | 'TJ' | 'CH' | 'BE' | 'PD';

export type TurnoEstudio = 'Mañana' | 'Tarde' | 'Noche' | 'Sábado';

export type EstadoEstudiante = 'Activo' | 'Suspendido' | 'Graduado' | 'Retirado';

export type EstadoCalificacion = 'Aprobado' | 'Segundo Turno' | 'Reprobado';

export type ModalidadCurso = 'Presencial' | 'Virtual' | 'Semipresencial';

export type EstadoCursoAcelerado = 'Inscripciones Abiertas' | 'En Curso' | 'Finalizado';

/**
 * Carrera Profesional Técnica (Régimen Anualizado - 3 Años)
 * Otorga Título en Provisión Nacional de Técnico Superior
 */
export interface Carrera {
  id: string;
  codigo: string;
  nombre: string;
  resolucion: string; // R.M. No. 0397/2024
  duracionAnios: number; // 3 años
  regimen: 'Anualizado';
  turnoDisponibles: TurnoEstudio[];
  color: string;
  duracionSemestres?: number; // Compatibilidad
}

/**
 * Asignatura Anual de una Carrera
 * Cada carrera anualizada tiene 8, 9 o 10 materias por año (1er Año, 2do Año, 3er Año)
 */
export interface Materia {
  id: string;
  carreraId: string;
  anio: 1 | 2 | 3; // 1 = 1er Año, 2 = 2do Año, 3 = 3er Año
  codigo: string; // ej: SIS-101
  nombre: string; // ej: Programación I y Lógica de Algoritmos
  cargaHoraria: number; // Horas académicas anuales (ej: 160, 120, 80)
  docente: string;
  creditos?: number;
  prerrequisito?: string; // ej: Ninguno o SIS-101
}

// Alias de retrocompatibilidad
export type Curso = Materia;

export type HorarioCursoAcelerado = 
  | '8 a 10'
  | '10 a 12'
  | '12 a 14'
  | '14 a 16'
  | '16 a 18'
  | '18 a 20'
  | '20 a 22';

export const HORARIOS_CURSOS_ACELERADOS: HorarioCursoAcelerado[] = [
  '8 a 10',
  '10 a 12',
  '12 a 14',
  '14 a 16',
  '16 a 18',
  '18 a 20',
  '20 a 22'
];

/**
 * Cursos Acelerados y de Capacitación Continua
 * Módulo independiente separado de las carreras anualizadas
 */
export interface CursoAcelerado {
  id: string;
  codigo: string; // ej: CA-01
  nombre: string; // ej: Computación Básica, Diseño Gráfico
  descripcion?: string;
  categoria?: string; // ej: Ofimática, Diseño, Programación
  modalidad: ModalidadCurso;
  duracion: string; // ej: 4 Semanas (40 Horas)
  cargaHoraria: number;
  docente: string;
  costoBs: number; // Precio base en Bolivianos
  costosDisponibles?: number[]; // Opciones de costo: ej: [160, 180, 200, 220]
  horario: string; // Horario general o por defecto
  horariosDisponibles?: HorarioCursoAcelerado[];
  subCursos?: string[]; // Módulos / sub-cursos a elegir
  cupoMaximo: number;
  inscritos: number;
  estado: EstadoCursoAcelerado;
  fechaInicio?: string;
  fechaFin?: string;
  editadoPorUsuario?: boolean;
}

/**
 * Registro de Alumno Inscrito a un Curso Acelerado
 */
export interface InscripcionCursoAcelerado {
  id: string;
  codigoInscripcion: string; // ej: INC-2026-001
  estudianteId?: string; // Opcional si ya existía en la base
  nombres: string;
  apellidos: string;
  ci: string;
  expedido: ExpedidoBolivia;
  telefono: string;
  email?: string;
  cursoId: string;
  cursoNombre: string;
  subCurso?: string; // Sub-curso seleccionado (únicamente para los 5 cursos que lo poseen)
  horario: HorarioCursoAcelerado;
  modalidad: 'Presencial' | 'Virtual';
  costoRealBs?: number; // Costo real del curso
  descuentoBs?: number; // Descuento aplicado
  costoBs: number; // Costo final = costoRealBs - descuentoBs
  montoPagadoBs: number;
  saldoBs: number;
  fechaInscripcion: string;
  fechaInicioCurso?: string;
  fechaFinCurso?: string;
  duracionCurso?: string;
  cargaHorariaCurso?: number;
  docenteCurso?: string;
  estado: 'Inscrito' | 'En Curso' | 'Finalizado' | 'Retirado';
  observaciones?: string;
}

export type TipoDescuento = 
  | 'Ninguno' 
  | 'Pronto Pago' 
  | 'Beca Excelencia' 
  | 'Descuento Hermanos' 
  | 'Convenio Institucional' 
  | 'Personalizado';

export type MetodoPago = 
  | 'Efectivo' 
  | 'Transferencia Bancaria' 
  | 'QR Simple' 
  | 'Tarjeta de Débito' 
  | 'Tigo Money';

export type EstadoPagoCuota = 'Cancelado' | 'Parcial' | 'Pendiente' | 'Vencido';

/**
 * Aranceles y Costos Oficiales por Carrera Técnica
 */
export interface CostoCarrera {
  carreraId: string;
  carreraCodigo: string;
  carreraNombre: string;
  costoMatriculaBs: number; // Costo anual de matriculación oficial (ej: 300 Bs)
  costoMensualidadBs: number; // Pensión mensual (ej: 380 Bs)
  numeroCuotas: number; // 10 cuotas mensuales por año de formación
  otrosCostosBs: number; // Seguro estudiantil y carnet institucional (ej: 50 Bs)
  descripcionOtrosCostos?: string;
  totalAnualBs: number; // Matrícula + (Pensión * 10) + Otros costos
}

/**
 * Registro de una transacción o abono económico individual
 */
export interface TransaccionPago {
  id: string;
  fecha: string;
  hora?: string;
  montoBs: number;
  metodoPago: MetodoPago;
  nroRecibo: string;
  cajero?: string;
  observaciones?: string;
}

/**
 * Almacena el estado de pago de una cuota de las 10 cuotas anuales
 */
export interface PagoCuotaEstudiante {
  id: string;
  estudianteId: string;
  codigoEstudiante: string;
  nombreEstudiante?: string;
  carreraId: string;
  anio: 1 | 2 | 3;
  gestion: string; // ej: 2026
  tipoPago: 'Matrícula' | 'Cuota Mensual' | 'Otros Aranceles';
  numeroCuota?: number; // 1 a 10 para mensualidades
  mesCorrespondiente?: string; // Febrero, Marzo, etc.
  fechaVencimiento?: string; // ej: 2026-03-10
  montoPactadoBs: number;
  montoPagadoBs: number;
  saldoPendienteBs: number;
  estado: EstadoPagoCuota;
  ultimoNroRecibo?: string;
  ultimaFechaPago?: string;
  ultimoMetodoPago?: MetodoPago;
  observaciones?: string;
  transacciones?: TransaccionPago[];
}

/**
 * Ficha de Estudiante
 */
export interface Estudiante {
  id: string;
  codigo: string; // ej: IDC-2026-001
  nombres: string;
  apellidos: string;
  ci: string;
  expedido: ExpedidoBolivia;
  email: string;
  telefono: string;
  carreraId: string;
  anioActual: 1 | 2 | 3; // 1er Año, 2do Año, 3er Año (Anualizado)
  semestreActual?: number; // Compatibilidad hacia atrás
  turno: TurnoEstudio;
  fechaInscripcion: string;
  estado: EstadoEstudiante;
  observaciones?: string;
  
  // Parámetros económicos de matrícula y aranceles
  costoMatriculaBs?: number;
  descuentoMatriculaBs?: number;
  montoMatriculaFinalBs?: number;
  costoMensualidadBs?: number;
  descuentoMensualidadBs?: number;
  montoMensualidadFinalBs?: number;
  tipoDescuento?: TipoDescuento;
  porcentajeDescuento?: number;
  otrosCostosBs?: number;
  conceptoOtrosCostos?: string;
  montoTotalGestionBs?: number;
  montoPagadoInicialBs?: number;
  saldoPendienteInicialBs?: number;
  metodoPagoInicial?: MetodoPago;
  nroReciboInicial?: string;
  fechaPagoInicial?: string;
}

/**
 * Calificación por Estudiante y Materia
 * Conectada directamente a la tabla de materias anuales
 */
export interface Calificacion {
  id: string;
  estudianteId: string;
  materiaId: string; // ID de la Asignatura Anual
  cursoId?: string; // Compatibilidad hacia atrás
  carreraId: string;
  anio: 1 | 2 | 3; // Año de formación (1er Año, 2do Año, 3er Año)
  periodo?: string; // Compatibilidad
  gestion: string; // ej: 2024, 2025, 2026
  primerParcial: number; // 1er Parcial (0 a 100 pts)
  segundoParcial: number; // 2do Parcial (0 a 100 pts)
  tercerParcial?: number; // 3er Parcial (0 a 100 pts)
  practicas?: number; // Evaluaciones prácticas / Trabajos (0 a 100 pts)
  examenFinal: number; // Examen Final (0 a 100 pts)
  segundoTurno?: number; // 2do Turno / 2da Instancia (0 a 100 pts)
  notaFinal: number; // Promedio / Calificación Definitiva (0 a 100 pts)
  estadoFinal: EstadoCalificacion;
  asistenciaPorcentaje?: number; // 0 a 100%
  turno?: TurnoEstudio; // Turno: Mañana, Tarde, Noche
  docente?: string; // Profesor / Docente Titular de la materia
  observaciones?: string;
  fechaRegistro: string;
  // Campos antiguos opcionales para compatibilidad
  parcial1?: number;
  parcial2?: number;
}

export interface ConfiguracionInstituto {
  nombre: string;
  siglas: string;
  subtitulo: string;
  ciudad: string;
  departamento: string;
  pais: string;
  direccion: string;
  telefono: string;
  email: string;
  resolucionMinisterial: string; // R.M. No. 0397/2024
  directorAcademico: string;
  secretariaGeneral: string;
  logoUrl?: string;
  gestionActual?: string;
  periodoActual?: string;
  escalaMinAprobacion?: number;
  escalaMinSegundoTurno?: number;
}
