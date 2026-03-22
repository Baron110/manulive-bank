import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion, collection, query, where, getDocs } from 'firebase/firestore';

// Material UI imports
import {
    AppBar, Toolbar, Typography, Button, Container, Grid,
    Paper, TextField, Avatar, IconButton, Box, Alert, Snackbar,
    BottomNavigation, BottomNavigationAction, Divider, Chip, Modal,
    Fade, Backdrop, Tab, Tabs, Card, CardContent, LinearProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Select, MenuItem, FormControl, InputLabel, InputAdornment
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    AccountBalance, Send, AddCard, Home, History, TrendingUp,
    Person, Notifications, ArrowUpward, ArrowDownward, Send as SendIcon,
    MoreHoriz, Logout, Close, Receipt, Edit, CalendarToday, Phone,
    Email, LocationOn, Security, CheckCircle, Info, Lock, Badge, Cake, Public, Map,
    CreditCard, Visibility, VisibilityOff, AttachMoney
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

const GoldButton = styled(Button)(({ theme }) => ({
    background: 'linear-gradient(135deg, #0A1E3F 0%, #1A3B5E 100%)',
    color: 'white',
    padding: '12px',
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    '&:hover': {
        background: 'linear-gradient(135deg, #1A3B5E 0%, #2A4B7E 100%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 20px rgba(10,30,63,0.3)'
    }
}));

const VirtualCard = styled(Paper)(({ theme }) => ({
    background: 'linear-gradient(135deg, #1A1A1A 0%, #0A1A2A 100%)',
    borderRadius: '16px',
    padding: theme.spacing(3),
    border: '1px solid rgba(212,175,55,0.3)',
    marginBottom: theme.spacing(3)
}));

function Dashboard() {
    const [userData, setUserData] = useState(null);
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [message, setMessage] = useState({ show: false, text: '', type: 'success' });
    const [tabValue, setTabValue] = useState(0);
    const [sendModal, setSendModal] = useState(false);
    const [depositModal, setDepositModal] = useState(false);
    const [cardModal, setCardModal] = useState(false);
    const [profileModal, setProfileModal] = useState(false);
    const [showCVV, setShowCVV] = useState(false);
    const [recipientEmail, setRecipientEmail] = useState('');
    const [amount, setAmount] = useState('');
    const [depositAmount, setDepositAmount] = useState('');
    const [cardType, setCardType] = useState('debit');
    const [cardDesign, setCardDesign] = useState('black');
    const [cardApplication, setCardApplication] = useState(null);
    const [issuedCard, setIssuedCard] = useState(null);
    const [editProfile, setEditProfile] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editAddress, setEditAddress] = useState('');

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
                    setBalance(data.balance || 10000);
                    setTransactions(data.transactions || []);
                    setCardApplication(data.cardApplications?.[0] || null);
                    setIssuedCard(data.issuedCards?.[0] || null);
                    setEditName(data.fullName || '');
                    setEditPhone(data.phone || '');
                    setEditAddress(data.address || '');
                    console.log('✅ User data loaded:', data);
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        }
    };

    const showMessage = (text, type) => {
        setMessage({ show: true, text, type });
        setTimeout(() => setMessage(prev => ({ ...prev, show: false })), 4000);
    };

    const handleTransfer = async () => {
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
                    date: new Date().toLocaleDateString(),
                    time: new Date().toLocaleTimeString(),
                    status: 'completed'
                })
            });

            setBalance(prev => prev - transferAmount);
            showMessage(`✅ Successfully sent $${transferAmount.toLocaleString()} CAD to ${recipientEmail}`, 'success');
            setSendModal(false);
            setRecipientEmail('');
            setAmount('');
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
            showMessage(`💰 Successfully deposited $${depositAmountNum.toLocaleString()} CAD`, 'success');
            setDepositModal(false);
            setDepositAmount('');
            await loadUserData();
        } catch (error) {
            showMessage('Deposit failed: ' + error.message, 'error');
        }
    };

    const applyForCard = async () => {
        try {
            const currentUser = auth.currentUser;
            const application = {
                id: Date.now(),
                cardType,
                cardDesign,
                fullName: userData?.fullName,
                status: 'pending',
                appliedAt: new Date().toISOString()
            };

            await updateDoc(doc(db, 'users', currentUser.uid), {
                cardApplications: arrayUnion(application)
            });

            setCardApplication(application);
            showMessage('📇 Card application submitted! Under review.', 'info');
            setCardModal(false);

            setTimeout(async () => {
                const approvedCard = {
                    id: Date.now(),
                    cardType,
                    cardDesign,
                    cardholderName: userData?.fullName,
                    cardNumber: `**** **** **** ${Math.floor(Math.random() * 10000)}`,
                    expiryDate: `${new Date().getMonth() + 1}/${new Date().getFullYear() + 3}`,
                    cvv: Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
                    status: 'approved'
                };

                await updateDoc(doc(db, 'users', currentUser.uid), {
                    issuedCards: arrayUnion(approvedCard)
                });

                setIssuedCard(approvedCard);
                showMessage('🎉 Your card has been approved!', 'success');
                await loadUserData();
            }, 3000);
        } catch (error) {
            showMessage('Application failed: ' + error.message, 'error');
        }
    };

    const updateProfile = async () => {
        try {
            const currentUser = auth.currentUser;
            await updateDoc(doc(db, 'users', currentUser.uid), {
                fullName: editName,
                phone: editPhone,
                address: editAddress
            });
            showMessage('Profile updated successfully!', 'success');
            setEditProfile(false);
            await loadUserData();
        } catch (error) {
            showMessage('Update failed: ' + error.message, 'error');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD',
        }).format(amount);
    };

    // Generate sample transactions for demo if none exist
    const generateSampleTransactions = () => {
        if (transactions.length === 0) {
            return [
                { id: 1, name: 'Welcome Bonus', date: 'Mar 22, 2024', time: '10:30 AM', amount: 10000, type: 'deposit', status: 'completed' }
            ];
        }
        return transactions;
    };

    const displayTransactions = transactions.length > 0 ? transactions : generateSampleTransactions();

    // Chart data
    const chartData = {
        spending: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Spending',
                data: [12000, 19000, 15000, 22000, 18000, 24000],
                borderColor: '#0A1E3F',
                backgroundColor: 'rgba(10,30,63,0.1)',
                tension: 0.4
            }]
        },
        category: {
            labels: ['Dining', 'Shopping', 'Bills', 'Transport', 'Entertainment'],
            datasets: [{
                data: [30, 25, 20, 15, 10],
                backgroundColor: ['#0A1E3F', '#1A3B5E', '#2A4B7E', '#3A5B9E', '#4A6BBE'],
                borderWidth: 0
            }]
        }
    };

    return (
        <Box sx={{ bgcolor: '#F5F8FF', minHeight: '100vh', pb: 7 }}>
            {/* TOP HEADER */}
            <AppBar position="static" sx={{ bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#0A1E3F', fontFamily: '"Playfair Display", serif' }}>
                        QuinCore Bank
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton><Notifications sx={{ color: '#0A1E3F' }} /></IconButton>
                        <IconButton onClick={() => auth.signOut()}><Logout sx={{ color: '#dc004e' }} /></IconButton>
                        <IconButton onClick={() => setProfileModal(true)}>
                            <Avatar sx={{ bgcolor: '#0A1E3F' }}>
                                {userData?.fullName?.charAt(0) || userData?.firstName?.charAt(0) || 'U'}
                            </Avatar>
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
                {/* WELCOME SECTION - REAL USER DATA */}
                <Paper sx={{ p: 3, mb: 3, bgcolor: '#0A1E3F', color: 'white', borderRadius: '20px' }}>
                    <Typography variant="h4">Welcome, {userData?.fullName || userData?.firstName || 'User'}!</Typography>
                    <Typography variant="subtitle1">{userData?.email}</Typography>
                    <Typography variant="body2">Account: {userData?.accountNumber}</Typography>
                    <Typography variant="body2">Country: {userData?.country || 'Canada'}</Typography>
                </Paper>

                {/* TABS */}
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3, '& .MuiTab-root': { color: '#888' }, '& .Mui-selected': { color: '#0A1E3F' }, '& .MuiTabs-indicator': { backgroundColor: '#0A1E3F' } }}>
                    <Tab label="HOME" icon={<Home />} iconPosition="start" />
                    <Tab label="TRANSACTIONS" icon={<History />} iconPosition="start" />
                    <Tab label="CARDS" icon={<CreditCard />} iconPosition="start" />
                    <Tab label="PROFILE" icon={<Person />} iconPosition="start" />
                </Tabs>

                {/* ========== HOME TAB ========== */}
                {tabValue === 0 && (
                    <>
                        <BalanceCard>
                            <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>TOTAL BALANCE</Typography>
                            <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>{formatCurrency(balance)}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Chip icon={<ArrowUpward sx={{ fontSize: 16 }} />} label="+2.4% this month" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>Premium Account</Typography>
                            </Box>
                        </BalanceCard>

                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={4}><GoldButton fullWidth onClick={() => setSendModal(true)} startIcon={<SendIcon />}>Send</GoldButton></Grid>
                            <Grid item xs={4}><GoldButton fullWidth onClick={() => setDepositModal(true)} startIcon={<AttachMoney />}>Deposit</GoldButton></Grid>
                            <Grid item xs={4}><GoldButton fullWidth onClick={() => setCardModal(true)} startIcon={<CreditCard />}>Apply Card</GoldButton></Grid>
                        </Grid>

                        <Grid container spacing={3} sx={{ mb: 3 }}>
                            <Grid item xs={12} md={8}>
                                <Paper sx={{ p: 3, bgcolor: 'white', borderRadius: '20px' }}>
                                    <Typography variant="h6" sx={{ color: '#0A1E3F', mb: 2 }}>Spending Trend</Typography>
                                    <Line data={chartData.spending} options={{ responsive: true, plugins: { legend: { labels: { color: '#888' } } } }} />
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Paper sx={{ p: 3, bgcolor: 'white', borderRadius: '20px' }}>
                                    <Typography variant="h6" sx={{ color: '#0A1E3F', mb: 2 }}>Categories</Typography>
                                    <Pie data={chartData.category} options={{ responsive: true, plugins: { legend: { labels: { color: '#888' } } } }} />
                                </Paper>
                            </Grid>
                        </Grid>

                        {issuedCard && (
                            <VirtualCard>
                                <Typography variant="caption" sx={{ color: '#0A1E3F', letterSpacing: 2 }}>YOUR CARD</Typography>
                                <Typography variant="h5" sx={{ fontWeight: 600, mt: 2, letterSpacing: 2, fontFamily: 'monospace' }}>{issuedCard.cardNumber}</Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                    <Box><Typography variant="caption" sx={{ color: '#888' }}>Cardholder</Typography><Typography>{issuedCard.cardholderName}</Typography></Box>
                                    <Box><Typography variant="caption" sx={{ color: '#888' }}>Expires</Typography><Typography>{issuedCard.expiryDate}</Typography></Box>
                                    <Box><Typography variant="caption" sx={{ color: '#888' }}>CVV</Typography><Typography>{showCVV ? issuedCard.cvv : '***'}<IconButton size="small" onClick={() => setShowCVV(!showCVV)}><Visibility sx={{ fontSize: 14, color: '#0A1E3F' }} /></IconButton></Typography></Box>
                                </Box>
                            </VirtualCard>
                        )}

                        <Paper sx={{ p: 3, bgcolor: 'white', borderRadius: '20px' }}>
                            <Typography variant="h6" sx={{ color: '#0A1E3F', mb: 2 }}>Recent Activity</Typography>
                            {displayTransactions.slice().reverse().slice(0, 5).map((t) => (
                                <Box key={t.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #eee' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: t.type === 'received' || t.type === 'deposit' ? 'rgba(76,175,80,0.2)' : 'rgba(244,67,54,0.2)', color: t.type === 'received' || t.type === 'deposit' ? '#4CAF50' : '#F44336' }}>
                                            {t.type === 'received' ? <ArrowDownward /> : t.type === 'deposit' ? <AttachMoney /> : <ArrowUpward />}
                                        </Avatar>
                                        <Box>
                                            <Typography>{t.type === 'received' ? `From ${t.from}` : t.type === 'deposit' ? 'Deposit' : `To ${t.to}`}</Typography>
                                            <Typography variant="caption" sx={{ color: '#888' }}>{t.date} • {t.time}</Typography>
                                        </Box>
                                    </Box>
                                    <Typography sx={{ color: t.type === 'received' || t.type === 'deposit' ? '#4CAF50' : '#F44336', fontWeight: 600 }}>
                                        {t.type === 'received' || t.type === 'deposit' ? '+' : '-'}{formatCurrency(t.amount)}
                                    </Typography>
                                </Box>
                            ))}
                        </Paper>
                    </>
                )}

                {/* ========== TRANSACTIONS TAB ========== */}
                {tabValue === 1 && (
                    <Paper sx={{ p: 3, bgcolor: 'white', borderRadius: '20px' }}>
                        <Typography variant="h6" sx={{ color: '#0A1E3F', mb: 3 }}>Transaction History</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: '#888' }}>Date</TableCell>
                                        <TableCell sx={{ color: '#888' }}>Description</TableCell>
                                        <TableCell sx={{ color: '#888' }}>Status</TableCell>
                                        <TableCell align="right" sx={{ color: '#888' }}>Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {displayTransactions.slice().reverse().map((t) => (
                                        <TableRow key={t.id}>
                                            <TableCell>{t.date}<br /><Typography variant="caption" sx={{ color: '#888' }}>{t.time}</Typography></TableCell>
                                            <TableCell>{t.type === 'received' ? `Received from ${t.from}` : t.type === 'deposit' ? 'Deposit' : `Sent to ${t.to}`}</TableCell>
                                            <TableCell><Chip label={t.status || 'completed'} size="small" sx={{ bgcolor: 'rgba(76,175,80,0.2)', color: '#4CAF50' }} /></TableCell>
                                            <TableCell align="right" sx={{ color: t.type === 'received' || t.type === 'deposit' ? '#4CAF50' : '#F44336', fontWeight: 600 }}>
                                                {t.type === 'received' || t.type === 'deposit' ? '+' : '-'}{formatCurrency(t.amount)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                )}

                {/* ========== CARDS TAB ========== */}
                {tabValue === 2 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Paper sx={{ p: 3, bgcolor: 'white', borderRadius: '20px' }}>
                                <Typography variant="h6" sx={{ color: '#0A1E3F', mb: 2 }}>Your Cards</Typography>
                                {issuedCard ? (
                                    <VirtualCard>
                                        <Typography variant="caption" sx={{ color: '#0A1E3F', letterSpacing: 2 }}>ACTIVE CARD</Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 600, mt: 2, letterSpacing: 2, fontFamily: 'monospace' }}>{issuedCard.cardNumber}</Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                            <Box><Typography variant="caption" sx={{ color: '#888' }}>Cardholder</Typography><Typography>{issuedCard.cardholderName}</Typography></Box>
                                            <Box><Typography variant="caption" sx={{ color: '#888' }}>Expires</Typography><Typography>{issuedCard.expiryDate}</Typography></Box>
                                            <Box><Typography variant="caption" sx={{ color: '#888' }}>CVV</Typography><Typography>{showCVV ? issuedCard.cvv : '***'}<IconButton size="small" onClick={() => setShowCVV(!showCVV)}><Visibility sx={{ fontSize: 14, color: '#0A1E3F' }} /></IconButton></Typography></Box>
                                        </Box>
                                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
                                            <Typography variant="caption" sx={{ color: '#888' }}>Card Type</Typography>
                                            <Typography>{issuedCard.cardType?.toUpperCase()} • {issuedCard.cardDesign?.toUpperCase()} Edition</Typography>
                                        </Box>
                                    </VirtualCard>
                                ) : cardApplication ? (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <Chip label={cardApplication.status === 'pending' ? 'PENDING REVIEW' : 'APPROVED'} sx={{ bgcolor: cardApplication.status === 'pending' ? 'rgba(255,152,0,0.2)' : 'rgba(76,175,80,0.2)', color: cardApplication.status === 'pending' ? '#FF9800' : '#4CAF50', mb: 2 }} />
                                        <Typography sx={{ color: '#888' }}>Your {cardApplication.cardType} card application is under review.</Typography>
                                        <Typography variant="caption" sx={{ color: '#666' }}>Applied on {new Date(cardApplication.appliedAt).toLocaleDateString()}</Typography>
                                    </Box>
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <CreditCard sx={{ fontSize: 60, color: '#888', mb: 2 }} />
                                        <Typography sx={{ color: '#888', mb: 2 }}>No active cards yet</Typography>
                                        <GoldButton onClick={() => setCardModal(true)}>Apply for a Card</GoldButton>
                                    </Box>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>
                )}

                {/* ========== PROFILE TAB - REAL USER DATA ========== */}
                {tabValue === 3 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, bgcolor: 'white', borderRadius: '20px', textAlign: 'center' }}>
                                <Avatar sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: '#0A1E3F', fontSize: '2.5rem' }}>
                                    {userData?.fullName?.charAt(0) || userData?.firstName?.charAt(0) || 'U'}
                                </Avatar>
                                <Typography variant="h5" sx={{ color: '#0A1E3F' }}>{userData?.fullName || userData?.firstName + ' ' + userData?.lastName}</Typography>
                                <Typography sx={{ color: '#888' }}>{userData?.email}</Typography>
                                <Typography sx={{ mt: 1 }}>Account: {userData?.accountNumber}</Typography>
                                <Typography sx={{ color: '#0A1E3F', mt: 1 }}>Balance: {formatCurrency(balance)}</Typography>
                                <Chip label={userData?.tier || 'Premium'} sx={{ mt: 2, bgcolor: '#0A1E3F', color: 'white' }} />
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Paper sx={{ p: 3, bgcolor: 'white', borderRadius: '20px' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                    <Typography variant="h6" sx={{ color: '#0A1E3F' }}>Personal Information</Typography>
                                    <Button onClick={() => setEditProfile(!editProfile)} startIcon={<Edit />} sx={{ color: '#0A1E3F' }}>{editProfile ? 'Cancel' : 'Edit'}</Button>
                                </Box>
                                {editProfile ? (
                                    <Box>
                                        <TextField fullWidth label="Full Name" value={editName} onChange={(e) => setEditName(e.target.value)} sx={{ mb: 2 }} />
                                        <TextField fullWidth label="Phone Number" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} sx={{ mb: 2 }} />
                                        <TextField fullWidth label="Address" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} multiline rows={2} sx={{ mb: 2 }} />
                                        <GoldButton fullWidth onClick={updateProfile}>Save Changes</GoldButton>
                                    </Box>
                                ) : (
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}><Typography variant="caption" sx={{ color: '#666' }}>Full Name</Typography><Typography>{userData?.fullName || userData?.firstName + ' ' + userData?.lastName}</Typography></Grid>
                                        <Grid item xs={6}><Typography variant="caption" sx={{ color: '#666' }}>Email</Typography><Typography>{userData?.email}</Typography></Grid>
                                        <Grid item xs={6}><Typography variant="caption" sx={{ color: '#666' }}>Phone</Typography><Typography>{userData?.phone || 'Not set'}</Typography></Grid>
                                        <Grid item xs={6}><Typography variant="caption" sx={{ color: '#666' }}>Country</Typography><Typography>{userData?.country || 'Not set'}</Typography></Grid>
                                        <Grid item xs={6}><Typography variant="caption" sx={{ color: '#666' }}>Date of Birth</Typography><Typography>{userData?.dateOfBirth || 'Not set'}</Typography></Grid>
                                        <Grid item xs={6}><Typography variant="caption" sx={{ color: '#666' }}>Address</Typography><Typography>{userData?.address || 'Not set'}</Typography></Grid>
                                        <Grid item xs={12}><Typography variant="caption" sx={{ color: '#666' }}>Account Number</Typography><Typography>{userData?.accountNumber}</Typography></Grid>
                                    </Grid>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>
                )}
            </Container>

            {/* SEND MODAL */}
            <Modal open={sendModal} onClose={() => setSendModal(false)} closeAfterTransition BackdropComponent={Backdrop}>
                <Fade in={sendModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: { xs: '90%', sm: '400px' } }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setSendModal(false)}><Close /></IconButton>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#0A1E3F' }}>Send Money</Typography>
                        <TextField fullWidth label="Recipient Email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} sx={{ mb: 2 }} />
                        <TextField fullWidth label="Amount (CAD)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} sx={{ mb: 3 }} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                        <GoldButton fullWidth onClick={handleTransfer}>Send Money</GoldButton>
                    </Box>
                </Fade>
            </Modal>

            {/* DEPOSIT MODAL */}
            <Modal open={depositModal} onClose={() => setDepositModal(false)} closeAfterTransition BackdropComponent={Backdrop}>
                <Fade in={depositModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: { xs: '90%', sm: '400px' } }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setDepositModal(false)}><Close /></IconButton>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#0A1E3F' }}>Deposit Funds</Typography>
                        <TextField fullWidth label="Amount (CAD)" type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} sx={{ mb: 3 }} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                        <GoldButton fullWidth onClick={handleDeposit}>Deposit</GoldButton>
                    </Box>
                </Fade>
            </Modal>

            {/* CARD APPLICATION MODAL */}
            <Modal open={cardModal} onClose={() => setCardModal(false)} closeAfterTransition BackdropComponent={Backdrop}>
                <Fade in={cardModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: { xs: '90%', sm: '400px' } }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setCardModal(false)}><Close /></IconButton>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#0A1E3F' }}>Apply for Card</Typography>
                        <FormControl fullWidth sx={{ mb: 2 }}><InputLabel>Card Type</InputLabel><Select value={cardType} onChange={(e) => setCardType(e.target.value)} label="Card Type"><MenuItem value="debit">Debit Card</MenuItem><MenuItem value="credit">Credit Card</MenuItem></Select></FormControl>
                        <FormControl fullWidth sx={{ mb: 3 }}><InputLabel>Card Design</InputLabel><Select value={cardDesign} onChange={(e) => setCardDesign(e.target.value)} label="Card Design"><MenuItem value="black">Black Edition</MenuItem><MenuItem value="gold">Gold Edition</MenuItem><MenuItem value="platinum">Platinum Edition</MenuItem></Select></FormControl>
                        <GoldButton fullWidth onClick={applyForCard}>Submit Application</GoldButton>
                    </Box>
                </Fade>
            </Modal>

            {/* PROFILE MODAL */}
            <Modal open={profileModal} onClose={() => setProfileModal(false)} closeAfterTransition BackdropComponent={Backdrop}>
                <Fade in={profileModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: { xs: '90%', sm: '350px' } }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setProfileModal(false)}><Close /></IconButton>
                        <Box sx={{ textAlign: 'center' }}>
                            <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: '#0A1E3F' }}>{userData?.fullName?.charAt(0) || 'U'}</Avatar>
                            <Typography variant="h6">{userData?.fullName}</Typography>
                            <Typography variant="body2" color="text.secondary">{userData?.email}</Typography>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="body2"><strong>Phone:</strong> {userData?.phone || 'Not set'}</Typography>
                            <Typography variant="body2"><strong>Country:</strong> {userData?.country || 'Not set'}</Typography>
                            <Typography variant="body2"><strong>Account:</strong> {userData?.accountNumber}</Typography>
                            <Typography variant="body2"><strong>Balance:</strong> {formatCurrency(balance)}</Typography>
                            <GoldButton fullWidth sx={{ mt: 2 }} onClick={() => setProfileModal(false)}>Close</GoldButton>
                        </Box>
                    </Box>
                </Fade>
            </Modal>

            {/* BOTTOM NAVIGATION */}
            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderRadius: '20px 20px 0 0' }}>
                <BottomNavigation showLabels value={tabValue} onChange={(e, v) => setTabValue(v)}>
                    <BottomNavigationAction label="HOME" icon={<Home />} />
                    <BottomNavigationAction label="TRANSACTIONS" icon={<History />} />
                    <BottomNavigationAction label="CARDS" icon={<CreditCard />} />
                    <BottomNavigationAction label="PROFILE" icon={<Person />} />
                </BottomNavigation>
            </Paper>

            {/* MESSAGE SNACKBAR */}
            <Snackbar open={message.show} autoHideDuration={4000} onClose={() => setMessage(prev => ({ ...prev, show: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity={message.type}>{message.text}</Alert>
            </Snackbar>
        </Box>
    );
}

export default Dashboard;