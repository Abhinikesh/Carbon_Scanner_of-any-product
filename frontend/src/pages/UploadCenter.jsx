import React, { useState, useRef, useCallback } from 'react';
import {
  ShoppingCart, Receipt, Plane, Barcode, FileUp, Plus,
  Brain, FileText, CheckCircle2, ShieldCheck, CheckCheck,
  FileSearch, ScanLine, X, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Toast } from '../App.jsx';
import api from '../api.js';

const TABS = [
  { id: 'product', label: 'Product', Icon: ShoppingCart },
  { id: 'receipt', label: 'Receipt', Icon: Receipt      },
  { id: 'flight',  label: 'Flight',  Icon: Plane        },
  { id: 'barcode', label: 'Barcode', Icon: Barcode      },
];

const ACCEPT = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
const MAX_MB = 25;

export default function UploadCenter() {
  const navigate    = useNavigate();
  const [activeTab, setActiveTab] = useState('product');
  const [files,     setFiles]     = useState([]);
  const [toast,     setToast]     = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [dragging,  setDragging]  = useState(false);
  const fileInputRef    = useRef(null);
  const addMoreInputRef = useRef(null);

  function showToast(msg, type = 'error') {
    setToast({ msg, type });
  }

  function validateAndAdd(newFiles) {
    const valid = [];
    for (const f of newFiles) {
      if (!ACCEPT.includes(f.type)) {
        showToast(`"${f.name}" is not a supported file type.`);
        continue;
      }
      if (f.size > MAX_MB * 1024 * 1024) {
        showToast(`"${f.name}" exceeds the ${MAX_MB}MB limit.`);
        continue;
      }
      valid.push({ file: f, preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : null });
    }
    setFiles(prev => [...prev, ...valid]);
  }

  function onFileInput(e) {
    validateAndAdd(Array.from(e.target.files));
    e.target.value = '';
  }

  function removeFile(idx) {
    setFiles(prev => {
      const copy = [...prev];
      if (copy[idx].preview) URL.revokeObjectURL(copy[idx].preview);
      copy.splice(idx, 1);
      return copy;
    });
  }

  // Drag & Drop
  const onDragOver = useCallback((e) => { e.preventDefault(); setDragging(true); }, []);
  const onDragLeave = useCallback(() => setDragging(false), []);
  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    validateAndAdd(Array.from(e.dataTransfer.files));
  }, []);

  async function handleProcess() {
    if (files.length === 0) {
      showToast('Please upload at least one file.');
      return;
    }
    setLoading(true);
    try {
      // Build multipart payload – backend expects field name "image"
      const formData = new FormData();
      // Use the first file for standard single uploads
      formData.append('image', files[0].file);
      formData.append('type', activeTab); // product | receipt | flight | barcode

      await api.post('/api/scan/upload', formData);

      setLoading(false);
      setSuccess(true);
      showToast('Files processed successfully!', 'success');
      setTimeout(() => navigate('/app/dashboard'), 1500);
    } catch (err) {
      setLoading(false);
      const isOffline =
        err.message === 'Failed to fetch' || err.status === undefined;
      showToast(
        isOffline
          ? 'Cannot reach the server. Is the backend running on port 5000?'
          : err.message || 'Processing failed. Please try again.'
      );
    }
  }

  return (
    <div className="px-10 pt-8 pb-10 bg-paper">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <header className="mb-6">
        <h1 className="text-[36px] font-bold text-ink leading-tight mb-2 font-display">Upload Center</h1>
        <p className="text-gray-500 text-sm max-w-2xl leading-relaxed font-body">
          Precision data entry for climate tracking. Archive your lifestyle impacts through receipts, flight logs, and product scans.
        </p>
      </header>

      {/* Tabs */}
      <div className="mb-7">
        <div className="bg-gray-100 p-1 rounded-xl inline-flex gap-1">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all font-body ${
                activeTab === id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-5">

        {/* ── LEFT ── */}
        <div className="w-full lg:w-[60%]">
          <div className="bg-white border border-mist rounded-xl p-7 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-display font-bold text-base text-ink">Import Documents</h2>
              <span className="font-mono text-[9px] font-bold text-gray-400 uppercase tracking-widest">Multi-File Supported</span>
            </div>

            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`border-2 border-dashed rounded-xl bg-gray-50 cursor-pointer p-10 flex flex-col items-center justify-center mb-5 transition-colors select-none ${
                dragging ? 'border-forest bg-green-50' : 'border-mist hover:border-gray-300'
              }`}
            >
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <FileUp className="w-5 h-5 text-gray-600" />
              </div>
              <p className="font-display font-bold text-ink text-[15px] mb-1">Drop files here or browse</p>
              <p className="text-xs text-gray-400 font-body">
                Upload multiple PDF, PNG, or JPG (Max <span className="font-mono tabular-nums">{MAX_MB}</span>MB each)
              </p>
            </div>
            <input ref={fileInputRef} type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp" className="hidden" onChange={onFileInput} />
            <input ref={addMoreInputRef} type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp" className="hidden" onChange={onFileInput} />

            {/* Thumbnails */}
            <div className="flex flex-wrap gap-4 mb-7">
              {/* Uploaded file thumbs */}
              {files.map((f, i) => (
                <div key={i} className="relative w-[110px] h-[110px] bg-[#353d38] rounded-xl overflow-hidden flex-shrink-0 group">
                  {f.preview
                    ? <img src={f.preview} alt={f.file.name} className="w-full h-full object-cover" />
                    : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white gap-2 font-body">
                        <span className="text-3xl">📄</span>
                        <span className="text-[9px] text-gray-300 text-center px-2 truncate w-full">{f.file.name}</span>
                      </div>
                    )
                  }
                  {/* Remove button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                    className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}

              {/* Static receipt thumb (always shown) */}
              {files.length === 0 && (
                <>
                  <div className="w-[110px] h-[110px] bg-[#353d38] rounded-xl overflow-hidden flex items-center justify-center p-2 flex-shrink-0">
                    <div className="w-full h-full bg-[#4a524d] rounded-lg flex flex-col p-2">
                      <div className="text-[7px] text-gray-300 font-mono font-bold text-center border-b border-gray-500 pb-1 mb-1 uppercase">Receipt</div>
                      <div className="flex flex-col gap-1 mt-1">
                        {[...Array(5)].map((_, k) => (
                          <div key={k} className={`h-1 bg-gray-500 rounded ${k % 3 === 1 ? 'w-3/4' : k % 3 === 2 ? 'w-1/2' : 'w-full'}`} />
                        ))}
                      </div>
                      <div className="mt-auto pt-1 border-t border-gray-500">
                        <div className="h-1 bg-gray-400 rounded w-full" />
                      </div>
                    </div>
                  </div>
                  <div className="w-[130px] h-[110px] bg-[#353d38] rounded-xl overflow-hidden flex items-center justify-center p-2 flex-shrink-0">
                    <div className="w-full h-full bg-gray-100 rounded-lg flex flex-col p-2 text-gray-700">
                      <div className="flex justify-between items-start border-b border-gray-300 pb-1 mb-1 font-mono">
                        <span className="text-[7px] font-bold">FLIGHT TICKET</span>
                        <span className="text-[6px] text-gray-500">BARCODE</span>
                      </div>
                      <div className="flex gap-1 text-[6px] mb-1 font-body"><span className="font-bold">LHR</span><span className="text-gray-400">→</span><span className="font-bold">NYC</span></div>
                      <div className="flex flex-col gap-0.5">
                        <div className="h-0.5 bg-gray-300 rounded w-full" />
                        <div className="h-0.5 bg-gray-300 rounded w-2/3" />
                      </div>
                      <div className="mt-auto flex justify-between items-end">
                        <div><div className="h-0.5 bg-gray-400 rounded w-8 mb-0.5" /><div className="h-0.5 bg-gray-300 rounded w-5" /></div>
                        <div className="w-7 h-7 border border-gray-400 rounded-sm grid grid-cols-3 gap-px p-0.5">
                          {[...Array(9)].map((_, k) => <div key={k} className="bg-gray-500 rounded-[1px]" />)}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Add more */}
              <button
                onClick={() => addMoreInputRef.current?.click()}
                className="w-[110px] h-[110px] border-2 border-dashed border-mist rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-forest hover:text-forest transition-colors flex-shrink-0"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><Plus className="w-4 h-4" /></div>
                <span className="text-xs font-semibold font-body">Add more</span>
              </button>
            </div>

            {/* Process button */}
            <button
              onClick={handleProcess}
              disabled={loading || success}
              className={`w-full h-[52px] rounded-xl flex items-center justify-center gap-3 font-bold text-sm transition-all font-body focus:outline-none focus:ring-2 focus:ring-forest/20 ${
                success
                  ? 'bg-[#00c896] text-white'
                  : 'bg-forest hover:bg-forest-dark text-white disabled:opacity-70'
              }`}
            >
              {loading
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                : success
                  ? <><CheckCircle2 className="w-5 h-5" /> Done! Redirecting...</>
                  : <><ScanLine className="w-5 h-5" /> Process with AI Lens</>
              }
            </button>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="w-full lg:w-[38%] flex flex-col gap-5">
          {/* AI Processing card */}
          <div className="bg-forest rounded-xl p-6 text-white shadow-sm">
            <div className="flex items-center gap-2.5 mb-5">
              <Brain className="w-5 h-5 text-white" />
              <h3 className="font-display font-bold text-[15px]">AI Processing Layer</h3>
            </div>
            <div className="flex justify-between items-center mb-2 font-body">
              <span className="text-gray-300 text-sm">Engine Status</span>
              <span className="font-bold text-xs bg-forest-dark border border-mist/35 text-white px-2.5 py-0.5 rounded-full font-mono">ACTIVE</span>
            </div>
            <div className="h-1.5 bg-[#2d5940] rounded-full mb-5 overflow-hidden">
              <div className="h-full bg-[#00c896] w-full rounded-full" />
            </div>
            <p className="text-xs text-gray-300 leading-relaxed font-body">
              Our neural engine is currently decoding OCR data and classifying carbon footprints using international GHG protocols.
            </p>
          </div>

          {/* Live Activity card */}
          <div className="bg-white border border-mist rounded-xl p-5 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-bold text-ink text-[15px]">Live Activity</h3>
              <span className="text-[9px] font-mono font-bold text-forest bg-green-50 px-2.5 py-1 rounded uppercase tracking-widest">Processing</span>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { Icon: FileText,    name: 'WholeFoods_09_22...', subText: 'Groceries • ', subSize: '1.2', subUnit: 'MB', status: <><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /><span className="text-xs font-semibold text-green-600 font-body">Extracting OCR</span></> },
                { Icon: Barcode,     name: 'UPC_8849201.jpg',     subText: 'Electronics • ', subSize: '840', subUnit: 'KB', status: <><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /><span className="text-xs font-semibold text-blue-600 font-body">Classifying</span></> },
                { Icon: CheckCircle2,name: 'LHR_NYC_Flight.pdf',  subText: 'Travel • ', subSize: '2.1', subUnit: 'MB', status: <span className="text-xs text-gray-400 font-semibold font-body">Done</span> },
              ].map(({ Icon, name, subText, subSize, subUnit, status }, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-forest rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-ink leading-tight font-display">{name}</p>
                      <p className="text-xs text-gray-400 mt-0.5 font-body">
                        {subText}
                        <span className="font-mono tabular-nums">{subSize}</span>
                        {subUnit}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">{status}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-mist text-center">
              <button
                onClick={() => navigate('/app/dashboard')}
                className="text-[10px] font-mono font-bold text-forest hover:text-forest-dark uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-forest/20 rounded px-1"
              >
                View History
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 3 feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
        {[
          { Icon: ShieldCheck, title: 'Secure Transmission', text: 'All uploads are encrypted with AES-256 and processed in isolated sandbox environments.' },
          { Icon: CheckCheck,  title: 'Auto-Classification', text: 'Our AI automatically maps your data to the correct footprint category based on metadata.' },
          { Icon: FileSearch,  title: 'Archive Standards',   text: 'Compliant with GHG Protocol Corporate Standard for verifiable carbon reporting.' },
        ].map(({ Icon, title, text }) => (
          <div key={title} className="bg-white border border-mist rounded-xl p-6 shadow-sm">
            <Icon className="w-5 h-5 text-gray-500 mb-4" />
            <h4 className="font-display font-bold text-ink text-sm mb-2">{title}</h4>
            <p className="font-body text-xs text-gray-500 leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
