import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  ChevronRight, 
  Layers, 
  ShieldAlert, 
  Briefcase, 
  Coins, 
  Award, 
  Compass, 
  Zap, 
  Sparkles, 
  ArrowRightLeft, 
  FolderLock, 
  Activity, 
  Fingerprint, 
  Scale, 
  FileText, 
  CheckCircle, 
  HelpCircle, 
  Search, 
  TrendingUp, 
  Check, 
  DollarSign, 
  AlertTriangle, 
  Percent, 
  CornerDownRight, 
  Download, 
  UploadCloud, 
  RotateCcw,  
  Loader2, 
  Terminal, 
  HeartHandshake
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface MAWarRoomProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
  userScore?: number;
}

// --------------------------------------------------
// DATA MODELS & CONSTANTS
// --------------------------------------------------

interface LicenseInfo {
  code: string;
  name: string;
  authority: string;
  costEstimate: string;
  premiumWeight: string; // Valuation multiplier premium
  difficulty: 'High' | 'Medium' | 'Low';
  description: string;
}

interface CountryLicenses {
  country: string;
  code: string;
  flag: string;
  premiumMultiplier: number;
  licenses: LicenseInfo[];
}

const LICENSE_DATA: CountryLicenses[] = [
  {
    country: 'Nigeria',
    code: 'NG',
    flag: '🇳🇬',
    premiumMultiplier: 1.35,
    licenses: [
      { code: 'CBN-PSSP', name: 'Payment Service Solution Provider (PSSP)', authority: 'Central Bank of Nigeria', costEstimate: '$150,000', premiumWeight: '+1.5x ARR', difficulty: 'High', description: 'Enables development of payment gateways, merchant collection platforms, and core transaction routing.' },
      { code: 'CBN-IMTO', name: 'International Money Transfer Operator', authority: 'Central Bank of Nigeria', costEstimate: '$250,000', premiumWeight: '+2.0x ARR', difficulty: 'High', description: 'Required for inbound cross-border remittance processing. Highly coveted by global networks.' },
      { code: 'CBN-M遊O', name: 'Mobile Money Operator (MMO)', authority: 'Central Bank of Nigeria', costEstimate: '$4,000,000', premiumWeight: '+3.5x ARR', difficulty: 'High', description: 'Permits holding deposits and issuing digital wallets. The ultimate fintech crown jewel.' },
      { code: 'SEC-DL', name: 'Digital Sub-Broker / Crowdfunding License', authority: 'Securities & Exchange Commission', costEstimate: '$80,000', premiumWeight: '+1.0x ARR', difficulty: 'Medium', description: 'Permits offering fractional global or local equities to retail users.' }
    ]
  },
  {
    country: 'Kenya',
    code: 'KE',
    flag: '🇰🇪',
    premiumMultiplier: 1.28,
    licenses: [
      { code: 'CBK-DCP', name: 'Digital Credit Provider (DCP)', authority: 'Central Bank of Kenya', costEstimate: '$90,000', premiumWeight: '+1.2x ARR', difficulty: 'High', description: 'Mandatory license for all mobile-based fintech lenders operating inside Kenyan borders.' },
      { code: 'CBK-NPS', name: 'National Payment System (NPS) License', authority: 'Central Bank of Kenya', costEstimate: '$120,000', premiumWeight: '+1.8x ARR', difficulty: 'High', description: 'Enables third-party payment aggregation, virtual accounts, and checkout APIs.' }
    ]
  },
  {
    country: 'South Africa',
    code: 'ZA',
    flag: '🇿🇦',
    premiumMultiplier: 1.30,
    licenses: [
      { code: 'FSCA-FSP', name: 'Financial Services Provider (Category I/II)', authority: 'Financial Sector Conduct Authority', costEstimate: '$50,050', premiumWeight: '+0.8x ARR', difficulty: 'Medium', description: 'Required for retail brokerage, wealth tech, robo-advisories, and commercial escrow systems.' },
      { code: 'SARB-AD', name: 'Authorized Dealer in Foreign Exchange', authority: 'South African Reserve Bank', costEstimate: '$300,000', premiumWeight: '+2.2x ARR', difficulty: 'High', description: 'Enables direct FX conversion slots and high-volume local treasury repatriation.' }
    ]
  },
  {
    country: 'Egypt',
    code: 'EG',
    flag: '🇪🇬',
    premiumMultiplier: 1.25,
    licenses: [
      { code: 'FRA-CON', name: 'Consumer Finance License', authority: 'Financial Regulatory Authority', costEstimate: '$110,000', premiumWeight: '+1.1x ARR', difficulty: 'Medium', description: 'Allows offering structured Buy-Now-Pay-Later (BNPL) services to retail buyers.' },
      { code: 'CBE-PSP', name: 'Payment Service Provider Accreditation', authority: 'Central Bank of Egypt', costEstimate: '$140,000', premiumWeight: '+1.4x ARR', difficulty: 'High', description: 'Mandatory structure for clearing local card networks and digital wallets.' }
    ]
  },
  {
    country: 'Ghana',
    code: 'GH',
    flag: '🇬🇭',
    premiumMultiplier: 1.20,
    licenses: [
      { code: 'BOG-PSP', name: 'Payment Service Provider (Medium Tier)', authority: 'Bank of Ghana', costEstimate: '$75,000', premiumWeight: '+0.9x ARR', difficulty: 'Medium', description: 'Enables mobile money payroll payouts, USSD integrations, and retail wallets.' }
    ]
  },
  {
    country: 'Uganda',
    code: 'UG',
    flag: '🇺🇬',
    premiumMultiplier: 1.15,
    licenses: [
      { code: 'BOU-PSP', name: 'Payment Service Provider License', authority: 'Bank of Uganda', costEstimate: '$60,000', premiumWeight: '+0.7x ARR', difficulty: 'Medium', description: 'Enables digital wallets and merchant aggregations.' }
    ]
  }
];

interface BuyBox {
  acquirer: string;
  logoLetter: string;
  targetVert: string;
  minARR: string;
  maxARR: string;
  regions: string[];
  paybackMonths: number;
  thesis: string;
  activeStatus: 'Aggressive' | 'Selective' | 'Sourcing';
}

