import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion, collection, query, where, getDocs } from 'firebase/firestore';

// Material UI imports
import {
    AppBar, Toolbar, Typography, Button, Container, Grid,
    Paper, TextField, Avatar, IconButton, Box, Alert, Snackbar,
    BottomNavigation, BottomNavigationAction, Divider, Chip, Modal,
    Fade, Backdrop, Tab, Tabs, LinearProgress, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, InputAdornment,
    Stepper, Step, StepLabel, List, ListItem, ListItemText, ListItemAvatar,
    Menu, Badge, SpeedDial, SpeedDialAction, Switch, CircularProgress,
    FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    AccountBalance, Send, AddCard, Home, History, TrendingUp,
    Person, Notifications, ArrowUpward, ArrowDownward, Send as SendIcon,
    MoreHoriz, Logout, Close, Receipt, Edit, CalendarToday, Phone,
    Email, LocationOn, Security, CheckCircle, Lock, Badge as BadgeIcon,
    CreditCard, Visibility, VisibilityOff, Star, Diamond, WorkspacePremium,
    AttachMoney, Settings, Help, Download, QrCodeScanner, VerifiedUser,
    Fingerprint, Cake, Public, Flag, Wc, BusinessCenter, Chat
} from '@mui/icons-material';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement, LineElement,
    Title, Tooltip, Legend, ArcElement, BarElement
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
    marginBottom: theme.spacing(3),
    position: 'relative',
    overflow: 'hidden',
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
    }
}));

const GlassCard = styled(Paper)(({ theme }) => ({
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
}));

const ProfileCard = styled(Paper)(({ theme }) => ({
    background: 'white',
    borderRadius: '20px',
    padding: theme.spacing(3),
    border: '1px solid rgba(0,0,0,0.05)'
}));

const VirtualCard = styled(Paper)(({ theme }) => ({
    background: 'linear-gradient(135deg, #1A1A1A 0%, #0A0A0A 100%)',
    borderRadius: '20px',
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': { transform: 'scale(1.01)', transition: 'transform 0.2s' }
}));

const TierBadge = styled(Chip)(({ theme, tiertype }) => ({
    background: tiertype === 'Platinum' ? 'linear-gradient(135deg, #E5E4E2 0%, #C0C0C0 100%)' :
                tiertype === 'Gold' ? 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)' :
                tiertype === 'Silver' ? 'linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%)' :
                'linear-gradient(135deg, #CD7F32 0%, #B87333 100%)',
    color: '#000000',
    fontWeight: 'bold',
    height: '32px'
}));

