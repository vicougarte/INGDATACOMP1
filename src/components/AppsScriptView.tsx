import React, { useState } from 'react';
import { CODIGO_GS_CONTENT, INDEX_HTML_CONTENT } from '../services/appsScriptGenerator';
import { 
  Code2, 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  ExternalLink, 
  Layers, 
  CheckCircle2,
  Terminal,
  FileSpreadsheet
} from 'lucide-react';

export const AppsScriptView: React.FC = () => {
  const [archivoActivo, setArchivoActivo] = useState<'gs' | 'html'>('gs');
  const [copiado, setCopiado] = useState(false);

  const contenidoActual = archivoActivo === 'gs' ? CODIGO_GS_CONTENT : INDEX_HTML_CONTENT;
  const nombreArchivo = archivoActivo === 'gs' ? 'Codigo.gs' : 'Index.html';

  const handleCopiar = () => {
    navigator.clipboard.writeText(contenidoActual);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  const handleDescargar = (tipo: 'gs' | 'html') => {
    const contenido = tipo === 'gs' ? CODIGO_GS_CONTENT : INDEX_HTML_CONTENT;
    const nombre = tipo === 'gs' ? 'Codigo.gs' : 'Index.html';
    const mime = tipo === 'gs' ? 'text/javascript' : 'text/html';

    const blob = new Blob([contenido], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', nombre);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDescargarAmbos = () => {
    handleDescargar('gs');
    setTimeout(() => handleDescargar('html'), 400);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-900 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              Código Fuente Listo para Google Apps Script
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Archivos del Sistema (.gs y .html)
          </h2>
          <p className="text-sm text-slate-500">
            Contiene la función <code className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-bold">inicializarBaseDeDatos()</code> que crea automáticamente las hojas y columnas en Google Sheets
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDescargarAmbos}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Descargar los 2 Archivos</span>
          </button>
        </div>
      </div>

      {/* GUÍA DE IMPLEMENTACIÓN RÁPIDA EN 5 PASOS */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 rounded-3xl shadow-lg border border-blue-900">
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-amber-400" />
          <span>Pasos para desplegar en tu Google Drive y Google Sheets:</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 text-xs">
          <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
            <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center mb-2">1</span>
            <p className="font-bold text-white mb-1">Crea la Hoja</p>
            <p className="text-slate-300">Abre Google Drive y crea una nueva Hoja de cálculo de Google en blanco.</p>
          </div>

          <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
            <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center mb-2">2</span>
            <p className="font-bold text-white mb-1">Abre Apps Script</p>
            <p className="text-slate-300">En la hoja, entra al menú <strong>Extensiones &gt; Apps Script</strong>.</p>
          </div>

          <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
            <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center mb-2">3</span>
            <p className="font-bold text-white mb-1">Pega el Código</p>
            <p className="text-slate-300">Reemplaza <code>Codigo.gs</code> y crea un archivo HTML llamado <code>Index.html</code>.</p>
          </div>

          <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
            <span className="w-6 h-6 rounded-full bg-emerald-400 text-slate-950 font-black flex items-center justify-center mb-2">4</span>
            <p className="font-bold text-emerald-300 mb-1">Inicializa la BD</p>
            <p className="text-slate-300">Selecciona la función <strong>inicializarBaseDeDatos</strong> y dale <strong>Ejecutar</strong>.</p>
          </div>

          <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
            <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center mb-2">5</span>
            <p className="font-bold text-white mb-1">Publica Web App</p>
            <p className="text-slate-300">Clic en <strong>Implementar &gt; Nueva implementación &gt; Aplicación web</strong>.</p>
          </div>
        </div>
      </div>

      {/* Selector de pestañas para ver Codigo.gs o Index.html */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50 border-b border-slate-200 gap-3">
          <div className="flex space-x-2">
            <button
              onClick={() => setArchivoActivo('gs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                archivoActivo === 'gs'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Codigo.gs (Apps Script Backend)</span>
            </button>

            <button
              onClick={() => setArchivoActivo('html')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                archivoActivo === 'html'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Index.html (Frontend Responsive)</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleDescargar(archivoActivo)}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Descargar {nombreArchivo}</span>
            </button>

            <button
              onClick={handleCopiar}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              {copiado ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Código</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Visor de Código */}
        <div className="relative">
          <pre className="p-6 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto max-h-[600px] leading-relaxed select-all">
            <code>{contenidoActual}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
