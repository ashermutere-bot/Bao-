import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Zap, 
  Send, 
  Search, 
  Cpu, 
  Info, 
  ChevronRight, 
  HelpCircle,
  Clock, 
  Sparkles, 
  Loader2, 
  Download, 
  Share2, 
  Target, 
  RefreshCw,
  Globe,
  DollarSign
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AcquirerIntelligenceProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
  userEmail?: string;
}

interface AlertSignal {
  id: string;
  source: string;
  logo: string;
  timestamp: string;
  type: 'sector_entry' | 'similar_deal' | 'strategic_mandate';
  text: string;
  sector: string;
  region: string;
  alertImpact: 'HIGH' | 'MEDIUM' | 'INFO';
  multiplierReported?: string;
}

const STATIC_SIGNALS: AlertSignal[] = [
  {
    id: '1',
    source: 'Stripe',
    logo: 'ST',
    timestamp: '2 hours ago',
    type: 'similar_deal',
    text: 'Stripe acquires premium payment orchestrator PaySafe in Lagos, Nigeria. This represents Stripe\'s 3rd regional payments consolidation in 18 months, indicating highly aggressive appetite for payment aggregators.',
    sector: 'Fintech',
    region: 'Nigeria',
    alertImpact: 'HIGH',
    multiplierReported: '8.4x ARR'
  },
  {
    id: '2',
    source: 'Helios Investment',
    logo: 'HI',
    timestamp: '1 day ago',
    type: 'sector_entry',
    text: 'Helios Investment partners earmark $40M for East African B2B SaaS and digital retail tech platforms. Specifically looking for teams with solid multi-country tax compliance frameworks.',
    sector: 'SaaS',
    region: 'Kenya',
    alertImpact: 'HIGH',
    multiplierReported: '6.2x ARR'
  },
  {
    id: '3',
    source: 'Moniepoint',
    logo: 'MP',
    timestamp: '3 days ago',
    type: 'similar_deal',
    text: 'Moniepoint completes buyout of regional hardware-agnostic merchant checkout developer in South Africa. Follow-up acquisition rounds in surrounding Southern African states highly probable.',
    sector: 'Fintech',
    region: 'South Africa',
    alertImpact: 'HIGH',
    multiplierReported: '7.1x ARR'
  },
  {
    id: '4',
    source: 'Visa Strategic Fund',
    logo: 'VI',
    timestamp: '4 days ago',
    type: 'strategic_mandate',
    text: 'Visa opens expressions of interest for API-driven agritech credit ledger startups. Intended to fuel digital payment card usage among primary producers in West Africa.',
    sector: 'Agritech',
    region: 'Ghana',
    alertImpact: 'MEDIUM',
    multiplierReported: 'N/A'
  },
  {
    id: '5',
    source: 'Naspers / Prosus',
    logo: 'NP',
    timestamp: '1 week ago',
    type: 'similar_deal',
    text: 'Naspers leads $15M buyout of Kenyan logistics tracking platform. Multiple sources claim they are actively checking peer targets in Nigeria and Egypt to resolve end-to-end corridor logs.',
    sector: 'Logistics',
    region: 'Kenya',
    alertImpact: 'HIGH',
    multiplierReported: '5.9x ARR'
  },
  {
    id: '6',
    source: 'Salesforce Ventures',
    logo: 'SF',
    timestamp: '1 week ago',
    type: 'sector_entry',
    text: 'Salesforce Ventures files strategic intent to back enterprise healthcare SaaS systems. Looking at Egyptian and South African startups with local data residence clearances (NDPR / POPIA compliant).',
    sector: 'Healthtech',
    region: 'Egypt',
    alertImpact: 'MEDIUM',
    multiplierReported: 'N/A'
  },
  {
    id: '7',
    source: 'TLcom Capital',
    logo: 'TL',
    timestamp: '2 weeks ago',
    type: 'strategic_mandate',
    text: 'TLcom registers new exit sourcing vehicle focused on Cleantech power grids and billing apps in Southern/Eastern Africa corridor.',
    sector: 'Cleantech',
    region: 'Pan-Africa',
    alertImpact: 'MEDIUM',
    multiplierReported: '4.8x ARR'
  }
];

