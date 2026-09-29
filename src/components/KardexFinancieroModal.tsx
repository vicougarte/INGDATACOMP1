import React, { useState } from 'react';
import { 
  Estudiante, 
  Carrera, 
  PagoCuotaEstudiante, 
  ConfiguracionInstituto, 
  CostoCarrera, 
  TransaccionPago, 
  MetodoPago,
  EstadoPagoCuota
} from '../types';
import { 
  Printer, 
  X, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  DollarSign, 
  Calendar, 
  User, 
  BookOpen, 
  Eye, 
  Award, 
  Receipt, 
  FileText,
  ShieldCheck,
  Check,
  Building2,
  TrendingUp,
  Percent,
  Plus
} from 'lucide-react';
import { IngDataCompLogo } from './IngDataCompLogo';
import { MESES_10_CUOTAS, COSTOS_CARRERAS_INICIALES } from '../data/initialData';
import { imprimirElementoUniversal, descargarDocumentoHtml } from '../services/printService';
import { Download } from 'lucide-react';

interface KardexFinancieroModalProps {
  estudiante: Estudiante;
  carrera: Carrera;
  cuotas: PagoCuotaEstudiante[];
  institutoConfig?: ConfiguracionInstituto;
  customLogoUrl?: string | null;
  costosCarreras?: CostoCarrera[];
  onClose: () => void;
  onRegistrarPagoCuota?: (cuotaActualizada: PagoCuotaEstudiante, nuevaTx: TransaccionPago) => void;
}

