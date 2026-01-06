import React, { useState } from 'react';
import { NETWORKS } from '../../utils/constants';

interface TransactionModalProps {
    isOpen: boolean;
    type: 'DEPOSIT' | 'WITHDRAW' | null;
    onClose: () => void;
    userBalance: number;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, type, onClose, userBalance }) => {
    const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS[0]);
    const [amount, setAmount] = useState('');
    const [address, setAddress] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !type) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(selectedNetwork.address);
        alert("Address copied!");
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-[#1e222d] w-full max-w-md rounded-3xl border border-white/10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#131722]/50">
                    <h3 className="text-xl font-black text-white uppercase tracking-wider">
                        {type === 'DEPOSIT' ? 'Add Funds' : 'Withdraw Funds'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Network Selection */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Select Network</label>
                        <div className="grid grid-cols-2 gap-2">
                            {NETWORKS.map(net => (
                                <button
                                    key={net.id}
                                    onClick={() => setSelectedNetwork(net)}
                                    className={`p-3 rounded-xl border text-sm font-bold flex items-center gap-2 transaction-all ${selectedNetwork.id === net.id
                                            ? 'bg-[#f01a64]/10 border-[#f01a64] text-white'
                                            : 'bg-[#131722] border-white/5 text-gray-400 hover:border-white/20'
                                        }`}
                                >
                                    <div className={`w-2 h-2 rounded-full ${selectedNetwork.id === net.id ? 'bg-[#f01a64]' : 'bg-gray-600'}`}></div>
                                    {net.name.split(' (')[0]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {type === 'DEPOSIT' ? (
                        /* Deposit View */
                        <div className="space-y-6">
                            <div className="bg-white p-4 rounded-xl mx-auto w-48 h-48 flex items-center justify-center">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${selectedNetwork.address}`}
                                    alt="QR Code"
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            <div className="bg-[#131722] p-4 rounded-xl border border-white/5 flex items-center justify-between gap-2 overflow-hidden">
                                <code className="text-xs text-gray-300 font-mono break-all">{selectedNetwork.address}</code>
                                <button onClick={handleCopy} className="p-2 bg-[#f01a64] hover:bg-[#d01555] rounded-lg text-white transition-colors flex-shrink-0">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                </button>
                            </div>

                            <p className="text-center text-xs text-gray-500">
                                Send only <span className="text-[#f01a64] font-bold">{selectedNetwork.deposit}</span> to this address. <br />
                                Deposits are credited automatically after 1 confirmation.
                            </p>
                        </div>
                    ) : (
                        /* Withdraw View */
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Amount (USD)</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Min: $50"
                                    className="w-full bg-[#131722] border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:border-[#f01a64] focus:outline-none transition"
                                />
                                <div className="flex justify-between mt-2">
                                    <span className="text-xs text-gray-500">Available: ${userBalance.toFixed(2)}</span>
                                    <button onClick={() => setAmount(userBalance.toString())} className="text-xs text-[#f01a64] font-bold hover:underline">Max</button>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Wallet Address ({selectedNetwork.id})</label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder={`Enter your ${selectedNetwork.chain} address`}
                                    className="w-full bg-[#131722] border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:border-[#f01a64] focus:outline-none transition"
                                />
                            </div>

                            <button className="w-full bg-[#f01a64] hover:bg-[#d01555] text-white font-black py-4 rounded-xl uppercase tracking-wider transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
                                Request Withdrawal
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionModal;
