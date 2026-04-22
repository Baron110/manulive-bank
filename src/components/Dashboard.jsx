import React, { useState } from 'react';
import { auth } from '../firebase';
import {
    AppBar, Toolbar, Typography, Button, Container, Grid,
    Paper, TextField, Avatar, IconButton, Box, Alert, Snackbar,
    BottomNavigation, BottomNavigationAction, Divider, Chip, Modal,
    Fade, Backdrop, Tab, Tabs, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, InputAdornment,
    Stepper, Step, StepLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    AccountBalance, Send, Home, History, TrendingUp,
    Person, Notifications, ArrowUpward, ArrowDownward, Send as SendIcon,
    Logout, Close, Edit, Phone, Email, LocationOn,
    CreditCard, Visibility, VisibilityOff, AttachMoney, Security,
    CheckCircle, Star, Diamond
} from '@mui/icons-material';

// Styled components
const BalanceCard = styled(Paper)(({ theme }) => ({
    background: 'linear-gradient(135deg, #0A1E3F 0%, #1A3B5E 100%)',
    color: 'white',
    borderRadius: '24px',
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
}));

const GoldButton = styled(Button)(({ theme }) => ({
    background: 'linear-gradient(135deg, #0A1E3F 0%, #1A3B5E 100%)',
    color: 'white',
    padding: '12px',
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
}));

// ========== HARDCODED USER DATA ==========
const usersData = {
    'caitlin.clark@example.com': {
        fullName: 'Caitlin Clark',
        email: 'caitlin.clark@example.com',
        balance: 10000000,
        currency: 'USD',
        symbol: '$',
        country: 'USA',
        phone: '+1 (317) 555-1234',
        address: '123 Gainbridge Fieldhouse, Indianapolis, IN',
        cardMasked: '**** **** **** 2002',
        cardExpiry: '12/27',
        transactions: [
            { id: 1, type: 'received', amount: 2500000, from: 'Indiana Fever', date: 'Apr 1, 2026' },
            { id: 2, type: 'sent', amount: 12500, to: 'Nike', date: 'Apr 3, 2026' },
        ]
    },
    'dollyrparton945@gmail.com': {
        fullName: 'Dolly Parton',
        email: 'dollyrparton945@gmail.com',
        balance: 500000,
        currency: 'USD',
        symbol: '$',
        country: 'USA',
        phone: '+1 (616) 321-2741',
        address: '9510 Crockett Rd, Brentwood, TN',
        cardMasked: '**** **** **** 9643',
        cardExpiry: '12/27',
        transactions: [
            { id: 1, type: 'received', amount: 150000, from: 'Spotify', date: 'Apr 1, 2026' },
            { id: 2, type: 'sent', amount: 5000, to: 'Dollywood Foundation', date: 'Apr 4, 2026' },
        ],
        billingMessage: 'Unable to process transaction due to unpaid maintenance fees.'
    }
};

const defaultUser = {
    fullName: 'Demo User',
    email: '',
    balance: 0,
    currency: 'USD',
    symbol: '$',
    country: 'Demo',
    phone: 'Not set',
    address: 'Not set',
    cardMasked: '**** **** **** 0000',
    cardExpiry: '01/30',
    transactions: []
};