export default function AcquirerIntelligence({ onShowToast, userEmail = 'founder@bao.ai' }: AcquirerIntelligenceProps) {
  // Config state
  const [selectedSector, setSelectedSector] = useState<string>('Fintech');
  const [selectedRegion, setSelectedRegion] = useState<string>('Nigeria');
  const [emailAlerts, setEmailAlerts] = useState<boolean>(true);
  const [smsAlerts, setSmsAlerts] = useState<boolean>(false);
  const [alertPhone, setAlertPhone] = useState<string>('+234 ');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Simulation State
  const [simulatedAlert, setSimulatedAlert] = useState<AlertSignal | null>(null);
  const [showSimulatedPopup, setShowSimulatedPopup] = useState<'sms' | 'email' | null>(null);
  const [signalFeed, setSignalFeed] = useState<AlertSignal[]>(STATIC_SIGNALS);
  const [searchFilter, setSearchFilter] = useState<string>('');

  // AI Strategic Deep Dive state
  const [aiReport, setAiReport] = useState<string>('');
  const [generatingDetail, setGeneratingDetail] = useState<boolean>(false);
  const [simulationMode, setSimulationMode] = useState<boolean>(false);

  const availableSectors = ['Fintech', 'SaaS', 'Healthtech', 'Logistics', 'Agritech', 'Cleantech', 'Edtech'];
  const availableRegions = ['Nigeria', 'Kenya', 'South Africa', 'Egypt', 'Ghana', 'Mauritian Hub', 'Pan-Africa'];

  const filteredSignals = signalFeed.filter(s => {
    const matchesSearch = s.text.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          s.source.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesSearch;
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    onShowToast(`Alert matrix secured! We will monitor active deal flows for ${selectedSector} in ${selectedRegion}.`, 'success');
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Simulate an instant alert delivery
  const handleTriggerSimulatedAlert = (type: 'sms' | 'email') => {
    // Generate specialized alert context based on their choices!
    let source = "Stripe";
    let textAlert = "";
    let logo = "ST";
    let multiplier = "8.2x ARR";

    if (selectedSector === 'Fintech') {
      source = "Stripe";
      logo = "ST";
      textAlert = `${source} just completed a similar Fintech acquisition in ${selectedRegion || 'Nigeria'}. The strategic target reported $850k ARR and achieved an exit valuation multiple of ${multiplier}. Our intelligence desk indicates their corporate development team is actively seeking backup pipeline targets.`;
    } else if (selectedSector === 'SaaS') {
      source = "Salesforce";
      logo = "SF";
      multiplier = "7.0x ARR";
      textAlert = `${source} Ventures entered the African corporate SaaS sector today, acquiring an enterprise platform in ${selectedRegion || 'Kenya'}. They are currently inspecting compliance levels of competitor products. Check your Diligence score immediately.`;
    } else if (selectedSector === 'Logistics') {
      source = "Naspers/Prosus";
      logo = "NP";
      multiplier = "6.4x ARR";
      textAlert = `${source} just expanded their logistics tracking pipeline with an acquisition in ${selectedRegion || 'Egypt'}. Our reports indicate high appetite for middle-mile fulfillment and supply chain API systems.`;
    } else {
      source = "Google Africa Fund";
      logo = "GA";
      multiplier = "5.5x ARR";
      textAlert = `A new sovereign corporate acquirer backing ${selectedSector} just triggered high-volume analytics tracking in ${selectedRegion}. Our deal intelligence desk reports acquisition interest in regional startups processing high volumes with formal Delaware holdco setup.`;
    }

    const customSignal: AlertSignal = {
      id: Math.random().toString(),
      source,
      logo,
      timestamp: 'Just now',
      type: 'similar_deal',
      text: textAlert,
      sector: selectedSector,
      region: selectedRegion,
      alertImpact: 'HIGH',
      multiplierReported: multiplier
    };

    // Add to the top of the signal feed
    setSignalFeed([customSignal, ...signalFeed]);

    // Store as selected simulation context
    setSimulatedAlert(customSignal);
    setShowSimulatedPopup(type);
    onShowToast(`Simulated instant ${type.toUpperCase()} alert compiled and dispatched!`, 'success');
  };

  // Dynamic Gemini Strategic Intelligence analysis call
  const handleRequestAIDeepDive = async () => {
    setGeneratingDetail(true);
    setAiReport('');
    onShowToast(`Infiltrating strategic M&A files for ${selectedSector} in ${selectedRegion}...`, 'info');

    try {
      const response = await fetch('/api/due-diligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diligencePrompt: `I am a tech startup founder in Africa. Give me a highly professional strategic M&A intelligence overview for the ${selectedSector} sector in ${selectedRegion}. 
Detail the following points:
1. Current active acquirers (like Stripe, Visa, Moniepoint, Naspers, PARTECH, etc.) and estimated entry multiples (ARR multiples).
2. Recent similar acquisitions or sovereign entries in this sector.
3. Essential triggers these acquirers inspect during due diligence (such as Delaware flips, clear IP contracts for developers, tax filings in multiple countries).
4. Concrete steps I must implement this quarter to put my company on their corporate development radar.
Format your answer in detailed, cynical, and highly actionable markdown with clear headers, tables, and bullet points. Avoid safe generic answers. Provide actual strategic advice.`,
          simulatedMetadata: {
            sector: selectedSector,
            region: selectedRegion
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed with code status: ${response.status}`);
      }

      const data = await response.json();
      setAiReport(data.reportText || data.dueDiligenceSummary || '');
      setSimulationMode(!!data.simulationMode);
      onShowToast(`AI Intelligence brief registered for ${selectedSector}!`, 'success');
    } catch (err: any) {
      console.error(err);
      onShowToast(`Unable to render dynamic strategic brief: ${err.message}`, 'error');
    } finally {
      setGeneratingDetail(false);
    }
  };

  return (
    <div className="section-container max-w-7xl mx-auto px-4 md:px-8 py-10" id="acquirer-alerts-page">
      
      {/* Top Banner Alert */}
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/15 text-indigo-400 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5 text-indigo-400" /> Executive Deal Terminal
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
          Acquirer Intelligence Alerts
        </h1>
        <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto mt-2 leading-relaxed">
          Defuse blind spots. Receive real-time alerts when new acquirers enter your sector, or when similar targets are snapped up in your regional corridor. Stay exit-ready 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
        
        {/* Left Hand: Config Panel & Immediate Trigger Sim (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-500" />
                Alert Configuration Desk
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Choose your vertical and dispatch variables to authorize automated M&A news sweeps.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              {/* Sector Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Target Sector/Vertical</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {availableSectors.map(sec => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setSelectedSector(sec)}
                      className={`px-1 py-2 text-[10px] font-bold rounded-xl border transition-all ${
                        selectedSector === sec 
                          ? 'bg-indigo-50 border-indigo-350 text-indigo-900 shadow-xs' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {sec}
                    </button>
                  ))}
                </div>
              </div>

              {/* Region Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Corridor Corridor focus</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {availableRegions.map(reg => (
                    <button
                      key={reg}
                      type="button"
                      onClick={() => setSelectedRegion(reg)}
                      className={`px-1 py-1.5 text-[10px] font-bold rounded-xl border transition-all ${
                        selectedRegion === reg 
                          ? 'bg-indigo-50 border-indigo-350 text-indigo-900 shadow-xs' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {reg}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Delivery Channels */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Alert Notification Channels</label>
                
                {/* Email Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-150">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black block text-slate-800">Email News Alerts</span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[210px]">{userEmail}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmailAlerts(!emailAlerts)}
                    className={`w-10 h-6 rounded-full p-1 transition-all ${emailAlerts ? 'bg-indigo-500' : 'bg-slate-300'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-all ${emailAlerts ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* SMS Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-150">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-black block text-slate-800">SMS Instant Spikes</span>
                      <input 
                        type="tel"
                        value={alertPhone}
                        onChange={(e) => setAlertPhone(e.target.value)}
                        placeholder="+234 803 XXX XX"
                        className="bg-transparent border-none p-0 outline-none focus:ring-0 text-[10px] text-slate-400 placeholder:text-slate-300 font-mono w-full"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSmsAlerts(!smsAlerts)}
                    className={`w-10 h-6 rounded-full p-1 transition-all ${smsAlerts ? 'bg-indigo-500' : 'bg-slate-300'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-all ${smsAlerts ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              {/* Action Submit */}
              <button
                type="submit"
                className="w-full py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4 text-emerald-450" />
                Activate Sector Alerts
              </button>
            </form>

            {isSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-500/10 text-emerald-900 text-xs font-semibold rounded-xl text-center">
                Success: Real-time scanners synced to {selectedSector} targets.
              </div>
            )}
          </div>

          {/* Interactive Trigger Simulator - Crucial for visual feedback */}
          <div className="bg-indigo-950 text-white rounded-3xl p-6 border border-indigo-900/50 space-y-4">
            <div>
              <span className="text-[9px] bg-indigo-500/25 text-indigo-300 font-bold px-2 py-0.5 rounded uppercase tracking-wider">M&amp;A Sandbox Simulator</span>
              <h4 className="text-md font-black mt-2">Test Delivery Engine</h4>
              <p className="text-[11px] text-indigo-300 leading-relaxed mt-0.5">
                Experiencing exit intelligence alerts is simple. Fire a mock trigger targeting <b>{selectedSector} in {selectedRegion}</b> to inspect notification templates.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleTriggerSimulatedAlert('sms')}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-550 active:scale-95 text-[11px] font-black rounded-xl border border-indigo-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 text-indigo-300" />
                Simulate SMS
              </button>
              <button
                type="button"
                onClick={() => handleTriggerSimulatedAlert('email')}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-850 active:scale-95 text-[11px] font-black rounded-xl border border-slate-820 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-indigo-300" />
                Simulate Email
              </button>
            </div>
          </div>
        </div>

        {/* Right Hand: Signal Feed + News Terminal (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active alerts display container */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
            
            {/* Header section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-950 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-500" />
                  Bao Intelligence Signal Feed
                </h3>
                <span className="text-slate-400 text-xs font-medium block">
                  Currently tracking 45 institutional and regional strategic acquirers
                </span>
              </div>

              {/* Live search filters */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-405" />
                <input 
                  type="text"
                  placeholder="Filter alert signals..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="bg-slate-50 text-[11px] font-medium rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 outline-none focus:border-slate-350"
                />
              </div>
            </div>

            {/* Simulated instant popup modal nested inline inside terminal for maximum tactile impact */}
            <AnimatePresence>
              {showSimulatedPopup && simulatedAlert && (
                <motion.div
                  initial={{ opacity: 0, y: -15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.95 }}
                  className="mb-6 overflow-hidden border-2 border-indigo-400 rounded-2xl shadow-xl"
                >
                  {showSimulatedPopup === 'sms' ? (
                    /* High fidelity SMS Alert simulator phone screen */
                    <div className="bg-[#1c1c1e] text-white p-4 font-sans text-xs">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-indigo-500 text-slate-950 flex items-center justify-center font-bold text-[10px] select-none">BAO</span>
                          <div>
                            <span className="block font-bold text-[11px]">Bao M&amp;A Sentry</span>
                            <span className="block text-[9px] text-zinc-500">Short Code: 44820</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => setShowSimulatedPopup(null)}
                          className="text-zinc-500 hover:text-white text-[10px] font-bold"
                        >
                          Dismiss
                        </button>
                      </div>
                      
                      {/* Inside SMS bubble */}
                      <div className="flex justify-start">
                        <div className="bg-[#262529] text-[#e3e3e7] rounded-2xl px-3.5 py-2.5 max-w-[90%] leading-relaxed">
                          <div className="font-extrabold text-[#30d158] flex items-center gap-1 mb-1">
                            <Zap className="w-3 h-3 fill-[#30d158]" /> ACQUIRER ALERT MATCHED:
                          </div>
                          {simulatedAlert.text}
                          <div className="mt-2 text-[9px] text-[#0a84ff] hover:underline font-mono cursor-pointer flex items-center gap-0.5" onClick={() => handleRequestAIDeepDive()}>
                            Generate dynamic exit recommendation matrix <ChevronRight className="w-3 h-3 inline" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-[10px] text-zinc-500 mt-2 text-center italic">
                        Sent instantly in production to the registered subscriber line.
                      </div>
                    </div>
                  ) : (
                    /* High fidelity Email simulator matching user subscription details */
                    <div className="bg-slate-50 text-slate-900 duration-200">
                      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between text-xs font-mono">
                        <span>TO: {userEmail}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] text-indigo-405 font-bold uppercase tracking-wider">Acquirer Intelligence System</span>
                          <button onClick={() => setShowSimulatedPopup(null)} className="text-slate-400 hover:text-white font-sans font-bold">X</button>
                        </div>
                      </div>
                      
                      <div className="p-5 text-xs text-left text-slate-800 space-y-4 font-sans leading-relaxed">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Subject: Strategic Market Advisory Alerts</span>
                          <h4 className="text-base font-black text-slate-950 mt-1">Acquisition Action Recorded in your Sector</h4>
                        </div>
                        
                        <p>{simulatedAlert.text}</p>
                        
                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-500/10 text-[11px] text-amber-900 leading-normal">
                          <b>Diligence Recommendation:</b> Inbound consolidations reduce timing windows. Startups wanting to maximize multiple points must consolidate IP assignments, tax structures, and run simulations within 3 months.
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => { setShowSimulatedPopup(null); handleRequestAIDeepDive(); }}
                            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-lg flex items-center gap-1"
                          >
                            <Cpu className="w-3.5 h-3.5" /> Launch Strategic AI Counsel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* List of transactions in real-time */}
            <div className="space-y-4 max-h-[440px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredSignals.map(sig => {
                const isMatchingSector = sig.sector === selectedSector;
                return (
                  <div 
                    key={sig.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isMatchingSector 
                        ? 'bg-indigo-50/50 border-indigo-200 shadow-xs' 
                        : 'bg-slate-50/40 border-slate-150'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center text-xs tracking-wider shrink-0 shadow-sm border border-slate-800">
                          {sig.logo}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm text-slate-900 leading-tight">{sig.source}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">{sig.timestamp}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] bg-slate-200 text-slate-700 font-extrabold px-1.5 py-0.5 rounded leading-none uppercase tracking-wide">{sig.sector}</span>
                            <span className="text-[9px] bg-slate-200 text-slate-700 font-extrabold px-1.5 py-0.5 rounded leading-none uppercase tracking-wide">{sig.region}</span>
                            {isMatchingSector && (
                              <span className="text-[9px] bg-pink-100 text-pink-850 font-black px-1.5 py-0.5 rounded leading-none uppercase tracking-widest inline-flex items-center gap-0.5 animate-pulse">
                                <Target className="w-2.5 h-2.5 shrink-0" /> Target Match
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {sig.multiplierReported !== 'N/A' && (
                        <div className="text-right shrink-0">
                          <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-tight">Est. Multiplier</span>
                          <span className="text-xs font-black text-indigo-650 tracking-tight font-mono">{sig.multiplierReported}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mt-2.5">
                      {sig.text}
                    </p>

                    <div className="mt-3 pt-3 border-t border-slate-200/50 flex justify-between items-center text-[10px]">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSector(sig.sector);
                          setSelectedRegion(sig.region);
                          handleRequestAIDeepDive();
                        }}
                        className="text-indigo-600 hover:text-indigo-800 hover:underline font-extrabold flex items-center gap-0.5 cursor-pointer"
                      >
                        <Cpu className="w-3 h-3 text-indigo-500" />
                        Acquisition Risk Playbook
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trigger strategic intelligence deep-dive for custom briefing */}
            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left flex-1">
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-1">
                  On-Demand AI Sector Intelligence Overview <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                  Generate an elite counsel M&amp;A briefing on current entry valuations, due diligence targets, and exit routes for **{selectedSector} in {selectedRegion}**.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRequestAIDeepDive}
                disabled={generatingDetail}
                className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                {generatingDetail ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Briefing...
                  </>
                ) : (
                  <>
                    <Cpu className="w-3.5 h-3.5" /> Consult Bao AI
                  </>
                )}
              </button>
            </div>

          </div>

          {/* AI Strategic Intelligence Deep Dive output, using ReactMarkdown */}
          <AnimatePresence>
            {aiReport && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-950 rounded-3xl border border-slate-800 p-6 md:p-8 text-white text-left relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h3 className="text-sm font-black text-white">Strategic M&amp;A Briefing: {selectedSector}</h3>
                      <span className="text-[10px] font-mono text-indigo-400">Jurisdiction: {selectedRegion}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAiReport('')}
                      className="text-slate-400 hover:text-white text-xs font-bold"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850/50 max-h-[460px] overflow-y-auto text-xs leading-relaxed text-slate-300 font-sans prose prose-invert max-w-none">
                  <div className="markdown-body text-slate-250">
                    <ReactMarkdown>{aiReport}</ReactMarkdown>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-[9px] text-slate-500 font-mono pt-4 border-t border-slate-905">
                  <span>Generated under dynamic simulated counsel protocol</span>
                  <span>{simulationMode ? 'SIMULATOR STATIC ARCHIVE' : 'ACTIVE EXITS ENGINE'}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
