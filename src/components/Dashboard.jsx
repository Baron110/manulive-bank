import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, serverTimestamp } from 'firebase/firestore';

// Material UI imports
import {
    AppBar, Toolbar, Typography, Button, Container, Grid,
    Paper, TextField, Avatar, IconButton,
    Box, Alert, Snackbar, BottomNavigation, BottomNavigationAction,
    Divider, Chip, Modal, Fade, Backdrop, Tab, Tabs,
    LinearProgress, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Select, MenuItem, FormControl, InputLabel,
    Stepper, Step, StepLabel, InputAdornment, CircularProgress,
    Checkbox, FormControlLabel, useMediaQuery, useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    AccountBalance, Send, RequestPage, Payment, AddCard,
    Home, TrendingUp, Person, Notifications,
    ArrowUpward, ArrowDownward, Logout, Close,
    Security, Lock, Email as EmailIcon,
    Visibility, VisibilityOff, AccountBalanceWallet, CreditCard,
    Phone, LocationOn, Flag, Cake, Edit, MoreHoriz
} from '@mui/icons-material';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    BarElement
} from 'chart.js';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    Title, Tooltip, Legend, ArcElement, BarElement
);

// Styled components - CLEAN BLACK/DARK THEME
const BalanceCard = styled(Paper)(({ theme }) => ({
    background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
    color: 'white',
    borderRadius: '20px',
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
}));

const ActionButton = styled(Button)(({ theme }) => ({
    borderRadius: '12px',
    padding: theme.spacing(1.5),
    flexDirection: 'column',
    gap: theme.spacing(1),
    backgroundColor: '#F0F2F5',
    color: '#1A1A2E',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.7rem',
    '&:hover': {
        backgroundColor: '#E4E6E9',
        transform: 'translateY(-2px)',
    }
}));

const DarkButton = styled(Button)(({ theme }) => ({
    background: '#1A1A2E',
    color: 'white',
    padding: '10px',
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    '&:hover': {
        background: '#2A2A3E',
    }
}));