function Dashboard() {
    // User state - all from Firebase, no hardcoding
    const [userData, setUserData] = useState(null);
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [message, setMessage] = useState({ show: false, text: '', type: 'success' });
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    
    // Edit profile state
    const [editMode, setEditMode] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editAddress, setEditAddress] = useState('');
    
    // Modal states
    const [sendModal, setSendModal] = useState(false);
    const [depositModal, setDepositModal] = useState(false);
    const [profileModal, setProfileModal] = useState(false);
    
    // Transfer form states
    const [recipientEmail, setRecipientEmail] = useState('');
    const [amount, setAmount] = useState('');
    const [transferStep, setTransferStep] = useState(0);
    const [depositAmount, setDepositAmount] = useState('');
    
    // Card state
    const [issuedCard, setIssuedCard] = useState(null);
    const [showCVV, setShowCVV] = useState(false);
    
    // Notifications
    const [notifications] = useState([
        { id: 1, title: 'Welcome!', message: 'Account active', time: 'Now', icon: <CheckCircle /> }
    ]);
    const [notificationAnchor, setNotificationAnchor] = useState(null);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        setLoading(true);
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
                    setEditName(data.fullName || '');
                    setEditPhone(data.phone || '');
                    setEditAddress(data.address || '');
                    if (data.issuedCards && data.issuedCards.length > 0) {
                        setIssuedCard(data.issuedCards[0]);
                    }
                }
            } catch (error) {
                showMessage('Error loading data: ' + error.message, 'error');
            }
        }
        setLoading(false);
    };

    const showMessage = (text, type) => {
        setMessage({ show: true, text, type });
        setTimeout(() => setMessage(prev => ({ ...prev, show: false })), 4000);
    };

    const updateProfile = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                await updateDoc(doc(db, 'users', user.uid), {
                    fullName: editName,
                    phone: editPhone,
                    address: editAddress
                });
                setUserData(prev => ({ ...prev, fullName: editName, phone: editPhone, address: editAddress }));
                setEditMode(false);
                showMessage('Profile updated successfully!', 'success');
            } catch (error) {
                showMessage('Update failed: ' + error.message, 'error');
            }
        }
    };

    const handleSend = async () => {
        if (!recipientEmail || !amount) {
            showMessage('Please fill all fields', 'error');
            return;
        }
        const transferAmount = parseFloat(amount);
        if (transferAmount <= 0 || transferAmount > balance) {
            showMessage('Invalid amount or insufficient funds', 'error');
            return;
        }
        setLoading(true);
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
                    date: new Date().toLocaleDateString(),
                    time: new Date().toLocaleTimeString(),
                    status: 'completed'
                })
            });
            
            setBalance(prev => prev - transferAmount);
            showMessage(`✅ Successfully sent ${formatCurrency(transferAmount)} to ${recipientEmail}`, 'success');
            setSendModal(false);
            setRecipientEmail('');
            setAmount('');
            setTransferStep(0);
            await loadUserData();
        } catch (error) {
            showMessage('Transfer failed: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeposit = async () => {
        const depositAmountNum = parseFloat(depositAmount);
        if (depositAmountNum <= 0) {
            showMessage('Please enter a valid amount', 'error');
            return;
        }
        setLoading(true);
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
            setDepositModal(false);
            setDepositAmount('');
            await loadUserData();
        } catch (error) {
            showMessage('Deposit failed: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await auth.signOut();
    };

    const getCurrencySymbol = () => {
        const symbols = { CAD: '$', USD: '$', GBP: '£', AUD: '$', EUR: '€' };
        return symbols[userData?.currency] || '$';
    };

    const formatCurrency = (amount) => `${getCurrencySymbol()}${amount.toLocaleString()}`;

    const calculateTier = (bal) => {
        if (bal >= 1000000) return { name: 'Platinum', icon: <Diamond /> };
        if (bal >= 500000) return { name: 'Gold', icon: <Star /> };
        if (bal >= 100000) return { name: 'Silver', icon: <WorkspacePremium /> };
        return { name: 'Bronze', icon: <BadgeIcon /> };
    };

    const tier = calculateTier(balance);

    // Sample chart data (visual only, not user-specific)
    const spendingData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Spending',
            data: [12400, 18900, 15200, 22100, 18300, 24200],
            borderColor: '#0A1E3F',
            backgroundColor: 'rgba(10,30,63,0.1)',
            tension: 0.4
        }]
    };

    const categoryData = {
        labels: ['Shopping', 'Dining', 'Bills', 'Transport', 'Entertainment'],
        datasets: [{
            data: [28, 22, 18, 12, 20],
            backgroundColor: ['#0A1E3F', '#1A3B5E', '#2A4B7E', '#3A5B9E', '#4A6BBE']
        }]
    };

    const transferSteps = ['Recipient', 'Amount', 'Confirm'];

    if (loading && !userData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress sx={{ color: '#0A1E3F' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: '#F5F8FF', minHeight: '100vh', pb: 7 }}>
            {/* App Bar */}
            <AppBar position="static" sx={{ bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#0A1E3F', fontFamily: '"Playfair Display", serif' }}>
                            QuinCore Bank
                        </Typography>
                        <TierBadge label={tier.name} icon={tier.icon} tiertype={tier.name} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton onClick={(e) => setNotificationAnchor(e.currentTarget)}>
                            <Badge badgeContent={1} color="error">
                                <Notifications sx={{ color: '#0A1E3F' }} />
                            </Badge>
                        </IconButton>
                        <IconButton onClick={handleLogout}>
                            <Logout sx={{ color: '#dc004e' }} />
                        </IconButton>
                        <IconButton onClick={() => setProfileModal(true)}>
                            <Avatar sx={{ bgcolor: '#0A1E3F' }}>
                                {userData?.fullName?.charAt(0) || 'U'}
                            </Avatar>
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Notification Menu */}
            <Menu anchorEl={notificationAnchor} open={Boolean(notificationAnchor)} onClose={() => setNotificationAnchor(null)}>
                <Box sx={{ width: 320, p: 2 }}>
                    <Typography variant="h6">Notifications</Typography>
                    {notifications.map(notif => (
                        <MenuItem key={notif.id}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Avatar sx={{ bgcolor: '#0A1E3F' }}>{notif.icon}</Avatar>
                                <Box>
                                    <Typography variant="body2">{notif.title}</Typography>
                                    <Typography variant="caption">{notif.message}</Typography>
                                    <Typography variant="caption" display="block">{notif.time}</Typography>
                                </Box>
                            </Box>
                        </MenuItem>
                    ))}
                </Box>
            </Menu>

            <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
                {/* Welcome Banner */}
                <Paper sx={{ p: 3, mb: 3, bgcolor: '#0A1E3F', color: 'white', borderRadius: '20px' }}>
                    <Typography variant="h4">Welcome back, {userData?.fullName?.split(' ')[0] || 'User'}!</Typography>
                    <Typography variant="subtitle1">{userData?.email}</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>Account: {userData?.accountNumber}</Typography>
                    <Typography variant="body2">Country: {userData?.country} • Currency: {userData?.currency}</Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Chip icon={<Security />} label="256-bit Encryption" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                        <Chip icon={<VerifiedUser />} label="FDIC Insured" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                    </Box>
                </Paper>

                {/* Tabs */}
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
                    <Tab label="HOME" />
                    <Tab label="TRANSACTIONS" />
                    <Tab label="PROFILE" />
                </Tabs>

                {/* HOME TAB */}
                {tabValue === 0 && (
                    <>
                        <BalanceCard>
                            <Typography variant="body2" sx={{ opacity: 0.7, mb: 1 }}>TOTAL BALANCE</Typography>
                            <Typography variant="h2" sx={{ fontWeight: 700 }}>{formatCurrency(balance)}</Typography>
                            <Chip icon={<ArrowUpward />} label="+2.4% this month" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                            <Typography variant="body2" sx={{ mt: 1 }}>{tier.name} Member</Typography>
                        </BalanceCard>

                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={6}>
                                <GoldButton fullWidth onClick={() => setSendModal(true)} startIcon={<SendIcon />}>
                                    Send
                                </GoldButton>
                            </Grid>
                            <Grid item xs={6}>
                                <GoldButton fullWidth onClick={() => setDepositModal(true)} startIcon={<AttachMoney />}>
                                    Deposit
                                </GoldButton>
                            </Grid>
                        </Grid>

                        {issuedCard && (
                            <VirtualCard>
                                <Typography variant="caption" sx={{ letterSpacing: 2 }}>VIRTUAL CARD</Typography>
                                <Typography variant="h5" sx={{ fontFamily: 'monospace', letterSpacing: 2, mt: 2 }}>
                                    {issuedCard.maskedNumber}
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                    <Box>
                                        <Typography variant="caption">Cardholder</Typography>
                                        <Typography>{issuedCard.cardholderName}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption">Expires</Typography>
                                        <Typography>{issuedCard.expiryDate}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption">CVV</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography>{showCVV ? issuedCard.cvv : '***'}</Typography>
                                            <IconButton size="small" onClick={() => setShowCVV(!showCVV)}>
                                                {showCVV ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </Box>
                                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                                    <Typography variant="caption">Limit</Typography>
                                    <Typography>{formatCurrency(issuedCard.limit || 25000)}</Typography>
                                </Box>
                            </VirtualCard>
                        )}

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={7}>
                                <Paper sx={{ p: 2 }}>
                                    <Typography variant="h6">Spending Trend</Typography>
                                    <Line data={spendingData} options={{ responsive: true, maintainAspectRatio: true }} />
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={5}>
                                <Paper sx={{ p: 2 }}>
                                    <Typography variant="h6">Categories</Typography>
                                    <Pie data={categoryData} options={{ responsive: true, maintainAspectRatio: true }} />
                                </Paper>
                            </Grid>
                        </Grid>

                        <Paper sx={{ p: 3, mt: 3 }}>
                            <Typography variant="h6">Recent Activity</Typography>
                            {transactions.length === 0 ? (
                                <Typography sx={{ textAlign: 'center', py: 4, color: '#888' }}>No transactions yet</Typography>
                            ) : (
                                transactions.slice().reverse().slice(0, 5).map(t => (
                                    <Box key={t.id} sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #eee' }}>
                                        <Box>
                                            <Typography>{t.type === 'deposit' ? 'Deposit' : t.type === 'sent' ? `Sent to ${t.to}` : `Received from ${t.from}`}</Typography>
                                            <Typography variant="caption" color="text.secondary">{t.date}</Typography>
                                        </Box>
                                        <Typography sx={{ color: t.type === 'sent' ? '#F44336' : '#4CAF50', fontWeight: 600 }}>
                                            {t.type === 'sent' ? '-' : '+'}{formatCurrency(t.amount)}
                                        </Typography>
                                    </Box>
                                ))
                            )}
                        </Paper>
                    </>
                )}

                {/* TRANSACTIONS TAB */}
                {tabValue === 1 && (
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6">All Transactions ({transactions.length})</Typography>
                        <TableContainer>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell align="right">Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {transactions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} sx={{ textAlign: 'center' }}>No transactions</TableCell>
                                        </TableRow>
                                    ) : (
                                        transactions.slice().reverse().map(t => (
                                            <TableRow key={t.id}>
                                                <TableCell>{t.date}<br /><small>{t.time}</small></TableCell>
                                                <TableCell>{t.type === 'deposit' ? 'Deposit' : t.type === 'sent' ? `Sent to ${t.to}` : `Received from ${t.from}`}</TableCell>
                                                <TableCell align="right" sx={{ color: t.type === 'sent' ? '#F44336' : '#4CAF50' }}>
                                                    {t.type === 'sent' ? '-' : '+'}{formatCurrency(t.amount)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                )}

                {/* PROFILE TAB - shows ONLY user's own data */}
                {tabValue === 2 && userData && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <ProfileCard sx={{ textAlign: 'center' }}>
                                <Avatar sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: '#0A1E3F', fontSize: '3rem' }}>
                                    {userData.fullName?.charAt(0) || 'U'}
                                </Avatar>
                                <Typography variant="h5">{userData.fullName}</Typography>
                                <Typography color="text.secondary">{userData.email}</Typography>
                                <Typography>Account: {userData.accountNumber}</Typography>
                                <Typography>Balance: {formatCurrency(balance)}</Typography>
                                <Typography>Country: {userData.country}</Typography>
                                <Typography>Currency: {userData.currency}</Typography>
                                <Typography variant="caption" sx={{ mt: 2, display: 'block' }}>
                                    Member since {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : '2024'}
                                </Typography>
                            </ProfileCard>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <ProfileCard>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="h6">Personal Information</Typography>
                                    <Button onClick={() => setEditMode(!editMode)} startIcon={<Edit />}>
                                        {editMode ? 'Cancel' : 'Edit'}
                                    </Button>
                                </Box>
                                {editMode ? (
                                    <Box>
                                        <TextField
                                            fullWidth
                                            label="Full Name"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            sx={{ mb: 2 }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Phone Number"
                                            value={editPhone}
                                            onChange={(e) => setEditPhone(e.target.value)}
                                            sx={{ mb: 2 }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Address"
                                            value={editAddress}
                                            onChange={(e) => setEditAddress(e.target.value)}
                                            multiline
                                            rows={2}
                                            sx={{ mb: 2 }}
                                        />
                                        <GoldButton fullWidth onClick={updateProfile}>
                                            Save Changes
                                        </GoldButton>
                                    </Box>
                                ) : (
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Full Name</Typography>
                                            <Typography>{userData.fullName}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Email</Typography>
                                            <Typography>{userData.email}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Phone</Typography>
                                            <Typography>{userData.phone || 'Not set'}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Country</Typography>
                                            <Typography>{userData.country} • {userData.currency}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
                                            <Typography>{userData.dateOfBirth || 'Not set'}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="caption" color="text.secondary">Address</Typography>
                                            <Typography>{userData.address || 'Not set'}</Typography>
                                        </Grid>
                                    </Grid>
                                )}
                                <Divider sx={{ my: 3 }} />
                                <Typography variant="h6">Security Settings</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography>Two-Factor Authentication</Typography>
                                            <Typography variant="caption" color="text.secondary">Add an extra layer of security</Typography>
                                        </Box>
                                        <Button variant="outlined">Enable</Button>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography>Change Password</Typography>
                                            <Typography variant="caption" color="text.secondary">Update your password</Typography>
                                        </Box>
                                        <Button variant="outlined">Update</Button>
                                    </Box>
                                </Box>
                            </ProfileCard>
                        </Grid>
                    </Grid>
                )}
            </Container>

            {/* Send Money Modal */}
            <Modal open={sendModal} onClose={() => setSendModal(false)}>
                <Fade in={sendModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: 400 }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setSendModal(false)}>
                            <Close />
                        </IconButton>
                        <Typography variant="h5" sx={{ mb: 3, color: '#0A1E3F' }}>Send Money</Typography>
                        <Stepper activeStep={transferStep} sx={{ mb: 3 }}>
                            {transferSteps.map(label => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                        {transferStep === 0 && (
                            <>
                                <TextField
                                    fullWidth
                                    label="Recipient Email"
                                    value={recipientEmail}
                                    onChange={(e) => setRecipientEmail(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                                <GoldButton fullWidth onClick={() => setTransferStep(1)}>
                                    Next
                                </GoldButton>
                            </>
                        )}
                        {transferStep === 1 && (
                            <>
                                <TextField
                                    fullWidth
                                    label={`Amount (${userData?.currency || 'CAD'})`}
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    sx={{ mb: 2 }}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">{getCurrencySymbol()}</InputAdornment>
                                    }}
                                />
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button variant="outlined" onClick={() => setTransferStep(0)}>Back</Button>
                                    <GoldButton onClick={() => setTransferStep(2)}>Next</GoldButton>
                                </Box>
                            </>
                        )}
                        {transferStep === 2 && (
                            <>
                                <Paper sx={{ p: 2, bgcolor: '#F5F7FA', mb: 2 }}>
                                    <Typography>To: {recipientEmail}</Typography>
                                    <Typography>Amount: {formatCurrency(parseFloat(amount) || 0)}</Typography>
                                </Paper>
                                <GoldButton fullWidth onClick={handleSend}>
                                    Send
                                </GoldButton>
                            </>
                        )}
                    </Box>
                </Fade>
            </Modal>

            {/* Deposit Modal */}
            <Modal open={depositModal} onClose={() => setDepositModal(false)}>
                <Fade in={depositModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: 400 }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setDepositModal(false)}>
                            <Close />
                        </IconButton>
                        <Typography variant="h5" sx={{ mb: 3, color: '#0A1E3F' }}>Deposit Funds</Typography>
                        <TextField
                            fullWidth
                            label={`Amount (${userData?.currency || 'CAD'})`}
                            type="number"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            sx={{ mb: 2 }}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">{getCurrencySymbol()}</InputAdornment>
                            }}
                        />
                        <GoldButton fullWidth onClick={handleDeposit}>
                            Deposit
                        </GoldButton>
                    </Box>
                </Fade>
            </Modal>

            {/* Profile Quick Modal */}
            <Modal open={profileModal} onClose={() => setProfileModal(false)}>
                <Fade in={profileModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: 320, textAlign: 'center' }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setProfileModal(false)}>
                            <Close />
                        </IconButton>
                        <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: '#0A1E3F' }}>
                            {userData?.fullName?.charAt(0) || 'U'}
                        </Avatar>
                        <Typography variant="h6">{userData?.fullName}</Typography>
                        <Typography variant="body2" color="text.secondary">{userData?.email}</Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography><strong>Account:</strong> {userData?.accountNumber}</Typography>
                        <Typography><strong>Balance:</strong> {formatCurrency(balance)}</Typography>
                        <Typography><strong>Country:</strong> {userData?.country}</Typography>
                        <GoldButton fullWidth sx={{ mt: 2 }} onClick={() => { setProfileModal(false); setTabValue(2); }}>
                            View Full Profile
                        </GoldButton>
                    </Box>
                </Fade>
            </Modal>

            {/* Bottom Navigation */}
            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderRadius: '20px 20px 0 0' }}>
                <BottomNavigation showLabels value={tabValue} onChange={(e, v) => setTabValue(v)}>
                    <BottomNavigationAction label="HOME" icon={<Home />} />
                    <BottomNavigationAction label="TRANSACTIONS" icon={<History />} />
                    <BottomNavigationAction label="PROFILE" icon={<Person />} />
                </BottomNavigation>
            </Paper>

            {/* Message Snackbar */}
            <Snackbar
                open={message.show}
                autoHideDuration={4000}
                onClose={() => setMessage(prev => ({ ...prev, show: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity={message.type}>{message.text}</Alert>
            </Snackbar>
        </Box>
    );
}

export default Dashboard;