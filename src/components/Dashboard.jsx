import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion, collection, query, where, getDocs } from 'firebase/firestore';

// Material UI imports
import {
    AppBar, Toolbar, Typography, Button, Container, Grid,
    Paper, Card, CardContent, TextField, Avatar, IconButton,
    Box, Alert, Snackbar, BottomNavigation, BottomNavigationAction,
    Divider, Chip, Modal, Fade, Backdrop, Tab, Tabs,
    LinearProgress, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Select, MenuItem, FormControl, InputLabel,
    Stepper, Step, StepLabel, Radio, RadioGroup, FormControlLabel,
    Fab, InputAdornment
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    AccountBalance, Send, RequestPage, Payment, AddCard,
    Home, History, TrendingUp, Person, Notifications,
    ArrowUpward, ArrowDownward, Restaurant, Work,
    Send as SendIcon, MoreHoriz, Logout, Close,
    Receipt, QrCodeScanner, Edit, PhotoCamera,
    CalendarToday, Phone, Email, LocationOn, Flag,
    Wc, BusinessCenter, Fingerprint, Security,
    Warning, CheckCircle, Info, Help, Lock,
    AccountCircle, Badge, Cake, Public, Map,
    Visibility, VisibilityOff
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
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    BarElement
);

// Styled components
const BalanceCard = styled(Paper)(({ theme }) => ({
    background: 'linear-gradient(135deg, #0A1E3F 0%, #1A3B5E 100%)',
    color: 'white',
    borderRadius: '24px',
    padding: theme.spacing(3),
    position: 'relative',
    overflow: 'hidden',
    marginBottom: theme.spacing(3),
    '&::before': {
        content: '""',
        position: 'absolute',
        top: '-50%',
        right: '-20%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        borderRadius: '50%'
    }
}));

