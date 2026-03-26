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
    AccountCircle, Badge, Cake, Public, Map, AttachMoney
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

function Dashboard() {
    const [userData, setUserData] = useState(null);
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [message, setMessage] = useState({ show: false, text: '', type: 'success' });
    const [navValue, setNavValue] = useState(0);
    const [tabValue, setTabValue] = useState(0);
    const [editMode, setEditMode] = useState(false);
    const [editFullName, setEditFullName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editAddress, setEditAddress] = useState('');
    
    // Modal states
    const [sendModal, setSendModal] = useState(false);
    const [requestModal, setRequestModal] = useState(false);
    const [payBillsModal, setPayBillsModal] = useState(false);
    const [topUpModal, setTopUpModal] = useState(false);
    const [profileModal, setProfileModal] = useState(false);
    
    // Transfer form states
    const [recipientEmail, setRecipientEmail] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [amount, setAmount] = useState('');
    const [transferPurpose, setTransferPurpose] = useState('');
    const [transferType, setTransferType] = useState('interac');
    const [transferStep, setTransferStep] = useState(0);
    const [depositAmount, setDepositAmount] = useState('');

    // Virtual Card State
    const [issuedCard, setIssuedCard] = useState(null);
    const [showCVV, setShowCVV] = useState(false);

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
                    setBalance(data.balance || 0);
                    setTransactions(data.transactions || []);
                    setEditFullName(data.fullName || '');
                    setEditPhone(data.phone || '');
                    setEditAddress(data.address || '');
                    
                    // Generate virtual card if not exists
                    if (!data.issuedCards || data.issuedCards.length === 0) {
                        const newCard = {
                            id: Date.now(),
                            cardType: 'debit',
                            cardDesign: 'black',
                            cardholderName: data.fullName,
                            maskedNumber: `**** **** **** ${Math.floor(Math.random() * 10000)}`,
                            expiryDate: `${new Date().getMonth() + 1}/${new Date().getFullYear() + 3}`,
                            cvv: Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
                            limit: 25000
                        };
                        await updateDoc(docRef, {
                            issuedCards: [newCard]
                        });
                        setIssuedCard(newCard);
                    } else {
                        setIssuedCard(data.issuedCards[0]);
                    }
                }
            } catch (error) {
                showMessage('Error loading data: ' + error.message, 'error');
            }
        }
    };

    const updateUserProfile = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                const docRef = doc(db, 'users', user.uid);
                await updateDoc(docRef, {
                    fullName: editFullName,
                    phone: editPhone,
                    address: editAddress
                });
                setUserData(prev => ({ ...prev, fullName: editFullName, phone: editPhone, address: editAddress }));
                setEditMode(false);
                showMessage('Profile updated successfully!', 'success');
            } catch (error) {
                showMessage('Update failed: ' + error.message, 'error');
            }
        }
    };

    const handleSendMoney = async () => {
        if (!recipientEmail || !amount) {
            showMessage('Please fill all fields', 'error');
            return;
        }

        const transferAmount = parseFloat(amount);
        if (transferAmount <= 0 || transferAmount > balance) {
            showMessage('Invalid amount or insufficient funds', 'error');
            return;
        }

        try {
            const currentUser = auth.currentUser;
            const q = query(collection(db, 'users'), where('email', '==', recipientEmail));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                showMessage('Recipient not found', 'error');
                return;
            }
            
            const recipientDoc = querySnapshot.docs[0];
            const recipientData = recipientDoc.data();
            
            await updateDoc(doc(db, 'users', currentUser.uid), {
                balance: balance - transferAmount,
                transactions: arrayUnion({
                    id: Date.now(),
                    type: 'sent',
                    amount: transferAmount,
                    to: recipientEmail,
                    toName: recipientData.fullName,
                    purpose: transferPurpose,
                    date: new Date().toLocaleDateString(),
                    time: new Date().toLocaleTimeString(),
                    status: 'completed'
                })
            });
            
            await updateDoc(doc(db, 'users', recipientDoc.id), {
                balance: (recipientData.balance || 0) + transferAmount,
                transactions: arrayUnion({
                    id: Date.now() + 1,
                    type: 'received',
                    amount: transferAmount,
                    from: currentUser.email,
                    fromName: userData?.fullName,
                    purpose: transferPurpose,
                    date: new Date().toLocaleDateString(),
                    time: new Date().toLocaleTimeString(),
                    status: 'completed'
                })
            });
            
            setBalance(prev => prev - transferAmount);
            showMessage(`✅ Successfully sent ${formatCurrency(transferAmount)} to ${recipientEmail}`, 'success');
            setSendModal(false);
            setRecipientEmail('');
            setRecipientName('');
            setAmount('');
            setTransferPurpose('');
            setTransferStep(0);
            await loadUserData();
        } catch (error) {
            showMessage('Transfer failed: ' + error.message, 'error');
        }
    };

    const handleDeposit = async () => {
        const depositAmountNum = parseFloat(depositAmount);
        if (depositAmountNum <= 0) {
            showMessage('Please enter a valid amount', 'error');
            return;
        }

        try {
            const currentUser = auth.currentUser;
            await updateDoc(doc(db, 'users', currentUser.uid), {
                balance: balance + depositAmountNum,
                transactions: arrayUnion({
                    id: Date.now(),
                    type: 'deposit',
                    amount: depositAmountNum,
                    date: new Date().toLocaleDateString(),
                    time: new Date().toLocaleTimeString(),
                    status: 'completed'
                })
            });
            
            setBalance(prev => prev + depositAmountNum);
            showMessage(`💰 Successfully deposited ${formatCurrency(depositAmountNum)}`, 'success');
            setTopUpModal(false);
            setDepositAmount('');
            await loadUserData();
        } catch (error) {
            showMessage('Deposit failed: ' + error.message, 'error');
        }
    };

    const handleRequestMoney = () => {
        if (!recipientEmail || !amount) {
            showMessage('Please fill all fields', 'error');
            return;
        }
        showMessage(`💰 Request sent to ${recipientEmail} for ${formatCurrency(parseFloat(amount))}`, 'success');
        setRequestModal(false);
        setRecipientEmail('');
        setAmount('');
    };

    const handlePayBill = () => {
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

    const showMessage = (text, type) => {
        setMessage({ show: true, text, type });
        setTimeout(() => {
            setMessage(prev => ({ ...prev, show: false }));
        }, 4000);
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
        } catch (error) {
            showMessage('Logout failed: ' + error.message, 'error');
        }
    };

    const getCurrencySymbol = () => {
        const symbols = { 'CAD': '$', 'USD': '$', 'GBP': '£', 'AUD': '$', 'EUR': '€' };
        return symbols[userData?.currency] || '$';
    };

    const formatCurrency = (amount) => {
        return `${getCurrencySymbol()}${amount.toLocaleString()}`;
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'completed': return '#4CAF50';
            case 'pending': return '#FF9800';
            default: return '#999';
        }
    };

    const transferSteps = ['Recipient', 'Amount & Purpose', 'Review', 'Confirm'];

    // Generate chart data based on user's currency
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
                    <Typography variant="h4" sx={{ 
                        fontWeight: 700, 
                        background: 'linear-gradient(135deg, #0A1E3F 0%, #D4AF37 100%)', 
                        WebkitBackgroundClip: 'text', 
                        WebkitTextFillColor: 'transparent',
                        fontFamily: '"Playfair Display", serif',
                        letterSpacing: '1px'
                    }}>
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
                                {userData?.fullName?.charAt(0) || 'U'}
                            </Avatar>
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
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
                                TOTAL BALANCE
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
                                    {userData?.currency || 'CAD'} Account
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
                        {issuedCard && (
                            <Paper sx={{ p: 3, borderRadius: '20px', mb: 3, background: 'linear-gradient(135deg, #1A1A1A 0%, #0A0A0A 100%)', color: 'white' }}>
                                <Typography variant="caption" sx={{ opacity: 0.7, letterSpacing: 2 }}>VIRTUAL CARD</Typography>
                                <Typography variant="h5" sx={{ fontFamily: 'monospace', letterSpacing: 2, mt: 2 }}>{issuedCard.maskedNumber}</Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                    <Box><Typography variant="caption">Cardholder</Typography><Typography>{issuedCard.cardholderName}</Typography></Box>
                                    <Box><Typography variant="caption">Expires</Typography><Typography>{issuedCard.expiryDate}</Typography></Box>
                                    <Box><Typography variant="caption">CVV</Typography><Typography>{showCVV ? issuedCard.cvv : '***'}<IconButton size="small" onClick={() => setShowCVV(!showCVV)}><Visibility sx={{ fontSize: 14, color: 'white' }} /></IconButton></Typography></Box>
                                </Box>
                            </Paper>
                        )}

                        <Grid container spacing={3} sx={{ mb: 3 }}>
                            <Grid item xs={12} md={8}>
                                <Paper sx={{ p: 3, borderRadius: '20px' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                        Spending Trend ({userData?.currency || 'CAD'})
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

                        <Paper sx={{ p: 3, borderRadius: '20px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Recent Activity
                                </Typography>
                                <Button size="small" endIcon={<MoreHoriz />} onClick={() => setTabValue(2)}>View All</Button>
                            </Box>
                            
                            {transactions.length === 0 ? (
                                <Typography sx={{ textAlign: 'center', py: 4, color: '#888' }}>No transactions yet</Typography>
                            ) : (
                                transactions.slice().reverse().slice(0, 5).map((transaction) => (
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
                                                bgcolor: transaction.type === 'received' || transaction.type === 'deposit' ? '#E3F2E9' : '#FFE9E9',
                                                color: transaction.type === 'received' || transaction.type === 'deposit' ? '#00A86B' : '#FF3B3B'
                                            }}>
                                                {transaction.type === 'received' ? <ArrowDownward /> : transaction.type === 'deposit' ? <AttachMoney /> : <ArrowUpward />}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                    {transaction.type === 'received' ? `Received from ${transaction.fromName || transaction.from}` : 
                                                     transaction.type === 'deposit' ? 'Deposit' : 
                                                     `Sent to ${transaction.toName || transaction.to}`}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {transaction.date} • {transaction.time}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Typography 
                                            variant="body1" 
                                            sx={{ 
                                                fontWeight: 600,
                                                color: transaction.type === 'received' || transaction.type === 'deposit' ? '#00A86B' : '#FF3B3B'
                                            }}
                                        >
                                            {transaction.type === 'received' || transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                                        </Typography>
                                    </Box>
                                ))
                            )}
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
                                        <Typography variant="h4">782</Typography>
                                        <LinearProgress variant="determinate" value={78} sx={{ mt: 1, height: 8, borderRadius: 4 }} />
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
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>Dining</Typography><Typography fontWeight={600}>{formatCurrency(3450)}</Typography></Box>
                                    <Divider />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>Shopping</Typography><Typography fontWeight={600}>{formatCurrency(2890)}</Typography></Box>
                                    <Divider />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>Bills</Typography><Typography fontWeight={600}>{formatCurrency(2100)}</Typography></Box>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                )}

                {/* HISTORY TAB */}
                {tabValue === 2 && (
                    <Paper sx={{ p: 3, borderRadius: '20px' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                            Transaction History ({transactions.length} transactions)
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date & Time</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="right">Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {transactions.length === 0 ? (
                                        <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center' }}>No transactions yet</TableCell></TableRow>
                                    ) : (
                                        transactions.slice().reverse().map((t) => (
                                            <TableRow key={t.id}>
                                                <TableCell>{t.date}<br /><Typography variant="caption">{t.time}</Typography></TableCell>
                                                <TableCell>{t.type === 'received' ? `Received from ${t.fromName || t.from}` : t.type === 'deposit' ? 'Deposit' : `Sent to ${t.toName || t.to}`}</TableCell>
                                                <TableCell><Chip label={t.status} size="small" sx={{ bgcolor: t.status === 'completed' ? '#E8F5E9' : '#FFF3E0', color: t.status === 'completed' ? '#4CAF50' : '#FF9800' }} /></TableCell>
                                                <TableCell align="right" sx={{ color: t.type === 'received' || t.type === 'deposit' ? '#4CAF50' : '#F44336' }}>{t.type === 'received' || t.type === 'deposit' ? '+' : '-'}{formatCurrency(Math.abs(t.amount))}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                )}

                {/* PROFILE TAB - DYNAMIC USER DATA */}
                {tabValue === 3 && userData && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <ProfileCard>
                                <Box sx={{ textAlign: 'center', mb: 3 }}>
                                    <Avatar sx={{ width: 120, height: 120, mx: 'auto', mb: 2, bgcolor: '#0A1E3F', fontSize: '3rem' }}>
                                        {userData.fullName?.charAt(0) || 'U'}
                                    </Avatar>
                                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                        {userData.fullName}
                                    </Typography>
                                    <Typography color="text.secondary" gutterBottom>
                                        {userData.email}
                                    </Typography>
                                    <Chip label={userData.accountType || 'Premium'} sx={{ mt: 1 }} />
                                </Box>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Email sx={{ color: '#666' }} />
                                        <Typography variant="body2">{userData.email}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Phone sx={{ color: '#666' }} />
                                        <Typography variant="body2">{userData.phone || 'Not set'}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <LocationOn sx={{ color: '#666' }} />
                                        <Typography variant="body2">{userData.address || 'Not set'}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Cake sx={{ color: '#666' }} />
                                        <Typography variant="body2">{userData.dateOfBirth || 'Not set'}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Flag sx={{ color: '#666' }} />
                                        <Typography variant="body2">{userData.country || 'Canada'}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Public sx={{ color: '#666' }} />
                                        <Typography variant="body2">{userData.currency || 'CAD'} ({getCurrencySymbol()})</Typography>
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
                                        <Typography variant="h6">{userData.accountNumber}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">Member Since</Typography>
                                        <Typography variant="h6">{userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : '2024'}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">Balance</Typography>
                                        <Typography variant="h6">{formatCurrency(balance)}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">Account Type</Typography>
                                        <Typography variant="h6">{userData.accountType || 'Premium'}</Typography>
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
                                        <TextField fullWidth label="Full Name" value={editFullName} onChange={(e) => setEditFullName(e.target.value)} />
                                        <TextField fullWidth label="Phone Number" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                                        <TextField fullWidth label="Address" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} multiline rows={2} />
                                        <Button variant="contained" onClick={updateUserProfile} sx={{ bgcolor: '#0A1E3F', mt: 1 }}>Save Changes</Button>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box><Typography variant="caption" color="text.secondary">Full Name</Typography><Typography>{userData.fullName}</Typography></Box>
                                        <Box><Typography variant="caption" color="text.secondary">Phone Number</Typography><Typography>{userData.phone || 'Not set'}</Typography></Box>
                                        <Box><Typography variant="caption" color="text.secondary">Address</Typography><Typography>{userData.address || 'Not set'}</Typography></Box>
                                    </Box>
                                )}
                                
                                <Divider sx={{ my: 3 }} />
                                
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Security Settings</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Fingerprint sx={{ color: '#0A1E3F' }} />
                                            <Box><Typography>Two-Factor Authentication</Typography><Typography variant="caption" color="text.secondary">Protect your account with 2FA</Typography></Box>
                                        </Box>
                                        <Button variant="outlined" size="small">Enable</Button>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Lock sx={{ color: '#0A1E3F' }} />
                                            <Box><Typography>Change Password</Typography><Typography variant="caption" color="text.secondary">Update your password</Typography></Box>
                                        </Box>
                                        <Button variant="outlined" size="small">Update</Button>
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
                        <Stepper activeStep={transferStep} sx={{ mb: 4 }}>
                            {transferSteps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                        </Stepper>
                        {transferStep === 0 && (
                            <Box><TextField fullWidth label="Recipient Email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} sx={{ mb: 2 }} /><TextField fullWidth label="Recipient Name (Optional)" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} sx={{ mb: 2 }} /><GoldButton fullWidth onClick={() => setTransferStep(1)}>Continue</GoldButton></Box>
                        )}
                        {transferStep === 1 && (
                            <Box><TextField fullWidth label={`Amount (${userData?.currency || 'CAD'})`} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start">{getCurrencySymbol()}</InputAdornment> }} /><TextField fullWidth label="Purpose" value={transferPurpose} onChange={(e) => setTransferPurpose(e.target.value)} sx={{ mb: 2 }} /><Box sx={{ display: 'flex', gap: 2 }}><Button variant="outlined" onClick={() => setTransferStep(0)}>Back</Button><GoldButton onClick={() => setTransferStep(2)}>Continue</GoldButton></Box></Box>
                        )}
                        {transferStep === 2 && (
                            <Box><Paper sx={{ p: 2, bgcolor: '#F5F7FA', mb: 2 }}><Typography variant="body2">To: {recipientEmail}</Typography><Typography variant="body2">Amount: {formatCurrency(parseFloat(amount) || 0)}</Typography><Typography variant="body2">Purpose: {transferPurpose || 'Not specified'}</Typography></Paper><Box sx={{ display: 'flex', gap: 2 }}><Button variant="outlined" onClick={() => setTransferStep(1)}>Back</Button><GoldButton onClick={() => setTransferStep(3)}>Continue</GoldButton></Box></Box>
                        )}
                        {transferStep === 3 && (
                            <Box><Alert severity="info" sx={{ mb: 3 }}>Please review your transfer details before confirming.</Alert><GoldButton fullWidth onClick={handleSendMoney}>Confirm & Send</GoldButton></Box>
                        )}
                    </Box>
                </Fade>
            </Modal>

            {/* REQUEST MONEY MODAL */}
            <Modal open={requestModal} onClose={() => setRequestModal(false)} closeAfterTransition BackdropComponent={Backdrop}>
                <Fade in={requestModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: { xs: '90%', sm: 400 } }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setRequestModal(false)}><Close /></IconButton>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#0A1E3F' }}>Request Money</Typography>
                        <TextField fullWidth label="From (Email)" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} sx={{ mb: 2 }} />
                        <TextField fullWidth label={`Amount (${userData?.currency || 'CAD'})`} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start">{getCurrencySymbol()}</InputAdornment> }} />
                        <GoldButton fullWidth onClick={handleRequestMoney}>Send Request</GoldButton>
                    </Box>
                </Fade>
            </Modal>

            {/* PAY BILLS MODAL */}
            <Modal open={payBillsModal} onClose={() => setPayBillsModal(false)} closeAfterTransition BackdropComponent={Backdrop}>
                <Fade in={payBillsModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: { xs: '90%', sm: 400 } }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setPayBillsModal(false)}><Close /></IconButton>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#0A1E3F' }}>Pay Bills</Typography>
                        <FormControl fullWidth sx={{ mb: 2 }}><InputLabel>Bill Type</InputLabel><Select value={transferPurpose} onChange={(e) => setTransferPurpose(e.target.value)}><MenuItem value="">Select</MenuItem><MenuItem value="Electricity">Electricity</MenuItem><MenuItem value="Water">Water</MenuItem><MenuItem value="Internet">Internet</MenuItem><MenuItem value="Phone">Phone</MenuItem><MenuItem value="Rent">Rent</MenuItem></Select></FormControl>
                        <TextField fullWidth label={`Amount (${userData?.currency || 'CAD'})`} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start">{getCurrencySymbol()}</InputAdornment> }} />
                        <GoldButton fullWidth onClick={handlePayBill}>Pay Bill</GoldButton>
                    </Box>
                </Fade>
            </Modal>

            {/* TOP UP MODAL */}
            <Modal open={topUpModal} onClose={() => setTopUpModal(false)} closeAfterTransition BackdropComponent={Backdrop}>
                <Fade in={topUpModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: { xs: '90%', sm: 400 } }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setTopUpModal(false)}><Close /></IconButton>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#0A1E3F' }}>Top Up Balance</Typography>
                        <TextField fullWidth label="Card Number" placeholder="**** **** **** ****" sx={{ mb: 2 }} />
                        <TextField fullWidth label={`Amount (${userData?.currency || 'CAD'})`} type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start">{getCurrencySymbol()}</InputAdornment> }} />
                        <GoldButton fullWidth onClick={handleDeposit}>Add Money</GoldButton>
                    </Box>
                </Fade>
            </Modal>

            {/* PROFILE QUICK MODAL */}
            <Modal open={profileModal} onClose={() => setProfileModal(false)} closeAfterTransition BackdropComponent={Backdrop}>
                <Fade in={profileModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: { xs: '90%', sm: 350 }, textAlign: 'center' }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setProfileModal(false)}><Close /></IconButton>
                        <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: '#0A1E3F' }}>{userData?.fullName?.charAt(0) || 'U'}</Avatar>
                        <Typography variant="h6">{userData?.fullName}</Typography>
                        <Typography variant="body2" color="text.secondary">{userData?.email}</Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body2"><strong>Account:</strong> {userData?.accountNumber}</Typography>
                        <Typography variant="body2"><strong>Balance:</strong> {formatCurrency(balance)}</Typography>
                        <Typography variant="body2"><strong>Country:</strong> {userData?.country || 'Canada'}</Typography>
                        <GoldButton fullWidth sx={{ mt: 2 }} onClick={() => { setProfileModal(false); setTabValue(3); }}>View Full Profile</GoldButton>
                    </Box>
                </Fade>
            </Modal>

            {/* Bottom Navigation */}
            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderRadius: '20px 20px 0 0', boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }}>
                <BottomNavigation showLabels value={navValue} onChange={(event, newValue) => { setNavValue(newValue); setTabValue(newValue); }}>
                    <BottomNavigationAction label="HOME" icon={<Home />} />
                    <BottomNavigationAction label="TRANSFER" icon={<SendIcon />} onClick={() => setSendModal(true)} />
                    <BottomNavigationAction label="STATS" icon={<TrendingUp />} />
                    <BottomNavigationAction label="PROFILE" icon={<Person />} onClick={() => setTabValue(3)} />
                </BottomNavigation>
            </Paper>

            {/* Message Popup */}
            <Snackbar open={message.show} autoHideDuration={4000} onClose={() => setMessage({ ...message, show: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity={message.type} variant="filled">{message.text}</Alert>
            </Snackbar>
        </Box>
    );
}

const GoldButton = styled(Button)(({ theme }) => ({
    background: 'linear-gradient(135deg, #0A1E3F 0%, #1A3B5E 100%)',
    color: 'white',
    padding: '12px',
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    '&:hover': { background: 'linear-gradient(135deg, #1A3B5E 0%, #2A4B7E 100%)' }
}));

const StyledModal = styled(Modal)({ display: 'flex', alignItems: 'center', justifyContent: 'center' });

export default Dashboard;