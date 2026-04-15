import { useState, useEffect } from 'react';
import { 
  Plus, Upload, Download, LayoutDashboard, History, Settings, LogOut, 
  ArrowUpRight, ArrowDownRight, Bell, Search, Minus
} from 'lucide-react';

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
};

// Donut Chart Component
const DonutChart = ({ percentage }) => {
  const radius = 50;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - percentage / 100 * circumference;

  return (
    <div className="chart-container">
      <svg height="120" width="120">
        <circle
          stroke="#f1f5f9"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx="60"
          cy="60"
        />
        <circle
          stroke="#0f172a"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-in-out' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx="60"
          cy="60"
        />
      </svg>
      <div className="chart-center">
        <span className="percent">{percentage}%</span>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isDepositModal, setIsDepositModal] = useState(false);
  const [isWithdrawModal, setIsWithdrawModal] = useState(false);
  const [transactionAmount, setTransactionAmount] = useState('');

  // Initial Mock Data to match Dribbble design reference
  const initialGoal = {
    name: 'Iphone 17 Pro Max',
    target: 50000000,
    saved: 51450001, // 100% completed reference
    date: '12 Nov 2026'
  };

  const initialTransactions = [
    { id: 1, date: '15 Apr 2026', desc: 'Setoran Bulanan (Gaji)', amount: 15000000, type: 'deposit' },
    { id: 2, date: '10 Apr 2026', desc: 'Beli Case Loly Poly', amount: 350000, type: 'withdraw' },
    { id: 3, date: '01 Apr 2026', desc: 'Setoran Uang Lembur', amount: 4500000, type: 'deposit' },
    { id: 4, date: '28 Mar 2026', desc: 'Setoran Bonus Akhir Tahun', amount: 32300001, type: 'deposit' },
  ];

  const [goal, setGoal] = useState(initialGoal);
  const [transactions, setTransactions] = useState(initialTransactions);

  const totalSaved = goal.saved;
  const percentage = Math.min(Math.round((totalSaved / goal.target) * 100), 100);

  const handleTransaction = (type) => {
    const amount = Number(transactionAmount);
    if (!amount || amount <= 0) return;

    const newTx = {
      id: Date.now(),
      date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      desc: type === 'deposit' ? 'Setoran Tabungan Reguler' : 'Penarikan Tabungan',
      amount: amount,
      type: type
    };

    setTransactions([newTx, ...transactions]);
    setGoal(prev => ({
      ...prev,
      saved: type === 'deposit' ? prev.saved + amount : Math.max(0, prev.saved - amount)
    }));

    setTransactionAmount('');
    setIsDepositModal(false);
    setIsWithdrawModal(false);
  };

  return (
    <div className="app-container">
      {/* Lightbox for Thumbnail */}
      {lightboxOpen && (
        <div className="overlay" onClick={() => setLightboxOpen(false)}>
          <img src="/iphone.png" alt="Iphone 17 Pro Max Limitless" className="lightbox-img" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Transaction Modal Layout */}
      {(isDepositModal || isWithdrawModal) && (
        <div className="overlay" onClick={() => { setIsDepositModal(false); setIsWithdrawModal(false); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="mb-4">{isDepositModal ? 'Setor Uang (Deposit)' : 'Penarikan Uang (Withdraw)'}</h3>
            <div className="mb-6">
              <label className="text-secondary mb-2 block" style={{ fontSize: '0.85rem' }}>Nominal (Rp)</label>
              <input 
                type="number" 
                className="w-full" 
                placeholder="Misal: 50000"
                value={transactionAmount}
                onChange={e => setTransactionAmount(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex justify-between gap-4">
              <button className="btn btn-secondary w-full" onClick={() => { setIsDepositModal(false); setIsWithdrawModal(false); }}>Batal</button>
              <button className="btn btn-primary w-full" onClick={() => handleTransaction(isDepositModal ? 'deposit' : 'withdraw')}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo cursor-pointer">
          <div style={{ width: 32, height: 32, background: 'var(--accent-color)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: '1.25rem' }}>N</span>
          </div>
          NabungDong
        </div>

        <nav className="nav-menu">
          <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            <History size={20} /> Transaction History
          </button>
          <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings size={20} /> Settings
          </button>
        </nav>

        <div className="user-profile">
          <img src="https://i.pravatar.cc/150?img=11" alt="User Avatar" className="avatar" />
          <div className="user-info">
            <div className="user-name">Andrew F.</div>
            <div className="user-email">andrew@minimal.com</div>
          </div>
          <button className="btn-logout" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div>
            <div className="greeting">Good Morning, Andrew</div>
            <p>Welcome back to your financial dashboard.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="btn-secondary" style={{ padding: '10px', borderRadius: '50%' }}><Search size={20} /></button>
            <button className="btn-secondary" style={{ padding: '10px', borderRadius: '50%' }}><Bell size={20} /></button>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <>
            {/* Top Section */}
            <section className="mb-4">
              <div className="summary-grid">
                <div className="card summary-item flex items-center justify-between">
                  <div>
                    <div className="label">Total Saved</div>
                    <div className="value">{formatRupiah(totalSaved)}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => setIsWithdrawModal(true)}>
                      <Minus size={16} /> Withdraw
                    </button>
                    <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => setIsDepositModal(true)}>
                      <Plus size={16} /> Deposit
                    </button>
                  </div>
                </div>
                <div className="card flex items-center justify-between" style={{ background: '#f8fafc', borderColor: '#f1f5f9' }}>
                  <div className="flex gap-3">
                    <button className="btn btn-secondary"><Upload size={18} /> Import</button>
                    <button className="btn btn-secondary"><Download size={18} /> Export</button>
                  </div>
                  <button className="btn btn-primary font-bold">
                    <Plus size={18} /> Add Target
                  </button>
                </div>
              </div>
            </section>

            {/* Middle Section: Target Cards */}
            <section>
              <h2 className="section-title">Current Objective</h2>
              <div className="target-card">
                <div className="thumbnail-wrapper" onClick={() => setLightboxOpen(true)}>
                  <img src="/iphone.png" alt="Iphone 17 Pro Max" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?q=80&w=400&auto=format&fit=crop' }} />
                </div>
                
                <div className="target-info">
                  <h3 className="target-title">{goal.name}</h3>
                  <p>Target Date: {goal.date}</p>
                  
                  <div className="target-details">
                    <div className="detail-block">
                      <span>Saved Amount</span>
                      <span>{formatRupiah(goal.saved)}</span>
                    </div>
                    <div className="detail-block" style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '16px' }}>
                      <span>Target Amount</span>
                      <span>{formatRupiah(goal.target)}</span>
                    </div>
                  </div>
                </div>
                
                <DonutChart percentage={percentage} />
              </div>
            </section>

            {/* Bottom Section: Recent Activity / Transaction History */}
            <section>
              <h2 className="section-title">Transaction History</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Type</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 5).map((tx) => (
                      <tr key={tx.id}>
                        <td className="td-date">{tx.date}</td>
                        <td style={{ fontWeight: 600 }}>{tx.desc}</td>
                        <td>
                          {tx.type === 'deposit' ? (
                            <span className="badge positive"><ArrowUpRight size={14} /> Deposit</span>
                          ) : (
                            <span className="badge negative"><ArrowDownRight size={14} /> Withdraw</span>
                          )}
                        </td>
                        <td className={`td-amount ${tx.type === 'deposit' ? 'positive' : 'negative'}`} style={{ textAlign: 'right' }}>
                          {tx.type === 'deposit' ? '+' : '-'}{formatRupiah(tx.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* History Tab Content */}
        {activeTab === 'history' && (
           <section>
             <h2 className="section-title">All Transactions</h2>
             <div className="table-container">
               <table>
                 <thead>
                   <tr>
                     <th>Date</th>
                     <th>Description</th>
                     <th>Type</th>
                     <th style={{ textAlign: 'right' }}>Amount</th>
                   </tr>
                 </thead>
                 <tbody>
                   {transactions.map((tx) => (
                     <tr key={tx.id}>
                       <td className="td-date">{tx.date}</td>
                       <td style={{ fontWeight: 600 }}>{tx.desc}</td>
                       <td>
                         {tx.type === 'deposit' ? (
                           <span className="badge positive"><ArrowUpRight size={14} /> Deposit</span>
                         ) : (
                           <span className="badge negative"><ArrowDownRight size={14} /> Withdraw</span>
                         )}
                       </td>
                       <td className={`td-amount ${tx.type === 'deposit' ? 'positive' : 'negative'}`} style={{ textAlign: 'right' }}>
                         {tx.type === 'deposit' ? '+' : '-'}{formatRupiah(tx.amount)}
                       </td>
                     </tr>
                   ))}
                   {transactions.length === 0 && (
                     <tr>
                       <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }} className="text-secondary">
                         No transactions yet.
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
           </section>
        )}
        
        {/* Settings Tab Content */}
        {activeTab === 'settings' && (
           <section>
             <h2 className="section-title">Settings</h2>
             <div className="card">
               <p className="text-secondary">App configuration and preferences go here.</p>
             </div>
           </section>
        )}

      </main>
    </div>
  );
}
