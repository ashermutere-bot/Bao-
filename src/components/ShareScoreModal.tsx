import React, { useRef, useEffect, useState } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Award,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

interface ShareScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  matches: string[];
  userName?: string;
}

export default function ShareScoreModal({ 
  isOpen, 
  onClose, 
  score, 
  matches = [], 
  userName = 'Founder' 
}: ShareScoreModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  // Pre-written social text
  const shareText = `Just took the Bao Exit Readiness test! My startup scored ${score}/100. Think you can beat me? Take the test at https://bao.africa`;

  useEffect(() => {
    if (!isOpen) return;

    const generateCanvasImage = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Reset transforms
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, 1200, 630);

      // 1. Dark background with smooth radial gradient (Space/Cosmic Theme)
      const grad = ctx.createRadialGradient(600, 315, 50, 600, 315, 750);
      grad.addColorStop(0, '#0f172a'); // slate-900
      grad.addColorStop(1, '#020617'); // slate-950
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 630);

      // 2. Add high-precision micro-grids (Engineering credibility look)
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < 1200; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 630);
        ctx.stroke();
      }
      for (let y = 0; y < 630; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1200, y);
        ctx.stroke();
      }

      // 3. Ambient Emerald soft backlighting for the score circle
      const glowGrad = ctx.createRadialGradient(320, 315, 0, 320, 315, 280);
      glowGrad.addColorStop(0, 'rgba(16, 185, 129, 0.14)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(320, 315, 280, 0, Math.PI * 2);
      ctx.fill();

      // 4. Draw Header/Logo Combo inside the card
      // Logo Mark geometric gem
      ctx.fillStyle = '#10b981'; // Emerald
      ctx.beginPath();
      const lx = 80;
      const ly = 85;
      
      // Draw outer glowing diamond
      ctx.moveTo(lx, ly - 22);
      ctx.lineTo(lx + 22, ly);
      ctx.lineTo(lx, ly + 22);
      ctx.lineTo(lx - 22, ly);
      ctx.closePath();
      ctx.fill();

      // Inner hollow center
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(lx, ly - 11);
      ctx.lineTo(lx + 11, ly);
      ctx.lineTo(lx, ly + 11);
      ctx.lineTo(lx - 11, ly);
      ctx.closePath();
      ctx.fill();

      // Inner core amber light
      ctx.fillStyle = '#fb923c'; 
      ctx.beginPath();
      ctx.arc(lx, ly, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // "BAO" text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'normal 900 44px sans-serif';
      ctx.fillText('BAO', 115, 96);

      // Divider vertical bar
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(225, 68);
      ctx.lineTo(225, 98);
      ctx.stroke();

      // Tagline text
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'italic 500 18px sans-serif';
      ctx.fillText("Ready for Africa’s next big exit.", 245, 90);

      // 5. Draw interactive score gauge dial
      const cx = 320;
      const cy = 340;
      const r = 115;

      // Base dial groove track
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Progress color fill based on score quality
      let themeColor = '#10b981'; // emerald
      if (score < 50) themeColor = '#f43f5e'; // rose
      else if (score < 70) themeColor = '#eab308'; // yellow

      // Glowing dial progress arc
      ctx.strokeStyle = themeColor;
      ctx.lineWidth = 16;
      ctx.lineCap = 'round';
      
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + (Math.PI * 2 * (score / 100));
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, endAngle);
      
      ctx.shadowColor = themeColor;
      ctx.shadowBlur = 18;
      ctx.stroke();
      
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Central score text
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'normal 900 100px sans-serif';
      ctx.fillText(score.toString(), cx, cy - 8);

      // "/100" label
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('/ 100', cx, cy + 48);

      // Segment analysis label below dial circle
      ctx.fillStyle = themeColor;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('EXIT READINESS SCORE', cx, cy + 96);
      
      ctx.fillStyle = '#64748b';
      ctx.font = '600 10px sans-serif';
      ctx.fillText('VERIFIED BAO METRIC AUDIT', cx, cy + 115);

      // 6. Right Side Panel (Matches & Pipelines)
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';

      const rx = 600;
      const ry = 195;

      // Draw beautiful modern glassmorphism panel container background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = 1.5;
      
      // Draw rounded rect
      const drawRounded = (x: number, y: number, w: number, h: number, radius: number) => {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
      };
      
      drawRounded(rx, ry, 520, 275, 20);
      ctx.fill();
      ctx.stroke();

      // Top Header inside panel
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(rx + 25, ry + 27, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 700 13px sans-serif';
      ctx.fillText('BAO EXIT PIPELINE AUDIT', rx + 40, ry + 32);

      ctx.fillStyle = '#64748b';
      ctx.font = '600 10px sans-serif';
      ctx.fillText('TOP INSTITUTIONAL MATCHES (M&A PIPELINE)', rx + 40, ry + 49);

      // Draw top matches inside badges
      const topMatches = matches.slice(0, 3);
      if (topMatches.length === 0) {
        ctx.fillStyle = '#f1f5f9';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText('Awaiting Assessment Score Threshold', rx + 40, ry + 120);

        ctx.fillStyle = '#64748b';
        ctx.font = 'normal 12px sans-serif';
        ctx.fillText('Acquirer pipeline activates at score ≥ 70.', rx + 40, ry + 145);
      } else {
        topMatches.forEach((match, idx) => {
          const badgeY = ry + 75 + (idx * 56);
          const bW = 440;
          const bH = 44;

          ctx.fillStyle = 'rgba(16, 185, 129, 0.05)';
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
          drawRounded(rx + 40, badgeY, bW, bH, 10);
          ctx.fill();
          ctx.stroke();

          // Index placeholder marker
          ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
          ctx.font = 'bold 900 16px sans-serif';
          ctx.fillText((idx + 1).toString(), rx + 58, badgeY + 27);

          // Name
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 14px sans-serif';
          ctx.fillText(match, rx + 90, badgeY + 27);

          // Subtag
          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText('STRATEGIC ACQUIRER', rx + 40 + bW - 20, badgeY + 27);
          ctx.textAlign = 'left';
        });
      }

      // 7. Dynamic stylised verification QR Code at the bottom corner
      const qrx = 80;
      const qry = 490;
      const qrsize = 80;

      // QR Code container banner
      ctx.fillStyle = '#ffffff';
      drawRounded(qrx, qry, qrsize, qrsize, 10);
      ctx.fill();

      // Anchors
      const qrPixel = (x: number, y: number, w: number, h: number) => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x, y, w, h);
      };
      
      const drawAnchorBlock = (ax: number, ay: number) => {
        qrPixel(ax, ay, 20, 20);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(ax + 3, ay + 3, 14, 14);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(ax + 6, ay + 6, 8, 8);
      };

      drawAnchorBlock(qrx + 6, qry + 6);
      drawAnchorBlock(qrx + qrsize - 26, qry + 6);
      drawAnchorBlock(qrx + 6, qry + qrsize - 26);

      // Populate random block structure beautifully
      ctx.fillStyle = '#020617';
      for (let rIdx = 0; rIdx < 8; rIdx++) {
        for (let cIdx = 0; cIdx < 8; cIdx++) {
          if (rIdx < 3 && cIdx < 3) continue;
          if (rIdx < 3 && cIdx >= 5) continue;
          if (rIdx >= 5 && cIdx < 3) continue;
          if (rIdx === 3 && cIdx === 3) continue;

          // Deterministic sequence based on user score
          const seedValue = (rIdx * 9) + cIdx + score;
          if (seedValue % 2 === 0 || seedValue % 5 === 0) {
            ctx.fillRect(qrx + 8 + (cIdx * 7.5), qry + 8 + (rIdx * 7.5), 6.5, 6.5);
          }
        }
      }

      // Text detail next to QR code
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('OFFICIAL EXIT PORTFOLIO BADGE', qrx + 100, qry + 26);

      ctx.fillStyle = '#64748b';
      ctx.font = 'normal 11px sans-serif';
      ctx.fillText('Scan to conduct your own strategic readiness audit.', qrx + 100, qry + 42);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('https://bao.africa', qrx + 100, qry + 60);

      // Top aesthetic gradient accent line
      const lineGrad = ctx.createLinearGradient(0, 0, 1200, 0);
      lineGrad.addColorStop(0, '#10b981');
      lineGrad.addColorStop(0.5, '#fb923c');
      lineGrad.addColorStop(1, '#6366f1');
      ctx.fillStyle = lineGrad;
      ctx.fillRect(0, 0, 1200, 6);

      // Create downloadable URL in local state
      try {
        setDownloadUrl(canvas.toDataURL('image/png'));
      } catch (err) {
        console.error('Error creating data URL from canvas:', err);
      }
    };

    // Delay slightly to allow any fonts to load
    const timer = setTimeout(generateCanvasImage, 250);
    return () => clearTimeout(timer);
  }, [isOpen, score, matches]);

  if (!isOpen) return null;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleLinkedInShare = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://bao.africa')}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Share Your Exit Readiness</h3>
              <p className="text-slate-400 text-xs">Publish your score badge and spark strategic interest</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Canvas Preview Container */}
          <div className="space-y-2">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Scorecard Badge Preview (PNG)</span>
            <div className="relative group bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 p-2 shadow-inner flex items-center justify-center">
              
              {/* Invisible High-definition Canvas */}
              <canvas 
                ref={canvasRef} 
                width={1200} 
                height={630} 
                className="hidden"
              />

              {/* Scaled Responsive Canvas Rendering Mirror */}
              {downloadUrl ? (
                <img 
                  src={downloadUrl} 
                  alt="BAO Scorecard Badge" 
                  className="w-full max-w-2xl rounded-xl border border-slate-800 shadow-md transform group-hover:scale-[1.01] transition-transform duration-300"
                />
              ) : (
                <div className="w-full max-w-2xl aspect-[1200/630] bg-slate-900 flex items-center justify-center text-slate-500 text-xs font-semibold">
                  Drawing high-fidelity badge canvas...
                </div>
              )}

              {/* Subtle hover help tag */}
              <div className="absolute bottom-4 right-4 bg-slate-950/90 text-slate-300 text-[10px] sm:text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-800/80 pointer-events-none backdrop-blur-sm">
                HD Image 1200 × 630 px
              </div>
            </div>
          </div>

          {/* Social Channels Posting Tool */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Copy Post Text & Custom Field */}
            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Pre-written Social Text</label>
              <div className="relative">
                <textarea 
                  readOnly
                  value={shareText}
                  className="w-full h-32 p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-xs leading-relaxed focus:outline-none resize-none"
                />
                
                <button 
                  onClick={handleCopyText}
                  className="absolute bottom-3 right-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-750"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-slate-500">Perfectly sized for LinkedIn articles or post threads.</p>
            </div>

            {/* Direct Multi-channel Actions */}
            <div className="flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Broadcast Options</label>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* Twitter / X Shortcut */}
                  <button 
                    onClick={handleTwitterShare}
                    className="py-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    Share on X
                  </button>

                  {/* LinkedIn Shortcut */}
                  <button 
                    onClick={handleLinkedInShare}
                    className="py-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-[#0a66c2] font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 fill-current text-[#0a66c2]" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    Post on LinkedIn
                  </button>
                </div>
              </div>

              {/* Prominent High-Contrast Main Download CTA */}
              {downloadUrl && (
                <a 
                  href={downloadUrl} 
                  download={`BAO_Scorecard_Certificate_${score}.png`}
                  className="w-full py-4.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  <Download className="w-4 h-4 text-slate-950" /> Download HD Badge Image
                </a>
              )}
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-slate-950 border-t border-slate-800 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-[10px] sm:text-left">
            BAO uses certified compliance mapping to record audit events indefinitely on verified cloud registers.
          </p>
          <a 
            href="https://bao.africa" 
            target="_blank" 
            className="text-slate-400 hover:text-emerald-400 text-xs font-semibold flex items-center gap-1 transition-all"
            referrerPolicy="no-referrer"
          >
            <span>Learn more at BAO Portal</span>
            <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>

      </div>
    </div>
  );
}
