import React, { useState, useMemo, useEffect } from 'react';
import { 
  Carrera, 
  Materia, 
  Estudiante, 
  Calificacion, 
  EstadoCalificacion,
  TurnoEstudio,
  ConfiguracionInstituto
} from '../types';
import { 
  FileCheck2, 
  Save, 
  Search, 
  User, 
  BookOpen, 
  AlertCircle, 
  CheckCircle2, 
  Award, 
  Layers, 
  TrendingUp,
  Sparkles,
  Printer,
  RotateCcw,
  GraduationCap,
  Filter,
  Clock,
  Briefcase,
  Users,
  Check,
  XCircle,
  FileSpreadsheet
} from 'lucide-react';
import { imprimirElementoUniversal } from '../services/printService';

interface CalificacionesViewProps {
  carreras: Carrera[];
  materias: Materia[];
  estudiantes: Estudiante[];
  calificaciones: Calificacion[];
  institutoConfig?: ConfiguracionInstituto;
  customLogoUrl?: string | null;
  onGuardarCalificacionesLote: (calificaciones: Calificacion[]) => void;
  onIrACarreras?: () => void;
  onRestaurarBaseDatos?: () => void;
}

export const CalificacionesView: React.FC<CalificacionesViewProps> = ({
  carreras,
  materias,
  estudiantes,
  calificaciones,
  institutoConfig,
  customLogoUrl,
  onGuardarCalificacionesLote,
  onIrACarreras,
  onRestaurarBaseDatos
}) => {
  // Modo de visualización:
  // 1. 'por-materia': Planilla de calificaciones por materia, profesor, turno, carrera y año
  // 2. 'por-estudiante': Kárdex anual individual del alumno
  // 3. 'reportes': Reportes dinámicos de calificaciones visualizados e impresos
  const [modo, setModo] = useState<'por-materia' | 'por-estudiante' | 'reportes'>('por-materia');

  // --- FILTROS DE INGRESO POR MATERIA (PLANILLA) ---
  const [carreraSel, setCarreraSel] = useState<string>(carreras[0]?.id || 'car-1');
  const [anioSel, setAnioSel] = useState<1 | 2 | 3>(1);
  const [materiaIdSel, setMateriaIdSel] = useState<string>('');
  const [turnoSel, setTurnoSel] = useState<TurnoEstudio | 'Todos'>('Todos');
  const [profesorMateria, setProfesorMateria] = useState<string>('');
  const [gestionSel, setGestionSel] = useState<string>('2026');

  // --- FILTROS PARA MODO ESTUDIANTE (KÁRDEX) ---
  const [estudianteIdSel, setEstudianteIdSel] = useState<string>(estudiantes[0]?.id || '');
  const [busquedaEstudianteKardex, setBusquedaEstudianteKardex] = useState<string>('');

  // --- FILTROS PARA MODO REPORTES ---
  const [repCarreraId, setRepCarreraId] = useState<string>('todas');
  const [repAnio, setRepAnio] = useState<string>('todos');
  const [repMateriaId, setRepMateriaId] = useState<string>('todas');
  const [repTurno, setRepTurno] = useState<string>('todos');
  const [repEstudianteId, setRepEstudianteId] = useState<string>('todos');
  const [repEstado, setRepEstado] = useState<string>('todos');
  const [busquedaReporte, setBusquedaReporte] = useState<string>('');

  // Mensaje de éxito
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Logo institucional oficial
  const logoInstituto = customLogoUrl || institutoConfig?.logoUrl || '/logo-ingdatacomp.png';

  // Materias filtradas por Carrera y Año seleccionados
  const materiasDelAnio = useMemo(() => {
    return materias.filter(m => m.carreraId === carreraSel && m.anio === anioSel);
  }, [materias, carreraSel, anioSel]);

  // Asignar primera materia por defecto si no está seleccionada
  useEffect(() => {
    if (materiasDelAnio.length > 0) {
      const existe = materiasDelAnio.some(m => m.id === materiaIdSel);
      if (!existe) {
        setMateriaIdSel(materiasDelAnio[0].id);
        setProfesorMateria(materiasDelAnio[0].docente || '');
      } else {
        const mat = materiasDelAnio.find(m => m.id === materiaIdSel);
        if (mat) setProfesorMateria(mat.docente || '');
      }
    } else {
      setMateriaIdSel('');
      setProfesorMateria('');
    }
  }, [materiasDelAnio, materiaIdSel]);

  // Al cambiar de materia directamente
  const handleCambioMateria = (nuevaMateriaId: string) => {
    setMateriaIdSel(nuevaMateriaId);
    const mat = materias.find(m => m.id === nuevaMateriaId);
    if (mat) {
      setProfesorMateria(mat.docente || '');
    }
  };

  // Objeto de la materia actualmente seleccionada en planilla
  const materiaActual = useMemo(() => {
    return materias.find(m => m.id === materiaIdSel) || materiasDelAnio[0];
  }, [materias, materiaIdSel, materiasDelAnio]);

  // Objeto de la carrera seleccionada
  const carreraActual = useMemo(() => {
    return carreras.find(c => c.id === carreraSel) || carreras[0];
  }, [carreras, carreraSel]);

  // Alumnos que corresponden a esta carrera y año (y filtro de turno si no es 'Todos')
  const alumnosDeLaMateria = useMemo(() => {
    return estudiantes.filter(e => {
      const matchCarrera = e.carreraId === carreraSel;
      const matchAnio = (e.anioActual || 1) === anioSel;
      const matchTurno = turnoSel === 'Todos' || e.turno === turnoSel;
      return matchCarrera && matchAnio && matchTurno;
    });
  }, [estudiantes, carreraSel, anioSel, turnoSel]);

  // Estado editable local (draft) de la planilla de calificaciones para los alumnos de la materia
  const [draftPlanilla, setDraftPlanilla] = useState<Record<string, Partial<Calificacion>>>({});

  // Cargar calificaciones existentes en la planilla
  useEffect(() => {
    if (!materiaActual) return;
    const nuevoDraft: Record<string, Partial<Calificacion>> = {};

    alumnosDeLaMateria.forEach(est => {
      const califExistente = calificaciones.find(
        c => c.estudianteId === est.id && (c.materiaId === materiaActual.id || c.cursoId === materiaActual.id)
      );

      if (califExistente) {
        nuevoDraft[est.id] = { 
          ...califExistente,
          tercerParcial: califExistente.tercerParcial ?? califExistente.practicas ?? 0,
          turno: est.turno,
          docente: profesorMateria || materiaActual.docente || ''
        };
      } else {
        nuevoDraft[est.id] = {
          id: `cal-${est.id}-${materiaActual.id}-${gestionSel}`,
          estudianteId: est.id,
          materiaId: materiaActual.id,
          cursoId: materiaActual.id,
          carreraId: carreraSel,
          anio: anioSel,
          gestion: gestionSel,
          primerParcial: 0,
          segundoParcial: 0,
          tercerParcial: 0,
          examenFinal: 0,
          segundoTurno: undefined,
          notaFinal: 0,
          estadoFinal: 'Reprobado',
          asistenciaPorcentaje: 95,
          turno: est.turno,
          docente: profesorMateria || materiaActual.docente || '',
          observaciones: ''
        };
      }
    });

    setDraftPlanilla(nuevoDraft);
    setMensajeExito(null);
  }, [materiaActual, alumnosDeLaMateria, calificaciones, carreraSel, anioSel, gestionSel, profesorMateria]);

  // Actualizar un campo de notas de un alumno en la planilla
  const handleCambioNotaPlanilla = (
    estudianteId: string, 
    campo: 'primerParcial' | 'segundoParcial' | 'tercerParcial' | 'examenFinal' | 'segundoTurno', 
    valorStr: string
  ) => {
    setDraftPlanilla(prev => {
      const actual = prev[estudianteId] || {};
      const numValor = valorStr === '' ? 0 : Math.max(0, Math.min(100, Number(valorStr)));
      
      const actualizado = { 
        ...actual, 
        [campo]: campo === 'segundoTurno' && valorStr === '' ? undefined : numValor 
      };

      // Cálculo de Promedios según reglamentación oficial:
      // 3 Parciales y un Final
      const p1 = Number(actualizado.primerParcial || 0);
      const p2 = Number(actualizado.segundoParcial || 0);
      const p3 = Number(actualizado.tercerParcial || 0);
      const ef = Number(actualizado.examenFinal || 0);
      const st = actualizado.segundoTurno !== undefined && actualizado.segundoTurno !== null 
        ? Number(actualizado.segundoTurno) 
        : null;

      // Promedio Regular Ordinario = (P1 + P2 + P3 + Final) / 4
      const promedioRegular = Math.round((p1 + p2 + p3 + ef) / 4);

      let notaDefinitiva = promedioRegular;
      let estado: EstadoCalificacion = promedioRegular >= 51 ? 'Aprobado' : 'Reprobado';

      // Si entra a 2do Turno (2da Instancia):
      if (st !== null && !isNaN(st) && st > 0) {
        if (st >= 51) {
          // En la normativa boliviana, al aprobar en segundo turno la nota máxima asignada es 51
          notaDefinitiva = 51;
          estado = 'Segundo Turno';
        } else {
          notaDefinitiva = Math.max(promedioRegular, st);
          estado = 'Reprobado';
        }
      } else if (promedioRegular >= 36 && promedioRegular < 51) {
        // En zona de 2do turno pendiente
        estado = 'Segundo Turno';
      }

      actualizado.notaFinal = notaDefinitiva;
      actualizado.estadoFinal = estado;
      actualizado.docente = profesorMateria || materiaActual?.docente || '';

      return {
        ...prev,
        [estudianteId]: actualizado
      };
    });
  };

  // Guardar todas las notas de la planilla por materia
  const handleGuardarPlanilla = () => {
    if (!materiaActual) return;
    const listaParaGuardar: Calificacion[] = [];

    alumnosDeLaMateria.forEach(est => {
      const draft = draftPlanilla[est.id];
      if (draft) {
        const p1 = Number(draft.primerParcial || 0);
        const p2 = Number(draft.segundoParcial || 0);
        const p3 = Number(draft.tercerParcial || 0);
        const ef = Number(draft.examenFinal || 0);
        const st = draft.segundoTurno !== undefined && draft.segundoTurno !== null && !isNaN(Number(draft.segundoTurno)) && Number(draft.segundoTurno) > 0
          ? Number(draft.segundoTurno)
          : undefined;

        const promReg = Math.round((p1 + p2 + p3 + ef) / 4);
        let nFin = promReg;
        let estFin: EstadoCalificacion = promReg >= 51 ? 'Aprobado' : 'Reprobado';

        if (st !== undefined) {
          if (st >= 51) {
            nFin = 51;
            estFin = 'Segundo Turno';
          } else {
            nFin = Math.max(promReg, st);
            estFin = 'Reprobado';
          }
        }

        listaParaGuardar.push({
          id: draft.id || `cal-${est.id}-${materiaActual.id}-${gestionSel}`,
          estudianteId: est.id,
          materiaId: materiaActual.id,
          cursoId: materiaActual.id,
          carreraId: carreraSel,
          anio: anioSel,
          gestion: gestionSel,
          primerParcial: p1,
          segundoParcial: p2,
          tercerParcial: p3,
          practicas: p3,
          examenFinal: ef,
          segundoTurno: st,
          notaFinal: nFin,
          estadoFinal: estFin,
          asistenciaPorcentaje: Number(draft.asistenciaPorcentaje || 95),
          turno: est.turno,
          docente: profesorMateria || materiaActual.docente || '',
          observaciones: draft.observaciones || '',
          fechaRegistro: new Date().toISOString().slice(0, 10)
        });
      }
    });

    onGuardarCalificacionesLote(listaParaGuardar);
    setMensajeExito(`¡Se registraron y guardaron exitosamente las calificaciones de ${listaParaGuardar.length} alumno(s) para "${materiaActual.nombre}"!`);
    setTimeout(() => setMensajeExito(null), 5000);
  };

  // --- MODO ESTUDIANTE (KÁRDEX INDIVIDUAL) ---
  const estudianteActualKardex = useMemo(() => {
    return estudiantes.find(e => e.id === estudianteIdSel) || estudiantes[0];
  }, [estudiantes, estudianteIdSel]);

  const carreraEstudianteKardex = useMemo(() => {
    if (!estudianteActualKardex) return carreras[0];
    return carreras.find(c => c.id === estudianteActualKardex.carreraId) || carreras[0];
  }, [estudianteActualKardex, carreras]);

  const anioEstudianteKardex = (estudianteActualKardex?.anioActual || 1) as 1 | 2 | 3;

  const materiasEstudianteKardex = useMemo(() => {
    if (!carreraEstudianteKardex) return [];
    return materias.filter(m => m.carreraId === carreraEstudianteKardex.id && m.anio === anioEstudianteKardex);
  }, [materias, carreraEstudianteKardex, anioEstudianteKardex]);

  const [draftKardex, setDraftKardex] = useState<Record<string, Partial<Calificacion>>>({});

  useEffect(() => {
    if (!estudianteActualKardex) return;
    const nuevoDraft: Record<string, Partial<Calificacion>> = {};

    materiasEstudianteKardex.forEach(mat => {
      const califExistente = calificaciones.find(
        c => c.estudianteId === estudianteActualKardex.id && (c.materiaId === mat.id || c.cursoId === mat.id)
      );

      if (califExistente) {
        nuevoDraft[mat.id] = { 
          ...califExistente,
          tercerParcial: califExistente.tercerParcial ?? califExistente.practicas ?? 0,
          turno: estudianteActualKardex.turno,
          docente: mat.docente || ''
        };
      } else {
        nuevoDraft[mat.id] = {
          id: `cal-${estudianteActualKardex.id}-${mat.id}-${gestionSel}`,
          estudianteId: estudianteActualKardex.id,
          materiaId: mat.id,
          cursoId: mat.id,
          carreraId: carreraEstudianteKardex.id,
          anio: anioEstudianteKardex,
          gestion: gestionSel,
          primerParcial: 0,
          segundoParcial: 0,
          tercerParcial: 0,
          examenFinal: 0,
          segundoTurno: undefined,
          notaFinal: 0,
          estadoFinal: 'Reprobado',
          asistenciaPorcentaje: 95,
          turno: estudianteActualKardex.turno,
          docente: mat.docente || '',
          observaciones: ''
        };
      }
    });

    setDraftKardex(nuevoDraft);
  }, [estudianteActualKardex, materiasEstudianteKardex, calificaciones, carreraEstudianteKardex, anioEstudianteKardex, gestionSel]);

  const handleCambioNotaKardex = (
    materiaId: string, 
    campo: 'primerParcial' | 'segundoParcial' | 'tercerParcial' | 'examenFinal' | 'segundoTurno', 
    valorStr: string
  ) => {
    setDraftKardex(prev => {
      const actual = prev[materiaId] || {};
      const numValor = valorStr === '' ? 0 : Math.max(0, Math.min(100, Number(valorStr)));
      
      const actualizado = { 
        ...actual, 
        [campo]: campo === 'segundoTurno' && valorStr === '' ? undefined : numValor 
      };

      const p1 = Number(actualizado.primerParcial || 0);
      const p2 = Number(actualizado.segundoParcial || 0);
      const p3 = Number(actualizado.tercerParcial || 0);
      const ef = Number(actualizado.examenFinal || 0);
      const st = actualizado.segundoTurno !== undefined && actualizado.segundoTurno !== null 
        ? Number(actualizado.segundoTurno) 
        : null;

      const prom = Math.round((p1 + p2 + p3 + ef) / 4);
      let nFin = prom;
      let est: EstadoCalificacion = prom >= 51 ? 'Aprobado' : 'Reprobado';

      if (st !== null && !isNaN(st) && st > 0) {
        if (st >= 51) {
          nFin = 51;
          est = 'Segundo Turno';
        } else {
          nFin = Math.max(prom, st);
          est = 'Reprobado';
        }
      } else if (prom >= 36 && prom < 51) {
        est = 'Segundo Turno';
      }

      actualizado.notaFinal = nFin;
      actualizado.estadoFinal = est;

      return {
        ...prev,
        [materiaId]: actualizado
      };
    });
  };

  const handleGuardarKardexEstudiante = () => {
    if (!estudianteActualKardex) return;
    const lista: Calificacion[] = [];

    materiasEstudianteKardex.forEach(mat => {
      const draft = draftKardex[mat.id];
      if (draft) {
        const p1 = Number(draft.primerParcial || 0);
        const p2 = Number(draft.segundoParcial || 0);
        const p3 = Number(draft.tercerParcial || 0);
        const ef = Number(draft.examenFinal || 0);
        const st = draft.segundoTurno !== undefined && draft.segundoTurno !== null && !isNaN(Number(draft.segundoTurno)) && Number(draft.segundoTurno) > 0
          ? Number(draft.segundoTurno)
          : undefined;

        const prom = Math.round((p1 + p2 + p3 + ef) / 4);
        let nFin = prom;
        let est: EstadoCalificacion = prom >= 51 ? 'Aprobado' : 'Reprobado';

        if (st !== undefined) {
          if (st >= 51) {
            nFin = 51;
            est = 'Segundo Turno';
          } else {
            nFin = Math.max(prom, st);
            est = 'Reprobado';
          }
        }

        lista.push({
          id: draft.id || `cal-${estudianteActualKardex.id}-${mat.id}-${gestionSel}`,
          estudianteId: estudianteActualKardex.id,
          materiaId: mat.id,
          cursoId: mat.id,
          carreraId: carreraEstudianteKardex.id,
          anio: anioEstudianteKardex,
          gestion: gestionSel,
          primerParcial: p1,
          segundoParcial: p2,
          tercerParcial: p3,
          practicas: p3,
          examenFinal: ef,
          segundoTurno: st,
          notaFinal: nFin,
          estadoFinal: est,
          asistenciaPorcentaje: Number(draft.asistenciaPorcentaje || 95),
          turno: estudianteActualKardex.turno,
          docente: mat.docente || '',
          observaciones: draft.observaciones || '',
          fechaRegistro: new Date().toISOString().slice(0, 10)
        });
      }
    });

    onGuardarCalificacionesLote(lista);
    setMensajeExito(`¡Se guardaron las calificaciones de las ${lista.length} materias de ${estudianteActualKardex.nombres} ${estudianteActualKardex.apellidos}!`);
    setTimeout(() => setMensajeExito(null), 5000);
  };

  // --- MODO REPORTES: FILTROS DINÁMICOS COMPLETOS ---
  const calificacionesReporte = useMemo(() => {
    return calificaciones.filter(c => {
      const est = estudiantes.find(e => e.id === c.estudianteId);
      const mat = materias.find(m => m.id === c.materiaId || m.id === c.cursoId);

      const matchCarrera = repCarreraId === 'todas' || c.carreraId === repCarreraId || est?.carreraId === repCarreraId;
      const matchAnio = repAnio === 'todos' || String(c.anio) === repAnio || String(est?.anioActual) === repAnio;
      const matchMateria = repMateriaId === 'todas' || c.materiaId === repMateriaId || c.cursoId === repMateriaId;
      const matchTurno = repTurno === 'todos' || c.turno === repTurno || est?.turno === repTurno;
      const matchEstudiante = repEstudianteId === 'todos' || c.estudianteId === repEstudianteId;
      
      let matchEstado = true;
      if (repEstado === 'aprobados') matchEstado = (c.notaFinal || 0) >= 51;
      else if (repEstado === 'segundo_turno') matchEstado = c.estadoFinal === 'Segundo Turno' || (c.segundoTurno !== undefined && c.segundoTurno > 0);
      else if (repEstado === 'reprobados') matchEstado = (c.notaFinal || 0) < 51;

      let matchText = true;
      if (busquedaReporte.trim()) {
        const q = busquedaReporte.toLowerCase().trim();
        const estNombre = `${est?.apellidos} ${est?.nombres}`.toLowerCase();
        const estCi = (est?.ci || '').toLowerCase();
        const estCod = (est?.codigo || '').toLowerCase();
        const matNombre = (mat?.nombre || '').toLowerCase();
        const docNombre = (c.docente || mat?.docente || '').toLowerCase();
        matchText = estNombre.includes(q) || estCi.includes(q) || estCod.includes(q) || matNombre.includes(q) || docNombre.includes(q);
      }

      return matchCarrera && matchAnio && matchMateria && matchTurno && matchEstudiante && matchEstado && matchText;
    });
  }, [calificaciones, estudiantes, materias, repCarreraId, repAnio, repMateriaId, repTurno, repEstudianteId, repEstado, busquedaReporte]);

  // Estadísticas del Reporte Filtrado
  const statsReporte = useMemo(() => {
    const total = calificacionesReporte.length;
    if (total === 0) return { total: 0, aprobados: 0, reprobados: 0, segundoTurno: 0, promedio: 0, pctAprobados: 0 };

    let aprob = 0;
    let reprob = 0;
    let segTurno = 0;
    let suma = 0;

    calificacionesReporte.forEach(c => {
      const nf = Number(c.notaFinal || 0);
      suma += nf;
      if (c.estadoFinal === 'Segundo Turno' || (c.segundoTurno && c.segundoTurno >= 51)) {
        segTurno++;
        aprob++;
      } else if (nf >= 51) {
        aprob++;
      } else {
        reprob++;
      }
    });

    return {
      total,
      aprobados: aprob,
      reprobados: reprob,
      segundoTurno: segTurno,
      promedio: Math.round(suma / total),
      pctAprobados: Math.round((aprob / total) * 100)
    };
  }, [calificacionesReporte]);

  // Ejecutar impresión directa del reporte oficial
  const handleImprimirReporte = () => {
    imprimirElementoUniversal('area-reporte-calificaciones-oficial', 'Reporte Oficial de Calificaciones - ING DATA COMP');
  };

  return (
    <div className="space-y-6">
      {/* ENCABEZADO PRINCIPAL DE CALIFICACIONES */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-900 rounded-2xl flex items-center justify-center text-white shadow-md">
              <FileCheck2 className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Módulo de Calificaciones y Actas Académicas
                </h1>
                <span className="bg-emerald-100 text-emerald-950 font-black text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-300 uppercase">
                  3 Parciales • Final • 2do Turno
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Ingreso por Asignatura, Docente, Turno, Carrera y Año. Calificación mínima de aprobación: 51 puntos.
              </p>
            </div>
          </div>
        </div>

        {/* SELECTOR DE MODOS PRINCIPALES */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {onRestaurarBaseDatos && (
            <button
              onClick={onRestaurarBaseDatos}
              title="Restaurar materias oficiales y notas"
              className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
              <span>Restaurar Datos</span>
            </button>
          )}

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setModo('por-materia')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                modo === 'por-materia'
                  ? 'bg-blue-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Planilla por Materia</span>
            </button>

            <button
              onClick={() => setModo('por-estudiante')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                modo === 'por-estudiante'
                  ? 'bg-blue-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Kárdex por Alumno</span>
            </button>

            <button
              onClick={() => setModo('reportes')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                modo === 'reportes'
                  ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Reportes e Impresión</span>
            </button>
          </div>
        </div>
      </div>

      {mensajeExito && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs animate-in fade-in no-print">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. MODO: PLANILLA DE CALIFICACIONES POR MATERIA          */}
      {/* ======================================================== */}
      {modo === 'por-materia' && (
        <div className="space-y-6">
          {/* BARRA DE FILTROS SUPERIOR: CARRERA, AÑO, MATERIA, PROFESOR Y TURNO */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 no-print">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-100 text-blue-900 rounded-lg">
                  <Filter className="w-4 h-4" />
                </span>
                <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  Selección de Carrera, Asignatura, Docente y Turno para la Planilla
                </span>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                Gestión Académica: <strong>{gestionSel}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
              {/* 1. Carrera */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  1. Carrera Profesional *
                </label>
                <select
                  value={carreraSel}
                  onChange={(e) => setCarreraSel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {carreras.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.codigo} - {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Año que cursa */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  2. Año de Estudio *
                </label>
                <select
                  value={anioSel}
                  onChange={(e) => setAnioSel(Number(e.target.value) as 1 | 2 | 3)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value={1}>1er Año (Anualizado)</option>
                  <option value={2}>2do Año (Anualizado)</option>
                  <option value={3}>3er Año (Anualizado)</option>
                </select>
              </div>

              {/* 3. Materia (Asignatura) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  3. Asignatura Anual *
                </label>
                <select
                  value={materiaIdSel}
                  onChange={(e) => handleCambioMateria(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {materiasDelAnio.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.codigo} - {m.nombre}
                    </option>
                  ))}
                  {materiasDelAnio.length === 0 && (
                    <option value="">No hay materias registradas</option>
                  )}
                </select>
              </div>

              {/* 4. Profesor / Docente Titular */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  4. Docente Titular
                </label>
                <input
                  type="text"
                  value={profesorMateria}
                  onChange={(e) => setProfesorMateria(e.target.value)}
                  placeholder="Ej. Ing. Fernando Quispe Laura"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              {/* 5. Turno */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  5. Turno de Clases *
                </label>
                <select
                  value={turnoSel}
                  onChange={(e) => setTurnoSel(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="Todos">Todos los Turnos</option>
                  <option value="Mañana">Turno Mañana</option>
                  <option value="Tarde">Turno Tarde</option>
                  <option value="Noche">Turno Noche</option>
                  <option value="Sábado">Turno Sábado</option>
                </select>
              </div>
            </div>

            {/* TARJETA DE RESUMEN DE LA ASIGNATURA SELECCIONADA */}
            {materiaActual && (
              <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-2xl p-4 sm:p-5 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-black text-amber-300 bg-amber-400/20 border border-amber-300/30 px-2 py-0.5 rounded text-xs">
                      {materiaActual.codigo}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {materiaActual.nombre}
                    </h3>
                  </div>
                  <p className="text-xs text-blue-200 flex items-center gap-2 flex-wrap">
                    <span>Carrera: <strong className="text-white">{carreraActual?.nombre}</strong></span>
                    <span>•</span>
                    <span>Año: <strong className="text-white">{anioSel}° Año</strong></span>
                    <span>•</span>
                    <span>Carga: <strong className="text-white">{materiaActual.cargaHoraria} hrs anuales</strong></span>
                    <span>•</span>
                    <span>Profesor: <strong className="text-white">{profesorMateria || 'Por Asignar'}</strong></span>
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
                  <div className="bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/20 text-center">
                    <span className="text-[10px] text-blue-200 uppercase font-bold block">Alumnos en Nómina</span>
                    <span className="text-base font-black text-white font-mono">{alumnosDeLaMateria.length}</span>
                  </div>

                  <button
                    onClick={handleGuardarPlanilla}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4 stroke-[3]" />
                    <span>Guardar Calificaciones</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* TABLA EDITABLE DE LA PLANILLA POR MATERIA */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden no-print">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-blue-700" />
                  <span>Planilla Oficial de Notas: {materiaActual?.nombre || 'Seleccione materia'}</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ingresa las calificaciones de 1er Parcial, 2do Parcial, 3er Parcial y Examen Final. El promedio se calcula automáticamente.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 font-bold">
                  Aprobación: ≥ 51 pts
                </span>
                <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 font-bold">
                  2do Turno: 36 - 50 pts
                </span>
              </div>
            </div>

            {alumnosDeLaMateria.length === 0 ? (
              <div className="text-center py-16 p-6">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-700 text-sm">
                  No hay estudiantes registrados para {anioSel}° Año de {carreraActual?.nombre}
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Verifica el turno seleccionado ({turnoSel}) o inscribe nuevos alumnos desde la pestaña de Inscripciones.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-black border-b border-slate-200 text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-3 text-center w-10">N°</th>
                      <th className="py-3 px-3 w-28">Código / CI</th>
                      <th className="py-3 px-3 min-w-[200px]">Apellidos y Nombres</th>
                      <th className="py-3 px-2 text-center w-20">Turno</th>
                      <th className="py-3 px-2 text-center w-24 bg-blue-50/50">1er Parcial</th>
                      <th className="py-3 px-2 text-center w-24 bg-blue-50/50">2do Parcial</th>
                      <th className="py-3 px-2 text-center w-24 bg-blue-50/50">3er Parcial</th>
                      <th className="py-3 px-2 text-center w-24 bg-indigo-50/50">Examen Final</th>
                      <th className="py-3 px-2 text-center w-24 bg-slate-200/70 text-slate-900 font-black">Promedio</th>
                      <th className="py-3 px-2 text-center w-28 bg-amber-50 text-amber-950 font-black">2do Turno (2da Inst.)</th>
                      <th className="py-3 px-2 text-center w-24 bg-blue-900 text-white font-black">Nota Final</th>
                      <th className="py-3 px-3 text-center w-28">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {alumnosDeLaMateria.map((est, idx) => {
                      const cal = draftPlanilla[est.id] || {};
                      const p1 = Number(cal.primerParcial || 0);
                      const p2 = Number(cal.segundoParcial || 0);
                      const p3 = Number(cal.tercerParcial || 0);
                      const ef = Number(cal.examenFinal || 0);
                      const promReg = Math.round((p1 + p2 + p3 + ef) / 4);
                      const nFin = Number(cal.notaFinal ?? promReg);
                      const estFin = cal.estadoFinal || (nFin >= 51 ? 'Aprobado' : 'Reprobado');

                      return (
                        <tr key={est.id} className="hover:bg-blue-50/30 transition">
                          <td className="py-2.5 px-3 text-center font-bold text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-mono font-bold text-blue-950 block">{est.codigo}</span>
                            <span className="text-[10px] text-slate-400">CI: {est.ci} {est.expedido}</span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {est.apellidos}, {est.nombres}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                              {est.turno}
                            </span>
                          </td>

                          {/* 1er Parcial */}
                          <td className="py-2 px-2 text-center bg-blue-50/20">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={cal.primerParcial ?? ''}
                              onChange={(e) => handleCambioNotaPlanilla(est.id, 'primerParcial', e.target.value)}
                              className="w-16 px-2 py-1 text-center font-mono font-bold bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                          </td>

                          {/* 2do Parcial */}
                          <td className="py-2 px-2 text-center bg-blue-50/20">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={cal.segundoParcial ?? ''}
                              onChange={(e) => handleCambioNotaPlanilla(est.id, 'segundoParcial', e.target.value)}
                              className="w-16 px-2 py-1 text-center font-mono font-bold bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                          </td>

                          {/* 3er Parcial */}
                          <td className="py-2 px-2 text-center bg-blue-50/20">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={cal.tercerParcial ?? ''}
                              onChange={(e) => handleCambioNotaPlanilla(est.id, 'tercerParcial', e.target.value)}
                              className="w-16 px-2 py-1 text-center font-mono font-bold bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                          </td>

                          {/* Examen Final */}
                          <td className="py-2 px-2 text-center bg-indigo-50/20">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={cal.examenFinal ?? ''}
                              onChange={(e) => handleCambioNotaPlanilla(est.id, 'examenFinal', e.target.value)}
                              className="w-16 px-2 py-1 text-center font-mono font-bold bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                          </td>

                          {/* Promedio Regular */}
                          <td className="py-2.5 px-2 text-center bg-slate-50 font-mono font-black text-slate-800 text-xs">
                            {promReg}
                          </td>

                          {/* 2do Turno (2da Instancia) */}
                          <td className="py-2 px-2 text-center bg-amber-50/40">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="-"
                              value={cal.segundoTurno ?? ''}
                              onChange={(e) => handleCambioNotaPlanilla(est.id, 'segundoTurno', e.target.value)}
                              className="w-16 px-2 py-1 text-center font-mono font-bold bg-white border border-amber-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none text-amber-900"
                            />
                          </td>

                          {/* Nota Final */}
                          <td className="py-2.5 px-2 text-center bg-blue-900/10 font-mono font-black text-sm">
                            <span className={nFin >= 51 ? 'text-emerald-700' : 'text-red-700'}>
                              {nFin}
                            </span>
                          </td>

                          {/* Estado Final */}
                          <td className="py-2.5 px-3 text-center">
                            {estFin === 'Aprobado' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <Check className="w-3 h-3 stroke-[3]" />
                                <span>Aprobado</span>
                              </span>
                            )}
                            {estFin === 'Segundo Turno' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                                <Clock className="w-3 h-3 stroke-[2.5]" />
                                <span>2do Turno</span>
                              </span>
                            )}
                            {estFin === 'Reprobado' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-red-100 text-red-800 border border-red-300">
                                <XCircle className="w-3 h-3" />
                                <span>Reprobado</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pie de tabla con botón de guardado e impresión */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-medium">
                Planilla sujeta a la Resolución Ministerial N° 0397/2024. Las calificaciones se sincronizan de forma segura.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGuardarPlanilla}
                  className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Planilla</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. MODO: KÁRDEX POR ALUMNO (HISTORIAL INDIVIDUAL)        */}
      {/* ======================================================== */}
      {modo === 'por-estudiante' && (
        <div className="space-y-6 no-print">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Buscar y Seleccionar Estudiante *
                </label>
                <select
                  value={estudianteIdSel}
                  onChange={(e) => setEstudianteIdSel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {estudiantes.map(est => {
                    const car = carreras.find(c => c.id === est.carreraId);
                    return (
                      <option key={est.id} value={est.id}>
                        {est.apellidos}, {est.nombres} — {car?.nombre} ({est.anioActual || 1}° Año) — CI: {est.ci} ({est.turno})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Gestión Académica
                </label>
                <input
                  type="text"
                  value={gestionSel}
                  onChange={(e) => setGestionSel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm font-mono font-bold text-slate-800"
                />
              </div>
            </div>

            {/* Ficha del alumno seleccionado */}
            {estudianteActualKardex && (
              <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-2xl p-5 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-amber-400 font-black text-xl border border-white/20 shrink-0">
                    {estudianteActualKardex.nombres.charAt(0)}{estudianteActualKardex.apellidos.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-white">
                        {estudianteActualKardex.apellidos}, {estudianteActualKardex.nombres}
                      </h3>
                      <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                        {estudianteActualKardex.codigo}
                      </span>
                    </div>
                    <p className="text-xs text-blue-200 mt-0.5 flex items-center gap-2">
                      <span className="font-bold text-white">{carreraEstudianteKardex?.nombre}</span>
                      <span>•</span>
                      <span className="bg-blue-800/80 px-2 py-0.5 rounded-md font-extrabold text-[11px]">
                        {anioEstudianteKardex}° Año
                      </span>
                      <span>•</span>
                      <span>Turno: {estudianteActualKardex.turno}</span>
                      <span>•</span>
                      <span>CI: {estudianteActualKardex.ci} {estudianteActualKardex.expedido}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={handleGuardarKardexEstudiante}
                    className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4 stroke-[3]" />
                    <span>Guardar Notas del Alumno</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tabla de asignaturas anuales del estudiante */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h4 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-700" />
                  <span>Asignaturas del {anioEstudianteKardex}° Año ({carreraEstudianteKardex?.nombre})</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calificaciones anuales con 3 parciales, final y 2do turno (2da instancia).
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-black border-b border-slate-200 text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-3 text-center w-10">N°</th>
                    <th className="py-3 px-3 w-28">Código</th>
                    <th className="py-3 px-3 min-w-[200px]">Asignatura Anual</th>
                    <th className="py-3 px-3">Docente Titular</th>
                    <th className="py-3 px-2 text-center w-24 bg-blue-50/50">1er Parcial</th>
                    <th className="py-3 px-2 text-center w-24 bg-blue-50/50">2do Parcial</th>
                    <th className="py-3 px-2 text-center w-24 bg-blue-50/50">3er Parcial</th>
                    <th className="py-3 px-2 text-center w-24 bg-indigo-50/50">Examen Final</th>
                    <th className="py-3 px-2 text-center w-24 bg-slate-200/70 font-black">Promedio</th>
                    <th className="py-3 px-2 text-center w-28 bg-amber-50 text-amber-950 font-black">2do Turno (2da Inst.)</th>
                    <th className="py-3 px-2 text-center w-24 bg-blue-900 text-white font-black">Nota Final</th>
                    <th className="py-3 px-3 text-center w-28">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {materiasEstudianteKardex.map((mat, idx) => {
                    const cal = draftKardex[mat.id] || {};
                    const p1 = Number(cal.primerParcial || 0);
                    const p2 = Number(cal.segundoParcial || 0);
                    const p3 = Number(cal.tercerParcial || 0);
                    const ef = Number(cal.examenFinal || 0);
                    const promReg = Math.round((p1 + p2 + p3 + ef) / 4);
                    const nFin = Number(cal.notaFinal ?? promReg);
                    const estFin = cal.estadoFinal || (nFin >= 51 ? 'Aprobado' : 'Reprobado');

                    return (
                      <tr key={mat.id} className="hover:bg-blue-50/30 transition">
                        <td className="py-2.5 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-950">{mat.codigo}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{mat.nombre}</td>
                        <td className="py-2.5 px-3 text-slate-600">{mat.docente || 'Docente Titular'}</td>

                        <td className="py-2 px-2 text-center bg-blue-50/20">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={cal.primerParcial ?? ''}
                            onChange={(e) => handleCambioNotaKardex(mat.id, 'primerParcial', e.target.value)}
                            className="w-16 px-2 py-1 text-center font-mono font-bold bg-white border border-slate-300 rounded-lg text-xs"
                          />
                        </td>

                        <td className="py-2 px-2 text-center bg-blue-50/20">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={cal.segundoParcial ?? ''}
                            onChange={(e) => handleCambioNotaKardex(mat.id, 'segundoParcial', e.target.value)}
                            className="w-16 px-2 py-1 text-center font-mono font-bold bg-white border border-slate-300 rounded-lg text-xs"
                          />
                        </td>

                        <td className="py-2 px-2 text-center bg-blue-50/20">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={cal.tercerParcial ?? ''}
                            onChange={(e) => handleCambioNotaKardex(mat.id, 'tercerParcial', e.target.value)}
                            className="w-16 px-2 py-1 text-center font-mono font-bold bg-white border border-slate-300 rounded-lg text-xs"
                          />
                        </td>

                        <td className="py-2 px-2 text-center bg-indigo-50/20">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={cal.examenFinal ?? ''}
                            onChange={(e) => handleCambioNotaKardex(mat.id, 'examenFinal', e.target.value)}
                            className="w-16 px-2 py-1 text-center font-mono font-bold bg-white border border-slate-300 rounded-lg text-xs"
                          />
                        </td>

                        <td className="py-2.5 px-2 text-center bg-slate-50 font-mono font-black text-slate-800 text-xs">
                          {promReg}
                        </td>

                        <td className="py-2 px-2 text-center bg-amber-50/40">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="-"
                            value={cal.segundoTurno ?? ''}
                            onChange={(e) => handleCambioNotaKardex(mat.id, 'segundoTurno', e.target.value)}
                            className="w-16 px-2 py-1 text-center font-mono font-bold bg-white border border-amber-300 rounded-lg text-xs text-amber-900"
                          />
                        </td>

                        <td className="py-2.5 px-2 text-center bg-blue-900/10 font-mono font-black text-sm">
                          <span className={nFin >= 51 ? 'text-emerald-700' : 'text-red-700'}>
                            {nFin}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-center">
                          {estFin === 'Aprobado' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>Aprobado</span>
                            </span>
                          )}
                          {estFin === 'Segundo Turno' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                              <Clock className="w-3 h-3 stroke-[2.5]" />
                              <span>2do Turno</span>
                            </span>
                          )}
                          {estFin === 'Reprobado' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-300">
                              <XCircle className="w-3 h-3" />
                              <span>Reprobado</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. MODO: REPORTES OFICIALES DE CALIFICACIONES            */}
      {/* ======================================================== */}
      {modo === 'reportes' && (
        <div className="space-y-6">
          {/* PANEL DE FILTROS PARA EL REPORTE */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 no-print">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-100 text-amber-900 rounded-lg">
                  <Printer className="w-4 h-4" />
                </span>
                <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  Generador de Reportes de Calificaciones: Filtrar por Alumno, Año, Curso, Carrera y Turno
                </span>
              </div>

              <button
                onClick={handleImprimirReporte}
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Reporte Oficial / PDF</span>
              </button>
            </div>

            {/* Grilla de 6 Filtros en Vivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {/* Filtro Carrera */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Carrera:
                </label>
                <select
                  value={repCarreraId}
                  onChange={(e) => setRepCarreraId(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="todas">Todas las Carreras</option>
                  {carreras.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Filtro Año */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Año de Estudio:
                </label>
                <select
                  value={repAnio}
                  onChange={(e) => setRepAnio(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="todos">Todos los Años</option>
                  <option value="1">1er Año</option>
                  <option value="2">2do Año</option>
                  <option value="3">3er Año</option>
                </select>
              </div>

              {/* Filtro Materia / Curso */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Curso / Asignatura:
                </label>
                <select
                  value={repMateriaId}
                  onChange={(e) => setRepMateriaId(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="todas">Todas las Asignaturas</option>
                  {materias.map(m => (
                    <option key={m.id} value={m.id}>{m.codigo} - {m.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Filtro Turno */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Turno:
                </label>
                <select
                  value={repTurno}
                  onChange={(e) => setRepTurno(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="todos">Todos los Turnos</option>
                  <option value="Mañana">Mañana</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noche">Noche</option>
                  <option value="Sábado">Sábado</option>
                </select>
              </div>

              {/* Filtro Alumno */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Por Alumno:
                </label>
                <select
                  value={repEstudianteId}
                  onChange={(e) => setRepEstudianteId(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="todos">Todos los Alumnos</option>
                  {estudiantes.map(e => (
                    <option key={e.id} value={e.id}>{e.apellidos}, {e.nombres}</option>
                  ))}
                </select>
              </div>

              {/* Filtro Estado */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Estado:
                </label>
                <select
                  value={repEstado}
                  onChange={(e) => setRepEstado(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="todos">Todos los Estados</option>
                  <option value="aprobados">Solo Aprobados (≥ 51)</option>
                  <option value="segundo_turno">Solo 2do Turno</option>
                  <option value="reprobados">Solo Reprobados (&lt; 51)</option>
                </select>
              </div>
            </div>

            {/* Búsqueda rápida de texto */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={busquedaReporte}
                onChange={(e) => setBusquedaReporte(e.target.value)}
                placeholder="Buscar por nombre de alumno, CI, código, asignatura o profesor..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* TARJETAS DE ESTADÍSTICAS DEL REPORTE */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 no-print">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Evaluados</span>
              <span className="text-xl font-black text-slate-900 font-mono">{statsReporte.total}</span>
            </div>

            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 shadow-xs">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Aprobados ({statsReporte.pctAprobados}%)</span>
              <span className="text-xl font-black text-emerald-700 font-mono">{statsReporte.aprobados}</span>
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 shadow-xs">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">En 2do Turno</span>
              <span className="text-xl font-black text-amber-700 font-mono">{statsReporte.segundoTurno}</span>
            </div>

            <div className="bg-red-50 p-4 rounded-2xl border border-red-200 shadow-xs">
              <span className="text-[10px] font-bold text-red-800 uppercase block">Reprobados</span>
              <span className="text-xl font-black text-red-700 font-mono">{statsReporte.reprobados}</span>
            </div>

            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 shadow-xs">
              <span className="text-[10px] font-bold text-blue-900 uppercase block">Promedio General</span>
              <span className="text-xl font-black text-blue-900 font-mono">{statsReporte.promedio} / 100</span>
            </div>
          </div>

          {/* TABLA DE VISUALIZACIÓN EN PANTALLA */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden no-print">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h4 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-blue-800" />
                <span>Resultados del Reporte de Calificaciones ({calificacionesReporte.length} registros)</span>
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-black border-b border-slate-200 text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-3 text-center w-10">N°</th>
                    <th className="py-3 px-3">Estudiante</th>
                    <th className="py-3 px-3">Carrera / Año</th>
                    <th className="py-3 px-3">Asignatura y Profesor</th>
                    <th className="py-3 px-2 text-center">Turno</th>
                    <th className="py-3 px-2 text-center">1er P.</th>
                    <th className="py-3 px-2 text-center">2do P.</th>
                    <th className="py-3 px-2 text-center">3er P.</th>
                    <th className="py-3 px-2 text-center">Final</th>
                    <th className="py-3 px-2 text-center bg-slate-200/60 font-black">Prom.</th>
                    <th className="py-3 px-2 text-center bg-amber-50 font-black text-amber-950">2do Turno</th>
                    <th className="py-3 px-2 text-center bg-blue-900 text-white font-black">Nota Def.</th>
                    <th className="py-3 px-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {calificacionesReporte.map((c, idx) => {
                    const est = estudiantes.find(e => e.id === c.estudianteId);
                    const mat = materias.find(m => m.id === c.materiaId || m.id === c.cursoId);
                    const car = carreras.find(cr => cr.id === c.carreraId || cr.id === est?.carreraId);
                    const p1 = Number(c.primerParcial || 0);
                    const p2 = Number(c.segundoParcial || 0);
                    const p3 = Number(c.tercerParcial ?? c.practicas ?? 0);
                    const ef = Number(c.examenFinal || 0);
                    const promReg = Math.round((p1 + p2 + p3 + ef) / 4);

                    return (
                      <tr key={c.id || idx} className="hover:bg-blue-50/30 transition">
                        <td className="py-2 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                        <td className="py-2 px-3">
                          <span className="font-bold text-slate-900 block">{est?.apellidos}, {est?.nombres}</span>
                          <span className="text-[10px] text-slate-400 font-mono">CI: {est?.ci} {est?.expedido} • {est?.codigo}</span>
                        </td>
                        <td className="py-2 px-3">
                          <span className="font-bold text-slate-800 block text-[11px]">{car?.codigo} - {car?.nombre}</span>
                          <span className="text-[10px] text-blue-700 font-bold">{c.anio || est?.anioActual || 1}° Año</span>
                        </td>
                        <td className="py-2 px-3">
                          <span className="font-bold text-slate-900 block">{mat?.codigo} - {mat?.nombre}</span>
                          <span className="text-[10px] text-slate-500">Docente: {c.docente || mat?.docente || 'Titular'}</span>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span className="text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                            {c.turno || est?.turno || 'Mañana'}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center font-mono">{p1}</td>
                        <td className="py-2 px-2 text-center font-mono">{p2}</td>
                        <td className="py-2 px-2 text-center font-mono">{p3}</td>
                        <td className="py-2 px-2 text-center font-mono">{ef}</td>
                        <td className="py-2 px-2 text-center font-mono font-bold bg-slate-50">{promReg}</td>
                        <td className="py-2 px-2 text-center font-mono font-bold bg-amber-50/50 text-amber-900">
                          {c.segundoTurno ?? '-'}
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-black text-sm bg-blue-50/40">
                          <span className={(c.notaFinal || 0) >= 51 ? 'text-emerald-700' : 'text-red-700'}>
                            {c.notaFinal}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          {c.estadoFinal === 'Aprobado' && (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Aprobado
                            </span>
                          )}
                          {c.estadoFinal === 'Segundo Turno' && (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                              2do Turno
                            </span>
                          )}
                          {c.estadoFinal === 'Reprobado' && (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-300">
                              Reprobado
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {calificacionesReporte.length === 0 && (
                    <tr>
                      <td colSpan={13} className="py-8 text-center text-slate-400">
                        No se encontraron registros de calificaciones con los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ======================================================== */}
          {/* ÁREA DE IMPRESIÓN OFICIAL DEL REPORTE (PDF / IMPRESORA)  */}
          {/* ======================================================== */}
          <div 
            id="area-reporte-calificaciones-oficial"
            className="hidden print:block bg-white text-slate-900 p-8 max-w-5xl mx-auto space-y-6"
          >
            {/* ENCABEZADO INSTITUCIONAL OFICIAL */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
              <div className="flex items-center space-x-4">
                <img 
                  src={logoInstituto} 
                  alt="Logo Institucional" 
                  className="w-16 h-16 object-contain"
                  crossOrigin="anonymous"
                />
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight uppercase">
                    {institutoConfig?.nombre || 'INSTITUTO TECNOLÓGICO ING DATA COMP'}
                  </h1>
                  <p className="text-xs font-bold text-slate-700">
                    Resolución Ministerial: {institutoConfig?.resolucionMinisterial || 'R.M. No. 0397/2024'}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    {institutoConfig?.ciudad || 'Cochabamba'} - {institutoConfig?.pais || 'Bolivia'} • Educación Técnica Superior
                  </p>
                </div>
              </div>

              <div className="text-right border-l-2 border-slate-200 pl-4">
                <span className="text-xs font-black uppercase text-blue-900 block">Acta Oficial de Notas</span>
                <span className="text-[11px] font-bold text-slate-700 block">Gestión Académica {gestionSel}</span>
                <span className="text-[10px] text-slate-500 block">Emisión: {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            {/* PARÁMETROS DEL REPORTE */}
            <div className="bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="font-bold text-slate-500 block text-[10px] uppercase">Carrera:</span>
                <strong className="text-slate-900">{repCarreraId === 'todas' ? 'Todas las Carreras' : (carreras.find(c => c.id === repCarreraId)?.nombre || repCarreraId)}</strong>
              </div>
              <div>
                <span className="font-bold text-slate-500 block text-[10px] uppercase">Año de Formación:</span>
                <strong className="text-slate-900">{repAnio === 'todos' ? 'Todos los Años' : `${repAnio}° Año`}</strong>
              </div>
              <div>
                <span className="font-bold text-slate-500 block text-[10px] uppercase">Asignatura:</span>
                <strong className="text-slate-900">{repMateriaId === 'todas' ? 'Todas las Asignaturas' : (materias.find(m => m.id === repMateriaId)?.nombre || repMateriaId)}</strong>
              </div>
              <div>
                <span className="font-bold text-slate-500 block text-[10px] uppercase">Turno:</span>
                <strong className="text-slate-900">{repTurno === 'todos' ? 'Todos los Turnos' : repTurno}</strong>
              </div>
            </div>

            {/* TABLA FORMAL DE CALIFICACIONES PARA IMPRESIÓN */}
            <table className="w-full text-left text-[11px] border-collapse border border-slate-400">
              <thead>
                <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-400 text-[10px] uppercase">
                  <th className="py-1.5 px-2 border border-slate-300 text-center w-8">N°</th>
                  <th className="py-1.5 px-2 border border-slate-300">Código</th>
                  <th className="py-1.5 px-2 border border-slate-300">Apellidos y Nombres</th>
                  <th className="py-1.5 px-2 border border-slate-300">CI</th>
                  <th className="py-1.5 px-2 border border-slate-300">Asignatura</th>
                  <th className="py-1.5 px-1.5 border border-slate-300 text-center w-12">Turno</th>
                  <th className="py-1.5 px-1.5 border border-slate-300 text-center w-12">1° Par.</th>
                  <th className="py-1.5 px-1.5 border border-slate-300 text-center w-12">2° Par.</th>
                  <th className="py-1.5 px-1.5 border border-slate-300 text-center w-12">3° Par.</th>
                  <th className="py-1.5 px-1.5 border border-slate-300 text-center w-12">Final</th>
                  <th className="py-1.5 px-1.5 border border-slate-300 text-center w-12 bg-slate-100">Prom.</th>
                  <th className="py-1.5 px-1.5 border border-slate-300 text-center w-14">2do Turno</th>
                  <th className="py-1.5 px-1.5 border border-slate-300 text-center w-14 font-black">Nota Fin.</th>
                  <th className="py-1.5 px-2 border border-slate-300 text-center w-20">Estado</th>
                </tr>
              </thead>
              <tbody>
                {calificacionesReporte.map((c, idx) => {
                  const est = estudiantes.find(e => e.id === c.estudianteId);
                  const mat = materias.find(m => m.id === c.materiaId || m.id === c.cursoId);
                  const p1 = Number(c.primerParcial || 0);
                  const p2 = Number(c.segundoParcial || 0);
                  const p3 = Number(c.tercerParcial ?? c.practicas ?? 0);
                  const ef = Number(c.examenFinal || 0);
                  const promReg = Math.round((p1 + p2 + p3 + ef) / 4);

                  return (
                    <tr key={idx} className="border-b border-slate-300">
                      <td className="py-1 px-2 border border-slate-300 text-center font-bold">{idx + 1}</td>
                      <td className="py-1 px-2 border border-slate-300 font-mono">{est?.codigo}</td>
                      <td className="py-1 px-2 border border-slate-300 font-bold">{est?.apellidos}, {est?.nombres}</td>
                      <td className="py-1 px-2 border border-slate-300 font-mono">{est?.ci} {est?.expedido}</td>
                      <td className="py-1 px-2 border border-slate-300">{mat?.nombre}</td>
                      <td className="py-1 px-1.5 border border-slate-300 text-center">{c.turno || est?.turno || 'Mañana'}</td>
                      <td className="py-1 px-1.5 border border-slate-300 text-center font-mono">{p1}</td>
                      <td className="py-1 px-1.5 border border-slate-300 text-center font-mono">{p2}</td>
                      <td className="py-1 px-1.5 border border-slate-300 text-center font-mono">{p3}</td>
                      <td className="py-1 px-1.5 border border-slate-300 text-center font-mono">{ef}</td>
                      <td className="py-1 px-1.5 border border-slate-300 text-center font-mono font-bold bg-slate-50">{promReg}</td>
                      <td className="py-1 px-1.5 border border-slate-300 text-center font-mono font-bold">{c.segundoTurno ?? '-'}</td>
                      <td className="py-1 px-1.5 border border-slate-300 text-center font-mono font-black text-xs">{c.notaFinal}</td>
                      <td className="py-1 px-2 border border-slate-300 text-center font-bold text-[10px]">
                        {c.estadoFinal}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* CUADRO RESUMEN ESTADÍSTICO */}
            <div className="grid grid-cols-4 gap-3 text-xs border border-slate-300 p-3 rounded-lg bg-slate-50">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Total Evaluados:</span>
                <strong className="text-slate-900 font-mono text-sm">{statsReporte.total} Alumnos</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Aprobados:</span>
                <strong className="text-emerald-700 font-mono text-sm">{statsReporte.aprobados} ({statsReporte.pctAprobados}%)</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">En Segundo Turno:</span>
                <strong className="text-amber-800 font-mono text-sm">{statsReporte.segundoTurno} Alumnos</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Promedio General:</span>
                <strong className="text-blue-900 font-mono text-sm">{statsReporte.promedio} / 100 Pts</strong>
              </div>
            </div>

            {/* CASILLAS DE FIRMA OFICIAL */}
            <div className="pt-12 grid grid-cols-2 gap-12 text-center text-xs">
              <div>
                <div className="border-t border-slate-900 w-48 mx-auto mb-1"></div>
                <strong className="block text-slate-900">{profesorMateria || 'Docente Titular Asignado'}</strong>
                <span className="text-slate-500 text-[10px]">Docente de Asignatura</span>
              </div>

              <div>
                <div className="border-t border-slate-900 w-48 mx-auto mb-1"></div>
                <strong className="block text-slate-900">{institutoConfig?.directorAcademico || 'Dirección Académica'}</strong>
                <span className="text-slate-500 text-[10px]">Dirección Académica - ING DATA COMP</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