function Dashboard() {
    const currentUser = auth.currentUser;
    const userEmail = currentUser?.email || '';
    const user = usersData[userEmail] || defaultUser;

    const [balance, setBalance] = useState(user.balance);
    const [transactions, setTransactions] = useState(user.transactions);
    const [message, setMessage] = useState({ show: false, text: '', type: 'success' });
    const [tabValue, setTabValue] = useState(0);
    const [sendModal, setSendModal] = useState(false);
    const [depositModal, setDepositModal] = useState(false);
    const [profileModal, setProfileModal] = useState(false);
    const [recipientEmail, setRecipientEmail] = useState('');
    const [amount, setAmount] = useState('');
    const [depositAmount, setDepositAmount] = useState('');
    const [transferStep, setTransferStep] = useState(0);
    const [showCVV, setShowCVV] = useState(false);

    const formatCurrency = (amt) => `${user.symbol}${amt.toLocaleString()}`;

    const showMessage = (text, type) => {
        setMessage({ show: true, text, type });
        setTimeout(() => setMessage(prev => ({ ...prev, show: false })), 4000);
    };

    const handleSend = () => {
        if (user.billingMessage) {
            showMessage(user.billingMessage, 'error');
            setSendModal(false);
            return;
        }
        if (!recipientEmail || !amount) {
            showMessage('Fill all fields', 'error');
            return;
        }
        const transferAmount = parseFloat(amount);
        if (transferAmount <= 0 || transferAmount > balance) {
            showMessage('Invalid amount', 'error');
            return;
        }
        const newBalance = balance - transferAmount;
        setBalance(newBalance);
        const newTransaction = {
            id: Date.now(),
            type: 'sent',
            amount: transferAmount,
            to: recipientEmail,
            date: new Date().toLocaleDateString()
        };
        setTransactions([newTransaction, ...transactions]);
        showMessage(`✅ Sent ${formatCurrency(transferAmount)}`, 'success');
        setSendModal(false);
        setRecipientEmail('');
        setAmount('');
        setTransferStep(0);
    };

    const handleDeposit = () => {
        if (user.billingMessage) {
            showMessage(user.billingMessage, 'error');
            setDepositModal(false);
            return;
        }
        const depositAmountNum = parseFloat(depositAmount);
        if (depositAmountNum <= 0) {
            showMessage('Enter valid amount', 'error');
            return;
        }
        const newBalance = balance + depositAmountNum;
        setBalance(newBalance);
        const newTransaction = {
            id: Date.now(),
            type: 'deposit',
            amount: depositAmountNum,
            date: new Date().toLocaleDateString()
        };
        setTransactions([newTransaction, ...transactions]);
        showMessage(`💰 Deposited ${formatCurrency(depositAmountNum)}`, 'success');
        setDepositModal(false);
        setDepositAmount('');
    };

    const handleLogout = async () => { await auth.signOut(); };

    const transferSteps = ['Recipient', 'Amount', 'Confirm'];

    return (
        <Box sx={{ bgcolor: '#F5F8FF', minHeight: '100vh', pb: 7 }}>
            <AppBar position="static" sx={{ bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#0A1E3F' }}>QuinCore Bank</Typography>
                    <Box>
                        <IconButton onClick={handleLogout}><Logout /></IconButton>
                        <IconButton onClick={() => setProfileModal(true)}><Avatar>{user.fullName.charAt(0)}</Avatar></IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
                <Paper sx={{ p: 3, mb: 3, bgcolor: '#0A1E3F', color: 'white', borderRadius: '20px' }}>
                    <Typography variant="h4">Welcome back, {user.fullName.split(' ')[0]}!</Typography>
                    <Typography>{user.email}</Typography>
                    <Typography variant="body2">Country: {user.country} • Currency: {user.currency}</Typography>
                </Paper>

                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
                    <Tab label="HOME" /><Tab label="TRANSACTIONS" /><Tab label="PROFILE" />
                </Tabs>

                {tabValue === 0 && (
                    <>
                        <BalanceCard>
                            <Typography variant="body2">TOTAL BALANCE</Typography>
                            <Typography variant="h2">{formatCurrency(balance)}</Typography>
                            <Chip icon={<ArrowUpward />} label="+2.4%" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                        </BalanceCard>

                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={6}><GoldButton fullWidth onClick={() => setSendModal(true)} startIcon={<SendIcon />}>Send</GoldButton></Grid>
                            <Grid item xs={6}><GoldButton fullWidth onClick={() => setDepositModal(true)} startIcon={<AttachMoney />}>Deposit</GoldButton></Grid>
                        </Grid>

                        <Paper sx={{ p: 3, mb: 3, bgcolor: '#1A1A1A', color: 'white' }}>
                            <Typography variant="caption">VIRTUAL CARD</Typography>
                            <Typography variant="h5" sx={{ fontFamily: 'monospace' }}>{user.cardMasked}</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                <Box><Typography variant="caption">Cardholder</Typography><Typography>{user.fullName}</Typography></Box>
                                <Box><Typography variant="caption">Expires</Typography><Typography>{user.cardExpiry}</Typography></Box>
                                <Box><Typography variant="caption">CVV</Typography><Typography>{showCVV ? '123' : '***'}<IconButton size="small" onClick={() => setShowCVV(!showCVV)}><Visibility sx={{ color: 'white' }} /></IconButton></Typography></Box>
                            </Box>
                        </Paper>

                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6">Recent Activity</Typography>
                            {transactions.slice(0, 3).map(t => (
                                <Box key={t.id} sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #eee' }}>
                                    <Box>
                                        <Typography>{t.type === 'received' ? `Received from ${t.from}` : t.type === 'deposit' ? 'Deposit' : `Sent to ${t.to}`}</Typography>
                                        <Typography variant="caption">{t.date}</Typography>
                                    </Box>
                                    <Typography sx={{ color: t.type === 'sent' ? '#F44336' : '#4CAF50' }}>
                                        {t.type === 'sent' ? '-' : '+'}{formatCurrency(t.amount)}
                                    </Typography>
                                </Box>
                            ))}
                        </Paper>
                    </>
                )}

                {tabValue === 1 && (
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6">All Transactions</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead><TableRow><TableCell>Date</TableCell><TableCell>Description</TableCell><TableCell align="right">Amount</TableCell></TableRow></TableHead>
                                <TableBody>
                                    {transactions.map(t => (
                                        <TableRow key={t.id}>
                                            <TableCell>{t.date}</TableCell>
                                            <TableCell>{t.type === 'received' ? `From ${t.from}` : t.type === 'deposit' ? 'Deposit' : `To ${t.to}`}</TableCell>
                                            <TableCell align="right" sx={{ color: t.type === 'sent' ? '#F44336' : '#4CAF50' }}>
                                                {t.type === 'sent' ? '-' : '+'}{formatCurrency(t.amount)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                )}

                {tabValue === 2 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Avatar sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: '#0A1E3F' }}>{user.fullName.charAt(0)}</Avatar>
                                <Typography variant="h5">{user.fullName}</Typography>
                                <Typography>{user.email}</Typography>
                                <Typography>Balance: {formatCurrency(balance)}</Typography>
                                <Typography>Country: {user.country}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6">Personal Information</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}><Typography variant="caption">Full Name</Typography><Typography>{user.fullName}</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="caption">Email</Typography><Typography>{user.email}</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="caption">Phone</Typography><Typography>{user.phone}</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="caption">Address</Typography><Typography>{user.address}</Typography></Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                    </Grid>
                )}
            </Container>

            {/* Send Modal */}
            <Modal open={sendModal} onClose={() => setSendModal(false)}>
                <Fade in={sendModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: 400 }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setSendModal(false)}><Close /></IconButton>
                        <Typography variant="h5">Send Money</Typography>
                        <Stepper activeStep={transferStep} sx={{ mb: 3 }}>
                            {transferSteps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                        </Stepper>
                        {transferStep === 0 && (
                            <>
                                <TextField fullWidth label="Recipient Email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} sx={{ mb: 2 }} />
                                <GoldButton fullWidth onClick={() => setTransferStep(1)}>Next</GoldButton>
                            </>
                        )}
                        {transferStep === 1 && (
                            <>
                                <TextField fullWidth label={`Amount (${user.currency})`} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start">{user.symbol}</InputAdornment> }} />
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button variant="outlined" onClick={() => setTransferStep(0)}>Back</Button>
                                    <GoldButton onClick={() => setTransferStep(2)}>Next</GoldButton>
                                </Box>
                            </>
                        )}
                        {transferStep === 2 && (
                            <>
                                <Paper sx={{ p: 2, mb: 2 }}><Typography>To: {recipientEmail}</Typography><Typography>Amount: {user.symbol}{(parseFloat(amount) || 0).toLocaleString()}</Typography></Paper>
                                <GoldButton fullWidth onClick={handleSend}>Send</GoldButton>
                            </>
                        )}
                    </Box>
                </Fade>
            </Modal>

            {/* Deposit Modal */}
            <Modal open={depositModal} onClose={() => setDepositModal(false)}>
                <Fade in={depositModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: 400 }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setDepositModal(false)}><Close /></IconButton>
                        <Typography variant="h5">Deposit</Typography>
                        <TextField fullWidth label={`Amount (${user.currency})`} type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start">{user.symbol}</InputAdornment> }} />
                        <GoldButton fullWidth onClick={handleDeposit}>Deposit</GoldButton>
                    </Box>
                </Fade>
            </Modal>

            {/* Profile Modal */}
            <Modal open={profileModal} onClose={() => setProfileModal(false)}>
                <Fade in={profileModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: 320, textAlign: 'center' }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setProfileModal(false)}><Close /></IconButton>
                        <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: '#0A1E3F' }}>{user.fullName.charAt(0)}</Avatar>
                        <Typography variant="h6">{user.fullName}</Typography>
                        <Typography variant="body2">{user.email}</Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography><strong>Balance:</strong> {formatCurrency(balance)}</Typography>
                        <Typography><strong>Country:</strong> {user.country}</Typography>
                        <GoldButton fullWidth sx={{ mt: 2 }} onClick={() => { setProfileModal(false); setTabValue(2); }}>Full Profile</GoldButton>
                    </Box>
                </Fade>
            </Modal>

            {/* Bottom Navigation */}
            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}>
                <BottomNavigation showLabels value={tabValue} onChange={(e, v) => setTabValue(v)}>
                    <BottomNavigationAction label="HOME" icon={<Home />} />
                    <BottomNavigationAction label="TRANSACTIONS" icon={<History />} />
                    <BottomNavigationAction label="PROFILE" icon={<Person />} />
                </BottomNavigation>
            </Paper>

            <Snackbar open={message.show} autoHideDuration={4000} onClose={() => setMessage(prev => ({ ...prev, show: false }))}>
                <Alert severity={message.type}>{message.text}</Alert>
            </Snackbar>
        </Box>
    );
}

export default Dashboard;