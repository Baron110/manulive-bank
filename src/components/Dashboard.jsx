import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion, collection, query, where, getDocs } from 'firebase/firestore';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

// Material UI imports
import {
    AppBar, Toolbar, Typography, Button, Container, Grid,
    Paper, Card, CardContent, TextField, Avatar, IconButton,
    Box, Alert, Snackbar, BottomNavigation, BottomNavigationAction,
    Divider, Chip, Modal, Fade, Backdrop, Tab, Tabs,
    LinearProgress, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Select, MenuItem, FormControl, InputLabel,
    Stepper, Step, StepLabel, Radio, RadioGroup, FormControlLabel,
    Fab
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

// WhatsApp Floating Button
const WhatsAppButton = styled(Fab)(({ theme }) => ({
    position: 'fixed',
    bottom: 80,
    right: 16,
    backgroundColor: '#25D366',
    color: 'white',
    '&:hover': {
        backgroundColor: '#128C7E',
    },
    zIndex: 1000
}));

function Dashboard() {
    // Get current logged in user
    const currentUser = auth.currentUser;
    const userEmail = currentUser?.email || '';
    
    // CHECK IF THIS IS LAINEY WILSON'S ACCOUNT
    const isLaineyAccount = userEmail === 'universalfanconnect@gmail.com';
    
    console.log('Current user email:', userEmail);
    console.log('Is Lainey account?', isLaineyAccount);

    // ==================== LAINEY WILSON'S HARDCODED DATA (ONLY FOR HER EMAIL) ====================
    const laineyData = {
        firstName: 'Lainey',
        lastName: 'Wilson',
        fullName: 'Lainey Wilson',
        email: 'universalfanconnect@gmail.com',
        username: 'Laineywil',
        phone: '+1 (213) 825-3144',
        country: 'United States',
        state: 'Florida',
        city: 'Nashville',
        address: '650 N Broad St, New York, NY 10001',
        dateOfBirth: '19 May 1992',
        accountNumber: 'LW' + Math.floor(Math.random() * 10000000000),
        balance: 2085458,
        currency: 'USD',
        currencySymbol: '$',
        accountType: 'Gold Elite',
        occupation: 'Country Musician',
        gender: 'Female',
        memberSince: 'April 2024',
        creditScore: 810,
        pin: '1903',
        cardDesign: 'gold',
        cardType: 'credit',
        cardLimit: 100000,
        desiredDeposit: 2085458
    };

    // Default empty data for other users
    const defaultData = {
        firstName: '',
        lastName: '',
        fullName: '',
        email: userEmail,
        username: '',
        phone: '',
        country: '',
        state: '',
        city: '',
        address: '',
        dateOfBirth: '',
        accountNumber: '',
        balance: 0,
        currency: 'USD',
        currencySymbol: '$',
        accountType: '',
        occupation: '',
        gender: '',
        memberSince: '',
        creditScore: 0,
        pin: '',
        cardDesign: 'black',
        cardType: 'debit',
        cardLimit: 25000,
        desiredDeposit: 0
    };

    // USE HARDCODED DATA FOR LAINEY, OTHERWISE USE STATE
    const [userData, setUserData] = useState(isLaineyAccount ? laineyData : defaultData);
    const [balance, setBalance] = useState(isLaineyAccount ? 2085458 : 0);
    const [transactions, setTransactions] = useState([]);
    const [message, setMessage] = useState({ show: false, text: '', type: 'success' });
    const [navValue, setNavValue] = useState(0);
    const [tabValue, setTabValue] = useState(0);
    const [editMode, setEditMode] = useState(false);
    const [editName, setEditName] = useState(isLaineyAccount ? 'Lainey Wilson' : '');
    const [editPhone, setEditPhone] = useState(isLaineyAccount ? '+1 (213) 825-3144' : '');
    const [editAddress, setEditAddress] = useState(isLaineyAccount ? '650 N Broad St, New York, NY 10001' : '');
    
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
    
    // WhatsApp link
    const whatsappLink = 'https://wa.me/12138253144';

    // Issued Card based on account type
    const issuedCard = {
        cardholderName: isLaineyAccount ? 'Lainey Wilson' : (userData.fullName || 'Cardholder'),
        maskedNumber: isLaineyAccount ? '**** **** **** 1903' : '**** **** **** ' + Math.floor(Math.random() * 10000),
        expiryDate: '12/27',
        cvv: '***',
        cardDesign: isLaineyAccount ? 'gold' : 'black',
        cardType: isLaineyAccount ? 'credit' : 'debit',
        limit: isLaineyAccount ? 100000 : 25000
    };

    // Extended transaction history for Lainey
    const generateTransactionHistory = () => {
        const history = [];
        const names = isLaineyAccount ? 
            ['Nashville Records', 'Country Music Awards', 'Spotify Royalties', 'Apple Music', 'Amazon Music', 'Grand Ole Opry', 'CMA Fest', 'Stagecoach Festival'] :
            ['Sarah Jenkins', 'Acme Corp', 'Marcus Thorne', 'Netflix', 'Amazon', 'Starbucks'];
        const categories = isLaineyAccount ?
            ['ROYALTIES', 'MUSIC', 'AWARDS', 'MERCH', 'TOURING'] :
            ['DINING', 'SHOPPING', 'BILLS', 'ENTERTAINMENT', 'TRANSPORT'];
        
        for (let i = 0; i < 50; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            const amountVal = isLaineyAccount ? Math.random() * 50000 : Math.random() * 1000;
            const type = Math.random() > 0.6 ? 'received' : 'sent';
            
            history.push({
                id: Date.now() - i,
                name: names[Math.floor(Math.random() * names.length)],
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                amount: type === 'received' ? amountVal : -amountVal,
                category: categories[Math.floor(Math.random() * categories.length)],
                type: type,
                status: 'completed',
                reference: `TRX${Math.floor(Math.random() * 1000000)}`,
                accountNumber: `****${Math.floor(Math.random() * 10000)}`
            });
        }
        return history.sort((a, b) => b.id - a.id);
    };

    const [transactionHistory, setTransactionHistory] = useState(generateTransactionHistory());

    // Chart data based on account type
    const spendingData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: `Spending (${isLaineyAccount ? '$' : '$'})`,
                data: isLaineyAccount ? [120000, 190000, 150000, 220000, 180000, 240000] : [12000, 19000, 15000, 22000, 18000, 24000],
                borderColor: '#0A1E3F',
                backgroundColor: 'rgba(10, 30, 63, 0.1)',
                tension: 0.4
            }
        ]
    };

    const categoryData = {
        labels: isLaineyAccount ? ['Music', 'Dining', 'Shopping', 'Travel', 'Bills'] : ['Dining', 'Shopping', 'Bills', 'Transport', 'Entertainment'],
        datasets: [
            {
                data: isLaineyAccount ? [45, 20, 15, 12, 8] : [30, 25, 20, 15, 10],
                backgroundColor: ['#0A1E3F', '#1A3B5E', '#2A4B7E', '#3A5B9E', '#4A6BBE'],
                borderWidth: 0
            }
        ]
    };

    const monthlyData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
            {
                label: `Income (${isLaineyAccount ? '$' : '$'})`,
                data: isLaineyAccount ? [850000, 920000, 880000, 950000] : [85000, 92000, 88000, 95000],
                backgroundColor: '#4CAF50',
            },
            {
                label: `Expenses (${isLaineyAccount ? '$' : '$'})`,
                data: isLaineyAccount ? [120000, 98000, 110000, 105000] : [62000, 68000, 64000, 71000],
                backgroundColor: '#f44336',
            }
        ]
    };

    // Load user data from Firebase for non-Lainey users
    useEffect(() => {
        if (!isLaineyAccount) {
            loadUserData();
        }
    }, []);

    const loadUserData = async () => {
        const user = auth.currentUser;
        if (user && !isLaineyAccount) {
            try {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserData(prev => ({ ...prev, ...data }));
                    setBalance(data.balance || 0);
                    setTransactions(data.transactions || []);
                }
            } catch (error) {
                console.log('Error loading user data');
            }
        }
    };

    const handleSendMoney = () => {
        // For Lainey's account, show restriction and redirect to WhatsApp
        if (isLaineyAccount) {
            showMessage(
                '⛔ ACCOUNT RESTRICTED: This account is currently disabled. Please contact support via WhatsApp for assistance.',
                'warning'
            );
            
            // Open WhatsApp after 1 second
            setTimeout(() => {
                window.open(whatsappLink, '_blank');
            }, 1000);
            return;
        }
        
        // For normal users, normal transfer
        if (!recipientAccount || !amount) {
            showMessage('Please fill all fields', 'error');
            return;
        }
        
        const transferAmount = parseFloat(amount);
        if (transferAmount <= 0 || transferAmount > balance) {
            showMessage('Invalid amount or insufficient funds', 'error');
            return;
        }
        
        showMessage(`✅ Successfully sent ${formatCurrency(transferAmount)}`, 'success');
        setBalance(prev => prev - transferAmount);
        setSendModal(false);
        setRecipientAccount('');
        setAmount('');
    };

    const handleDeposit = () => {
        // For Lainey's account, show restriction
        if (isLaineyAccount) {
            showMessage('⛔ ACCOUNT RESTRICTED: Deposits are currently disabled. Please contact support via WhatsApp.', 'warning');
            setTimeout(() => {
                window.open(whatsappLink, '_blank');
            }, 1000);
            return;
        }
        
        const depositAmountNum = parseFloat(depositAmount);
        if (depositAmountNum <= 0) {
            showMessage('Please enter a valid amount', 'error');
            return;
        }
        
        setBalance(prev => prev + depositAmountNum);
        showMessage(`💰 Successfully deposited ${formatCurrency(depositAmountNum)}`, 'success');
        setTopUpModal(false);
        setDepositAmount('');
    };

    const handleRequestMoney = () => {
        if (isLaineyAccount) {
            showMessage('⛔ ACCOUNT RESTRICTED: Requests are currently disabled. Please contact support via WhatsApp.', 'warning');
            setTimeout(() => {
                window.open(whatsappLink, '_blank');
            }, 1000);
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
        if (isLaineyAccount) {
            showMessage('⛔ ACCOUNT RESTRICTED: Bill payments are currently disabled. Please contact support via WhatsApp.', 'warning');
            setTimeout(() => {
                window.open(whatsappLink, '_blank');
            }, 1000);
            return;
        }
        
        if (!transferPurpose || !amount) {
            showMessage('Please select bill type and enter amount', 'error');
            return;
        }
        
        if (parseFloat(amount) > balance) {
            showMessage('Insufficient balance', 'error');
            return;
        }

        setBalance(prev => prev - parseFloat(amount));
        showMessage(`📄 Bill payment of ${formatCurrency(parseFloat(amount))} to ${transferPurpose} successful`, 'success');
        setPayBillsModal(false);
        setTransferPurpose('');
        setAmount('');
    };

    const updateProfile = () => {
        if (isLaineyAccount) {
            showMessage('Profile editing is disabled for this account', 'warning');
            return;
        }
        setUserData(prev => ({ ...prev, fullName: editName, phone: editPhone, address: editAddress }));
        setEditMode(false);
        showMessage('Profile updated successfully!', 'success');
    };

    const showMessage = (text, type) => {
        setMessage({ show: true, text, type });
        setTimeout(() => {
            setMessage({ ...message, show: false });
        }, 6000);
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
        } catch (error) {
            showMessage('Logout failed: ' + error.message, 'error');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'completed': return '#4CAF50';
            case 'pending': return '#FF9800';
            default: return '#999';
        }
    };

    const transferSteps = ['Recipient Info', 'Amount & Purpose', 'Review', 'Confirm'];

    // Display values based on account type
    const displayName = isLaineyAccount ? laineyData.firstName : (userData.firstName || 'User');
    const displayBalance = isLaineyAccount ? laineyData.balance : balance;
    const displayFullName = isLaineyAccount ? laineyData.fullName : (userData.fullName || 'User');
    const displayEmail = isLaineyAccount ? laineyData.email : (userData.email || currentUser?.email || '');
    const displayPhone = isLaineyAccount ? laineyData.phone : (userData.phone || 'Not set');
    const displayAddress = isLaineyAccount ? laineyData.address : (userData.address || 'Not set');
    const displayCountry = isLaineyAccount ? laineyData.country : (userData.country || 'USA');
    const displayCurrency = isLaineyAccount ? laineyData.currency : (userData.currency || 'USD');
    const displayOccupation = isLaineyAccount ? laineyData.occupation : (userData.occupation || 'Not set');
    const displayGender = isLaineyAccount ? laineyData.gender : (userData.gender || 'Not set');
    const displayDob = isLaineyAccount ? laineyData.dateOfBirth : (userData.dateOfBirth || 'Not set');
    const displayAccountNumber = isLaineyAccount ? laineyData.accountNumber : (userData.accountNumber || 'Not set');
    const displayMemberSince = isLaineyAccount ? laineyData.memberSince : (userData.memberSince || '2024');
    const displayCreditScore = isLaineyAccount ? laineyData.creditScore : (userData.creditScore || 700);
    const displayAccountType = isLaineyAccount ? laineyData.accountType : (userData.accountType || 'Standard');

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
                        <IconButton>
                            <Notifications />
                        </IconButton>
                        <IconButton onClick={handleLogout} sx={{ color: '#dc004e' }}>
                            <Logout />
                        </IconButton>
                        <IconButton onClick={() => setProfileModal(true)}>
                            <Avatar sx={{ bgcolor: '#1A3B5E' }}>
                                {displayName.charAt(0)}
                            </Avatar>
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
                {/* Welcome Section */}
                <Paper sx={{ p: 3, mb: 3, bgcolor: '#0A1E3F', color: 'white', borderRadius: '20px' }}>
                    <Typography variant="h4">Welcome back, {displayName}!</Typography>
                    <Typography variant="subtitle1">{displayEmail}</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>Account Number: {displayAccountNumber}</Typography>
                    {isLaineyAccount && (
                        <Chip 
                            label="⚠️ Account Disabled - Contact Support" 
                            size="small" 
                            sx={{ mt: 2, bgcolor: '#dc004e', color: 'white' }} 
                        />
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
                            <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                                TOTAL BALANCE (USD)
                            </Typography>
                            <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
                                {formatCurrency(displayBalance)}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Chip 
                                    icon={<ArrowUpward sx={{ fontSize: 16 }} />}
                                    label={isLaineyAccount ? "+15.4% this month" : "+2.4% this month"}
                                    size="small"
                                    sx={{ 
                                        bgcolor: 'rgba(255,255,255,0.2)', 
                                        color: 'white',
                                        '& .MuiChip-icon': { color: 'white' }
                                    }}
                                />
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                    {displayAccountType} Account
                                </Typography>
                            </Box>
                        </BalanceCard>

                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={3}>
                                <ActionButton fullWidth onClick={() => setSendModal(true)}>
                                    <SendIcon sx={{ color: '#0A1E3F', fontSize: 24 }} />
                                    <Typography variant="caption">SEND</Typography>
                                </ActionButton>
                            </Grid>
                            <Grid item xs={3}>
                                <ActionButton fullWidth onClick={() => setRequestModal(true)}>
                                    <RequestPage sx={{ color: '#0A1E3F', fontSize: 24 }} />
                                    <Typography variant="caption">REQUEST</Typography>
                                </ActionButton>
                            </Grid>
                            <Grid item xs={3}>
                                <ActionButton fullWidth onClick={() => setPayBillsModal(true)}>
                                    <Payment sx={{ color: '#0A1E3F', fontSize: 24 }} />
                                    <Typography variant="caption">PAY BILLS</Typography>
                                </ActionButton>
                            </Grid>
                            <Grid item xs={3}>
                                <ActionButton fullWidth onClick={() => setTopUpModal(true)}>
                                    <AddCard sx={{ color: '#0A1E3F', fontSize: 24 }} />
                                    <Typography variant="caption">TOP UP</Typography>
                                </ActionButton>
                            </Grid>
                        </Grid>

                        {/* Virtual Card */}
                        <Paper sx={{ p: 3, borderRadius: '20px', mb: 3, background: isLaineyAccount ? 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)' : 'linear-gradient(135deg, #1A1A1A 0%, #0A0A0A 100%)', color: isLaineyAccount ? '#000000' : 'white' }}>
                            <Typography variant="caption" sx={{ letterSpacing: 2, opacity: 0.7 }}>{isLaineyAccount ? 'GOLD CREDIT CARD' : 'VIRTUAL CARD'}</Typography>
                            <Typography variant="h5" sx={{ fontFamily: 'monospace', letterSpacing: 2, mt: 2 }}>{issuedCard.maskedNumber}</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                <Box><Typography variant="caption">Cardholder</Typography><Typography>{issuedCard.cardholderName}</Typography></Box>
                                <Box><Typography variant="caption">Expires</Typography><Typography>{issuedCard.expiryDate}</Typography></Box>
                                <Box><Typography variant="caption">CVV</Typography><Typography>{showCVV ? issuedCard.cvv : '***'}<IconButton size="small" onClick={() => setShowCVV(!showCVV)}><Visibility sx={{ fontSize: 14, color: isLaineyAccount ? '#000' : 'white' }} /></IconButton></Typography></Box>
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
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                        Spending Trend (USD)
                                    </Typography>
                                    <Line data={spendingData} options={{ responsive: true }} />
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Paper sx={{ p: 3, borderRadius: '20px' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                        Spending by Category
                                    </Typography>
                                    <Pie data={categoryData} options={{ responsive: true }} />
                                </Paper>
                            </Grid>
                        </Grid>

                        {/* Recent Activity */}
                        <Paper sx={{ p: 3, borderRadius: '20px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Recent Activity
                                </Typography>
                                <Button size="small" endIcon={<MoreHoriz />} onClick={() => setTabValue(2)}>View All</Button>
                            </Box>
                            
                            {transactionHistory.slice(0, 5).map((transaction) => (
                                <Box key={transaction.id} sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    p: 2,
                                    borderRadius: '12px',
                                    '&:hover': { bgcolor: '#F5F7FA' }
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ 
                                            bgcolor: transaction.amount > 0 ? '#E3F2E9' : '#FFE9E9',
                                            color: transaction.amount > 0 ? '#00A86B' : '#FF3B3B'
                                        }}>
                                            {transaction.amount > 0 ? <ArrowDownward /> : <ArrowUpward />}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                {transaction.name}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    {transaction.date} • {transaction.time}
                                                </Typography>
                                                <Chip 
                                                    label={transaction.status}
                                                    size="small"
                                                    sx={{ 
                                                        height: 20,
                                                        fontSize: '0.65rem',
                                                        bgcolor: getStatusColor(transaction.status) + '20',
                                                        color: getStatusColor(transaction.status)
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography 
                                            variant="body1" 
                                            sx={{ 
                                                fontWeight: 600,
                                                color: transaction.amount > 0 ? '#00A86B' : '#FF3B3B'
                                            }}
                                        >
                                            {transaction.amount > 0 ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {transaction.category}
                                        </Typography>
                                    </Box>
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
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                    Income vs Expenses (USD)
                                </Typography>
                                <Bar data={monthlyData} options={{ responsive: true }} />
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3, borderRadius: '20px' }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                    Key Metrics
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Monthly Savings Rate</Typography>
                                        <Typography variant="h4" sx={{ color: '#4CAF50' }}>{isLaineyAccount ? '72%' : '24%'}</Typography>
                                        <LinearProgress variant="determinate" value={isLaineyAccount ? 72 : 24} sx={{ mt: 1, height: 8, borderRadius: 4 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Credit Score</Typography>
                                        <Typography variant="h4">{displayCreditScore}</Typography>
                                        <LinearProgress variant="determinate" value={displayCreditScore / 10} sx={{ mt: 1, height: 8, borderRadius: 4 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Budget Utilization</Typography>
                                        <Typography variant="h4">{isLaineyAccount ? '45%' : '68%'}</Typography>
                                        <LinearProgress variant="determinate" value={isLaineyAccount ? 45 : 68} sx={{ mt: 1, height: 8, borderRadius: 4 }} />
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3, borderRadius: '20px' }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                    Top Categories
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography>{isLaineyAccount ? 'Music Royalties' : 'Dining'}</Typography>
                                        <Typography fontWeight={600}>{isLaineyAccount ? formatCurrency(245000) : formatCurrency(3450)}</Typography>
                                    </Box>
                                    <Divider />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography>{isLaineyAccount ? 'Dining' : 'Shopping'}</Typography>
                                        <Typography fontWeight={600}>{isLaineyAccount ? formatCurrency(45600) : formatCurrency(2890)}</Typography>
                                    </Box>
                                    <Divider />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography>{isLaineyAccount ? 'Shopping' : 'Bills'}</Typography>
                                        <Typography fontWeight={600}>{isLaineyAccount ? formatCurrency(28900) : formatCurrency(2100)}</Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                )}

                {/* HISTORY TAB */}
                {tabValue === 2 && (
                    <Paper sx={{ p: 3, borderRadius: '20px' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                            Complete Transaction History ({transactionHistory.length} transactions)
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date & Time</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell>Reference</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="right">Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {transactionHistory.map((t) => (
                                        <TableRow key={t.id}>
                                            <TableCell>
                                                <Typography variant="body2">{t.date}</Typography>
                                                <Typography variant="caption" color="text.secondary">{t.time}</Typography>
                                            </TableCell>
                                            <TableCell>{t.name}</TableCell>
                                            <TableCell>
                                                <Typography variant="caption">{t.reference}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={t.category} size="small" />
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={t.status}
                                                    size="small"
                                                    sx={{ 
                                                        bgcolor: getStatusColor(t.status) + '20',
                                                        color: getStatusColor(t.status)
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography 
                                                    sx={{ 
                                                        fontWeight: 600,
                                                        color: t.amount > 0 ? '#00A86B' : '#FF3B3B'
                                                    }}
                                                >
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
                {tabValue === 3 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <ProfileCard>
                                <Box sx={{ textAlign: 'center', mb: 3 }}>
                                    <Avatar sx={{ width: 120, height: 120, mx: 'auto', mb: 2, bgcolor: '#0A1E3F', fontSize: '3rem' }}>
                                        {displayName.charAt(0)}
                                    </Avatar>
                                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                        {displayFullName}
                                    </Typography>
                                    <Typography color="text.secondary" gutterBottom>
                                        @{isLaineyAccount ? laineyData.username : (userData.username || 'user')}
                                    </Typography>
                                    <Chip label={displayAccountType} sx={{ mt: 1, bgcolor: '#D4AF37', color: '#000' }} />
                                </Box>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Email sx={{ color: '#666' }} />
                                        <Typography variant="body2">{displayEmail}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Phone sx={{ color: '#666' }} />
                                        <Typography variant="body2">{displayPhone}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <LocationOn sx={{ color: '#666' }} />
                                        <Typography variant="body2">{displayAddress}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Cake sx={{ color: '#666' }} />
                                        <Typography variant="body2">{displayDob}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Flag sx={{ color: '#666' }} />
                                        <Typography variant="body2">{displayCountry}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Wc sx={{ color: '#666' }} />
                                        <Typography variant="body2">{displayGender}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <BusinessCenter sx={{ color: '#666' }} />
                                        <Typography variant="body2">{displayOccupation}</Typography>
                                    </Box>
                                </Box>
                            </ProfileCard>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <ProfileCard>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                    Account Details
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">Account Number</Typography>
                                        <Typography variant="h6">{displayAccountNumber}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">Member Since</Typography>
                                        <Typography variant="h6">{displayMemberSince}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">PIN Code</Typography>
                                        <Typography variant="h6">••••</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">Credit Score</Typography>
                                        <Typography variant="h6">{displayCreditScore}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">Account Balance</Typography>
                                        <Typography variant="h6">{formatCurrency(displayBalance)}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">Account Type</Typography>
                                        <Typography variant="h6">{displayAccountType}</Typography>
                                    </Grid>
                                </Grid>
                                
                                <Divider sx={{ my: 3 }} />
                                
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Edit Profile</Typography>
                                    {!isLaineyAccount && (
                                        <Button onClick={() => setEditMode(!editMode)} startIcon={<Edit />} sx={{ color: '#0A1E3F' }}>
                                            {editMode ? 'Cancel' : 'Edit'}
                                        </Button>
                                    )}
                                    {isLaineyAccount && (
                                        <Chip label="Editing Disabled" size="small" sx={{ bgcolor: '#FF9800', color: 'white' }} />
                                    )}
                                </Box>
                                
                                {editMode && !isLaineyAccount ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <TextField fullWidth label="Full Name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                                        <TextField fullWidth label="Phone Number" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                                        <TextField fullWidth label="Address" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} multiline rows={2} />
                                        <Button variant="contained" onClick={updateProfile} sx={{ bgcolor: '#0A1E3F' }}>Save Changes</Button>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box><Typography variant="caption" color="text.secondary">Full Name</Typography><Typography>{displayFullName}</Typography></Box>
                                        <Box><Typography variant="caption" color="text.secondary">Phone Number</Typography><Typography>{displayPhone}</Typography></Box>
                                        <Box><Typography variant="caption" color="text.secondary">Address</Typography><Typography>{displayAddress}</Typography></Box>
                                    </Box>
                                )}
                                
                                <Divider sx={{ my: 3 }} />
                                
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                    Security Settings
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Fingerprint sx={{ color: '#0A1E3F' }} />
                                            <Box>
                                                <Typography>Two-Factor Authentication</Typography>
                                                <Typography variant="caption" color="text.secondary">Protect your account with 2FA</Typography>
                                            </Box>
                                        </Box>
                                        <Button variant="outlined" size="small">Enable</Button>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Lock sx={{ color: '#0A1E3F' }} />
                                            <Box>
                                                <Typography>Change PIN</Typography>
                                                <Typography variant="caption" color="text.secondary">Last changed 30 days ago</Typography>
                                            </Box>
                                        </Box>
                                        <Button variant="outlined" size="small">Update</Button>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Security sx={{ color: '#0A1E3F' }} />
                                            <Box>
                                                <Typography>Login Activity</Typography>
                                                <Typography variant="caption" color="text.secondary">Last login: Today</Typography>
                                            </Box>
                                        </Box>
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
                        
                        {isLaineyAccount ? (
                            <Box sx={{ textAlign: 'center', py: 3 }}>
                                <Alert severity="warning" sx={{ mb: 3 }}>
                                    <Typography variant="body1" fontWeight={600}>Account Restricted</Typography>
                                    <Typography variant="body2">This account is currently disabled. Please contact support for assistance.</Typography>
                                </Alert>
                                <Button 
                                    fullWidth
                                    variant="contained"
                                    onClick={() => window.open(whatsappLink, '_blank')}
                                    sx={{ 
                                        bgcolor: '#25D366',
                                        '&:hover': { bgcolor: '#128C7E' },
                                        py: 1.5,
                                        gap: 1
                                    }}
                                >
                                    <WhatsAppIcon /> Contact Support on WhatsApp
                                </Button>
                            </Box>
                        ) : (
                            <>
                                <Stepper activeStep={transferStep} sx={{ mb: 4 }}>
                                    {transferSteps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                                </Stepper>
                                {transferStep === 0 && (
                                    <Box><TextField fullWidth label="Recipient Account/Email" value={recipientAccount} onChange={(e) => setRecipientAccount(e.target.value)} sx={{ mb: 2 }} /><TextField fullWidth label="Recipient Name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} sx={{ mb: 2 }} /><GoldButton fullWidth onClick={() => setTransferStep(1)}>Continue</GoldButton></Box>
                                )}
                                {transferStep === 1 && (
                                    <Box><TextField fullWidth label="Amount (USD)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} /><TextField fullWidth label="Purpose" value={transferPurpose} onChange={(e) => setTransferPurpose(e.target.value)} sx={{ mb: 2 }} /><Box sx={{ display: 'flex', gap: 2 }}><Button variant="outlined" onClick={() => setTransferStep(0)}>Back</Button><GoldButton onClick={() => setTransferStep(2)}>Continue</GoldButton></Box></Box>
                                )}
                                {transferStep === 2 && (
                                    <Box><Paper sx={{ p: 2, bgcolor: '#F5F7FA', mb: 2 }}><Typography>To: {recipientAccount}</Typography><Typography>Amount: ${parseFloat(amount) || 0}</Typography><Typography>Purpose: {transferPurpose || 'Not specified'}</Typography></Paper><Box sx={{ display: 'flex', gap: 2 }}><Button variant="outlined" onClick={() => setTransferStep(1)}>Back</Button><GoldButton onClick={handleSendMoney}>Confirm & Send</GoldButton></Box></Box>
                                )}
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
                        {isLaineyAccount ? (
                            <Box sx={{ textAlign: 'center' }}>
                                <Alert severity="warning" sx={{ mb: 3 }}>Account is disabled. Contact support.</Alert>
                                <Button fullWidth variant="contained" onClick={() => window.open(whatsappLink, '_blank')} sx={{ bgcolor: '#25D366' }} startIcon={<WhatsAppIcon />}>Contact Support</Button>
                            </Box>
                        ) : (
                            <><TextField fullWidth label="From (Email/Account)" value={recipientAccount} onChange={(e) => setRecipientAccount(e.target.value)} sx={{ mb: 2 }} /><TextField fullWidth label="Amount (USD)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} /><GoldButton fullWidth onClick={handleRequestMoney}>Send Request</GoldButton></>
                        )}
                    </Box>
                </Fade>
            </Modal>

            {/* PAY BILLS MODAL */}
            <Modal open={payBillsModal} onClose={() => setPayBillsModal(false)} closeAfterTransition BackdropComponent={Backdrop}>
                <Fade in={payBillsModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: { xs: '90%', sm: 400 } }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setPayBillsModal(false)}><Close /></IconButton>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#0A1E3F' }}>Pay Bills</Typography>
                        {isLaineyAccount ? (
                            <Box sx={{ textAlign: 'center' }}>
                                <Alert severity="warning" sx={{ mb: 3 }}>Account is disabled. Contact support.</Alert>
                                <Button fullWidth variant="contained" onClick={() => window.open(whatsappLink, '_blank')} sx={{ bgcolor: '#25D366' }} startIcon={<WhatsAppIcon />}>Contact Support</Button>
                            </Box>
                        ) : (
                            <><FormControl fullWidth sx={{ mb: 2 }}><InputLabel>Bill Type</InputLabel><Select value={transferPurpose} onChange={(e) => setTransferPurpose(e.target.value)}><MenuItem value="Electricity">Electricity</MenuItem><MenuItem value="Water">Water</MenuItem><MenuItem value="Internet">Internet</MenuItem><MenuItem value="Phone">Phone</MenuItem></Select></FormControl><TextField fullWidth label="Amount (USD)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} /><GoldButton fullWidth onClick={handlePayBill}>Pay Bill</GoldButton></>
                        )}
                    </Box>
                </Fade>
            </Modal>

            {/* TOP UP MODAL */}
            <Modal open={topUpModal} onClose={() => setTopUpModal(false)} closeAfterTransition BackdropComponent={Backdrop}>
                <Fade in={topUpModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: { xs: '90%', sm: 400 } }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setTopUpModal(false)}><Close /></IconButton>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#0A1E3F' }}>Top Up Account</Typography>
                        {isLaineyAccount ? (
                            <Box sx={{ textAlign: 'center' }}>
                                <Alert severity="warning" sx={{ mb: 3 }}>Account is disabled. Contact support.</Alert>
                                <Button fullWidth variant="contained" onClick={() => window.open(whatsappLink, '_blank')} sx={{ bgcolor: '#25D366' }} startIcon={<WhatsAppIcon />}>Contact Support</Button>
                            </Box>
                        ) : (
                            <><FormControl fullWidth sx={{ mb: 2 }}><InputLabel>Method</InputLabel><Select value={transferType} onChange={(e) => setTransferType(e.target.value)}><MenuItem value="bank">Bank Transfer</MenuItem><MenuItem value="card">Credit Card</MenuItem></Select></FormControl><TextField fullWidth label="Amount (USD)" type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} /><GoldButton fullWidth onClick={handleDeposit}>Add Money</GoldButton></>
                        )}
                    </Box>
                </Fade>
            </Modal>

            {/* PROFILE QUICK MODAL */}
            <Modal open={profileModal} onClose={() => setProfileModal(false)} closeAfterTransition BackdropComponent={Backdrop}>
                <Fade in={profileModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: { xs: '90%', sm: 350 }, textAlign: 'center' }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setProfileModal(false)}><Close /></IconButton>
                        <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: '#0A1E3F' }}>{displayName.charAt(0)}</Avatar>
                        <Typography variant="h6">{displayFullName}</Typography>
                        <Typography variant="body2" color="text.secondary">{displayEmail}</Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body2"><strong>Account:</strong> {displayAccountNumber}</Typography>
                        <Typography variant="body2"><strong>Balance:</strong> {formatCurrency(displayBalance)}</Typography>
                        <Typography variant="body2"><strong>Country:</strong> {displayCountry}</Typography>
                        {isLaineyAccount && (
                            <Chip label="Account Disabled" size="small" sx={{ mt: 2, bgcolor: '#dc004e', color: 'white' }} />
                        )}
                        <GoldButton fullWidth sx={{ mt: 2 }} onClick={() => { setProfileModal(false); setTabValue(3); }}>Full Profile</GoldButton>
                    </Box>
                </Fade>
            </Modal>

            {/* Bottom Navigation */}
            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderRadius: '20px 20px 0 0' }}>
                <BottomNavigation showLabels value={navValue} onChange={(e, v) => { setNavValue(v); setTabValue(v); }}>
                    <BottomNavigationAction label="HOME" icon={<Home />} />
                    <BottomNavigationAction label="TRANSFER" icon={<SendIcon />} onClick={() => setSendModal(true)} />
                    <BottomNavigationAction label="STATS" icon={<TrendingUp />} />
                    <BottomNavigationAction label="PROFILE" icon={<Person />} onClick={() => setTabValue(3)} />
                </BottomNavigation>
            </Paper>

            {/* WhatsApp Floating Button */}
            <WhatsAppButton onClick={() => window.open(whatsappLink, '_blank')}>
                <WhatsAppIcon sx={{ fontSize: 30 }} />
            </WhatsAppButton>

            {/* Message Popup */}
            <Snackbar open={message.show} autoHideDuration={4000} onClose={() => setMessage({ ...message, show: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity={message.type} variant="filled">{message.text}</Alert>
            </Snackbar>
        </Box>
    );
}

// StyledModal component
const StyledModal = styled(Modal)({ display: 'flex', alignItems: 'center', justifyContent: 'center' });
const ModalContent = styled(Paper)(({ theme }) => ({ backgroundColor: 'white', borderRadius: '24px', padding: theme.spacing(4), maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto', position: 'relative' }));
const GoldButton = styled(Button)(({ theme }) => ({ background: 'linear-gradient(135deg, #0A1E3F 0%, #1A3B5E 100%)', color: 'white', padding: '12px', borderRadius: '12px', textTransform: 'none', fontWeight: 600 }));

export default Dashboard;