export const KardexFinancieroModal: React.FC<KardexFinancieroModalProps> = ({
  estudiante,
  carrera,
  cuotas,
  institutoConfig,
  customLogoUrl,
  costosCarreras = COSTOS_CARRERAS_INICIALES,
  onClose,
  onRegistrarPagoCuota
}) => {
  const [vistaPantallaCompleta, setVistaPantallaCompleta] = useState(false);
  
  // Modal interno para abonar rápidamente a una cuota desde el Kárdex
  const [cuotaParaAbonar, setCuotaParaAbonar] = useState<PagoCuotaEstudiante | null>(null);
  const [montoAbono, setMontoAbono] = useState<number>(0);
  const [metodoCobro, setMetodoCobro] = useState<MetodoPago>('Efectivo');
  const [nroReciboAbono, setNroReciboAbono] = useState<string>('');
  const [obsAbono, setObsAbono] = useState<string>('');

  const costoC = costosCarreras.find(c => c.carreraId === estudiante.carreraId) || costosCarreras[0];

  // Matrícula y aranceles con null-coalescing estricto (no usar || que rompería ceros)
  const costoMatriculaBase = estudiante.costoMatriculaBs ?? costoC.costoMatriculaBs;
  const descMatricula = estudiante.descuentoMatriculaBs ?? 0;
  const costoMatriculaFinal = estudiante.montoMatriculaFinalBs ?? Math.max(0, costoMatriculaBase - descMatricula);

  const costoPensionBase = estudiante.costoMensualidadBs ?? costoC.costoMensualidadBs;
  const descPension = estudiante.descuentoMensualidadBs ?? 0;
  const costoPensionFinal = estudiante.montoMensualidadFinalBs ?? Math.max(0, costoPensionBase - descPension);

  const otrosCostos = estudiante.otrosCostosBs ?? costoC.otrosCostosBs;
  const conceptoOtros = estudiante.conceptoOtrosCostos || costoC.descripcionOtrosCostos || 'Seguro estudiantil y carnet institucional';

  const totalPlanAnual = estudiante.montoTotalGestionBs ?? (costoMatriculaFinal + (costoPensionFinal * 10) + otrosCostos);

  // Asegurar que siempre tengamos las 10 cuotas en orden del 1 al 10
  const cuotasCompletas: PagoCuotaEstudiante[] = MESES_10_CUOTAS.map(item => {
    const encontrada = cuotas.find(c => c.numeroCuota === item.numero && c.tipoPago === 'Cuota Mensual');
    if (encontrada) return encontrada;
    return {
      id: `pago-${estudiante.id}-cuota-${item.numero}`,
      estudianteId: estudiante.id,
      codigoEstudiante: estudiante.codigo,
      nombreEstudiante: `${estudiante.apellidos}, ${estudiante.nombres}`,
      carreraId: estudiante.carreraId,
      anio: estudiante.anioActual || 1,
      gestion: '2026',
      tipoPago: 'Cuota Mensual' as const,
      numeroCuota: item.numero,
      mesCorrespondiente: item.mes,
      fechaVencimiento: item.fechaVencimiento,
      montoPactadoBs: costoPensionFinal,
      montoPagadoBs: 0,
      saldoPendienteBs: costoPensionFinal,
      estado: 'Pendiente' as EstadoPagoCuota,
      transacciones: []
    };
  });

  // Cálculos de totales
  const totalPactadoCuotas = cuotasCompletas.reduce((acc, c) => acc + c.montoPactadoBs, 0);
  const totalPagadoCuotas = cuotasCompletas.reduce((acc, c) => acc + c.montoPagadoBs, 0);
  const saldoPendienteCuotas = totalPactadoCuotas - totalPagadoCuotas;

  const cuotasCanceladas = cuotasCompletas.filter(c => c.estado === 'Cancelado').length;
  const cuotasParciales = cuotasCompletas.filter(c => c.estado === 'Parcial').length;
  const cuotasPendientes = cuotasCompletas.filter(c => c.estado === 'Pendiente' || c.estado === 'Vencido').length;

  // Extraer todas las transacciones históricas registradas en las cuotas
  const todasLasTransacciones: {
    cuotaNro: number;
    mes: string;
    tx: TransaccionPago;
  }[] = [];

  cuotasCompletas.forEach(c => {
    if (c.transacciones && Array.isArray(c.transacciones)) {
      c.transacciones.forEach(tx => {
        todasLasTransacciones.push({
          cuotaNro: c.numeroCuota || 1,
          mes: c.mesCorrespondiente || '',
          tx
        });
      });
    }
  });

  const [imprimiendo, setImprimiendo] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState<string | null>(null);

  const handleImprimir = async () => {
    setImprimiendo(true);
    setMensajeEstado('Enviando Kárdex a la impresora...');
    try {
      const res = await imprimirElementoUniversal(
        'documento-kardex-financiero',
        `Kardex Financiero - ${estudiante.apellidos}, ${estudiante.nombres}`
      );
      if (res.exito) {
        setMensajeEstado('✓ Enviado a diálogo de impresión.');
      } else {
        setMensajeEstado('Descargando archivo oficial de Kárdex...');
        descargarDocumentoHtml(
          'documento-kardex-financiero',
          `Kardex_Financiero_${estudiante.codigo}_${estudiante.apellidos}`
        );
      }
    } catch (e) {
      console.error('Error al imprimir kárdex:', e);
      descargarDocumentoHtml(
        'documento-kardex-financiero',
        `Kardex_Financiero_${estudiante.codigo}_${estudiante.apellidos}`
      );
    } finally {
      setTimeout(() => {
        setImprimiendo(false);
        setTimeout(() => setMensajeEstado(null), 5000);
      }, 1000);
    }
  };

  const handleDescargarKardex = () => {
    descargarDocumentoHtml(
      'documento-kardex-financiero',
      `Kardex_Financiero_${estudiante.codigo}_${estudiante.apellidos}`
    );
    setMensajeEstado('✓ Kárdex descargado en formato web autónomo (abrir y pulsar Imprimir).');
    setTimeout(() => setMensajeEstado(null), 5000);
  };

  const handleAbrirAbono = (c: PagoCuotaEstudiante) => {
    setCuotaParaAbonar(c);
    setMontoAbono(c.saldoPendienteBs);
    setMetodoCobro('Efectivo');
    const corr = Math.floor(1000 + Math.random() * 9000);
    setNroReciboAbono(`REC-2026-${corr}`);
    setObsAbono(`Abono cuota N° ${c.numeroCuota} (${c.mesCorrespondiente})`);
  };

  const handleConfirmarAbono = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuotaParaAbonar || !onRegistrarPagoCuota) return;

    const monto = Number(montoAbono);
    if (monto <= 0) return;

    const nuevoTotalPagado = cuotaParaAbonar.montoPagadoBs + monto;
    const nuevoSaldo = Math.max(0, cuotaParaAbonar.montoPactadoBs - nuevoTotalPagado);
    const nuevoEstado: EstadoPagoCuota = nuevoSaldo === 0 ? 'Cancelado' : 'Parcial';

    const fechaHoy = new Date().toISOString().slice(0, 10);
    const horaHoy = new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });

    const nuevaTx: TransaccionPago = {
      id: `tx-kd-${Date.now()}`,
      fecha: fechaHoy,
      hora: horaHoy,
      montoBs: monto,
      metodoPago: metodoCobro,
      nroRecibo: nroReciboAbono || `REC-2026-${Date.now().toString().slice(-4)}`,
      cajero: 'Caja Central (Kárdex)',
      observaciones: obsAbono
    };

    const cuotaActualizada: PagoCuotaEstudiante = {
      ...cuotaParaAbonar,
      montoPagadoBs: nuevoTotalPagado,
      saldoPendienteBs: nuevoSaldo,
      estado: nuevoEstado,
      ultimoNroRecibo: nuevaTx.nroRecibo,
      ultimaFechaPago: fechaHoy,
      ultimoMetodoPago: metodoCobro,
      transacciones: [...(cuotaParaAbonar.transacciones || []), nuevaTx]
    };

    onRegistrarPagoCuota(cuotaActualizada, nuevaTx);
    setCuotaParaAbonar(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:overflow-visible">
      <div className={`bg-white rounded-3xl w-full ${vistaPantallaCompleta ? 'max-w-7xl' : 'max-w-5xl'} shadow-2xl overflow-hidden flex flex-col border border-slate-200 print:border-none print:shadow-none print:rounded-none print:w-full`}>
        
        {/* ========================================================================= */}
        {/* BARRA SUPERIOR DE ACCIONES (NO IMPRIMIBLE)                                */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 no-print border-b border-blue-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-2xl shadow-md">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span>Kárdex Financiero Oficial del Estudiante</span>
                <span className="bg-emerald-400 text-slate-950 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  Gestión 2026 • 10 Cuotas
                </span>
              </h3>
              <p className="text-xs text-blue-200">
                Visualización en pantalla y reporte para impresora con aranceles, becas, rebajas y registro de pagos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-end sm:self-center">
            {/* Alternar pantalla completa */}
            <button
              type="button"
              onClick={() => setVistaPantallaCompleta(!vistaPantallaCompleta)}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-blue-200 hover:text-white rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title={vistaPantallaCompleta ? 'Reducir tamaño' : 'Ver en Pantalla Completa'}
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">{vistaPantallaCompleta ? 'Normal' : 'Pantalla Completa'}</span>
            </button>

            {/* Botón Descargar Archivo Web */}
            <button
              type="button"
              onClick={handleDescargarKardex}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Descargar archivo HTML oficial listo para abrir e imprimir directamente"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Descargar Archivo</span>
            </button>

            {/* Botón Imprimir en Impresora / PDF */}
            <button
              type="button"
              onClick={handleImprimir}
              disabled={imprimiendo}
              className={`px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-950/40 cursor-pointer ${
                imprimiendo ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              <Printer className={`w-4 h-4 ${imprimiendo ? 'animate-bounce' : ''}`} />
              <span>{imprimiendo ? 'Enviando...' : 'Imprimir en Impresora / PDF'}</span>
            </button>

            {/* Botón Cerrar */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition cursor-pointer"
              title="Cerrar Kárdex"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notificación de estado */}
        {mensajeEstado && (
          <div className="no-print bg-blue-900/40 border-b border-blue-800 text-blue-100 text-xs px-5 py-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{mensajeEstado}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DOCUMENTO OFICIAL DEL KÁRDEX FINANCIERO (IMPRIMIBLE Y EN PANTALLA)        */}
        {/* ========================================================================= */}
        <div id="documento-kardex-financiero" className="p-4 sm:p-8 overflow-y-auto max-h-[calc(100vh-120px)] print:max-h-none print:overflow-visible print:p-0 space-y-5 bg-white text-slate-900">
          
          {/* 1. ENCABEZADO INSTITUCIONAL */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 shrink-0 flex items-center justify-center">
                <IngDataCompLogo size="md" customLogoUrl={customLogoUrl} />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-950 uppercase leading-snug">
                  {institutoConfig?.nombre || 'INSTITUTO TECNOLÓGICO ING DATA COMP'}
                </h1>
                <div className="text-[11px] font-bold text-blue-900 flex flex-wrap items-center gap-x-2">
                  <span>Resolución Ministerial: {institutoConfig?.resolucionMinisterial || 'R.M. No. 0397/2024'}</span>
                  <span>•</span>
                  <span>Ministerio de Educación del Estado Plurinacional de Bolivia</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  {institutoConfig?.direccion || 'Av. Heroínas esq. Ayacucho, Edificio Tecnológico 4to Piso, Cochabamba'} | Telf: {institutoConfig?.telefono || '+591 4 4528900 / 76912345'}
                </p>
              </div>
            </div>

            <div className="text-right border-l-2 border-slate-900 pl-4 shrink-0">
              <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">DOCUMENTO OFICIAL</span>
              <strong className="text-xs sm:text-sm font-black text-blue-950 block">KÁRDEX FINANCIERO</strong>
              <span className="text-[10px] font-mono font-bold text-slate-600 block">Gestión Anual 2026</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                Emisión: {new Date().toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* 2. DATOS DEL ESTUDIANTE Y PROGRAMA ACADÉMICO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 block">DATOS DEL ESTUDIANTE</span>
              <strong className="text-sm font-black text-slate-950 block">
                {estudiante.apellidos.toUpperCase()}, {estudiante.nombres}
              </strong>
              <div className="flex items-center gap-2 font-mono text-[11px] text-slate-700">
                <span>CI: <strong className="text-slate-900">{estudiante.ci} {estudiante.expedido}</strong></span>
                <span>•</span>
                <span>Cód: <strong className="text-blue-900">{estudiante.codigo}</strong></span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                Telf: {estudiante.telefono || 'Sin teléfono'} • Email: {estudiante.email || 'Sin correo'}
              </span>
            </div>

            <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-200 md:pl-3 pt-2 md:pt-0">
              <span className="text-[10px] font-black uppercase text-slate-400 block">PROGRAMA ACADÉMICO</span>
              <strong className="text-xs font-bold text-slate-900 block">
                {carrera.nombre}
              </strong>
              <span className="text-[11px] font-semibold text-blue-900 block">
                {estudiante.anioActual || 1}° Año de Formación • Turno {estudiante.turno}
              </span>
              <span className="text-[10px] text-slate-500 block">
                Régimen Anualizado (R.M. No. 0397/2024)
              </span>
            </div>

            <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-200 md:pl-3 pt-2 md:pt-0">
              <span className="text-[10px] font-black uppercase text-slate-400 block">CONDICIÓN DE MATRÍCULA</span>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {estudiante.estado || 'Activo'}
                </span>
                {estudiante.tipoDescuento && estudiante.tipoDescuento !== 'Ninguno' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-900 border border-indigo-300">
                    {estudiante.tipoDescuento}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-600 block mt-1">
                Fecha Inscripción: {estudiante.fechaInscripcion || '2026-02-05'}
              </span>
              <span className="text-[10px] text-slate-500 italic block truncate" title={estudiante.observaciones}>
                Obs: {estudiante.observaciones || 'Matrícula regular confirmada'}
              </span>
            </div>
          </div>

          {/* 3. PARÁMETROS ARANCELARIOS Y CONDICIÓN ECONÓMICA PACTADA */}
          <div className="border border-emerald-300 rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="bg-emerald-900 text-white px-4 py-2 flex justify-between items-center text-xs font-black uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-300" />
                <span>Condiciones Arancelarias Oficiales (Gestión Anual 2026)</span>
              </span>
              <span className="bg-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded text-emerald-100">
                Plan Oficial de 10 Cuotas Anuales
              </span>
            </div>

            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Arancel Matrícula</span>
                <div className="mt-0.5">
                  <strong className="text-sm font-black text-slate-900">{costoMatriculaFinal} Bs</strong>
                  {descMatricula > 0 && (
                    <span className="text-[10px] text-emerald-700 block font-semibold">
                      (Base: {costoMatriculaBase} Bs - Rebaja: {descMatricula} Bs)
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Pensión por Cuota (x10)</span>
                <div className="mt-0.5">
                  <strong className="text-sm font-black text-blue-900">{costoPensionFinal} Bs / mes</strong>
                  {descPension > 0 && (
                    <span className="text-[10px] text-emerald-700 block font-semibold">
                      (Base: {costoPensionBase} Bs - Beca: {descPension} Bs)
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Otros Aranceles</span>
                <div className="mt-0.5">
                  <strong className="text-sm font-black text-slate-800">{otrosCostos} Bs</strong>
                  <span className="text-[9px] text-slate-500 block truncate" title={conceptoOtros}>
                    {conceptoOtros}
                  </span>
                </div>
              </div>

              <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                <span className="text-[10px] font-bold uppercase text-emerald-900 block">Total Plan Gestión Anual</span>
                <div className="mt-0.5">
                  <strong className="text-base font-black text-emerald-800">{totalPlanAnual.toLocaleString()} Bs</strong>
                  <span className="text-[9px] text-emerald-700 block">
                    Matrícula + 10 Pensiones + Seguro
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. TABLA DETALLADA DE LAS 10 CUOTAS MENSUALES (PAGO POR N° DE CUOTA) */}
          <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-xs">
            <div className="bg-slate-900 text-white px-4 py-2.5 flex justify-between items-center text-xs font-black uppercase tracking-wider">
              <span>Registro y Control de Pagos por Número de Cuota (1 al 10)</span>
              <span className="text-amber-300 font-mono text-[11px]">Vencimiento: Día 10 de cada mes</span>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-black border-b border-slate-300 text-[11px]">
                  <th className="p-2.5 text-center">N° Cuota</th>
                  <th className="p-2.5">Mes Correspondiente</th>
                  <th className="p-2.5">Fecha Vencimiento</th>
                  <th className="p-2.5 text-right">Pactado</th>
                  <th className="p-2.5 text-right">Pagado</th>
                  <th className="p-2.5 text-right">Saldo</th>
                  <th className="p-2.5">N° Recibo / Fecha</th>
                  <th className="p-2.5">Método de Pago</th>
                  <th className="p-2.5 text-center">Estado</th>
                  <th className="p-2.5 text-center no-print">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {cuotasCompletas.map((c) => {
                  const cancelada = c.estado === 'Cancelado';
                  const parcial = c.estado === 'Parcial';

                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition">
                      <td className="p-2.5 text-center font-mono font-bold">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-md">
                          C{c.numeroCuota}
                        </span>
                      </td>
                      <td className="p-2.5 font-bold text-slate-950">
                        {c.mesCorrespondiente} 2026
                      </td>
                      <td className="p-2.5 font-mono text-slate-600">
                        {c.fechaVencimiento || `2026-${String((c.numeroCuota || 1) + 1).padStart(2, '0')}-10`}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-800">
                        {c.montoPactadoBs} Bs
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-emerald-700">
                        {c.montoPagadoBs} Bs
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-amber-700">
                        {c.saldoPendienteBs} Bs
                      </td>
                      <td className="p-2.5 font-mono text-[10px]">
                        {c.ultimoNroRecibo ? (
                          <div>
                            <strong className="text-blue-900 block">{c.ultimoNroRecibo}</strong>
                            <span className="text-slate-400 block">{c.ultimaFechaPago}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </td>
                      <td className="p-2.5 text-[10px] text-slate-700">
                        {c.ultimoMetodoPago || '-'}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full font-black text-[10px] ${
                          cancelada ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          parcial ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          'bg-slate-100 text-slate-600 border border-slate-300'
                        }`}>
                          {c.estado}
                        </span>
                      </td>
                      <td className="p-2.5 text-center no-print">
                        {c.saldoPendienteBs > 0 && onRegistrarPagoCuota ? (
                          <button
                            type="button"
                            onClick={() => handleAbrirAbono(c)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[10px] shadow-xs cursor-pointer inline-flex items-center gap-1"
                          >
                            <DollarSign className="w-3 h-3" />
                            <span>Cobrar</span>
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-bold text-[10px]">Al día</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {/* FILA DE TOTALES */}
                <tr className="bg-slate-100 font-black border-t-2 border-slate-900 text-xs">
                  <td colSpan={3} className="p-3 text-slate-900 uppercase">
                    TOTALES PLAN 10 CUOTAS (GESTIÓN 2026):
                  </td>
                  <td className="p-3 text-right font-mono text-slate-950">
                    {totalPactadoCuotas.toLocaleString()} Bs
                  </td>
                  <td className="p-3 text-right font-mono text-emerald-800">
                    {totalPagadoCuotas.toLocaleString()} Bs
                  </td>
                  <td className="p-3 text-right font-mono text-amber-800">
                    {saldoPendienteCuotas.toLocaleString()} Bs
                  </td>
                  <td colSpan={2} className="p-3 text-[11px] text-slate-600 font-medium">
                    {cuotasCanceladas} de 10 Cuotas Canceladas
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black ${
                      saldoPendienteCuotas === 0 ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {saldoPendienteCuotas === 0 ? 'CUOTAS AL DÍA' : 'SALDO PENDIENTE'}
                    </span>
                  </td>
                  <td className="no-print"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 5. HISTORIAL DE RECIBOS Y TRANSACCIONES EMITIDAS */}
          {todasLasTransacciones.length > 0 && (
            <div className="border border-slate-300 rounded-2xl overflow-hidden">
              <div className="bg-slate-800 text-white px-4 py-2 flex justify-between items-center text-xs font-black uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <span>Historial de Recibos y Abonos Registrados en Caja</span>
                </span>
                <span className="text-[10px] text-slate-300 font-mono">
                  Total Abonos: {todasLasTransacciones.length}
                </span>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[10px] uppercase">
                    <th className="p-2">Fecha y Hora</th>
                    <th className="p-2">N° Recibo</th>
                    <th className="p-2">Concepto</th>
                    <th className="p-2 text-right">Monto Abonado</th>
                    <th className="p-2">Método</th>
                    <th className="p-2">Cajero</th>
                    <th className="p-2">Observaciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {todasLasTransacciones.map((item, idx) => (
                    <tr key={item.tx.id || idx}>
                      <td className="p-2 font-mono text-slate-600">{item.tx.fecha} {item.tx.hora || ''}</td>
                      <td className="p-2 font-mono font-bold text-blue-900">{item.tx.nroRecibo}</td>
                      <td className="p-2 font-semibold text-slate-900">Cuota {item.cuotaNro} ({item.mes})</td>
                      <td className="p-2 text-right font-mono font-bold text-emerald-700">{item.tx.montoBs} Bs</td>
                      <td className="p-2 text-slate-700">{item.tx.metodoPago}</td>
                      <td className="p-2 text-slate-600">{item.tx.cajero || 'Caja Central'}</td>
                      <td className="p-2 text-slate-500 italic text-[10px]">{item.tx.observaciones || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 6. BALANCE GENERAL RESUMIDO */}
          <div className="bg-slate-50 border border-slate-300 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Matrícula y Arancel:</span>
              <strong className="text-sm font-black text-slate-900 block mt-0.5">
                {costoMatriculaFinal} Bs
              </strong>
              <span className="text-[9px] text-emerald-700 font-bold">
                {estudiante.montoPagadoInicialBs ? `${estudiante.montoPagadoInicialBs} Bs Abonado` : 'Al Día'}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Total 10 Pensiones:</span>
              <strong className="text-sm font-black text-blue-950 block mt-0.5">
                {totalPactadoCuotas.toLocaleString()} Bs
              </strong>
              <span className="text-[9px] text-slate-500">10 Cuotas de {costoPensionFinal} Bs</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Recaudado a la Fecha:</span>
              <strong className="text-sm font-black text-emerald-700 block mt-0.5">
                {totalPagadoCuotas.toLocaleString()} Bs
              </strong>
              <span className="text-[9px] text-emerald-600 font-bold">
                {totalPactadoCuotas > 0 ? Math.round((totalPagadoCuotas / totalPactadoCuotas) * 100) : 0}% Cumplido
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Saldo Pendiente de Cobro:</span>
              <strong className={`text-sm font-black block mt-0.5 ${saldoPendienteCuotas > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {saldoPendienteCuotas.toLocaleString()} Bs
              </strong>
              <span className="text-[9px] text-slate-500">
                {saldoPendienteCuotas === 0 ? 'Gestión 100% Cancelada' : `${cuotasPendientes + cuotasParciales} cuotas por liquidar`}
              </span>
            </div>
          </div>

          {/* 7. FIRMAS Y SELLOS OFICIALES */}
          <div className="pt-8 grid grid-cols-3 gap-6 text-center text-[10px] text-slate-600 border-t border-slate-300">
            <div>
              <div className="border-b border-slate-400 w-36 mx-auto mb-1.5 h-10 flex items-end justify-center">
                <span className="text-[9px] text-slate-400 italic">Firma del Estudiante</span>
              </div>
              <strong className="block text-slate-900 font-bold uppercase">{estudiante.nombres} {estudiante.apellidos}</strong>
              <span className="text-slate-500 block">Estudiante Titular</span>
            </div>

            <div>
              <div className="border-b border-slate-400 w-36 mx-auto mb-1.5 h-10 flex items-end justify-center">
                <span className="text-[9px] text-slate-400 italic">Sello y Firma</span>
              </div>
              <strong className="block text-slate-900 font-bold uppercase">Caja Central y Cobranzas</strong>
              <span className="text-slate-500 block">ING DATA COMP Cochabamba</span>
            </div>

            <div>
              <div className="border-b border-slate-400 w-36 mx-auto mb-1.5 h-10 flex items-end justify-center">
                <span className="text-[9px] text-slate-400 italic">Vo. Bo. Kárdex</span>
              </div>
              <strong className="block text-slate-900 font-bold uppercase">Dirección Académica y Administrativa</strong>
              <span className="text-slate-500 block">Resolución Ministerial R.M. No. 0397/2024</span>
            </div>
          </div>

          <div className="pt-2 text-center text-[9px] text-slate-400 flex justify-between items-center border-t border-slate-200">
            <span>Kárdex Financiero Oficial • Instituto Tecnológico ING DATA COMP Cochabamba</span>
            <span>Documento generado con valor administrativo • Gestión Académica 2026</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODAL INTERNO: REGISTRAR ABONO / PAGO A UNA CUOTA SELECCIONADA           */}
        {/* ========================================================================= */}
        {cuotaParaAbonar && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 no-print">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                    <DollarSign className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-black text-slate-900 text-base">Registrar Pago de Cuota N° {cuotaParaAbonar.numeroCuota}</h3>
                    <p className="text-xs text-slate-500">
                      {cuotaParaAbonar.mesCorrespondiente} 2026 • {estudiante.apellidos}, {estudiante.nombres}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setCuotaParaAbonar(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmarAbono} className="space-y-3.5">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-500 block">Saldo Pendiente:</span>
                    <strong className="text-base font-black text-amber-700">{cuotaParaAbonar.saldoPendienteBs} Bs</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block">Monto Pactado:</span>
                    <strong className="text-slate-800">{cuotaParaAbonar.montoPactadoBs} Bs</strong>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Monto a Abonar (Bs) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={cuotaParaAbonar.saldoPendienteBs}
                    required
                    value={montoAbono}
                    onChange={(e) => setMontoAbono(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-black text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="flex gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setMontoAbono(cuotaParaAbonar.saldoPendienteBs)}
                      className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px] font-bold"
                    >
                      Pagar Total ({cuotaParaAbonar.saldoPendienteBs} Bs)
                    </button>
                    {cuotaParaAbonar.saldoPendienteBs > 100 && (
                      <button
                        type="button"
                        onClick={() => setMontoAbono(Math.round(cuotaParaAbonar.saldoPendienteBs / 2))}
                        className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px] font-bold"
                      >
                        Pagar Mitad ({Math.round(cuotaParaAbonar.saldoPendienteBs / 2)} Bs)
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Método de Pago *
                    </label>
                    <select
                      value={metodoCobro}
                      onChange={(e) => setMetodoCobro(e.target.value as MetodoPago)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                    >
                      <option value="Efectivo">Efectivo</option>
                      <option value="QR Simple">QR Simple (Banca Móvil)</option>
                      <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                      <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                      <option value="Tigo Money">Tigo Money</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      N° de Recibo *
                    </label>
                    <input
                      type="text"
                      required
                      value={nroReciboAbono}
                      onChange={(e) => setNroReciboAbono(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Glosa / Observación
                  </label>
                  <input
                    type="text"
                    value={obsAbono}
                    onChange={(e) => setObsAbono(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCuotaParaAbonar(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirmar Pago</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