const ACQUIRER_WAR_ROOM_DATA: BuyBox[] = [
  {
    acquirer: 'Moniepoint',
    logoLetter: 'MP',
    targetVert: 'Offline Retail Payment systems, local checkout software, micro-SaaS providers',
    minARR: '$1,005,000',
    maxARR: '$5,000,000',
    regions: ['Nigeria', 'Kenya', 'Ghana'],
    paybackMonths: 18,
    thesis: 'Expanding offline-to-online payments, regional wallet infrastructure, and SMB SaaS software integrations to support merchant density expansion.',
    activeStatus: 'Aggressive'
  },
  {
    acquirer: 'Flutterwave',
    logoLetter: 'FW',
    targetVert: 'Remittance corridors, localized core billing bridges, secondary payouts',
    minARR: '$2,000,000',
    maxARR: '$10,000,000',
    regions: ['Egypt', 'Kenya', 'South Africa', 'Pan-Africa'],
    paybackMonths: 24,
    thesis: 'Seeking infrastructure nodes to complete their cross-border enterprise rails, specifically targeting cleared local regulatory licenses.',
    activeStatus: 'Selective'
  },
  {
    acquirer: 'Stitch',
    logoLetter: 'ST',
    targetVert: 'API payment infrastructure, high-friction orchestrators, ledger engines',
    minARR: '$500,000',
    maxARR: '$3,000,000',
    regions: ['South Africa', 'Nigeria', 'Ghana'],
    paybackMonths: 15,
    thesis: 'M&A integration target vertical focused on payment orchestration and developer-friendly core interfaces in secondary regional hubs.',
    activeStatus: 'Aggressive'
  },
  {
    acquirer: 'MNT-Halan',
    logoLetter: 'MT',
    targetVert: 'Consumer microfinance ledger software, Buy Now Pay Later networks, digital retail credit tech',
    minARR: '$3,000,000',
    maxARR: '$15,000,000',
    regions: ['Egypt', 'East Africa corridor'],
    paybackMonths: 20,
    thesis: 'Expanding micro-credit distribution loops throughout underserved regional zones via strategic technology acquisitions.',
    activeStatus: 'Sourcing'
  },
  {
    acquirer: 'TymeBank',
    logoLetter: 'TB',
    targetVert: 'Digital banking ledger cores, biometric KYC tools, automated loan verification tools',
    minARR: '$2,500,000',
    maxARR: '$8,000,000',
    regions: ['South Africa', 'Pan-Africa'],
    paybackMonths: 22,
    thesis: 'Seeking modular digital banking microservices that can easily bolt on to their existing high-volume neo-banking foundation.',
    activeStatus: 'Selective'
  },
  {
    acquirer: 'Avenir Growth',
    logoLetter: 'AV',
    targetVert: 'Enterprise retail optimization SaaS, inventory control networks, core logistics software',
    minARR: '$4,000,000',
    maxARR: '$20,000,000',
    regions: ['Nigeria', 'Kenya', 'South Africa'],
    paybackMonths: 24,
    thesis: 'Looking for fast-growing SaaS giants solving critical supply chain bottlenecks with >120% NDR metrics.',
    activeStatus: 'Sourcing'
  }
];

