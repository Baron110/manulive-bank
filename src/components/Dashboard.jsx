import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion, collection, query, where, getDocs } from 'firebase/firestore';

// Material UI imports (Tooltip renamed to MuiTooltip to avoid conflict with chart.js)
import {
    AppBar, Toolbar, Typography, Button, Container, Grid,
    Paper, Card, CardContent, TextField, Avatar, IconButton,
    Box, Alert, Snackbar, BottomNavigation, BottomNavigationAction,
    Divider, Chip, Modal, Fade, Backdrop, Tab, Tabs,
    LinearProgress, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Select, MenuItem, FormControl, InputLabel,
    Stepper, Step, StepLabel, Radio, RadioGroup, FormControlLabel,
    Fab, InputAdornment, Tooltip as MuiTooltip, Dialog, DialogTitle, DialogContent,
    DialogActions, List, ListItem, ListItemText, ListItemAvatar,
    Menu, Badge, SpeedDial, SpeedDialAction, Switch, CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    AccountBalance, Send, AddCard, Home, History, TrendingUp,
    Person, Notifications, ArrowUpward, ArrowDownward, Send as SendIcon,
    MoreHoriz, Logout, Close, Receipt, Edit, CalendarToday, Phone,
    Email, LocationOn, Security, CheckCircle, Lock, Badge as BadgeIcon,
    CreditCard, Visibility, VisibilityOff, AttachMoney, Settings,
    Help, Download, Print, Share, Favorite, Warning, ErrorOutline,
    Verified, VerifiedUser, Shield, Gavel, MonetizationOn,
    SwapHoriz, SwapVert, CompareArrows, TrendingFlat, TrendingUp as TrendingUpIcon,
    School, Work, HomeWork, Flight, LocalHospital, Restaurant, ShoppingCart,
    Movie, SportsEsports, FitnessCenter, Spa, BeachAccess, Weekend, Pets,
    Chat, TrendingDown as TrendingDownIcon, Add, Remove, Check, Clear, Done,
    Menu as MenuIcon, Search, FilterList, ViewList, ViewModule, Sort,
    ArrowBack, ArrowForward, KeyboardArrowDown, KeyboardArrowUp,
    FirstPage, LastPage, NavigateBefore, NavigateNext, ExpandMore, ExpandLess,
    Fingerprint, Cake, Public, Flag, Wc, BusinessCenter, QrCodeScanner,
    Timeline, PieChart, BarChart, Savings, CompareArrows as CompareArrowsIcon,
    Star, Diamond, WorkspacePremium
} from '@mui/icons-material';
import { Line, Pie, Bar, Doughnut } from 'react-chartjs-2';
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
    BarElement,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    Title, Tooltip, Legend, ArcElement, BarElement, Filler
);

// Styled Components
const BalanceCard = styled(Paper)(({ theme }) => ({
    background: 'linear-gradient(135deg, #0A1E3F 0%, #1A3B5E 100%)',
    color: 'white',
    borderRadius: '28px',
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' },
    '&::before': {
        content: '""',
        position: 'absolute',
        top: '-40%',
        right: '-20%',
        width: '250px',
        height: '250px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        borderRadius: '50%'
    }
}));

const GoldButton = styled(Button)(({ theme }) => ({
    background: 'linear-gradient(135deg, #0A1E3F 0%, #1A3B5E 100%)',
    color: 'white',
    padding: '14px',
    borderRadius: '16px',
    textTransform: 'none',
    fontWeight: 700,
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    '&:hover': {
        background: 'linear-gradient(135deg, #1A3B5E 0%, #2A4B7E 100%)',
        transform: 'translateY(-3px)',
        boxShadow: '0 12px 25px rgba(10,30,63,0.4)'
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
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: '#E8F0FE',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }
}));

const GlassCard = styled(Paper)(({ theme }) => ({
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    padding: theme.spacing(3),
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
    marginBottom: theme.spacing(3),
    '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }
}));

const ProfileCard = styled(Paper)(({ theme }) => ({
    background: 'white',
    borderRadius: '24px',
    padding: theme.spacing(3),
    border: '1px solid rgba(0,0,0,0.05)'
}));

