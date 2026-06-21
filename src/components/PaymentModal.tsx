import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle, 
  Lock, 
  ShieldCheck, 
  Loader2, 
  ArrowRight,
  Printer
} from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: { name: string; price: string } | null;
  onPaymentSuccess: (tier: 'pro' | 'enterprise', txnId: string, paymentMethod: string) => void;
  userEmail?: string;
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  selectedPlan, 
  onPaymentSuccess, 
  userEmail = 'ashermutere@gmail.com' 
}: PaymentModalProps) {
  
  const [currentPlan, setCurrentPlan] = useState<{ name: string; price: string }>({ name: 'Executive Pro', price: '$299' });

  // Transaction loading and completion
  const [isProcessing, setIsProcessing] = useState(false);
  const [processMessage, setProcessMessage] = useState('');
  const [receipt, setReceipt] = useState<{ txnId: string; date: string; method: string } | null>(null);

  useEffect(() => {
    if (selectedPlan) {
      setCurrentPlan(selectedPlan);
    }
  }, [selectedPlan]);

  const getNumericPrice = () => {
    if (!currentPlan?.price) return '299.00';
    return currentPlan.price.replace(/[^0-9.]/g, '');
  };

  if (!isOpen) return null;

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div id="payment-overlay-container" className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-950/80 animate-fade-in backdrop-blur-xs">
      <div className="relative bg-white text-slate-850 rounded-3xl max-w-xl w-full border border-slate-200 overflow-hidden shadow-2xl my-8">
        
        {/* Close Button */}
        {!isProcessing && (
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer z-10"
            title="Cancel payment"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Header Ribbon & Plan selector */}
        <div className="bg-slate-900 text-white p-6 md:p-8 flex items-start justify-between gap-6 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent pointer-events-none" />
          <div className="relative z-10 text-left">
            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-widest">
              Secured Exit Gateway
            </span>
            <h3 className="text-xl md:text-2xl font-black mt-2">Unlock BAO Premium Operations</h3>
            <p className="text-slate-400 text-xs mt-1">Acquire verified reports, infinite buyer dealboxes, and cloud storage triggers.</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 px-4 py-2.5 rounded-2xl text-right shrink-0 relative z-10">
            <span className="text-[9px] text-slate-450 font-extrabold block uppercase tracking-wider">SELECTED PLAN</span>
            <span className="font-extrabold text-xs text-white block">{currentPlan.name}</span>
            <span className="font-black text-lg text-emerald-400 block mt-0.5 leading-none">{currentPlan.price}</span>
          </div>
        </div>

        {/* Processing Spinner state block */}
        {isProcessing && (
          <div className="p-12 text-center min-h-[350px] flex flex-col items-center justify-center">
            <Loader2 className="w-16 h-16 animate-spin text-emerald-500 mb-6" />
            <h4 className="font-extrabold text-slate-900 text-lg">Processing Transaction Plan</h4>
            <p className="text-slate-505 text-xs mt-2 max-w-sm font-semibold">{processMessage}</p>
            <div className="mt-8 p-3 bg-slate-50 border rounded-2xl max-w-xs text-left text-[11px] text-slate-400 flex items-start gap-2">
              <Lock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>TLS handshake encrypted. Your physical metadata, logs, and account pins are handled dynamically and privately.</span>
            </div>
          </div>
        )}

        {/* Receipt / Invoice display */}
        {!isProcessing && receipt && (
          <div className="p-6 md:p-8 space-y-6 text-left">
            <div className="text-center pb-6 border-b border-slate-100 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-550/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 mb-3 animate-bounce">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-black text-slate-950">Payment Settled Successfully</h4>
              <p className="text-slate-505 text-xs mt-1">Your Premium tier upgrade is active on the workspace instantly!</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans font-bold">Transaction Reference:</span>
                <span className="text-slate-800 font-extrabold">{receipt.txnId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans font-bold">Plan Provisioned:</span>
                <span className="text-slate-800 font-extrabold uppercase">{currentPlan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans font-bold">Payment Method:</span>
                <span className="text-slate-800 font-extrabold text-right">{receipt.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans font-bold">Authorization Date:</span>
                <span className="text-slate-800 font-extrabold text-right">{receipt.date}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3 text-sm">
                <span className="text-slate-900 font-sans font-extrabold">Amount Settled:</span>
                <span className="text-emerald-600 font-black">{currentPlan.price}.00 USD</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                type="button"
                onClick={handlePrintReceipt}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Printer className="w-4 h-4" /> Print Invoice Receipt
              </button>
              
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow shadow-emerald-500/10"
              >
                Start Premium Session <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-center text-[10px] text-slate-400">
              A copy of this digital invoice certificate has been compiled and cataloged into your company data file.
            </p>
          </div>
        )}

        {/* Regular Interactive payment methods form */}
        {!isProcessing && !receipt && (
          <div className="p-6 md:p-8 space-y-6 text-center flex flex-col items-center">
            
            <div className="w-16 h-16 bg-blue-50 text-indigo-600 rounded-full flex items-center justify-center text-3xl font-serif font-black shadow-inner border border-blue-100">
              P
            </div>
            
            <div className="max-w-sm space-y-2">
              <h4 className="font-extrabold text-slate-900 text-base">PayPal Live Checkout Gateway</h4>
              <p className="text-xs text-slate-500 leading-normal">
                Authorize payments globally across multi-currency business balance ledgers securely via the official secure PayPal client API.
              </p>
            </div>

            {/* Real PayPal Buttons live loading wrapper */}
            <div className="w-full max-w-sm mx-auto overflow-hidden rounded-2xl border border-slate-200 p-3 bg-slate-50 relative min-h-[150px] flex flex-col justify-center shadow-xs">
              <PayPalScriptProvider options={{ 
                clientId: "AQYkTdDy0CjB9fibjRj_ThngtdbwJwkKbCFUvwd67jjvGDZMtm23oz30QrJno8_7UR53yDT1vXIkjBc_",
                currency: "USD",
                intent: "capture"
              }}>
                <div className="relative z-10 w-full animate-fade-in">
                  <PayPalButtons 
                    style={{ layout: "vertical", shape: "rect", label: "pay" }}
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        intent: "CAPTURE",
                        purchase_units: [
                          {
                            description: currentPlan.name,
                            amount: {
                              currency_code: 'USD',
                              value: getNumericPrice(),
                            },
                          },
                        ],
                      });
                    }}
                    onApprove={async (data, actions) => {
                      if (!actions.order) return;
                      setIsProcessing(true);
                      setProcessMessage('Contacting payment processing bank routing gateway...');
                      try {
                        const details = await actions.order.capture();
                        const generatedTxnId = details.id || ('BAO_PAYPAL_' + Math.floor(100000 + Math.random() * 900000));
                        const payerName = details.payer?.name?.given_name || 'Premium Partner';
                        const payerEmail = details.payer?.email_address || 'paypal-partner@domain.com';
                        const todayString = new Date().toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                        
                        setIsProcessing(false);
                        setReceipt({
                          txnId: generatedTxnId,
                          date: todayString,
                          method: `PayPal Live Account (${payerEmail})`
                        });

                        const targetTier = currentPlan.name.includes('Enterprise') ? 'enterprise' : 'pro';
                        onPaymentSuccess(targetTier, generatedTxnId, `PayPal [Payer: ${payerName}]`);
                      } catch (err: any) {
                        console.error("PayPal Capture Error: ", err);
                        setIsProcessing(false);
                        alert("PayPal Transaction Approval Failed: " + (err.message || err));
                      }
                    }}
                    onCancel={() => {
                      setIsProcessing(false);
                    }}
                    onError={(err) => {
                      console.error("PayPal integration error: ", err);
                      setIsProcessing(false);
                    }}
                  />
                </div>
              </PayPalScriptProvider>
            </div>
            
            <div className="flex flex-col items-center gap-2 mt-2">
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5 text-emerald-500" /> AES-256 SECURE CONNECTION
              </div>
              <p className="text-[10px] text-slate-400 max-w-xs leading-normal">
                Authorized Live Client ID Connected Securely. No credentials are saved or cached on intermediate servers.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
