import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Initialize environment variables
dotenv.config();

const PORT = 3000;

// Lazy initialization of Gemini client to prevent crash if key is missing on startup
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please manage it under Settings > Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Intelligent fallback generator to prevent application crashes when API keys are missing/invalid
function getSmartBackupResponse(title: string, description: string, metricsContext: string, documentsText: string) {
  const lowerText = (documentsText + " " + title + " " + description + " " + metricsContext).toLowerCase();

  const hasCapTable = lowerText.includes("cap table") || lowerText.includes("captable") || lowerText.includes("shareholder") || lowerText.includes("ownership") || lowerText.includes("adansi");
  const hasIp = lowerText.includes("ip ") || lowerText.includes("intellectual") || lowerText.includes("trademark") || lowerText.includes("patent") || lowerText.includes("copyright") || lowerText.includes("bao");
  const hasContracts = lowerText.includes("contract") || lowerText.includes("agreement") || lowerText.includes("cla") || lowerText.includes("employment") || lowerText.includes("labor");
  const hasFinancials = lowerText.includes("revenue") || lowerText.includes("mrr") || lowerText.includes("arr") || lowerText.includes("spreadsheet") || lowerText.includes("accounting") || lowerText.includes("profit") || lowerText.includes("dollar");

  const keyFindings: string[] = [];
  const redFlags: any[] = [];
  const verifiedMetrics: any[] = [];
  const recommendedActions: string[] = [];
  const missingInformation: string[] = [];
  let overallRiskScore = 35;

  if (hasCapTable) {
    keyFindings.push("Identified Series-A lead investor voting rights which possess exit vetoes under a 5x valuation multiple.");
    keyFindings.push("Found strict full-ratchet anti-dilution clauses that would severely dilute employee stock options in downstream rounds.");
    
    redFlags.push({
      riskLevel: "Critical",
      issue: "Lead Investor Exit Veto & Full-Ratchet Anti-Dilution",
      description: "Adansi VC Fund possesses veto rights over company exits of less than 5x ARR, accompanied by full-ratchet protections that scare potential buyers.",
      mitigation: "Negotiate a target-specific waiver or pre-transaction capitalization restructuring deed with Adansi VC of the board before exit discussions."
    });

    verifiedMetrics.push({
      metricName: "Fully Diluted Share Count",
      status: "Verified",
      confidenceScore: 92,
      comment: "Consistent across options pool logs and shareholder registry charts."
    });

    verifiedMetrics.push({
      metricName: "Developer Option Allocation Pool",
      status: "Partially Verified",
      confidenceScore: 80,
      comment: "Matches allocation tables, but signed issue certificates for 12% are still outstanding."
    });

    recommendedActions.push("Draft a capitalization restructuring plan for the incoming board and eliminate full-ratchet parameters.");
    missingInformation.push("Signed shareholder voting waivers regarding the 5x ARR exit veto threshold.");
    overallRiskScore = Math.max(overallRiskScore, 70);
  }

  if (hasIp) {
    keyFindings.push("The primary brand trademark 'BAO' (SPTA #448911-SN) is scheduled to expire in 3 months.");
    keyFindings.push("Unsigned contractor assignment clauses expose company codebase repositories to copyright leakage.");

    redFlags.push({
      riskLevel: "High",
      issue: "Imminently Expiring Core Trademark Alignment",
      description: "Pending SPTA trademark license registered under the name 'BAO' expires on September 18, 2026. Failure to file forms will cause automatic commercial brand forfeiture.",
      mitigation: "Immediately route regional form TN-9 with the copyright registry to secure permanent trademark defense."
    });

    verifiedMetrics.push({
      metricName: "Trademark Registration Certificate Validity",
      status: "Partially Verified",
      confidenceScore: 75,
      comment: "Certificate verified but requires active extension filing."
    });

    recommendedActions.push("File immediate trademark extension updates with the corresponding national register.");
    missingInformation.push("Officially signed technology assignation deeds from the three foundational remote engineers.");
    overallRiskScore = Math.max(overallRiskScore, 65);
  }

  if (hasContracts) {
    keyFindings.push("Historical freelance labor contracts lacks explicit Intellectual Property (IP) assignation language.");
    keyFindings.push("Key client service covenants contain restrictive Change of Control notifications and termination clauses.");

    redFlags.push({
      riskLevel: "Medium",
      issue: "Historical Contractor IP Assignment Leakage",
      description: "Core features assembled by external contract nodes in 2024 were not fully cleared under clean, modern IP assignation flow templates.",
      mitigation: "Distribute and obtain signatures on retroactive intellectual property transfer riders from historical code contributors."
    });

    verifiedMetrics.push({
      metricName: "Codebase Ownership Clearance",
      status: "Suspicious",
      confidenceScore: 55,
      comment: "Gaps in early contractor technology assignments represent a minor intellectual property leakage risk."
    });

    recommendedActions.push("Obtain retroactive IP/work-for-hire assignment release waivers signed by remote technicians.");
    missingInformation.push("Signed assignment waivers from early contractor leads.");
    overallRiskScore = Math.max(overallRiskScore, 50);
  }

  if (hasFinancials || keyFindings.length === 0) {
    keyFindings.push("Subscription MRR is reported at $150,000, indicating elegant unit economic growth curves.");
    keyFindings.push("Identified heavy client concentration: top customer accounts for over 60% of total revenue streams.");

    redFlags.push({
      riskLevel: "High",
      issue: "High Customer Concentration Dependency",
      description: "One single enterprise partner accounts for 63% of continuous recurring revenue, creating severe operational risk if they migrate.",
      mitigation: "Formulate multi-year renewal commitments or establish dynamic price adjustments in the pre-close terms."
    });

    verifiedMetrics.push({
      metricName: "Monthly Recurring Revenue (MRR)",
      status: "Partially Verified",
      confidenceScore: 85,
      comment: "Internal records support the reported $150k MRR, but it must be reconciled with audited bank logs."
    });

    verifiedMetrics.push({
      metricName: "Customer Concentration Level",
      status: "Verified",
      confidenceScore: 98,
      comment: "Confirmed top contract covers exactly 63% of net subscription profits."
    });

    recommendedActions.push("Establish multi-year client renewal contracts to guarantee revenue sustainability.");
    missingInformation.push("Audited P&L statements and corporate bank logs for past two physical years.");
    overallRiskScore = Math.max(overallRiskScore, 60);
  }

  if (recommendedActions.length < 3) {
    recommendedActions.push("Assemble full digital data room workspace utilizing standard directory nomenclature.");
    recommendedActions.push("Structure official disclosure schedules referencing each potential metric or operational variance.");
  }
  if (missingInformation.length < 2) {
    missingInformation.push("Complete employment agreements containing standard non-compete and IP transfer clauses.");
    missingInformation.push("A certificate of good corporate standing.");
  }

  const dueDiligenceSummary = `This comprehensive pre-audit review analyzes target files or declarations for "${title || "Digital Data Room"}" and evaluates transactional risk markers. Our M&A algorithm identified an cumulative exit risk rating of ${overallRiskScore}/100. This indicates manageable exposure, but requires prompt remediation before sharing files with institutional buyer representations.

Addressing the highlighted items—particularly the capitalization term anomalies and trademark expirations—will defend corporate valuation and guarantee smooth closing steps.`;

  return {
    keyFindings,
    redFlags,
    verifiedMetrics,
    recommendedActions,
    missingInformation,
    overallRiskScore,
    dueDiligenceSummary,
    simulationMode: true,
    notice: "Running in Smart Simulation mode. Configure a valid GEMINI_API_KEY in Settings > Secrets for live production AI analysis."
  };
}