const ActionButton = styled(Button)(({ theme }) => ({
    borderRadius: '16px',
    padding: theme.spacing(1.5),
    flexDirection: 'column',
    gap: theme.spacing(1),
    backgroundColor: '#F8FAFD',
    color: '#1A2B3C',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.75rem',
    '&:hover': {
        backgroundColor: '#E8F0FE',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
    transition: 'all 0.2s ease'
}));

const ProfileCard = styled(Paper)(({ theme }) => ({
    background: 'white',
    borderRadius: '24px',
    padding: theme.spacing(3),
    position: 'relative',
    border: '1px solid rgba(0,0,0,0.05)'
}));

const BankOwnerBadge = styled(Box)(({ theme }) => ({
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    color: '#0A1E3F',
    padding: theme.spacing(0.5, 2),
    borderRadius: '20px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    fontWeight: 600,
    fontSize: '0.875rem'
}));

const GoldButton = styled(Button)(({ theme }) => ({
    background: 'linear-gradient(135deg, #0A1E3F 0%, #1A3B5E 100%)',
    color: 'white',
    padding: '12px',
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600
}));

// ==================== HARDCODED USER DATA ====================
const supportEmail = 'consultingzetax@gmail.com';

const usersData = {
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
        memberSince: 'April 2026',
        creditScore: 780,
        pin: '2002',
        cardDesign: 'platinum',
        cardType: 'credit',
        cardLimit: 250000,
        billingMessage: null, // NOT restricted
        transactions: [
            { id: 1, name: 'Indiana Fever', amount: 2500000, type: 'received', category: 'SALARY', date: 'Apr 1, 2026', time: '09:00 AM' },
            { id: 2, name: 'Nike', amount: 12500, type: 'sent', category: 'ENDORSEMENT', date: 'Apr 3, 2026', time: '02:30 PM' },
            { id: 3, name: 'State Farm', amount: 500000, type: 'received', category: 'SPONSORSHIP', date: 'Apr 5, 2026', time: '11:00 AM' },
            { id: 4, name: 'The Capital Grille', amount: 3200, type: 'sent', category: 'DINING', date: 'Apr 7, 2026', time: '07:30 PM' },
            { id: 5, name: 'Investment Deposit', amount: 1000000, type: 'deposit', category: 'INVESTMENT', date: 'Apr 10, 2026', time: '10:15 AM' }
        ]
    },
    'dollyrparton945@gmail.com': {
        firstName: 'Dolly',
        lastName: 'Parton',
        fullName: 'Dolly Rebecca Parton',
        email: 'dollyrparton945@gmail.com',
        username: 'DollyWood46',
        phone: '+1 (616) 321-2741',
        country: 'United States',
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
        memberSince: 'April 2026',
        creditScore: 810,
        pin: '9643',
        cardDesign: 'gold',
        cardType: 'credit',
        cardLimit: 100000,
        billingMessage: 'Unable to process transaction due to unpaid maintenance fees, kindly contact your account manager to clear up fees and charges.',
        transactions: [
            { id: 1, name: 'Spotify Royalties', amount: 150000, type: 'received', category: 'ROYALTIES', date: 'Apr 1, 2026', time: '08:00 AM' },
            { id: 2, name: 'Apple Music', amount: 75000, type: 'received', category: 'ROYALTIES', date: 'Apr 2, 2026', time: '10:30 AM' },
            { id: 3, name: 'Dollywood Foundation', amount: 5000, type: 'sent', category: 'CHARITY', date: 'Apr 4, 2026', time: '01:00 PM' },
            { id: 4, name: 'Netflix (Dolly Parton’s Heartstrings)', amount: 120000, type: 'received', category: 'ROYALTIES', date: 'Apr 8, 2026', time: '03:00 PM' },
            { id: 5, name: 'Nashville Restaurant', amount: 1250, type: 'sent', category: 'DINING', date: 'Apr 10, 2026', time: '07:30 PM' }
        ]
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
    transactions: []
};

function Dashboard() {
    const currentUser = auth.currentUser;
    const userEmail = currentUser?.email || '';
    const user = usersData[userEmail] || defaultUser;
    const isBlockedAccount = !!user.billingMessage;

    const [balance, setBalance] = useState(user.balance);
    const [transactions, setTransactions] = useState(user.transactions);
    const [message, setMessage] = useState({ show: false, text: '', type: 'success' });
    const [navValue, setNavValue] = useState(0);
    const [tabValue, setTabValue] = useState(0);
    const [editMode, setEditMode] = useState(false);
    const [editName, setEditName] = useState(user.fullName);
    const [editPhone, setEditPhone] = useState(user.phone);
    const [editAddress, setEditAddress] = useState(user.address);

    // Modal states
    const [sendModal, setSendModal] = useState(false);
    const [requestModal, setRequestModal] = useState(false);
    const [payBillsModal, setPayBillsModal] = useState(false);
    const [topUpModal, setTopUpModal] = useState(false);
    const [profileModal, setProfileModal] = useState(false);

    // Transfer form states
    const [recipientAccount, setRecipientAccount] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [amount, setAmount] = useState('');
    const [transferPurpose, setTransferPurpose] = useState('');
    const [transferType, setTransferType] = useState('interac');
    const [transferStep, setTransferStep] = useState(0);
    const [depositAmount, setDepositAmount] = useState('');
    const [showCVV, setShowCVV] = useState(false);

    const issuedCard = {
        cardholderName: user.fullName,
        maskedNumber: user.email === 'caitlinelizabeth200@gmail.com' ? '**** **** **** 2002' : '**** **** **** 9643',
        expiryDate: '12/27',
        cvv: '***',
        cardDesign: user.cardDesign,
        cardType: user.cardType,
        limit: user.cardLimit
    };

    const formatCurrency = (amt) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amt);
    };

    const showMessage = (text, type) => {
        setMessage({ show: true, text, type });
        setTimeout(() => setMessage(prev => ({ ...prev, show: false })), 6000);
    };

    const updateProfile = () => {
        if (isBlockedAccount) {
            showMessage('Profile editing is disabled for this account', 'warning');
            return;
        }
        setEditMode(false);
        showMessage('Profile updated (local changes only)', 'success');
    };

    const handleSendMoney = () => {
        if (isBlockedAccount) {
            showMessage(user.billingMessage, 'error');
            setSendModal(false);
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
        setBalance(newBalance);
        const newTransaction = {
            id: Date.now(),
            name: `Transfer to ${recipientAccount}`,
            amount: -transferAmount,
            type: 'sent',
            category: 'TRANSFER',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: new Date().toLocaleTimeString(),
            status: 'completed'
        };
        setTransactions([newTransaction, ...transactions]);
        showMessage(`✅ Successfully sent ${formatCurrency(transferAmount)}`, 'success');
        setSendModal(false);
        setRecipientAccount('');
        setAmount('');
        setTransferStep(0);
    };

    const handleDeposit = () => {
        if (isBlockedAccount) {
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
        setBalance(newBalance);
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
        setTransactions([newTransaction, ...transactions]);
        showMessage(`💰 Successfully deposited ${formatCurrency(depositAmountNum)}`, 'success');
        setTopUpModal(false);
        setDepositAmount('');
    };

    const handleRequestMoney = () => {
        if (isBlockedAccount) {
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
        setRecipientAccount('');
        setAmount('');
    };

    const handlePayBill = () => {
        if (isBlockedAccount) {
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
        setBalance(prev => prev - billAmount);
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
        setTransactions([newTransaction, ...transactions]);
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

    const getStatusColor = (status) => {
        switch(status) {
            case 'completed': return '#4CAF50';
            case 'pending': return '#FF9800';
            default: return '#999';
        }
    };

    const transferSteps = ['Recipient Info', 'Amount & Purpose', 'Review', 'Confirm'];

    // Chart data
    const spendingData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Spending',
            data: user.email === 'caitlinelizabeth200@gmail.com' ? [120000, 190000, 150000, 220000, 180000, 240000] : [12000, 19000, 15000, 22000, 18000, 24000],
            borderColor: '#0A1E3F',
            backgroundColor: 'rgba(10,30,63,0.1)',
            tension: 0.4
        }]
    };

    const categoryData = {
        labels: user.email === 'caitlinelizabeth200@gmail.com' ? ['Music', 'Dining', 'Shopping', 'Travel', 'Bills'] : ['Dining', 'Shopping', 'Bills', 'Transport', 'Entertainment'],
        datasets: [{
            data: user.email === 'caitlinelizabeth200@gmail.com' ? [45, 20, 15, 12, 8] : [30, 25, 20, 15, 10],
            backgroundColor: ['#0A1E3F', '#1A3B5E', '#2A4B7E', '#3A5B9E', '#4A6BBE']
        }]
    };

    const monthlyData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
            {
                label: 'Income',
                data: user.email === 'caitlinelizabeth200@gmail.com' ? [850000, 920000, 880000, 950000] : [85000, 92000, 88000, 95000],
                backgroundColor: '#4CAF50',
            },
            {
                label: 'Expenses',
                data: user.email === 'caitlinelizabeth200@gmail.com' ? [120000, 98000, 110000, 105000] : [62000, 68000, 64000, 71000],
                backgroundColor: '#f44336',
            }
        ]
    };

    return (
        <Box sx={{ bgcolor: '#F5F8FF', minHeight: '100vh', pb: 7 }}>
            {/* Top Header */}
            <AppBar position="static" sx={{ 
                bgcolor: 'white', 
                color: '#1A2B3C', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                borderBottomLeftRadius: '24px',
                borderBottomRightRadius: '24px'
            }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h5" sx={{ 
                            fontWeight: 700, 
                            background: 'linear-gradient(135deg, #0A1E3F 0%, #D4AF37 100%)', 
                            WebkitBackgroundClip: 'text', 
                            WebkitTextFillColor: 'transparent',
                            fontFamily: '"Playfair Display", serif'
                        }}>
                            QuinCore Bank
                        </Typography>
                        <BankOwnerBadge>
                            <Security sx={{ fontSize: 16 }} />
                            Elite Banking
                        </BankOwnerBadge>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton><Notifications /></IconButton>
                        <IconButton onClick={handleLogout}><Logout sx={{ color: '#dc004e' }} /></IconButton>
                        <IconButton onClick={() => setProfileModal(true)}>
                            <Avatar sx={{ bgcolor: '#1A3B5E' }}>{user.firstName.charAt(0)}</Avatar>
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
                {/* Welcome Section */}
                <Paper sx={{ p: 3, mb: 3, bgcolor: '#0A1E3F', color: 'white', borderRadius: '20px' }}>
                    <Typography variant="h4">Welcome back, {user.firstName}!</Typography>
                    <Typography variant="subtitle1">{user.email}</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>Account Number: {user.email === 'caitlinelizabeth200@gmail.com' ? 'CC20262002' : 'DP19469643'}</Typography>
                    {isBlockedAccount && (
                        <Chip label="⚠️ Account Restricted - Contact Support" size="small" sx={{ mt: 2, bgcolor: '#dc004e', color: 'white' }} />
                    )}
                </Paper>

                {/* Tabs */}
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
                    <Tab label="Dashboard" />
                    <Tab label="Analytics" />
                    <Tab label="History" />
                    <Tab label="Profile" />
                </Tabs>

                {/* DASHBOARD TAB */}
                {tabValue === 0 && (
                    <>
                        <BalanceCard elevation={3}>
                            <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>TOTAL BALANCE (USD)</Typography>
                            <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>{formatCurrency(balance)}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Chip icon={<ArrowUpward sx={{ fontSize: 16 }} />} label={user.email === 'caitlinelizabeth200@gmail.com' ? "+15.4% this month" : "+2.4% this month"} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>{user.accountType} Account</Typography>
                            </Box>
                        </BalanceCard>

                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={3}><ActionButton fullWidth onClick={() => setSendModal(true)}><SendIcon sx={{ color: '#0A1E3F', fontSize: 24 }} /><Typography variant="caption">SEND</Typography></ActionButton></Grid>
                            <Grid item xs={3}><ActionButton fullWidth onClick={() => setRequestModal(true)}><RequestPage sx={{ color: '#0A1E3F', fontSize: 24 }} /><Typography variant="caption">REQUEST</Typography></ActionButton></Grid>
                            <Grid item xs={3}><ActionButton fullWidth onClick={() => setPayBillsModal(true)}><Payment sx={{ color: '#0A1E3F', fontSize: 24 }} /><Typography variant="caption">PAY BILLS</Typography></ActionButton></Grid>
                            <Grid item xs={3}><ActionButton fullWidth onClick={() => setTopUpModal(true)}><AddCard sx={{ color: '#0A1E3F', fontSize: 24 }} /><Typography variant="caption">TOP UP</Typography></ActionButton></Grid>
                        </Grid>

                        {/* Virtual Card */}
                        <Paper sx={{ p: 3, borderRadius: '20px', mb: 3, background: user.cardDesign === 'gold' ? 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)' : 'linear-gradient(135deg, #1A1A1A 0%, #0A0A0A 100%)', color: user.cardDesign === 'gold' ? '#000000' : 'white' }}>
                            <Typography variant="caption" sx={{ letterSpacing: 2, opacity: 0.7 }}>{user.cardDesign?.toUpperCase()} CREDIT CARD</Typography>
                            <Typography variant="h5" sx={{ fontFamily: 'monospace', letterSpacing: 2, mt: 2 }}>{issuedCard.maskedNumber}</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                <Box><Typography variant="caption">Cardholder</Typography><Typography>{issuedCard.cardholderName}</Typography></Box>
                                <Box><Typography variant="caption">Expires</Typography><Typography>{issuedCard.expiryDate}</Typography></Box>
                                <Box><Typography variant="caption">CVV</Typography><Typography>{showCVV ? issuedCard.cvv : '***'}<IconButton size="small" onClick={() => setShowCVV(!showCVV)}><Visibility sx={{ fontSize: 14, color: user.cardDesign === 'gold' ? '#000' : 'white' }} /></IconButton></Typography></Box>
                            </Box>
                            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                                <Typography variant="caption">Card Limit</Typography>
                                <Typography>{formatCurrency(issuedCard.limit)}</Typography>
                            </Box>
                        </Paper>

                        {/* Charts Row */}
                        <Grid container spacing={3} sx={{ mb: 3 }}>
                            <Grid item xs={12} md={8}>
                                <Paper sx={{ p: 3, borderRadius: '20px' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Spending Trend (USD)</Typography>
                                    <Line data={spendingData} options={{ responsive: true }} />
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Paper sx={{ p: 3, borderRadius: '20px' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Spending by Category</Typography>
                                    <Pie data={categoryData} options={{ responsive: true }} />
                                </Paper>
                            </Grid>
                        </Grid>

                        {/* Recent Activity */}
                        <Paper sx={{ p: 3, borderRadius: '20px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>Recent Activity</Typography>
                                <Button size="small" endIcon={<MoreHoriz />} onClick={() => setTabValue(2)}>View All</Button>
                            </Box>
                            {transactions.slice(0, 5).map((t) => (
                                <Box key={t.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #eee', '&:hover': { bgcolor: '#F5F7FA', borderRadius: '12px' } }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: t.amount > 0 ? '#E3F2E9' : '#FFE9E9', color: t.amount > 0 ? '#00A86B' : '#FF3B3B' }}>
                                            {t.amount > 0 ? <ArrowDownward /> : <ArrowUpward />}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>{t.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">{t.date} • {t.time}</Typography>
                                        </Box>
                                    </Box>
                                    <Typography sx={{ color: t.amount > 0 ? '#00A86B' : '#FF3B3B', fontWeight: 600 }}>
                                        {t.amount > 0 ? '+' : '-'}{formatCurrency(Math.abs(t.amount))}
                                    </Typography>
                                </Box>
                            ))}
                        </Paper>
                    </>
                )}

                {/* ANALYTICS TAB */}
                {tabValue === 1 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Paper sx={{ p: 3, borderRadius: '20px' }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Income vs Expenses (USD)</Typography>
                                <Bar data={monthlyData} options={{ responsive: true }} />
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3, borderRadius: '20px' }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Key Metrics</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box><Typography variant="body2" color="text.secondary">Monthly Savings Rate</Typography><Typography variant="h4" sx={{ color: '#4CAF50' }}>{user.email === 'caitlinelizabeth200@gmail.com' ? '72%' : '24%'}</Typography><LinearProgress variant="determinate" value={user.email === 'caitlinelizabeth200@gmail.com' ? 72 : 24} sx={{ mt: 1, height: 8, borderRadius: 4 }} /></Box>
                                    <Box><Typography variant="body2" color="text.secondary">Credit Score</Typography><Typography variant="h4">{user.creditScore}</Typography><LinearProgress variant="determinate" value={user.creditScore / 10} sx={{ mt: 1, height: 8, borderRadius: 4 }} /></Box>
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3, borderRadius: '20px' }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Top Categories</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>{user.email === 'caitlinelizabeth200@gmail.com' ? 'Music Royalties' : 'Dining'}</Typography><Typography fontWeight={600}>{user.email === 'caitlinelizabeth200@gmail.com' ? formatCurrency(245000) : formatCurrency(3450)}</Typography></Box>
                                    <Divider /><Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>{user.email === 'caitlinelizabeth200@gmail.com' ? 'Dining' : 'Shopping'}</Typography><Typography fontWeight={600}>{user.email === 'caitlinelizabeth200@gmail.com' ? formatCurrency(45600) : formatCurrency(2890)}</Typography></Box>
                                    <Divider /><Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>{user.email === 'caitlinelizabeth200@gmail.com' ? 'Shopping' : 'Bills'}</Typography><Typography fontWeight={600}>{user.email === 'caitlinelizabeth200@gmail.com' ? formatCurrency(28900) : formatCurrency(2100)}</Typography></Box>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                )}

                {/* HISTORY TAB */}
                {tabValue === 2 && (
                    <Paper sx={{ p: 3, borderRadius: '20px' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Transaction History ({transactions.length} transactions)</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date & Time</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="right">Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {transactions.map((t) => (
                                        <TableRow key={t.id}>
                                            <TableCell><Typography variant="body2">{t.date}</Typography><Typography variant="caption" color="text.secondary">{t.time}</Typography></TableCell>
                                            <TableCell>{t.name}</TableCell>
                                            <TableCell><Chip label={t.category} size="small" /></TableCell>
                                            <TableCell><Chip label={t.status || 'completed'} size="small" sx={{ bgcolor: '#E8F5E9', color: '#4CAF50' }} /></TableCell>
                                            <TableCell align="right"><Typography sx={{ fontWeight: 600, color: t.amount > 0 ? '#00A86B' : '#FF3B3B' }}>{t.amount > 0 ? '+' : '-'}{formatCurrency(Math.abs(t.amount))}</Typography></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                )}

                {/* PROFILE TAB */}
                {tabValue === 3 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <ProfileCard>
                                <Box sx={{ textAlign: 'center', mb: 3 }}>
                                    <Avatar sx={{ width: 120, height: 120, mx: 'auto', mb: 2, bgcolor: '#0A1E3F', fontSize: '3rem' }}>{user.firstName.charAt(0)}{user.lastName.charAt(0)}</Avatar>
                                    <Typography variant="h5" sx={{ fontWeight: 600 }}>{user.fullName}</Typography>
                                    <Typography color="text.secondary" gutterBottom>@{user.username}</Typography>
                                    <Chip label={user.accountType} sx={{ mt: 1, bgcolor: '#D4AF37', color: '#000' }} />
                                </Box>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><Email sx={{ color: '#666' }} /><Typography variant="body2">{user.email}</Typography></Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><Phone sx={{ color: '#666' }} /><Typography variant="body2">{user.phone}</Typography></Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><LocationOn sx={{ color: '#666' }} /><Typography variant="body2">{user.address}</Typography></Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><Cake sx={{ color: '#666' }} /><Typography variant="body2">{user.dateOfBirth}</Typography></Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><Flag sx={{ color: '#666' }} /><Typography variant="body2">{user.country}, {user.state}</Typography></Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><Wc sx={{ color: '#666' }} /><Typography variant="body2">{user.gender}</Typography></Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><BusinessCenter sx={{ color: '#666' }} /><Typography variant="body2">{user.occupation}</Typography></Box>
                                </Box>
                            </ProfileCard>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <ProfileCard>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Account Details</Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={6}><Typography variant="body2" color="text.secondary">Account Number</Typography><Typography variant="h6">{user.email === 'caitlinelizabeth200@gmail.com' ? 'CC20262002' : 'DP19469643'}</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="body2" color="text.secondary">Member Since</Typography><Typography variant="h6">{user.memberSince}</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="body2" color="text.secondary">PIN Code</Typography><Typography variant="h6">••••</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="body2" color="text.secondary">Credit Score</Typography><Typography variant="h6">{user.creditScore}</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="body2" color="text.secondary">Account Balance</Typography><Typography variant="h6">{formatCurrency(balance)}</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="body2" color="text.secondary">Account Type</Typography><Typography variant="h6">{user.accountType}</Typography></Grid>
                                </Grid>
                                <Divider sx={{ my: 3 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Edit Profile</Typography>
                                    {!isBlockedAccount && <Button onClick={() => setEditMode(!editMode)} startIcon={<Edit />}>{editMode ? 'Cancel' : 'Edit'}</Button>}
                                    {isBlockedAccount && <Chip label="Editing Disabled" size="small" sx={{ bgcolor: '#FF9800', color: 'white' }} />}
                                </Box>
                                {editMode && !isBlockedAccount ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <TextField fullWidth label="Full Name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                                        <TextField fullWidth label="Phone Number" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                                        <TextField fullWidth label="Address" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} multiline rows={2} />
                                        <Button variant="contained" onClick={updateProfile} sx={{ bgcolor: '#0A1E3F' }}>Save Changes</Button>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box><Typography variant="caption" color="text.secondary">Full Name</Typography><Typography>{user.fullName}</Typography></Box>
                                        <Box><Typography variant="caption" color="text.secondary">Phone Number</Typography><Typography>{user.phone}</Typography></Box>
                                        <Box><Typography variant="caption" color="text.secondary">Address</Typography><Typography>{user.address}</Typography></Box>
                                    </Box>
                                )}
                                <Divider sx={{ my: 3 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Security Settings</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><Fingerprint sx={{ color: '#0A1E3F' }} /><Box><Typography>Two-Factor Authentication</Typography><Typography variant="caption" color="text.secondary">Protect your account with 2FA</Typography></Box></Box>
                                        <Button variant="outlined" size="small">Enable</Button>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><Lock sx={{ color: '#0A1E3F' }} /><Box><Typography>Change PIN</Typography><Typography variant="caption" color="text.secondary">Update your PIN</Typography></Box></Box>
                                        <Button variant="outlined" size="small">Update</Button>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><Security sx={{ color: '#0A1E3F' }} /><Box><Typography>Login Activity</Typography><Typography variant="caption" color="text.secondary">View recent logins</Typography></Box></Box>
                                        <Button variant="outlined" size="small">View</Button>
                                    </Box>
                                </Box>
                            </ProfileCard>
                        </Grid>
                    </Grid>
                )}
            </Container>

            {/* SEND MONEY MODAL */}
            <Modal open={sendModal} onClose={() => setSendModal(false)} closeAfterTransition BackdropComponent={Backdrop}>
                <Fade in={sendModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: { xs: '90%', sm: 450 }, maxHeight: '90vh', overflow: 'auto' }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setSendModal(false)}><Close /></IconButton>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#0A1E3F' }}>Send Money</Typography>
                        {isBlockedAccount ? (
                            <Box sx={{ textAlign: 'center', py: 3 }}>
                                <Alert severity="error" sx={{ mb: 3 }}><Typography variant="body1" fontWeight={600}>Account Restricted</Typography><Typography variant="body2">{user.billingMessage}</Typography></Alert>
                                <Button fullWidth variant="contained" onClick={() => window.location.href = `mailto:${supportEmail}`} sx={{ bgcolor: '#dc004e' }}>Contact Support</Button>
                            </Box>
                        ) : (
                            <>
                                <Stepper activeStep={transferStep} sx={{ mb: 4 }}>{transferSteps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}</Stepper>
                                {transferStep === 0 && (<><TextField fullWidth label="Recipient Account/Email" value={recipientAccount} onChange={(e) => setRecipientAccount(e.target.value)} sx={{ mb: 2 }} /><TextField fullWidth label="Recipient Name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} sx={{ mb: 2 }} /><GoldButton fullWidth onClick={() => setTransferStep(1)}>Continue</GoldButton></>)}
                                {transferStep === 1 && (<><TextField fullWidth label="Amount (USD)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} /><TextField fullWidth label="Purpose" value={transferPurpose} onChange={(e) => setTransferPurpose(e.target.value)} sx={{ mb: 2 }} /><Box sx={{ display: 'flex', gap: 2 }}><Button variant="outlined" onClick={() => setTransferStep(0)}>Back</Button><GoldButton onClick={() => setTransferStep(2)}>Continue</GoldButton></Box></>)}
                                {transferStep === 2 && (<><Paper sx={{ p: 2, bgcolor: '#F5F7FA', mb: 2 }}><Typography>To: {recipientAccount}</Typography><Typography>Amount: ${parseFloat(amount) || 0}</Typography><Typography>Purpose: {transferPurpose || 'Not specified'}</Typography></Paper><Box sx={{ display: 'flex', gap: 2 }}><Button variant="outlined" onClick={() => setTransferStep(1)}>Back</Button><GoldButton onClick={handleSendMoney}>Confirm & Send</GoldButton></Box></>)}
                            </>
                        )}
                    </Box>
                </Fade>
            </Modal>

            {/* REQUEST MODAL */}
            <Modal open={requestModal} onClose={() => setRequestModal(false)} closeAfterTransition BackdropComponent={Backdrop}>
                <Fade in={requestModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: { xs: '90%', sm: 400 } }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setRequestModal(false)}><Close /></IconButton>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#0A1E3F' }}>Request Money</Typography>
                        {isBlockedAccount ? (
                            <Box sx={{ textAlign: 'center' }}><Alert severity="warning" sx={{ mb: 3 }}>{user.billingMessage}</Alert><Button fullWidth variant="contained" onClick={() => window.location.href = `mailto:${supportEmail}`} sx={{ bgcolor: '#dc004e' }}>Contact Support</Button></Box>
                        ) : (<><TextField fullWidth label="From (Email/Account)" value={recipientAccount} onChange={(e) => setRecipientAccount(e.target.value)} sx={{ mb: 2 }} /><TextField fullWidth label="Amount (USD)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} /><GoldButton fullWidth onClick={handleRequestMoney}>Send Request</GoldButton></>)}
                    </Box>
                </Fade>
            </Modal>

            {/* PAY BILLS MODAL */}
            <Modal open={payBillsModal} onClose={() => setPayBillsModal(false)} closeAfterTransition BackdropComponent={Backdrop}>
                <Fade in={payBillsModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: { xs: '90%', sm: 400 } }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setPayBillsModal(false)}><Close /></IconButton>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#0A1E3F' }}>Pay Bills</Typography>
                        {isBlockedAccount ? (
                            <Box sx={{ textAlign: 'center' }}><Alert severity="warning" sx={{ mb: 3 }}>{user.billingMessage}</Alert><Button fullWidth variant="contained" onClick={() => window.location.href = `mailto:${supportEmail}`} sx={{ bgcolor: '#dc004e' }}>Contact Support</Button></Box>
                        ) : (<><FormControl fullWidth sx={{ mb: 2 }}><InputLabel>Bill Type</InputLabel><Select value={transferPurpose} onChange={(e) => setTransferPurpose(e.target.value)}><MenuItem value="Electricity">Electricity</MenuItem><MenuItem value="Water">Water</MenuItem><MenuItem value="Internet">Internet</MenuItem><MenuItem value="Phone">Phone</MenuItem></Select></FormControl><TextField fullWidth label="Amount (USD)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} /><GoldButton fullWidth onClick={handlePayBill}>Pay Bill</GoldButton></>)}
                    </Box>
                </Fade>
            </Modal>

            {/* TOP UP MODAL */}
            <Modal open={topUpModal} onClose={() => setTopUpModal(false)} closeAfterTransition BackdropComponent={Backdrop}>
                <Fade in={topUpModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: { xs: '90%', sm: 400 } }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setTopUpModal(false)}><Close /></IconButton>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#0A1E3F' }}>Top Up Account</Typography>
                        {isBlockedAccount ? (
                            <Box sx={{ textAlign: 'center' }}><Alert severity="warning" sx={{ mb: 3 }}>{user.billingMessage}</Alert><Button fullWidth variant="contained" onClick={() => window.location.href = `mailto:${supportEmail}`} sx={{ bgcolor: '#dc004e' }}>Contact Support</Button></Box>
                        ) : (<><FormControl fullWidth sx={{ mb: 2 }}><InputLabel>Method</InputLabel><Select value={transferType} onChange={(e) => setTransferType(e.target.value)}><MenuItem value="bank">Bank Transfer</MenuItem><MenuItem value="card">Credit Card</MenuItem></Select></FormControl><TextField fullWidth label="Amount (USD)" type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} /><GoldButton fullWidth onClick={handleDeposit}>Add Money</GoldButton></>)}
                    </Box>
                </Fade>
            </Modal>

            {/* PROFILE QUICK MODAL */}
            <Modal open={profileModal} onClose={() => setProfileModal(false)} closeAfterTransition BackdropComponent={Backdrop}>
                <Fade in={profileModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: { xs: '90%', sm: 350 }, textAlign: 'center' }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setProfileModal(false)}><Close /></IconButton>
                        <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: '#0A1E3F' }}>{user.firstName.charAt(0)}</Avatar>
                        <Typography variant="h6">{user.fullName}</Typography>
                        <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body2"><strong>Account:</strong> {user.email === 'caitlinelizabeth200@gmail.com' ? 'CC20262002' : 'DP19469643'}</Typography>
                        <Typography variant="body2"><strong>Balance:</strong> {formatCurrency(balance)}</Typography>
                        <Typography variant="body2"><strong>Country:</strong> {user.country}</Typography>
                        {isBlockedAccount && <Chip label="Account Restricted" size="small" sx={{ mt: 2, bgcolor: '#dc004e', color: 'white' }} />}
                        <GoldButton fullWidth sx={{ mt: 2 }} onClick={() => { setProfileModal(false); setTabValue(3); }}>Full Profile</GoldButton>
                    </Box>
                </Fade>
            </Modal>

            {/* Bottom Navigation */}
            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderRadius: '20px 20px 0 0', boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }}>
                <BottomNavigation showLabels value={navValue} onChange={(e, v) => { setNavValue(v); setTabValue(v); }}>
                    <BottomNavigationAction label="HOME" icon={<Home />} />
                    <BottomNavigationAction label="TRANSFER" icon={<SendIcon />} onClick={() => setSendModal(true)} />
                    <BottomNavigationAction label="STATS" icon={<TrendingUp />} />
                    <BottomNavigationAction label="PROFILE" icon={<Person />} onClick={() => setTabValue(3)} />
                </BottomNavigation>
            </Paper>

            {/* Message Popup */}
            <Snackbar open={message.show} autoHideDuration={6000} onClose={() => setMessage(prev => ({ ...prev, show: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity={message.type} variant="filled" sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxWidth: '500px' }}>{message.text}</Alert>
            </Snackbar>
        </Box>
    );
}

export default Dashboard;