export default function MAWarRoom({ onShowToast, userScore = 72 }: MAWarRoomProps) {
  // Current Active Sub-Module
  const [activeSubTab, setActiveSubTab] = useState<'license' | 'buy_box' | ' autopilot' | 'fx_hedge' | 'secondary' | 'score' | 'co_pilot' | 'post_merger'>('license');

  // 1. License Graph States
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('NG');
  const [baseValuation, setBaseValuation] = useState<number>(3000000); // Input base valuation to calculate license premium

  // 2. Acquirer War Room Calculator States
  const [avgDealSizeInput, setAvgDealSizeInput] = useState<number>(2000000); // 2 million avg deal
  const [hasOptedIn, setHasOptedIn] = useState<boolean>(false);

  // 3. Autopilot States
  const [autopilotSteps, setAutopilotSteps] = useState([
    { id: 'bank', name: 'Auto-pull Bank Ledger feeds (Mono/Okra Integrator)', status: 'Pending', description: 'Extract clean historic financial activity reports without manual logs.' },
    { id: 'ifrs', name: 'Compile IFRS structured financials (Exit Ready Format)', status: 'Pending', description: 'Automatically convert local accounts into clean international M&A books.' },
    { id: 'ip_assign', name: 'Perform intellectual property assignments review & logs', status: 'Pending', description: 'Scan developer agreements to guarantee the IP sits 100% in the Holdco.' },
    { id: 'safes', name: 'Render dynamic SAFE cap-table distribution model', status: 'Pending', description: 'Convert SAFEs and local notes into share options structure.' },
    { id: 'vdr_spin', name: 'Host full Virtual Data Room (VDR) on Amazon S3 secure cluster', status: 'Pending', description: 'Generate robust client-facing folder trees compliant with buy-side requests.' }
  ]);
  const [spinningUp, setSpinningUp] = useState<boolean>(false);
  const [vdrUrl, setVdrUrl] = useState<string>('');

  // 4. FX Hedge States
  const [baseLOIValue, setBaseLOIValue] = useState<number>(10000000); // $10M base LOI
  const [nairaDevalYearly, setNairaDevalYearly] = useState<number>(30); // 30% Naira depreciation simulation
  const [lockedRates, setLockedRates] = useState<boolean>(false);

  // 5. Secondary Liquidity States
  const [primaryFounderSharesPct, setPrimaryFounderSharesPct] = useState<number>(15); // Founder secondary target percentage
  const [acceptedHeliosOffer, setAcceptedHeliosOffer] = useState<boolean>(false);

  // 6. Score S&P Breakdown States
  const [revQuality, setRevQuality] = useState<number>(75);
  const [regMoat, setRegMoat] = useState<number>(80);
  const [govQuality, setGovQuality] = useState<number>(65);
  const [teamRetention, setTeamRetention] = useState<number>(70);

  // 7. M&A AI Negotiator States
  const [loiInput, setLoiInput] = useState<string>(`LETTER OF INTENT (LOI)

This Letter of Intent ("LOI") outlines the preliminary agreement for the acquisition of BAO technology assets by Apex Corp ("Buyer").

1. TRANSACTION STRUCTURE AND VALUATION
1.1 Total Transaction Consideration shall be set at $5,500,000 USD (the "Purchase Price").
1.2 The Purchase Price is structured as follows:
   (a) $4,675,000 USD in cash at immediate close.
   (b) $825,000 USD of Earn-out consideration (the "Earn-out Cap" representing 15% of the deal) payable over a 36-month period, subject to achieving severe net-new ARR metrics.

2. GOVERNING LAW AND ARBITRATION
2.1 All conflicts resulting from this transaction shall be resolved exclusively in local provincial courts under the local jurisdictions of local state law, to ensure localized proceedings.

3. REWARD AND FOUNDER MAINTENANCE
3.1 Founders agree to a mandatory post-close key-person employment vesting schedule.
3.2 100% of founder equity-retention options shall reverse-vest over 36 months. Founders are strictly prohibited from receiving secondary cash-outs, secondary distributions, or partial liquidity events prior to November 2029.`);
  const [parsingLOI, setParsingLOI] = useState<boolean>(false);
  const [redlineReport, setRedlineReport] = useState<string>('');

  // 8. Post-Merger OS States
  const [postMergerActiveSector, setPostMergerActiveSector] = useState<'Fintech' | 'SaaS' | 'Logistic'>('Fintech');

  // Interactive functions

  // 1. Calculate License Premium Valuation Lift
  const currentCountryLicenses = LICENSE_DATA.find(c => c.code === selectedCountryCode);
  const calcMultiplierLift = () => {
    if (!currentCountryLicenses) return baseValuation;
    return Math.round(baseValuation * currentCountryLicenses.premiumMultiplier);
  };

  // 2. Opt-in Reverse Diligence
  const handleOptInWarRoom = () => {
    setHasOptedIn(true);
    onShowToast('Matched! Your Exit Readiness records have been dispatched privately to Moniepoint and Flutterwave buy desks.', 'success');
  };

  // 3. Spin VDR Autopilot and dispatch Legal OS flat rate
  const handleTriggerAutopilot = () => {
    setSpinningUp(true);
    onShowToast('Autopilot initializing databases: Hooking into Bowmans API for legal health clearance...', 'info');
    
    setTimeout(() => {
      setAutopilotSteps(prev => prev.map(s => ({ ...s, status: 'Active' })));
      setTimeout(() => {
        setAutopilotSteps(prev => prev.map(s => ({ ...s, status: 'Completed' })));
        setSpinningUp(false);
        setVdrUrl('https://vdr.bao.africa/secure-diligence-vault-403c09d2');
        onShowToast('VDR Audit Secured! $500 Bowman Flat-fee legal health check successfully registered.', 'success');
      }, 2500);
    }, 1500);
  };

  // 4. Calculate FX hedge scenario
  const calcHedgeScenarios = () => {
    // 3 scenarios: USD Mauritius Holdco, 30% Earnout in NGN with Naira devaluation, and Stock swap in acquirer
    const isUSDRealizedVal = baseLOIValue; // Unaffected
    
    // Earnout in local currency affected by deval
    const earnoutPart = baseLOIValue * 0.3;
    const cashPart = baseLOIValue * 0.7;
    const devalLoss = earnoutPart * (nairaDevalYearly / 100);
    const ngnScenarioVal = baseLOIValue - devalLoss;

    // Stock Swap in acquirer (typical 10% discount on non-liquid structures)
    const stockScenarioVal = baseLOIValue * 0.92;

    return { USD: isUSDRealizedVal, NGN: ngnScenarioVal, Stock: stockScenarioVal, devalLoss };
  };

  // 7. Run AI M&A redliner
  const runAIRedlines = async () => {
    setParsingLOI(true);
    setRedlineReport('');
    onShowToast('M&A Co-pilot is reading term sheet and comparing to African market medians...', 'info');

    try {
      const res = await fetch('/api/mna-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loiText: loiInput })
      });

      if (!res.ok) {
        throw new Error(`Server returned code: ${res.status}`);
      }
      const data = await res.json();
      setRedlineReport(data.redlines);
      onShowToast('Term sheet audited successfully! Premium redline document added below.', 'success');
    } catch (err: any) {
      console.error(err);
      onShowToast(`Negotiator failure: ${err.message}`, 'error');
    } finally {
      setParsingLOI(false);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pt-4 pb-16 px-4 md:px-8 font-sans selection:bg-emerald-500/20 selection:text-emerald-400" id="ma-war-room-dashboard">
      
      {/* Top Glass Header */}
      <div className="max-w-7xl mx-auto mb-8 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="text-left space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 text-emerald-400 text-[10px] font-black rounded-lg border border-emerald-500/30 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Executive M&amp;A Hub
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight">
            M&amp;A Executive War Room
          </h1>
          <p className="text-slate-400 text-xs md:text-sm max-w-2xl leading-relaxed">
            Protect your valuation. Review license premiums, benchmark your BAO Score relative to S&amp;P criteria, lock exchange rates at LOI signing, pre-negotiate secondary liquidity, and redline term sheets with elite AI-assisted council.
          </p>
        </div>
        
        {/* Core Live Counters */}
        <div className="flex gap-4 p-4 bg-slate-950/80 rounded-2xl border border-slate-800 shrink-0">
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Your Score</span>
            <span className="text-xl font-bold font-mono text-emerald-405 block">{userScore}/100</span>
          </div>
          <div className="w-[1px] bg-slate-800" />
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Matches</span>
            <span className="text-xl font-bold font-mono text-white block">3 Acquirers</span>
          </div>
          <div className="w-[1px] bg-slate-800" />
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Hedge Pool</span>
            <span className="text-xl font-bold font-mono text-indigo-400 block">$50M/Daily</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Toolbar / Right Details */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Hand: Column Navigation Tabs for the 8 Features (Span 3) */}
        <div className="lg:col-span-3 space-y-2">
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest block text-left mb-2 pl-2">M&amp;A Sourcing Suite</span>
          
          <button
            type="button"
            onClick={() => setActiveSubTab('license')}
            className={`w-full p-3.5 rounded-2xl border transition-all flex items-center gap-3 text-left ${
              activeSubTab === 'license' 
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-lg shadow-emerald-500/10' 
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
            }`}
          >
            <Compass className="w-4 h-4 shrink-0" />
            <div className="truncate">
              <span className="text-xs block">1. License Graph</span>
              <span className={`text-[9px] block ${activeSubTab === 'license' ? 'text-slate-800' : 'text-slate-500'}`}>CBN, CBK DCP valuation premiums</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('buy_box')}
            className={`w-full p-3.5 rounded-2xl border transition-all flex items-center gap-3 text-left ${
              activeSubTab === 'buy_box' 
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-lg shadow-emerald-500/10' 
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <div className="truncate">
              <span className="text-xs block">2. Acquirer War Room</span>
              <span className={`text-[9px] block ${activeSubTab === 'buy_box' ? 'text-slate-800' : 'text-slate-500'}`}>Reverse buy-boxes &amp; deal flow</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab(' autopilot')}
            className={`w-full p-3.5 rounded-2xl border transition-all flex items-center gap-3 text-left ${
              activeSubTab === ' autopilot' 
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-lg shadow-emerald-500/10' 
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <div className="truncate">
              <span className="text-xs block">3. Data Room Autopilot</span>
              <span className={`text-[9px] block ${activeSubTab === ' autopilot' ? 'text-slate-800' : 'text-slate-500'}`}>Auto VDR &amp; Bowmans flat-fee</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('fx_hedge')}
            className={`w-full p-3.5 rounded-2xl border transition-all flex items-center gap-3 text-left ${
              activeSubTab === 'fx_hedge' 
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-lg shadow-emerald-500/10' 
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 shrink-0" />
            <div className="truncate">
              <span className="text-xs block">4. FX Hedge / Repatriation</span>
              <span className={`text-[9px] block ${activeSubTab === 'fx_hedge' ? 'text-slate-800' : 'text-slate-500'}`}>USD Mauritius vs earnout risks</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('secondary')}
            className={`w-full p-3.5 rounded-2xl border transition-all flex items-center gap-3 text-left ${
              activeSubTab === 'secondary' 
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-lg shadow-emerald-500/10' 
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
            }`}
          >
            <Coins className="w-4 h-4 shrink-0" />
            <div className="truncate">
              <span className="text-xs block">5. Secondary Liquidity</span>
              <span className={`text-[9px] block ${activeSubTab === 'secondary' ? 'text-slate-800' : 'text-slate-500'}`}>10-20% pre-close liquidity programs</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('score')}
            className={`w-full p-3.5 rounded-2xl border transition-all flex items-center gap-3 text-left ${
              activeSubTab === 'score' 
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-lg shadow-emerald-500/10' 
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            <div className="truncate">
              <span className="text-xs block">6. S&amp;P BAO Venture Score</span>
              <span className={`text-[9px] block ${activeSubTab === 'score' ? 'text-slate-800' : 'text-slate-500'}`}>Governance, retentions &amp; moats</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('co_pilot')}
            className={`w-full p-3.5 rounded-2xl border transition-all flex items-center gap-3 text-left ${
              activeSubTab === 'co_pilot' 
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-lg shadow-emerald-500/10' 
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <div className="truncate">
              <span className="text-xs block">7. M&amp;A AI Negotiator</span>
              <span className={`text-[9px] block ${activeSubTab === 'co_pilot' ? 'text-slate-800' : 'text-slate-500'}`}>LOI Redlining &amp; VC Benchmarks</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('post_merger')}
            className={`w-full p-3.5 rounded-2xl border transition-all flex items-center gap-3 text-left ${
              activeSubTab === 'post_merger' 
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-lg shadow-emerald-500/10' 
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
            }`}
          >
            <Terminal className="w-4 h-4 shrink-0" />
            <div className="truncate">
              <span className="text-xs block">8. Post-Merger OS</span>
              <span className={`text-[9px] block ${activeSubTab === 'post_merger' ? 'text-slate-800' : 'text-slate-500'}`}>McKinsey integration blueprints</span>
            </div>
          </button>
        </div>

        {/* Right Hand: Sub-Modules Visualizer Panels (Span 9) */}
        <div className="lg:col-span-9 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 min-h-[580px] text-left relative overflow-hidden shadow-2xl">
          
          <AnimatePresence mode="wait">
            {/* 1. BAO LICENSE GRAPH */}
            {activeSubTab === 'license' && (
              <motion.div
                key="license-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] font-bold text-emerald-400 font-mono tracking-widest uppercase block">Bloomberg Terminal for African Regulators</span>
                  <h2 className="text-xl md:text-2xl font-black text-white mt-1">BAO Regulatory License Graph</h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Licenses generate immense transactional valuations. Moniepoint paid $20M+ for Sumac Bank purely to annex regulatory permissions instantly. Filter CBN, CBK, and FSCA targets below to identify your true "License Premium".
                  </p>
                </div>

                {/* Country Map Switcher */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {LICENSE_DATA.map(c => (
                    <button
                      key={c.code}
                      onClick={() => setSelectedCountryCode(c.code)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        selectedCountryCode === c.code 
                          ? 'bg-indigo-600 border-indigo-500 text-white font-black' 
                          : 'bg-slate-950 border-slate-800 hover:bg-slate-850 text-slate-300'
                      }`}
                    >
                      <span>{c.flag}</span>
                      <span>{c.country}</span>
                    </button>
                  ))}
                </div>

                {/* License Graph Cards */}
                {currentCountryLicenses && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-indigo-950/40 border border-indigo-900/40 rounded-2xl">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-indigo-400">Jurisdiction Level premium</span>
                        <h4 className="text-md font-black text-white">{currentCountryLicenses.country} Corridor Valuation Multiple Lift</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-mono">Premium Weight</span>
                        <span className="text-lg font-black text-emerald-400 font-mono">+{Math.round((currentCountryLicenses.premiumMultiplier - 1) * 100)}% Lift </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentCountryLicenses.licenses.map(l => (
                        <div key={l.code} className="p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all rounded-2xl space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="text-[10px] bg-slate-800 text-slate-200 font-mono px-2 py-0.5 rounded uppercase">{l.code}</span>
                              <h3 className="font-extrabold text-xs text-white mt-1 leading-tight">{l.name}</h3>
                              <span className="text-[10px] text-slate-400 font-medium block">{l.authority}</span>
                            </div>
                            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-black px-2 py-0.5 rounded">
                              {l.premiumWeight}
                            </span>
                          </div>
                          
                          <p className="text-[11px] text-slate-400 leading-relaxed font-sans mt-2">
                            {l.description}
                          </p>

                          <div className="flex justify-between items-center text-[10px] pt-2 border-t border-slate-900 font-mono text-slate-400">
                            <span>Sourcing Capital: {l.costEstimate}</span>
                            <span className={l.difficulty === 'High' ? 'text-rose-400' : 'text-amber-400'}>Complexity: {l.difficulty}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* License Valuation Premium Calculator */}
                    <div className="p-6 bg-slate-950 border border-slate-850 rounded-2xl space-y-4">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Dynamic License Leverage Valuation Estimator</h4>
                      
                      <div className="space-y-1 text-left">
                        <label className="text-[11px] text-slate-450 block font-medium">Core Asset Enterprise Value (Excluding Licenses)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-slate-500 font-mono text-xs">$</span>
                          <input 
                            type="number"
                            value={baseValuation}
                            onChange={(e) => setBaseValuation(Math.max(1, parseInt(e.target.value) || 0))}
                            className="bg-slate-900 border border-slate-800 rounded-xl px-7 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 w-full font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Unlicensed EV</span>
                          <span className="text-sm font-bold font-mono text-slate-300">${baseValuation.toLocaleString()}</span>
                        </div>
                        <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-900/50 text-center">
                          <span className="text-[10px] text-indigo-400 block uppercase font-bold">Licensing Premium EV</span>
                          <span className="text-sm font-bold font-mono text-indigo-300">${calcMultiplierLift().toLocaleString()}</span>
                        </div>
                        <div className="p-3 bg-emerald-550/10 rounded-xl border border-emerald-500/20 text-center">
                          <span className="text-[10px] text-emerald-400 block uppercase font-bold">Total Strategic Exit Valuation</span>
                          <span className="text-sm font-black font-mono text-emerald-400">${calcMultiplierLift().toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* 2. ACQUIRER WAR ROOM */}
            {activeSubTab === 'buy_box' && (
              <motion.div
                key="buy-box-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="text-left">
                    <span className="text-[10px] font-bold text-emerald-400 font-mono tracking-widest uppercase block">Institutional Reverse Sourcing</span>
                    <h2 className="text-xl md:text-2xl font-black text-white mt-1">Acquirer Sourcing War Room</h2>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Reverse due diligence. Access verified "buy boxes" of top institutional exits. Avoid fishing blindly. Matching is authorized directly via safe cryptographic hashes.
                    </p>
                  </div>
                  
                  {!hasOptedIn ? (
                    <button
                      type="button"
                      onClick={handleOptInWarRoom}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-slate-950" /> Opt-In to Matchmaking Node
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-extrabold flex items-center gap-1 animate-pulse">
                      <CheckCircle className="w-3.5 h-3.5" /> Direct Sourcing Active
                    </span>
                  )}
                </div>

                {/* Sourcing Calculator Fee simulation */}
                <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-4 text-left space-y-2">
                    <span className="text-[10px] bg-slate-800 text-slate-305 font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">1.5% Closure Fee</span>
                    <h4 className="text-xs font-black text-white">Consolidation Economics</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      Our platform replaces traditional corporate finance desks, taking only <b>1.5%</b> closure fees. 67 deals completed per year at average valuations generates robust structural efficiencies.
                    </p>
                  </div>
                  <div className="md:col-span-4 space-y-1.5">
                    <label className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Simulated Average Ticket Size</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-500 font-mono text-xs">$</span>
                      <input 
                        type="number"
                        value={avgDealSizeInput}
                        onChange={(e) => setAvgDealSizeInput(Math.max(1, parseInt(e.target.value) || 0))}
                        className="bg-slate-900 border border-slate-800 rounded-xl pl-6 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 w-full font-mono"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-4 p-3 bg-indigo-950/30 rounded-xl border border-indigo-900/40 text-center">
                    <span className="text-[9px] text-indigo-400 uppercase font-extrabold block">Bao Platform Advisory Charge</span>
                    <span className="text-base font-black text-indigo-300 font-mono">${(avgDealSizeInput * 0.015).toLocaleString()}</span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Saves $150k+ in traditional banker retention commissions.</span>
                  </div>
                </div>

                {/* Buy Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ACQUIRER_WAR_ROOM_DATA.map(box => (
                    <div key={box.acquirer} className="p-5 bg-slate-950 border border-slate-850 rounded-2xl space-y-3 relative overflow-hidden flex flex-col justify-between">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-indigo-500/5 to-transparent pointer-events-none" />
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-black flex items-center justify-center text-xs tracking-wider border border-slate-800 shadow-sm">
                              {box.logoLetter}
                            </div>
                            <h3 className="font-extrabold text-sm text-white">{box.acquirer}</h3>
                          </div>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                            box.activeStatus === 'Aggressive' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            box.activeStatus === 'Selective' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}>
                            {box.activeStatus} buy box
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Target criteria / segments:</span>
                          <span className="text-xs font-semibold text-slate-300 block leading-tight">{box.targetVert}</span>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed italic">
                          "{box.thesis}"
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-900 grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                        <div>
                          <span className="block text-slate-500 uppercase">Buy Size (ARR):</span>
                          <span className="font-semibold text-slate-300">{box.minARR} - {box.maxARR}</span>
                        </div>
                        <div>
                          <span className="block text-slate-500 uppercase">Target regions:</span>
                          <span className="font-semibold text-slate-305 truncate block">{box.regions.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 3. AUTOPILOT + LEGAL OS */}
            {activeSubTab === ' autopilot' && (
              <motion.div
                key="autopilot-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] font-bold text-emerald-400 font-mono tracking-widest uppercase block">BAO Data Room Autopilot + Legal OS</span>
                  <h2 className="text-xl md:text-2xl font-black text-white mt-1">Autonomous Virtual Data Room (VDR) &amp; Auditing</h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Due diligence failures crash over 60% of concluded tech exits in physical markets. Cut the timing of diligence runs from 6 months down to 3 weeks flat. Autopilot hooks into developer agreements, banking API ledgers, and merges cap-tables.
                  </p>
                </div>

                {/* Bowmans partnership offer */}
                <div className="p-4 bg-indigo-950/40 border border-indigo-900/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-left space-y-1">
                    <span className="text-[9px] bg-slate-900 text-white font-extrabold px-1.5 py-0.5 rounded font-mono uppercase tracking-wide">Flat-Fee Consortium</span>
                    <h3 className="text-xs font-black text-white">Elite Legal Health Check Partnership</h3>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans max-w-xl">
                      Pre-cleared legal health reports with elite sub-continent counsels: <b>Aluko &amp; Oyebode</b> (Nigeria), <b>Bowmans</b> (South Africa/Kenya), and <b>Anjarwalla &amp; Khanna</b>. Secures 100% IP rights clearance for only <b>$500 flat fee</b>.
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold font-mono">Cost at Close</span>
                    <span className="text-lg font-black text-emerald-400 font-mono">$500 Flat</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
                  
                  {/* Progress logs */}
                  <div className="md:col-span-3 space-y-3">
                    {autopilotSteps.map(step => (
                      <div key={step.id} className="p-3 bg-slate-950 border border-slate-850 rounded-2xl flex items-start gap-3">
                        <div className="mt-0.5">
                          {step.status === 'Pending' && <div className="w-5 h-5 rounded-full border-2 border-slate-800" />}
                          {step.status === 'Active' && <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />}
                          {step.status === 'Completed' && <CheckCircle className="w-5 h-5 text-emerald-400 fill-emerald-500/10" />}
                        </div>
                        <div className="text-left space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white leading-none">{step.name}</span>
                            <span className={`text-[8px] px-1.5 rounded uppercase font-bold ${
                              step.status === 'Pending' ? 'bg-slate-900 text-slate-500' :
                              step.status === 'Active' ? 'bg-indigo-950 text-indigo-400' :
                              'bg-emerald-500/15 text-emerald-400'
                            }`}>{step.status}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-sans leading-normal">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* VDR Trigger Box */}
                  <div className="md:col-span-2 bg-slate-950 p-6 rounded-2xl border border-slate-850 space-y-4 text-center">
                    <FolderLock className="w-10 h-10 text-indigo-400 mx-auto" />
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">Deploy Autopilot S3 Room</h4>
                      <p className="text-[11px] text-slate-450 leading-relaxed font-sans mt-1">
                        Instantly deploy a secure cryptographic container mapping your financial books and developer licenses directly on Amazon Web Services.
                      </p>
                    </div>

                    {!vdrUrl ? (
                      <button
                        type="button"
                        onClick={handleTriggerAutopilot}
                        disabled={spinningUp}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-550 disabled:bg-slate-800 disabled:text-slate-500 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {spinningUp ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                            Locking API links...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                            Prepare for Exit
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono rounded-lg break-all">
                          {vdrUrl}
                        </div>
                        <span className="text-[9px] text-emerald-400 font-extrabold flex items-center justify-center gap-1">
                          <Check className="w-3 h-3 text-emerald-400" /> Secure VDR Generated successfully
                        </span>
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            )}

            {/* 4. FX HEDGE + REPATRIATION DESK */}
            {activeSubTab === 'fx_hedge' && (
              <motion.div
                key="fx-hedge-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] font-bold text-emerald-400 font-mono tracking-widest uppercase block">VertoFX &amp; AZA Finance Desk</span>
                  <h2 className="text-xl md:text-2xl font-black text-white mt-1">FX Hedge + Repatriation Desk</h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Protect cash take-home. A $10M exit denominated inside local currencies will instantly crash to $4M after localized devaluations if left unhedged during standard earn-out times. We lock LOI signing rates instantly.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  
                  {/* Inputs */}
                  <div className="md:col-span-4 bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Scenario Variables</span>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-450 block font-bold uppercase tracking-wider">Purchase Price Offered ($)</label>
                      <input 
                        type="number"
                        value={baseLOIValue}
                        onChange={(e) => setBaseLOIValue(Math.max(1, parseInt(e.target.value) || 0))}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 w-full font-mono font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-450 block font-bold uppercase tracking-wider">Earn-Out Local Currency (e.g. NGN) Depreciation %</label>
                      <input 
                        type="number"
                        value={nairaDevalYearly}
                        onChange={(e) => setNairaDevalYearly(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 w-full font-mono font-bold"
                      />
                      <span className="text-[9px] text-slate-500 block italic">Simulates regional currency stress</span>
                    </div>

                    <hr className="border-slate-900" />

                    <div className="space-y-2">
                      <span className="text-[10px] uppercase text-slate-500 block font-bold">Partnerships Lock</span>
                      <button
                        type="button"
                        onClick={() => {
                          setLockedRates(!lockedRates);
                          onShowToast(lockedRates ? 'FX rate hedging unlocked.' : 'Hedged! Rate secured with VertoFX at LOI execution.', 'info');
                        }}
                        className={`w-full py-2 rounded-xl text-xs font-black transition-all border ${
                          lockedRates 
                            ? 'bg-indigo-600/10 text-indigo-400 border-indigo-400' 
                            : 'bg-indigo-600 font-bold hover:bg-indigo-550 text-white border-transparent'
                        }`}
                      >
                        {lockedRates ? '✓ Rates Locked (25bps Fee)' : 'Partner with VertoFX / AZA'}
                      </button>
                    </div>
                  </div>

                  {/* Outcomes Simulation (Bloomberg style table/bars) */}
                  <div className="md:col-span-8 bg-slate-1050 p-6 border border-slate-850 rounded-2xl space-y-4">
                    <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider font-mono">Simulated Take-Home Cash (3 Scenarios)</span>
                    
                    <div className="space-y-4">
                      {/* USD Mauritius Holdco */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-white flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            Scenario A: USD Mauritius Holdco (Hedged)
                          </span>
                          <span className="font-mono font-black text-emerald-400">${calcHedgeScenarios().USD.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-2.5">
                          <div className="bg-emerald-400 h-2.5 rounded-full" style={{ width: '100%' }} />
                        </div>
                        <span className="text-[9px] text-slate-500 block leading-none">Complete immunity to currency devaluations. Safe global repatriation.</span>
                      </div>

                      {/* 30% Earnout in NGN with Deval */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-white flex items-center gap-1">
                            {lockedRates ? <Check className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                            Scenario B: 30% Earn-out in NGN (Unhedged)
                          </span>
                          <span className="font-mono font-black text-rose-100">${(lockedRates ? calcHedgeScenarios().USD : calcHedgeScenarios().NGN).toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-2.5">
                          <div className={`h-2.5 rounded-full ${lockedRates ? 'bg-indigo-400' : 'bg-rose-500'}`} style={{ width: lockedRates ? '100%' : `${(calcHedgeScenarios().NGN / baseLOIValue) * 100}%` }} />
                        </div>
                        <span className="text-[9px] text-slate-500 block leading-none">
                          {lockedRates ? 'VertoFX rate lock active. Zero depreciation impact.' : `Naira depreciation inflicts structural loss equal to $${calcHedgeScenarios().devalLoss.toLocaleString()} USD on closing value.`}
                        </span>
                      </div>

                      {/* Stock Swap in Acquirer (non liquid block) */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-white flex items-center gap-1">
                            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-500" />
                            Scenario C: Non-Liquid Stock Swap
                          </span>
                          <span className="font-mono font-black text-amber-400">${calcHedgeScenarios().Stock.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-2.5">
                          <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '92%' }} />
                        </div>
                        <span className="text-[9px] text-slate-500 block leading-none">8% discount applied due to private secondary sale constraints on target stock.</span>
                      </div>

                      {/* Currency 25bps Margin calculations */}
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 flex justify-between items-center text-[10px] font-mono text-slate-400 pt-2.5">
                        <span>HEDGE BROKERAGE (25bps pure margin):</span>
                        <span className="text-white font-extrabold">${(baseLOIValue * 0.0025).toLocaleString()} USD</span>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* 5. BAO SECONDARY LIQUIDITY NETWORK */}
            {activeSubTab === 'secondary' && (
              <motion.div
                key="secondary-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] font-bold text-emerald-400 font-mono tracking-widest uppercase block">BAO Secondary Liquidity Network</span>
                  <h2 className="text-xl md:text-2xl font-black text-white mt-1">Secondary Founder Share Purchases at Close</h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Normally, founders get zero cash-outs at acquisition with a grinding 3-year post-close vestment restriction. We negotiate with premium funds to purchase 10-20% of your shares right at transaction closure. "Get $1M USD cash security today, not maybe 2029."
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  
                  {/* Controls */}
                  <div className="md:col-span-5 bg-slate-950 p-6 rounded-2xl border border-slate-850 space-y-4">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Configure Allocation</span>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Founder Share Purchase target:</span>
                        <span className="font-bold text-white font-mono">{primaryFounderSharesPct}% of equity</span>
                      </div>
                      <input 
                        type="range"
                        min="5"
                        max="25"
                        step="1"
                        value={primaryFounderSharesPct}
                        onChange={(e) => setPrimaryFounderSharesPct(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                      />
                      <div className="flex justify-between text-[9px] text-slate-600 font-mono">
                        <span>Min: 5%</span>
                        <span>Max Allowed: 25%</span>
                      </div>
                    </div>

                    <div className="p-3.5 bg-indigo-950/20 rounded-xl border border-indigo-900/30 text-xs">
                      <span className="font-extrabold text-white block mb-0.5">Calculated Sourcing Multiplier:</span>
                      <p className="text-[10px] text-slate-400 leading-normal font-sans">
                        Helios, DPI, and Avenir Capital utilize automated allocations matching Series A/B African startups to buy option agreements.
                      </p>
                    </div>
                  </div>

                  {/* Fund matches */}
                  <div className="md:col-span-7 space-y-3 text-left">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Institutional Secondary Match Desk</span>
                    
                    {/* Helios matching offer */}
                    <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded bg-slate-900 font-black text-indigo-400 flex items-center justify-center text-[10px] border border-slate-800">HI</span>
                          <h4 className="text-xs font-black text-white">Helios Sovereign Secondary</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 font-sans max-w-sm">
                          Ready to buy up to 15% of founder shares at close. Targets Delaware holdco compliance.
                        </p>
                      </div>
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setAcceptedHeliosOffer(!acceptedHeliosOffer);
                            onShowToast(acceptedHeliosOffer ? 'Helios secondary reservation canceled.' : 'Matched! Helios secondary purchase registered.', 'success');
                          }}
                          className={`px-3 py-1.5 text-xs font-black rounded-xl border transition-all ${
                            acceptedHeliosOffer 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-400' 
                              : 'bg-white hover:bg-slate-50 text-slate-950'
                          }`}
                        >
                          {acceptedHeliosOffer ? '✓ Reserved' : 'Reserve Lot'}
                        </button>
                      </div>
                    </div>

                    {/* DPI matching offer */}
                    <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded bg-slate-900 font-black text-rose-400 flex items-center justify-center text-[10px] border border-slate-800">DP</span>
                          <h4 className="text-xs font-black text-white">DPI Sourcing Fund</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 font-sans max-w-sm">
                          Accepts up to 20% allocation. Minimum asset eligibility target: Bain-standard ARR &gt; $2M.
                        </p>
                      </div>
                      <span className="text-[9px] bg-slate-905 text-slate-500 font-mono px-2 py-1 rounded font-bold uppercase shrink-0 border border-slate-800">ELIGIBLE AT $2M ARR</span>
                    </div>

                  </div>

                </div>
              </motion.div>
            )}

            {/* 6. BAO SCORE - S&P DESIGN */}
            {activeSubTab === 'score' && (
              <motion.div
                key="score-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] font-bold text-emerald-400 font-mono tracking-widest uppercase block">S&amp;P rating for African Startups</span>
                  <h2 className="text-xl md:text-2xl font-black text-white mt-1">BAO Exit Score Benchmark (FICO for Tech)</h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Not vanity metrics. Exit success requires structured proof of revenue, deep regulatory barriers, secure corporate governance alignments, and low team departure tracking.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  
                  {/* Dynamic Weights inputs */}
                  <div className="md:col-span-5 bg-slate-950 p-6 rounded-2xl border border-slate-850 space-y-4">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Exit-Weighting metrics (100% Total)</span>
                    
                    {/* Revenue Quality */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-450 font-medium">Revenue Quality (40% Weight)</span>
                        <span className="font-bold text-white font-mono">{revQuality}%</span>
                      </div>
                      <input 
                        type="range" min="10" max="100" value={revQuality} 
                        onChange={(e) => setRevQuality(parseInt(e.target.value))}
                        className="w-full bg-slate-800 h-1 appearance-none cursor-pointer accent-emerald-400"
                      />
                      <span className="text-[9px] text-slate-550 block">Assesses localized ARR contractual density vs one-off setup fees.</span>
                    </div>

                    {/* Regulatory Moat */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-450 font-medium">Regulatory Moat (25% Weight)</span>
                        <span className="font-bold text-white font-mono">{regMoat}%</span>
                      </div>
                      <input 
                        type="range" min="10" max="100" value={regMoat} 
                        onChange={(e) => setRegMoat(parseInt(e.target.value))}
                        className="w-full bg-slate-800 h-1 appearance-none cursor-pointer accent-emerald-400"
                      />
                      <span className="text-[9px] text-slate-550 block">Measures active CBN, CBK, or FSCA cleared license counts.</span>
                    </div>

                    {/* Governance */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-450 font-medium">Clear Governance (20% Weight)</span>
                        <span className="font-bold text-white font-mono">{govQuality}%</span>
                      </div>
                      <input 
                        type="range" min="10" max="100" value={govQuality} 
                        onChange={(e) => setGovQuality(parseInt(e.target.value))}
                        className="w-full bg-slate-800 h-1 appearance-none cursor-pointer accent-emerald-400"
                      />
                      <span className="text-[9px] text-slate-550 block">Monitors board clearances and audited financial loops.</span>
                    </div>

                    {/* Team retention */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-455 font-medium">Team Retention Risk (15% Weight)</span>
                        <span className="font-bold text-white font-mono">{teamRetention}%</span>
                      </div>
                      <input 
                        type="range" min="10" max="100" value={teamRetention} 
                        onChange={(e) => setTeamRetention(parseInt(e.target.value))}
                        className="w-full bg-slate-800 h-1 appearance-none cursor-pointer accent-emerald-400"
                      />
                      <span className="text-[9px] text-slate-550 block">Measures developer contract durations &amp; IP handover terms.</span>
                    </div>
                  </div>

                  {/* S&P FICO score Visual Feedback */}
                  <div className="md:col-span-7 bg-slate-1050 p-6 border border-slate-850 rounded-2xl text-center space-y-4">
                    <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider block font-mono">Unified Weighted BAO Exit Score</span>
                    
                    {/* Big score indicator */}
                    <div className="relative w-40 h-40 mx-auto flex flex-col items-center justify-center">
                      <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                        <circle cx="50" cy="50" r="40" stroke="#10b981" strokeWidth="8" fill="transparent" 
                          strokeDasharray="251.2" 
                          strokeDashoffset={251.2 - (251.2 * (Math.round((revQuality * 0.40) + (regMoat * 0.25) + (govQuality * 0.20) + (teamRetention * 0.15)))) / 100} 
                        />
                      </svg>
                      <span className="text-3xl font-black font-mono text-emerald-400">
                        {Math.round((revQuality * 0.40) + (regMoat * 0.25) + (govQuality * 0.20) + (teamRetention * 0.15))}%
                      </span>
                      <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mt-1 block">Rating Level (A)</span>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 leading-normal text-xs text-slate-400 text-left space-y-1 font-sans">
                      <span className="font-extrabold text-white block">S&amp;P Venture Audit Verdict:</span>
                      <p className="text-[10px]">
                        PE desks, DFIs, and regional banks utilize this score model to clear venture debt brackets and issue cash limits. Exceeding <b>70%</b> clears automatic board-level matching integrations.
                      </p>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* 7. M&A AI NEGOTIATOR */}
            {activeSubTab === 'co_pilot' && (
              <motion.div
                key="co-pilot-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] font-bold text-emerald-400 font-mono tracking-widest uppercase block">LOI redlining trained on African exits</span>
                  <h2 className="text-xl md:text-2xl font-black text-white mt-1">"M&amp;A Co-Pilot" - AI Negotiator</h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Upload your Letter of Intent (LOI) or test with our aggressive VC draft. It flags unfair reverse-vesting schedules, structures below African tech medians, and outputs custom alternative drafting solutions. (Fintech medians: 30% earnouts, 24mo vesting, English Commercial Court, LCIA).
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  
                  {/* Left hand LOI editable draft */}
                  <div className="space-y-3">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Acquisition Draft Terminal</span>
                    <textarea 
                      value={loiInput}
                      onChange={(e) => setLoiInput(e.target.value)}
                      rows={12}
                      className="bg-slate-950 text-slate-300 font-mono text-[10px] p-4 rounded-2xl border border-slate-850 focus:outline-none focus:border-indigo-500 w-full resize-none leading-relaxed"
                    />
                    
                    <div className="flex justify-between items-center pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setLoiInput('');
                          setRedlineReport('');
                          onShowToast('Draft cleared.', 'info');
                        }}
                        className="text-[10px] text-slate-500 hover:text-white flex items-center gap-1 cursor-pointer font-bold"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Reset Template
                      </button>
                      
                      <button
                        type="button"
                        onClick={runAIRedlines}
                        disabled={parsingLOI || !loiInput}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-550 disabled:bg-slate-800 disabled:text-slate-500 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {parsingLOI ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> Negotiating...
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-3.5 h-3.5 text-indigo-300" /> Upload Terms &amp; Redline
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* AI redlines output */}
                  <div className="space-y-3">
                    <span className="text-[10px] text-slate-505 font-bold uppercase tracking-wider block">AI Attorney Redline &amp; Counsel Review</span>
                    
                    {redlineReport ? (
                      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl max-h-[340px] overflow-y-auto text-xs text-slate-300 leading-relaxed font-sans prose prose-invert">
                        <ReactMarkdown>{redlineReport}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="p-10 bg-slate-950/40 border border-slate-850 border-dashed rounded-2xl text-center space-y-3 flex flex-col items-center justify-center min-h-[300px]">
                        <HeartHandshake className="w-10 h-10 text-slate-600" />
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-400">Terminal Idle: Upload LOI Draft</h4>
                          <p className="text-[11px] text-slate-550 max-w-xs leading-normal">
                            Click "Upload Terms &amp; Redline" to activate the legal copilot audit against 2020-2026 sub-continental transactions database.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            )}

            {/* 8. BAO POST-MERGER OS */}
            {activeSubTab === 'post_merger' && (
              <motion.div
                key="post-merger-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] font-bold text-emerald-400 font-mono tracking-widest uppercase block">McKinsey Margins at SaaS Scale</span>
                  <h2 className="text-xl md:text-2xl font-black text-white mt-1">BAO Post-Merger OS (Day 1-100 Plan)</h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Over 80% of African cross-border acquisitions collapse within the first 12 months due to misaligned system stacks, conflicting payroll currencies, or bad customer APIs. De-risk your post-close merger instantly using our automated blueprints.
                  </p>
                </div>

                {/* Integration Sector pickers */}
                <div className="flex gap-2">
                  {(['Fintech', 'SaaS', 'Logistic'] as const).map(sec => (
                    <button
                      key={sec}
                      onClick={() => setPostMergerActiveSector(sec)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                        postMergerActiveSector === sec 
                          ? 'bg-indigo-650 border-indigo-500 text-white' 
                          : 'bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-850'
                      }`}
                    >
                      {sec} blueprint
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  
                  {/* step cards */}
                  <div className="md:col-span-8 space-y-3">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Target Integration Timeline Matrix</span>
                    
                    {postMergerActiveSector === 'Fintech' && (
                      <div className="space-y-3">
                        <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-2xl flex gap-3 text-left">
                          <span className="text-xs font-bold font-mono text-indigo-400 shrink-0">W1-2</span>
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-extrabold text-white">Consolidate card network processing BIN numbers</h4>
                            <p className="text-[10px] text-slate-500 font-sans leading-normal">Route high-volume merchant networks down to clear settlement ledger paths to preserve interchange fees.</p>
                          </div>
                        </div>

                        <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-2xl flex gap-3 text-left">
                          <span className="text-xs font-bold font-mono text-indigo-400 shrink-0">W3-6</span>
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-extrabold text-white">Sync developer system authorization layers &amp; IAM secrets</h4>
                            <p className="text-[10px] text-slate-500 font-sans leading-normal">Adopt standard client encryption keys and clear database links so engineering teams merge repos securely.</p>
                          </div>
                        </div>

                        <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-2xl flex gap-3 text-left">
                          <span className="text-xs font-bold font-mono text-indigo-400 shrink-0">W7-12</span>
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-extrabold text-white">Unify local merchant compliance &amp; tax structures</h4>
                            <p className="text-[10px] text-slate-500 font-sans leading-normal">Align cross-border CBN and CBK annual tax clearance registers to prevent severe central government audit warnings.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {postMergerActiveSector === 'SaaS' && (
                      <div className="space-y-3">
                        <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl flex gap-3 text-left">
                          <span className="text-xs font-bold font-mono text-indigo-400 shrink-0">W1-2</span>
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-extrabold text-white">Merge Stripe/Braintree payment gateway instances</h4>
                            <p className="text-[10px] text-slate-500 font-sans leading-normal">Unify global subscription structures to centralize monthly recurring revenue records.</p>
                          </div>
                        </div>

                        <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl flex gap-3 text-left">
                          <span className="text-xs font-bold font-mono text-indigo-400 shrink-0">W3-6</span>
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-extrabold text-white">Implement customer data residency compliance (POPIA/NDPR)</h4>
                            <p className="text-[10px] text-slate-500 font-sans leading-normal">Verify South African POPIA or Nigerian NDPR storage compliance to secure the localized user accounts.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {postMergerActiveSector === 'Logistic' && (
                      <div className="space-y-3">
                        <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl flex gap-3 text-left">
                          <span className="text-xs font-bold font-mono text-indigo-400 shrink-0">W1-2</span>
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-extrabold text-white font-sans">Consolidate fleet-tracking API pipelines</h4>
                            <p className="text-[10px] text-slate-500 font-sans leading-normal">Reroute global middle-mile shipment triggers into a single integrated digital tracker dashboard.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* McKinsey PDF download simulated info */}
                  <div className="md:col-span-4 bg-slate-950 p-6 rounded-2xl border border-slate-850 space-y-4 text-center">
                    <Activity className="w-10 h-10 text-emerald-400 mx-auto" />
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">Acquirer OS SLA Check</h4>
                      <p className="text-[10px] text-slate-450 leading-relaxed font-sans mt-1">
                        Acquirers will pay <b>$50,050</b> for ready integration templates to protect the technology and talent during a capital takeover.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onShowToast('Integration Blueprint downloaded. Complete Day 1-100 checklist synced.', 'success');
                      }}
                      className="w-full py-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Blueprint
                    </button>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