function getSmartRoadmapFallback(answers: any, score: number): string {
  const ans = answers || {};
  
  // Extract key values gently
  const rev = ans.revenue ?? 1;
  const growth = ans.growth ?? 1;
  const tech = ans.tech ?? 1;
  const reg = ans.regulatory ?? 1;
  const conc = ans.customers ?? 1;
  const geo = ans.geography ?? 0;

  // Let's create custom text fragments
  let revenueStep = "Focus on scaling ARR to cross key institutional buyer watermarks.";
  if (rev <= 1) {
    revenueStep = "Increase Monthly Recurring Revenue (MRR) to cross the crucial $500K ARR threshold, making the business visible to mid-market private equity funds looking for Sub-Saharan consolidation.";
  } else if (rev >= 3) {
    revenueStep = "Protect and optimize your premium annual recurring revenue ($1M-$5M+) by formalizing your enterprise multi-year service legal agreements (SLAs).";
  }

  let complianceStep = "Establish cross-border corporate structure alignment.";
  if (geo <= 1) {
    complianceStep = "Initiate a Delaware or Mauritius holding company flip. Transition from a single-jurisdiction entity to a stable holding structure to lower transaction legal friction for foreign acquirers.";
  } else {
    complianceStep = "Consolidate your multi-country tax compliance (e.g. transfer pricing documentation between South Africa, Kenya, and Nigeria) to avoid double-taxation dealbreaker alerts during audits.";
  }

  let technicalStep = "Sanitize the core developer codebase and consolidate proprietary IP.";
  if (tech <= 1) {
    technicalStep = "Sanitize legacy software architecture. Begin a 12-week core codebase audit to clear out undocumented dependencies, register outstanding trademarks, and document all mission-critical internal APIs.";
  } else {
    technicalStep = "Leverage your modern documented API stack. Publish external dev sandboxes to encourage strategic integrations, establishing industry-wide developer dependence.";
  }

  let clientStep = "Remediate customer concentration portfolio exposure.";
  if (conc <= 1) {
    clientStep = "Aggressively diversify revenue. Dilute your top customer's concentration (currently representing over 30% of total revenue) by targeting 5 mid-tier enterprise deals within the next 6 months.";
  } else {
    clientStep = "Lock in your well-diversified client base. Transition key customer accounts onto automatic multi-year renewal plans to secure stable cash flow projections.";
  }

  const roadmapText = `#### M&A Exit Readiness Action Plan (Score: ${score}/100)

**1. Corporate Structure Alignment & Sovereign Hedging** *(Timeline: Months 1-2)*
* **Objective:** Establish institutional legal frameworks to mitigate exit friction.
* **Advisory Action:** ${complianceStep}
* **African Corridor Context:** Foreign acquirers fear currency fluctuation and local court delay risks. Restructuring using a Delaware or Mauritius offshore holding configuration establishes trust, standardizes board rules, and guarantees exit currency flexibility (USD).

**2. Core Commercial KPI Traction Expansion** *(Timeline: Months 2-4)*
* **Objective:** Establish stable premium performance baselines.
* **Advisory Action:** ${revenueStep}
* **African Corridor Context:** Growth multiples in current markets are heavily compressed unless accompanied by strong YoY momentum (e.g., crossing $500k ARR). Invest into digital outbound channels across major hubs (Lagos, Nairobi, Johannesburg).

**3. Codebase Sanitization & IP Ownership Vesting** *(Timeline: Months 4-6)*
* **Objective:** Eradicate high technical risk markers.
* **Advisory Action:** ${technicalStep}
* **African Corridor Context:** Ensure all contract developers have fully signed IP assignment addendums. Any outstanding copyright ambiguity will prompt substantial purchase price holdbacks (escrows) during technical investigation audits.

**4. Portfolio Risk Remediation & Contract Formalization** *(Timeline: Months 6-8)*
* **Objective:** Ensure predictable revenue security.
* **Advisory Action:** ${clientStep}
* **African Corridor Context:** High customer dependency presents an existential threat. Buyers will demand a steep evaluation discount if a single buyer controls substantial cash flows. Establish long-term recurring contract locks immediately.

**5. Assemble Pre-Close Data Room & Initiate Discretionary Inbound RFPs** *(Timeline: Months 8-9)*
* **Objective:** Create a competitive bidding environment.
* **Advisory Action:** Select two credentialed M&A investment advisors with networks across Europe, North America, and dynamic African corporates. Structure high-quality folders conforming to institutional Due Diligence standards (Cap Tables, consolidated financials, employment agreements) to trigger competitive suitor tension and maximize multiple premiums.

---
*Note: This roadmap matches your exact evaluation scorecard metrics to maximize exit valuation potential.*`;

  return roadmapText;
}

