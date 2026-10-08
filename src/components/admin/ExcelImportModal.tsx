import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';
import { downloadProductTemplate } from '../../utils/exportUtils';
import { formatCurrency } from '../../utils/formatters';
import {
  FileSpreadsheet,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle2,
  X,
  FileCheck,
  RefreshCw,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ValidationError {
  row: number;
  field: string;
  message: string;
  data?: any;
}

interface ValidRow {
  rowNumber: number;
  nombre: string;
  marca: string;
  categoria: string;
  descripcion: string;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  sku: string;
  estado: string;
}

export const ExcelImportModal: React.FC = () => {
  const {
    excelImportModalOpen,
    setExcelImportModalOpen,
    token,
    addToast,
    refreshAllData,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);

  const [rawRows, setRawRows] = useState<any[]>([]);
  const [validRows, setValidRows] = useState<ValidRow[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [previewTab, setPreviewTab] = useState<'valid' | 'errors'>('valid');

  if (!excelImportModalOpen) return null;

  const handleClose = () => {
    setFile(null);
    setRawRows([]);
    setValidRows([]);
    setErrors([]);
    setExcelImportModalOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    processFile(selected);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setAnalyzing(true);
    setErrors([]);
    setValidRows([]);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (!data || data.length === 0) {
          addToast('error', 'El archivo no contiene filas o datos legibles.');
          setAnalyzing(false);
          return;
        }

        setRawRows(data);
        validateRowsWithBackend(data);
      } catch (err: any) {
        console.error('Error parsing file:', err);
        addToast('error', 'Error al leer el archivo Excel/CSV', err.message);
        setAnalyzing(false);
      }
    };

    reader.readAsBinaryString(selectedFile);
  };

  const validateRowsWithBackend = async (rows: any[]) => {
    setValidating(true);
    try {
      const res = await fetch('/api/products/validate-bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rows }),
      });

      const data = await res.json();
      if (!res.ok) {
        addToast('error', data.error || 'Error en la validación.');
        return;
      }

      setValidRows(data.validRows || []);
      setErrors(data.errors || []);
      if (data.errors && data.errors.length > 0) {
        setPreviewTab('errors');
      } else {
        setPreviewTab('valid');
      }
    } catch (err: any) {
      addToast('error', 'Error al validar productos', err.message);
    } finally {
      setAnalyzing(false);
      setValidating(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!validRows.length) return;
    setImporting(true);

    try {
      const res = await fetch('/api/products/commit-bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ validRows }),
      });

      const data = await res.json();
      if (!res.ok) {
        addToast('error', data.error || 'Error al importar productos.');
        return;
      }

      addToast(
        'success',
        '¡Importación completada con éxito!',
        `Se incorporaron y actualizaron ${data.count} productos en el catálogo escolar.`
      );

      await refreshAllData();
      handleClose();
    } catch (err: any) {
      addToast('error', 'Error al procesar la importación', err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        id="excel-import-modal-backdrop"
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center font-bold shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>Importación Masiva de Productos</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold uppercase">
                    Excel / CSV
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Cargá o actualizá productos, stock y precios escolares en lote sin cargarlos uno por uno.
                </p>
              </div>
            </div>

            <button
              id="close-excel-import-modal-btn"
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Step 1: Template and File dropzone */}
            {!file ? (
              <div className="space-y-4">
                {/* Instruction card */}
                <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-sky-950 dark:text-sky-100">
                        ¿Primera vez importando? Descargá la plantilla modelo
                      </h4>
                      <p className="text-xs text-sky-800 dark:text-sky-300 mt-0.5">
                        El archivo debe incluir las columnas: Nombre, Marca, Categoría, Descripción, Precio de compra, Precio de venta, Stock, SKU y Estado.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      id="download-excel-template-btn"
                      onClick={() => downloadProductTemplate('xlsx')}
                      className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-sky-600" />
                      <span>Plantilla Excel (.xlsx)</span>
                    </button>
                    <button
                      id="download-csv-template-btn"
                      onClick={() => downloadProductTemplate('csv')}
                      className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>CSV</span>
                    </button>
                  </div>
                </div>

                {/* Dropzone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-500 rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/20 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Hacé clic para seleccionar o arrastrá tu archivo Excel o CSV aquí
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    Formatos admitidos: .xlsx, .xls o .csv con encabezados estándar.
                  </p>
                </div>
              </div>
            ) : (
              /* Step 2: File Analysis & Preview */
              <div className="space-y-4">
                {/* File info banner */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-6 h-6 text-teal-600 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {file.name}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {(file.size / 1024).toFixed(1)} KB • {rawRows.length} filas leídas
                      </span>
                    </div>
                  </div>

                  <button
                    id="choose-different-file-btn"
                    onClick={() => {
                      setFile(null);
                      setRawRows([]);
                      setValidRows([]);
                      setErrors([]);
                    }}
                    className="text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 underline self-start sm:self-auto cursor-pointer"
                  >
                    Elegir otro archivo
                  </button>
                </div>

                {/* Validation Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Ready to import */}
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                          Productos listos para importar
                        </h4>
                      </div>
                      <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                        {validRows.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                      Filas válidas con datos consistentes de precio, stock y categoría.
                    </p>
                  </div>

                  {/* Errors / Needs attention */}
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <h4 className="text-xs font-bold text-amber-950 dark:text-amber-100">
                          Requieren corrección
                        </h4>
                      </div>
                      <span className="text-xl font-black text-amber-700 dark:text-amber-300">
                        {errors.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
                      {errors.length === 0
                        ? '¡Excelente! Ninguna fila presentó errores.'
                        : 'Filas con errores detectados que serán omitidas.'}
                    </p>
                  </div>
                </div>

                {/* Preview Tabs */}
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pt-2">
                  <button
                    id="preview-tab-valid"
                    onClick={() => setPreviewTab('valid')}
                    className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                      previewTab === 'valid'
                        ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Válidos ({validRows.length})
                  </button>
                  <button
                    id="preview-tab-errors"
                    onClick={() => setPreviewTab('errors')}
                    className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                      previewTab === 'errors'
                        ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Errores Detectados ({errors.length})
                  </button>
                </div>

                {/* Preview Content */}
                {previewTab === 'valid' ? (
                  validRows.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No hay filas válidas para previsualizar.
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 font-bold sticky top-0 uppercase tracking-wider">
                          <tr>
                            <th className="p-2.5">Fila</th>
                            <th className="p-2.5">Nombre</th>
                            <th className="p-2.5">Marca</th>
                            <th className="p-2.5">Categoría</th>
                            <th className="p-2.5">Costo</th>
                            <th className="p-2.5">Venta</th>
                            <th className="p-2.5">Stock</th>
                            <th className="p-2.5">SKU</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {validRows.map((r, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="p-2.5 font-mono text-slate-400">{r.rowNumber}</td>
                              <td className="p-2.5 font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                                {r.nombre}
                              </td>
                              <td className="p-2.5 text-slate-500">{r.marca}</td>
                              <td className="p-2.5 text-slate-500">{r.categoria}</td>
                              <td className="p-2.5 text-slate-500">{formatCurrency(r.precioCompra)}</td>
                              <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                                {formatCurrency(r.precioVenta)}
                              </td>
                              <td className="p-2.5 font-semibold text-slate-700 dark:text-slate-300">
                                {r.stock}
                              </td>
                              <td className="p-2.5 font-mono text-[11px] text-slate-400">{r.sku}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                ) : (
                  /* Errors tab */
                  errors.length === 0 ? (
                    <div className="py-8 text-center text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      ✓ No se detectaron errores en ninguna fila. Todo el archivo es válido.
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto rounded-2xl border border-rose-200 dark:border-rose-900/60 divide-y divide-rose-100 dark:divide-rose-900/40">
                      {errors.map((err, idx) => (
                        <div key={idx} className="p-3 bg-rose-50/50 dark:bg-rose-950/20 text-xs flex items-start gap-3">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="font-bold text-rose-900 dark:text-rose-200">
                              Fila {err.row}: {err.field}
                            </span>
                            <p className="text-rose-700 dark:text-rose-300 text-[11px] mt-0.5">
                              {err.message}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-3">
            <button
              id="cancel-excel-import-btn"
              onClick={handleClose}
              disabled={importing}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            {file && validRows.length > 0 && (
              <button
                id="confirm-import-valid-products-btn"
                onClick={handleConfirmImport}
                disabled={importing || validating}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 active:scale-98 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-600/20 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {importing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Importando {validRows.length} productos...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Importar {validRows.length} productos válidos</span>
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
