import { useState, useEffect, useRef } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';
import { Download, Upload, Plus, PiggyBank, Sparkles, LogIn, LogOut, CheckCircle2 } from 'lucide-react';

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
};

export default function App() {
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('savings_goals');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', target: '', deadline: '' });
  
  const [depositModal, setDepositModal] = useState({ isOpen: false, goalId: null });
  const [depositAmount, setDepositAmount] = useState('');
  
  const [user, setUser] = useState(null);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('savings_goals', JSON.stringify(goals));
  }, [goals]);

  // AI Logic
  const getAIRecommendation = (goal) => {
    if (!goal.deadline || !goal.target) return null;
    const today = new Date();
    const targetDate = new Date(goal.deadline);
    const msDiff = targetDate - today;
    const daysLeft = Math.ceil(msDiff / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 0) return { error: 'Tenggat waktu sudah berlalu!' };
    
    const remaining = goal.target - goal.saved;
    if (remaining <= 0) return { success: 'Target sudah tercapai!' };
    
    const perDay = Math.ceil(remaining / daysLeft);
    const perMonth = Math.ceil(remaining / (daysLeft / 30.44));
    
    // Simulate savings days saved if user saves 50k per day
    const simDaily = 50000;
    const daysIfSim = Math.ceil(remaining / simDaily);
    const savedDays = daysLeft - daysIfSim;
    
    return {
      perDay,
      perMonth,
      daysLeft,
      simDaily,
      daysIfSim,
      savedDays: savedDays > 0 ? savedDays : 0,
    };
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.target || !newGoal.deadline) return;
    
    const goal = {
      id: uuidv4(),
      name: newGoal.name,
      target: Number(newGoal.target),
      saved: 0,
      deadline: newGoal.deadline,
      createdAt: new Date().toISOString()
    };
    
    setGoals([...goals, goal]);
    setNewGoal({ name: '', target: '', deadline: '' });
    setIsAddingGoal(false);
  };

  const handleDeposit = () => {
    const amount = Number(depositAmount);
    if (!amount || amount <= 0) return;
    
    setGoals(goals.map(g => {
      if (g.id === depositModal.goalId) {
        return { ...g, saved: g.saved + amount };
      }
      return g;
    }));
    
    setDepositAmount('');
    setDepositModal({ isOpen: false, goalId: null });
  };

  const quickDepositOptions = [5000, 10000, 20000, 50000, 100000];

  const handleQuickDeposit = (amount) => {
    setDepositAmount(amount.toString());
  };

  // CSV Import / Export
  const exportToCSV = () => {
    const csv = Papa.unparse(goals);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'tabungan_goals.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importFromCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const importedGoals = results.data.filter(row => row.id && row.name).map(row => ({
          ...row,
          target: Number(row.target),
          saved: Number(row.saved)
        }));
        setGoals(importedGoals);
      }
    });
  };

  const totalSaved = goals.reduce((acc, curr) => acc + curr.saved, 0);
  const totalTarget = goals.reduce((acc, curr) => acc + curr.target, 0);

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <div className="container">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="flex items-center gap-2">
              <PiggyBank className="text-accent" size={32} />
              MinimaSave
            </h1>
            <p className="text-muted">Capai impianmu, satu rupiah pada satu waktu.</p>
          </div>
          <div className="flex gap-2">
            {!user ? (
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  console.log(credentialResponse);
                  setUser({ name: "Google User" }); // Mock user
                }}
                onError={() => {
                  console.log('Login Failed');
                }}
                useOneTap
                auto_select={false}
              />
            ) : (
              <div className="flex items-center gap-4">
                <span className="font-medium text-sm">Hi, {user.name}</span>
                <button className="btn btn-secondary" onClick={() => setUser(null)}>
                  <LogOut size={16} /> Keluar
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Dashboard Actions */}
        <div className="card mb-8">
          <div className="flex justify-between flex-wrap gap-4 items-center">
            <div>
              <p className="text-muted text-sm mt-2">Total Terkumpul</p>
              <h2>{formatRupiah(totalSaved)} <span className="text-muted text-sm font-normal">/ {formatRupiah(totalTarget)}</span></h2>
            </div>
            <div className="flex gap-2">
               <input 
                  type="file" 
                  accept=".csv" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={importFromCSV} 
                />
              <button className="btn btn-secondary" onClick={() => fileInputRef.current.click()}>
                <Upload size={18} /> Impor
              </button>
              <button className="btn btn-secondary" onClick={exportToCSV}>
                <Download size={18} /> Ekspor
              </button>
              <button className="btn btn-primary" onClick={() => setIsAddingGoal(!isAddingGoal)}>
                <Plus size={18} /> Tambah Target
              </button>
            </div>
          </div>
        </div>

        {/* Add Goal Form */}
        {isAddingGoal && (
          <div className="card mb-8">
            <h3 className="mb-4">Target Baru</h3>
            <form onSubmit={handleAddGoal} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nama Impian (mis. MacBook Pro)</label>
                <input 
                  type="text" 
                  value={newGoal.name} 
                  onChange={(e) => setNewGoal({...newGoal, name: e.target.value})} 
                  placeholder="Masukkan nama impian..."
                  required 
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Nominal Target</label>
                <input 
                  type="number" 
                  value={newGoal.target} 
                  onChange={(e) => setNewGoal({...newGoal, target: e.target.value})} 
                  placeholder="Contoh: 25000000"
                  required 
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tenggat Waktu</label>
                <input 
                  type="date" 
                  value={newGoal.deadline} 
                  onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})} 
                  required 
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button type="submit" className="btn btn-primary">Simpan Target</button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddingGoal(false)}>Batal</button>
              </div>
            </form>
          </div>
        )}

        {/* Goals List */}
        <div className="flex flex-col gap-6">
          {goals.map(goal => {
            const percentage = Math.min((goal.saved / goal.target) * 100, 100).toFixed(1);
            const isCompleted = goal.saved >= goal.target;
            const ai = getAIRecommendation(goal);

            return (
              <div key={goal.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="flex items-center gap-2">
                      {goal.name} {isCompleted && <CheckCircle2 className="text-accent" size={20} />}
                    </h3>
                    <p className="text-sm text-muted mt-2">Masih kurang {formatRupiah(Math.max(goal.target - goal.saved, 0))}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{percentage}%</p>
                    <p className="text-sm text-muted text-right mt-1">{formatRupiah(goal.saved)} dari {formatRupiah(goal.target)}</p>
                  </div>
                </div>

                <div className="progress-container mb-6">
                  <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
                </div>

                {/* AI Assistant Section */}
                {!isCompleted && ai && !ai.error && !ai.success && (
                  <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#f0f0f0', border: '1px solid #e1e1e1' }}>
                    <div className="flex gap-2 items-center mb-2 font-medium">
                      <Sparkles size={18} /> Saran AI Financial
                    </div>
                    <p className="text-sm mb-2">
                      Untuk mencapai target dalam {ai.daysLeft} hari, kami sarankan Anda menabung:
                    </p>
                    <ul className="text-sm space-y-1 mb-3 pl-4 list-disc text-muted font-medium">
                      <li>{formatRupiah(ai.perDay)} / hari</li>
                      <li>{formatRupiah(ai.perMonth)} / bulan</li>
                    </ul>
                    <div className="text-sm mt-3 pt-3 border-t" style={{ borderColor: '#ddd' }}>
                      <strong>Wawasan Berhemat:</strong> Jika Anda disiplin menyisihkan <strong>{formatRupiah(ai.simDaily)}/hari</strong>, Anda bisa mencapai target dan menghemat waktu pencapaian sebanyak <strong>{ai.savedDays} hari</strong> lebih cepat!
                    </div>
                  </div>
                )}

                {!isCompleted && (
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setDepositModal({ isOpen: true, goalId: goal.id })}
                  >
                    Nabung Sekarang
                  </button>
                )}
              </div>
            );
          })}
          
          {goals.length === 0 && !isAddingGoal && (
            <div className="text-center py-12 border-2 border-dashed rounded-xl border-gray-200">
              <PiggyBank size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-gray-500">Belum ada target tabungan.</h3>
              <p className="text-gray-400 text-sm mt-2">Mulai dengan menambahkan impian pertama Anda.</p>
            </div>
          )}
        </div>

        {/* Deposit Modal */}
        {depositModal.isOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="mb-4">Setor Tabungan</h3>
              <p className="text-sm text-muted mb-6">Pilih nominal cepat atau masukkan jumlah kustom.</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {quickDepositOptions.map(amount => (
                  <button 
                    key={amount} 
                    className="btn-quick"
                    onClick={() => handleQuickDeposit(amount)}
                  >
                    +{formatRupiah(amount).replace('Rp', '')}
                  </button>
                ))}
              </div>
              
              <div className="mb-6">
                <input 
                  type="number" 
                  placeholder="Atau ketik nominal..." 
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  autoFocus
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <button className="btn btn-secondary" onClick={() => setDepositModal({ isOpen: false, goalId: null })}>Batal</button>
                <button className="btn btn-primary" onClick={handleDeposit}>Setor</button>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </GoogleOAuthProvider>
  );
}
