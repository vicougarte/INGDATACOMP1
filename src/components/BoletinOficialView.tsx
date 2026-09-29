import React, { useState, useRef } from 'react';
import { 
  Carrera, 
  Materia, 
  Estudiante, 
  Calificacion, 
  ConfiguracionInstituto 
} from '../types';
import { 
  Award, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  Image as ImageIcon,
  Building2,
  Calendar,
  Layers,
  FileText
} from 'lucide-react';
import { IngDataCompLogo } from './IngDataCompLogo';
import { imprimirElementoUniversal, descargarDocumentoHtml } from '../services/printService';
import { Download } from 'lucide-react';

interface BoletinOficialViewProps {
  estudiantes: Estudiante[];
  carreras: Carrera[];
  materias: Materia[];
  calificaciones: Calificacion[];
  config: ConfiguracionInstituto;
  estudianteSeleccionadoId?: string;
  customLogoUrl?: string | null;
  onSubirLogotipo?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Convierte un número del 0 al 100 a su representación literal en español
 */
function numeroALetras(num: number): string {
  const n = Math.round(num);
  if (n <= 0) return 'CERO';
  if (n === 100) return 'CIEN';

  const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const especiales: Record<number, string> = {
    10: 'DIEZ', 11: 'ONCE', 12: 'DOCE', 13: 'TRECE', 14: 'CATORCE', 15: 'QUINCE',
    16: 'DIECISÉIS', 17: 'DIECISIETE', 18: 'DIECIOCHO', 19: 'DIECINUEVE',
    20: 'VEINTE', 21: 'VEINTIUNO', 22: 'VEINTIDÓS', 23: 'VEINTITRÉS', 24: 'VEINTICUATRO',
    25: 'VEINTICINCO', 26: 'VEINTISÉIS', 27: 'VEINTISIETE', 28: 'VEINTIOCHO', 29: 'VEINTINUEVE'
  };
  const decenas = ['', '', '', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];

  if (especiales[n]) return especiales[n];
  if (n < 10) return unidades[n];

  const d = Math.floor(n / 10);
  const u = n % 10;

  if (u === 0) return decenas[d];
  return `${decenas[d]} Y ${unidades[u]}`;
}

export const BoletinOficialView: React.FC<BoletinOficialViewProps> = ({
  estudiantes,
  carreras,
  materias,
  calificaciones,
  config,
  estudianteSeleccionadoId,
  customLogoUrl,
  onSubirLogotipo
}) => {
  const [estId, setEstId] = useState(estudianteSeleccionadoId || estudiantes[0]?.id || '');
  const [gestion, setGestion] = useState('2026');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const estudiante = estudiantes.find(e => e.id === estId) || estudiantes[0];
  const carrera = estudiante ? carreras.find(c => c.id === estudiante.carreraId) : carreras[0];
  const anio = (estudiante?.anioActual || 1) as 1 | 2 | 3;

  // LECTURA DIRECTA DE LA OTRA TABLA: Materias anuales de la Carrera y Año del estudiante
  const materiasAnuales = estudiante && carrera 
    ? materias.filter(m => m.carreraId === carrera.id && m.anio === anio)
    : [];

  // Calcular notas y promedio para las materias anuales
  let sumaNotas = 0;
  let countNotas = 0;
  let reprobados = 0;
  let horasTotalesAnio = 0;

  const filasBoletin = materiasAnuales.map((mat, index) => {
    horasTotalesAnio += mat.cargaHoraria || 0;
    const cal = calificaciones.find(
      c => c.estudianteId === estudiante?.id && (c.materiaId === mat.id || c.cursoId === mat.id)
    );

    const notaFinal = cal ? Number(cal.notaFinal || 0) : 0;
    if (notaFinal > 0) {
      sumaNotas += notaFinal;
      countNotas++;
      if (notaFinal < 51) reprobados++;
    } else {
      reprobados++;
    }

    const aprobado = notaFinal >= 51;

    return {
      nro: index + 1,
      materia: mat,
      notaFinal,
      notaLiteral: `${numeroALetras(notaFinal)} / 100`,
      estado: aprobado ? 'APROBADO' : 'REPROBADO',
      docente: mat.docente
    };
  });

  const promedioGeneral = materiasAnuales.length > 0 ? Math.round(sumaNotas / materiasAnuales.length) : 0;
  const todasAprobadas = reprobados === 0 && materiasAnuales.length > 0;

  // Condición oficial según el año
  let condicionAcademica = 'EN REGULARIZACIÓN ACADÉMICA';
  let badgeColor = 'bg-slate-100 text-slate-700';

  if (materiasAnuales.length > 0) {
    if (todasAprobadas) {
      if (anio === 1) {
        condicionAcademica = 'PROMOVIDO AL SEGUNDO AÑO';
      } else if (anio === 2) {
        condicionAcademica = 'PROMOVIDO AL TERCER AÑO';
      } else {
        condicionAcademica = 'HABILITADO A MODALIDAD DE GRADUACIÓN / TÍTULO PROFESIONAL';
      }
      badgeColor = 'bg-emerald-100 text-emerald-900 border border-emerald-300';
    } else {
      condicionAcademica = `REPROBADO (${reprobados} ASIGNATURA(S) PENDIENTE(S))`;
      badgeColor = 'bg-red-100 text-red-900 border border-red-300';
    }
  }

  const [imprimiendo, setImprimiendo] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState<string | null>(null);

  const handlePrint = async () => {
    setImprimiendo(true);
    setMensajeEstado('Enviando boletín oficial a la impresora...');
    try {
      const res = await imprimirElementoUniversal(
        'documento-boletin-oficial',
        `Boletin Oficial - ${estudiante?.apellidos}, ${estudiante?.nombres}`
      );
      if (res.exito) {
        setMensajeEstado('✓ Diálogo de impresión invocado.');
      } else {
        descargarDocumentoHtml(
          'documento-boletin-oficial',
          `Boletin_Oficial_${estudiante?.codigo}_${estudiante?.apellidos}`
        );
        setMensajeEstado('Descargando archivo oficial de boletín...');
      }
    } catch (e) {
      console.error('Error al imprimir boletín:', e);
      descargarDocumentoHtml(
        'documento-boletin-oficial',
        `Boletin_Oficial_${estudiante?.codigo}_${estudiante?.apellidos}`
      );
    } finally {
      setTimeout(() => {
        setImprimiendo(false);
        setTimeout(() => setMensajeEstado(null), 5000);
      }, 1000);
    }
  };

  const handleDescargarBoletin = () => {
    descargarDocumentoHtml(
      'documento-boletin-oficial',
      `Boletin_Oficial_${estudiante?.codigo}_${estudiante?.apellidos}`
    );
    setMensajeEstado('✓ Boletín descargado como archivo web (abrir y presionar Imprimir).');
    setTimeout(() => setMensajeEstado(null), 5000);
  };

  // Manejo de carga de archivo de logotipo personalizado
  const handleUploadLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        localStorage.setItem('IDC_CUSTOM_LOGO_URL', result);
        window.location.reload(); // Recargar para aplicar en todo el sistema
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Controles no imprimibles */}
      <div className="no-print flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-black text-slate-900">
              Boletín Oficial de Calificaciones y Kárdex Anual
            </h2>
            <span className="bg-blue-100 text-blue-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-blue-200 uppercase">
              R.M. No. 0397/2024
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Generación e impresión ministerial del boletín oficial anualizado (8 a 10 materias por año).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Selector de estudiante */}
          <select
            value={estId}
            onChange={(e) => setEstId(e.target.value)}
            className="w-full sm:w-72 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {estudiantes.map(e => {
              const c = carreras.find(car => car.id === e.carreraId);
              return (
                <option key={e.id} value={e.id}>
                  {e.apellidos}, {e.nombres} ({c?.codigo || ''} - {e.anioActual || 1}° Año)
                </option>
              );
            })}
          </select>

          {/* Botón Descargar Archivo Web */}
          <button
            onClick={handleDescargarBoletin}
            title="Descargar archivo HTML oficial para imprimir"
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer border border-slate-200"
          >
            <Download className="w-4 h-4 text-blue-900" />
            <span>Descargar Archivo</span>
          </button>

          {/* Botón de Imprimir */}
          <button
            onClick={handlePrint}
            disabled={imprimiendo}
            className={`px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition flex items-center gap-2 shrink-0 cursor-pointer ${
              imprimiendo ? 'opacity-70 cursor-wait' : ''
            }`}
          >
            <Printer className={`w-4 h-4 ${imprimiendo ? 'animate-bounce' : ''}`} />
            <span>{imprimiendo ? 'Enviando...' : 'Imprimir Boletín Oficial'}</span>
          </button>

          {/* Botón para subir archivo de logo directo */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUploadLogo}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Subir archivo de logotipo institucional original"
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Subir Logo</span>
          </button>
        </div>
      </div>

      {mensajeEstado && (
        <div className="no-print bg-blue-50 border border-blue-200 text-blue-900 text-xs px-5 py-2.5 rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{mensajeEstado}</span>
        </div>
      )}

      {/* DOCUMENTO OFICIAL IMPRIMIBLE (Formato Ministerial Oficial) */}
      <div id="documento-boletin-oficial" className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-300 shadow-xl max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0 text-slate-900 font-sans">
        {/* Encabezado Oficial con Logotipo */}
        <div className="border-b-2 border-slate-900 pb-5 mb-5">
          <div className="flex justify-between items-center gap-4">
            {/* Logotipo Oficial */}
            <div className="shrink-0 flex items-center justify-center">
              <IngDataCompLogo size="lg" showSubtitle={false} customLogoUrl={customLogoUrl} />
            </div>

            {/* Datos Institucionales Centrales */}
            <div className="text-center flex-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 block">
                ESTADO PLURINACIONAL DE BOLIVIA • MINISTERIO DE EDUCACIÓN
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-blue-950 tracking-tight leading-tight mt-0.5">
                {config.nombre}
              </h1>
              <p className="text-xs font-black text-red-600 tracking-wide mt-0.5 uppercase">
                {config.subtitulo}
              </p>
              <div className="inline-block bg-blue-50 border border-blue-200 px-3 py-0.5 rounded-full mt-1">
                <span className="text-xs font-extrabold text-blue-900">
                  {config.resolucionMinisterial}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                {config.ciudad} - {config.pais} • Dirección: {config.direccion}
              </p>
            </div>

            {/* Escudo / Sello Lateral */}
            <div className="text-right shrink-0">
              <div className="border-2 border-blue-950 rounded-xl p-2.5 text-center bg-blue-50/50">
                <span className="block text-[10px] font-extrabold text-blue-900 uppercase">
                  GESTIÓN ACADÉMICA
                </span>
                <span className="block text-lg font-black text-blue-950 font-mono">
                  {gestion}
                </span>
                <span className="block text-[9px] font-bold text-slate-500 uppercase mt-0.5">
                  RÉGIMEN ANUALIZADO
                </span>
              </div>
            </div>
          </div>

          <div className="text-center mt-4 pt-3 border-t border-slate-200">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-wider uppercase underline underline-offset-4">
              BOLETÍN OFICIAL DE CALIFICACIONES Y RENDIMIENTO ACADÉMICO
            </h2>
            <span className="text-xs font-bold text-slate-600">
              NIVEL TÉCNICO SUPERIOR (CARRERA ANUALIZADA - 3 AÑOS)
            </span>
          </div>
        </div>

        {/* Ficha del Estudiante */}
        {estudiante && (
          <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200 mb-6 text-xs sm:text-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2.5 gap-x-4">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Estudiante:</span>
                <span className="font-black text-slate-900">
                  {estudiante.apellidos}, {estudiante.nombres}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Cédula de Identidad:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {estudiante.ci} {estudiante.expedido}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Código de Matrícula:</span>
                <span className="font-bold text-blue-900 font-mono">
                  {estudiante.codigo}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Turno de Estudio:</span>
                <span className="font-bold text-slate-900">
                  {estudiante.turno}
                </span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Carrera Profesional:</span>
                <span className="font-black text-blue-950">
                  {carrera?.nombre} ({carrera?.codigo})
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Año de Formación:</span>
                <span className="font-black text-blue-900 bg-blue-100 px-2 py-0.5 rounded-md inline-block">
                  {anio}° Año ({anio === 1 ? 'Primer Año' : anio === 2 ? 'Segundo Año' : 'Tercer Año'})
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Resolución Ministerial:</span>
                <span className="font-bold text-slate-800 font-mono text-xs">
                  {carrera?.resolucion || config.resolucionMinisterial}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TABLA OFICIAL DE ASIGNATURAS ANUALES (Lee de Materias) */}
        <div className="mb-6">
          <table className="w-full text-left text-xs border border-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-2 w-8 text-center border-r border-slate-300">N°</th>
                <th className="py-2.5 px-3 w-20 border-r border-slate-300">Código</th>
                <th className="py-2.5 px-4 border-r border-slate-300">Asignatura Anual</th>
                <th className="py-2.5 px-2 w-16 text-center border-r border-slate-300">Horas</th>
                <th className="py-2.5 px-2 w-16 text-center border-r border-slate-300">Nota Numeral</th>
                <th className="py-2.5 px-4 border-r border-slate-300">Calificación Literal</th>
                <th className="py-2.5 px-3 text-center">Resultado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filasBoletin.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No hay asignaturas anuales configuradas para este año y carrera.
                  </td>
                </tr>
              ) : (
                filasBoletin.map((fila) => (
                  <tr key={fila.materia.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-2 text-center font-bold text-slate-500 border-r border-slate-200">
                      {fila.nro}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-900 border-r border-slate-200">
                      {fila.materia.codigo}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900 border-r border-slate-200">
                      {fila.materia.nombre}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono text-slate-700 border-r border-slate-200">
                      {fila.materia.cargaHoraria}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-black text-sm border-r border-slate-200">
                      <span className={fila.notaFinal >= 51 ? 'text-slate-900' : 'text-red-600'}>
                        {fila.notaFinal}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-[11px] text-slate-700 border-r border-slate-200 uppercase font-mono">
                      {fila.notaLiteral}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        fila.estado === 'APROBADO'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-red-100 text-red-900'
                      }`}>
                        {fila.estado}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100/80 font-bold border-t-2 border-slate-300 text-xs">
                <td colSpan={3} className="py-2.5 px-4 text-right uppercase border-r border-slate-300">
                  Total Horas Anuales / Promedio General:
                </td>
                <td className="py-2.5 px-2 text-center font-mono font-black border-r border-slate-300">
                  {horasTotalesAnio} hrs
                </td>
                <td className="py-2.5 px-2 text-center font-mono font-black text-sm text-blue-950 border-r border-slate-300">
                  {promedioGeneral}
                </td>
                <td colSpan={2} className="py-2.5 px-4 font-mono uppercase text-slate-800">
                  {numeroALetras(promedioGeneral)} / 100
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Resumen Oficial y Condición Académica */}
        <div className="border border-slate-300 rounded-2xl p-4 bg-slate-50 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Condición Final de la Gestión:</span>
            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black tracking-wider uppercase mt-1 ${badgeColor}`}>
              {condicionAcademica}
            </span>
          </div>

          <div className="text-right text-xs space-y-0.5">
            <p className="text-slate-600">
              Total Asignaturas Cursadas: <strong className="text-slate-900 font-mono">{materiasAnuales.length}</strong>
            </p>
            <p className="text-slate-600">
              Asignaturas Aprobadas: <strong className="text-emerald-700 font-mono">{materiasAnuales.length - reprobados}</strong> | Reprobadas: <strong className="text-red-600 font-mono">{reprobados}</strong>
            </p>
            <p className="text-[10px] text-slate-400">
              Nota mínima de aprobación en Bolivia: 51 puntos sobre 100.
            </p>
          </div>
        </div>

        {/* SECCIÓN DE FIRMAS Y SELLOS OFICIALES */}
        <div className="pt-8 grid grid-cols-3 gap-6 text-center text-xs text-slate-800">
          <div className="flex flex-col items-center">
            <div className="w-36 border-b-2 border-slate-400 mb-2"></div>
            <span className="font-bold block">{config.directorAcademico}</span>
            <span className="text-[11px] text-slate-500 block">DIRECTOR ACADÉMICO</span>
            <span className="text-[9px] text-slate-400 font-mono">INSTITUTO TECNOLÓGICO ING DATA COMP</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase mb-2">
              Sello Oficial Institucional
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              SELLO DE KÁRDEX CENTRAL
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-36 border-b-2 border-slate-400 mb-2"></div>
            <span className="font-bold block">{config.secretariaGeneral}</span>
            <span className="text-[11px] text-slate-500 block">SECRETARÍA GENERAL</span>
            <span className="text-[9px] text-slate-400 font-mono">R.M. No. 0397/2024</span>
          </div>
        </div>

        {/* Pie de página institucional del boletín */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
          Documento académico emitido de acuerdo a la Ley N° 070 de la Educación y Resolución Ministerial {config.resolucionMinisterial}. Válido sin tachaduras ni enmiendas.
        </div>
      </div>
    </div>
  );
};
