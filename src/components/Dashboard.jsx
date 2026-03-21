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
    Stepper, Step, StepLabel, Radio, RadioGroup, FormControlLabel
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
    AccountCircle, Badge, Cake, Public, Map
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

// Register ChartJS components
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

function Dashboard() {
    const [userData, setUserData] = useState(null);
    const [balance, setBalance] = useState(350000);
    const [transactions, setTransactions] = useState([]);
    const [message, setMessage] = useState({ show: false, text: '', type: 'success' });
    const [navValue, setNavValue] = useState(0);
    const [tabValue, setTabValue] = useState(0);
    
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
    
    // Profile data - Laura Kreuk's info
    const profileData = {
        surname: 'Kreuk',
        middleName: 'Laura',
        lastName: 'Kristin',
        username: 'Kristin1982',
        email: 'kristinkreuk17@gmail.com',
        pin: '1982',
        dob: '30/12/1982',
        phone: '+1 (604) 555-1234',
        country: 'Canada',
        state: 'Vancouver',
        city: 'Vancouver',
        gender: 'Female',
        occupation: 'Actress',
        fullAddress: '123 Beach Avenue, Vancouver, BC V6Z 2R6',
        accountNumber: 'MAN' + Math.floor(Math.random() * 10000000000),
        memberSince: 'January 2024',
        creditScore: 782,
        accountType: 'Premium Black'
    };

    // Bank owner info
    const bankOwner = {
        name: 'Laura Kreuk',
        title: 'Founder & CEO',
        email: 'laura.kreuk@manulivebank.com',
        since: '2024'
    };

    // Extended transaction history (50+ transactions)
    const generateTransactionHistory = () => {
        const history = [];
        const names = ['Sarah Jenkins', 'Acme Corp', 'Marcus Thorne', 'Netflix', 'Amazon', 'Starbucks', 'Whole Foods', 'Apple', 'Spotify', 'Uber', 'Rogers', 'Telus', 'BC Hydro', 'Vancouver City', 'Costco', 'Walmart', 'Tim Hortons', 'Lululemon', 'Arc\'teryx', 'MEC'];
        const categories = ['DINING', 'SHOPPING', 'SALARY', 'TRANSFER', 'BILLS', 'ENTERTAINMENT', 'TRANSPORT', 'GROCERIES', 'UTILITIES', 'HEALTH'];
        
        for (let i = 0; i < 50; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            const amount = Math.random() * 1000;
            const type = Math.random() > 0.7 ? 'received' : 'sent';
            
            history.push({
                id: Date.now() - i,
                name: names[Math.floor(Math.random() * names.length)],
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                amount: type === 'received' ? amount : -amount,
                category: categories[Math.floor(Math.random() * categories.length)],
                type: type,
                status: Math.random() > 0.9 ? 'pending' : 'completed',
                reference: `TRX${Math.floor(Math.random() * 1000000)}`,
                accountNumber: `****${Math.floor(Math.random() * 10000)}`
            });
        }
        return history.sort((a, b) => b.id - a.id);
    };

    const [transactionHistory, setTransactionHistory] = useState(generateTransactionHistory());

    // Chart data
    const spendingData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Spending',
                data: [12000, 19000, 15000, 22000, 18000, 24000],
                borderColor: '#0A1E3F',
                backgroundColor: 'rgba(10, 30, 63, 0.1)',
                tension: 0.4
            }
        ]
    };

    const categoryData = {
        labels: ['Dining', 'Shopping', 'Bills', 'Transport', 'Entertainment'],
        datasets: [
            {
                data: [30, 25, 20, 15, 10],
                backgroundColor: ['#0A1E3F', '#1A3B5E', '#2A4B7E', '#3A5B9E', '#4A6BBE'],
                borderWidth: 0
            }
        ]
    };

    const monthlyData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
            {
                label: 'Income',
                data: [85000, 92000, 88000, 95000],
                backgroundColor: '#4CAF50',
            },
            {
                label: 'Expenses',
                data: [62000, 68000, 64000, 71000],
                backgroundColor: '#f44336',
            }
        ]
    };

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserData(data);
                    setBalance(data.balance || 350000);
                    setTransactions(data.transactions || []);
                }
            } catch (error) {
                showMessage('Error loading data: ' + error.message, 'error');
            }
        }
    };

    const handleSendMoney = () => {
        // Professional restriction message
        showMessage(
            '⛔ TRANSFER RESTRICTION: For your security, international transfers require additional verification. Please visit a MANULIVE branch or contact customer support at 1-800-MANULIVE to complete your verification process. We apologize for any inconvenience.',
            'warning'
        );
        
        // Log the attempt
        console.log('Transfer attempt:', {
            to: recipientAccount,
            name: recipientName,
            amount: amount,
            purpose: transferPurpose,
            type: transferType,
            time: new Date().toISOString()
        });
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
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'completed': return '#4CAF50';
            case 'pending': return '#FF9800';
            case 'failed': return '#f44336';
            default: return '#999';
        }
    };

    const transferSteps = ['Recipient Info', 'Amount & Purpose', 'Review', 'Security'];

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
        <Typography 
            variant="h5" 
            sx={{ 
                fontWeight: 700, 
                color: '#0A1E3F',
                fontFamily: '"Playfair Display", "Georgia", serif',
                letterSpacing: '-0.5px'
            }}
        >
            QuinCore Bank
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton>
                <Notifications />
            </IconButton>
            <IconButton onClick={handleLogout} sx={{ color: '#dc004e' }}>
                <Logout />
            </IconButton>
            <IconButton onClick={() => setProfileModal(true)}>
                <Avatar sx={{ bgcolor: '#1A3B5E' }}>
                    {userData?.firstName?.charAt(0) || userData?.fullName?.charAt(0) || 'U'}
                </Avatar>
            </IconButton>
        </Box>
    </Toolbar>
