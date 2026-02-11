import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  User, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Send,
  Loader2,
  PlusCircle,
  ClipboardCheck,
  Package,
  Activity,
  Stethoscope,
  Bed,
  Check
} from 'lucide-react';

/**
 * CONFIGURAÇÃO DO GOOGLE SHEETS
 * Após publicar o seu script no Google Sheets, cole a URL abaixo.
 */
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbwchx-G7pmoAZvsogOXcC2dp7if6aVYoKSHIv-Hcyqbrt4aYnF_zS5VXq6xOU2hiLAQ/exec"; 

const CATEGORIES = [
  { id: 'info', label: 'Início', icon: <User size={20} /> },
  { id: 'Insumos', label: 'Insumos', icon: <Package size={20} /> },
  { id: 'Imobilização', label: 'Imobilização', icon: <Activity size={20} /> },
  { id: 'Equipamentos', label: 'Equipamentos', icon: <Stethoscope size={20} /> },
  { id: 'Conforto', label: 'Conforto', icon: <Bed size={20} /> },
  { id: 'revisar', label: 'Finalizar', icon: <Check size={20} /> }
];

const CHECKLIST_ITEMS = [
  { id: 'esparadrapo', label: 'Esparadrapo', category: 'Insumos' },
  { id: 'micropore', label: 'Micropore', category: 'Insumos' },
  { id: 'perfurocortante', label: 'CX. Perfurocortante', category: 'Insumos' },
  { id: 'colar_cervical', label: 'Colar cervical (P/M/G)', category: 'Imobilização' },
  { id: 'talas', label: 'Talas imobilização', category: 'Imobilização' },
  { id: 'maca_rigida', label: 'Maca rígida', category: 'Imobilização' },
  { id: 'cinto_aranha', label: 'Cinto aranha', category: 'Imobilização' },
  { id: 'cadeira_rodas', label: 'Cadeira de rodas', category: 'Imobilização' },
  { id: 'cilindro_o2', label: 'Cilindro O2', category: 'Equipamentos' },
  { id: 'fluxometro', label: 'Fluxômetro', category: 'Equipamentos' },
  { id: 'cateter_nasal', label: 'Cateter nasal', category: 'Equipamentos' },
  { id: 'extensor_o2', label: 'Extensor O2', category: 'Equipamentos' },
  { id: 'ambu_adulto', label: 'AMBU adulto', category: 'Equipamentos' },
  { id: 'oximetro', label: 'Oxímetro', category: 'Equipamentos' },
  { id: 'estetoscopio', label: 'Estetoscópio', category: 'Equipamentos' },
  { id: 'esfigmo', label: 'Esfigmomanômetro', category: 'Equipamentos' },
  { id: 'tesoura', label: 'Tesoura', category: 'Equipamentos' },
  { id: 'manta_termica', label: 'Manta térmica', category: 'Conforto' },
  { id: 'lencol', label: 'Lençol', category: 'Conforto' },
  { id: 'cobertor', label: 'Cobertor', category: 'Conforto' },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    placa: '',
    responsavel: '',
    items: CHECKLIST_ITEMS.reduce((acc, item) => {
      acc[item.id] = { status: 'C', obs: '' };
      return acc;
    }, {})
  });

  const handleNext = () => {
    if (currentStep === 0 && (!formData.placa || !formData.responsavel)) {
      alert("Por favor, preencha a placa da ambulância e o nome do responsável.");
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, CATEGORIES.length - 1));
    window.scrollTo(0, 0);
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    window.scrollTo(0, 0);
  };

  const handleStatusChange = (id, status) => {
    setFormData(prev => ({
      ...prev,
      items: { ...prev.items, [id]: { ...prev.items[id], status } }
    }));
  };

  const handleObsChange = (id, obs) => {
    setFormData(prev => ({
      ...prev,
      items: { ...prev.items, [id]: { ...prev.items[id], obs } }
    }));
  };

  const handleSubmit = async () => {
    if (!GOOGLE_SHEET_URL) {
      alert("ERRO: A URL do Google Sheets não foi configurada no código.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      timestamp: new Date().toLocaleString('pt-BR'),
      placa: formData.placa,
      responsavel: formData.responsavel,
      items: Object.entries(formData.items).map(([id, val]) => ({
        nome: CHECKLIST_ITEMS.find(i => i.id === id).label,
        categoria: CHECKLIST_ITEMS.find(i => i.id === id).category,
        status: val.status,
        obs: val.obs
      }))
    };

    try {
      // Usamos mode: 'no-cors' para evitar problemas com o redireccionamento do Google Apps Script
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Falha ao comunicar com o Google Sheets. Verifique a URL do script.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      placa: '',
      responsavel: '',
      items: CHECKLIST_ITEMS.reduce((acc, item) => {
        acc[item.id] = { status: 'C', obs: '' };
        return acc;
      }, {})
    });
    setCurrentStep(0);
    setSubmitted(false);
    setError(null);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <CheckCircle2 size={56} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Registo Concluído!</h1>
        <p className="text-slate-500 mb-8 max-w-xs">Os dados foram enviados para a sua Planilha do Google com sucesso.</p>
        <button 
          onClick={resetForm}
          className="w-full max-w-xs bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95"
        >
          NOVA VERIFICAÇÃO
        </button>
      </div>
    );
  }

  const currentCategory = CATEGORIES[currentStep].id;
  const filteredItems = CHECKLIST_ITEMS.filter(i => i.category === currentCategory);

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans selection:bg-red-100">
      {/* Header Profissional */}
      <header className="sticky top-0 z-50 bg-red-600 text-white p-4 shadow-xl flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1.5 rounded-lg shadow-md">
            <Truck className="text-red-600" size={20} />
          </div>
          <div>
            <h1 className="font-black text-lg uppercase italic leading-none">SAMU</h1>
            <span className="text-[10px] font-bold opacity-80 uppercase tracking-tighter">Checklist de Viatura</span>
          </div>
        </div>
        <div className="bg-red-800/50 px-3 py-1.5 rounded-xl border border-white/20">
          <span className="text-xs font-black uppercase tracking-widest">{currentStep + 1} / {CATEGORIES.length}</span>
        </div>
      </header>

      {/* Navegação por Passos (Stepper) */}
      <nav className="bg-white border-b flex overflow-x-auto no-scrollbar shadow-sm sticky top-[68px] z-40">
        {CATEGORIES.map((cat, idx) => (
          <button 
            key={cat.id}
            onClick={() => { if (formData.placa || idx === 0) setCurrentStep(idx) }}
            className={`flex-1 min-w-[70px] py-3 flex flex-col items-center gap-1 border-b-4 transition-all ${
              idx === currentStep ? 'border-red-600 text-red-600 bg-red-50/30' : 'border-transparent text-slate-300'
            }`}
          >
            {cat.icon}
            <span className="text-[8px] font-bold uppercase tracking-tight">{cat.label}</span>
          </button>
        ))}
      </nav>

      <main className="max-w-md mx-auto p-4 pt-6">
        {/* PASSO 1: Identificação */}
        {currentCategory === 'info' && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Identificação</h2>
              <p className="text-xs text-slate-400 font-bold uppercase">Dados obrigatórios do plantão</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ambulância / Placa</label>
                <input 
                  type="text"
                  placeholder="EX: ABC-1234"
                  className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-red-500 focus:bg-white outline-none transition-all font-black text-lg"
                  value={formData.placa}
                  onChange={e => setFormData({...formData, placa: e.target.value.toUpperCase()})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Responsável pela Verificação</label>
                <input 
                  type="text"
                  placeholder="Digite o seu nome"
                  className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-red-500 focus:bg-white outline-none transition-all font-medium"
                  value={formData.responsavel}
                  onChange={e => setFormData({...formData, responsavel: e.target.value})}
                />
              </div>
            </div>
          </div>
        )}

        {/* PASSOS DINÂMICOS: Itens do Checklist */}
        {filteredItems.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <h2 className="text-xl font-black text-slate-800 ml-1 uppercase flex items-center gap-2">
              <div className="w-2 h-6 bg-red-600 rounded-full" /> {currentCategory}
            </h2>
            {filteredItems.map(item => (
              <div key={item.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-slate-800 leading-tight pr-4">{item.label}</span>
                  <div className="flex bg-slate-100 p-1 rounded-2xl shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(item.id, 'C')}
                      className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${
                        formData.items[item.id].status === 'C' 
                        ? 'bg-green-500 text-white shadow-lg' 
                        : 'text-slate-400'
                      }`}
                    >
                      C
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(item.id, 'NC')}
                      className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${
                        formData.items[item.id].status === 'NC' 
                        ? 'bg-red-500 text-white shadow-lg' 
                        : 'text-slate-400'
                      }`}
                    >
                      NC
                    </button>
                  </div>
                </div>
                <input 
                  type="text"
                  placeholder="Observação (se houver)..."
                  className={`w-full p-3 text-sm rounded-xl bg-slate-50 border-2 border-transparent focus:border-blue-300 outline-none transition-all ${
                    formData.items[item.id].status === 'NC' ? 'border-red-100 bg-red-50/50' : ''
                  }`}
                  value={formData.items[item.id].obs}
                  onChange={e => handleObsChange(item.id, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}

        {/* PASSO FINAL: Revisão */}
        {currentCategory === 'revisar' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tight">Revisão Final</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
                  <span className="text-slate-500 text-[10px] font-black uppercase">Viatura</span>
                  <span className="font-black text-red-600">{formData.placa}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
                  <span className="text-slate-500 text-[10px] font-black uppercase">Responsável</span>
                  <span className="font-bold text-slate-700">{formData.responsavel}</span>
                </div>
                
                <div className="pt-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Itens Não Conformes (NC):</h3>
                  {Object.entries(formData.items).filter(([_, v]) => v.status === 'NC').length === 0 ? (
                    <div className="bg-green-50 p-5 rounded-2xl text-green-700 text-sm font-bold flex items-center gap-3 border border-green-100">
                      <CheckCircle2 size={24} /> 
                      <span>Excelente! Todos os itens estão em conformidade.</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(formData.items).filter(([_, v]) => v.status === 'NC').map(([id, v]) => (
                        <div key={id} className="bg-red-50 p-3 rounded-2xl border border-red-100 flex justify-between items-center">
                          <span className="text-xs font-black text-red-700">{CHECKLIST_ITEMS.find(i => i.id === id).label}</span>
                          {v.obs && <span className="text-[10px] text-red-400 italic">"{v.obs}"</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-600 text-white p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertCircle size={18} /> {error}
              </div>
            )}
            
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-3xl shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest text-lg"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Send size={24} />}
              {loading ? 'A GRAVAR...' : 'GRAVAR NA PLANILHA'}
            </button>
          </div>
        )}
      </main>

      {/* Navegação Inferior (Botões Próximo/Anterior) */}
      {!submitted && (
        <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          <div className="max-w-md mx-auto flex gap-4">
            {currentStep > 0 && (
              <button 
                onClick={handlePrev}
                className="flex-1 bg-white border-2 border-slate-200 text-slate-500 font-black py-4 rounded-2xl flex items-center justify-center gap-2 active:bg-slate-50"
              >
                <ChevronLeft size={20} /> VOLTAR
              </button>
            )}
            {currentStep < CATEGORIES.length - 1 && (
              <button 
                onClick={handleNext}
                className="flex-[2] bg-red-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-red-200 active:scale-95 transition-transform"
              >
                PRÓXIMO <ChevronRight size={20} />
              </button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}
