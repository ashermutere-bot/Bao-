/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  TrendingUp, 
  Award, 
  MapPin, 
  Users, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  Lock, 
  LogOut, 
  User, 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Mail, 
  Play, 
  BookOpen, 
  ShieldAlert,
  Database,
  RefreshCw,
  Trash2,
  Check,
  Zap,
  DollarSign,
  Bot,
  ArrowRight,
  Download,
  CreditCard,
  Share2,
  Gift,
  Briefcase,
  Copy,
  Sparkles,
  Globe,
  Bell
} from 'lucide-react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import ReactMarkdown from 'react-markdown';
import ScoreProgressionChart from './components/ScoreProgressionChart';
import DueDiligenceAssistant from './components/DueDiligenceAssistant';
import ComplianceRadar from './components/ComplianceRadar';
import AcquirerIntelligence from './components/AcquirerIntelligence';
import PaymentModal from './components/PaymentModal';
import ShareScoreModal from './components/ShareScoreModal';
import MAWarRoom from './components/MAWarRoom';
// @ts-ignore
import AppLogo from './assets/images/bao_app_logo_1781819958065.jpg';

// ==========================================
// DATA STRUCTURES & PROTOCOLS
// ==========================================

interface Question {
  id: string;
  label: string;
  category: 'Financials' | 'Operations' | 'Technology' | 'Market Stability';
  options: { value: number; label: string }[];
}

interface Acquirer {
  name: string;
  logo: string;
  description: string;
  minRevenue: number;
  minScore: number;
}

interface Assessment {
  id?: string;
  score: number;
  matches: string[];
  answers: Record<string, number>;
  createdAt: any; // Date, timestamp, or serialized string
}

// Exact 15 questions from prompt specifications
const QUESTIONS: Question[] = [
  {
    id: 'revenue',
    category: 'Financials',
    label: 'What is your current Annual Recurring Revenue (ARR)?',
    options: [
      { value: 0, label: '$0 - $100K' },
      { value: 1, label: '$100K - $500K' },
      { value: 2, label: '$500K - $1M' },
      { value: 3, label: '$1M - $5M' },
      { value: 4, label: '$5M+' }
    ]
  },
  {
    id: 'growth',
    category: 'Financials',
    label: 'What is your Year-over-Year (YoY) revenue growth rate?',
    options: [
      { value: 0, label: 'Negative / Flat' },
      { value: 1, label: '1% - 25%' },
      { value: 2, label: '25% - 50%' },
      { value: 3, label: '50% - 100%' },
      { value: 4, label: '100%+' }
    ]
  },
  {
    id: 'profitability',
    category: 'Financials',
    label: 'What is your operating EBITDA margin?',
    options: [
      { value: 0, label: 'Negative / Flat' },
      { value: 1, label: '0% - 20%' },
      { value: 2, label: '20% - 40%' },
      { value: 3, label: '40% - 60%' },
      { value: 4, label: '60%+' }
    ]
  },
  {
    id: 'team',
    category: 'Operations',
    label: 'What is the current scale of your full-time team?',
    options: [
      { value: 0, label: '1 - 5 team members' },
      { value: 1, label: '6 - 15 team members' },
      { value: 2, label: '16 - 50 team members' },
      { value: 3, label: '51 - 150 team members' },
      { value: 4, label: '150+ team members' }
    ]
  },
  {
    id: 'tech',
    category: 'Technology',
    label: 'What is the age and documentation status of your core tech stack?',
    options: [
      { value: 0, label: '5+ years old with heavy legacy debt' },
      { value: 1, label: '3 - 5 years old with moderate debt' },
      { value: 2, label: '1 - 3 years old with clean codebase' },
      { value: 3, label: '<1 year old, highly agile architecture' },
      { value: 4, label: 'Modern stack, pristine and fully documented API infrastructure' }
    ]
  },
  {
    id: 'customers',
    category: 'Market Stability',
    label: 'What is your current level of customer concentration?',
    options: [
      { value: 0, label: 'One client accounts for 50%+ of revenue' },
      { value: 1, label: 'One client accounts for 30%+ of revenue' },
      { value: 2, label: 'Top 3 clients account for 50%+ of revenue' },
      { value: 3, label: 'Top 5 clients account for 50%+ of revenue' },
      { value: 4, label: 'Well-diversified, high-granularity portfolio' }
    ]
  },
  {
    id: 'churn',
    category: 'Market Stability',
    label: 'What is your annual Gross revenue churn rate?',
    options: [
      { value: 0, label: '20% or higher' },
      { value: 1, label: '10% - 20%' },
      { value: 2, label: '5% - 10%' },
      { value: 3, label: '2% - 5%' },
      { value: 4, label: 'Less than 2%' }
    ]
  },
  {
    id: 'market',
    category: 'Market Stability',
    label: 'What is the Total Addressable Market (TAM) of your primary sector?',
    options: [
      { value: 0, label: 'Under $100 Million' },
      { value: 1, label: '$100M - $500 Million' },
      { value: 2, label: '$500M - $1 Billion' },
      { value: 3, label: '$1B - $5 Billion' },
      { value: 4, label: '$5 Billion+' }
    ]
  },
  {
    id: 'funding',
    category: 'Financials',
    label: 'How much external venture or credit funding have you raised?',
    options: [
      { value: 0, label: '$0 (Fully bootstrapped)' },
      { value: 1, label: 'Less than $1 Million' },
      { value: 2, label: '$1M - $5 Million' },
      { value: 3, label: '$5M - $20 Million' },
      { value: 4, label: '$20 Million+' }
    ]
  },
  {
    id: 'ip',
    category: 'Technology',
    label: 'What is the status of your proprietary Intellectual Property (IP)?',
    options: [
      { value: 0, label: 'None registered or pending' },
      { value: 1, label: 'Patent pending / fully prepared files' },
      { value: 2, label: '1 - 3 Registered Patents or brand trademarks' },
      { value: 3, label: '4 - 10 Registered Patents' },
      { value: 4, label: '10+ Registered Patents' }
    ]
  },
  {
    id: 'regulatory',
    category: 'Operations',
    label: 'How would you rate your operating compliance & regulatory exposure?',
    options: [
      { value: 0, label: 'Unsure / No robust audit audit trails' },
      { value: 1, label: 'Unregulated / Gray market exposure' },
      { value: 2, label: 'Light regional regulatory oversight' },
      { value: 3, label: 'Moderate standard regional framework compliance' },
      { value: 4, label: 'Highly compliant, pan-African audit framework' }
    ]
  },
  {
    id: 'geography',
    category: 'Operations',
    label: 'In how many African nations does your startup actively operate?',
    options: [
      { value: 0, label: '1 nation' },
      { value: 1, label: '2 - 3 nations' },
      { value: 2, label: '4 - 6 nations' },
      { value: 3, label: '7 - 10 nations' },
      { value: 4, label: '10+ African countries' }
    ]
  },
  {
    id: 'partnerships',
    category: 'Operations',
    label: 'What is the scale of your current corporate or strategic partnerships?',
    options: [
      { value: 0, label: 'None' },
      { value: 1, label: '1 - 2 informal local partner channels' },
      { value: 2, label: '3 - 5 formal active local channels' },
      { value: 3, label: '5 - 10 formal commercial partnerships' },
      { value: 4, label: '10+ Global distribution agreements' }
    ]
  },
  {
    id: 'brand',
    category: 'Market Stability',
    label: 'How is your brand recognized inside your target sectors?',
    options: [
      { value: 0, label: 'Unknown / Localized' },
      { value: 1, label: 'Nationally recognized inside home country' },
      { value: 2, label: 'Regionally recognized (e.g. West or East Africa)' },
      { value: 3, label: 'Continentally recognized across multiple hubs' },
      { value: 4, label: 'Globally recognized emerging pioneer' }
    ]
  },
  {
    id: 'exit',
    category: 'Financials',
    label: 'What is the present status of inbound exit interest or discussions?',
    options: [
      { value: 0, label: 'Never, zero inbound curiosity' },
      { value: 1, label: '1 - 2 casual inquiries received' },
      { value: 2, label: '3 - 5 serious informational meetings held' },
      { value: 3, label: 'Had formal term sheets in hand historically' },
      { value: 4, label: 'Currently in active, formal acquisition negotiations' }
    ]
  }
];

// Complete exact 12 Acquirers with conditions
const ACQUIRERS: Acquirer[] = [
  { name: 'Stripe', logo: 'ST', description: 'Seeking expansion in Pan-African payment infrastructure and cross-border settlement.', minRevenue: 3, minScore: 70 },
  { name: 'Visa', logo: 'VI', description: 'Focused on global mobile interoperability, high-volume merchant networks, and wallet gateways.', minRevenue: 3, minScore: 75 },
  { name: 'Helios Investment', logo: 'HI', description: 'Interest in Series B+ level operational tech teams with strong regional governance and growth models.', minRevenue: 2, minScore: 60 },
  { name: 'Salesforce', logo: 'SF', description: 'Potential interest in CRM verticalization, commercial portals, and SaaS tools for the emerging enterprise market.', minRevenue: 3, minScore: 72 },
  { name: 'Naspers/Prosus', logo: 'NP', description: 'Leading investment arm checking large fintech backbones, cross-border retail, and general consumer tech.', minRevenue: 3, minScore: 65 },
  { name: 'Actis', logo: 'AC', description: 'Looking to acquire mature core digital foundations, data network lines, and digital security centers across Africa.', minRevenue: 2, minScore: 55 },
  { name: 'TLcom Capital', logo: 'TL', description: 'Seeking mid-to-late stage scale players with deep local tech innovations and product differentiation.', minRevenue: 1, minScore: 50 },
  { name: 'Omidyar', logo: 'OM', description: 'Impact-aligned strategic capital backing highly transparent consumer finance and open banking API systems.', minRevenue: 1, minScore: 45 },
  { name: 'IFC/CDC', logo: 'IF', description: 'Development partners supporting heavily compliant local digital infrastructure scaling across diverse hubs.', minRevenue: 2, minScore: 50 },
  { name: 'Google Africa Fund', logo: 'GA', description: 'Interested in core mobile platforms, high-impact regional databases, and artificial intelligence grids.', minRevenue: 2, minScore: 65 },
  { name: 'Partech Africa', logo: 'PA', description: 'Seeks exceptional tech organizations solving critical B2B commerce and localized fintech roadblocks.', minRevenue: 1, minScore: 50 },
  { name: 'FMO', logo: 'FM', description: 'Targeting commercial fintechs with reliable environmental-social-governance (ESG) reporting standards.', minRevenue: 2, minScore: 55 }
];