</AppBar>s

            <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
                {/* Tabs for different views */}
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
                    <Tab label="Dashboard" />
                    <Tab label="Analytics" />
                    <Tab label="History" />
                    <Tab label="Profile" />
                </Tabs>

                {/* DASHBOARD TAB */}
                {tabValue === 0 && (
                    <>
                        {/* Balance Card */}
                        <BalanceCard elevation={3}>
                            <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                                TOTAL BALANCE (CAD)
                            </Typography>
                            <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
                                {formatCurrency(balance)}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Chip 
                                    icon={<ArrowUpward sx={{ fontSize: 16 }} />}
                                    label="+2.4% this month"
                                    size="small"
                                    sx={{ 
                                        bgcolor: 'rgba(255,255,255,0.2)', 
                                        color: 'white',
                                        '& .MuiChip-icon': { color: 'white' }
                                    }}
                                />
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                    Premium Black Account
                                </Typography>
                            </Box>
                        </BalanceCard>

                        {/* Quick Actions */}
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

                        {/* Charts Row */}
                        <Grid container spacing={3} sx={{ mb: 3 }}>
                            <Grid item xs={12} md={8}>
                                <Paper sx={{ p: 3, borderRadius: '20px' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                        Spending Trend
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
                                <Button size="small" endIcon={<MoreHoriz />}>View All</Button>
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
                                    Income vs Expenses
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
                                        <Typography variant="h4" sx={{ color: '#4CAF50' }}>24%</Typography>
                                        <LinearProgress variant="determinate" value={24} sx={{ mt: 1, height: 8, borderRadius: 4 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Credit Score</Typography>
                                        <Typography variant="h4">{profileData.creditScore}</Typography>
                                        <LinearProgress variant="determinate" value={78.2} sx={{ mt: 1, height: 8, borderRadius: 4 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Budget Utilization</Typography>
                                        <Typography variant="h4">68%</Typography>
                                        <LinearProgress variant="determinate" value={68} sx={{ mt: 1, height: 8, borderRadius: 4 }} />
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
                                        <Typography>Dining</Typography>
                                        <Typography fontWeight={600}>{formatCurrency(3450)}</Typography>
                                    </Box>
                                    <Divider />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography>Shopping</Typography>
                                        <Typography fontWeight={600}>{formatCurrency(2890)}</Typography>
                                    </Box>
                                    <Divider />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography>Bills</Typography>
                                        <Typography fontWeight={600}>{formatCurrency(2100)}</Typography>
                                    </Box>
                                    <Divider />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography>Transport</Typography>
                                        <Typography fontWeight={600}>{formatCurrency(850)}</Typography>
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
                                        <TableCell>Account</TableCell>
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
                                                <Typography variant="caption">{t.accountNumber}</Typography>
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
                                    <Avatar sx={{ width: 120, height: 120, mx: 'auto', mb: 2, bgcolor: '#0A1E3F' }}>
                                        {profileData.surname.charAt(0)}{profileData.lastName.charAt(0)}
                                    </Avatar>
                                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                        {profileData.surname} {profileData.middleName} {profileData.lastName}
                                    </Typography>
                                    <Typography color="text.secondary" gutterBottom>
                                        @{profileData.username}
                                    </Typography>
                                    <Chip label={profileData.accountType} sx={{ mt: 1 }} />
                                </Box>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Email sx={{ color: '#666' }} />
                                        <Typography variant="body2">{profileData.email}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Phone sx={{ color: '#666' }} />
                                        <Typography variant="body2">{profileData.phone}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <LocationOn sx={{ color: '#666' }} />
                                        <Typography variant="body2">{profileData.fullAddress}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Cake sx={{ color: '#666' }} />
                                        <Typography variant="body2">{profileData.dob}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Flag sx={{ color: '#666' }} />
                                        <Typography variant="body2">{profileData.country}, {profileData.state}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Wc sx={{ color: '#666' }} />
                                        <Typography variant="body2">{profileData.gender}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <BusinessCenter sx={{ color: '#666' }} />
                                        <Typography variant="body2">{profileData.occupation}</Typography>
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
                                        <Typography variant="h6">{profileData.accountNumber}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">Member Since</Typography>
                                        <Typography variant="h6">{profileData.memberSince}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">PIN Code</Typography>
                                        <Typography variant="h6">••••</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">Credit Score</Typography>
                                        <Typography variant="h6">{profileData.creditScore}</Typography>
                                    </Grid>
                                </Grid>
                                
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

            {/* SEND MONEY MODAL - PROFESSIONAL TRANSFER FORM */}
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
                            International Money Transfer
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
                                    placeholder="MANXXXXXXXXXX"
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
                                        <MenuItem value="interac">Interac e-Transfer</MenuItem>
                                        <MenuItem value="wire">Wire Transfer</MenuItem>
                                        <MenuItem value="international">International Wire</MenuItem>
                                        <MenuItem value="swift">SWIFT Transfer</MenuItem>
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
                                    label="Amount (CAD)"
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
                                    <Typography variant="body1" fontWeight={600}>Security Verification Required</Typography>
                                    <Typography variant="body2">For your protection, please verify your identity</Typography>
                                </Alert>
                                
                                <TextField
                                    fullWidth
                                    label="PIN Code"
                                    type="password"
                                    placeholder="Enter your 4-digit PIN"
                                    sx={{ mb: 2 }}
                                />
                                
                                <RadioGroup row sx={{ mb: 2 }}>
                                    <FormControlLabel value="sms" control={<Radio />} label="SMS Code" />
                                    <FormControlLabel value="email" control={<Radio />} label="Email Code" />
                                    <FormControlLabel value="app" control={<Radio />} label="Authenticator" />
                                </RadioGroup>

                                <Alert severity="info" sx={{ mb: 3 }}>
                                    <Typography variant="body2">
                                        ⚠️ International transfers are currently restricted for new accounts. 
                                        Please contact customer support to enable this feature.
                                    </Typography>
                                </Alert>

                                <Button 
                                    fullWidth
                                    variant="contained"
                                    onClick={handleSendMoney}
                                    sx={{ 
                                        bgcolor: '#0A1E3F',
                                        '&:hover': { bgcolor: '#1A3B5E' },
                                        py: 1.5
                                    }}
                                >
                                    Complete Transfer
                                </Button>
                            </Box>
                        )}
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
                                {profileData.surname.charAt(0)}{profileData.lastName.charAt(0)}
                            </Avatar>
                            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                {profileData.surname} {profileData.lastName}
                            </Typography>
                            <Typography color="text.secondary" gutterBottom>
                                {profileData.occupation}
                            </Typography>
                            <BankOwnerBadge sx={{ mt: 1 }}>
                                <CheckCircle sx={{ fontSize: 14 }} />
                                Verified Account
                            </BankOwnerBadge>
                        </Box>

                        <Divider sx={{ my: 2 }} />
                        
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Bank Owner Information
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Badge sx={{ color: '#666' }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Full Name</Typography>
                                    <Typography>{profileData.surname} {profileData.middleName} {profileData.lastName}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Email sx={{ color: '#666' }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Email</Typography>
                                    <Typography>{profileData.email}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Phone sx={{ color: '#666' }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Phone</Typography>
                                    <Typography>{profileData.phone}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Cake sx={{ color: '#666' }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                                    <Typography>{profileData.dob}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Public sx={{ color: '#666' }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Country</Typography>
                                    <Typography>{profileData.country} 🇨🇦</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Map sx={{ color: '#666' }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">State/City</Typography>
                                    <Typography>{profileData.state}, {profileData.city}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <BusinessCenter sx={{ color: '#666' }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Occupation</Typography>
                                    <Typography>{profileData.occupation}</Typography>
                                </Box>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button 
                                fullWidth 
                                variant="outlined"
                                startIcon={<Edit />}
                            >
                                Edit Profile
                            </Button>
                            <Button 
                                fullWidth 
                                variant="contained"
                                sx={{ bgcolor: '#0A1E3F' }}
                            >
                                View Full
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