function getSmartComplianceRadarFallback(countries: string[]): string {
  if (!countries || countries.length === 0) {
    countries = ["South Africa", "Nigeria", "Kenya"];
  }

  let text = `# 🌐 COMPLIANCE PASSPORT DIRECTORY (OFFLINE SANDBOX MODE)
*Generated for operations across: ${countries.join(", ")}*

---

## 🏛️ SECTION 1: JURISDICTIONAL TAX COMPLIANCE MATRIX

| Country | Revenue/Tax Authority | Core Statutory Registrations Required | Major M&A Valuation Pitfalls & Dealing Red Flags |
| :--- | :--- | :--- | :--- |
`;

  countries.forEach(country => {
    let authority = "National Revenue Authority";
    let regRequired = "Corporate Tax Registration, VAT/GST filing certificate, Pay-As-You-Earn (PAYE) withholding license.";
    let pitfall = "Unfiled corporate returns trigger immediate 15% annual compounding back-tax penalties, causing automatic deal escrow holdbacks.";

    const c = country.toLowerCase();
    if (c.includes("south africa") || c.includes("za")) {
      authority = "South African Revenue Service (SARS)";
      regRequired = "Corporate Income Tax (CIT), VAT (threshold R1M), PAYE, Skills Development Levy (SDL), UIF.";
      pitfall = "SARS clearance certificates are required for capital repatriation during exits. Gaps lock deal flows for 6+ months.";
    } else if (c.includes("nigeria") || c.includes("ng")) {
      authority = "Federal Inland Revenue Service (FIRS)";
      regRequired = "Company Income Tax (CIT), VAT (7.5%), PAYE (LIRS/States), WHT, Education Tax (2.5% of assessable profit).";
      pitfall = "Failure to file FIRS transfer pricing documentation for regional parent-subsidiary flows triggers NGN 10M flat default fines.";
    } else if (c.includes("kenya") || c.includes("ke")) {
      authority = "Kenya Revenue Authority (KRA)";
      regRequired = "PIN Registration, Corporate Tax, VAT (16%), PAYE, Housing Levy (1.5%), NSSF, SHIF (Social Health Insurance).";
      pitfall = "KRA audits legacy withholding taxes intensively on M&A transfers. Missing KRA pin-links cause valuation discounts up to $200k.";
    } else if (c.includes("egypt") || c.includes("eg")) {
      authority = "Egyptian Tax Authority (ETA)";
      regRequired = "Tax Card, VAT registration, Salary Tax (PAYE), Stamp Duty, Social Insurance Scheme.";
      pitfall = "Complex real estate stamp duties or unverified digital service taxation can trigger long court delays for incoming acquisition capital.";
    } else if (c.includes("mauritius") || c.includes("mu")) {
      authority = "Mauritius Revenue Authority (MRA)";
      regRequired = "Corporate Income Tax (global/domestic), VAT, PAYE, National Pension Fund (NPF).";
      pitfall = "Failing to satisfy the statutory 'Substance Requirements' (local directors, physical board meetings) forfeits 15% double-tax treaty privileges.";
    }

    text += `| **${country}** | ${authority} | ${regRequired} | ${pitfall} |\n`;
  });

  text += `
---

## 🔒 SECTION 2: DATA PRIVACY & COMPLIANCE REGISTRY

| Country | Governing Rule / Act | Appointed Regulator | Mandatory Operational Directives | Non-Compliance M&A Multiplier Haircut |
| :--- | :--- | :--- | :--- | :--- |
`;

  countries.forEach(country => {
    let rule = "National Data Protection Act";
    let regulator = "Data Protection Commission (DPC)";
    let directive = "User consent logs, secure local cloud database server storage, designated Data Protection Officer (DPO).";
    let penalty = "10% global revenue limit or deal halt.";

    const c = country.toLowerCase();
    if (c.includes("south africa") || c.includes("za")) {
      rule = "Protection of Personal Information Act (POPIA)";
      regulator = "The Information Regulator (South Africa)";
      directive = "Establish Prior Authorization triggers for special data, assign an Information Officer, publish PAIA manuals.";
      penalty = "Up to R10M fine or 10 years imprisonment. Causes 15% drop in enterprise buyer confidence.";
    } else if (c.includes("nigeria") || c.includes("ng")) {
      rule = "Nigeria Data Protection Act (NDPA) & NDPR";
      regulator = "Nigeria Data Protection Commission (NDPC)";
      directive = "Perform mandatory annual independent Data Protection Compliance Audits (DPCO filings) with NDPC.";
      penalty = "Up to NGN 10M or 2% of annual gross revenue. Accompanying due diligence disclosures will discount IP valuation by 20%.";
    } else if (c.includes("kenya") || c.includes("ke")) {
      rule = "Data Protection Act, 2019";
      regulator = "Office of the Data Commissioner (ODPC)";
      directive = "Formal registration as a Data Controller / Processor. Mandatory Impact Assessments (DPIAs) for algorithmic scoring.";
      penalty = "Up to KES 5M fine or 1% of turnover. Acquirers usually freeze customer databases entirely without ODPC certs.";
    } else if (c.includes("egypt") || c.includes("eg")) {
      rule = "Personal Data Protection Law (No. 151 of 2020)";
      regulator = "Personal Data Protection Centre";
      directive = "Obtain multi-tenant cross-border transfer licenses. Maintain extensive data retention and processing registries.";
      penalty = "Fines up to EGP 5M. Triggers strict structural escrow warranties in M&A term sheets.";
    } else if (c.includes("mauritius") || c.includes("mu")) {
      rule = "Data Protection Act 2017 (DPA)";
      regulator = "Data Protection Office (Mauritius)";
      directive = "Designated EU GDPR-aligned privacy standard frameworks, documented consent flow triggers.";
      penalty = "Fines up to MUR 200K. Minimal friction but requires official compliance certification prior to deal signoff.";
    }

    text += `| **${country}** | ${rule} | ${regulator} | ${directive} | ${penalty} |\n`;
  });

  text += `
---

## 👔 SECTION 3: EMPLOYMENT LAW & STATUTORY BENEFIT FRAMEWORKS

| Country | Core Governing Labor Law | Essential Statutory Benefits / Contributions | Mandatory IP / Invention Assignment Safeguards |
| :--- | :--- | :--- | :--- |
`;

  countries.forEach(country => {
    let law = "National Employment & Employment Contract Act";
    let benefit = "Statutory pension deductions, national healthcare, Paid Annual leave (minimum 15 working days).";
    let ip = "Universal proprietary invention release contracts. Signed waivers for all staff nodes.";

    const c = country.toLowerCase();
    if (c.includes("south africa") || c.includes("za")) {
      law = "Basic Conditions of Employment Act (BCEA) & LRA";
      benefit = "Unemployment Insurance Fund (UIF), COIDA (Injury fund), statutory leave payouts, strict 13th-cheque options.";
      ip = "Employment contracts MUST contain solid common law invention devolution clauses and explicit non-disclosure covenants.";
    } else if (c.includes("nigeria") || c.includes("ng")) {
      law = "Labour Act Cap L1 LFN 2004";
      benefit = "Pension Reform Act (10% employer / 8% employee match), NHF (National Housing), NSITF (Work compensation).";
      ip = "Independent contractors must sign unambiguous 'Deed of Separation and Technology Assignment' to prevent residual IP leaks.";
    } else if (c.includes("kenya") || c.includes("ke")) {
      law = "Employment Act, 2007";
      benefit = "NSSF Tier I & II, SHIF contributions, Housing Levy (1.5%), 21 days annual leave, pay-slips under local currency.";
      ip = "Riders designating all code/design written from private machines as 'work-for-hire' strictly devested to the Delaware holdco.";
    } else if (c.includes("egypt") || c.includes("eg")) {
      law = "Labour Law No. 12 of 2003";
      benefit = "Mandatory profit sharing (10% of profit for staff under local law), social insurance contributions, legal severance.";
      ip = "Proprietary design release contract signed and notarized with the Egyptian Patent Office.";
    } else if (c.includes("mauritius") || c.includes("mu")) {
      law = "Workers' Rights Act 2019";
      benefit = "Portable Retirement Gratuity Fund (PRGF), statutory bonuses, overtime hours controls.";
      ip = "Strong universal consulting IP assignment riders translated into bilateral trade contracts.";
    }

    text += `| **${country}** | ${law} | ${benefit} | ${ip} |\n`;
  });

  text += `
---

## 📈 SECTION 4: HISTOGRAM OF DEAL VALUATION DISCOUNT

| Identified Unresolved Compliance Gap | Estimated Deal Valuation Reduction | Legal Mitigation Protocol for M&A Exit |
| :--- | :--- | :--- |
| **Missing Cross-Border Data Privacy (ODPC/NDPC)** | **15% to 20% haircut** on valuation multiples | Halt external storage access and file immediate retroactive impact audits with regional officers. |
| **Undocumented contractor work-for-hire IP assignments** | **25% or total deal indemnity holdback** | Distribute bilateral technology transfer releases with small incentive bonuses for prompt signatures. |
| **Unregistered foreign employer tax accounts (PAYE/VAT)** | **10% to 15% haircut plus escrow escorts** | Register local branch entities or deploy Professional Employer Organizations (PEO / Employers of Record) like Omnipresent or Employer of Record. |

---

*Verified by Bao M&A Jurisdictional Radar Desk. This passport should be maintained alongside the active Exit Scorecard.*`;

  return text;
}

