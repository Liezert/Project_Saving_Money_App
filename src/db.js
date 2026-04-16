// src/db.js
const DB_PREFIX = 'smart_financial_db_';

const initialGoal = {
  name: 'Iphone 17 Pro Max',
  target: 50000000,
  saved: 51450001,
  date: '12 Nov 2026'
};

const initialTransactions = [
  { id: 1, date: '15 Apr 2026', desc: 'Setoran Bulanan (Gaji)', amount: 15000000, type: 'deposit' },
  { id: 2, date: '10 Apr 2026', desc: 'Beli Case Loly Poly', amount: 350000, type: 'withdraw' },
  { id: 3, date: '01 Apr 2026', desc: 'Setoran Uang Lembur', amount: 4500000, type: 'deposit' },
  { id: 4, date: '28 Mar 2026', desc: 'Setoran Bonus Akhir Tahun', amount: 32300001, type: 'deposit' },
];

export const getDb = (userId) => {
  const key = `${DB_PREFIX}${userId}`;
  const data = localStorage.getItem(key);
  if (data) {
    return JSON.parse(data);
  }
  
  // Default data for new user
  const newData = {
    goal: { ...initialGoal },
    transactions: [...initialTransactions]
  };
  localStorage.setItem(key, JSON.stringify(newData));
  return newData;
};

export const saveDb = (userId, data) => {
  const key = `${DB_PREFIX}${userId}`;
  localStorage.setItem(key, JSON.stringify(data));
};

export const addTransaction = (userId, transaction) => {
  const db = getDb(userId);
  db.transactions = [transaction, ...db.transactions];
  
  // Update saved amount
  if (transaction.type === 'deposit') {
    db.goal.saved += transaction.amount;
  } else if (transaction.type === 'withdraw') {
    db.goal.saved = Math.max(0, db.goal.saved - transaction.amount);
  }
  
  saveDb(userId, db);
  return db;
};

export const deleteExpense = (userId, transactionId) => {
  const db = getDb(userId);
  const transaction = db.transactions.find(t => t.id === transactionId);
  
  // We only allow deleting expenses (withdraw) as per requirement: "opsi menghapus catatan pengeluaran"
  // to correct input mistakes without destroying data integrity.
  if (transaction && transaction.type === 'withdraw') {
    // Return the money to savings
    db.goal.saved += transaction.amount;
    // Remove transaction
    db.transactions = db.transactions.filter(t => t.id !== transactionId);
    saveDb(userId, db);
  }
  
  return db;
};
