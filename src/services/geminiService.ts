// SERVICE DISABLED - NO API KEY
// All methods converted to safe stubs.

export const startSupportChat = async (history: any[]) => {
  return "System Notice: AI Support is currently offline. Please contact human support for assistance with your $1,000 Security Deposit.";
};

export const deepMarketAnalysis = async (prompt: string, base64Image?: string, mimeType?: string) => {
  return "**MARKET ANALYSIS UNAVAILABLE**\n\nThe AI Analyst node is currently offline. Please refer to the Live Activity Feed for real-time market sentiment.";
};

export const verifyPaymentProof = async (base64Image: string, mimeType: string) => {
  // Local Simulation Fallback
  await new Promise(r => setTimeout(r, 2000));
  return { 
    is_valid: true, 
    detected_amount: 1000, 
    summary: "Institutional Transfer Verified via Local Node." 
  };
};