const VirtualCard = styled(Paper)(({ theme }) => ({
    background: 'linear-gradient(135deg, #1A1A1A 0%, #0A0A0A 100%)',
    borderRadius: '20px',
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    color: 'white',
    transition: 'all 0.3s ease',
    '&:hover': { transform: 'scale(1.02)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }
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
        accountType: 'Platinum Elite (Disabled)',
        occupation: 'Basketball Player',
        gender: 'Female',
        memberSince: 'April 2026',
        creditScore: 780,
        pin: '2002',
        cardDesign: 'platinum',
        cardType: 'credit',
        cardLimit: 250000,
        billingMessage: 'Unable to process transaction due to unpaid maintenance fees, kindly contact your account manager to clear up fees and charges.',
        isDisabled: true,
        transactions: [
            { id: 1, name: 'Indiana Fever', amount: 2500000, type: 'received', category: 'SALARY', date: 'Apr 1, 2026', time: '09:00 AM' },
            { id: 2, name: 'Nike', amount: 12500, type: 'sent', category: 'ENDORSEMENT', date: 'Apr 3, 2026', time: '02:30 PM' },
            { id: 3, name: 'State Farm', amount: 500000, type: 'received', category: 'SPONSORSHIP', date: 'Apr 5, 2026', time: '11:00 AM' }
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
            { id: 3, name: 'Dollywood Foundation', amount: 5000, type: 'sent', category: 'CHARITY', date: 'Apr 4, 2026', time: '01:00 PM' }
        ]
    },
    'powelleva08@gmail.com': {
        firstName: 'Perry',
        lastName: 'Novela',
        fullName: 'Perry Eva Novela',
        email: 'powelleva08@gmail.com',
        username: 'Randy Perry',
        phone: '6154924655',
        country: 'USA',
        state: 'Texas',
        city: 'San Antonio',
        address: '15150 Blanco Rd, San Antonio, TX 78216',
        dateOfBirth: '11/25/1993',
        balance: 25000000,
        currency: 'USD',
        currencySymbol: '$',
        accountType: 'Platinum Elite',
        occupation: 'fashion designer',
        gender: 'Female',
        memberSince: '2024',
        creditScore: 750,
        pin: '369036',
        cardDesign: 'platinum',
        cardType: 'credit',
        cardLimit: 500000,
        billingMessage: 'Unable to process transaction due to unpaid maintenance fee of $15000, Kindly contact your account manager to clear the fees and charges',
        transactions: [
            { id: 1, name: 'Fashion Show Income', amount: 50000, type: 'received', category: 'INCOME', date: 'Apr 1, 2026', time: '10:00 AM' },
            { id: 2, name: 'Fabric Purchase', amount: 3200, type: 'sent', category: 'MATERIALS', date: 'Apr 5, 2026', time: '02:30 PM' }
        ]
    },
    'johnmarkey195@gmail.com': {
        firstName: 'John',
        lastName: 'Markey',
        fullName: 'John Erick Markey',
        email: 'johnmarkey195@gmail.com',
        username: 'John',
        phone: '+1 (773) 290-9848',
        country: 'USA',
        state: 'Illinois',
        city: 'Chicago',
        address: '123 N State St, Chicago, IL 60602, USA',
        dateOfBirth: '07/03/1984',
        balance: 800567.27,
        currency: 'USD',
        currencySymbol: '$',
        accountType: 'Gold Elite',
        occupation: 'geotechnical eng',
        gender: 'Male',
        memberSince: 'April 2026',
        creditScore: 720,
        pin: '350000',
        cardDesign: 'gold',
        cardType: 'credit',
        cardLimit: 200000,
        billingMessage: 'Your account has had limited transaction activity from 2024 to 2025. Because of the low number of transactions during this period, your account is currently under review, and you may need to complete additional transactions before certain services, such as fund transfers, can be fully activated.',
        transactions: [
            { id: 1, name: 'Salary Deposit', amount: 8500, type: 'received', category: 'SALARY', date: 'Apr 1, 2026', time: '09:00 AM' },
            { id: 2, name: 'Engineering Tools', amount: 1200, type: 'sent', category: 'EQUIPMENT', date: 'Apr 3, 2026', time: '02:00 PM' }
        ]
    },
    'kimmirandajessica@gmail.com': {
        firstName: 'Miranda',
        lastName: 'Jessica',
        fullName: 'Miranda Kim Jessica',
        email: 'kimmirandajessica@gmail.com',
        username: 'Jessica12',
        phone: '+1 (615) 349-0644',
        country: 'United States',
        state: 'Tennessee',
        city: 'TN',
        address: '2912 Leatherwood Dr, Nashville, TN 37214',
        dateOfBirth: '15/02/1993',
        balance: 700000,
        currency: 'USD',
        currencySymbol: '$',
        accountType: 'Gold Elite',
        occupation: '',
        gender: 'Female',
        memberSince: 'April 2026',
        creditScore: 700,
        pin: '1209',
        cardDesign: 'gold',
        cardType: 'credit',
        cardLimit: 150000,
        billingMessage: 'Unable to process transaction due to unpaid maintenance fees of $20,000 kindly contact your account manager to clear up fees and charges.',
        transactions: [
            { id: 1, name: 'Initial Deposit', amount: 700000, type: 'deposit', category: 'DEPOSIT', date: 'Apr 1, 2026', time: '09:00 AM' }
        ]
    },
    'pablowrld01@gmail.com': {
        firstName: 'Owen',
        lastName: 'Jay',
        fullName: 'Owen Alfred Jay',
        email: 'pablowrld01@gmail.com',
        username: 'Jayowen',
        phone: '+1 (813) 296-9763',
        country: 'United States',
        state: 'Florida',
        city: 'Tampa',
        address: '1001 N Dale Mabry Hwy, Tampa, FL 33618',
        dateOfBirth: '18/09/1992',
        balance: 100000000,
        currency: 'USD',
        currencySymbol: '$',
        accountType: 'Platinum Elite',
        occupation: 'Entrepreneur',
        gender: 'Male',
        memberSince: 'May 2026',
        creditScore: 785,
        pin: '1984',
        cardDesign: 'platinum',
        cardType: 'credit',
        cardLimit: 1000000,
        billingMessage: 'Authorization fee of $5,000 required to activate this transaction. Please contact your account manager to complete the verification process.',
        transactions: [
            { id: 1, name: 'Initial Account Funding', amount: 10000000, type: 'deposit', category: 'DEPOSIT', date: 'May 1, 2026', time: '09:00 AM' },
            { id: 2, name: 'Tech Startup Investment Return', amount: 25000000, type: 'received', category: 'INVESTMENT', date: 'May 2, 2026', time: '10:30 AM' },
            { id: 3, name: 'Real Estate Sale (Miami Property)', amount: 35000000, type: 'received', category: 'REAL ESTATE', date: 'May 5, 2026', time: '02:15 PM' },
            { id: 4, name: 'Business Profit (Q1 2026)', amount: 18000000, type: 'received', category: 'BUSINESS', date: 'May 8, 2026', time: '11:00 AM' },
            { id: 5, name: 'Stock Dividends', amount: 5000000, type: 'received', category: 'INVESTMENT', date: 'May 10, 2026', time: '01:45 PM' },
            { id: 6, name: 'Charity Donation (Red Cross)', amount: 1000000, type: 'sent', category: 'CHARITY', date: 'May 12, 2026', time: '03:20 PM' },
            { id: 7, name: 'New Car Purchase (Tesla)', amount: 120000, type: 'sent', category: 'SHOPPING', date: 'May 14, 2026', time: '11:30 AM' },
            { id: 8, name: 'Luxury Watch', amount: 45000, type: 'sent', category: 'SHOPPING', date: 'May 15, 2026', time: '04:00 PM' },
            { id: 9, name: 'Private Jet Charter', amount: 75000, type: 'sent', category: 'TRAVEL', date: 'May 16, 2026', time: '09:45 AM' }
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
    const rawEmail = currentUser?.email || '';
    const userEmail = rawEmail.trim().toLowerCase();
    const user = usersData[userEmail] || defaultUser;
    const hasBillingMessage = !!user.billingMessage;
    const isCaitlin = userEmail === 'caitlinelizabeth200@gmail.com';
    const isHardcoded = !!usersData[userEmail];

    const storageKey = `quincore_user_${userEmail}`;

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
    const [depositModal, setDepositModal] = useState(false);
    const [profileModal, setProfileModal] = useState(false);
    const [cardPinModal, setCardPinModal] = useState(false);
    const [cardPinInput, setCardPinInput] = useState('');
    const [cardPinError, setCardPinError] = useState('');
    const [isCardDetailsVisible, setIsCardDetailsVisible] = useState(false);
    const [showFullCardNumber, setShowFullCardNumber] = useState(false);
    const [showFullCVV, setShowFullCVV] = useState(false);
    const [receiptModal, setReceiptModal] = useState(false);
    const [lastTransaction, setLastTransaction] = useState(null);
    const [filterModal, setFilterModal] = useState(false);
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [exportModal, setExportModal] = useState(false);
    const [securityAlert, setSecurityAlert] = useState({ show: false, amount: 0 });

    // Transfer form states
    const [recipientAccount, setRecipientAccount] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [amount, setAmount] = useState('');
    const [transferPurpose, setTransferPurpose] = useState('');
    const [transferType, setTransferType] = useState('interac');
    const [transferStep, setTransferStep] = useState(0);
    const [depositAmount, setDepositAmount] = useState('');
    const [showCVV, setShowCVV] = useState(false);
    const [beneficiaries, setBeneficiaries] = useState(() => {
        const saved = localStorage.getItem(`beneficiaries_${userEmail}`);
        return saved ? JSON.parse(saved) : [];
    });
    const [dailyTransferLimit] = useState(50000);
    const [todayTransferred, setTodayTransferred] = useState(() => {
        const saved = localStorage.getItem(`daily_transferred_${userEmail}`);
        const date = localStorage.getItem(`daily_transferred_date_${userEmail}`);
        if (date === new Date().toDateString()) {
            return saved ? parseFloat(saved) : 0;
        }
        return 0;
    });
    const [sendFormData, setSendFormData] = useState({
        bankName: '',
        accountNumber: '',
        routingNumber: '',
        accountType: 'checking',
        recipientName: '',
        recipientEmail: '',
        amount: '',
        purpose: 'personal',
        reference: ''
    });
    const [sendWizardStep, setSendWizardStep] = useState(0);

    const issuedCard = {
        cardholderName: user.fullName,
        maskedNumber: user.email === 'caitlinelizabeth200@gmail.com' ? '**** **** **** 2002' :
                       user.email === 'dollyrparton945@gmail.com' ? '**** **** **** 9643' :
                       user.email === 'powelleva08@gmail.com' ? '**** **** **** 3690' :
                       user.email === 'johnmarkey195@gmail.com' ? '**** **** **** 3500' :
                       user.email === 'kimmirandajessica@gmail.com' ? '**** **** **** 1209' :
                       user.email === 'pablowrld01@gmail.com' ? '**** **** **** 1984' :
                       '**** **** **** 0000',
        fullCardNumber: '4532 1234 5678 9101',
        expiryDate: '12/27',
        cvv: '***',
        fullCVV: '123',
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
        if (hasBillingMessage) {
            showMessage('Profile editing is disabled for this account', 'warning');
            return;
        }
        setEditMode(false);
        showMessage('Profile updated (local changes only)', 'success');
    };

    const saveToStorage = (newBalance, newTransactions) => {
        if (isHardcoded) {
            const data = { balance: newBalance, transactions: newTransactions };
            localStorage.setItem(storageKey, JSON.stringify(data));
        }
    };

    const updateDailyTransferLimit = (transferredAmount) => {
        const newTotal = todayTransferred + transferredAmount;
        localStorage.setItem(`daily_transferred_${userEmail}`, newTotal.toString());
        localStorage.setItem(`daily_transferred_date_${userEmail}`, new Date().toDateString());
        setTodayTransferred(newTotal);
    };

    const saveBeneficiary = () => {
        const newBeneficiary = {
            id: Date.now(),
            bankName: sendFormData.bankName,
            accountNumber: sendFormData.accountNumber,
            recipientName: sendFormData.recipientName,
            recipientEmail: sendFormData.recipientEmail
        };
        const updated = [newBeneficiary, ...beneficiaries.filter(b => b.accountNumber !== sendFormData.accountNumber)].slice(0, 5);
        setBeneficiaries(updated);
        localStorage.setItem(`beneficiaries_${userEmail}`, JSON.stringify(updated));
    };

    const handleSendMoney = () => {
        if (hasBillingMessage) {
            showMessage(user.billingMessage, 'error');
            setSendModal(false);
            setSendWizardStep(0);
            setSendFormData({
                bankName: '', accountNumber: '', routingNumber: '', accountType: 'checking',
                recipientName: '', recipientEmail: '', amount: '', purpose: 'personal', reference: ''
            });
            return;
        }

        if (sendWizardStep === 0) {
            if (!sendFormData.bankName || !sendFormData.accountNumber || !sendFormData.routingNumber || !sendFormData.recipientName || !sendFormData.recipientEmail || !sendFormData.amount) {
                showMessage('Please fill all required fields', 'error');
                return;
            }
            const transferAmount = parseFloat(sendFormData.amount);
            if (transferAmount <= 0 || transferAmount > balance) {
                showMessage('Invalid amount or insufficient funds', 'error');
                return;
            }
            if (transferAmount > dailyTransferLimit - todayTransferred) {
                showMessage(`Daily transfer limit of ${formatCurrency(dailyTransferLimit)} exceeded. Remaining today: ${formatCurrency(dailyTransferLimit - todayTransferred)}`, 'error');
                return;
            }
            if (transferAmount > 10000) {
                setSecurityAlert({ show: true, amount: transferAmount });
                return;
            }
            setSendWizardStep(1);
            return;
        }

        if (sendWizardStep === 1) {
            const transferAmount = parseFloat(sendFormData.amount);
            const newBalance = balance - transferAmount;
            const reference = sendFormData.reference || `TRX${Math.floor(Math.random() * 1000000000)}`;
            const newTransaction = {
                id: Date.now(),
                name: `Transfer to ${sendFormData.recipientName} (${sendFormData.bankName})`,
                amount: -transferAmount,
                type: 'sent',
                category: 'TRANSFER',
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                time: new Date().toLocaleTimeString(),
                status: 'completed',
                reference: reference,
                bankName: sendFormData.bankName,
                accountNumber: sendFormData.accountNumber,
                routingNumber: sendFormData.routingNumber,
                accountType: sendFormData.accountType,
                recipientName: sendFormData.recipientName,
                recipientEmail: sendFormData.recipientEmail,
                purpose: sendFormData.purpose
            };
            const updatedTransactions = [newTransaction, ...transactions];
            setBalance(newBalance);
            setTransactions(updatedTransactions);
            saveToStorage(newBalance, updatedTransactions);
            updateDailyTransferLimit(transferAmount);
            saveBeneficiary();
            setLastTransaction(newTransaction);
            setReceiptModal(true);
            showMessage(`✅ Successfully sent ${formatCurrency(transferAmount)} to ${sendFormData.recipientName}`, 'success');
            setSendModal(false);
            setSendWizardStep(0);
            setSendFormData({
                bankName: '', accountNumber: '', routingNumber: '', accountType: 'checking',
                recipientName: '', recipientEmail: '', amount: '', purpose: 'personal', reference: ''
            });
            return;
        }
    };

    const handleDeposit = () => {
        if (hasBillingMessage) {
            showMessage(user.billingMessage, 'error');
            setDepositModal(false);
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
        saveToStorage(newBalance, updatedTransactions);
        showMessage(`💰 Successfully deposited ${formatCurrency(depositAmountNum)}`, 'success');
        setDepositModal(false);
        setDepositAmount('');
    };

    const handleSecurityAlertConfirm = () => {
        setSecurityAlert({ show: false, amount: 0 });
        setSendWizardStep(1);
    };

    const handleSecurityAlertCancel = () => {
        setSecurityAlert({ show: false, amount: 0 });
        setSendModal(false);
        setSendWizardStep(0);
        setSendFormData({
            bankName: '', accountNumber: '', routingNumber: '', accountType: 'checking',
            recipientName: '', recipientEmail: '', amount: '', purpose: 'personal', reference: ''
        });
    };

    const handleCardPinSubmit = () => {
        if (cardPinInput === user.pin) {
            setIsCardDetailsVisible(true);
            setCardPinModal(false);
            setCardPinInput('');
            setCardPinError('');
        } else {
            setCardPinError('Incorrect PIN. Please try again.');
        }
    };

    const handleResetCardView = () => {
        setIsCardDetailsVisible(false);
        setShowFullCardNumber(false);
        setShowFullCVV(false);
    };

    const applyFilters = () => {
        let filtered = [...transactions];
        if (filterStartDate) {
            filtered = filtered.filter(t => new Date(t.date) >= new Date(filterStartDate));
        }
        if (filterEndDate) {
            filtered = filtered.filter(t => new Date(t.date) <= new Date(filterEndDate));
        }
        if (filterType !== 'all') {
            filtered = filtered.filter(t => t.type === filterType);
        }
        setFilteredTransactions(filtered);
        setFilterModal(false);
    };

    const exportToCSV = () => {
        const dataToExport = filteredTransactions.length ? filteredTransactions : transactions;
        const csvRows = [
            ['Date', 'Description', 'Category', 'Amount', 'Status', 'Reference'],
            ...dataToExport.map(t => [t.date, t.name, t.category, t.amount, t.status, t.reference || ''])
        ];
        const csvContent = csvRows.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${userEmail}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        setExportModal(false);
        showMessage('Statement exported successfully', 'success');
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
        } catch (error) {
            showMessage('Logout failed: ' + error.message, 'error');
        }
    };

    useEffect(() => {
        if (isHardcoded) {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const data = JSON.parse(saved);
                setBalance(data.balance);
                setTransactions(data.transactions);
            } else {
                saveToStorage(user.balance, user.transactions);
            }
        } else {
            const loadFirebaseUser = async () => {
                const userDoc = auth.currentUser;
                if (userDoc) {
                    try {
                        const docRef = doc(db, 'users', userDoc.uid);
                        const docSnap = await getDoc(docRef);
                        if (docSnap.exists()) {
                            const data = docSnap.data();
                            setBalance(data.balance || 0);
                            setTransactions(data.transactions || []);
                        }
                    } catch (error) {
                        console.log('Error loading user data');
                    }
                }
            };
            loadFirebaseUser();
        }
    }, []);

    // Chart data
    const spendingData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Spending',
            data: user.email === 'caitlinelizabeth200@gmail.com' ? [120000, 190000, 150000, 220000, 180000, 240000] :
                   user.email === 'powelleva08@gmail.com' ? [25000, 32000, 28000, 35000, 30000, 40000] :
                   user.email === 'johnmarkey195@gmail.com' ? [8000, 9500, 7200, 11000, 9800, 10500] :
                   user.email === 'kimmirandajessica@gmail.com' ? [5000, 6000, 5500, 7000, 6500, 8000] :
                   user.email === 'pablowrld01@gmail.com' ? [15000000, 18000000, 12000000, 22000000, 19000000, 25000000] :
                   [12000, 19000, 15000, 22000, 18000, 24000],
            borderColor: '#0A1E3F',
            backgroundColor: 'rgba(10,30,63,0.1)',
            tension: 0.4
        }]
    };

    const categoryData = {
        labels: user.email === 'caitlinelizabeth200@gmail.com' ? ['Music', 'Dining', 'Shopping', 'Travel', 'Bills'] :
                user.email === 'powelleva08@gmail.com' ? ['Fashion', 'Materials', 'Rent', 'Marketing', 'Other'] :
                user.email === 'johnmarkey195@gmail.com' ? ['Engineering', 'Living', 'Transport', 'Bills', 'Other'] :
                user.email === 'kimmirandajessica@gmail.com' ? ['Living', 'Bills', 'Transport', 'Shopping', 'Other'] :
                user.email === 'pablowrld01@gmail.com' ? ['Investments', 'Real Estate', 'Business', 'Consulting', 'Luxury'] :
                ['Dining', 'Shopping', 'Bills', 'Transport', 'Entertainment'],
        datasets: [{
            data: user.email === 'caitlinelizabeth200@gmail.com' ? [45, 20, 15, 12, 8] :
                  user.email === 'powelleva08@gmail.com' ? [40, 25, 15, 10, 10] :
                  user.email === 'johnmarkey195@gmail.com' ? [35, 25, 20, 12, 8] :
                  user.email === 'kimmirandajessica@gmail.com' ? [30, 25, 20, 15, 10] :
                  user.email === 'pablowrld01@gmail.com' ? [40, 30, 20, 5, 5] :
                  [30, 25, 20, 15, 10],
            backgroundColor: ['#0A1E3F', '#1A3B5E', '#2A4B7E', '#3A5B9E', '#4A6BBE']
        }]
    };

    const monthlyData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
            {
                label: 'Income',
                data: user.email === 'caitlinelizabeth200@gmail.com' ? [850000, 920000, 880000, 950000] :
                       user.email === 'powelleva08@gmail.com' ? [150000, 180000, 160000, 200000] :
                       user.email === 'johnmarkey195@gmail.com' ? [8500, 9200, 8800, 9500] :
                       user.email === 'kimmirandajessica@gmail.com' ? [7000, 7200, 7100, 7300] :
                       user.email === 'pablowrld01@gmail.com' ? [25000000, 32000000, 28000000, 35000000] :
                       [85000, 92000, 88000, 95000],
                backgroundColor: '#4CAF50',
            },
            {
                label: 'Expenses',
                data: user.email === 'caitlinelizabeth200@gmail.com' ? [120000, 98000, 110000, 105000] :
                       user.email === 'powelleva08@gmail.com' ? [25000, 32000, 28000, 30000] :
                       user.email === 'johnmarkey195@gmail.com' ? [6200, 6800, 6400, 7100] :
                       user.email === 'kimmirandajessica@gmail.com' ? [4500, 4800, 4700, 5000] :
                       user.email === 'pablowrld01@gmail.com' ? [15000000, 18000000, 12000000, 20000000] :
                       [62000, 68000, 64000, 71000],
                backgroundColor: '#f44336',
            }
        ]
    };

    const transferSteps = ['Bank Details', 'Confirm'];

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
                        {isCaitlin && (
                            <IconButton onClick={() => window.location.href = `mailto:${supportEmail}`}>
                                <EmailIcon />
                            </IconButton>
                        )}
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
                    <Typography variant="body2" sx={{ mt: 1 }}>Account Number: {
                        user.email === 'caitlinelizabeth200@gmail.com' ? 'CC20262002' :
                        user.email === 'dollyrparton945@gmail.com' ? 'DP19469643' :
                        user.email === 'powelleva08@gmail.com' ? 'PN369036' :
                        user.email === 'johnmarkey195@gmail.com' ? 'JM350000' :
                        user.email === 'kimmirandajessica@gmail.com' ? 'MJ1209' :
                        user.email === 'pablowrld01@gmail.com' ? 'OJ1984' :
                        'DEMO0000'
                    }</Typography>
                    <Typography variant="body2">Daily Limit Remaining: {formatCurrency(dailyTransferLimit - todayTransferred)}</Typography>
                    {hasBillingMessage && (
                        <Chip 
                            label="⚠️ ACCOUNT DISABLED - Contact Support" 
                            size="small" 
                            sx={{ mt: 2, bgcolor: '#dc004e', color: 'white' }} 
                        />
                    )}
                </Paper>

                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
                    <Tab label="Dashboard" />
                    <Tab label="Transactions" />
                    <Tab label="Profile" />
                </Tabs>

                {/* DASHBOARD TAB */}
                {tabValue === 0 && (
                    <>
                        <BalanceCard elevation={3}>
                            <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>TOTAL BALANCE (USD)</Typography>
                            <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>{formatCurrency(balance)}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Chip icon={<ArrowUpward sx={{ fontSize: 16 }} />} label={
                                    user.email === 'caitlinelizabeth200@gmail.com' ? "+15.4% this month" :
                                    user.email === 'powelleva08@gmail.com' ? "+8.2% this month" :
                                    user.email === 'johnmarkey195@gmail.com' ? "+3.1% this month" :
                                    user.email === 'kimmirandajessica@gmail.com' ? "+2.0% this month" :
                                    user.email === 'pablowrld01@gmail.com' ? "+12.5% this month" :
                                    "+2.4% this month"
                                } size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>{user.accountType} Account</Typography>
                            </Box>
                        </BalanceCard>

                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={4}><ActionButton fullWidth onClick={() => setSendModal(true)}><SendIcon sx={{ color: '#0A1E3F', fontSize: 24 }} /><Typography variant="caption">SEND</Typography></ActionButton></Grid>
                            <Grid item xs={4}><ActionButton fullWidth onClick={() => setDepositModal(true)}><AttachMoney sx={{ color: '#0A1E3F', fontSize: 24 }} /><Typography variant="caption">DEPOSIT</Typography></ActionButton></Grid>
                            <Grid item xs={4}><ActionButton fullWidth onClick={() => setCardPinModal(true)}><CreditCard sx={{ color: '#0A1E3F', fontSize: 24 }} /><Typography variant="caption">VIEW CARD</Typography></ActionButton></Grid>
                        </Grid>

                        {/* Virtual Card */}
                        <VirtualCard onClick={() => setCardPinModal(true)}>
                            <Typography variant="caption" sx={{ letterSpacing: 2 }}>VIRTUAL CARD</Typography>
                            <Typography variant="h5" sx={{ fontFamily: 'monospace', letterSpacing: 2, mt: 2 }}>
                                {isCardDetailsVisible && showFullCardNumber ? issuedCard.fullCardNumber : issuedCard.maskedNumber}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                <Box><Typography variant="caption">Cardholder</Typography><Typography>{issuedCard.cardholderName}</Typography></Box>
                                <Box><Typography variant="caption">Expires</Typography><Typography>{issuedCard.expiryDate}</Typography></Box>
                                <Box>
                                    <Typography variant="caption">CVV</Typography>
                                    <Typography>
                                        {isCardDetailsVisible && showFullCVV ? issuedCard.fullCVV : '***'}
                                        {isCardDetailsVisible && (
                                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setShowFullCVV(!showFullCVV); }}>
                                                {showFullCVV ? <VisibilityOff sx={{ fontSize: 14 }} /> : <Visibility sx={{ fontSize: 14 }} />}
                                            </IconButton>
                                        )}
                                    </Typography>
                                </Box>
                            </Box>
                            {isCardDetailsVisible && (
                                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                                    <Typography variant="caption">Card Limit</Typography>
                                    <Typography>{formatCurrency(issuedCard.limit)}</Typography>
                                    <Button size="small" onClick={handleResetCardView} sx={{ mt: 1, color: '#D4AF37' }}>Hide Details</Button>
                                </Box>
                            )}
                        </VirtualCard>

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

                        {/* Recent Beneficiaries */}
                        {beneficiaries.length > 0 && (
                            <Paper sx={{ p: 3, borderRadius: '20px', mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Recent Beneficiaries</Typography>
                                <Grid container spacing={2}>
                                    {beneficiaries.map(b => (
                                        <Grid item xs={12} sm={6} md={4} key={b.id}>
                                            <Paper sx={{ p: 2, cursor: 'pointer', '&:hover': { bgcolor: '#F5F7FA' } }}
                                                onClick={() => {
                                                    setSendFormData({
                                                        ...sendFormData,
                                                        bankName: b.bankName,
                                                        accountNumber: b.accountNumber,
                                                        recipientName: b.recipientName,
                                                        recipientEmail: b.recipientEmail
                                                    });
                                                    setSendModal(true);
                                                }}>
                                                <Typography variant="body2" fontWeight={600}>{b.recipientName}</Typography>
                                                <Typography variant="caption" color="text.secondary">{b.bankName}</Typography>
                                                <Typography variant="caption" display="block" color="text.secondary">****{b.accountNumber.slice(-4)}</Typography>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Paper>
                        )}

                        {/* Recent Activity */}
                        <Paper sx={{ p: 3, borderRadius: '20px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>Recent Activity</Typography>
                                <Box>
                                    <Button size="small" startIcon={<FilterList />} onClick={() => setFilterModal(true)}>Filter</Button>
                                    <Button size="small" startIcon={<Download />} onClick={() => setExportModal(true)}>Export</Button>
                                    <Button size="small" endIcon={<MoreHoriz />} onClick={() => setTabValue(1)}>View All</Button>
                                </Box>
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

                {/* TRANSACTIONS TAB */}
                {tabValue === 1 && (
                    <Paper sx={{ p: 3, borderRadius: '20px' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>Transaction History ({transactions.length} transactions)</Typography>
                            <Box>
                                <Button size="small" startIcon={<FilterList />} onClick={() => setFilterModal(true)}>Filter</Button>
                                <Button size="small" startIcon={<Download />} onClick={() => setExportModal(true)}>Export</Button>
                            </Box>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date & Time</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Reference</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="right">Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(filteredTransactions.length ? filteredTransactions : transactions).map((t) => (
                                        <TableRow key={t.id}>
                                            <TableCell><Typography variant="body2">{t.date}</Typography><Typography variant="caption" color="text.secondary">{t.time}</Typography></TableCell>
                                            <TableCell>
                                                {t.name}
                                                {t.bankName && <Typography variant="caption" display="block" color="text.secondary">{t.bankName} • ****{t.accountNumber?.slice(-4)}</Typography>}
                                            </TableCell>
                                            <TableCell><Chip label={t.category} size="small" /></TableCell>
                                            <TableCell><Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{t.reference || t.id}</Typography></TableCell>
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
                {tabValue === 2 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <ProfileCard sx={{ textAlign: 'center' }}>
                                <Avatar sx={{ width: 120, height: 120, mx: 'auto', mb: 2, bgcolor: '#0A1E3F', fontSize: '3rem' }}>{user.firstName.charAt(0)}{user.lastName.charAt(0)}</Avatar>
                                <Typography variant="h5" sx={{ fontWeight: 600 }}>{user.fullName}</Typography>
                                <Typography color="text.secondary" gutterBottom>@{user.username}</Typography>
                                <Chip label={user.accountType} sx={{ mt: 1, bgcolor: '#D4AF37', color: '#000' }} />
                            </ProfileCard>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <ProfileCard>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Account Details</Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={6}><Typography variant="body2" color="text.secondary">Account Number</Typography><Typography variant="h6">{
                                        user.email === 'caitlinelizabeth200@gmail.com' ? 'CC20262002' :
                                        user.email === 'dollyrparton945@gmail.com' ? 'DP19469643' :
                                        user.email === 'powelleva08@gmail.com' ? 'PN369036' :
                                        user.email === 'johnmarkey195@gmail.com' ? 'JM350000' :
                                        user.email === 'kimmirandajessica@gmail.com' ? 'MJ1209' :
                                        user.email === 'pablowrld01@gmail.com' ? 'OJ1984' :
                                        'DEMO0000'
                                    }</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="body2" color="text.secondary">Member Since</Typography><Typography variant="h6">{user.memberSince}</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="body2" color="text.secondary">PIN Code</Typography><Typography variant="h6">••••</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="body2" color="text.secondary">Credit Score</Typography><Typography variant="h6">{user.creditScore}</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="body2" color="text.secondary">Account Balance</Typography><Typography variant="h6">{formatCurrency(balance)}</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="body2" color="text.secondary">Account Type</Typography><Typography variant="h6">{user.accountType}</Typography></Grid>
                                </Grid>
                                <Divider sx={{ my: 3 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Edit Profile</Typography>
                                    <Button onClick={() => setEditMode(!editMode)} startIcon={<Edit />}>{editMode ? 'Cancel' : 'Edit'}</Button>
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
                                        <Box><Typography variant="caption" color="text.secondary">Full Name</Typography><Typography>{user.fullName}</Typography></Box>
                                        <Box><Typography variant="caption" color="text.secondary">Phone Number</Typography><Typography>{user.phone || 'Not set'}</Typography></Box>
                                        <Box><Typography variant="caption" color="text.secondary">Address</Typography><Typography>{user.address || 'Not set'}</Typography></Box>
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
                                </Box>
                            </ProfileCard>
                        </Grid>
                    </Grid>
                )}
            </Container>

            {/* ========== MODALS ========== */}

            {/* Card PIN Modal */}
            <Modal open={cardPinModal} onClose={() => { setCardPinModal(false); setCardPinInput(''); setCardPinError(''); }}>
                <Fade in={cardPinModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: { xs: '90%', sm: 400 } }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#0A1E3F' }}>Enter PIN to View Card</Typography>
                        <TextField
                            fullWidth
                            label="4-digit PIN"
                            type="password"
                            value={cardPinInput}
                            onChange={(e) => setCardPinInput(e.target.value)}
                            error={!!cardPinError}
                            helperText={cardPinError}
                            sx={{ mb: 3 }}
                            inputProps={{ maxLength: 4, pattern: '[0-9]*' }}
                        />
                        <GoldButton fullWidth onClick={handleCardPinSubmit}>Verify</GoldButton>
                    </Box>
                </Fade>
            </Modal>

            {/* Enhanced Send Money Modal */}
            <Modal open={sendModal} onClose={() => { setSendModal(false); setSendWizardStep(0); setSendFormData({ bankName: '', accountNumber: '', routingNumber: '', accountType: 'checking', recipientName: '', recipientEmail: '', amount: '', purpose: 'personal', reference: '' }); }}>
                <Fade in={sendModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: { xs: '90%', sm: 550 }, maxHeight: '90vh', overflow: 'auto' }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => { setSendModal(false); setSendWizardStep(0); }}><Close /></IconButton>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#0A1E3F' }}>Send Money</Typography>
                        <Stepper activeStep={sendWizardStep} sx={{ mb: 4 }}>{transferSteps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}</Stepper>

                        {sendWizardStep === 0 && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField fullWidth label="Bank Name" value={sendFormData.bankName} onChange={(e) => setSendFormData({ ...sendFormData, bankName: e.target.value })} required placeholder="e.g., Chase Bank, Bank of America" />
                                <TextField fullWidth label="Account Number" value={sendFormData.accountNumber} onChange={(e) => setSendFormData({ ...sendFormData, accountNumber: e.target.value })} required placeholder="12-16 digits" />
                                <TextField fullWidth label="Routing Number (ABA)" value={sendFormData.routingNumber} onChange={(e) => setSendFormData({ ...sendFormData, routingNumber: e.target.value })} required placeholder="9 digits" />
                                <FormControl fullWidth>
                                    <InputLabel>Account Type</InputLabel>
                                    <Select value={sendFormData.accountType} onChange={(e) => setSendFormData({ ...sendFormData, accountType: e.target.value })} label="Account Type">
                                        <MenuItem value="checking">Checking</MenuItem>
                                        <MenuItem value="savings">Savings</MenuItem>
                                        <MenuItem value="business">Business</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField fullWidth label="Recipient Full Name" value={sendFormData.recipientName} onChange={(e) => setSendFormData({ ...sendFormData, recipientName: e.target.value })} required />
                                <TextField fullWidth label="Recipient Email" type="email" value={sendFormData.recipientEmail} onChange={(e) => setSendFormData({ ...sendFormData, recipientEmail: e.target.value })} required />
                                <TextField fullWidth label="Amount (USD)" type="number" value={sendFormData.amount} onChange={(e) => setSendFormData({ ...sendFormData, amount: e.target.value })} required InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                                <FormControl fullWidth>
                                    <InputLabel>Purpose</InputLabel>
                                    <Select value={sendFormData.purpose} onChange={(e) => setSendFormData({ ...sendFormData, purpose: e.target.value })} label="Purpose">
                                        <MenuItem value="personal">Personal/Gift</MenuItem>
                                        <MenuItem value="rent">Rent/Mortgage</MenuItem>
                                        <MenuItem value="business">Business Payment</MenuItem>
                                        <MenuItem value="education">Education</MenuItem>
                                        <MenuItem value="investment">Investment</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField fullWidth label="Reference (Optional)" value={sendFormData.reference} onChange={(e) => setSendFormData({ ...sendFormData, reference: e.target.value })} placeholder="Invoice #, description, etc." />
                                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                    <Button variant="outlined" onClick={() => setSendModal(false)}>Cancel</Button>
                                    <GoldButton onClick={() => handleSendMoney()}>Review & Send</GoldButton>
                                </Box>
                            </Box>
                        )}

                        {sendWizardStep === 1 && (
                            <Box>
                                <Paper sx={{ p: 3, bgcolor: '#F5F7FA', mb: 3, borderRadius: '16px' }}>
                                    <Typography variant="subtitle2" color="text.secondary">Bank Details</Typography>
                                    <Typography><strong>Bank:</strong> {sendFormData.bankName}</Typography>
                                    <Typography><strong>Account:</strong> ****{sendFormData.accountNumber.slice(-4)}</Typography>
                                    <Typography><strong>Routing:</strong> ****{sendFormData.routingNumber.slice(-4)}</Typography>
                                    <Typography><strong>Type:</strong> {sendFormData.accountType}</Typography>
                                    <Divider sx={{ my: 1.5 }} />
                                    <Typography variant="subtitle2" color="text.secondary">Recipient</Typography>
                                    <Typography><strong>Name:</strong> {sendFormData.recipientName}</Typography>
                                    <Typography><strong>Email:</strong> {sendFormData.recipientEmail}</Typography>
                                    <Divider sx={{ my: 1.5 }} />
                                    <Typography variant="subtitle2" color="text.secondary">Payment</Typography>
                                    <Typography><strong>Amount:</strong> {formatCurrency(parseFloat(sendFormData.amount) || 0)}</Typography>
                                    <Typography><strong>Purpose:</strong> {sendFormData.purpose}</Typography>
                                    {sendFormData.reference && <Typography><strong>Reference:</strong> {sendFormData.reference}</Typography>}
                                </Paper>
                                <Typography variant="caption" sx={{ display: 'block', mb: 2, color: '#666' }}>Daily limit remaining: {formatCurrency(dailyTransferLimit - todayTransferred)}</Typography>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button variant="outlined" onClick={() => setSendWizardStep(0)}>Back</Button>
                                    <GoldButton onClick={() => handleSendMoney()}>Confirm & Send</GoldButton>
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Fade>
            </Modal>

            {/* Security Alert Modal */}
            <Modal open={securityAlert.show} onClose={() => setSecurityAlert({ show: false, amount: 0 })}>
                <Fade in={securityAlert.show}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: { xs: '90%', sm: 400 } }}>
                        <Warning sx={{ fontSize: 60, color: '#FF9800', mb: 2 }} />
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Large Transfer Alert</Typography>
                        <Typography sx={{ mb: 3 }}>You are about to send {formatCurrency(securityAlert.amount)}. This is a large transfer. Please confirm you want to proceed.</Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button variant="outlined" onClick={handleSecurityAlertCancel}>Cancel</Button>
                            <GoldButton onClick={handleSecurityAlertConfirm}>Confirm</GoldButton>
                        </Box>
                    </Box>
                </Fade>
            </Modal>

            {/* Receipt Modal */}
            <Modal open={receiptModal} onClose={() => setReceiptModal(false)}>
                <Fade in={receiptModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: { xs: '90%', sm: 450 } }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setReceiptModal(false)}><Close /></IconButton>
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <CheckCircle sx={{ fontSize: 60, color: '#4CAF50' }} />
                            <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>Transfer Complete</Typography>
                        </Box>
                        {lastTransaction && (
                            <Paper sx={{ p: 3, bgcolor: '#F5F7FA', borderRadius: '16px' }}>
                                <Typography variant="subtitle2">Transaction Receipt</Typography>
                                <Divider sx={{ my: 1 }} />
                                <Typography><strong>Reference:</strong> {lastTransaction.reference}</Typography>
                                <Typography><strong>Date:</strong> {lastTransaction.date} {lastTransaction.time}</Typography>
                                <Typography><strong>To:</strong> {lastTransaction.recipientName}</Typography>
                                <Typography><strong>Bank:</strong> {lastTransaction.bankName}</Typography>
                                <Typography><strong>Account:</strong> ****{lastTransaction.accountNumber.slice(-4)}</Typography>
                                <Typography><strong>Amount:</strong> {formatCurrency(Math.abs(lastTransaction.amount))}</Typography>
                                <Typography><strong>Status:</strong> Completed</Typography>
                            </Paper>
                        )}
                        <Button fullWidth variant="outlined" sx={{ mt: 2 }} onClick={() => { navigator.clipboard.writeText(lastTransaction?.reference || ''); showMessage('Reference copied', 'success'); }}>Copy Reference</Button>
                    </Box>
                </Fade>
            </Modal>

            {/* Filter Modal */}
            <Modal open={filterModal} onClose={() => setFilterModal(false)}>
                <Fade in={filterModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: { xs: '90%', sm: 400 } }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#0A1E3F' }}>Filter Transactions</Typography>
                        <TextField
                            fullWidth
                            label="Start Date"
                            type="date"
                            value={filterStartDate}
                            onChange={(e) => setFilterStartDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="End Date"
                            type="date"
                            value={filterEndDate}
                            onChange={(e) => setFilterEndDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ mb: 2 }}
                        />
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Transaction Type</InputLabel>
                            <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} label="Transaction Type">
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="sent">Sent</MenuItem>
                                <MenuItem value="received">Received</MenuItem>
                                <MenuItem value="deposit">Deposit</MenuItem>
                            </Select>
                        </FormControl>
                        <GoldButton fullWidth onClick={applyFilters}>Apply Filters</GoldButton>
                    </Box>
                </Fade>
            </Modal>

            {/* Export Modal */}
            <Modal open={exportModal} onClose={() => setExportModal(false)}>
                <Fade in={exportModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: { xs: '90%', sm: 350 } }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#0A1E3F' }}>Export Statement</Typography>
                        <Typography sx={{ mb: 3 }}>Download your transaction history as CSV file.</Typography>
                        <GoldButton fullWidth startIcon={<Download />} onClick={exportToCSV}>Download CSV</GoldButton>
                    </Box>
                </Fade>
            </Modal>

            {/* Deposit Modal */}
            <Modal open={depositModal} onClose={() => setDepositModal(false)}>
                <Fade in={depositModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: { xs: '90%', sm: 400 } }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setDepositModal(false)}><Close /></IconButton>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#0A1E3F' }}>Deposit Funds</Typography>
                        <TextField
                            fullWidth
                            label="Amount (USD)"
                            type="number"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            sx={{ mb: 3 }}
                            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                        />
                        <GoldButton fullWidth onClick={handleDeposit}>Deposit</GoldButton>
                    </Box>
                </Fade>
            </Modal>

            {/* Profile Quick Modal */}
            <Modal open={profileModal} onClose={() => setProfileModal(false)}>
                <Fade in={profileModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: { xs: '90%', sm: 350 }, textAlign: 'center' }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setProfileModal(false)}><Close /></IconButton>
                        <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: '#0A1E3F' }}>{user.firstName.charAt(0)}</Avatar>
                        <Typography variant="h6">{user.fullName}</Typography>
                        <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body2"><strong>Account:</strong> {user.email === 'caitlinelizabeth200@gmail.com' ? 'CC20262002' : user.email === 'dollyrparton945@gmail.com' ? 'DP19469643' : user.email === 'powelleva08@gmail.com' ? 'PN369036' : user.email === 'johnmarkey195@gmail.com' ? 'JM350000' : user.email === 'kimmirandajessica@gmail.com' ? 'MJ1209' : user.email === 'pablowrld01@gmail.com' ? 'OJ1984' : 'DEMO0000'}</Typography>
                        <Typography variant="body2"><strong>Balance:</strong> {formatCurrency(balance)}</Typography>
                        <Typography variant="body2"><strong>Country:</strong> {user.country}</Typography>
                        {hasBillingMessage && <Chip label="Account Disabled" size="small" sx={{ mt: 2, bgcolor: '#dc004e', color: 'white' }} />}
                        <GoldButton fullWidth sx={{ mt: 2 }} onClick={() => { setProfileModal(false); setTabValue(2); }}>Full Profile</GoldButton>
                    </Box>
                </Fade>
            </Modal>

            {/* Bottom Navigation */}
            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderRadius: '20px 20px 0 0', boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }}>
                <BottomNavigation showLabels value={navValue} onChange={(e, v) => { setNavValue(v); setTabValue(v); }}>
                    <BottomNavigationAction label="HOME" icon={<Home />} />
                    <BottomNavigationAction label="TRANSACTIONS" icon={<History />} />
                    <BottomNavigationAction label="PROFILE" icon={<Person />} />
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