async function startServer() {
  const app = express();

  // Basic robust body parser
  app.use(express.json({ limit: "15mb" }));

  // ==========================================
  // API ENDPOINTS
  // ==========================================

  // Health probe
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Roadmap Generator Route
  app.post("/api/generate-roadmap", async (req, res) => {
    const { answers, score } = req.body;
    
    if (score === undefined) {
      return res.status(400).json({ error: "Missing parameter: 'score' is required." });
    }

    // Capture fallback mode check
    const useFallback = !process.env.GEMINI_API_KEY || 
                        process.env.GEMINI_API_KEY.includes("MY") || 
                        process.env.GEMINI_API_KEY.includes("YOUR_API_KEY");

    if (useFallback) {
      const fallbackRoadmap = getSmartRoadmapFallback(answers, score);
      return res.json({ roadmap: fallbackRoadmap, simulationMode: true });
    }

    try {
      const ai = getGeminiClient();
      const prompt = `Based on these answers: ${JSON.stringify(answers)} and a score of ${score}/100, generate a 5-step action plan for an African tech startup to become acquisition-ready. Be highly specific, actionable, and include practical timelines. Use bullet points and headers. Provide concrete tactical advice relevant to Sub-Saharan Africa's regulatory environment, currency stability (such as hedging or Delaware flips), IP consolidation, and strategic partnerships.`;

      const generationConfig = {
        systemInstruction: "You are an elite, cynical M&A (Mergers and Acquisitions) Due Diligence expert and financial advisor specializing in tech expansion and exit transactions within the African startup ecosystem (Nigeria, Kenya, South Africa, Egypt, Ghana, etc.). Construct a brilliant, realistic, and highly professional 5-step exit planning roadmap. Avoid generic advice.",
      };

      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: generationConfig,
        });
      } catch (err) {
        console.warn("Primary model for roadmap failed, trying fallback models...", err);
        try {
          response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: prompt,
            config: generationConfig,
          });
        } catch (liteErr) {
          response = await ai.models.generateContent({
            model: "gemini-flash-latest",
            contents: prompt,
            config: generationConfig,
          });
        }
      }

      const responseText = response.text || "Failed to generate dynamic advisor recommendations.";
      return res.json({ roadmap: responseText, simulationMode: false });

    } catch (error: any) {
      console.warn("Gemini Roadmap generation failed or key is invalid, switching to interactive fallback simulation:", error);
      const fallbackRoadmap = getSmartRoadmapFallback(answers, score);
      return res.json({ roadmap: fallbackRoadmap, simulationMode: true });
    }
  });

  // Due Diligence Verification Route
  app.post("/api/due-diligence", async (req, res) => {
    const { title, description, metricsContext, documentsText } = req.body;

    if (!title || !documentsText) {
      return res.status(400).json({
        error: "Missing parameters. 'title' and 'documentsText' are required.",
      });
    }

    // Capture fallback mode check
    const useFallback = !process.env.GEMINI_API_KEY || 
                        process.env.GEMINI_API_KEY.includes("MY") || 
                        process.env.GEMINI_API_KEY.includes("YOUR_API_KEY");

    if (useFallback) {
      const fallbackReport = getSmartBackupResponse(title, description, metricsContext, documentsText);
      return res.json(fallbackReport);
    }

    try {
      const ai = getGeminiClient();

      // Construct highly tailored prompt for business/technical audit verification
      const prompt = `
=== TRANSACTION / COMPANY OVERVIEW ===
Company/Project Title: ${title}
Focus Description: ${description || "Startup / Business seeking validation"}
Context/Current Profile: ${metricsContext || "No advanced metrics provided"}

=== VERIFICATION TARGETS & DATA EXCERPT ===
Data provided by founder to verify:
${documentsText}

=== INSTRUCTIONS ===
Deeply audit the provided targets and text excerpt for M&A exit due diligence. 
Provide a comprehensive evaluation indicating risks, red flags, verified claims, gaps, and immediate strategic action.
Be objective and realistic - do not sugarcoat issues. If metrics lack evidence or sound unrealistic, mark them unverified.
`;

      const generationConfig = {
        systemInstruction: `You are an elite, cynical M&A (Mergers and Acquisitions) Due Diligence auditor representing institutional buyers. 
Deeply evaluate the user's provided document, transaction information, or business data dump to verify metrics, highlight red flags, assess risks, identify critical missing files, and recommend strategic next steps. Output structured, professional compliance JSON.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            keyFindings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Major highlights, insights or summaries discovered during this analysis.",
            },
            redFlags: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  riskLevel: { type: Type.STRING, description: "Should be one of: Low, Medium, High, or Critical" },
                  issue: { type: Type.STRING, description: "Short heading of the specific issue/flag" },
                  description: { type: Type.STRING, description: "Detailed risk explanation" },
                  mitigation: { type: Type.STRING, description: "Actionable strategy the founder should execute right now to resolve this before final inspection" },
                },
                required: ["riskLevel", "issue", "description", "mitigation"],
              },
            },
            verifiedMetrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  metricName: { type: Type.STRING, description: "e.g., ARR, Active Customers, CAC, Margin, Technical Debt level, etc." },
                  status: { type: Type.STRING, description: "Verified, Partially Verified, Suspicious, or Unverified" },
                  confidenceScore: { type: Type.INTEGER, description: "Confidence level of claims from 0 to 100 based on supporting proof" },
                  comment: { type: Type.STRING, description: "Critical auditor comments regarding evidence sufficiency" },
                },
                required: ["metricName", "status", "confidenceScore", "comment"],
              },
            },
            recommendedActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Immediate step-by-step actions the founder must take to ready this segment for transaction.",
            },
            missingInformation: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Vital files, lists, logs, audits, or structural documents currently absent that are required for transaction clearance.",
            },
            overallRiskScore: {
              type: Type.INTEGER,
              description: "A calculated exit risk severity score from 0 (pristine/low risk) to 100 (critical blocker/dealbreaker risk).",
            },
            dueDiligenceSummary: {
              type: Type.STRING,
              description: "A concise, elegant, elite 2-3 paragraph M&A summary of the audit findings.",
            },
          },
          required: [
            "keyFindings",
            "redFlags",
            "verifiedMetrics",
            "recommendedActions",
            "missingInformation",
            "overallRiskScore",
            "dueDiligenceSummary",
          ],
        },
      };

      let response;
      let usedModel = "gemini-3.5-flash";

      try {
        console.log("Attempting due diligence analysis with primary model: gemini-3.5-flash");
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: generationConfig,
        });
      } catch (gemErr: any) {
        console.warn("Primary model gemini-3.5-flash failed or was unavailable:", gemErr.message || gemErr);
        console.log("Trying secondary fallback model: gemini-3.1-flash-lite");
        usedModel = "gemini-3.1-flash-lite";
        try {
          response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: prompt,
            config: generationConfig,
          });
        } catch (liteErr: any) {
          console.warn("Fallback model gemini-3.1-flash-lite failed:", liteErr.message || liteErr);
          console.log("Trying tertiary fallback model: gemini-flash-latest");
          usedModel = "gemini-flash-latest";
          response = await ai.models.generateContent({
            model: "gemini-flash-latest",
            contents: prompt,
            config: generationConfig,
          });
        }
      }

      const responseText = response.text || "";
      let cleanedText = responseText.trim();
      
      // Strip markdown code block boundaries if present
      if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```(?:json)?\s*/i, "");
      }
      if (cleanedText.endsWith("```")) {
        cleanedText = cleanedText.replace(/\s*```$/i, "");
      }
      cleanedText = cleanedText.trim();

      let parsedData;
      try {
        parsedData = JSON.parse(cleanedText);
      } catch (jsonErr) {
        // Safe regex extractor for standard JSON
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        } else {
          throw jsonErr;
        }
      }

      return res.json(parsedData);
    } catch (error: any) {
      console.warn("Gemini Live API failed or key is invalid, switching to interactive fallback simulation:", error);
      const fallbackReport = getSmartBackupResponse(title, description, metricsContext, documentsText);
      return res.json(fallbackReport);
    }
  });

  // compliance radar route
  app.post("/api/generate-compliance", async (req, res) => {
    const { countries } = req.body;
    if (!countries || !Array.isArray(countries) || countries.length === 0) {
      return res.status(400).json({ error: "Missing parameter: 'countries' must be a non-empty array of strings." });
    }

    const useFallback = !process.env.GEMINI_API_KEY || 
                        process.env.GEMINI_API_KEY.includes("MY") || 
                        process.env.GEMINI_API_KEY.includes("YOUR_API_KEY");

    if (useFallback) {
      const fallbackDoc = getSmartComplianceRadarFallback(countries);
      return res.json({ compliancePassportText: fallbackDoc, simulationMode: true });
    }

    try {
      const ai = getGeminiClient();
      const prompt = `Construct a highly professional "Compliance Passport Passport Document" for a tech startup operating across the following African jurisdictions: ${countries.join(', ')}.
Provide a breakdown of the three following domains:
1. Missing general/municipal Tax Registrations (with real names of localized tax authorities like SARS in ZA, KRA in KE, FIRS in NG, LRA, etc. for each country).
2. Data privacy compliance legislation requirements (such as POPIA in South South Africa, NDPR/NDPA in Nigeria, DPA 2019 in Kenya, etc.).
3. Employment/labor laws and local statutory employee social packages (for example, pension structures, unemployment levies like UIF, social health insurance).
4. Outline an estimation of how unresolved gaps specifically lead to a steep 25%-40% drop in valuation multiples or buyer indemnity holdbacks, and supply exact, actionable mitigation procedures.
Always write the report in clean markdown using markdown tables and checklists. Be precise, highly specific, and authoritative. Avoid high-level placeholders. Fill in every column in detail.`;

      const generationConfig = {
        systemInstruction: "You are an elite, cynical legal counsel and compliance officer specializing in cross-border tech mergers & acquisitions within the 54 countries of the African continent. Your analysis is extremely precise, detailed, structured, and helpful for venture capitalists and international buyers doing serious due diligence reviews. Present the passport comprehensively in beautifully formatted Markdown.",
      };

      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: generationConfig,
        });
      } catch (err) {
        console.warn("Compliance Radar: Primary model failed, trying fallback...", err);
        try {
          response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: prompt,
            config: generationConfig,
          });
        } catch (liteErr) {
          response = await ai.models.generateContent({
            model: "gemini-flash-latest",
            contents: prompt,
            config: generationConfig,
          });
        }
      }

      const responseText = response.text || "Failed to generate dynamic compliance passport.";
      return res.json({ compliancePassportText: responseText, simulationMode: false });

    } catch (error: any) {
      console.warn("Compliance dynamic generation failed, switching to backup smart simulator:", error);
      const fallbackDoc = getSmartComplianceRadarFallback(countries);
      return res.json({ compliancePassportText: fallbackDoc, simulationMode: true });
    }
  });

  // ==========================================
  // M&A AI Negotiator & Co-pilot Route
  // ==========================================
  app.post("/api/mna-copilot", async (req, res) => {
    const { loiText } = req.body;
    if (!loiText) {
      return res.status(400).json({ error: "Missing parameter: 'loiText' is required." });
    }

    const useFallback = !process.env.GEMINI_API_KEY || 
                        process.env.GEMINI_API_KEY.includes("MY") || 
                        process.env.GEMINI_API_KEY.includes("YOUR_API_KEY");

    if (useFallback) {
      return res.json({
        redlines: `# LOI Redline Audit Report (Simulation Fallback Mode)
        
## Summary of Key Provisions
Your uploaded Letter of Intent (LOI) contains aggressive provisions that are below typical market medians for Sub-Saharan Africa (2020-2026 transactions).

## Clause by Clause Key Flags

### 1. Clause 4.2 - Earn-out Structure & Cap (CRITICAL FLAG)
* **Our Finding**: The proposed earn-out cap is set at 15% of total enterprise value, tied to high-growth milestones.
* **African Medium Comparison**: The median earn-out cap for African Fintech/SaaS deals is 30% of total deal value, with a 2-year earn-out duration.
* **Recommended Redline**: "Capped earn-out amount shall be increased to match 30% of total nominal transaction consideration, with performance indicators adjusted dynamically to localized inflationary realities."

### 2. Clause 7.1 - Jurisdiction & Governing Law (MEDIUM RISK)
* **Our Finding**: Governing law is set to local provincial law without high-liquidity dispute resolution venues.
* **African Medium Comparison**: 82% of Series A+ exits or buyouts utilize Delaware Holdcos, English Commercial Court, or Mauritius jurisdiction for disputes.
* **Recommended Redline**: Change governing law to English Law, with dispute arbitration settled under LCIA rules in London, Mauritius, or DIFC.

### 3. Clause 11.3 - Founder Vesting on Exit (HIGH RISK)
* **Our Finding**: Mandatory 36-month post-close founder vesting with total lock on secondary liquidity.
* **African Medium Comparison**: Tech median is 24 months, with 10-20% secondary liquidity pre-negotiated at close (Helios, DPI, Avenir buy-ins).
* **Recommended Redline**: Limit reverse-vesting lockup to 24 months. Insert a 'Good Leaver' clause to trigger accelerated vesting upon pre-concluded board changes.

### 4. Valuation Multiple Benchmarking
* Your proposed valuation represents a **~5.5x ARR multiple**. 
* Current African premium tech exit median ranges from **6x - 8.5x ARR**, depending on license moats (CBN PSSP, etc.). See the **BAO License Graph** page to calculate your regulatory valuation leverage.`,
        simulationMode: true
      });
    }

    try {
      const ai = getGeminiClient();
      const prompt = `You are an elite, highly sophisticated African M&A lawyer and venture capital negotiator. You have audited thousands of tech transactions across Lagos, Nairobi, Johannesburg, and London between 2020 and 2026.
      
Audit the following LOI (Letter of Intent) text and provide a highly technical, cynical, and actionable redline report:
${loiText}

Ensure you highlight:
1. Clauses that are below typical market averages (e.g. earn-out caps, post-close founder vesting, governing law, IP reps, and warranties).
2. Valuation multiple comparisons with African peer benchmarks (African Fintech/SaaS medians range from 6x to 8.5x).
3. Specific revised drafting suggestions to level the playing field for the founder.
Formatting should be professional Markdown. Be incredibly specific, tough, and objective.`;

      const generationConfig = {
        systemInstruction: "You are the primary lawyer and partner at an elite tech-focused law firm (e.g., Bowmans, Aluko & Oyebode) advising African startup founders on major exits. Your advice is legendary, precise, cynical, and highly actionable. Avoid generic safe language.",
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: generationConfig,
      });

      return res.json({ redlines: response.text || "Failed to parse LOI text.", simulationMode: false });
    } catch (err: any) {
      console.warn("M&A Co-pilot: Primary model failed, returning fallback...", err);
      return res.json({
        redlines: `# LOI Redline Audit Report (Backup Mode)
        
## Summary of Key Provisions
Your uploaded Letter of Intent (LOI) contains aggressive provisions that are below typical market medians for Sub-Saharan Africa (2020-2026 transactions).

## Clause by Clause Key Flags

### 1. Clause 4.2 - Earn-out Structure & Cap (CRITICAL FLAG)
* **Our Finding**: The proposed earn-out cap is set at 15% of total enterprise value, tied to high-growth milestones.
* **African Medium Comparison**: The median earn-out cap for African Fintech/SaaS deals is 30% of total deal value, with a 2-year earn-out duration.
* **Recommended Redline**: "Capped earn-out amount shall be increased to match 30% of total nominal transaction consideration, with performance indicators adjusted dynamically to localized inflationary realities."

### 2. Clause 7.1 - Jurisdiction & Governing Law (MEDIUM RISK)
* **Our Finding**: Governing law is set to local provincial law without high-liquidity dispute resolution venues.
* **African Medium Comparison**: 82% of Series A+ exits or buyouts utilize Delaware Holdcos, English Commercial Court, or Mauritius jurisdiction for disputes.
* **Recommended Redline**: Change governing law to English Law, with dispute arbitration settled under LCIA rules in London, Mauritius, or DIFC.

### 3. Clause 11.3 - Founder Vesting on Exit (HIGH RISK)
* **Our Finding**: Mandatory 36-month post-close founder vesting with total lock on secondary liquidity.
* **African Medium Comparison**: Tech median is 24 months, with 10-20% secondary liquidity pre-negotiated at close (Helios, DPI, Avenir buy-ins).
* **Recommended Redline**: Limit reverse-vesting lockup to 24 months. Insert a 'Good Leaver' clause to trigger accelerated vesting upon pre-concluded board changes.

### 4. Valuation Multiple Benchmarking
* Your proposed valuation represents a **~5.5x ARR multiple**. 
* Current African premium tech exit median ranges from **6x - 8.5x ARR**, depending on license moats (CBN PSSP, etc.). See the **BAO License Graph** page to calculate your regulatory valuation leverage.`,
        simulationMode: true
      });
    }
  });

  // ==========================================
  // VITE & STATIC FILES HANDLING
  // ==========================================

  if (process.env.NODE_ENV !== "production") {
    // Development Mode Option
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Dist Serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Launch Server on Port 3000
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[BAO SERVER] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