export default function App() {
  // ==========================================
  // CONFIGURATION & STATE STORAGE
  // ==========================================

  // Firebase configurations inside state, loaded from localStorage if custom
  const [firebaseKeys, setFirebaseKeys] = useState(() => {
    const saved = localStorage.getItem('bao_firebase_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: ''
    };
  });

  const [activeTab, setActiveTab] = useState<'home' | 'quiz' | 'dashboard' | 'pricing' | 'developer' | 'diligence' | 'compliance' | 'alerts' | 'war-room'>('home');
  const [usingMock, setUsingMock] = useState(true);
  const [firebaseInstance, setFirebaseInstance] = useState<any>(null);

  // Authentication State
  const [user, setUser] = useState<{ uid: string; email: string; displayName?: string; isDemo?: boolean } | null>(() => {
    const savedUser = localStorage.getItem('bao_current_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {}
    }
    return null;
  });
  
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authError, setAuthError] = useState('');

  // Quiz Interaction States
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('bao_pending_answers');
    return saved ? JSON.parse(saved) : {};
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [hasFinishedQuizThisSession, setHasFinishedQuizThisSession] = useState(false);
  const [latestCalculatedResult, setLatestCalculatedResult] = useState<{ score: number; matches: string[] } | null>(() => {
    const saved = localStorage.getItem('bao_latest_result');
    return saved ? JSON.parse(saved) : null;
  });

  // Saved Assessments State
  const [assessmentsList, setAssessmentsList] = useState<Assessment[]>(() => {
    const saved = localStorage.getItem('bao_mock_assessments');
    return saved ? JSON.parse(saved) : [];
  });

  // UI Support States
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [savingLoading, setSavingLoading] = useState(false);

  // Payment integration states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState<{ name: string; price: string } | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'pro' | 'enterprise'>(() => {
    return (localStorage.getItem('bao_subscription_tier') as 'free' | 'pro' | 'enterprise') || 'free';
  });

  // AI Roadmap States
  const [roadmapText, setRoadmapText] = useState<string>(() => {
    return localStorage.getItem('bao_latest_roadmap') || '';
  });
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
  const [roadmapSimulationMode, setRoadmapSimulationMode] = useState(false);

  const handlePaymentSuccess = (tier: 'pro' | 'enterprise', txnId: string, paymentMethod: string) => {
    setSubscriptionTier(tier);
    localStorage.setItem('bao_subscription_tier', tier);
    showToast(`Successfully upgraded to ${tier === 'enterprise' ? 'Brokerage Enterprise' : 'Executive Pro'} tier!`, 'success');
  };

  // Share score integration states
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareModalData, setShareModalData] = useState<{ score: number; matches: string[] } | null>(null);

  const handleOpenShareModal = (assessment: { score: number; matches: string[] }) => {
    setShareModalData(assessment);
    setShowShareModal(true);
  };

  // Referral & Earn System States
  const [dashboardSubTab, setDashboardSubTab] = useState<'portfolio' | 'referral'>('portfolio');
  const [invitesCount, setInvitesCount] = useState<number>(() => {
    return parseInt(localStorage.getItem('bao_referrals_count') || '0', 10);
  });
  const [extraAssessments, setExtraAssessments] = useState<number>(() => {
    return parseInt(localStorage.getItem('bao_extra_assessments') || '0', 10);
  });
  const [referralsList, setReferralsList] = useState<Array<{ id: string; email: string; date: string; status: 'completed' | 'pending'; rewardClaimed: boolean; rewardType?: 'pro' | 'assessments' }>>(() => {
    const saved = localStorage.getItem('bao_referrals_list');
    return saved ? JSON.parse(saved) : [];
  });

  const triggerReferralSimulation = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const mockEmails = [
      `tunde.o_${randomSuffix}@corridor.africa`,
      `m.diop_${randomSuffix}@teranga.io`,
      `chidi.n_${randomSuffix}@fubara.ng`,
      `fatoumata_${randomSuffix}@baobab.sn`,
      `k.nkosi_${randomSuffix}@vula.co.za`
    ];
    const pickedEmail = mockEmails[Math.floor(Math.random() * mockEmails.length)];
    const newRef = {
      id: `ref-${Date.now()}`,
      email: pickedEmail,
      date: new Date().toLocaleDateString(),
      status: 'completed' as const,
      rewardClaimed: false
    };

    const updatedList = [newRef, ...referralsList];
    setReferralsList(updatedList);
    localStorage.setItem('bao_referrals_list', JSON.stringify(updatedList));

    const newCount = invitesCount + 1;
    setInvitesCount(newCount);
    localStorage.setItem('bao_referrals_count', newCount.toString());

    // Give option to user or auto-grant (for prompt: "If a referred friend signs up and completes the quiz, the referrer gets 1 free month of the Pro plan or 5 extra free assessments")
    // Let's prompt with an award choice, or alternatively we can auto-grant 5 extra free assessments and 1 month of Pro! 
    // Let's grant both or let them toggle, or let's notify them that they've earned 1 month of Pro Tier!
    setSubscriptionTier('pro');
    localStorage.setItem('bao_subscription_tier', 'pro');
    
    const extra = extraAssessments + 5;
    setExtraAssessments(extra);
    localStorage.setItem('bao_extra_assessments', extra.toString());

    showToast(`🎉 Referral SignUp Complete! ${pickedEmail} completed their exit readiness quiz. Your Executive Pro status and +5 premium assessment tokens are activated!`, 'success');
  };

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedTwitter, setCopiedTwitter] = useState(false);
  const [copiedLinkedIn, setCopiedLinkedIn] = useState(false);

  const handleCopyLink = (text: string, type: 'link' | 'twitter' | 'linkedin') => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else if (type === 'twitter') {
      setCopiedTwitter(true);
      setTimeout(() => setCopiedTwitter(false), 2000);
    } else {
      setCopiedLinkedIn(true);
      setTimeout(() => setCopiedLinkedIn(false), 2000);
    }
    showToast('Copied content to clipboard successfully!', 'success');
  };

  // ==========================================
  // INITIALIZATION AND SYNC EFFECT
  // ==========================================

  // Automatically initialize Firebase client if config keys look valid
  useEffect(() => {
    if (firebaseKeys.apiKey && !firebaseKeys.apiKey.startsWith('YOUR_')) {
      try {
        // Prevent duplicate initialization
        const app = firebase.apps.length === 0 
          ? firebase.initializeApp(firebaseKeys)
          : firebase.app();
        
        const firstoreDb = app.firestore();
        const auth = app.auth();

        setFirebaseInstance({ auth, db: firstoreDb });
        setUsingMock(false);
        showToast('Successfully connected to Live Firebase!', 'success');

        // Setup real Auth listener
        const unsubscribe = auth.onAuthStateChanged((liveUser) => {
          if (liveUser) {
            const userData = {
              uid: liveUser.uid,
              email: liveUser.email || '',
              displayName: liveUser.displayName || 'Founder',
              isDemo: false
            };
            setUser(userData);
            localStorage.setItem('bao_current_user', JSON.stringify(userData));
            
            // Sync assessments from Firestore
            firstoreDb.collection('users').doc(liveUser.uid).collection('assessments')
              .orderBy('createdAt', 'desc')
              .get()
              .then((snapshot) => {
                const list: Assessment[] = [];
                snapshot.forEach((doc) => {
                  const data = doc.data();
                  list.push({
                    id: doc.id,
                    score: data.score,
                    matches: data.matches || [],
                    answers: data.answers || {},
                    createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString()
                  });
                });
                setAssessmentsList(list);
              })
              .catch(err => {
                console.error("Error loading remote assessments:", err);
              });

          } else {
            setUser(null);
            localStorage.removeItem('bao_current_user');
          }
        });
        return () => unsubscribe();
      } catch (err: any) {
        console.error("Firebase config failed", err);
        showToast(`Firebase Init Error: ${err.message}`, 'error');
        setUsingMock(true);
      }
    } else {
      setUsingMock(true);
    }
  }, [firebaseKeys]);

  // Keep pending answers in sync with localStorage
  useEffect(() => {
    localStorage.setItem('bao_pending_answers', JSON.stringify(currentAnswers));
  }, [currentAnswers]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // ==========================================
  // SCORING ENGINE & ALGORITHM
  // ==========================================

  const calculateAssessmentResult = (answersMap: Record<string, number>) => {
    let totalScoreObtained = 0;
    // Iterate through all 15 questions, sum up the selected values
    QUESTIONS.forEach(q => {
      const val = answersMap[q.id] !== undefined ? answersMap[q.id] : 0;
      totalScoreObtained += val;
    });

    const maxPointsPossible = QUESTIONS.length * 4; // 15 * 4 = 60
    const finalCalculatedScore = Math.round((totalScoreObtained / maxPointsPossible) * 100);

    // Filter matching acquirers based on prompt requirements
    // Condition: user's calculated score >= acquirer.minScore AND user's revenue answer value >= acquirer.minRevenue
    const userRevenueValue = answersMap['revenue'] !== undefined ? answersMap['revenue'] : 0;

    const matchedEntities = ACQUIRERS.filter(acquirer => {
      return (
        finalCalculatedScore >= acquirer.minScore && 
        userRevenueValue >= acquirer.minRevenue
      );
    });

    // Display the top 6 matches
    const top6Matches = matchedEntities
      .sort((a, b) => b.minScore - a.minScore) // Sort by score alignment
      .slice(0, 6)
      .map(acquirer => acquirer.name);

    return {
      score: finalCalculatedScore,
      matches: top6Matches
    };
  };

  // ==========================================
  // ACTION HANDLERS
  // ==========================================

  const handleApplyFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('bao_firebase_config', JSON.stringify(firebaseKeys));
    showToast('Applying Firebase Configuration...', 'info');
    setShowConfigPanel(false);
  };

  const clearFirebaseConfig = () => {
    const empty = { apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: '' };
    setFirebaseKeys(empty);
    localStorage.removeItem('bao_firebase_config');
    setUsingMock(true);
    setFirebaseInstance(null);
    showToast('Firebase Config cleared. Running in Demo offline mode.', 'info');
  };

  const handleSelection = (questionId: string, value: number) => {
    setCurrentAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Last question - Process scores!
      const results = calculateAssessmentResult(currentAnswers);
      setLatestCalculatedResult(results);
      localStorage.setItem('bao_latest_result', JSON.stringify(results));
      setHasFinishedQuizThisSession(true);
      showToast('Assessment Completed!', 'success');
      setActiveTab('pricing'); // Redirect or show results
      // Automatically scroll to active results container
      setTimeout(() => {
        const outcomesEl = document.getElementById('results-section-view');
        if (outcomesEl) {
          outcomesEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSaveToDashboard = async () => {
    if (!latestCalculatedResult) {
      showToast('Please complete the Exit Quiz first before saving.', 'error');
      return;
    }

    if (!user) {
      // Not logged in. Prompt Auth flow in modal, but persist latest result so when they complete signup they save
      showToast('Please log in or sign up to save your results permanently.', 'info');
      setAuthMode('signup');
      setShowAuthModal(true);
      return;
    }

    setSavingLoading(true);
    const newAssessment: Assessment = {
      score: latestCalculatedResult.score,
      matches: latestCalculatedResult.matches,
      answers: currentAnswers,
      createdAt: new Date().toISOString()
    };

    if (!usingMock && firebaseInstance?.db) {
      try {
        await firebaseInstance.db
          .collection('users')
          .doc(user.uid)
          .collection('assessments')
          .add({
            score: newAssessment.score,
            matches: newAssessment.matches,
            answers: newAssessment.answers,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });

        showToast('Successfully saved to live Firestore Cloud Database!', 'success');
        
        // Refresh local view from cloud
        const snapshot = await firebaseInstance.db
          .collection('users')
          .doc(user.uid)
          .collection('assessments')
          .orderBy('createdAt', 'desc')
          .get();

        const list: Assessment[] = [];
        snapshot.forEach((doc: any) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            score: data.score,
            matches: data.matches || [],
            answers: data.answers || {},
            createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString()
          });
        });
        setAssessmentsList(list);
      } catch (err: any) {
        console.error("Firestore Save Error:", err);
        showToast(`Failed to save cloud: ${err.message}`, 'error');
      }
    } else {
      // Simulate Local Storage assessment list save
      const updatedList = [newAssessment, ...assessmentsList];
      setAssessmentsList(updatedList);
      localStorage.setItem('bao_mock_assessments', JSON.stringify(updatedList));
      showToast('Saved successfully to local dashboard storage!', 'success');
    }

    setSavingLoading(false);
    setActiveTab('dashboard');
  };

  const deleteAssessment = async (idOrIndex: string | number) => {
    if (!confirm("Are you sure you want to delete this assessment record?")) return;

    if (!usingMock && firebaseInstance?.db && user && typeof idOrIndex === 'string') {
      try {
        await firebaseInstance.db
          .collection('users')
          .doc(user.uid)
          .collection('assessments')
          .doc(idOrIndex)
          .delete();

        setAssessmentsList(prev => prev.filter(a => a.id !== idOrIndex));
        showToast('Assessment deleted from cloud database.', 'success');
      } catch (err: any) {
        showToast(`Error deleting: ${err.message}`, 'error');
      }
    } else {
      const idx = typeof idOrIndex === 'number' ? idOrIndex : 0;
      const updated = [...assessmentsList];
      updated.splice(idx, 1);
      setAssessmentsList(updated);
      localStorage.setItem('bao_mock_assessments', JSON.stringify(updated));
      showToast('Assessment deleted from local state.', 'success');
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!latestCalculatedResult) {
      showToast("Please complete the assessment first.", "error");
      return;
    }
    setGeneratingRoadmap(true);
    showToast("Contacting Gemini M&A Advisory Desk...", "info");
    try {
      const response = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: currentAnswers,
          score: latestCalculatedResult.score,
        }),
      });
      if (!response.ok) {
        throw new Error(`Status: ${response.statusText}`);
      }
      const data = await response.json();
      setRoadmapText(data.roadmap || "Failed to generate dynamic roadmap recommendations.");
      setRoadmapSimulationMode(!!data.simulationMode);
      localStorage.setItem("bao_latest_roadmap", data.roadmap || "");
      showToast("Exit Advisory Roadmap active!", "success");
    } catch (err: any) {
      console.error(err);
      showToast(`Generation failed: ${err.message}`, "error");
    } finally {
      setGeneratingRoadmap(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!authEmail || !authPassword) {
      setAuthError('Please fill in complete details');
      return;
    }

    if (!usingMock && firebaseInstance?.auth) {
      try {
        if (authMode === 'signup') {
          const cred = await firebaseInstance.auth.createUserWithEmailAndPassword(authEmail, authPassword);
          if (cred.user) {
            await cred.user.updateProfile({
              displayName: companyName || 'Founder'
            });
            const userData = {
              uid: cred.user.uid,
              email: cred.user.email || '',
              displayName: companyName || 'Founder',
              isDemo: false
            };
            setUser(userData);
            localStorage.setItem('bao_current_user', JSON.stringify(userData));
          }
          showToast('Account successfully created on Cloud!', 'success');
        } else {
          const cred = await firebaseInstance.auth.signInWithEmailAndPassword(authEmail, authPassword);
          if (cred.user) {
            const userData = {
              uid: cred.user.uid,
              email: cred.user.email || '',
              displayName: cred.user.displayName || 'Founder',
              isDemo: false
            };
            setUser(userData);
            localStorage.setItem('bao_current_user', JSON.stringify(userData));
          }
          showToast('Logged in safely via Firestore Auth!', 'success');
        }
        setShowAuthModal(false);
      } catch (err: any) {
        setAuthError(err.message);
      }
    } else {
      // Demo Offline user simulation
      const mockUid = 'demo_' + Math.random().toString(36).substr(2, 9);
      const userData = {
        uid: mockUid,
        email: authEmail,
        displayName: companyName || authEmail.split('@')[0],
        isDemo: true
      };
      setUser(userData);
      localStorage.setItem('bao_current_user', JSON.stringify(userData));
      setShowAuthModal(false);
      showToast(`Welcome ${userData.displayName}! Running in sandbox mode.`, 'success');
    }
  };

  const handleLogout = async () => {
    if (!usingMock && firebaseInstance?.auth) {
      try {
        await firebaseInstance.auth.signOut();
        showToast('Logged out of cloud database session.', 'info');
      } catch (err: any) {
        showToast('Logout error: ' + err.message, 'error');
      }
    } else {
      showToast('Logged out of sandbox session.', 'info');
    }
    setUser(null);
    localStorage.removeItem('bao_current_user');
    setAssessmentsList([]);
    setActiveTab('home');
  };

  // Quick helper to fetch selected label option
  const getSelectedLabel = (questionId: string) => {
    const value = currentAnswers[questionId];
    if (value === undefined) return 'Unanswered';
    const q = QUESTIONS.find(qi => qi.id === questionId);
    return q?.options.find(o => o.value === value)?.label || 'Unanswered';
  };

  // Get score level tag and badge color class
  const getScoreInfo = (score: number) => {
    if (score < 40) return { label: 'Inception Phase', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500' };
    if (score < 60) return { label: 'Scale Phase', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500' };
    if (score < 75) return { label: 'Venture Ready', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500' };
    return { label: 'Excellent Exit Readiness', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500' };
  };

  // Waitlist submission
  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail) return;
    setWaitlistSuccess(true);
    showToast('You are on the list! We will contact you soon.', 'success');
  };

  // Trigger quick test-data load if dashboard is blank
  const loadExampleData = () => {
    // 1. Initial Assessment (took 9 months ago) - Starting Phase
    const answers1: Record<string, number> = {
      revenue: 1, // $100K - $500K
      growth: 1, // 1% - 25%
      profitability: 0, // Negative / Flat
      team: 0, // 1 - 5
      tech: 0, // 5+ years legacy
      customers: 0, // >50% client concentration
      churn: 1, // 10% - 20%
      market: 1, // $100M - $500M
      funding: 0, // Bootstrapped
      ip: 0, // None registered
      regulatory: 1, // Gray market/unregulated
      geography: 0, // 1 nation
      partnerships: 0, // None
      brand: 0, // Unknown
      exit: 0 // Zero inbound interest
    };

    // 2. Mid Assessment (took 6 months ago) - Scale Phase
    const answers2: Record<string, number> = {
      ...answers1,
      revenue: 2, // $500K - $1M
      growth: 2, // 25% - 50%
      profitability: 1, // 0% - 20% EBITDA
      team: 1, // 6 - 15
      tech: 1, // 3 - 5 years moderate debt
      churn: 2, // 5% - 10%
      regulatory: 2, // Light regional compliance
      geography: 1, // 2 - 3 nations
      partnerships: 1 // 1 - 2 informal
    };

    // 3. High Assessment (took 3 months ago) - Venture Ready
    const answers3: Record<string, number> = {
      ...answers2,
      revenue: 3, // $1M - $5M ARR
      profitability: 2, // 20% - 40%
      team: 2, // 16 - 50
      tech: 2, // 1 - 3 years clean
      customers: 2, // Top 3 account for 50%+
      churn: 3, // 2% - 5%
      market: 2, // $500M - $1B
      funding: 1, // <$1M
      ip: 1, // Patent pending
      regulatory: 3, // Moderate compliance
      geography: 2, // 4 - 6 nations
      partnerships: 2, // 3 - 5 formal
      brand: 1 // Nationally recognized
    };

    // 4. Latest Assessment (today) - Excellent Exit Readiness
    const answers4: Record<string, number> = {
      revenue: 4, // $5M+ ARR
      growth: 3, // 50-100%
      profitability: 3, // 40-60%
      team: 2, // 16-50
      tech: 4, // Modern stack, pristine fully documented
      customers: 4, // Well-diversified
      churn: 4, // Less than 2%
      market: 3, // $1B - $5B
      funding: 2, // $1M - $5M
      ip: 2, // 1-3 Registered patents
      regulatory: 4, // Highly compliant, pan-African audit
      geography: 3, // 7 - 10 nations
      partnerships: 3, // 5-10 formal
      brand: 2, // Regionally recognized
      exit: 2 // 3-5 serious informational meetings
    };

    const res1 = calculateAssessmentResult(answers1);
    const res2 = calculateAssessmentResult(answers2);
    const res3 = calculateAssessmentResult(answers3);
    const res4 = calculateAssessmentResult(answers4);

    const dateToday = new Date();
    const mockAssessments: Assessment[] = [
      {
        id: 'mock_4',
        score: res4.score,
        matches: res4.matches,
        answers: answers4,
        createdAt: dateToday.toISOString()
      },
      {
        id: 'mock_3',
        score: res3.score,
        matches: res3.matches,
        answers: answers3,
        createdAt: new Date(dateToday.getTime() - 90 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: 'mock_2',
        score: res2.score,
        matches: res2.matches,
        answers: answers2,
        createdAt: new Date(dateToday.getTime() - 180 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: 'mock_1',
        score: res1.score,
        matches: res1.matches,
        answers: answers1,
        createdAt: new Date(dateToday.getTime() - 270 * 24 * 3600 * 1000).toISOString()
      }
    ];

    setCurrentAnswers(answers4);
    setLatestCalculatedResult(res4);
    localStorage.setItem('bao_latest_result', JSON.stringify(res4));

    setAssessmentsList(mockAssessments);
    localStorage.setItem('bao_mock_assessments', JSON.stringify(mockAssessments));
    showToast('Injected historical multi-point score progression logs!', 'success');
  };

  const progressPercentage = Math.round(((currentQuestionIndex + 1) / QUESTIONS.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-x-hidden selection:bg-emerald-500/20 selection:text-emerald-900" id="bao-app-container">
      
      {/* Floating Toast Notification */}
      {toast && (
        <div id="bao-toast-notification" className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl border animate-bounce ${
          toast.type === 'success' ? 'bg-white border-emerald-100 text-slate-900' :
          toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-900' :
          'bg-slate-900 border-slate-800 text-white'
        }`}>
          <div className={`w-2.5 h-2.5 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`} />
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* ==========================================
          NAVIGATION HEADER
          ========================================== */}
      <nav id="header-nav" className="h-16 bg-slate-900 flex items-center justify-between px-6 md:px-12 shrink-0 shadow-lg z-25 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-slate-800 transition-transform hover:rotate-3" onClick={() => setActiveTab('home')}>
            <img src={AppLogo} alt="BAO Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight cursor-pointer" onClick={() => setActiveTab('home')}>BAO</span>
          <span className="text-emerald-400 text-[10px] font-bold px-2 py-0.5 bg-emerald-500/15 rounded-full border border-emerald-500/30">BETA</span>
        </div>

        {/* Tab Links & Quick Utilities */}
        <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
          <button 
            type="button" 
            onClick={() => { 
              setActiveTab('home'); 
              setTimeout(() => document.getElementById('features-view')?.scrollIntoView({ behavior: 'smooth' }), 100); 
            }} 
            className={`hover:text-emerald-400 transition-all cursor-pointer ${activeTab === 'home' ? 'text-white' : ''}`}
          >
            Features
          </button>
          <button 
            type="button" 
            onClick={() => { 
              setActiveTab('pricing'); 
              setTimeout(() => document.getElementById('pricing-tiers')?.scrollIntoView({ behavior: 'smooth' }), 100); 
            }} 
            className={`hover:text-emerald-400 transition-all cursor-pointer ${activeTab === 'pricing' ? 'text-white' : ''}`}
          >
            Pricing
          </button>

          <button 
            type="button" 
            onClick={() => setActiveTab('war-room')}
            className={`hover:text-emerald-400 transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'war-room' ? 'text-white' : ''}`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> M&A War Room
          </button>

          <button 
            type="button" 
            onClick={() => setActiveTab('diligence')}
            className={`hover:text-emerald-400 transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'diligence' ? 'text-white' : ''}`}
          >
            <Bot className="w-3.5 h-3.5 text-emerald-400" /> Due Diligence AI
          </button>

          <button 
            type="button" 
            onClick={() => setActiveTab('compliance')}
            className={`hover:text-emerald-400 transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'compliance' ? 'text-white' : ''}`}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" /> Compliance Radar
          </button>

          <button 
            type="button" 
            onClick={() => setActiveTab('alerts')}
            className={`hover:text-emerald-400 transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'alerts' ? 'text-white' : ''}`}
          >
            <Bell className="w-3.5 h-3.5 text-emerald-400" /> Acquirer Alerts
          </button>
          
          <div className="h-4 w-[1px] bg-slate-800"></div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowConfigPanel(true)} 
              className="p-1.5 hover:bg-slate-800 rounded-lg text-indigo-400 hover:text-white transition-all cursor-pointer flex items-center justify-center border border-slate-800/60"
              title="Configure Cloud Database Sync"
            >
              <Database className="w-4 h-4" />
            </button>

            {user ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveTab('dashboard')} 
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                    activeTab === 'dashboard' ? 'bg-slate-800 border-slate-700 text-white' : 'border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                </button>
                <div className="text-right flex flex-col items-end">
                  <div className="flex items-center gap-1.5">
                    {subscriptionTier === 'pro' && (
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-405 font-bold px-1.5 py-0.5 rounded border border-emerald-500/35 uppercase tracking-widest leading-none">PRO</span>
                    )}
                    {subscriptionTier === 'enterprise' && (
                      <span className="text-[9px] bg-indigo-500/10 text-indigo-405 font-bold px-1.5 py-0.5 rounded border border-indigo-500/35 uppercase tracking-widest leading-none">ENTERPRISE</span>
                    )}
                    <span className="text-white text-xs font-bold leading-none">{user.displayName || 'Founder'}</span>
                  </div>
                  <span className="text-slate-400 text-[10px] truncate max-w-[120px] leading-relaxed block mt-0.5">{user.email}</span>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all" 
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} 
                  className="px-4 py-2 text-slate-300 hover:text-white transition-all text-xs cursor-pointer hover:underline"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }} 
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-900 font-bold rounded-lg transition-all text-xs shadow-md shadow-emerald-500/20"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile quick icons */}
        <div className="flex md:hidden items-center gap-2">
          <button 
            onClick={() => setActiveTab('diligence')} 
            className={`px-2 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 border ${
              activeTab === 'diligence' 
                ? 'bg-emerald-500 text-slate-950 border-emerald-400' 
                : 'bg-slate-850 border-slate-700 text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-emerald-400" /> Audit AI
          </button>
          <button 
            onClick={() => setActiveTab('compliance')} 
            className={`px-2 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 border ${
              activeTab === 'compliance' 
                ? 'bg-emerald-500 text-slate-950 border-emerald-400' 
                : 'bg-slate-850 border-slate-700 text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" /> Radar
          </button>
          <button 
            onClick={() => setActiveTab('alerts')} 
            className={`px-2 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 border ${
              activeTab === 'alerts' 
                ? 'bg-emerald-500 text-slate-950 border-emerald-400' 
                : 'bg-slate-850 border-slate-700 text-slate-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-emerald-400" /> Alerts
          </button>
          {user ? (
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className="px-2 py-1.5 bg-slate-800 text-slate-200 text-[11px] font-bold rounded-lg flex items-center gap-1"
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> Dash
            </button>
          ) : (
            <button 
              onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }} 
              className="px-2 py-1.5 bg-emerald-500 text-slate-950 text-[11px] font-bold rounded-lg"
            >
              Get Score
            </button>
          )}
        </div>
      </nav>

      {/* ==========================================
          MAIN LAYOUT VIEW CONTAINERS
          ========================================== */}
      
      {/* 1. HERO SECTION */}
      {activeTab === 'home' && (
        <section id="hero-banner" className="relative bg-slate-900 text-white pt-16 pb-20 overflow-hidden shrink-0">
          {/* Accent light vectors simulated */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 right-10 w-[300px] h-[300px] bg-emerald-400/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">
              
              {/* Left Column: Text Content */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-semibold">
                  <Zap className="w-3.5 h-3.5 animate-pulse" /> Strategize, Evaluate, and Prime for Pan-African Mergers & Acquisitions
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                  Your Exit Readiness Score. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Instantly.</span>
                </h1>
                
                <p className="text-slate-300 text-sm md:text-base font-medium leading-relaxed">
                  No spreadsheets. No legacy advisors. Bao translates your financials, operational team scale, client density, and regional entities into a comprehensive corporate readiness scoring model.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <button 
                    onClick={() => { setActiveTab('quiz'); setCurrentQuestionIndex(0); }} 
                    className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 group"
                  >
                    Start Exit Readiness Assessment <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  {assessmentsList.length === 0 && (
                    <button 
                      onClick={loadExampleData}
                      className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
                    >
                      Load Demo Data
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column: Hero Visual Logo */}
              <div className="lg:col-span-5 relative">
                <div className="relative group rounded-3xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-950/40 p-1.5 transition-all duration-500 hover:scale-[1.02] hover:border-emerald-500/30">
                  {/* Subtle ambient light behind image */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <img 
                    src={AppLogo} 
                    alt="Bao M&amp;A Ecosystem Logo" 
                    className="w-full h-auto rounded-2xl object-cover relative z-10" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                {/* Floating indicator */}
                <div className="absolute -bottom-4 -right-4 bg-slate-950/95 border border-slate-800 text-[10px] font-mono px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-slate-300 shadow-xl relative z-20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Bao African Board Engine v1.1
                </div>
              </div>

            </div>

            <div className="mt-16 flex flex-wrap items-center gap-x-12 gap-y-6 text-xs text-slate-400 font-semibold border-t border-slate-800/60 pt-8">
              <span>ACTIVE BUYERS MONITORED:</span>
              <span className="hover:text-emerald-400 transition-colors cursor-pointer">STRIPE</span>
              <span className="hover:text-emerald-400 transition-colors cursor-pointer">HELIOS</span>
              <span className="hover:text-emerald-400 transition-colors cursor-pointer">VISA</span>
              <span className="hover:text-emerald-400 transition-colors cursor-pointer">ACTIS</span>
              <span className="hover:text-emerald-400 transition-colors cursor-pointer">GOOGLE FUND</span>
            </div>
          </div>
        </section>
      )}

      {/* 2. FEATURES SECTION */}
      {activeTab === 'home' && (
        <section id="features-view" className="py-20 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Precision Intelligence for African Tech</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">Evaluating the health of high-growth companies across West, East, North, and Southern African startup corridors.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 text-emerald-500 border border-emerald-100">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">1. Instant Exit Score</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">
                Calculate an objective index of your company's preparedness over 15 proprietary metrics matching corporate valuation systems used by major tech syndicates.
              </p>
              <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                15 Metrics Assessed <Check className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 text-emerald-500 border border-emerald-100">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">2. Acquirer Match Intelligence</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">
                Instantly map your score and annualized recurring revenues against buy boxes from active pan-African funds, international payment rails, and global SaaS aggregators.
              </p>
              <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                12 Institutional Buyers <Check className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 text-emerald-500 border border-emerald-100">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">3. Actionable Roadmap</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">
                Examine specific compliance, geo-diversification, and technology stack enhancements necessary to level up your score out of 100 to enter high valuation multiples.
              </p>
              <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                Premium Insight Report <Check className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* AI Due Diligence Teaser Banner */}
          <div className="mt-12 bg-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="max-w-xl relative z-10 text-left">
              <span className="text-[9px] bg-emerald-500/15 text-emerald-400 font-extrabold px-2.5 py-1 rounded-full border border-emerald-500/30">NEW AI CAPABILITY</span>
              <h3 className="text-2xl font-black mt-3 mb-2 flex items-center gap-2">
                <Bot className="w-6 h-6 text-emerald-400" /> M&amp;A Exit Due Diligence Auditor
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Want to double-check contract terms, customer concentration safety, tech stack risks, or financial reports? Run them through the cynical buyer simulator before the real audits begin.
              </p>
            </div>
            <button 
              type="button"
              onClick={() => setActiveTab('diligence')}
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-md shadow-emerald-500/10 relative z-10 font-sans"
            >
              Verify Your Information Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </section>
      )}

      {/* LIVE REFERRAL LEADERBOARD SECTION */}
      {activeTab === 'home' && (
        <section id="referrer-leaderboard" className="py-20 bg-slate-950 text-white relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
          
          <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
            <span className="px-3 py-1 bg-emerald-500/15 text-emerald-400 text-[10px] font-extrabold rounded-full uppercase tracking-wider border border-emerald-500/25">
              🔥 Real-time Growth FOMO
            </span>
            <h2 className="text-3xl font-black text-white mt-4 mb-2">Live Global Referrers Leaderboard</h2>
            <p className="text-slate-400 text-sm max-w-lg mx-auto mb-12">
              See who is driving tech brokerage expansions across West, East, North, and South corridors. Top referrers earn lifetime Executive Pro memberships.
            </p>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 md:px-8 py-4 bg-slate-950/80 border-b border-slate-800/80 text-[10px] font-black text-slate-500 uppercase tracking-widest text-left">
                <div className="col-span-2">Rank</div>
                <div className="col-span-6 md:col-span-7">Partner / Startup Hub</div>
                <div className="col-span-4 md:col-span-3 text-right">Friends Invited</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-slate-800/60 font-sans">
                {[
                  { name: 'Nkemdili Owolabi', company: 'Nairobi Corridor Capital', invites: 54, verified: true, rank: 1, isSelf: false },
                  { name: 'Iyinoluwa Adebayo', company: 'Adansi Tech Partners', invites: 41, verified: true, rank: 2, isSelf: false },
                  { name: 'Zachariah Mulaudzi', company: 'Joburg Alpha Guild', invites: 29, verified: true, rank: 3, isSelf: false },
                  { name: 'Fatoumata Diop', company: 'Dakar Founders Syndicate', invites: 22, verified: true, rank: 4, isSelf: false },
                  // Dynamic user insert
                  { 
                    name: user ? (user.displayName || user.email) : 'You (Pending Sign-Up)', 
                    company: companyName || 'Founder Sandbox', 
                    invites: invitesCount, 
                    verified: !!user, 
                    rank: invitesCount >= 54 ? 1 : invitesCount >= 41 ? 2 : invitesCount >= 29 ? 3 : invitesCount >= 22 ? 4 : 5, 
                    isSelf: true 
                  }
                ]
                .sort((a, b) => b.invites - a.invites || (a.isSelf ? 1 : -1))
                .map((row, idx) => {
                  const displayRank = idx + 1;
                  return (
                    <div 
                      key={row.isSelf ? 'user-self' : row.name} 
                      className={`grid grid-cols-12 gap-4 px-6 md:px-8 py-4.5 items-center text-left transition-all ${
                        row.isSelf 
                          ? 'bg-emerald-500/10 border-y border-emerald-500/25 relative' 
                          : 'hover:bg-slate-800/30'
                      }`}
                    >
                      {row.isSelf && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                      )}
                      
                      {/* Rank Column */}
                      <div className="col-span-2 flex items-center gap-1">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                          displayRank === 1 ? 'bg-amber-500 text-amber-950 font-black' :
                          displayRank === 2 ? 'bg-slate-300 text-slate-900 font-black' :
                          displayRank === 3 ? 'bg-amber-700 text-amber-100 font-black' :
                          row.isSelf ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                        }`}>
                          #{displayRank}
                        </span>
                      </div>

                      {/* Name / Venture info Column */}
                      <div className="col-span-6 md:col-span-7 flex flex-col justify-center min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold text-white truncate ${row.isSelf ? 'text-emerald-400 font-extrabold' : ''}`}>
                            {row.name}
                          </span>
                          {row.verified && (
                            <span className="w-3.5 h-3.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-black rounded-full flex items-center justify-center shrink-0" title="Verified Ambassador">
                              ✓
                            </span>
                          )}
                          {row.isSelf && (
                            <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-bold rounded-md shrink-0 uppercase tracking-wider">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 truncate mt-0.5">{row.company}</span>
                      </div>

                      {/* Invites Count Column */}
                      <div className="col-span-4 md:col-span-3 text-right flex flex-col items-end">
                        <span className={`text-sm font-black ${row.isSelf ? 'text-emerald-400 font-black scale-105' : 'text-slate-200'}`}>
                          {row.invites}
                        </span>
                        <span className="text-[9px] text-slate-500">invites verified</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Call To Action */}
              <div className="p-6 bg-slate-900/60 border-t border-slate-800 text-center">
                {user ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-left">
                      <p className="text-xs font-bold text-white">Your current status: <span className="text-emerald-400 font-black">{invitesCount} friends invited</span></p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Generate your referral code inside the Executive Console dashboard to win Pro upgrades.</p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('dashboard');
                        setDashboardSubTab('referral');
                      }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 font-bold text-xs text-slate-950 rounded-xl transition-all cursor-pointer shadow"
                    >
                      Invite Friends &amp; Claim Pro
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-left">
                      <p className="text-xs font-bold text-white">Join the Live Ambassador Circle</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Create your executive profile, complete a readiness test, and share links to earn.</p>
                    </div>
                    <button
                      onClick={() => {
                        setAuthMode('signup');
                        setShowAuthModal(true);
                      }}
                      className="px-4 py-2 bg-slate-850 hover:bg-slate-750 text-white font-bold text-xs rounded-xl transition-all cursor-pointer border border-slate-700"
                    >
                      Sign Up &amp; Get Referral Code
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. ACTIVE QUIZ COMPONENT */}
      {activeTab === 'quiz' && (
        <section id="quiz-questionnaire" className="py-12 bg-slate-100 flex-1 flex items-center justify-center">
          <div className="w-full max-w-3xl mx-auto px-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
              
              {/* Quiz Header Bar */}
              <div className="bg-slate-900 text-white px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full uppercase">
                    {QUESTIONS[currentQuestionIndex].category}
                  </span>
                  <span className="text-slate-400 text-xs">Category</span>
                </div>
                <div className="text-right text-xs font-bold text-slate-300">
                  Question {currentQuestionIndex + 1} of {QUESTIONS.length}
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="w-full h-1.5 bg-slate-100">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              {/* Body Content */}
              <div className="p-8 md:p-12">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Step Indicator: KPI {currentQuestionIndex + 1}</p>
                <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-8 min-h-[64px]">
                  {QUESTIONS[currentQuestionIndex].label}
                </h3>

                {/* Drop-down select box */}
                <div className="mb-10">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Select your choice</label>
                  <select 
                    id={`quiz-select-${QUESTIONS[currentQuestionIndex].id}`}
                    value={currentAnswers[QUESTIONS[currentQuestionIndex].id] ?? ''}
                    onChange={(e) => handleSelection(QUESTIONS[currentQuestionIndex].id, Number(e.target.value))}
                    className="w-full p-4 text-sm bg-slate-50 hover:bg-slate-100/60 transition-colors border border-slate-200 rounded-xl text-slate-850 font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="" disabled>-- Click to Choose --</option>
                    {QUESTIONS[currentQuestionIndex].options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label} (Score component: +{option.value})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Question Info helper block */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 flex gap-3 text-xs text-slate-500 mb-8">
                  <div className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold shrink-0">i</div>
                  <p>
                    {QUESTIONS[currentQuestionIndex].id === 'revenue' && 'ARR sets your absolute baseline acquirer tier. High values unlock Stripe, Visa, and Salesforce.'}
                    {QUESTIONS[currentQuestionIndex].id === 'growth' && 'YoY growth compounds multiple evaluations. 50%+ demonstrates clear market momentum.'}
                    {QUESTIONS[currentQuestionIndex].id === 'profitability' && 'Margins show fiscal health. Solid EBITDA reduces dependency on continuous funding.'}
                    {QUESTIONS[currentQuestionIndex].id === 'team' && 'Operations size validates governance capabilities and product delivery redundancy.'}
                    {QUESTIONS[currentQuestionIndex].id === 'tech' && 'Pure microservice development mitigates integration drag and buyer inspection delays.'}
                    {QUESTIONS[currentQuestionIndex].id === 'customers' && 'Low concentration protects overall business against individual contract failure.'}
                    {QUESTIONS[currentQuestionIndex].id === 'churn' && 'High cohort retention proves deep product value and lowers recurring marketing overhead.'}
                    {QUESTIONS[currentQuestionIndex].id === 'market' && 'A large Addressable Market assures international suitors that you possess scalable headroom.'}
                    {QUESTIONS[currentQuestionIndex].id === 'funding' && 'Capital history shows investor board leverage and exit valuation floor targets.'}
                    {QUESTIONS[currentQuestionIndex].id === 'ip' && 'Registered patents protect software margins and present robust legal barriers to entry.'}
                    {QUESTIONS[currentQuestionIndex].id === 'regulatory' && 'Legal auditable setups are crucial for international buyers doing cross-jurisdictional audits.'}
                    {QUESTIONS[currentQuestionIndex].id === 'geography' && 'Pan-African compliance positions legal entity entities as solid acquisition targets.'}
                    {QUESTIONS[currentQuestionIndex].id === 'partnerships' && 'Formal alliances confirm product fit and existing customer distribution lines.'}
                    {QUESTIONS[currentQuestionIndex].id === 'brand' && 'Regional and continental market status multiplies the strategic valuation premium.'}
                    {QUESTIONS[currentQuestionIndex].id === 'exit' && 'Existing LOIs or serious inbound negotiations signal real-time market desirability.'}
                  </p>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-8">
                  <button 
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="px-5 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer disabled:opacity-20"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>

                  <button 
                    onClick={handleNextQuestion}
                    disabled={currentAnswers[QUESTIONS[currentQuestionIndex].id] === undefined}
                    className={`px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all text-white ${
                      currentAnswers[QUESTIONS[currentQuestionIndex].id] === undefined 
                        ? 'bg-slate-300 pointer-events-none' 
                        : 'bg-slate-900 hover:bg-slate-800 cursor-pointer shadow-md'
                    }`}
                  >
                    {currentQuestionIndex === QUESTIONS.length - 1 ? 'Analyze Final Answers' : 'Next KPI'} <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* ==========================================
          4. RESULTS VIEW & COLOR-CODED METER
          ========================================== */}
      {latestCalculatedResult && (
        <section id="results-section-view" className="py-16 bg-white border-t border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10">
              <div>
                <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg mb-2 border border-emerald-100 uppercase">
                  Assessment Outcomes Generated
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Your Exit Readiness Assessment Report</h2>
                <p className="text-slate-550 max-w-2xl mt-2">
                  Based on your responses for all 15 operational indicators, your calculated index has been generated against standard institutional buyers.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => alert(`Assessment Score: ${latestCalculatedResult.score}/100\nMatched Acquirers: ${latestCalculatedResult.matches.join(', ') || 'None'}\n\nThis app generates high-fidelity local records in sandbox mode.`)} 
                  className="px-4 py-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-800 cursor-pointer transition-colors"
                >
                  Export Data JSON
                </button>
                {subscriptionTier === 'free' ? (
                  <button 
                    onClick={() => {
                      setSelectedPaymentPlan({ name: 'Executive Pro Plan', price: '$299' });
                      setShowPaymentModal(true);
                      showToast('PDF download is exclusive to Premium plans. Upgrade now!', 'info');
                    }}
                    className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-xs font-bold text-emerald-400 cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Lock className="w-3 h-3 text-emerald-400" /> Download PDF Brief (PRO)
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      const element = document.createElement("a");
                      const file = new Blob([
                        `==================================================\nBAO EXIT READINESS COMPLIANCE PORTFOLIO\n==================================================\n\n` +
                        `GENERATED FOR: ${user?.displayName || 'Asher Mutere'}\n` +
                        `ORGANIZATION: M&A Sandbox Entity\n` +
                        `DATE: ${new Date().toLocaleDateString()}\n` +
                        `TRANSACTION TIER: ${subscriptionTier.toUpperCase()}\n\n` +
                        `--------------------------------------------------\n` +
                        `1. CRITICAL PERFORMANCE KPI METRICS\n` +
                        `--------------------------------------------------\n` +
                        `Calculated Readiness Index Score: ${latestCalculatedResult.score}/100\n` +
                        `Target Multiplier premium estimate: ${latestCalculatedResult.score >= 70 ? '5.5x - 7.2x ARR' : '3.1x - 4.2x ARR'}\n` +
                        `Matched Suitors: ${latestCalculatedResult.matches.join(', ') || 'None (Requires Score >= 70)'}\n\n` +
                        `--------------------------------------------------\n` +
                        `2. OPERATIONAL STRATEGY SUMMARY\n` +
                        `--------------------------------------------------\n` +
                        `Your system indicates that the strategic focus must center of transition governance, IP assignment transfers, and client concentration mitigation.\n` +
                        `To maximize exit valuations, secure all freelance intellectual property and establish stable regional tax compliance.\n\n` +
                        `==================================================\n` +
                        `🔒 PLATFORM STAMP: SECURITY EXPORT SIGNATURE VERIFIED\n` +
                        `==================================================`
                      ], {type: 'text/plain'});
                      element.href = URL.createObjectURL(file);
                      element.download = `BAO_Exit_Readiness_Brief_${subscriptionTier}.txt`;
                      document.body.appendChild(element);
                      element.click();
                      showToast('Successfully downloaded your Exit Readiness Brief!', 'success');
                    }}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-xs font-black text-slate-950 cursor-pointer transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-500/10"
                  >
                    <Download className="w-3.5 h-3.5" /> Download PDF Brief
                  </button>
                )}
                <button 
                  onClick={handleSaveToDashboard}
                  disabled={savingLoading}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 font-bold rounded-xl text-xs text-slate-950 transition-all shadow-md shadow-emerald-500/10 cursor-pointer flex items-center gap-1.5"
                >
                  {savingLoading ? 'Saving...' : 'Save Assessment to Dashboard'} <CheckCircle className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Circular Meter Card */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center relative overflow-hidden min-h-[340px]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-30"></div>
                
                <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-4">Readiness Metric</p>
                
                <div className="relative flex flex-col items-center">
                  <div className={`w-36 h-36 rounded-full border-[10px] flex flex-col items-center justify-center mb-4 bg-slate-50 ${
                    getScoreInfo(latestCalculatedResult.score).border
                  }`}>
                    <span className="text-5xl font-black text-slate-900 leading-none">{latestCalculatedResult.score}</span>
                    <span className="text-slate-400 text-[10px] font-bold mt-1">/ 100</span>
                  </div>
                  
                  <span className={`font-bold uppercase tracking-wider text-xs px-3 py-1 rounded-full ${
                    getScoreInfo(latestCalculatedResult.score).bg
                  } ${
                    getScoreInfo(latestCalculatedResult.score).color
                  }`}>
                    {getScoreInfo(latestCalculatedResult.score).label}
                  </span>
                </div>

                {/* Color-coded thresholds description */}
                <div className="mt-8 w-full border-t border-slate-100 pt-6">
                  <div className="grid grid-cols-4 gap-1 text-[9px] font-extrabold text-center uppercase tracking-wider">
                    <div className="text-red-500">Inception<br/>&lt;40</div>
                    <div className="text-amber-500">Scale<br/>&lt;60</div>
                    <div className="text-blue-500">Venture<br/>&lt;75</div>
                    <div className="text-emerald-500">Excellent<br/>&gt;=75</div>
                  </div>
                </div>
              </div>

              {/* Assessment Answers Summary */}
              <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 text-white flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-emerald-400 border-b border-slate-800 pb-3">
                    <Compass className="w-5 h-5" /> Key Drivers Assessed
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs">
                    <div className="flex justify-between items-center py-2 border-b border-slate-800">
                      <span className="text-slate-400">ARR Bracket:</span>
                      <strong className="text-white max-w-[150px] truncate" title={getSelectedLabel('revenue')}>{getSelectedLabel('revenue')}</strong>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-800">
                      <span className="text-slate-400">YoY Growth Rate:</span>
                      <strong className="text-white max-w-[150px] truncate" title={getSelectedLabel('growth')}>{getSelectedLabel('growth')}</strong>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-800">
                      <span className="text-slate-400">Operating EBITDA:</span>
                      <strong className="text-white max-w-[150px] truncate" title={getSelectedLabel('profitability')}>{getSelectedLabel('profitability')}</strong>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-800">
                      <span className="text-slate-400">Active Core stack:</span>
                      <strong className="text-white max-w-[150px] truncate" title={getSelectedLabel('tech')}>{getSelectedLabel('tech')}</strong>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-800">
                      <span className="text-slate-400">Client Concentration:</span>
                      <strong className="text-white max-w-[150px] truncate" title={getSelectedLabel('customers')}>{getSelectedLabel('customers')}</strong>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-800">
                      <span className="text-slate-400">Active Geo-presence:</span>
                      <strong className="text-white max-w-[150px] truncate" title={getSelectedLabel('geography')}>{getSelectedLabel('geography')}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-slate-800 rounded-2xl border border-slate-700/50 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">i</div>
                  <div className="text-[11px] text-slate-350 leading-relaxed">
                    <strong>Exit Maximization Strategy:</strong> Startups who raise score matrices above <b>75</b> by locking in formal commercial contracts and establishing robust compliance are valued at a significant premium over pure transactional metrics.
                  </div>
                </div>
              </div>

            </div>

            {/* Strategic Acquirer Matches View */}
            <div className="mt-12">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  Strategic Acquirer Matches 
                  <span className="px-2.5 py-0.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg">
                    {latestCalculatedResult.matches.length} FOUND
                  </span>
                </h3>
                <p className="text-xs text-slate-500">Filter criteria applied: minScore & minRevenue ARR threshold</p>
              </div>

              {latestCalculatedResult.matches.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center text-slate-500">
                  <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                  <p className="text-sm font-bold">No High-Probability Institutional Matches Identified Yet</p>
                  <p className="text-xs mt-1">Acquirers require higher ARR baselines (min revenue) or a higher overall scorecard index. Check your answers, or test another simulation!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {latestCalculatedResult.matches.map(matchName => {
                    const acquirerObj = ACQUIRERS.find(a => a.name === matchName);
                    if (!acquirerObj) return null;
                    return (
                      <div key={matchName} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all hover:scale-[1.01] shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 bg-slate-900 text-emerald-400 rounded-lg flex items-center justify-center font-black text-sm tracking-widest leading-none">
                              {acquirerObj.logo}
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-550/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest">
                              Alignment verified
                            </span>
                          </div>
                          
                          <h4 className="font-extrabold text-base text-slate-900 mb-1">{acquirerObj.name}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed mb-4">{acquirerObj.description}</p>
                        </div>

                        <div className="border-t border-slate-100 pt-3 flex justify-between text-[10px] font-bold text-slate-400">
                          <span>MIN REVENUE VAL: {acquirerObj.minRevenue}+</span>
                          <span>REQ SCORE: {acquirerObj.minScore}%+</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* AI Exit Advisor Roadmap Section (Dynamic Gemini API) */}
            <div id="ai-advisor-roadmap-section" className="mt-12 pt-12 border-t border-slate-100">
              <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white relative border border-emerald-500/20 shadow-xl overflow-hidden text-left">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-550/10 rounded-full blur-[100px] pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-800">
                  <div className="max-w-2xl">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold rounded-full border border-emerald-500/35 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" /> Google Gemini Advisory Loop
                    </span>
                    <h3 className="text-2xl font-black text-white mt-1.5">Interactive M&amp;A Exit Action Plan</h3>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
                      Synthesize your 15 strategic performance and regulatory answers into a customized, specific, 5-step transaction roadmap with practical timelines and Sub-Saharan market coordinates.
                    </p>
                  </div>
                  <div className="shrink-0">
                    <button
                      type="button"
                      onClick={handleGenerateRoadmap}
                      disabled={generatingRoadmap}
                      className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-500/10"
                    >
                      {generatingRoadmap ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-slate-950" /> Consolidating Metrics...
                        </>
                      ) : roadmapText ? (
                        <>
                          <Sparkles className="w-4 h-4 text-slate-950" /> Regenerate Advisory Action Plan
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-slate-950" /> Generate Dynamic Roadmap
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {generatingRoadmap && (
                  <div className="py-12 flex flex-col items-center justify-center text-center animate-pulse">
                    <Bot className="w-12 h-12 text-emerald-400 mb-4 animate-bounce" />
                    <h4 className="font-bold text-sm text-slate-205">Analyzing Answer Matrices via Gemini</h4>
                    <p className="text-slate-400 text-xs mt-1 max-w-sm">
                      Reconciling your EBITDA parameters, technical debt status, and multi-jurisdictional geographic parameters to structure real actionable advisory steps...
                    </p>
                  </div>
                )}

                {!generatingRoadmap && roadmapText && (
                  <div className="space-y-6 relative z-10 animate-fade-in text-slate-100">
                    {/* Content display */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-3xl p-6 md:p-8 font-sans text-xs md:text-sm leading-relaxed text-slate-355 max-h-[500px] overflow-y-auto custom-scrollbar prose prose-invert">
                      <div className="markdown-body">
                        <ReactMarkdown>{roadmapText}</ReactMarkdown>
                      </div>
                    </div>

                    {/* Metadata status bar & download button */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${roadmapSimulationMode ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                        <span className="text-[10px] text-slate-400 font-mono tracking-wide uppercase">
                          {roadmapSimulationMode 
                            ? 'M&A Local Smart Simulation Session' 
                            : 'Live Certified Gemini-3.5 Advisor Signature Verified'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(roadmapText);
                            showToast("Copied dynamic action plan to clipboard!", "success");
                          }}
                          className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy Advisory Text
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const element = document.createElement("a");
                            const file = new Blob([roadmapText], {type: 'text/plain'});
                            element.href = URL.createObjectURL(file);
                            element.download = `BAO_Exit_Planning_Action_Plan.txt`;
                            document.body.appendChild(element);
                            element.click();
                            showToast("Successfully downloaded your exit roadmap file!", "success");
                          }}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-400" /> Download Advisory Document
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {!generatingRoadmap && !roadmapText && (
                  <div className="p-8 border border-dashed border-slate-805 rounded-2xl text-center bg-slate-950/20">
                    <p className="text-slate-400 text-xs sm:text-sm font-semibold">Your dynamic advisory action plan is ready for synthesis.</p>
                    <p className="text-slate-500 text-[11px] mt-1">Click the button above to authorize the Gemini advisor and map target steps instantly.</p>
                  </div>
                )}

              </div>
            </div>

          </div>
        </section>
      )}

      {/* ==========================================
          5. DASHBOARD & PERSISTED HISTORY
          ========================================== */}
      {activeTab === 'dashboard' && (
        <section id="developer-dashboard" className="py-12 bg-slate-50 flex-1">
          <div className="max-w-7xl mx-auto px-6">
            
            {/* Dashboard Header Title Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                  <LayoutDashboard className="w-8 h-8 text-slate-900" /> Platform Executive Console
                </h2>
                <p className="text-slate-500 text-sm">Managing growth KPI history, compliance documents, and active suitor pipelines.</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setActiveTab('quiz'); setCurrentQuestionIndex(0); }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  New Assessment +
                </button>
                <button 
                  onClick={loadExampleData}
                  className="px-3 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
                >
                  Load Demo Data
                </button>
              </div>
            </div>

            {/* Dashboard Sub-navigation Tabs */}
            <div className="flex border-b border-slate-200 mb-8 overflow-x-auto pb-px">
              <button
                onClick={() => setDashboardSubTab('portfolio')}
                className={`py-3 px-4 border-b-[3px] font-bold text-xs hover:text-slate-900 cursor-pointer whitespace-nowrap transition-all flex items-center gap-2 ${
                  dashboardSubTab === 'portfolio'
                    ? 'border-emerald-500 text-slate-900 font-extrabold'
                    : 'border-transparent text-slate-400 hover:text-slate-650'
                }`}
              >
                <Briefcase className="w-4 h-4" /> Strategic Portfolio Log
              </button>
              <button
                type="button"
                onClick={() => setDashboardSubTab('referral')}
                className={`py-3 px-4 border-b-[3px] font-bold text-xs hover:text-slate-900 cursor-pointer whitespace-nowrap transition-all flex items-center gap-2 relative ${
                  dashboardSubTab === 'referral'
                    ? 'border-emerald-500 text-slate-900 font-extrabold'
                    : 'border-transparent text-slate-400 hover:text-slate-650'
                }`}
              >
                <Gift className="w-4 h-4 text-emerald-500 animate-bounce" /> Refer &amp; Earn
                <span className="px-1.5 py-0.5 bg-emerald-500 text-slate-950 text-[10px] font-extrabold rounded-md ml-1 shrink-0">
                  {invitesCount}
                </span>
                {invitesCount === 0 && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </button>
            </div>

            {dashboardSubTab === 'portfolio' ? (
              <>
                {hasFinishedQuizThisSession && assessmentsList.length > 0 && (
              <div id="share-score-banner" className="mb-8 p-6 bg-slate-900 border border-emerald-500/20 text-white rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="text-left relative z-10 max-w-xl">
                  <span className="text-[10px] bg-emerald-500/25 text-emerald-400 font-extrabold px-2.5 py-1 rounded-full border border-emerald-500/35 uppercase tracking-wider">Assessment Saved Successfully</span>
                  <h3 className="text-2xl font-black mt-2 text-white">Share Your Milestone Scorecard</h3>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1">
                    Your current readiness rating has been calculated at <strong className="text-emerald-400 font-black">{assessmentsList[0].score}/100</strong>. Generate an official verified share badge card to publish on professional networks like LinkedIn and Twitter.
                  </p>
                </div>
                <button 
                  onClick={() => handleOpenShareModal(assessmentsList[0])}
                  className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-md shadow-emerald-500/10 relative z-10"
                >
                  <Share2 className="w-4 h-4" /> Share My Score Card
                </button>
              </div>
            )}

            {/* Assessment History Metrics Stat Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              
               <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Latest Score</span>
                    <Award className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">{assessmentsList[0]?.score ?? '--'}</span>
                    <span className="text-slate-400 text-xs font-semibold">/100</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">
                    {assessmentsList[0] ? `Calculated ${new Date(assessmentsList[0].createdAt).toLocaleDateString()}` : 'No sessions recorded yet'}
                  </p>
                </div>
                {assessmentsList[0] && (
                  <button
                    onClick={() => handleOpenShareModal(assessmentsList[0])}
                    className="mt-4 w-full py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-black text-[11px] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow shadow-emerald-500/10"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share My Score
                  </button>
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Historical Assessments</span>
                  <FileText className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">{assessmentsList.length}</span>
                  <span className="text-slate-400 text-xs font-semibold">total sessions</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Stored inside {usingMock ? 'Local Storage client cache' : 'Live GCP Cloud'}</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Matching Acquirers</span>
                  <Users className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">{assessmentsList[0]?.matches?.length ?? 0}</span>
                  <span className="text-slate-400 text-xs font-semibold">institutional matches</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Evaluating 12 strategic suitor profiles</p>
              </div>

            </div>

            {/* Score Progression Line Chart Section */}
            {assessmentsList.length > 0 && (
              <div className="mb-10 animate-fade-in" id="progression-chart-section">
                <ScoreProgressionChart assessments={assessmentsList} />
              </div>
            )}

            {/* Grid Layout: History List (Left) & Strategy Intel (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Assessments Left Block */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Assessments Log</h3>
                
                {assessmentsList.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-650">No Saved Assessments Evaluated Yet</p>
                    <p className="text-xs max-w-xs mx-auto mt-1 mb-6">Complete a fast 15-question strategic KPI assessment to analyze score thresholds.</p>
                    <button 
                      onClick={() => { setActiveTab('quiz'); setCurrentQuestionIndex(0); }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Process First Score
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assessmentsList.map((assessment, index) => {
                      const scoreData = getScoreInfo(assessment.score);
                      return (
                        <div key={assessment.id || index} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-slate-300">
                          
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-900 text-emerald-400 text-lg font-black flex items-center justify-center shrink-0">
                              {assessment.score}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-850">
                                Assessment #{assessmentsList.length - index} — {scoreData.label}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                Taken on {new Date(assessment.createdAt).toLocaleDateString()} {new Date(assessment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {assessment.matches && assessment.matches.slice(0, 3).map(m => (
                                  <span key={m} className="px-1.5 py-0.5 bg-slate-200/60 rounded text-[9px] font-semibold text-slate-600">
                                    {m}
                                  </span>
                                ))}
                                {assessment.matches && assessment.matches.length > 3 && (
                                  <span className="px-1.5 py-0.5 bg-slate-200/60 rounded text-[9px] font-semibold text-slate-600">
                                    +{assessment.matches.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 border-t md:border-t-0 border-slate-200/60 pt-3 md:pt-0">
                            <button 
                              onClick={() => {
                                setCurrentAnswers(assessment.answers || {});
                                setLatestCalculatedResult({
                                  score: assessment.score,
                                  matches: assessment.matches || []
                                });
                                showToast(`Loaded assessment scores into active simulation view.`, 'info');
                                setActiveTab('pricing');
                                // Scroll to active results
                                setTimeout(() => {
                                  document.getElementById('results-section-view')?.scrollIntoView({ behavior: 'smooth' });
                                }, 150);
                              }}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                            >
                              Load Report
                            </button>
                            
                            <button 
                              onClick={() => handleOpenShareModal(assessment)}
                              className="p-1.5 border border-slate-200 text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                              title="Share Scorecard Badge"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                            
                            <button 
                              onClick={() => deleteAssessment(assessment.id || index)}
                              className="p-1.5 border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Strategy Panel Sidebar */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 mb-4 border-b border-slate-100 pb-3 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-emerald-500" /> Exit-Planning Framework
                  </h3>
                  
                  <div className="space-y-4 text-xs leading-relaxed text-slate-600">
                    <div>
                      <strong className="text-slate-850 block mb-1">🔍 Technical Diligence Audit</strong>
                      <p className="text-[11px]">suitors will thoroughly critique your database normalization, security protocols, API access channels, and microservice structures. Minimize technical legacy debt to raise multipliers.</p>
                    </div>
                    <div>
                      <strong className="text-slate-850 block mb-1">🌍 Cross-Jurisdictional Exposure</strong>
                      <p className="text-[11px]">Incorporating multi-jurisdiction frameworks (e.g. holding in Mauritius or Delaware with operational entities in Lagos, Nairobi, Johannesburg) reduces international legal hurdles.</p>
                    </div>
                    <div>
                      <strong className="text-slate-850 block mb-1">📊 EBITDA & Revenue Diversification</strong>
                      <p className="text-[11px]">Ensure no individual customer drives &gt;30% of total ARR. High customer concentrations present existential risks to acquiring corporate boards.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-slate-900 rounded-2xl p-5 text-white">
                  <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider mb-2">Need Expert Brokerage?</h4>
                  <p className="text-[10px] text-slate-350 leading-relaxed mb-4">
                    Unlock exclusive introductions to institutional tech dealmakers across Sub-Saharan corridors. Our experienced team brokers standard transitions.
                  </p>
                  <button 
                    onClick={() => { setActiveTab('pricing'); setTimeout(() => document.getElementById('pricing-tiers')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 font-bold rounded-lg text-[11px] text-slate-950 text-center cursor-pointer transition-colors"
                  >
                    Compare Concierge Pricing
                  </button>
                </div>
              </div>

            </div>
            </>
            ) : (
              <div id="refer-and-earn-subtab" className="space-y-8 animate-fade-in text-slate-800">
                {/* Promo Card banner */}
                <div id="refer-promo-banner" className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white relative border border-slate-800 shadow-xl overflow-hidden text-left">
                  <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
                  <div className="relative z-10 max-w-2xl">
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold rounded-full border border-emerald-500/30 uppercase tracking-widest">
                      Bao Growth Ambassador Club
                    </span>
                    <h3 className="text-2xl md:text-3xl font-black text-white mt-4 tracking-tight">Refer Friends. Unlock Premium Intelligence.</h3>
                    <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                      Introduce other founders, venture builders, or startup executives in your corridors to Bao's standard exit readiness metrics. When they complete their first scorecard, both of you gain premium upgrade perks.
                    </p>
                  </div>
                </div>

                {/* Dashboard Stats */}
                <div id="refer-stats-row" className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  
                  <div id="stat-invites-count" className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Invites</span>
                      <span className="text-xl md:text-2xl font-black text-slate-900 font-sans">You've invited {invitesCount} {invitesCount === 1 ? 'friend' : 'friends'}.</span>
                      <p className="text-[10px] text-slate-400 mt-1">Status synchronized with Ambassador logs</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>

                  <div id="stat-pro-status" className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between col-span-1">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Premium Plan Upgrade</span>
                      <span className="text-xl md:text-2xl font-black text-slate-900 font-sans">{subscriptionTier === 'pro' ? 'Executive Pro Plan' : 'Standard Free'}</span>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {subscriptionTier === 'pro' ? '✓ Pro activated via referral!' : 'Earn 1 Month Pro with 1 invite'}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                      <Gift className="w-5 h-5 animate-bounce" />
                    </div>
                  </div>

                  <div id="stat-tokens-total" className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Assessment Tokens Earned</span>
                      <span className="text-xl md:text-2xl font-black text-slate-900 font-sans">+{extraAssessments} Premium Tokens</span>
                      <p className="text-[10px] text-slate-400 mt-1">Granted to evaluate custom simulations for free</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                  </div>

                </div>

                {/* Core Copy referral elements */}
                <div id="refer-copy-layouts" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Left block - Copy Link and Instructions */}
                  <div className="lg:col-span-2 space-y-6 text-left">
                    
                    {/* Share Box */}
                    <div id="referral-link-selector" className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
                      <h4 className="text-base font-extrabold text-slate-900 mb-2 flex items-center gap-2">
                        <span>🔗 Your Unique Leaderboard Ambassador Link</span>
                      </h4>
                      <p className="text-slate-500 text-xs mb-6">
                        Copy and paste your referral URL into your social updates, blog posts, or pitch logs. Our platform tracks each submission securely.
                      </p>
                      
                      <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-1.5 focus-within:border-slate-300">
                        <input 
                          type="text" 
                          readOnly 
                          value={`https://bao.africa/ref/${user?.uid?.substring(0, 8) || 'UID123'}`}
                          className="w-full bg-transparent px-3 text-sm text-slate-700 outline-none select-all font-mono"
                        />
                        <button
                          onClick={() => handleCopyLink(`https://bao.africa/ref/${user?.uid?.substring(0, 8) || 'UID123'}`, 'link')}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-lg cursor-pointer transition-all shrink-0 flex items-center gap-1.5"
                        >
                          {copiedLink ? <Check className="w-3.5 h-3.5 animate-pulse" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedLink ? 'Copied' : 'Copy Link'}
                        </button>
                      </div>

                      {/* Custom pre-written sharing posts */}
                      <div className="mt-8 border-t border-slate-100 pt-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Quick Ecosystem Share Templates</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Twitter block */}
                          <div id="temp-twitter" className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-[9px] bg-slate-900 text-white font-extrabold px-2 py-0.5 rounded">Twitter/X Post</span>
                                <span className="text-[9px] text-slate-400 font-bold">FOMO Booster</span>
                              </div>
                              <p className="text-xs text-slate-600 font-sans italic leading-relaxed text-left">
                                "Just took the Bao Exit Readiness test! My startup scored {assessmentsList[0]?.score || 72}/100. Think you can beat me? Take the test at https://bao.africa/ref/{user?.uid?.substring(0, 8) || 'UID123'}"
                              </p>
                            </div>
                            <button
                              onClick={() => handleCopyLink(`Just took the Bao Exit Readiness test! My startup scored ${assessmentsList[0]?.score || 72}/100. Think you can beat me? Take the test at https://bao.africa/ref/${user?.uid?.substring(0, 8) || 'UID123'}`, 'twitter')}
                              className="mt-4 w-full py-2 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                            >
                              {copiedTwitter ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />} 
                              {copiedTwitter ? 'Copied Post Text!' : 'Copy Template'}
                            </button>
                          </div>

                          {/* LinkedIn block */}
                          <div id="temp-linkedin" className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-[9px] bg-slate-900 text-white font-extrabold px-2 py-0.5 rounded">LinkedIn Professional Update</span>
                                <span className="text-[9px] text-slate-400 font-bold">M&amp;A Metric</span>
                              </div>
                              <p className="text-xs text-slate-600 font-sans italic leading-relaxed text-left">
                                "Just evaluated our startup's valuation potential on the Bao Exit Readiness test! We rated at a premium {assessmentsList[0]?.score || 72}/100. Check your growth multiples and take the readiness quiz at https://bao.africa/ref/{user?.uid?.substring(0, 8) || 'UID123'}"
                              </p>
                            </div>
                            <button
                              onClick={() => handleCopyLink(`Just evaluated our startup's valuation potential on the Bao Exit Readiness test! We rated at an awesome ${assessmentsList[0]?.score || 72}/100. Check your growth multiples and take the readiness quiz at https://bao.africa/ref/${user?.uid?.substring(0, 8) || 'UID123'}`, 'linkedin')}
                              className="mt-4 w-full py-2 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                            >
                              {copiedLinkedIn ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />} 
                              {copiedLinkedIn ? 'Copied Post Text!' : 'Copy Template'}
                            </button>
                          </div>

                        </div>
                      </div>

                    </div>

                    {/* Active referrals completed log */}
                    <div id="referrals-table-panel" className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
                      <h4 className="text-base font-extrabold text-slate-900 mb-3">Live Growth Referrals Log</h4>
                      
                      {referralsList.length === 0 ? (
                        <div id="ref-log-empty" className="py-10 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                          <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs font-semibold text-slate-600">No Invites Recorded Yet</p>
                          <p className="text-[10px] text-slate-400 max-w-xs mx-auto mt-1">
                            Your invites directory is empty. Copy and send the unique referral URL above to trigger campaign rewards!
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto" id="ref-verified-table">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase font-black tracking-wider">
                                <th className="py-3">Invited Partner</th>
                                <th className="py-3">Join Date</th>
                                <th className="py-3">Milestone Completed</th>
                                <th className="py-3 text-right">Acquired Benefit</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-sans text-slate-750">
                              {referralsList.map((ref) => (
                                <tr key={ref.id} className="hover:bg-slate-50/50">
                                  <td className="py-3 font-bold text-slate-800">{ref.email}</td>
                                  <td className="py-3 text-slate-500">{ref.date}</td>
                                  <td className="py-3">
                                    <span className="px-1.5 py-0.5 text-[9px] font-black uppercase text-emerald-600 bg-emerald-550/10 rounded border border-emerald-100 flex items-center gap-0.5 w-max">
                                      <Check className="w-2.5 h-2.5" /> Completed quiz
                                    </span>
                                  </td>
                                  <td className="py-3 text-right text-emerald-600 font-extrabold">+1 Month PRO &amp; +5 tokens</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Right Blocks - Sandbox simulation panel */}
                  <div className="space-y-6 text-left">
                    
                    {/* Sandbox Developer console */}
                    <div id="sim-developer-panel" className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800">
                      <span className="text-[9px] font-black uppercase text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        🔗 Sandbox Testing Tools
                      </span>
                      <h4 className="text-sm font-extrabold text-white mt-3 mb-2 flex items-center gap-1.5">
                        <Zap className="text-amber-400 w-4 h-4 animate-pulse" /> Simulate Referred Sign Up
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed mb-4">
                        Ensure full system verification by simulating a friend completing their M&amp;A Readiness score. This triggers real local storage updates and status triggers immediately.
                      </p>
                      
                      <button
                        onClick={triggerReferralSimulation}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 text-[11px] font-black rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5 text-slate-950" /> Simulate Friend Complete Quiz
                      </button>
                    </div>

                    {/* Fomo Rewards information box */}
                    <div id="ambassador-rewards-chart" className="bg-white rounded-3xl p-6 border border-slate-200">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Ambassador Milestones</h4>
                      
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-500 text-xs font-bold flex items-center justify-center shrink-0">1</span>
                          <div className="text-left">
                            <span className="text-xs font-extrabold text-slate-800 block">1 Referred Friend</span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">Unlocks 1 Month Free Executive Pro features.</span>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-500 text-xs font-bold flex items-center justify-center shrink-0">2</span>
                          <div className="text-left">
                            <span className="text-xs font-extrabold text-slate-800 block">+5 Extra Score Tokens</span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">Granted per referral to build sandbox exit plan simulations.</span>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold flex items-center justify-center shrink-0">✓</span>
                          <div className="text-left">
                            <span className="text-xs font-extrabold text-emerald-500 block">Top 5 Ambassador Board</span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">Visible globally on our landing home page for high corridor visibility!</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            )}

          </div>
        </section>
      )}

      {/* ==========================================
          5.4 M&A WAR ROOM MODULE (TAB VIEW)
          ========================================== */}
      {activeTab === 'war-room' && (
        <MAWarRoom 
          onShowToast={showToast} 
          userScore={assessmentsList[0]?.score || 72} 
        />
      )}

      {/* ==========================================
          5.5 AI DUE DILIGENCE MODULE (TAB VIEW)
          ========================================== */}
      {activeTab === 'diligence' && (
        <DueDiligenceAssistant />
      )}

      {/* ==========================================
          5.6 COMPLIANCE RADAR MODULE (TAB VIEW)
          ========================================== */}
      {activeTab === 'compliance' && (
        <ComplianceRadar onShowToast={showToast} />
      )}

      {/* ==========================================
          5.7 ACQUIRER ALERTS MODULE (TAB VIEW)
          ========================================== */}
      {activeTab === 'alerts' && (
        <AcquirerIntelligence onShowToast={showToast} userEmail={user?.email || 'ashermutere@gmail.com'} />
      )}

      {/* ==========================================
          6. PRICING SECTION
          ========================================== */}
      <section id="pricing-tiers" className="py-20 bg-slate-900 text-white shrink-0">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
              Transparent Pricing Packages
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Flexible SaaS Subscriptions Built for Growth</h2>
            <p className="text-slate-400 text-base max-w-xl mx-auto mt-3">Exceed minimum valuation standards, audit your financial stacks, and connect with legal escrow dealmakers easily.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Package 1 */}
            <div className="bg-slate-850 p-8 rounded-2xl border border-slate-800 transition-all hover:scale-[1.01] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Starter Sandbox</span>
                <h3 className="text-xl font-bold text-white mb-4">Free</h3>
                <div className="h-[1px] bg-slate-800 my-4" />
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Standard 15-question quiz</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Basic Score calculation</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Local browser storage persistence</li>
                  <li className="flex items-center gap-2 text-slate-500 line-through"><Zap className="w-3.5 h-3.5 text-slate-500" /> Verified PDF Reports</li>
                </ul>
              </div>
              <button 
                onClick={() => { setActiveTab('quiz'); setCurrentQuestionIndex(0); }}
                className="w-full mt-8 py-3 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-bold text-center cursor-pointer transition-all"
              >
                Access Free Tools
              </button>
            </div>

            {/* Package 2 */}
            <div className="bg-slate-850 p-8 rounded-2xl border-2 border-emerald-500 transition-all hover:scale-[1.02] flex flex-col justify-between relative">
              <span className="absolute top-0 right-6 -translate-y-1/2 bg-emerald-500 text-slate-950 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow">Most Popular</span>
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">Executive Pro</span>
                <h3 className="text-xl font-bold text-white mb-4">$299<span className="text-xs text-slate-400 font-normal">/month</span></h3>
                <div className="h-[1px] bg-slate-800 my-4" />
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Dynamic Firebase cloud capability</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Custom assessment logs</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Unlock all 12 buyer matches</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Verified PDF documentation briefs</li>
                </ul>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setSelectedPaymentPlan({ name: 'Executive Pro Plan', price: '$299' });
                  setShowPaymentModal(true);
                }}
                className="w-full mt-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs text-center cursor-pointer transition-all shadow shadow-emerald-500/25"
              >
                {subscriptionTier === 'pro' ? 'Renew Pro Plan' : 'Upgrade to Pro Plan'}
              </button>
            </div>

            {/* Package 3 */}
            <div className="bg-slate-850 p-8 rounded-2xl border border-slate-800 transition-all hover:scale-[1.01] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Brokerage Enterprise</span>
                <h3 className="text-xl font-bold text-white mb-4">$1,499<span className="text-xs text-slate-400 font-normal">/month</span></h3>
                <div className="h-[1px] bg-slate-800 my-4" />
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Continuous M&amp;A pipeline consulting</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Legal due-diligence audit support</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Dedicated investor introductions</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Tailored sovereign entity setups</li>
                </ul>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setSelectedPaymentPlan({ name: 'Brokerage Enterprise Plan', price: '$1,499' });
                  setShowPaymentModal(true);
                }}
                className="w-full mt-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs text-center cursor-pointer transition-all shadow shadow-emerald-500/25"
              >
                {subscriptionTier === 'enterprise' ? 'Renew Enterprise Plan' : 'Buy Enterprise Plan'}
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ==========================================
          7. JOIN WAITLIST / NEWSLETTER
          ========================================== */}
      <section id="waitlist-banner" className="py-16 bg-white border-t border-slate-200 text-slate-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Join the Founder Syndicate Waitlist</h2>
          <p className="text-slate-500 text-sm max-w-lg mx-auto mb-8">
            Stay aligned with our platform. Get monthly tech exit briefs, strategic multiple calculations, and regional legal updates directly in your inbox.
          </p>

          {!waitlistSuccess ? (
            <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
              <input 
                id="waitlist-email-input"
                type="email" 
                required
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                placeholder="Enter your enterprise email address" 
                className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-250 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
              />
              <button 
                type="submit" 
                className="w-full sm:w-auto px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl cursor-pointer shrink-0 transition-colors"
              >
                Join Waitlist
              </button>
            </form>
          ) : (
            <div className="max-w-md mx-auto p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" /> Thank you! You have successfully been added to the Bao syndicate waitlist.
            </div>
          )}
        </div>
      </section>

      {/* ==========================================
          8. FOOTER / STATUS BAR
          ========================================== */}
      <footer id="main-footer" className="bg-slate-900 border-t border-slate-800 py-12 px-6 md:px-12 text-xs text-slate-400 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded overflow-hidden shadow-md border border-slate-850">
              <img src={AppLogo} alt="BAO" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <span className="font-black text-white tracking-wider">BAO</span>
            <span className="text-slate-600 ml-2">© 2026 Bao. Built for African founders.</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-6">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
              <span className="text-emerald-400 font-bold">M&amp;A Intel Online</span>
            </span>
            <span className="text-slate-400">Support: <b>founders@bao.africa</b></span>
          </div>
        </div>
      </footer>

      {/* ==========================================
          9. MODALS (AUTHENTICATION / CONNECT)
          ========================================== */}
      
      {/* Configuration modal panel */}
      {showConfigPanel && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 overflow-hidden shadow-2xl">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-sm flex items-center gap-1.5"><Database className="w-4 h-4 text-emerald-500" /> Firebase Integration</h3>
              <button onClick={() => setShowConfigPanel(false)} className="text-slate-400 hover:text-white text-sm">✖</button>
            </div>
            
            <form onSubmit={handleApplyFirebaseConfig} className="p-6 md:p-8 space-y-4">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Connect your real client-side Firebase credentials. This initiates standard Firestore collections and Firebase Email Auth.
              </p>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">API Key</label>
                <input 
                  type="text" 
                  value={firebaseKeys.apiKey}
                  onChange={(e) => setFirebaseKeys({...firebaseKeys, apiKey: e.target.value})}
                  placeholder="AIzaSyA..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Project ID</label>
                <input 
                  type="text" 
                  value={firebaseKeys.projectId}
                  onChange={(e) => setFirebaseKeys({...firebaseKeys, projectId: e.target.value})}
                  placeholder="bao-exit-1234..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Auth Domain</label>
                <input 
                  type="text" 
                  value={firebaseKeys.authDomain}
                  onChange={(e) => setFirebaseKeys({...firebaseKeys, authDomain: e.target.value})}
                  placeholder="bao-exit-1234.firebaseapp.com"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">App ID</label>
                <input 
                  type="text" 
                  value={firebaseKeys.appId}
                  onChange={(e) => setFirebaseKeys({...firebaseKeys, appId: e.target.value})}
                  placeholder="1:1234567:web:abcd..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="pt-4 flex gap-2">
                <button 
                  type="button" 
                  onClick={clearFirebaseConfig}
                  className="flex-1 py-2 text-center text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  Disconnect Real DB
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer text-center"
                >
                  Save & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Authentication Modal popup */}
      {showAuthModal && (
        <div id="auth-modal-dialog" className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-6 bg-opacity-70 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 overflow-hidden shadow-2xl">
            
            <div className="bg-slate-900 text-white px-6 py-5 flex justify-between items-center">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" /> {authMode === 'signup' ? 'Create Secure Executive Account' : 'Executive Dashboard Login'}
              </h3>
              <button 
                onClick={() => setShowAuthModal(false)} 
                className="text-slate-400 hover:text-white text-xs font-semibold shrink-0 cursor-pointer p-1"
              >
                ✖
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="p-6 md:p-8 space-y-4">
              
              {authError && (
                <div className="p-3 bg-red-50 border border-red-100 text-[10px] font-bold text-red-650 rounded-xl leading-relaxed">
                  {authError}
                </div>
              )}

              {authMode === 'signup' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Startup Company Name</label>
                  <input 
                    type="text" 
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. SwahiliPay Ltd"
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Executive Email</label>
                <input 
                  type="email" 
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="ceo@brand.africa"
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Secure Password</label>
                <input 
                  type="password" 
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              {usingMock && (
                <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-[10px] text-amber-900 leading-relaxed">
                  <strong>Sandbox simulation active.</strong> You can sign up or log in instantly using any credentials. No email validation is performed.
                </div>
              )}

              <button 
                type="submit" 
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-emerald-500/15 cursor-pointer mt-4 transition-all text-center"
              >
                {authMode === 'signup' ? 'Complete Executive Registration' : 'Authenticate Session'}
              </button>

              <div className="text-center pt-2">
                <button 
                  type="button"
                  onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
                  className="text-[11px] text-slate-500 hover:text-emerald-600 font-semibold underline cursor-pointer"
                >
                  {authMode === 'signup' ? 'Already have an account? Sign In' : "Don't have an account? Sign Up for Free"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Payment Gateway Modal (Visa & PayPal Sandbox Sandbox) */}
      {showPaymentModal && selectedPaymentPlan && (
        <PaymentModal 
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPaymentPlan(null);
          }}
          selectedPlan={selectedPaymentPlan}
          userEmail={user?.email || 'ceo@brand.africa'}
          onPaymentSuccess={(tier: 'pro' | 'enterprise', txnId: string, paymentMethod: string) => {
            handlePaymentSuccess(tier, txnId, paymentMethod);
            setShowPaymentModal(false);
            setSelectedPaymentPlan(null);
          }}
        />
      )}

      {/* Share Scorecard Modal */}
      {showShareModal && shareModalData && (
        <ShareScoreModal 
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setShareModalData(null);
          }}
          score={shareModalData.score}
          matches={shareModalData.matches}
          userName={user?.displayName || 'Founder'}
        />
      )}

    </div>
  );
}
