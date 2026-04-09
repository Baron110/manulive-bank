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
    const isLaineyAccount = currentUser?.email === 'universalfanconnect@gmail.com';

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
        email: '',
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

    // Use hardcoded data ONLY if logged in user matches Lainey's email
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

    // Issued Card
    const issuedCard = {
        cardholderName: isLaineyAccount ? 'Lainey Wilson' : userData.fullName,
        maskedNumber: isLaineyAccount ? '**** **** **** 1903' : '**** **** **** 1234',
        expiryDate: '12/27',
        cvv: '***',
        cardDesign: isLaineyAccount ? 'gold' : 'black',
        cardType: isLaineyAccount ? 'credit' : 'debit',
        limit: isLaineyAccount ? 100000 : 25000
    };

    // Extended transaction history (50+ transactions)
    const generateTransactionHistory = () => {
        const history = [];
        const names = ['Nashville Records', 'Country Music Awards', 'Spotify Royalties', 'Apple Music', 'Amazon Music', 'Starbucks', 'Whole Foods', 'Nashville Restaurant', 'Uber', 'Airbnb', 'Guitar Center', 'SoundCloud', 'YouTube Music', 'Ticketmaster', 'Live Nation'];
        const categories = ['ROYALTIES', 'MUSIC', 'DINING', 'SHOPPING', 'BILLS', 'ENTERTAINMENT', 'TRANSPORT', 'MERCH'];
        
        for (let i = 0; i < 50; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            const amountVal = Math.random() * 50000;
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

    // Chart data with USD currency
    const spendingData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Spending ($)',
                data: [120000, 190000, 150000, 220000, 180000, 240000],
                borderColor: '#0A1E3F',
                backgroundColor: 'rgba(10, 30, 63, 0.1)',
                tension: 0.4
            }
        ]
    };

    const categoryData = {
        labels: ['Music', 'Dining', 'Shopping', 'Travel', 'Bills'],
        datasets: [
            {
                data: [45, 20, 15, 12, 8],
                backgroundColor: ['#0A1E3F', '#1A3B5E', '#2A4B7E', '#3A5B9E', '#4A6BBE'],
                borderWidth: 0
            }
        ]
    };

    const monthlyData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
            {
                label: 'Income ($)',
                data: [850000, 920000, 880000, 950000],
                backgroundColor: '#4CAF50',
            },
            {
                label: 'Expenses ($)',
                data: [120000, 98000, 110000, 105000],
                backgroundColor: '#f44336',
            }
        ]
    };

    // Load user data from Firebase
    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        const user = auth.currentUser;
        if (user) {
            // If it's Lainey's account, use hardcoded data (don't override)
            if (user.email === 'universalfanconnect@gmail.com') {
                console.log('Lainey Wilson account detected - using hardcoded data');
                return;
            }
            
            // For other users, load from Firebase
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
        // Show WhatsApp message and redirect
        showMessage(
            '⛔ ACCOUNT RESTRICTED: This account is currently disabled. Please contact support via WhatsApp for assistance.',
            'warning'
        );
        
        // Open WhatsApp after 1 second
        setTimeout(() => {
            window.open(whatsappLink, '_blank');
        }, 1000);
        
        // Log the attempt
        console.log('Transfer blocked - Account disabled. Contact WhatsApp support.');
    };

    const handleDeposit = () => {
        const depositAmountNum = parseFloat(depositAmount);
        if (depositAmountNum <= 0) {
            showMessage('Please enter a valid amount', 'error');
            return;
        }
        
        // For Lainey's account, show restriction
        if (isLaineyAccount) {
            showMessage('⛔ ACCOUNT RESTRICTED: Deposits are currently disabled. Please contact support via WhatsApp.', 'warning');
            setTimeout(() => {
                window.open(whatsappLink, '_blank');
            }, 1000);
            return;
        }
        
        setBalance(prev => prev + depositAmountNum);
        showMessage(`💰 Successfully deposited ${formatCurrency(depositAmountNum)}`, 'success');
        setTopUpModal(false);
        setDepositAmount('');
    };

    const handleRequestMoney = () => {
        if (!recipientAccount || !amount) {
            showMessage('Please fill all fields', 'error');
            return;
        }
        
        // For Lainey's account, show restriction
        if (isLaineyAccount) {
            showMessage('⛔ ACCOUNT RESTRICTED: Requests are currently disabled. Please contact support via WhatsApp.', 'warning');
            setTimeout(() => {
                window.open(whatsappLink, '_blank');
            }, 1000);
            return;
        }
        
        showMessage(`💰 Request sent to ${recipientAccount} for ${formatCurrency(parseFloat(amount))}`, 'success');
        setRequestModal(false);
        setRecipientAccount('');
        setAmount('');
    };

    const handlePayBill = () => {
        if (!transferPurpose || !amount) {
            showMessage('Please select bill type and enter amount', 'error');
            return;
        }
        
        // For Lainey's account, show restriction
        if (isLaineyAccount) {
            showMessage('⛔ ACCOUNT RESTRICTED: Bill payments are currently disabled. Please contact support via WhatsApp.', 'warning');
            setTimeout(() => {
                window.open(whatsappLink, '_blank');
            }, 1000);
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

    const transferSteps = ['Recipient Info', 'Amount & Purpose', 'Review', 'Security'];

    // If not Lainey's account, show normal view but with different balance
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
                                    label="+15.4% this month"
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

                        {/* Virtual Card - Gold Design */}
                        <Paper sx={{ p: 3, borderRadius: '20px', mb: 3, background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)', color: '#000000' }}>
                            <Typography variant="caption" sx={{ letterSpacing: 2, opacity: 0.7 }}>GOLD CREDIT CARD</Typography>
                            <Typography variant="h5" sx={{ fontFamily: 'monospace', letterSpacing: 2, mt: 2 }}>{issuedCard.maskedNumber}</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                <Box><Typography variant="caption">Cardholder</Typography><Typography>{issuedCard.cardholderName}</Typography></Box>
                                <Box><Typography variant="caption">Expires</Typography><Typography>{issuedCard.expiryDate}</Typography></Box>
                                <Box><Typography variant="caption">CVV</Typography><Typography>{showCVV ? issuedCard.cvv : '***'}<IconButton size="small" onClick={() => setShowCVV(!showCVV)}><Visibility sx={{ fontSize: 14 }} /></IconButton></Typography></Box>
                            </Box>
                            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                                <Typography variant="caption">Credit Limit</Typography>
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
                                        <Typography variant="h4" sx={{ color: '#4CAF50' }}>72%</Typography>
                                        <LinearProgress variant="determinate" value={72} sx={{ mt: 1, height: 8, borderRadius: 4 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Credit Score</Typography>
                                        <Typography variant="h4">{displayCreditScore}</Typography>
                                        <LinearProgress variant="determinate" value={81} sx={{ mt: 1, height: 8, borderRadius: 4 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Budget Utilization</Typography>
                                        <Typography variant="h4">45%</Typography>
                                        <LinearProgress variant="determinate" value={45} sx={{ mt: 1, height: 8, borderRadius: 4 }} />
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
                                        <Typography>Music Royalties</Typography>
                                        <Typography fontWeight={600}>{formatCurrency(245000)}</Typography>
                                    </Box>
                                    <Divider />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography>Dining</Typography>
                                        <Typography fontWeight={600}>{formatCurrency(45600)}</Typography>
                                    </Box>
                                    <Divider />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography>Shopping</Typography>
                                        <Typography fontWeight={600}>{formatCurrency(28900)}</Typography>
                                    </Box>
                                    <Divider />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography>Travel</Typography>
                                        <Typography fontWeight={600}>{formatCurrency(21500)}</Typography>
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
                                    <Button onClick={() => setEditMode(!editMode)} startIcon={<Edit />} sx={{ color: '#0A1E3F' }}>
                                        {editMode ? 'Cancel' : 'Edit'}
                                    </Button>
                                </Box>
                                
                                {editMode ? (
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
                                                <Typography variant="caption" color="text.secondary">Last login: Today, 10:30 AM</Typography>
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
            <StyledModal
                open={sendModal}
                onClose={() => setSendModal(false)}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{ timeout: 500 }}
            >
                <Fade in={sendModal}>
                    <ModalContent sx={{ maxWidth: '500px' }}>
                        <IconButton 
                            sx={{ position: 'absolute', right: 8, top: 8 }}
                            onClick={() => setSendModal(false)}
                        >
                            <Close />
                        </IconButton>
                        
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#0A1E3F' }}>
                            Money Transfer
                        </Typography>

                        <Stepper activeStep={transferStep} sx={{ mb: 4 }}>
                            {transferSteps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>

                        {transferStep === 0 && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Recipient Account Number"
                                    value={recipientAccount}
                                    onChange={(e) => setRecipientAccount(e.target.value)}
                                    variant="outlined"
                                    placeholder="XXXXXXXXXX"
                                />
                                <TextField
                                    fullWidth
                                    label="Recipient Full Name"
                                    value={recipientName}
                                    onChange={(e) => setRecipientName(e.target.value)}
                                    variant="outlined"
                                    placeholder="As appears on bank account"
                                />
                                <FormControl fullWidth>
                                    <InputLabel>Transfer Type</InputLabel>
                                    <Select
                                        value={transferType}
                                        label="Transfer Type"
                                        onChange={(e) => setTransferType(e.target.value)}
                                    >
                                        <MenuItem value="interac">Wire Transfer</MenuItem>
                                        <MenuItem value="wire">Bank Transfer</MenuItem>
                                        <MenuItem value="international">International Wire</MenuItem>
                                    </Select>
                                </FormControl>
                                <Button 
                                    variant="contained"
                                    onClick={() => setTransferStep(1)}
                                    sx={{ mt: 2 }}
                                >
                                    Continue
                                </Button>
                            </Box>
                        )}

                        {transferStep === 1 && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Amount (USD)"
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: <Typography sx={{ mr: 1, color: '#666' }}>$</Typography>
                                    }}
                                />
                                <FormControl fullWidth>
                                    <InputLabel>Purpose of Transfer</InputLabel>
                                    <Select
                                        value={transferPurpose}
                                        label="Purpose of Transfer"
                                        onChange={(e) => setTransferPurpose(e.target.value)}
                                    >
                                        <MenuItem value="personal">Personal/Gift</MenuItem>
                                        <MenuItem value="business">Business Payment</MenuItem>
                                        <MenuItem value="rent">Rent/Mortgage</MenuItem>
                                        <MenuItem value="education">Education</MenuItem>
                                        <MenuItem value="investment">Investment</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField
                                    fullWidth
                                    label="Additional Notes"
                                    multiline
                                    rows={2}
                                    placeholder="Optional message"
                                />
                                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                    <Button variant="outlined" onClick={() => setTransferStep(0)}>Back</Button>
                                    <Button variant="contained" onClick={() => setTransferStep(2)}>Continue</Button>
                                </Box>
                            </Box>
                        )}

                        {transferStep === 2 && (
                            <Box>
                                <Typography variant="h6" gutterBottom>Review Transfer Details</Typography>
                                <Paper sx={{ p: 2, bgcolor: '#F5F7FA', mb: 2 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">To Account</Typography>
                                            <Typography>{recipientAccount}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Recipient</Typography>
                                            <Typography>{recipientName}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Amount</Typography>
                                            <Typography variant="h6">{formatCurrency(parseFloat(amount) || 0)}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Type</Typography>
                                            <Typography>{transferType}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="caption" color="text.secondary">Purpose</Typography>
                                            <Typography>{transferPurpose}</Typography>
                                        </Grid>
                                    </Grid>
                                </Paper>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button variant="outlined" onClick={() => setTransferStep(1)}>Back</Button>
                                    <Button variant="contained" onClick={() => setTransferStep(3)}>Continue</Button>
                                </Box>
                            </Box>
                        )}

                        {transferStep === 3 && (
                            <Box>
                                <Alert severity="warning" sx={{ mb: 3 }}>
                                    <Typography variant="body1" fontWeight={600}>Account Restricted</Typography>
                                    <Typography variant="body2">This account is currently disabled. Please contact support for assistance.</Typography>
                                </Alert>

                                <Button 
                                    fullWidth
                                    variant="contained"
                                    onClick={handleSendMoney}
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
                        )}
                    </ModalContent>
                </Fade>
            </StyledModal>

            {/* REQUEST MODAL */}
            <StyledModal
                open={requestModal}
                onClose={() => setRequestModal(false)}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{ timeout: 500 }}
            >
                <Fade in={requestModal}>
                    <ModalContent sx={{ maxWidth: '400px' }}>
                        <IconButton 
                            sx={{ position: 'absolute', right: 8, top: 8 }}
                            onClick={() => setRequestModal(false)}
                        >
                            <Close />
                        </IconButton>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#0A1E3F' }}>
                            Request Money
                        </Typography>
                        <TextField
                            fullWidth
                            label="From Account"
                            value={recipientAccount}
                            onChange={(e) => setRecipientAccount(e.target.value)}
                            variant="outlined"
                            sx={{ mb: 2 }}
                            placeholder="Account number or email"
                        />
                        <TextField
                            fullWidth
                            label="Amount (USD)"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            variant="outlined"
                            sx={{ mb: 3 }}
                            InputProps={{
                                startAdornment: <Typography sx={{ mr: 1, color: '#666' }}>$</Typography>
                            }}
                        />
                        <Button 
                            fullWidth
                            variant="contained"
                            onClick={handleRequestMoney}
                            sx={{ 
                                bgcolor: '#0A1E3F',
                                '&:hover': { bgcolor: '#1A3B5E' },
                                py: 1.5
                            }}
                        >
                            Send Request
                        </Button>
                    </ModalContent>
                </Fade>
            </StyledModal>

            {/* PAY BILLS MODAL */}
            <StyledModal
                open={payBillsModal}
                onClose={() => setPayBillsModal(false)}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{ timeout: 500 }}
            >
                <Fade in={payBillsModal}>
                    <ModalContent sx={{ maxWidth: '400px' }}>
                        <IconButton 
                            sx={{ position: 'absolute', right: 8, top: 8 }}
                            onClick={() => setPayBillsModal(false)}
                        >
                            <Close />
                        </IconButton>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#0A1E3F' }}>
                            Pay Bills
                        </Typography>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Bill Type</InputLabel>
                            <Select
                                value={transferPurpose}
                                label="Bill Type"
                                onChange={(e) => setTransferPurpose(e.target.value)}
                            >
                                <MenuItem value="Electricity">Electricity Bill</MenuItem>
                                <MenuItem value="Water">Water Bill</MenuItem>
                                <MenuItem value="Internet">Internet Bill</MenuItem>
                                <MenuItem value="Phone">Phone Bill</MenuItem>
                                <MenuItem value="Rent">Rent</MenuItem>
                                <MenuItem value="Mortgage">Mortgage</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Amount (USD)"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            variant="outlined"
                            sx={{ mb: 3 }}
                            InputProps={{
                                startAdornment: <Typography sx={{ mr: 1, color: '#666' }}>$</Typography>
                            }}
                        />
                        <Button 
                            fullWidth
                            variant="contained"
                            onClick={handlePayBill}
                            sx={{ 
                                bgcolor: '#0A1E3F',
                                '&:hover': { bgcolor: '#1A3B5E' },
                                py: 1.5
                            }}
                        >
                            Pay Bill
                        </Button>
                    </ModalContent>
                </Fade>
            </StyledModal>

            {/* TOP UP MODAL */}
            <StyledModal
                open={topUpModal}
                onClose={() => setTopUpModal(false)}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{ timeout: 500 }}
            >
                <Fade in={topUpModal}>
                    <ModalContent sx={{ maxWidth: '400px' }}>
                        <IconButton 
                            sx={{ position: 'absolute', right: 8, top: 8 }}
                            onClick={() => setTopUpModal(false)}
                        >
                            <Close />
                        </IconButton>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#0A1E3F' }}>
                            Top Up Account
                        </Typography>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Deposit Method</InputLabel>
                            <Select
                                value={transferType}
                                label="Deposit Method"
                                onChange={(e) => setTransferType(e.target.value)}
                            >
                                <MenuItem value="bank">Bank Transfer</MenuItem>
                                <MenuItem value="card">Credit/Debit Card</MenuItem>
                                <MenuItem value="cash">Cash Deposit</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Amount (USD)"
                            type="number"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            variant="outlined"
                            sx={{ mb: 3 }}
                            InputProps={{
                                startAdornment: <Typography sx={{ mr: 1, color: '#666' }}>$</Typography>
                            }}
                        />
                        <Button 
                            fullWidth
                            variant="contained"
                            onClick={handleDeposit}
                            sx={{ 
                                bgcolor: '#0A1E3F',
                                '&:hover': { bgcolor: '#1A3B5E' },
                                py: 1.5
                            }}
                        >
                            Add Money
                        </Button>
                    </ModalContent>
                </Fade>
            </StyledModal>

            {/* PROFILE MODAL */}
            <StyledModal
                open={profileModal}
                onClose={() => setProfileModal(false)}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{ timeout: 500 }}
            >
                <Fade in={profileModal}>
                    <ModalContent sx={{ maxWidth: '400px' }}>
                        <IconButton 
                            sx={{ position: 'absolute', right: 8, top: 8 }}
                            onClick={() => setProfileModal(false)}
                        >
                            <Close />
                        </IconButton>
                        
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <Avatar sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: '#0A1E3F', fontSize: '2rem' }}>
                                {displayName.charAt(0)}
                            </Avatar>
                            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                {displayFullName}
                            </Typography>
                            <Typography color="text.secondary" gutterBottom>
                                {displayOccupation}
                            </Typography>
                            <BankOwnerBadge sx={{ mt: 1 }}>
                                <CheckCircle sx={{ fontSize: 14 }} />
                                {isLaineyAccount ? 'Verified Artist' : 'Verified Member'}
                            </BankOwnerBadge>
                        </Box>

                        <Divider sx={{ my: 2 }} />
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Badge sx={{ color: '#666' }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Full Name</Typography>
                                    <Typography>{displayFullName}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Email sx={{ color: '#666' }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Email</Typography>
                                    <Typography>{displayEmail}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Phone sx={{ color: '#666' }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Phone</Typography>
                                    <Typography>{displayPhone}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Cake sx={{ color: '#666' }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                                    <Typography>{displayDob}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Public sx={{ color: '#666' }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Country</Typography>
                                    <Typography>{displayCountry} 🇺🇸</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <BusinessCenter sx={{ color: '#666' }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Occupation</Typography>
                                    <Typography>{displayOccupation}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <AccountBalance sx={{ color: '#666' }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Balance</Typography>
                                    <Typography>{formatCurrency(displayBalance)}</Typography>
                                </Box>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button 
                                fullWidth 
                                variant="outlined"
                                startIcon={<Edit />}
                                onClick={() => {
                                    setProfileModal(false);
                                    setTabValue(3);
                                    setEditMode(true);
                                }}
                            >
                                Edit Profile
                            </Button>
                            <Button 
                                fullWidth 
                                variant="contained"
                                sx={{ bgcolor: '#0A1E3F' }}
                                onClick={() => setProfileModal(false)}
                            >
                                Close
                            </Button>
                        </Box>
                    </ModalContent>
                </Fade>
            </StyledModal>

            {/* Bottom Navigation */}
            <Paper sx={{ 
                position: 'fixed', 
                bottom: 0, 
                left: 0, 
                right: 0,
                borderRadius: '20px 20px 0 0',
                boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
            }}>
                <BottomNavigation
                    showLabels
                    value={navValue}
                    onChange={(event, newValue) => {
                        setNavValue(newValue);
                        setTabValue(newValue);
                    }}
                >
                    <BottomNavigationAction label="HOME" icon={<Home />} />
                    <BottomNavigationAction label="TRANSFER" icon={<SendIcon />} onClick={() => setSendModal(true)} />
                    <BottomNavigationAction label="STATS" icon={<TrendingUp />} />
                    <BottomNavigationAction label="PROFILE" icon={<Person />} onClick={() => setTabValue(3)} />
                </BottomNavigation>
            </Paper>

            {/* WhatsApp Floating Button */}
            <WhatsAppButton 
                onClick={() => window.open(whatsappLink, '_blank')}
                aria-label="WhatsApp Support"
            >
                <WhatsAppIcon sx={{ fontSize: 30 }} />
            </WhatsAppButton>

            {/* Message Popup */}
            <Snackbar
                open={message.show}
                autoHideDuration={6000}
                onClose={() => setMessage({ ...message, show: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    severity={message.type} 
                    variant="filled"
                    sx={{ 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        maxWidth: '500px'
                    }}
                >
                    {message.text}
                </Alert>
            </Snackbar>
        </Box>
    );
}

// StyledModal component
const StyledModal = styled(Modal)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
});

const ModalContent = styled(Paper)(({ theme }) => ({
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: theme.spacing(4),
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
    position: 'relative',
}));

export default Dashboard;