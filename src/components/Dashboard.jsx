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
    Stepper, Step, StepLabel, InputAdornment, CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    AccountBalance, Send, RequestPage, Payment, AddCard,
    Home, TrendingUp, Person, Notifications,
    ArrowUpward, ArrowDownward, Logout, Close,
    Security, Help, Lock, Email as EmailIcon,
    Visibility, VisibilityOff, AccountBalanceWallet, CreditCard,
    QrCodeScanner, Schedule, Notes, LocalAtm, SwapHoriz,
    AccountCircle, Badge, Cake, Public, Map, Phone, LocationOn,
    Flag, Wc, BusinessCenter, Fingerprint
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
    fontWeight: 600,
    '&:hover': {
        background: 'linear-gradient(135deg, #1A3B5E 0%, #2A4B7E 100%)',
    }
}));

// ==================== HARDCODED USER DATA WITH 70+ TRANSACTIONS ====================
const supportEmail = 'consultingzetax@gmail.com';

// Function to generate 70+ transactions from 2023 to present
const generateHistoricalTransactions = (userEmail, startingBalance, userType = 'regular') => {
    const transactions = [];
    let currentBalance = startingBalance;
    let transactionId = 1;
    
    const categories = {
        credit: ['SALARY', 'INVESTMENT', 'DIVIDEND', 'REFUND', 'BONUS', 'ROYALTIES', 'SPONSORSHIP', 'SALES', 'INCOME', 'ENDORSEMENT'],
        debit: ['SHOPPING', 'DINING', 'BILLS', 'RENT', 'TRANSPORT', 'ENTERTAINMENT', 'HEALTHCARE', 'EDUCATION', 'TRAVEL', 'INSURANCE']
    };
    
    const merchants = {
        SALARY: ['Employer Inc.', 'Company Salary', 'Payroll Deposit'],
        SHOPPING: ['Amazon', 'Walmart', 'Target', 'Best Buy', 'eBay'],
        DINING: ['Starbucks', 'McDonalds', 'DoorDash', 'UberEats', 'Local Restaurant'],
        BILLS: ['Electric Bill', 'Water Bill', 'Internet Bill', 'Phone Bill'],
        INVESTMENT: ['Stock Dividend', 'Crypto Gain', 'Real Estate ROI'],
        RENT: ['Monthly Rent', 'Property Lease'],
        TRANSPORT: ['Uber', 'Lyft', 'Gas Station', 'Public Transit'],
        ENTERTAINMENT: ['Netflix', 'Spotify', 'Disney+', 'Movie Theater'],
        HEALTHCARE: ['Pharmacy', 'Doctor Visit', 'Dental Care'],
        TRAVEL: ['Flight Ticket', 'Hotel Booking', 'Vacation Package']
    };
    
    // Generate dates from Jan 2023 to May 2026
    const startDate = new Date(2023, 0, 1);
    const endDate = new Date(2026, 4, 15);
    const dates = [];
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + Math.floor(Math.random() * 3) + 1)) {
        dates.push(new Date(d));
    }
    
    // Sort dates
    dates.sort((a, b) => a - b);
    
    // Take up to 75 transactions
    const numTransactions = Math.min(75, dates.length);
    
    for (let i = 0; i < numTransactions; i++) {
        const date = dates[i];
        const isCredit = Math.random() > 0.6; // 40% debit, 60% credit for most users
        let amount, category, merchant;
        
        if (isCredit) {
            category = categories.credit[Math.floor(Math.random() * categories.credit.length)];
            amount = Math.floor(Math.random() * 50000) + 1000;
            merchant = merchants[category] ? merchants[category][0] : `${category} Payment`;
            currentBalance += amount;
        } else {
            category = categories.debit[Math.floor(Math.random() * categories.debit.length)];
            amount = Math.floor(Math.random() * 3000) + 50;
            merchant = merchants[category] ? merchants[category][Math.floor(Math.random() * merchants[category].length)] : `${category} Purchase`;
            currentBalance -= amount;
        }
        
        // Special handling for Baron Quinn (vendor/business account)
        if (userEmail === 'baronquin500@gmail.com') {
            if (category === 'SALES' || category === 'INCOME') {
                amount = Math.floor(Math.random() * 15000) + 2000;
                merchant = ['Market Sales', 'Product Wholesale', 'Customer Payment', 'Vendor Income'][Math.floor(Math.random() * 4)];
                currentBalance += amount;
            } else if (category === 'SHOPPING' || category === 'BILLS') {
                amount = Math.floor(Math.random() * 5000) + 100;
                merchant = ['Inventory Purchase', 'Booth Rental', 'Equipment', 'Supplies'][Math.floor(Math.random() * 4)];
                currentBalance -= amount;
            }
        }
        
        transactions.push({
            id: transactionId++,
            name: merchant,
            amount: amount,
            type: isCredit ? 'received' : 'sent',
            category: category,
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: `${Math.floor(Math.random() * 12) + 1}:${Math.random() > 0.5 ? '30' : '00'} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
            status: 'completed'
        });
    }
    
    return { transactions, finalBalance: currentBalance };
};

const usersData = {
    // CAITLIN CLARK - DISABLED ACCOUNT
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
        transactions: generateHistoricalTransactions('caitlinelizabeth200@gmail.com', 10000000, 'sports').transactions
    },
    // DOLLY PARTON - FULLY ACTIVE
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
        billingMessage: null,
        transactions: generateHistoricalTransactions('dollyrparton945@gmail.com', 500000, 'entertainment').transactions
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
        transactions: generateHistoricalTransactions('powelleva08@gmail.com', 25000000, 'fashion').transactions
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
        billingMessage: 'Your account has had limited transaction activity from 2024 to 2025. Because of the low number of transactions during this period, your account is currently under review.',
        transactions: generateHistoricalTransactions('johnmarkey195@gmail.com', 800567.27, 'engineering').transactions
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
        transactions: generateHistoricalTransactions('kimmirandajessica@gmail.com', 700000, 'regular').transactions
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
        transactions: generateHistoricalTransactions('pablowrld01@gmail.com', 100000000, 'business').transactions
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
        memberSince: 'May 2026',
        creditScore: 750,
        pin: '1122',
        cardDesign: 'platinum',
        cardType: 'credit',
        cardLimit: 50000,
        billingMessage: 'Please complete your payment to be able to withdraw your funds',
        transactions: generateHistoricalTransactions('adambeach001@gmail.com', 100000, 'entertainment').transactions
    },
    // BARON QUINN - FULLY ACTIVE WITH 70+ TRANSACTIONS
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
        memberSince: 'May 2026',
        creditScore: 720,
        pin: '5000',
        cardDesign: 'gold',
        cardType: 'credit',
        cardLimit: 100000,
        billingMessage: null,
        transactions: (() => {
            const { transactions, finalBalance } = generateHistoricalTransactions('baronquin500@gmail.com', 500000, 'vendor');
            // Add specific vendor transactions
            const vendorSpecific = [
                { id: 100, name: 'Market Sales - Weekend Market', amount: 12500, type: 'received', category: 'SALES', date: 'May 15, 2026', time: '06:30 PM', status: 'completed' },
                { id: 101, name: 'Inventory Purchase - Wholesale', amount: 3800, type: 'sent', category: 'BUSINESS', date: 'May 14, 2026', time: '10:15 AM', status: 'completed' },
                { id: 102, name: 'Booth Rental - Monthly', amount: 1500, type: 'sent', category: 'RENT', date: 'May 12, 2026', time: '09:00 AM', status: 'completed' },
                { id: 103, name: 'Customer Payment - Bulk Order', amount: 25000, type: 'received', category: 'SALES', date: 'May 10, 2026', time: '02:45 PM', status: 'completed' },
                { id: 104, name: 'Equipment Purchase - POS System', amount: 1200, type: 'sent', category: 'EQUIPMENT', date: 'May 8, 2026', time: '11:20 AM', status: 'completed' }
            ];
            return [...vendorSpecific, ...transactions.slice(0, 70)];
        })()
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
    const hardcodedUser = usersData[userEmail];
    const hasBillingMessage = !!hardcodedUser?.billingMessage;
    const isHardcoded = !!usersData[userEmail];
    const isMoneyMavenUser = userEmail === 'adambeach001@gmail.com';

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

    // Transfer form states (ENHANCED)
    const [recipientAccount, setRecipientAccount] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [recipientBank, setRecipientBank] = useState('');
    const [amount, setAmount] = useState('');
    const [transferPurpose, setTransferPurpose] = useState('');
    const [transferType, setTransferType] = useState('interac');
    const [transferStep, setTransferStep] = useState(0);
    const [depositAmount, setDepositAmount] = useState('');
    const [showCVV, setShowCVV] = useState(false);
    const [scheduledDate, setScheduledDate] = useState('');
    const [addNote, setAddNote] = useState('');
    const [saveRecipient, setSaveRecipient] = useState(false);

    const user = hardcodedUser || {
        ...defaultUser,
        email: userEmail,
        firstName: currentUser?.displayName?.split(' ')[0] || 'User',
        lastName: currentUser?.displayName?.split(' ')[1] || '',
        fullName: currentUser?.displayName || 'User',
    };

    const issuedCard = {
        cardholderName: user.fullName,
        maskedNumber: userEmail === 'caitlinelizabeth200@gmail.com' ? '**** **** **** 2002' :
                       userEmail === 'dollyrparton945@gmail.com' ? '**** **** **** 9643' :
                       userEmail === 'powelleva08@gmail.com' ? '**** **** **** 3690' :
                       userEmail === 'johnmarkey195@gmail.com' ? '**** **** **** 3500' :
                       userEmail === 'kimmirandajessica@gmail.com' ? '**** **** **** 1209' :
                       userEmail === 'pablowrld01@gmail.com' ? '**** **** **** 1984' :
                       userEmail === 'adambeach001@gmail.com' ? '**** **** **** 1122' :
                       userEmail === 'baronquin500@gmail.com' ? '**** **** **** 5000' :
                       '**** **** **** 0000',
        expiryDate: '12/27',
        cvv: Math.floor(Math.random() * 900 + 100).toString(),
        cardDesign: user.cardDesign,
        cardType: user.cardType,
        limit: user.cardLimit
    };

    // Dynamic bank name with premium font styling and logo
    const bankDisplayName = isMoneyMavenUser ? 'MONEY MAVEN INVESTMENT BANK' : 'QuinCore Bank';

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

    // FIRESTORE PERSISTENCE FUNCTIONS
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
                // Initialize Firestore with hardcoded user data
                await setDoc(userDocRef, {
                    email: userEmail,
                    balance: hardcodedUser.balance,
                    transactions: hardcodedUser.transactions,
                    lastUpdated: serverTimestamp(),
                    userData: {
                        firstName: hardcodedUser.firstName,
                        lastName: hardcodedUser.lastName,
                        fullName: hardcodedUser.fullName,
                        phone: hardcodedUser.phone,
                        address: hardcodedUser.address,
                        country: hardcodedUser.country,
                        state: hardcodedUser.state,
                        city: hardcodedUser.city,
                        dateOfBirth: hardcodedUser.dateOfBirth,
                        occupation: hardcodedUser.occupation,
                        gender: hardcodedUser.gender,
                        accountType: hardcodedUser.accountType,
                        creditScore: hardcodedUser.creditScore,
                        pin: hardcodedUser.pin,
                        cardDesign: hardcodedUser.cardDesign,
                        cardType: hardcodedUser.cardType,
                        cardLimit: hardcodedUser.cardLimit,
                        billingMessage: hardcodedUser.billingMessage || null
                    }
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
            note: addNote || transferPurpose || 'Money transfer',
            recipient: recipientAccount,
            bank: recipientBank || 'QuinCore Bank'
        };
        
        const updatedTransactions = [newTransaction, ...transactions];
        setBalance(newBalance);
        setTransactions(updatedTransactions);
        await saveToFirestore(newBalance, updatedTransactions);
        
        showMessage(`✅ Successfully sent ${formatCurrency(transferAmount)} to ${recipientName || recipientAccount}`, 'success');
        setSendModal(false);
        resetTransferForm();
        setTransferStep(0);
    };

    const resetTransferForm = () => {
        setRecipientAccount('');
        setRecipientName('');
        setRecipientBank('');
        setAmount('');
        setTransferPurpose('');
        setAddNote('');
        setScheduledDate('');
        setSaveRecipient(false);
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

    const transferSteps = ['Recipient', 'Amount', 'Details', 'Confirm'];

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
                   user.email === 'adambeach001@gmail.com' ? [2000, 1500, 1800, 2200, 1600, 1900] :
                   user.email === 'baronquin500@gmail.com' ? [1500, 2000, 1800, 2500, 2200, 2800] :
                   [12000, 19000, 15000, 22000, 18000, 24000],
            borderColor: '#D4AF37',
            backgroundColor: 'rgba(212,175,55,0.1)',
            tension: 0.4
        }]
    };

    const categoryData = {
        labels: ['Income', 'Business', 'Shopping', 'Bills', 'Transport'],
        datasets: [{
            data: user.email === 'baronquin500@gmail.com' ? [45, 25, 15, 10, 5] : [40, 20, 15, 15, 10],
            backgroundColor: ['#D4AF37', '#0A1E3F', '#1A3B5E', '#2A4B7E', '#3A5B9E']
        }]
    };

    const monthlyData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
            {
                label: 'Income',
                data: user.email === 'baronquin500@gmail.com' ? [25000, 18000, 22000, 30000] : [85000, 92000, 88000, 95000],
                backgroundColor: '#4CAF50',
            },
            {
                label: 'Expenses',
                data: user.email === 'baronquin500@gmail.com' ? [5000, 6000, 4500, 7000] : [62000, 68000, 64000, 71000],
                backgroundColor: '#f44336',
            }
        ]
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress sx={{ color: '#D4AF37' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: '#F5F8FF', minHeight: '100vh', pb: 7 }}>
            {/* Top Header - PREMIUM FONT STYLING WITH LOGO */}
            <AppBar position="static" sx={{ 
                bgcolor: 'white', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                borderBottomLeftRadius: '24px',
                borderBottomRightRadius: '24px'
            }}>
                <Toolbar sx={{ justifyContent: 'space-between', py: 1, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        {/* Bank Logo Icon */}
                        <Avatar sx={{ 
                            bgcolor: 'transparent',
                            background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                            width: 48, 
                            height: 48,
                            boxShadow: '0 4px 12px rgba(212,175,55,0.3)'
                        }}>
                            <AccountBalanceWallet sx={{ color: '#0A1E3F', fontSize: 28 }} />
                        </Avatar>
                        
                        <Typography 
                            variant="h4" 
                            sx={{ 
                                fontWeight: 800,
                                fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.4rem' },
                                letterSpacing: '2px',
                                background: 'linear-gradient(135deg, #0A1E3F 0%, #D4AF37 40%, #FFD700 60%, #0A1E3F 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontFamily: '"Playfair Display", "Georgia", "Times New Roman", serif',
                                textShadow: '2px 2px 4px rgba(0,0,0,0.05)',
                                '&:hover': {
                                    letterSpacing: '3px',
                                    transition: 'all 0.3s ease'
                                }
                            }}
                        >
                            {bankDisplayName}
                        </Typography>
                        
                        <BankOwnerBadge>
                            <Security sx={{ fontSize: 16 }} />
                            {isMoneyMavenUser ? 'Investment Division' : 'Elite Banking'}
                        </BankOwnerBadge>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton><Notifications sx={{ color: '#0A1E3F' }} /></IconButton>
                        <IconButton onClick={handleLogout}><Logout sx={{ color: '#dc004e' }} /></IconButton>
                        <IconButton onClick={() => setProfileModal(true)}>
                            <Avatar sx={{ bgcolor: '#D4AF37', color: '#0A1E3F' }}>{user.firstName?.charAt(0) || 'U'}</Avatar>
                        </IconButton>
                    </Box>
                </Toolbar>
                
                {/* Welcome Subtext */}
                <Box sx={{ px: 3, pb: 2 }}>
                    <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                        Welcome back to elite banking, {user.firstName}
                    </Typography>
                </Box>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
                {/* Welcome Section */}
                <Paper sx={{ p: 3, mb: 3, bgcolor: '#0A1E3F', color: 'white', borderRadius: '20px' }}>
                    <Typography variant="h4" sx={{ fontFamily: '"Playfair Display", serif' }}>Welcome back, {user.firstName}!</Typography>
                    <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>{user.email}</Typography>
                    <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>Account Number: {
                        user.email === 'caitlinelizabeth200@gmail.com' ? 'CC20262002' :
                        user.email === 'dollyrparton945@gmail.com' ? 'DP19469643' :
                        user.email === 'powelleva08@gmail.com' ? 'PN369036' :
                        user.email === 'johnmarkey195@gmail.com' ? 'JM350000' :
                        user.email === 'kimmirandajessica@gmail.com' ? 'MJ1209' :
                        user.email === 'pablowrld01@gmail.com' ? 'OJ1984' :
                        user.email === 'adambeach001@gmail.com' ? 'RB1122' :
                        user.email === 'baronquin500@gmail.com' ? 'BQ5000' :
                        'DEMO0000'
                    }</Typography>
                    
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
                    <Tab label="Analytics" />
                    <Tab label="History" />
                    <Tab label="Profile" />
                </Tabs>

                {/* DASHBOARD TAB */}
                {tabValue === 0 && (
                    <>
                        <BalanceCard elevation={3}>
                            <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>TOTAL BALANCE ({user.currency})</Typography>
                            <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>{formatCurrency(balance)}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Chip icon={<ArrowUpward sx={{ fontSize: 16 }} />} label="+4.8% this month" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>{user.accountType} Account</Typography>
                            </Box>
                        </BalanceCard>

                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={3}>
                                <ActionButton fullWidth onClick={() => setSendModal(true)}>
                                    <Send sx={{ color: '#D4AF37', fontSize: 24 }} />
                                    <Typography variant="caption">SEND</Typography>
                                </ActionButton>
                            </Grid>
                            <Grid item xs={3}>
                                <ActionButton fullWidth onClick={() => setRequestModal(true)}>
                                    <RequestPage sx={{ color: '#D4AF37', fontSize: 24 }} />
                                    <Typography variant="caption">REQUEST</Typography>
                                </ActionButton>
                            </Grid>
                            <Grid item xs={3}>
                                <ActionButton fullWidth onClick={() => setPayBillsModal(true)}>
                                    <Payment sx={{ color: '#D4AF37', fontSize: 24 }} />
                                    <Typography variant="caption">PAY BILLS</Typography>
                                </ActionButton>
                            </Grid>
                            <Grid item xs={3}>
                                <ActionButton fullWidth onClick={() => setTopUpModal(true)}>
                                    <AddCard sx={{ color: '#D4AF37', fontSize: 24 }} />
                                    <Typography variant="caption">TOP UP</Typography>
                                </ActionButton>
                            </Grid>
                        </Grid>

                        {/* Virtual Card */}
                        <Paper sx={{ p: 3, borderRadius: '20px', mb: 3, background: user.cardDesign === 'gold' ? 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)' : 'linear-gradient(135deg, #1A1A1A 0%, #0A0A0A 100%)', color: user.cardDesign === 'gold' ? '#000000' : 'white' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="caption" sx={{ letterSpacing: 2, opacity: 0.7 }}>{user.cardDesign?.toUpperCase()} CREDIT CARD</Typography>
                                <CreditCard sx={{ fontSize: 32, opacity: 0.7 }} />
                            </Box>
                            <Typography variant="h5" sx={{ fontFamily: 'monospace', letterSpacing: 2, mt: 2 }}>{issuedCard.maskedNumber}</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                <Box>
                                    <Typography variant="caption" sx={{ opacity: 0.7 }}>Cardholder</Typography>
                                    <Typography sx={{ fontWeight: 500 }}>{issuedCard.cardholderName}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ opacity: 0.7 }}>Expires</Typography>
                                    <Typography sx={{ fontWeight: 500 }}>{issuedCard.expiryDate}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ opacity: 0.7 }}>CVV</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Typography sx={{ fontWeight: 500 }}>{showCVV ? issuedCard.cvv : '***'}</Typography>
                                        <IconButton size="small" onClick={() => setShowCVV(!showCVV)}>
                                            <Visibility sx={{ fontSize: 14, color: user.cardDesign === 'gold' ? '#000' : 'white' }} />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </Box>
                            <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${user.cardDesign === 'gold' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)'}` }}>
                                <Typography variant="caption" sx={{ opacity: 0.7 }}>Card Limit</Typography>
                                <Typography sx={{ fontWeight: 600 }}>{formatCurrency(issuedCard.limit)}</Typography>
                            </Box>
                        </Paper>

                        {/* Charts Row */}
                        <Grid container spacing={3} sx={{ mb: 3 }}>
                            <Grid item xs={12} md={8}>
                                <Paper sx={{ p: 3, borderRadius: '20px' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#0A1E3F' }}>Spending Trend ({user.currency})</Typography>
                                    <Line data={spendingData} options={{ responsive: true }} />
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Paper sx={{ p: 3, borderRadius: '20px' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#0A1E3F' }}>Spending by Category</Typography>
                                    <Pie data={categoryData} options={{ responsive: true }} />
                                </Paper>
                            </Grid>
                        </Grid>

                        {/* Recent Activity */}
                        <Paper sx={{ p: 3, borderRadius: '20px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0A1E3F' }}>Recent Activity</Typography>
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
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#0A1E3F' }}>Income vs Expenses ({user.currency})</Typography>
                                <Bar data={monthlyData} options={{ responsive: true }} />
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3, borderRadius: '20px' }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#0A1E3F' }}>Key Metrics</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Monthly Savings Rate</Typography>
                                        <Typography variant="h4" sx={{ color: '#D4AF37' }}>38%</Typography>
                                        <LinearProgress variant="determinate" value={38} sx={{ mt: 1, height: 8, borderRadius: 4, bgcolor: '#E0E0E0', '& .MuiLinearProgress-bar': { bgcolor: '#D4AF37' } }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Credit Score</Typography>
                                        <Typography variant="h4">{user.creditScore || 720}</Typography>
                                        <LinearProgress variant="determinate" value={(user.creditScore || 720) / 10} sx={{ mt: 1, height: 8, borderRadius: 4, bgcolor: '#E0E0E0', '& .MuiLinearProgress-bar': { bgcolor: '#D4AF37' } }} />
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3, borderRadius: '20px' }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#0A1E3F' }}>Top Categories</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography>Vendor Sales</Typography>
                                        <Typography fontWeight={600} color="#D4AF37">{formatCurrency(25000)}</Typography>
                                    </Box>
                                    <Divider />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography>Inventory Purchase</Typography>
                                        <Typography fontWeight={600} color="#FF3B3B">{formatCurrency(3800)}</Typography>
                                    </Box>
                                    <Divider />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography>Booth Rental</Typography>
                                        <Typography fontWeight={600} color="#FF3B3B">{formatCurrency(1500)}</Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                )}

                {/* HISTORY TAB */}
                {tabValue === 2 && (
                    <Paper sx={{ p: 3, borderRadius: '20px' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#0A1E3F' }}>Transaction History ({transactions.length} transactions)</Typography>
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
                                    {transactions.slice().reverse().map((t) => (
                                        <TableRow key={t.id}>
                                            <TableCell>
                                                <Typography variant="body2">{t.date}</Typography>
                                                <Typography variant="caption" color="text.secondary">{t.time}</Typography>
                                            </TableCell>
                                            <TableCell>{t.name}</TableCell>
                                            <TableCell><Chip label={t.category} size="small" sx={{ bgcolor: '#D4AF37', color: '#0A1E3F' }} /></TableCell>
                                            <TableCell><Chip label={t.status || 'completed'} size="small" sx={{ bgcolor: '#E8F5E9', color: '#4CAF50' }} /></TableCell>
                                            <TableCell align="right">
                                                <Typography sx={{ fontWeight: 600, color: t.amount > 0 ? '#00A86B' : '#FF3B3B' }}>
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
                                    <Avatar sx={{ width: 120, height: 120, mx: 'auto', mb: 2, bgcolor: '#D4AF37', color: '#0A1E3F', fontSize: '3rem' }}>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</Avatar>
                                    <Typography variant="h5" sx={{ fontWeight: 600 }}>{user.fullName}</Typography>
                                    <Typography color="text.secondary" gutterBottom>@{user.username}</Typography>
                                    <Chip label={user.accountType} sx={{ mt: 1, bgcolor: '#D4AF37', color: '#0A1E3F' }} />
                                </Box>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><EmailIcon sx={{ color: '#D4AF37' }} /><Typography variant="body2">{user.email}</Typography></Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><Phone sx={{ color: '#D4AF37' }} /><Typography variant="body2">{user.phone || 'Not set'}</Typography></Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><LocationOn sx={{ color: '#D4AF37' }} /><Typography variant="body2">{user.address || 'Not set'}</Typography></Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><Cake sx={{ color: '#D4AF37' }} /><Typography variant="body2">{user.dateOfBirth}</Typography></Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><Flag sx={{ color: '#D4AF37' }} /><Typography variant="body2">{user.country}, {user.state}</Typography></Box>
                                </Box>
                            </ProfileCard>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <ProfileCard>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#0A1E3F' }}>Account Details</Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={6}><Typography variant="body2" color="text.secondary">Account Number</Typography><Typography variant="h6" sx={{ color: '#D4AF37' }}>BQ5000</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="body2" color="text.secondary">Member Since</Typography><Typography variant="h6">{user.memberSince}</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="body2" color="text.secondary">PIN Code</Typography><Typography variant="h6">••••</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="body2" color="text.secondary">Credit Score</Typography><Typography variant="h6">{user.creditScore || 720}</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="body2" color="text.secondary">Account Balance</Typography><Typography variant="h6">{formatCurrency(balance)}</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="body2" color="text.secondary">Account Type</Typography><Typography variant="h6">{user.accountType}</Typography></Grid>
                                </Grid>
                                <Divider sx={{ my: 3 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#0A1E3F' }}>Edit Profile</Typography>
                                    <Button onClick={() => setEditMode(!editMode)} startIcon={<Edit />}>{editMode ? 'Cancel' : 'Edit'}</Button>
                                </Box>
                                {editMode ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <TextField fullWidth label="Full Name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                                        <TextField fullWidth label="Phone Number" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                                        <TextField fullWidth label="Address" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} multiline rows={2} />
                                        <GoldButton onClick={updateProfile}>Save Changes</GoldButton>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box><Typography variant="caption" color="text.secondary">Full Name</Typography><Typography>{user.fullName}</Typography></Box>
                                        <Box><Typography variant="caption" color="text.secondary">Phone Number</Typography><Typography>{user.phone || 'Not set'}</Typography></Box>
                                        <Box><Typography variant="caption" color="text.secondary">Address</Typography><Typography>{user.address || 'Not set'}</Typography></Box>
                                    </Box>
                                )}
                                <Divider sx={{ my: 3 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#0A1E3F' }}>Security Settings</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><Fingerprint sx={{ color: '#D4AF37' }} /><Box><Typography>Two-Factor Authentication</Typography><Typography variant="caption" color="text.secondary">Protect your account with 2FA</Typography></Box></Box>
                                        <Button variant="outlined" size="small" sx={{ borderColor: '#D4AF37', color: '#D4AF37' }}>Enable</Button>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><Lock sx={{ color: '#D4AF37' }} /><Box><Typography>Change PIN</Typography><Typography variant="caption" color="text.secondary">Update your PIN</Typography></Box></Box>
                                        <Button variant="outlined" size="small" sx={{ borderColor: '#D4AF37', color: '#D4AF37' }}>Update</Button>
                                    </Box>
                                </Box>
                            </ProfileCard>
                        </Grid>
                    </Grid>
                )}
            </Container>

            {/* ENHANCED SEND MONEY MODAL */}
            <Modal open={sendModal} onClose={() => { setSendModal(false); setTransferStep(0); resetTransferForm(); }} closeAfterTransition BackdropComponent={Backdrop}>
                <Fade in={sendModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: { xs: '90%', sm: 500 }, maxHeight: '90vh', overflow: 'auto' }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => { setSendModal(false); setTransferStep(0); resetTransferForm(); }}><Close /></IconButton>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#0A1E3F', fontFamily: '"Playfair Display", serif' }}>Send Money</Typography>
                        
                        <Stepper activeStep={transferStep} sx={{ mb: 4 }}>
                            {transferSteps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                        </Stepper>
                        
                        {/* Step 0: Recipient Info */}
                        {transferStep === 0 && (
                            <>
                                <TextField fullWidth label="Recipient Account Number or Email" value={recipientAccount} onChange={(e) => setRecipientAccount(e.target.value)} sx={{ mb: 2 }} placeholder="Enter account number or email address" />
                                <TextField fullWidth label="Recipient Full Name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} sx={{ mb: 2 }} placeholder="Enter recipient's full name" />
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Recipient's Bank</InputLabel>
                                    <Select value={recipientBank} onChange={(e) => setRecipientBank(e.target.value)}>
                                        <MenuItem value="QuinCore Bank">QuinCore Bank</MenuItem>
                                        <MenuItem value="Money Maven Investment Bank">Money Maven Investment Bank</MenuItem>
                                        <MenuItem value="Other Bank">Other Bank</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControlLabel control={<Checkbox checked={saveRecipient} onChange={(e) => setSaveRecipient(e.target.checked)} />} label="Save this recipient for future transfers" />
                                <GoldButton fullWidth onClick={() => setTransferStep(1)}>Continue</GoldButton>
                            </>
                        )}
                        
                        {/* Step 1: Amount & Purpose */}
                        {transferStep === 1 && (
                            <>
                                <TextField fullWidth label={`Amount (${user.currency})`} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start">{user.currencySymbol || '$'}</InputAdornment> }} placeholder="0.00" />
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Transfer Purpose</InputLabel>
                                    <Select value={transferPurpose} onChange={(e) => setTransferPurpose(e.target.value)}>
                                        <MenuItem value="Goods/Services">Goods/Services</MenuItem>
                                        <MenuItem value="Gift">Gift</MenuItem>
                                        <MenuItem value="Family Support">Family Support</MenuItem>
                                        <MenuItem value="Rent Payment">Rent Payment</MenuItem>
                                        <MenuItem value="Salary">Salary</MenuItem>
                                        <MenuItem value="Loan Repayment">Loan Repayment</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField fullWidth label="Add a Note (Optional)" value={addNote} onChange={(e) => setAddNote(e.target.value)} sx={{ mb: 2 }} placeholder="Add a reference message" multiline rows={2} />
                                <TextField fullWidth label="Schedule Transfer (Optional)" type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button variant="outlined" onClick={() => setTransferStep(0)}>Back</Button>
                                    <GoldButton onClick={() => setTransferStep(2)}>Continue</GoldButton>
                                </Box>
                            </>
                        )}
                        
                        {/* Step 2: Review Details */}
                        {transferStep === 2 && (
                            <>
                                <Paper sx={{ p: 3, bgcolor: '#F5F7FA', borderRadius: '16px', mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ color: '#D4AF37', mb: 1 }}>TRANSFER DETAILS</Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="body2" color="text.secondary">To:</Typography><Typography fontWeight={500}>{recipientName || recipientAccount}</Typography></Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="body2" color="text.secondary">Bank:</Typography><Typography fontWeight={500}>{recipientBank || 'QuinCore Bank'}</Typography></Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="body2" color="text.secondary">Amount:</Typography><Typography fontWeight={700} sx={{ color: '#D4AF37' }}>{formatCurrency(parseFloat(amount) || 0)}</Typography></Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="body2" color="text.secondary">Purpose:</Typography><Typography fontWeight={500}>{transferPurpose || 'Not specified'}</Typography></Box>
                                    {addNote && <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="body2" color="text.secondary">Note:</Typography><Typography fontWeight={500}>{addNote}</Typography></Box>}
                                    {scheduledDate && <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="body2" color="text.secondary">Scheduled:</Typography><Typography fontWeight={500}>{scheduledDate}</Typography></Box>}
                                    <Divider sx={{ my: 2 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" color="text.secondary">Fee:</Typography><Typography fontWeight={500}>{formatCurrency(0)}</Typography></Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}><Typography variant="body2" color="text.secondary">Total:</Typography><Typography fontWeight={700} sx={{ color: '#D4AF37' }}>{formatCurrency(parseFloat(amount) || 0)}</Typography></Box>
                                </Paper>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button variant="outlined" onClick={() => setTransferStep(1)}>Back</Button>
                                    <GoldButton onClick={() => setTransferStep(3)}>Review Transfer</GoldButton>
                                </Box>
                            </>
                        )}
                        
                        {/* Step 3: Confirm */}
                        {transferStep === 3 && (
                            <>
                                <Paper sx={{ p: 3, bgcolor: '#FFF9E6', borderRadius: '16px', mb: 2, textAlign: 'center' }}>
                                    <Security sx={{ fontSize: 48, color: '#D4AF37', mb: 1 }} />
                                    <Typography variant="h6" sx={{ color: '#0A1E3F', mb: 1 }}>Confirm Transfer</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Please verify the details below before confirming</Typography>
                                    <Box sx={{ textAlign: 'left', bgcolor: 'white', p: 2, borderRadius: '12px' }}>
                                        <Typography variant="body2"><strong>To:</strong> {recipientName || recipientAccount}</Typography>
                                        <Typography variant="body2"><strong>Amount:</strong> {formatCurrency(parseFloat(amount) || 0)}</Typography>
                                    </Box>
                                </Paper>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button variant="outlined" onClick={() => setTransferStep(2)}>Back</Button>
                                    <GoldButton onClick={handleSendMoney}>Confirm & Send</GoldButton>
                                </Box>
                            </>
                        )}
                    </Box>
                </Fade>
            </Modal>

            {/* REQUEST MODAL */}
            <Modal open={requestModal} onClose={() => { setRequestModal(false); resetTransferForm(); }} closeAfterTransition BackdropComponent={Backdrop}>
                <Fade in={requestModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: { xs: '90%', sm: 450 } }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => { setRequestModal(false); resetTransferForm(); }}><Close /></IconButton>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#0A1E3F', fontFamily: '"Playfair Display", serif' }}>Request Money</Typography>
                        <TextField fullWidth label="From (Email/Account)" value={recipientAccount} onChange={(e) => setRecipientAccount(e.target.value)} sx={{ mb: 2 }} />
                        <TextField fullWidth label={`Amount (${user.currency})`} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start">{user.currencySymbol || '$'}</InputAdornment> }} />
                        <GoldButton fullWidth onClick={handleRequestMoney}>Send Request</GoldButton>
                    </Box>
                </Fade>
            </Modal>

            {/* PAY BILLS MODAL */}
            <Modal open={payBillsModal} onClose={() => setPayBillsModal(false)} closeAfterTransition BackdropComponent={Backdrop}>
                <Fade in={payBillsModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: { xs: '90%', sm: 450 } }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setPayBillsModal(false)}><Close /></IconButton>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#0A1E3F', fontFamily: '"Playfair Display", serif' }}>Pay Bills</Typography>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Bill Type</InputLabel>
                            <Select value={transferPurpose} onChange={(e) => setTransferPurpose(e.target.value)}>
                                <MenuItem value="Electricity">⚡ Electricity</MenuItem>
                                <MenuItem value="Water">💧 Water</MenuItem>
                                <MenuItem value="Internet">🌐 Internet</MenuItem>
                                <MenuItem value="Phone">📱 Phone</MenuItem>
                                <MenuItem value="Credit Card">💳 Credit Card</MenuItem>
                                <MenuItem value="Mortgage">🏠 Mortgage</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField fullWidth label={`Amount (${user.currency})`} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start">{user.currencySymbol || '$'}</InputAdornment> }} />
                        <GoldButton fullWidth onClick={handlePayBill}>Pay Bill</GoldButton>
                    </Box>
                </Fade>
            </Modal>

            {/* TOP UP MODAL */}
            <Modal open={topUpModal} onClose={() => setTopUpModal(false)} closeAfterTransition BackdropComponent={Backdrop}>
                <Fade in={topUpModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: { xs: '90%', sm: 450 } }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setTopUpModal(false)}><Close /></IconButton>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#0A1E3F', fontFamily: '"Playfair Display", serif' }}>Top Up Account</Typography>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Payment Method</InputLabel>
                            <Select value={transferType} onChange={(e) => setTransferType(e.target.value)}>
                                <MenuItem value="bank">🏦 Bank Transfer</MenuItem>
                                <MenuItem value="card">💳 Credit/Debit Card</MenuItem>
                                <MenuItem value="crypto">₿ Cryptocurrency</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField fullWidth label={`Amount (${user.currency})`} type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start">{user.currencySymbol || '$'}</InputAdornment> }} />
                        <GoldButton fullWidth onClick={handleDeposit}>Add Money</GoldButton>
                    </Box>
                </Fade>
            </Modal>

            {/* PROFILE QUICK MODAL */}
            <Modal open={profileModal} onClose={() => setProfileModal(false)} closeAfterTransition BackdropComponent={Backdrop}>
                <Fade in={profileModal}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: '24px', p: 4, width: { xs: '90%', sm: 350 }, textAlign: 'center' }}>
                        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setProfileModal(false)}><Close /></IconButton>
                        <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: '#D4AF37', color: '#0A1E3F' }}>{user.firstName?.charAt(0)}</Avatar>
                        <Typography variant="h6">{user.fullName}</Typography>
                        <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body2"><strong>Balance:</strong> {formatCurrency(balance)}</Typography>
                        <Typography variant="body2"><strong>Country:</strong> {user.country}</Typography>
                        {hasBillingMessage && <Chip label="Account Disabled" size="small" sx={{ mt: 2, bgcolor: '#dc004e', color: 'white' }} />}
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

// Import Checkbox if not already imported
import { Checkbox } from '@mui/material';

export default Dashboard;