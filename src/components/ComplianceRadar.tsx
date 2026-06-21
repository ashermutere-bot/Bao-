import React, { useState } from 'react';
import { 
  Globe, 
  ShieldCheck, 
  AlertCircle, 
  Scale, 
  Download, 
  Printer, 
  Search, 
  Check, 
  Loader2, 
  Sparkles, 
  Info, 
  Coins, 
  TrendingDown,
  RefreshCw,
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Comprehensive list of all 54 African countries grouped by region
interface CountryItem {
  name: string;
  code: string;
  region: string;
  flag: string;
}

const AFRICAN_COUNTRIES: CountryItem[] = [
  // West Africa
  { name: "Nigeria", code: "NG", region: "West Africa", flag: "🇳🇬" },
  { name: "Ghana", code: "GH", region: "West Africa", flag: "🇬🇭" },
  { name: "Senegal", code: "SN", region: "West Africa", flag: "🇸🇳" },
  { name: "Côte d'Ivoire", code: "CI", region: "West Africa", flag: "🇨🇮" },
  { name: "Liberia", code: "LR", region: "West Africa", flag: "🇱🇷" },
  { name: "Sierra Leone", code: "SL", region: "West Africa", flag: "🇸🇱" },
  { name: "Benin", code: "BJ", region: "West Africa", flag: "🇧🇯" },
  { name: "Togo", code: "TG", region: "West Africa", flag: "🇹🇬" },
  { name: "Gambia", code: "GM", region: "West Africa", flag: "🇬🇲" },
  { name: "Guinea", code: "GN", region: "West Africa", flag: "🇬🇳" },
  { name: "Burkina Faso", code: "BF", region: "West Africa", flag: "🇧🇫" },
  { name: "Mali", code: "ML", region: "West Africa", flag: "🇲🇱" },
  { name: "Niger", code: "NE", region: "West Africa", flag: "🇳🇪" },
  { name: "Cape Verde", code: "CV", region: "West Africa", flag: "🇨🇻" },
  { name: "Guinea-Bissau", code: "GW", region: "West Africa", flag: "🇬🇼" },
  { name: "Mauritania", code: "MR", region: "West Africa", flag: "🇲🇷" },

  // East Africa
  { name: "Kenya", code: "KE", region: "East Africa", flag: "🇰🇪" },
  { name: "Tanzania", code: "TZ", region: "East Africa", flag: "🇹🇿" },
  { name: "Uganda", code: "UG", region: "East Africa", flag: "🇺🇬" },
  { name: "Rwanda", code: "RW", region: "East Africa", flag: "🇷🇼" },
  { name: "Ethiopia", code: "ET", region: "East Africa", flag: "🇪🇹" },
  { name: "Mauritius", code: "MU", region: "East Africa", flag: "🇲🇺" },
  { name: "Seychelles", code: "SC", region: "East Africa", flag: "🇸🇨" },
  { name: "Somalia", code: "SO", region: "East Africa", flag: "🇸🇴" },
  { name: "Djibouti", code: "DJ", region: "East Africa", flag: "🇩🇯" },
  { name: "Sudan", code: "SD", region: "East Africa", flag: "🇸🇩" },
  { name: "South Sudan", code: "SS", region: "East Africa", flag: "🇸🇸" },
  { name: "Eritrea", code: "ER", region: "East Africa", flag: "🇪🇷" },
  { name: "Madagascar", code: "MG", region: "East Africa", flag: "🇲🇬" },
  { name: "Comoros", code: "KM", region: "East Africa", flag: "🇰🇲" },

  // Southern Africa
  { name: "South Africa", code: "ZA", region: "Southern Africa", flag: "🇿🇦" },
  { name: "Botswana", code: "BW", region: "Southern Africa", flag: "🇧🇼" },
  { name: "Namibia", code: "NA", region: "Southern Africa", flag: "🇳🇦" },
  { name: "Zimbabwe", code: "ZW", region: "Southern Africa", flag: "🇿🇼" },
  { name: "Zambia", code: "ZM", region: "Southern Africa", flag: "🇿🇲" },
  { name: "Malawi", code: "MW", region: "Southern Africa", flag: "🇲🇼" },
  { name: "Mozambique", code: "MZ", region: "Southern Africa", flag: "🇲🇿" },
  { name: "Angola", code: "AO", region: "Southern Africa", flag: "🇦🇴" },
  { name: "Lesotho", code: "LS", region: "Southern Africa", flag: "🇱🇸" },
  { name: "Eswatini", code: "SZ", region: "Southern Africa", flag: "🇸🇿" },

  // North Africa
  { name: "Egypt", code: "EG", region: "North Africa", flag: "🇪🇬" },
  { name: "Morocco", code: "MA", region: "North Africa", flag: "🇲🇦" },
  { name: "Algeria", code: "DZ", region: "North Africa", flag: "🇩🇿" },
  { name: "Tunisia", code: "TN", region: "North Africa", flag: "🇹🇳" },
  { name: "Libya", code: "LY", region: "North Africa", flag: "🇱🇾" },

  // Central Africa
  { name: "Cameroon", code: "CM", region: "Central Africa", flag: "🇨🇲" },
  { name: "Gabon", code: "GA", region: "Central Africa", flag: "🇬🇦" },
  { name: "DR Congo", code: "CD", region: "Central Africa", flag: "🇨🇩" },
  { name: "Republic of Congo", code: "CG", region: "Central Africa", flag: "🇨🇬" },
  { name: "Chad", code: "TD", region: "Central Africa", flag: "🇹🇩" },
  { name: "Central African Republic", code: "CF", region: "Central Africa", flag: "🇨🇫" },
  { name: "Equatorial Guinea", code: "GQ", region: "Central Africa", flag: "🇬🇶" },
  { name: "Burundi", code: "BI", region: "Central Africa", flag: "🇧🇮" },
  { name: "São Tomé and Príncipe", code: "ST", region: "Central Africa", flag: "🇸🇹" }
];

interface ComplianceRadarProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function ComplianceRadar({ onShowToast }: ComplianceRadarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<CountryItem[]>(() => {
    // Default select major tech hubs
    return AFRICAN_COUNTRIES.filter(c => ['NG', 'KE', 'ZA'].includes(c.code));
  });
  
  const [generating, setGenerating] = useState(false);
  const [passportText, setPassportText] = useState<string>('');
  const [simulationMode, setSimulationMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'matrix' | 'checklist' | 'calculator'>('matrix');

  // Interactive Checklist states for resolution tracking
  const [resolvedTasks, setResolvedTasks] = useState<Record<string, boolean>>({
    'tax-reg': false,
    'privacy-po': false,
    'labor-con': false,
    'ip-release': false,
    'escrow-con': false,
  });

  const [valuationSlider, setValuationSlider] = useState<number>(3000000); // Startup base valuation
  const [customMultiplier, setCustomMultiplier] = useState<number>(5.5); // Multiplier

  // Region filtering
  const regions = ["All", "West Africa", "East Africa", "Southern Africa", "North Africa", "Central Africa"];
  const [selectedRegion, setSelectedRegion] = useState("All");

  const filteredCountries = AFRICAN_COUNTRIES.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === "All" || c.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const handleCountryToggle = (country: CountryItem) => {
    if (selectedCountries.some(c => c.code === country.code)) {
      if (selectedCountries.length <= 1) {
        onShowToast("You must select at least one country of operation.", "info");
        return;
      }
      setSelectedCountries(selectedCountries.filter(c => c.code !== country.code));
    } else {
      setSelectedCountries([...selectedCountries, country]);
    }
  };

  const handleSelectPresets = (presetType: 'hubs' | 'all' | 'none' | 'sadc' | 'ecowas' | 'eac') => {
    if (presetType === 'hubs') {
      const hubs = AFRICAN_COUNTRIES.filter(c => ['NG', 'KE', 'ZA', 'EG', 'GH', 'MU'].includes(c.code));
      setSelectedCountries(hubs);
    } else if (presetType === 'none') {
      setSelectedCountries([AFRICAN_COUNTRIES[0]]); // Keep at least one
    } else if (presetType === 'eac') {
      const eac = AFRICAN_COUNTRIES.filter(c => ['KE', 'TZ', 'UG', 'RW', 'BI', 'SS'].includes(c.code));
      setSelectedCountries(eac);
    } else if (presetType === 'ecowas') {
      const ecowas = AFRICAN_COUNTRIES.filter(c => ['NG', 'GH', 'SN', 'CI', 'LR', 'SL', 'BJ', 'TG', 'GM', 'GN', 'BF', 'ML', 'NE', 'CV', 'GW'].includes(c.code));
      setSelectedCountries(ecowas);
    } else if (presetType === 'sadc') {
      const sadc = AFRICAN_COUNTRIES.filter(c => ['ZA', 'BW', 'NA', 'ZW', 'ZM', 'MW', 'MZ', 'AO', 'LS', 'SZ', 'MU'].includes(c.code));
      setSelectedCountries(sadc);
    } else {
      setSelectedCountries([...AFRICAN_COUNTRIES]);
    }
    onShowToast(`Applied selection presets!`, "success");
  };

  const handleGeneratePassport = async () => {
    setGenerating(true);
    onShowToast("Audit desk compiling statutory schedules across jurisdictions...", "info");
    
    try {
      const response = await fetch('/api/generate-compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countries: selectedCountries.map(c => c.name) }),
      });

      if (!response.ok) {
        throw new Error(`Failed code: ${response.status}`);
      }

      const data = await response.json();
      setPassportText(data.compliancePassportText || '');
      setSimulationMode(!!data.simulationMode);
      onShowToast("M&A Jurisdictional Compliance Passport registered!", "success");
    } catch (err: any) {
      console.error(err);
      onShowToast(`Compliance Passport generation dropped: ${err.message}`, "error");
    } finally {
      setGenerating(false);
    }
  };

  // Resolution checklist score compute
  const resolvedCount = Object.values(resolvedTasks).filter(Boolean).length;
  const resolutionPercentage = Math.round((resolvedCount / 5) * 100);

  // Computed valuation loss based on selected unresolved count
  const unresolvedPercentageImpact = (5 - resolvedCount) * 8; // Each unresolved gap drops valuation by 8% (max 40% discount)
  const finalValuation = Math.round(valuationSlider * (1 - unresolvedPercentageImpact / 100));
  const lostValuationAmount = valuationSlider - finalValuation;

  const handleTaskToggle = (taskId: string) => {
    setResolvedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const handleDownloadReport = () => {
    if (!passportText) return;
    const element = document.createElement("a");
    const file = new Blob([passportText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `BAO_Compliance_Passport_Report_CrossBorder.txt`;
    document.body.appendChild(element);
    element.click();
    onShowToast("Downloaded your legal compliance passport document!", "success");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="section-container max-w-7xl mx-auto px-4 md:px-8 py-10" id="compliance-radar-page">
      
      {/* Visual Header */}
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
          <Globe className="w-3.5 h-3.5" /> Jurisdictional Risk Defuser
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
          "54 Countries" Compliance Radar
        </h1>
        <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto mt-2 leading-relaxed">
          Cross-border African acquisitions are high-friction deals. Missing local taxes, data privacy rules (POPIA, DPA, NDPR), or employee registrations can drop your startup valuation by **up to 40%**. Stop audits in their tracks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Country Selector Panel (Span 5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6 text-left">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-500" />
              1. Jurisdiction Definition
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Toggle all African jurisdictions where you currently operate or maintain legal subsidiaries, developers, or client contractors.
            </p>
          </div>

          {/* Quick Presets Buttons */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            <button 
              type="button"
              onClick={() => handleSelectPresets('hubs')}
              className="px-2.5 py-1 text-[10px] font-bold bg-slate-905 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-all"
            >
              Major Tech Hubs (6)
            </button>
            <button 
              type="button"
              onClick={() => handleSelectPresets('ecowas')}
              className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-all"
            >
              West Africa (ECOWAS)
            </button>
            <button 
              type="button"
              onClick={() => handleSelectPresets('eac')}
              className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-all"
            >
              East Africa (EAC)
            </button>
            <button 
              type="button"
              onClick={() => handleSelectPresets('sadc')}
              className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-all"
            >
              Southern Africa (SADC)
            </button>
            <button 
              type="button"
              onClick={() => handleSelectPresets('none')}
              className="px-2.5 py-1 text-[10px] font-bold bg-red-50 text-red-750 hover:bg-red-100 rounded-lg transition-all inline-flex items-center gap-1"
            >
              Reset Selected
            </button>
          </div>

          <hr className="border-slate-100" />

          {/* Real-time Country Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search across 54 sovereign countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-slate-350 outline-none rounded-xl py-2.5 pl-9 pr-4 text-xs font-medium text-slate-800 shadow-xs placeholder:text-slate-400"
              />
            </div>

            {/* Region buttons */}
            <div className="flex gap-1 overflow-x-auto pb-1.5 scrollbar-thin">
              {regions.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRegion(r)}
                  className={`px-2 py-1 text-[9px] font-bold rounded-md shrink-0 transition-all border ${
                    selectedRegion === r 
                      ? 'bg-emerald-500 text-white border-emerald-500' 
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive grid of countries with customized scrollbar */}
          <div className="border border-slate-100 rounded-2xl max-h-[340px] overflow-y-auto p-3 bg-slate-50/50 space-y-4 text-xs">
            {filteredCountries.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                <p className="font-semibold text-xs">No jurisdictions match query</p>
                <p className="text-[10px]">Adjust search variables or change regional tags.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {filteredCountries.map(country => {
                  const isSelected = selectedCountries.some(c => c.code === country.code);
                  return (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountryToggle(country)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                        isSelected 
                          ? 'bg-emerald-50 text-emerald-950 border-emerald-350 shadow-sm font-semibold' 
                          : 'bg-white text-slate-700 border-slate-200/70 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-base select-none">{country.flag}</span>
                      <div className="truncate">
                        <span className="block text-[11px] font-bold leading-normal">{country.name}</span>
                        <span className="block text-[9px] text-slate-400 uppercase tracking-tight">{country.region}</span>
                      </div>
                      {isSelected && (
                        <span className="ml-auto w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selection Stats */}
          <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl">
            <div>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase block leading-none">Selected Corridor Scope</span>
              <span className="text-xl font-black mt-1 block leading-none text-emerald-400">
                {selectedCountries.length} / 54 Jurisdictions
              </span>
            </div>
            <button
              onClick={handleGeneratePassport}
              disabled={generating}
              className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer select-none active:scale-[0.98]"
            >
              {generating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Compiling...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> Map Passport
                </>
              )}
            </button>
          </div>

          {/* Quick info warning about discount drops */}
          <div className="bg-amber-50/75 border border-amber-500/10 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed">
            <span className="font-extrabold flex items-center gap-1.5 mb-1 text-amber-950">
              <TrendingDown className="w-4 h-4 text-amber-600 shrink-0" /> Valuation Reduction Danger
            </span>
            Founders that lack standardized registration certs across Sub-Saharan subsidiary entities or remote developers have their valuations discounted by **40%** because buyers price in retroactive compliance audits and potential tax litigation penalties.
          </div>

        </div>

        {/* Right Column: Immersive Passport Presentation Block (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main passport panel */}
          <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 md:p-8 text-white relative flex flex-col justify-between shadow-xl overflow-hidden min-h-[580px]">
            <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
            
            {/* Passport Branding Header */}
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6 text-left">
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/15 text-emerald-400 text-[10px] font-black rounded border border-emerald-500/30 uppercase tracking-widest leading-none">
                  <Award className="w-3 h-3 text-emerald-400" /> Authorized M&amp;A Passport
                </span>
                <h2 className="text-2xl font-black mt-1.5 text-white">Cross-Border Compliance Passport</h2>
                <span className="text-[10px] text-slate-400 block font-mono mt-1">
                  Scope: {selectedCountries.map(c => `${c.flag} ${c.code}`).join(', ')}
                </span>
              </div>

              {passportText && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadReport}
                    className="p-2 border border-slate-800 hover:bg-slate-900 text-slate-300 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                    title="Download action schedule"
                  >
                    <Download className="w-3.5 h-3.5" /> Export Document
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="p-2 bg-slate-800 hover:bg-slate-750 text-white rounded-xl transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                    title="Print presentation view"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-405" /> Print
                  </button>
                </div>
              )}
            </div>

            {/* If loading view */}
            {generating && (
              <div className="py-32 flex flex-col items-center justify-center text-center animate-pulse relative z-10">
                <Loader2 className="w-12 h-12 text-emerald-400 mb-4 animate-spin" />
                <h4 className="font-extrabold text-sm text-slate-200 uppercase tracking-wider">Syncing M&amp;A Audit Registers</h4>
                <p className="text-slate-400 text-xs mt-1.5 max-w-sm leading-relaxed">
                  Analyzing tax authorities, state privacy limits, and statutory employment requirements across selected African regions: **{selectedCountries.map(c => c.name).join(', ')}**...
                </p>
                <div className="mt-8 flex gap-2 justify-center flex-wrap max-w-md">
                  <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[9px] text-slate-400 font-mono tracking-wide">Evaluating PAYE status</span>
                  <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[9px] text-slate-400 font-mono tracking-wide">Checking POPIA/DPA compliance</span>
                  <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[9px] text-slate-400 font-mono tracking-wide">Projecting valuation haircut</span>
                </div>
              </div>
            )}

            {/* If NOT loading, and has output text */}
            {!generating && passportText && (
              <div className="flex-1 flex flex-col justify-between relative z-10 text-left">
                
                {/* Secondary navigation under passports */}
                <div className="flex border-b border-slate-850 gap-4 mb-4">
                  <button
                    onClick={() => setActiveTab('matrix')}
                    className={`pb-2 text-xs font-black transition-all border-b-2 cursor-pointer ${
                      activeTab === 'matrix' 
                        ? 'border-emerald-500 text-emerald-400' 
                        : 'border-transparent text-slate-400 hover:text-slate-250'
                    }`}
                  >
                    Statutory Compliance Passport
                  </button>
                  <button
                    onClick={() => setActiveTab('checklist')}
                    className={`pb-2 text-xs font-black transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'checklist' 
                        ? 'border-emerald-500 text-emerald-400' 
                        : 'border-transparent text-slate-400 hover:text-slate-250'
                    }`}
                  >
                    Interactive Resolution Tracker ({resolutionPercentage}%)
                  </button>
                  <button
                    onClick={() => setActiveTab('calculator')}
                    className={`pb-2 text-xs font-black transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'calculator' 
                        ? 'border-emerald-500 text-emerald-400' 
                        : 'border-transparent text-slate-400 hover:text-slate-250'
                    }`}
                  >
                    Valuation Haircut Estimate
                  </button>
                </div>

                {/* Sub Tab Content: 1. Main Matrix Markdown view */}
                {activeTab === 'matrix' && (
                  <div className="space-y-4 flex-1">
                    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 max-h-[460px] overflow-y-auto custom-scrollbar text-xs leading-relaxed text-slate-300 font-sans prose prose-invert max-w-none">
                      <div className="markdown-body text-slate-250">
                        <ReactMarkdown>{passportText}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub Tab Content: 2. Interactive Checklist view */}
                {activeTab === 'checklist' && (
                  <div className="space-y-6 flex-1 py-1">
                    <div className="bg-slate-900/40 rounded-2xl p-5 border border-slate-850">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">Essential Action Registry</h4>
                        <span className="text-xs font-mono font-bold text-slate-400">
                          {resolvedCount} of 5 completed
                        </span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-slate-805 rounded-full overflow-hidden mb-6">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-500" 
                          style={{ width: `${resolutionPercentage}%` }}
                        />
                      </div>

                      {/* Interactive Todo list */}
                      <div className="space-y-3">
                        <div 
                          onClick={() => handleTaskToggle('tax-reg')}
                          className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                            resolvedTasks['tax-reg'] 
                              ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-350' 
                              : 'bg-slate-950 border-slate-850 text-slate-300 hover:bg-slate-900/50'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                            resolvedTasks['tax-reg'] ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700'
                          }`}>
                            {resolvedTasks['tax-reg'] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div>
                            <span className="text-xs font-extrabold block">Municipal Tax Registrations</span>
                            <span className="text-[10px] text-slate-400 mt-0.5 block leading-normal">
                              Secure valid Tax Clearance Certificates (TCC) fromSARS (ZA), KRA (KE), FIRS (NG), or corresponding local tax entities.
                            </span>
                          </div>
                        </div>

                        <div 
                          onClick={() => handleTaskToggle('privacy-po')}
                          className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                            resolvedTasks['privacy-po'] 
                              ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-350' 
                              : 'bg-slate-950 border-slate-850 text-slate-300 hover:bg-slate-900/50'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                            resolvedTasks['privacy-po'] ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700'
                          }`}>
                            {resolvedTasks['privacy-po'] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div>
                            <span className="text-xs font-extrabold block">Data Protection Office Alignment</span>
                            <span className="text-[10px] text-slate-400 mt-0.5 block leading-normal">
                              Formally register as a controller/processor with regional regulators. Create and publish legal POPIA / NDPA frameworks.
                            </span>
                          </div>
                        </div>

                        <div 
                          onClick={() => handleTaskToggle('labor-con')}
                          className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                            resolvedTasks['labor-con'] 
                              ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-350' 
                              : 'bg-slate-950 border-slate-850 text-slate-300 hover:bg-slate-900/50'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                            resolvedTasks['labor-con'] ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700'
                          }`}>
                            {resolvedTasks['labor-con'] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div>
                            <span className="text-xs font-extrabold block">Statutory social benefits filing</span>
                            <span className="text-[10px] text-slate-400 mt-0.5 block leading-normal">
                              File NSSF / SHIF (Kenya), UIF / Skills levies (South Africa), Pension schemes (Nigeria) for all localized operational employees.
                            </span>
                          </div>
                        </div>

                        <div 
                          onClick={() => handleTaskToggle('ip-release')}
                          className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                            resolvedTasks['ip-release'] 
                              ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-350' 
                              : 'bg-slate-950 border-slate-850 text-slate-300 hover:bg-slate-900/50'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                            resolvedTasks['ip-release'] ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700'
                          }`}>
                            {resolvedTasks['ip-release'] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div>
                            <span className="text-xs font-extrabold block">Sealed Intellectual Property Assignment</span>
                            <span className="text-[10px] text-slate-400 mt-0.5 block leading-normal">
                              Collect officially signed IP work-for-hire assignment release documents from all remote consultancies or technical code-writers.
                            </span>
                          </div>
                        </div>

                        <div 
                          onClick={() => handleTaskToggle('escrow-con')}
                          className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                            resolvedTasks['escrow-con'] 
                              ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-350' 
                              : 'bg-slate-950 border-slate-850 text-slate-300 hover:bg-slate-900/50'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                            resolvedTasks['escrow-con'] ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700'
                          }`}>
                            {resolvedTasks['escrow-con'] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div>
                            <span className="text-xs font-extrabold block">Cross-Border Corporate Substance Structure</span>
                            <span className="text-[10px] text-slate-400 mt-0.5 block leading-normal">
                              Align local subsidiary corporate management substance guidelines to support clean capital repatriation models up to holding vehicles.
                            </span>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

                {/* Sub Tab Content: 3. Valuation Haircut Estimate */}
                {activeTab === 'calculator' && (
                  <div className="space-y-6 flex-1 py-1 font-sans">
                    <div className="bg-slate-900/40 rounded-2xl p-6 border border-slate-850 text-slate-300 space-y-6">
                      <h4 className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                        <Scale className="w-4 h-4" /> M&amp;A Escrow Impact Simulator
                      </h4>

                      <div className="space-y-4">
                        {/* Valuation Selector */}
                        <div>
                          <div className="flex justify-between items-center mb-1 text-xs">
                            <span className="font-extrabold text-slate-300">Base Deal Target Valuation (USD):</span>
                            <span className="font-mono text-emerald-400 font-black text-sm">
                              ${valuationSlider.toLocaleString()}
                            </span>
                          </div>
                          <input 
                            type="range"
                            min="500000"
                            max="15000000"
                            step="100000"
                            value={valuationSlider}
                            onChange={(e) => setValuationSlider(Number(e.target.value))}
                            className="w-full accent-emerald-500 cursor-pointer h-1 bg-slate-800 rounded-lg appearance-none"
                          />
                        </div>

                        {/* Multiplier Selector */}
                        <div>
                          <div className="flex justify-between items-center mb-1 text-xs">
                            <span className="font-extrabold text-slate-300">Target ARR Valuation Multiplier Goal:</span>
                            <span className="font-mono text-indigo-400 font-bold">
                              {customMultiplier}x ARR
                            </span>
                          </div>
                          <input 
                            type="range"
                            min="2"
                            max="12"
                            step="0.5"
                            value={customMultiplier}
                            onChange={(e) => setCustomMultiplier(Number(e.target.value))}
                            className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-800 rounded-lg appearance-none"
                          />
                        </div>
                      </div>

                      {/* Calculations result panel */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-1">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase">Diligence Multiple Penalty</span>
                          <span className="text-lg font-black text-rose-400 block">
                            -{unresolvedPercentageImpact}% Valuation Dip
                          </span>
                          <p className="text-[9px] text-slate-500 leading-normal">
                            Based on **{5 - resolvedCount} unresolved compliance gaps** out of our key legal targets.
                          </p>
                        </div>

                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-1">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase">Potential Financial Damage</span>
                          <span className="text-lg font-black text-rose-500 block">
                            -${lostValuationAmount.toLocaleString()} USD
                          </span>
                          <p className="text-[9px] text-slate-500 leading-normal">
                            Escorw holdings or immediate drop in purchase price paid.
                          </p>
                        </div>
                      </div>

                      {/* Summary result block */}
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-350 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-mono tracking-wider block text-emerald-450 font-bold">Adjusted Multiplier after Radar Clean-up</span>
                          <span className="text-xl font-blue font-black tracking-tight mt-0.5 block">
                            {(customMultiplier * (1 - unresolvedPercentageImpact / 100)).toFixed(2)}x ARR
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-mono tracking-wider block text-emerald-450 font-bold">Defended Cash Exit Value</span>
                          <span className="text-xl font-bold text-emerald-400 block">
                            ${finalValuation.toLocaleString()} USD
                          </span>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-500 leading-normal text-center italic mt-2">
                        *Note: Securing full Compliance Passport signatures immediately defuses multiple clawbacks, preserving absolute exit value.*
                      </p>

                    </div>
                  </div>
                )}

                {/* Footer status bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-900 mt-6 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${simulationMode ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                    <span className="font-bold text-[10px] tracking-wide uppercase">
                      {simulationMode 
                        ? 'Simulated Static Passport Data' 
                        : 'Google Gemini dynamic report approved'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium">Verified under Bao Exit Protocol</span>
                  </div>
                </div>

              </div>
            )}

            {/* If NO text generated yet */}
            {!generating && !passportText && (
              <div className="my-auto py-16 flex flex-col items-center justify-center text-center animate-fade-in relative z-10">
                <Globe className="w-16 h-16 text-slate-700 mb-4 stroke-[1.2] animate-pulse" />
                <h4 className="font-black text-lg text-white">Compliance Passport Draft ready for processing</h4>
                <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-sm leading-relaxed">
                  Choose your corporate jurisdictions on the left side, then click **Map Passport** to assemble a structured action schedule mapped to specialized regulators.
                </p>
                <div className="mt-6 p-4 rounded-xl border border-slate-900 bg-slate-950 max-w-md text-[10px] text-slate-550 italic leading-relaxed">
                  Support for Nigeria, South Africa, Kenya, Mauritius, Egypt, Ghana, Ivory Coast and all 54 African Union partner nations.
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