// ==================== GENERATE 70+ TRANSACTIONS (DEBITS & CREDITS) ====================
const generateFullTransactionHistory = (startingBalance, userType = 'regular') => {
    const transactions = [];
    let currentBalance = startingBalance;
    let id = 1;
    
    // Start from Jan 2023 to present (over 3 years of transactions)
    const startDate = new Date(2023, 0, 1);
    const endDate = new Date(2026, 4, 15);
    const dates = [];
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + Math.floor(Math.random() * 5) + 2)) {
        dates.push(new Date(d));
    }
    
    // Credit transactions (money in)
    const credits = [
        { name: 'Salary Deposit', category: 'SALARY', minAmount: 3000, maxAmount: 8000 },
        { name: 'Freelance Payment', category: 'INCOME', minAmount: 500, maxAmount: 2500 },
        { name: 'Investment Return', category: 'INVESTMENT', minAmount: 1000, maxAmount: 5000 },
        { name: 'Client Payment', category: 'BUSINESS', minAmount: 2000, maxAmount: 10000 },
        { name: 'Dividend Payout', category: 'DIVIDEND', minAmount: 200, maxAmount: 1500 },
        { name: 'Tax Refund', category: 'REFUND', minAmount: 500, maxAmount: 2000 },
        { name: 'Bonus Payment', category: 'BONUS', minAmount: 1000, maxAmount: 3000 },
        { name: 'Rental Income', category: 'INCOME', minAmount: 1500, maxAmount: 2500 },
        { name: 'Stock Gains', category: 'INVESTMENT', minAmount: 500, maxAmount: 4000 },
        { name: 'Gift Received', category: 'GIFT', minAmount: 100, maxAmount: 1000 }
    ];
    
    // Debit transactions (money out)
    const debits = [
        { name: 'Amazon Purchase', category: 'SHOPPING', minAmount: 50, maxAmount: 500 },
        { name: 'Netflix Subscription', category: 'ENTERTAINMENT', minAmount: 15, maxAmount: 20 },
        { name: 'Starbucks', category: 'DINING', minAmount: 5, maxAmount: 25 },
        { name: 'Uber Ride', category: 'TRANSPORT', minAmount: 15, maxAmount: 60 },
        { name: 'Electric Bill', category: 'BILLS', minAmount: 80, maxAmount: 200 },
        { name: 'Rent Payment', category: 'RENT', minAmount: 1200, maxAmount: 2000 },
        { name: 'Groceries', category: 'GROCERIES', minAmount: 100, maxAmount: 300 },
        { name: 'Dining Out', category: 'DINING', minAmount: 40, maxAmount: 150 },
        { name: 'Phone Bill', category: 'BILLS', minAmount: 50, maxAmount: 100 },
        { name: 'Internet Bill', category: 'BILLS', minAmount: 60, maxAmount: 120 },
        { name: 'Gas Station', category: 'TRANSPORT', minAmount: 30, maxAmount: 80 },
        { name: 'Movie Tickets', category: 'ENTERTAINMENT', minAmount: 20, maxAmount: 50 },
        { name: 'Clothing Store', category: 'SHOPPING', minAmount: 50, maxAmount: 200 },
        { name: 'Pharmacy', category: 'HEALTH', minAmount: 20, minAmount: 100 }
    ];
    
    // Special handling for Baron Quinn (vendor)
    if (userType === 'vendor') {
        credits.push({ name: 'Market Sales', category: 'SALES', minAmount: 2000, maxAmount: 15000 });
        credits.push({ name: 'Product Wholesale', category: 'BUSINESS', minAmount: 5000, maxAmount: 20000 });
        debits.push({ name: 'Inventory Purchase', category: 'BUSINESS', minAmount: 500, maxAmount: 3000 });
        debits.push({ name: 'Booth Rental', category: 'RENT', minAmount: 1000, minAmount: 2000 });
    }
    
    for (let i = 0; i < dates.length && transactions.length < 75; i++) {
        const date = dates[i];
        // 60% credits, 40% debits to maintain positive balance
        const isCredit = Math.random() > 0.4;
        
        let amount, name, category;
        
        if (isCredit) {
            const credit = credits[Math.floor(Math.random() * credits.length)];
            amount = Math.floor(Math.random() * (credit.maxAmount - credit.minAmount + 1)) + credit.minAmount;
            name = credit.name;
            category = credit.category;
            currentBalance += amount;
        } else {
            const debit = debits[Math.floor(Math.random() * debits.length)];
            amount = Math.floor(Math.random() * (debit.maxAmount - debit.minAmount + 1)) + debit.minAmount;
            name = debit.name;
            category = debit.category;
            currentBalance -= amount;
        }
        
        transactions.push({
            id: id++,
            name: name,
            amount: amount,
            type: isCredit ? 'received' : 'sent',
            category: category,
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: `${Math.floor(Math.random() * 12) + 1}:${Math.random() > 0.5 ? '30' : '00'} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
            status: 'completed'
        });
    }
    
    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return transactions;
};

// ==================== HARDCODED USER DATA ====================
const usersData = {
    'baronquin500@gmail.com': {
        firstName: 'Baron',
        lastName: 'Quinn',
        fullName: 'Baron Quin Quinn',
        email: 'baronquin500@gmail.com',
        username: 'BARON-QUIN',
        phone: '+1 (505) 555-0123',
        country: 'United States',
        state: 'New Mexico',
        city: 'Albuquerque',
        address: '1234 Central Ave SW, Albuquerque, NM 87104',
        dateOfBirth: '02/02/2002',
        balance: 500000,
        currency: 'USD',
        currencySymbol: '$',
        accountType: 'Gold Elite',
        occupation: 'VENDOR',
        gender: 'Male',
        memberSince: 'January 2023',
        creditScore: 720,
        pin: '5000',
        cardDesign: 'black',
        cardType: 'credit',
        cardLimit: 100000,
        billingMessage: null,
        accountNumber: 'QC' + Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0'),
        transactions: generateFullTransactionHistory(500000, 'vendor')
    },
    'caitlinelizabeth200@gmail.com': {
        firstName: 'Caitlin',
        lastName: 'Clark',
        fullName: 'Caitlin Elizabeth Clark',
        email: 'caitlinelizabeth200@gmail.com',
        username: 'Caitlin2026',
        phone: '+1 (317) 555-1234',
        country: 'USA',
        state: 'Indiana',
        city: 'Indianapolis',
        address: '123 Gainbridge Fieldhouse, Indianapolis, IN 46201',
        dateOfBirth: '22 January 2002',
        balance: 10000000,
        currency: 'USD',
        currencySymbol: '$',
        accountType: 'Platinum Elite',
        occupation: 'Basketball Player',
        gender: 'Female',
        memberSince: 'January 2023',
        creditScore: 780,
        pin: '2002',
        cardDesign: 'black',
        cardType: 'credit',
        cardLimit: 250000,
        billingMessage: 'Unable to process transaction due to unpaid maintenance fees.',
        accountNumber: 'CC' + Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0'),
        transactions: generateFullTransactionHistory(10000000, 'sports')
    },
    'dollyrparton945@gmail.com': {
        firstName: 'Dolly',
        lastName: 'Parton',
        fullName: 'Dolly Rebecca Parton',
        email: 'dollyrparton945@gmail.com',
        username: 'DollyWood46',
        phone: '+1 (616) 321-2741',
        country: 'USA',
        state: 'Tennessee',
        city: 'Nashville',
        address: '9510 Crockett Rd, Brentwood, TN 37027',
        dateOfBirth: '19 January 1946',
        balance: 500000,
        currency: 'USD',
        currencySymbol: '$',
        accountType: 'Gold Elite',
        occupation: 'Singer',
        gender: 'Female',
        memberSince: 'January 2023',
        creditScore: 810,
        pin: '9643',
        cardDesign: 'black',
        cardType: 'credit',
        cardLimit: 100000,
        billingMessage: null,
        accountNumber: 'DP' + Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0'),
        transactions: generateFullTransactionHistory(500000, 'entertainment')
    },
    'adambeach001@gmail.com': {
        firstName: 'Rueben',
        lastName: 'Beach',
        fullName: 'Rueben Adam Beach',
        email: 'adambeach001@gmail.com',
        username: 'Adam R beach',
        phone: '+1 213 556 8675',
        country: 'Canada',
        state: 'Manitoba',
        city: 'Winnipeg',
        address: '383 McMillan Ave, Winnipeg, MB R3L ON3, Canada',
        dateOfBirth: '11/11/1972',
        balance: 100000,
        currency: 'CAD',
        currencySymbol: '$',
        accountType: 'Investment Platinum',
        occupation: 'Actor',
        gender: 'Male',
        memberSince: 'January 2023',
        creditScore: 750,
        pin: '1122',
        cardDesign: 'black',
        cardType: 'credit',
        cardLimit: 50000,
        billingMessage: 'Please complete your payment to be able to withdraw your funds',
        accountNumber: 'RB' + Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0'),
        transactions: generateFullTransactionHistory(100000, 'entertainment')
    }
};

const defaultUser = {
    firstName: 'Demo',
    lastName: 'User',
    fullName: 'Demo User',
    email: '',
    username: '',
    phone: 'Not set',
    country: 'Demo',
    state: '',
    city: '',
    address: 'Not set',
    dateOfBirth: 'Not set',
    balance: 0,
    currency: 'USD',
    currencySymbol: '$',
    accountType: 'Standard',
    occupation: '',
    gender: '',
    memberSince: '',
    creditScore: 0,
    pin: '',
    cardDesign: 'black',
    cardType: 'debit',
    cardLimit: 25000,
    billingMessage: null,
    accountNumber: 'DEMO' + Math.floor(Math.random() * 1000000000),
    transactions: []
};

function Dashboard() {
    const currentUser = auth.currentUser;
    const rawEmail = currentUser?.email || '';
    const userEmail = rawEmail.trim().toLowerCase();
    const hardcodedUser = usersData[userEmail];
    const hasBillingMessage = !!hardcodedUser?.billingMessage;
    const isMoneyMavenUser = userEmail === 'adambeach001@gmail.com';
    
    // Mobile responsive hook
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [balance, setBalance] = useState(hardcodedUser?.balance || 0);
    const [transactions, setTransactions] = useState(hardcodedUser?.transactions || []);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ show: false, text: '', type: 'success' });
    const [navValue, setNavValue] = useState(0);
    const [tabValue, setTabValue] = useState(0);
    const [editMode, setEditMode] = useState(false);
    const [editName, setEditName] = useState(hardcodedUser?.fullName || '');
    const [editPhone, setEditPhone] = useState(hardcodedUser?.phone || '');
    const [editAddress, setEditAddress] = useState(hardcodedUser?.address || '');

    // Modal states
    const [sendModal, setSendModal] = useState(false);
    const [requestModal, setRequestModal] = useState(false);
    const [payBillsModal, setPayBillsModal] = useState(false);
    const [topUpModal, setTopUpModal] = useState(false);
    const [profileModal, setProfileModal] = useState(false);

    // Transfer form states
    const [recipientAccount, setRecipientAccount] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [recipientBank, setRecipientBank] = useState('');
    const [amount, setAmount] = useState('');
    const [transferPurpose, setTransferPurpose] = useState('');
    const [transferStep, setTransferStep] = useState(0);
    const [depositAmount, setDepositAmount] = useState('');
    const [showCVV, setShowCVV] = useState(false);
    const [addNote, setAddNote] = useState('');

    const user = hardcodedUser || {
        ...defaultUser,
        email: userEmail,
        firstName: currentUser?.displayName?.split(' ')[0] || 'User',
        fullName: currentUser?.displayName || 'User',
    };

    const issuedCard = {
        cardholderName: user.fullName,
        maskedNumber: '**** **** **** ' + (user.pin || '0000').slice(-4),
        expiryDate: '12/27',
        cvv: Math.floor(Math.random() * 900 + 100).toString(),
        cardDesign: user.cardDesign,
        cardType: user.cardType,
        limit: user.cardLimit
    };

    const bankDisplayName = isMoneyMavenUser ? 'MONEY MAVEN' : 'QuinCore';

    const formatCurrency = (amt) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: user.currency === 'CAD' ? 'CAD' : 'USD',
            minimumFractionDigits: 2
        }).format(amt);
    };

    const showMessage = (text, type) => {
        setMessage({ show: true, text, type });
        setTimeout(() => setMessage(prev => ({ ...prev, show: false })), 6000);
    };

    const resetTransferForm = () => {
        setRecipientAccount('');
        setRecipientName('');
        setRecipientBank('');
        setAmount('');
        setTransferPurpose('');
        setAddNote('');
    };

    // Firestore persistence
    const loadUserDataFromFirestore = async () => {
        if (!currentUser) return;
        
        setLoading(true);
        try {
            const userDocRef = doc(db, 'bankUsers', currentUser.uid);
            const docSnap = await getDoc(userDocRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                setBalance(data.balance || (hardcodedUser?.balance || 0));
                setTransactions(data.transactions || hardcodedUser?.transactions || []);
            } else if (hardcodedUser) {
                await setDoc(userDocRef, {
                    email: userEmail,
                    balance: hardcodedUser.balance,
                    transactions: hardcodedUser.transactions,
                    lastUpdated: serverTimestamp()
                });
                setBalance(hardcodedUser.balance);
                setTransactions(hardcodedUser.transactions);
            }
        } catch (error) {
            console.error('Error loading from Firestore:', error);
            if (hardcodedUser) {
                setBalance(hardcodedUser.balance);
                setTransactions(hardcodedUser.transactions);
            }
        } finally {
            setLoading(false);
        }
    };

    const saveToFirestore = async (newBalance, newTransactions) => {
        if (!currentUser) return;
        
        try {
            const userDocRef = doc(db, 'bankUsers', currentUser.uid);
            await updateDoc(userDocRef, {
                balance: newBalance,
                transactions: newTransactions,
                lastUpdated: serverTimestamp()
            });
        } catch (error) {
            console.error('Error saving to Firestore:', error);
        }
    };

    useEffect(() => {
        loadUserDataFromFirestore();
    }, [currentUser]);

    const updateProfile = () => {
        if (hasBillingMessage) {
            showMessage('Profile editing is disabled for this account', 'warning');
            return;
        }
        setEditMode(false);
        showMessage('Profile updated successfully!', 'success');
    };

    const handleSendMoney = async () => {
        if (hasBillingMessage) {
            showMessage(user.billingMessage, 'error');
            setSendModal(false);
            setTransferStep(0);
            resetTransferForm();
            return;
        }

        if (!recipientAccount || !amount) {
            showMessage('Please fill all fields', 'error');
            return;
        }
        
        const transferAmount = parseFloat(amount);
        if (transferAmount <= 0 || transferAmount > balance) {
            showMessage('Invalid amount or insufficient funds', 'error');
            return;
        }
        
        const newBalance = balance - transferAmount;
        const newTransaction = {
            id: Date.now(),
            name: `Transfer to ${recipientName || recipientAccount}`,
            amount: -transferAmount,
            type: 'sent',
            category: 'TRANSFER',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: new Date().toLocaleTimeString(),
            status: 'completed',
            note: addNote || transferPurpose || 'Money transfer'
        };
        
        const updatedTransactions = [newTransaction, ...transactions];
        setBalance(newBalance);
        setTransactions(updatedTransactions);
        await saveToFirestore(newBalance, updatedTransactions);
        
        showMessage(`✅ Successfully sent ${formatCurrency(transferAmount)}`, 'success');
        setSendModal(false);
        resetTransferForm();
        setTransferStep(0);
    };

    const handleDeposit = async () => {
        if (hasBillingMessage) {
            showMessage(user.billingMessage, 'error');
            setTopUpModal(false);
            return;
        }
        
        const depositAmountNum = parseFloat(depositAmount);
        if (depositAmountNum <= 0) {
            showMessage('Please enter a valid amount', 'error');
            return;
        }
        
        const newBalance = balance + depositAmountNum;
        const newTransaction = {
            id: Date.now(),
            name: 'Deposit',
            amount: depositAmountNum,
            type: 'deposit',
            category: 'DEPOSIT',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: new Date().toLocaleTimeString(),
            status: 'completed'
        };
        
        const updatedTransactions = [newTransaction, ...transactions];
        setBalance(newBalance);
        setTransactions(updatedTransactions);
        await saveToFirestore(newBalance, updatedTransactions);
        
        showMessage(`💰 Successfully deposited ${formatCurrency(depositAmountNum)}`, 'success');
        setTopUpModal(false);
        setDepositAmount('');
    };

    const handleRequestMoney = () => {
        if (hasBillingMessage) {
            showMessage(user.billingMessage, 'error');
            setRequestModal(false);
            return;
        }
        
        if (!recipientAccount || !amount) {
            showMessage('Please fill all fields', 'error');
            return;
        }
        
        showMessage(`💰 Request sent to ${recipientAccount} for ${formatCurrency(parseFloat(amount))}`, 'success');
        setRequestModal(false);
        resetTransferForm();
    };

    const handlePayBill = async () => {
        if (hasBillingMessage) {
            showMessage(user.billingMessage, 'error');
            setPayBillsModal(false);
            return;
        }
        
        if (!transferPurpose || !amount) {
            showMessage('Please select bill type and enter amount', 'error');
            return;
        }
        
        const billAmount = parseFloat(amount);
        if (billAmount <= 0 || billAmount > balance) {
            showMessage('Invalid amount or insufficient funds', 'error');
            return;
        }
        
        const newBalance = balance - billAmount;
        const newTransaction = {
            id: Date.now(),
            name: `Bill payment - ${transferPurpose}`,
            amount: -billAmount,
            type: 'bill_payment',
            category: 'BILLS',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: new Date().toLocaleTimeString(),
            status: 'completed'
        };
        
        const updatedTransactions = [newTransaction, ...transactions];
        setBalance(newBalance);
        setTransactions(updatedTransactions);
        await saveToFirestore(newBalance, updatedTransactions);
        
        showMessage(`📄 Bill payment of ${formatCurrency(billAmount)} to ${transferPurpose} successful`, 'success');
        setPayBillsModal(false);
        setTransferPurpose('');
        setAmount('');
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
        } catch (error) {
            showMessage('Logout failed: ' + error.message, 'error');
        }
    };

    const transferSteps = ['Recipient', 'Amount', 'Confirm'];

    // Chart data
    const spendingData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Spending',
            data: [12400, 18900, 15200, 22100, 18300, 24200],
            borderColor: '#1A1A2E',
            backgroundColor: 'rgba(26,26,46,0.1)',
            tension: 0.4
        }]
    };

    const categoryData = {
        labels: ['Shopping', 'Dining', 'Bills', 'Transport', 'Entertainment'],
        datasets: [{
            data: [30, 25, 20, 15, 10],
            backgroundColor: ['#1A1A2E', '#2A2A3E', '#3A3A4E', '#4A4A5E', '#5A5A6E']
        }]
    };

    const monthlyData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
            { label: 'Income', data: [28500, 29200, 28800, 29500], backgroundColor: '#4CAF50' },
            { label: 'Expenses', data: [16200, 16800, 16400, 17100], backgroundColor: '#f44336' }
        ]
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress sx={{ color: '#1A1A2E' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: '#F5F7FA', minHeight: '100vh', pb: 7 }}>
            {/* Top Header - CLEAN BLACK */}
            <AppBar position="static" sx={{ 
                bgcolor: 'white', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}>
                <Toolbar sx={{ justifyContent: 'space-between', py: 1, flexDirection: isMobile ? 'column' : 'row', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: isMobile ? 1 : 0 }}>
                        <Avatar sx={{ bgcolor: '#1A1A2E', width: 40, height: 40 }}>
                            <AccountBalanceWallet sx={{ fontSize: 22 }} />
                        </Avatar>
                        <Typography 
                            variant="h5" 
                            sx={{ 
                                fontWeight: 700,
                                color: '#1A1A2E',
                                fontFamily: '"Inter", "Segoe UI", sans-serif',
                                letterSpacing: '-0.5px'
                            }}
                        >
                            {bankDisplayName}
                        </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton size="small"><Notifications sx={{ color: '#1A1A2E', fontSize: 22 }} /></IconButton>
                        <IconButton onClick={handleLogout} size="small"><Logout sx={{ color: '#dc004e', fontSize: 22 }} /></IconButton>
                        <IconButton onClick={() => setProfileModal(true)} size="small">
                            <Avatar sx={{ bgcolor: '#1A1A2E', width: 32, height: 32, fontSize: '0.9rem' }}>
                                {user.firstName?.charAt(0) || 'U'}
                            </Avatar>
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 2, mb: 4, px: isMobile ? 1 : 3 }}>
                {/* Welcome Section - COMPACT */}
                <Paper sx={{ p: 2, mb: 2, bgcolor: '#1A1A2E', color: 'white', borderRadius: '16px' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Welcome back, {user.firstName}!</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.8rem' }}>{user.email}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.6, display: 'block', mt: 0.5 }}>Account: {user.accountNumber}</Typography>
                    
                    {hasBillingMessage && (
                        <Chip label="⚠️ ACCOUNT DISABLED" size="small" sx={{ mt: 1, bgcolor: '#dc004e', color: 'white', height: 24, fontSize: '0.7rem' }} />
                    )}
                </Paper>

                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2, minHeight: 40, '& .MuiTab-root': { fontSize: '0.8rem', py: 1 } }}>
                    <Tab label="Home" />
                    <Tab label="History" />
                    <Tab label="Profile" />
                </Tabs>

                {/* HOME TAB */}
                {tabValue === 0 && (
                    <>
                        <BalanceCard elevation={0}>
                            <Typography variant="body2" sx={{ opacity: 0.7, mb: 0.5, fontSize: '0.75rem' }}>TOTAL BALANCE</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>{formatCurrency(balance)}</Typography>
                            <Typography variant="caption" sx={{ opacity: 0.6 }}>{user.accountType}</Typography>
                        </BalanceCard>

                        <Grid container spacing={1.5} sx={{ mb: 2 }}>
                            <Grid item xs={3}>
                                <ActionButton fullWidth onClick={() => setSendModal(true)}>
                                    <Send sx={{ fontSize: 20 }} />
                                    <Typography variant="caption">SEND</Typography>
                                </ActionButton>
                            </Grid>
                            <Grid item xs={3}>
                                <ActionButton fullWidth onClick={() => setRequestModal(true)}>
                                    <RequestPage sx={{ fontSize: 20 }} />
                                    <Typography variant="caption">REQUEST</Typography>
                                </ActionButton>
                            </Grid>
                            <Grid item xs={3}>
                                <ActionButton fullWidth onClick={() => setPayBillsModal(true)}>
                                    <Payment sx={{ fontSize: 20 }} />
                                    <Typography variant="caption">BILLS</Typography>
                                </ActionButton>
                            </Grid>
                            <Grid item xs={3}>
                                <ActionButton fullWidth onClick={() => setTopUpModal(true)}>
                                    <AddCard sx={{ fontSize: 20 }} />
                                    <Typography variant="caption">TOP UP</Typography>
                                </ActionButton>
                            </Grid>
                        </Grid>

                        {/* Virtual Card - COMPACT */}
                        <Paper sx={{ p: 2, borderRadius: '16px', mb: 2, background: 'linear-gradient(135deg, #1A1A2E 0%, #2A2A3E 100%)', color: 'white' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="caption" sx={{ opacity: 0.6, letterSpacing: 1 }}>VIRTUAL CARD</Typography>
                                <CreditCard sx={{ fontSize: 24, opacity: 0.6 }} />
                            </Box>
                            <Typography variant="h6" sx={{ fontFamily: 'monospace', letterSpacing: 1 }}>{issuedCard.maskedNumber}</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Box><Typography variant="caption" sx={{ opacity: 0.6 }}>Cardholder</Typography><Typography variant="body2">{issuedCard.cardholderName}</Typography></Box>
                                <Box><Typography variant="caption" sx={{ opacity: 0.6 }}>Expires</Typography><Typography variant="body2">{issuedCard.expiryDate}</Typography></Box>
                                <Box><Typography variant="caption" sx={{ opacity: 0.6 }}>CVV</Typography><Box sx={{ display: 'flex', alignItems: 'center' }}><Typography variant="body2">{showCVV ? issuedCard.cvv : '***'}</Typography><IconButton size="small" onClick={() => setShowCVV(!showCVV)}><Visibility sx={{ fontSize: 14, color: 'white' }} /></IconButton></Box></Box>
                            </Box>
                            <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <Typography variant="caption" sx={{ opacity: 0.6 }}>Limit</Typography>
                                <Typography variant="body2">{formatCurrency(issuedCard.limit)}</Typography>
                            </Box>
                        </Paper>

                        {/* Charts - COMPACT */}
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={12}>
                                <Paper sx={{ p: 2, borderRadius: '16px' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Spending Trend</Typography>
                                    <Box sx={{ height: 200 }}>
                                        <Line data={spendingData} options={{ responsive: true, maintainAspectRatio: false }} />
                                    </Box>
                                </Paper>
                            </Grid>
                            <Grid item xs={12}>
                                <Paper sx={{ p: 2, borderRadius: '16px' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Categories</Typography>
                                    <Box sx={{ height: 200 }}>
                                        <Pie data={categoryData} options={{ responsive: true, maintainAspectRatio: false }} />
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>

                        {/* Recent Activity - COMPACT */}
                        <Paper sx={{ p: 2, borderRadius: '16px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Recent Activity</Typography>
                                <Button size="small" onClick={() => setTabValue(1)}>View All</Button>
                            </Box>
                            {transactions.slice(0, 5).map((t) => (
                                <Box key={t.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px solid #eee' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Avatar sx={{ bgcolor: t.amount > 0 ? '#E8F5E9' : '#FFEBEE', width: 32, height: 32 }}>
                                            {t.amount > 0 ? <ArrowDownward sx={{ fontSize: 16, color: '#4CAF50' }} /> : <ArrowUpward sx={{ fontSize: 16, color: '#f44336' }} />}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{t.name}</Typography>
                                            <Typography variant="caption" sx={{ color: '#888' }}>{t.date}</Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: t.amount > 0 ? '#4CAF50' : '#f44336' }}>
                                        {t.amount > 0 ? '+' : '-'}{formatCurrency(Math.abs(t.amount))}
                                    </Typography>
                                </Box>
                            ))}
                        </Paper>
                    </>
                )}

                {/* HISTORY TAB - FULL TRANSACTION HISTORY */}
                {tabValue === 1 && (
                    <Paper sx={{ p: 2, borderRadius: '16px' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>All Transactions ({transactions.length})</Typography>
                        <TableContainer sx={{ maxHeight: 500 }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell align="right">Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {transactions.slice().reverse().map((t) => (
                                        <TableRow key={t.id} hover>
                                            <TableCell>
                                                <Typography variant="caption">{t.date}</Typography>
                                                <Typography variant="caption" sx={{ color: '#888', display: 'block' }}>{t.time}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{t.name}</Typography>
                                                <Typography variant="caption" sx={{ color: '#888' }}>{t.category}</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: t.amount > 0 ? '#4CAF50' : '#f44336' }}>
                                                    {t.amount > 0 ? '+' : '-'}{formatCurrency(Math.abs(t.amount))}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                )}

                {/* PROFILE TAB */}
                {tabValue === 2 && (
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 2, textAlign: 'center', borderRadius: '16px' }}>
                                <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 1, bgcolor: '#1A1A2E' }}>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</Avatar>
                                <Typography variant="h6">{user.fullName}</Typography>
                                <Typography variant="body2" sx={{ color: '#888' }}>@{user.username}</Typography>
                                <Chip label={user.accountType} size="small" sx={{ mt: 1, bgcolor: '#1A1A2E', color: 'white' }} />
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Paper sx={{ p: 2, borderRadius: '16px' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Account Details</Typography>
                                <Grid container spacing={1.5}>
                                    <Grid item xs={6}><Typography variant="caption" sx={{ color: '#888' }}>Account Number</Typography><Typography variant="body2">{user.accountNumber}</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="caption" sx={{ color: '#888' }}>Member Since</Typography><Typography variant="body2">{user.memberSince}</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="caption" sx={{ color: '#888' }}>Balance</Typography><Typography variant="body2">{formatCurrency(balance)}</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="caption" sx={{ color: '#888' }}>Account Type</Typography><Typography variant="body2">{user.accountType}</Typography></Grid>
                                </Grid>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Personal Info</Typography>
                                    <Button size="small" onClick={() => setEditMode(!editMode)} startIcon={<Edit />}>{editMode ? 'Cancel' : 'Edit'}</Button>
                                </Box>
                                {editMode ? (
                                    <Box>
                                        <TextField fullWidth size="small" label="Full Name" value={editName} onChange={(e) => setEditName(e.target.value)} sx={{ mb: 1 }} />
                                        <TextField fullWidth size="small" label="Phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} sx={{ mb: 1 }} />
                                        <TextField fullWidth size="small" label="Address" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} multiline rows={2} sx={{ mb: 1 }} />
                                        <DarkButton fullWidth onClick={updateProfile}>Save</DarkButton>
                                    </Box>
                                ) : (
                                    <Box>
                                        <Typography variant="body2"><strong>Email:</strong> {user.email}</Typography>
                                        <Typography variant="body2"><strong>Phone:</strong> {user.phone || 'Not set'}</Typography>
                                        <Typography variant="body2"><strong>Address:</strong> {user.address || 'Not set'}</Typography>
                                        <Typography variant="body2"><strong>Country:</strong> {user.country}</Typography>
                                    </Box>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>
                )}
            </Container>

            {/* SEND MODAL - SIMPLIFIED */}
            <Modal open={sendModal} onClose={() => setSendModal(false)} closeAfterTransition BackdropComponent={Backdrop}>
                <Fade in={sendModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '20px', p: 3, width: { xs: '90%', sm: 450 }, maxHeight: '90vh', overflow: 'auto' }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setSendModal(false)}><Close /></IconButton>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Send Money</Typography>
                        
                        <Stepper activeStep={transferStep} sx={{ mb: 3 }}>
                            {transferSteps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                        </Stepper>
                        
                        {transferStep === 0 && (
                            <>
                                <TextField fullWidth size="small" label="Recipient Email or Account" value={recipientAccount} onChange={(e) => setRecipientAccount(e.target.value)} sx={{ mb: 2 }} />
                                <TextField fullWidth size="small" label="Recipient Name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} sx={{ mb: 2 }} />
                                <DarkButton fullWidth onClick={() => setTransferStep(1)}>Continue</DarkButton>
                            </>
                        )}
                        
                        {transferStep === 1 && (
                            <>
                                <TextField fullWidth size="small" label={`Amount (${user.currency})`} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start">{user.currencySymbol || '$'}</InputAdornment> }} />
                                <TextField fullWidth size="small" label="Purpose" value={transferPurpose} onChange={(e) => setTransferPurpose(e.target.value)} sx={{ mb: 2 }} />
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button variant="outlined" onClick={() => setTransferStep(0)}>Back</Button>
                                    <DarkButton onClick={() => setTransferStep(2)}>Continue</DarkButton>
                                </Box>
                            </>
                        )}
                        
                        {transferStep === 2 && (
                            <>
                                <Paper sx={{ p: 2, bgcolor: '#F5F7FA', mb: 2 }}>
                                    <Typography variant="body2"><strong>To:</strong> {recipientName || recipientAccount}</Typography>
                                    <Typography variant="body2"><strong>Amount:</strong> {formatCurrency(parseFloat(amount) || 0)}</Typography>
                                    <Typography variant="body2"><strong>Purpose:</strong> {transferPurpose || 'Not specified'}</Typography>
                                </Paper>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button variant="outlined" onClick={() => setTransferStep(1)}>Back</Button>
                                    <DarkButton onClick={handleSendMoney}>Confirm & Send</DarkButton>
                                </Box>
                            </>
                        )}
                    </Box>
                </Fade>
            </Modal>

            {/* REQUEST MODAL */}
            <Modal open={requestModal} onClose={() => setRequestModal(false)} closeAfterTransition BackdropComponent={Backdrop}>
                <Fade in={requestModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '20px', p: 3, width: { xs: '90%', sm: 400 } }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setRequestModal(false)}><Close /></IconButton>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Request Money</Typography>
                        <TextField fullWidth size="small" label="From (Email/Account)" value={recipientAccount} onChange={(e) => setRecipientAccount(e.target.value)} sx={{ mb: 2 }} />
                        <TextField fullWidth size="small" label={`Amount (${user.currency})`} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start">{user.currencySymbol || '$'}</InputAdornment> }} />
                        <DarkButton fullWidth onClick={handleRequestMoney}>Send Request</DarkButton>
                    </Box>
                </Fade>
            </Modal>

            {/* PAY BILLS MODAL */}
            <Modal open={payBillsModal} onClose={() => setPayBillsModal(false)} closeAfterTransition BackdropComponent={Backdrop}>
                <Fade in={payBillsModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '20px', p: 3, width: { xs: '90%', sm: 400 } }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setPayBillsModal(false)}><Close /></IconButton>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Pay Bills</Typography>
                        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                            <InputLabel>Bill Type</InputLabel>
                            <Select value={transferPurpose} onChange={(e) => setTransferPurpose(e.target.value)}>
                                <MenuItem value="Electricity">Electricity</MenuItem>
                                <MenuItem value="Water">Water</MenuItem>
                                <MenuItem value="Internet">Internet</MenuItem>
                                <MenuItem value="Phone">Phone</MenuItem>
                                <MenuItem value="Credit Card">Credit Card</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField fullWidth size="small" label={`Amount (${user.currency})`} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start">{user.currencySymbol || '$'}</InputAdornment> }} />
                        <DarkButton fullWidth onClick={handlePayBill}>Pay Bill</DarkButton>
                    </Box>
                </Fade>
            </Modal>

            {/* TOP UP MODAL */}
            <Modal open={topUpModal} onClose={() => setTopUpModal(false)} closeAfterTransition BackdropComponent={Backdrop}>
                <Fade in={topUpModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '20px', p: 3, width: { xs: '90%', sm: 400 } }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setTopUpModal(false)}><Close /></IconButton>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Top Up</Typography>
                        <TextField fullWidth size="small" label={`Amount (${user.currency})`} type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start">{user.currencySymbol || '$'}</InputAdornment> }} />
                        <DarkButton fullWidth onClick={handleDeposit}>Add Money</DarkButton>
                    </Box>
                </Fade>
            </Modal>

            {/* PROFILE QUICK MODAL */}
            <Modal open={profileModal} onClose={() => setProfileModal(false)} closeAfterTransition BackdropComponent={Backdrop}>
                <Fade in={profileModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '20px', p: 3, width: { xs: '90%', sm: 320 }, textAlign: 'center' }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setProfileModal(false)}><Close /></IconButton>
                        <Avatar sx={{ width: 70, height: 70, mx: 'auto', mb: 1, bgcolor: '#1A1A2E' }}>{user.firstName?.charAt(0)}</Avatar>
                        <Typography variant="h6">{user.fullName}</Typography>
                        <Typography variant="body2" sx={{ color: '#888' }}>{user.email}</Typography>
                        <Divider sx={{ my: 1.5 }} />
                        <Typography variant="body2"><strong>Balance:</strong> {formatCurrency(balance)}</Typography>
                        <Typography variant="body2"><strong>Account:</strong> {user.accountNumber}</Typography>
                        <Typography variant="body2"><strong>Country:</strong> {user.country}</Typography>
                        <DarkButton fullWidth sx={{ mt: 2 }} onClick={() => { setProfileModal(false); setTabValue(2); }}>Full Profile</DarkButton>
                    </Box>
                </Fade>
            </Modal>

            {/* Bottom Navigation */}
            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderRadius: '12px 12px 0 0', boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }}>
                <BottomNavigation showLabels value={navValue} onChange={(e, v) => { setNavValue(v); setTabValue(v); }}>
                    <BottomNavigationAction label="HOME" icon={<Home />} />
                    <BottomNavigationAction label="HISTORY" icon={<History />} />
                    <BottomNavigationAction label="PROFILE" icon={<Person />} />
                </BottomNavigation>
            </Paper>

            {/* Message Popup */}
            <Snackbar open={message.show} autoHideDuration={4000} onClose={() => setMessage(prev => ({ ...prev, show: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity={message.type} variant="filled">{message.text}</Alert>
            </Snackbar>
        </Box>
    );
}

export default Dashboard;