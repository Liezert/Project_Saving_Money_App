import { useState, useEffect } from 'react';
import { 
  Plus, Upload, Download, LayoutDashboard, History, Settings, LogOut, 
  ArrowUpRight, ArrowDownRight, Bell, Search, Minus, Trash2
} from 'lucide-react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import { getDb, addTransaction as addTxDb, deleteExpense as deleteTxDb } from './db';

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
};

const DonutChart = ({ percentage }) => {
  const radius = 50;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

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
  const [user, setUser] = useState(null);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isDepositModal, setIsDepositModal] = useState(false);
  const [isWithdrawModal, setIsWithdrawModal] = useState(false);
  const [transactionAmount, setTransactionAmount] = useState('');

  const [goal, setGoal] = useState({ saved: 0, target: 1 });
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const loggedUser = localStorage.getItem('logged_user');
    if (loggedUser) {
      const parsedUser = JSON.parse(loggedUser);
      setUser(parsedUser.profile);
      loadUserData(parsedUser.profile.id);
    }
  }, []);

  const loadUserData = (userId) => {
    const dbData = getDb(userId);
    setGoal(dbData.goal);
    setTransactions(dbData.transactions);
  };

  const handleLoginSuccess = async (tokenResponse) => {
    try {
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      const profile = await userInfoResponse.json();
      
      const userData = {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        picture: profile.picture
      };
      
      setUser(userData);
      localStorage.setItem('logged_user', JSON.stringify({ ...tokenResponse, profile: userData }));
      loadUserData(userData.id);
    } catch (err) {
      console.error('Failed to fetch user profile', err);
    }
  };

  const login = useGoogleLogin({
    onSuccess: handleLoginSuccess,
    onError: () => console.log('Login failed')
  });

  const handleLogout = () => {
    googleLogout();
    setUser(null);
    localStorage.removeItem('logged_user');
  };

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

    if (user) {
      const updatedDb = addTxDb(user.id, newTx);
      setGoal(updatedDb.goal);
      setTransactions(updatedDb.transactions);
    }

    setTransactionAmount('');
    setIsDepositModal(false);
    setIsWithdrawModal(false);
  };

  const handleDeleteExpense = (id) => {
    if (user) {
      const updatedDb = deleteTxDb(user.id, id);
      setGoal(updatedDb.goal);
      setTransactions(updatedDb.transactions);
    }
  };

  const totalSaved = goal.saved || 0;
  // Calculate percentage safely
  let percentage = 0;
  if (goal.target && goal.target > 0) {
    percentage = Math.min(Math.round((totalSaved / goal.target) * 100), 100);
  }

  // --- Login Screen Render ---
  if (!user) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-logo">
             <div style={{ width: 48, height: 48, background: 'var(--accent-color)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <span style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 'bold' }}>N</span>
             </div>
             <h2>NabungDong</h2>
          </div>
          <h1 className="login-title">Smart Financial Database</h1>
          <p className="login-subtitle">Sync your goals seamlessly and keep track of your savings securely linked to your Google ID.</p>
          <button onClick={() => login()} className="btn-google">
            <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M23.745 12.27c0-.825-.07-1.62-.2-2.38H12.24v4.66h6.456a5.535 5.535 0 0 1-2.39 3.63v3.01h3.868c2.26-2.08 3.57-5.15 3.57-8.92Z"/>
                <path fill="#34A853" d="M12.24 24c3.24 0 5.95-1.07 7.935-2.89l-3.868-3.01c-1.075.72-2.45 1.145-4.067 1.145-3.13 0-5.785-2.115-6.735-4.96H1.52v3.135C3.51 21.365 7.55 24 12.24 24Z"/>
                <path fill="#FBBC05" d="M5.505 14.285c-.245-.72-.385-1.49-.385-2.285 0-.795.14-1.565.385-2.285V6.58H1.52C.555 8.5 0 10.665 0 12s.555 3.5 1.52 5.42l3.985-3.135Z"/>
                <path fill="#EA4335" d="M12.24 4.755c1.765 0 3.35.61 4.595 1.79l3.435-3.435C18.18 1.135 15.47 0 12.24 0 7.55 0 3.51 2.635 1.52 6.58l3.985 3.135c.95-2.845 3.605-4.96 6.735-4.96Z"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  // --- Main Dashboard Render ---
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
          <img src={user.picture || "https://i.pravatar.cc/150?img=11"} alt="User Avatar" className="avatar" />
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-email">{user.email}</div>
          </div>
          <button className="btn-logout" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div>
            <div className="greeting">Good Morning, {user.name.split(' ')[0]}</div>
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
                      <th></th>
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
                        <td style={{ width: '40px', textAlign: 'center' }}>
                          {tx.type === 'withdraw' && (
                            <button className="btn-icon text-secondary hover-danger" title="Delete Expense (Correct Data)" onClick={() => handleDeleteExpense(tx.id)}>
                              <Trash2 size={16} />
                            </button>
                          )}
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
                     <th></th>
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
                       <td style={{ width: '40px', textAlign: 'center' }}>
                         {tx.type === 'withdraw' && (
                           <button className="btn-icon text-secondary hover-danger" title="Delete Expense (Correct Data)" onClick={() => handleDeleteExpense(tx.id)}>
                             <Trash2 size={16} />
                           </button>
                         )}
                       </td>
                     </tr>
                   ))}
                   {transactions.length === 0 && (
                     <tr>
                       <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }} className="text-secondary">
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
               <p className="text-secondary">Account connected to: <strong>{user.email}</strong> (Google)</p>
             </div>
           </section>
        )}
      </main>
    </div>
  );
}
