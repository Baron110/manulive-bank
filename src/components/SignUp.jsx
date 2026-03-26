import React, { useState } from 'react';
import {
    Container, Paper, TextField, Button, Typography, Box,
    Avatar, Grid, Link, InputAdornment, IconButton,
    Checkbox, FormControlLabel, Alert, Fade, Stepper, Step,
    StepLabel, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    PersonAdd, Email, Lock, Visibility, VisibilityOff,
    Badge, CalendarToday, Phone, CheckCircle,
    ArrowForward, ArrowBack, Security, Public, AttachMoney
} from '@mui/icons-material';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const StyledPaper = styled(Paper)(({ theme }) => ({
    background: 'white',
    borderRadius: '32px',
    padding: theme.spacing(4),
    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
    position: 'relative',
    overflow: 'hidden',
    maxHeight: '90vh',
    overflowY: 'auto',
}));

const GradientButton = styled(Button)(({ theme }) => ({
    background: 'linear-gradient(135deg, #0A1E3F 0%, #1A3B5E 100%)',
    color: 'white',
    padding: '14px',
    borderRadius: '16px',
    textTransform: 'none',
    fontSize: '1rem',
    fontWeight: 600,
    '&:hover': {
        background: 'linear-gradient(135deg, #1A3B5E 0%, #2A4B7E 100%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 20px rgba(10,30,63,0.3)'
    },
    transition: 'all 0.3s ease'
}));

// Country data with currency
const countries = [
    { name: 'Canada', currency: 'CAD', symbol: '$', flag: '🇨🇦' },
    { name: 'USA', currency: 'USD', symbol: '$', flag: '🇺🇸' },
    { name: 'UK', currency: 'GBP', symbol: '£', flag: '🇬🇧' },
    { name: 'Australia', currency: 'AUD', symbol: '$', flag: '🇦🇺' },
    { name: 'Germany', currency: 'EUR', symbol: '€', flag: '🇩🇪' }
];

function SignUp({ onSwitchToLogin }) {
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);

    // Form data - REAL user data
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        dateOfBirth: '',
        country: 'Canada',
        address: '',
        initialDeposit: ''
    });

    const steps = ['Account', 'Personal', 'Deposit', 'Verify'];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateStep = () => {
        if (activeStep === 0) {
            if (!formData.email || !formData.password || !formData.confirmPassword) {
                setError('Please fill all required fields');
                return false;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return false;
            }
            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters');
                return false;
            }
        } else if (activeStep === 1) {
            if (!formData.firstName || !formData.lastName || !formData.phone) {
                setError('Please fill all personal details');
                return false;
            }
        } else if (activeStep === 2) {
            if (!formData.initialDeposit || parseFloat(formData.initialDeposit) <= 0) {
                setError('Please enter a valid deposit amount');
                return false;
            }
        } else if (activeStep === 3) {
            if (!agreeTerms) {
                setError('You must agree to terms and conditions');
                return false;
            }
        }
        setError('');
        return true;
    };

    const handleNext = () => {
        if (validateStep()) setActiveStep(prev => prev + 1);
    };

    const handleBack = () => setActiveStep(prev => prev - 1);

    const generateAccountNumber = () => {
        return 'QC' + Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
    };

    const getSelectedCountry = () => {
        return countries.find(c => c.name === formData.country) || countries[0];
    };

    const generateSampleTransactions = (initialBalance, currencySymbol) => {
        const transactions = [];
        const types = ['deposit', 'sent', 'received', 'bill_payment'];
        const merchants = ['Amazon', 'Netflix', 'Starbucks', 'Uber', 'Apple', 'Spotify', 'McDonald\'s', 'Walmart', 'Costco', 'Tim Hortons'];
        
        // Add 50 sample transactions
        for (let i = 0; i < 50; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const type = types[Math.floor(Math.random() * types.length)];
            const amount = Math.floor(Math.random() * 500) + 10;
            const merchant = merchants[Math.floor(Math.random() * merchants.length)];
            
            if (type === 'deposit') {
                transactions.push({
                    id: Date.now() + i,
                    type: 'deposit',
                    amount: Math.floor(Math.random() * 2000) + 100,
                    date: date.toLocaleDateString(),
                    time: date.toLocaleTimeString(),
                    status: 'completed',
                    description: 'Deposit'
                });
            } else if (type === 'sent') {
                transactions.push({
                    id: Date.now() + i,
                    type: 'sent',
                    amount: amount,
                    to: merchant,
                    date: date.toLocaleDateString(),
                    time: date.toLocaleTimeString(),
                    status: 'completed',
                    description: `Payment to ${merchant}`
                });
            } else if (type === 'received') {
                transactions.push({
                    id: Date.now() + i,
                    type: 'received',
                    amount: amount,
                    from: merchant,
                    date: date.toLocaleDateString(),
                    time: date.toLocaleTimeString(),
                    status: 'completed',
                    description: `Received from ${merchant}`
                });
            } else {
                transactions.push({
                    id: Date.now() + i,
                    type: 'bill_payment',
                    amount: amount,
                    to: merchant + ' Bill',
                    date: date.toLocaleDateString(),
                    time: date.toLocaleTimeString(),
                    status: 'completed',
                    description: `Bill payment to ${merchant}`
                });
            }
        }
        
        // Add welcome deposit at the beginning
        transactions.unshift({
            id: Date.now(),
            type: 'deposit',
            amount: initialBalance,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            status: 'completed',
            description: 'Welcome Deposit'
        });
        
        // Sort by date (newest first)
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        return transactions;
    };

    const handleSubmit = async () => {
        if (!agreeTerms) {
            setError('You must agree to terms and conditions');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            const accountNumber = generateAccountNumber();
            const selectedCountry = getSelectedCountry();
            const initialBalance = parseFloat(formData.initialDeposit);
            
            // Generate transaction history
            const transactions = generateSampleTransactions(initialBalance, selectedCountry.symbol);
            
            // Generate virtual card
            const virtualCard = {
                id: Date.now(),
                cardType: 'debit',
                cardDesign: 'black',
                cardholderName: `${formData.firstName} ${formData.lastName}`,
                maskedNumber: `**** **** **** ${Math.floor(Math.random() * 10000)}`,
                expiryDate: `${new Date().getMonth() + 1}/${new Date().getFullYear() + 3}`,
                cvv: Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
                status: 'active',
                limit: 25000
            };

            // Save to Firebase
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                firstName: formData.firstName,
                lastName: formData.lastName,
                fullName: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                phone: formData.phone,
                dateOfBirth: formData.dateOfBirth,
                country: formData.country,
                currency: selectedCountry.currency,
                currencySymbol: selectedCountry.symbol,
                address: formData.address,
                balance: initialBalance,
                accountNumber: accountNumber,
                accountType: 'Premium',
                createdAt: new Date().toISOString(),
                transactions: transactions,
                issuedCards: [virtualCard],
                cardApplications: []
            });

            setSuccess(`✅ Account created successfully! Welcome to QuinCore Bank! Your account has been funded with ${selectedCountry.symbol}${initialBalance.toLocaleString()} ${selectedCountry.currency}.`);
            
            setTimeout(() => {
                onSwitchToLogin();
            }, 2000);
            
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const selectedCountry = getSelectedCountry();

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center',
            background: 'linear-gradient(135deg, #F5F8FF 0%, #E8F0FE 100%)',
            py: 4
        }}>
            <Container maxWidth="md">
                <Fade in={true} timeout={1000}>
                    <StyledPaper elevation={0}>
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Avatar sx={{ 
                                width: 80, 
                                height: 80, 
                                bgcolor: '#0A1E3F', 
                                margin: '0 auto 16px',
                                boxShadow: '0 8px 20px rgba(10,30,63,0.2)'
                            }}>
                                <PersonAdd sx={{ fontSize: 40 }} />
                            </Avatar>
                            <Typography 
                                variant="h4" 
                                sx={{ 
                                    fontWeight: 700, 
                                    color: '#0A1E3F',
                                    fontFamily: '"Playfair Display", "Georgia", serif',
                                    letterSpacing: '-0.5px'
                                }}
                            >
                                QuinCore Bank
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                                Join the future of global banking
                            </Typography>
                        </Box>

                        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                            {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                        </Stepper>

                        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}
                        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>{success}</Alert>}

                        {/* Step 1: Account Info */}
                        {activeStep === 0 && (
                            <Box>
                                <TextField
                                    fullWidth
                                    name="email"
                                    label="Email Address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    sx={{ mb: 2 }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Email sx={{ color: '#0A1E3F' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    sx={{ mb: 2 }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock sx={{ color: '#0A1E3F' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    name="confirmPassword"
                                    label="Confirm Password"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    sx={{ mb: 2 }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock sx={{ color: '#0A1E3F' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>
                        )}

                        {/* Step 2: Personal Details */}
                        {activeStep === 1 && (
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth name="firstName" label="First Name" value={formData.firstName} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth name="lastName" label="Last Name" value={formData.lastName} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth name="phone" label="Phone Number" value={formData.phone} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth name="dateOfBirth" label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth name="address" label="Full Address" value={formData.address} onChange={handleChange} multiline rows={2} />
                                </Grid>
                            </Grid>
                        )}

                        {/* Step 3: Deposit & Country */}
                        {activeStep === 2 && (
                            <Box>
                                <Paper sx={{ p: 3, bgcolor: '#F8FAFD', borderRadius: '16px', mb: 3 }}>
                                    <Typography variant="h6" sx={{ color: '#0A1E3F', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AttachMoney /> Account Funding
                                    </Typography>
                                    
                                    <FormControl fullWidth sx={{ mb: 3 }}>
                                        <InputLabel>Country</InputLabel>
                                        <Select
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            label="Country"
                                        >
                                            {countries.map(c => (
                                                <MenuItem key={c.name} value={c.name}>{c.flag} {c.name} ({c.currency} {c.symbol})</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    
                                    <TextField
                                        fullWidth
                                        name="initialDeposit"
                                        label={`Initial Deposit Amount (${selectedCountry.symbol}${selectedCountry.currency})`}
                                        type="number"
                                        value={formData.initialDeposit}
                                        onChange={handleChange}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">{selectedCountry.symbol}</InputAdornment>
                                        }}
                                        helperText={`Enter any amount to start your account with ${selectedCountry.symbol}`}
                                    />
                                </Paper>
                                
                                <Alert severity="info" sx={{ borderRadius: '12px' }}>
                                    <Typography variant="body2">Your account will be created with:</Typography>
                                    <ul>
                                        <li>🏦 Country: {selectedCountry.flag} {formData.country}</li>
                                        <li>💵 Currency: {selectedCountry.currency} ({selectedCountry.symbol})</li>
                                        <li>💰 Initial Balance: {selectedCountry.symbol}{formData.initialDeposit || '0'}</li>
                                        <li>💳 Virtual Card: Instant access</li>
                                        <li>📊 50+ Sample Transactions</li>
                                    </ul>
                                </Alert>
                            </Box>
                        )}

                        {/* Step 4: Verify */}
                        {activeStep === 3 && (
                            <Box>
                                <Paper sx={{ p: 3, bgcolor: '#F8FAFD', borderRadius: '16px', mb: 3 }}>
                                    <Typography variant="h6" sx={{ color: '#0A1E3F', mb: 2 }}>
                                        Terms & Conditions
                                    </Typography>
                                    <FormControlLabel
                                        control={
                                            <Checkbox 
                                                checked={agreeTerms}
                                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                                sx={{ color: '#0A1E3F' }}
                                            />
                                        }
                                        label="I agree to the Terms & Conditions and Privacy Policy"
                                    />
                                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Security sx={{ color: '#4CAF50' }} />
                                        <Typography variant="body2">Your data is protected with 256-bit encryption</Typography>
                                    </Box>
                                </Paper>
                                
                                <Alert severity="success" sx={{ borderRadius: '12px' }}>
                                    <Typography variant="body2" fontWeight={600}>Review Your Account Details:</Typography>
                                    <ul>
                                        <li>Name: {formData.firstName} {formData.lastName}</li>
                                        <li>Email: {formData.email}</li>
                                        <li>Country: {selectedCountry.flag} {formData.country}</li>
                                        <li>Currency: {selectedCountry.currency} ({selectedCountry.symbol})</li>
                                        <li>Initial Balance: {selectedCountry.symbol}{parseFloat(formData.initialDeposit || 0).toLocaleString()}</li>
                                    </ul>
                                </Alert>
                            </Box>
                        )}

                        {/* Navigation Buttons */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                            <Button
                                onClick={handleBack}
                                disabled={activeStep === 0}
                                startIcon={<ArrowBack />}
                                sx={{ color: '#0A1E3F' }}
                            >
                                Back
                            </Button>
                            
                            {activeStep === steps.length - 1 ? (
                                <GradientButton
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    endIcon={<CheckCircle />}
                                >
                                    {loading ? 'Creating Account...' : 'Create Account'}
                                </GradientButton>
                            ) : (
                                <GradientButton
                                    onClick={handleNext}
                                    endIcon={<ArrowForward />}
                                >
                                    Continue
                                </GradientButton>
                            )}
                        </Box>

                        {/* Sign In Link */}
                        <Box sx={{ textAlign: 'center', mt: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                                Already have an account?{' '}
                                <Link
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onSwitchToLogin();
                                    }}
                                    sx={{ color: '#0A1E3F', fontWeight: 600 }}
                                >
                                    Sign In
                                </Link>
                            </Typography>
                        </Box>

                        <Box sx={{ textAlign: 'center', mt: 4, pt: 2, borderTop: '1px solid #E0E7FF' }}>
                            <Typography variant="caption" color="text.secondary">🌍 QuinCore Bank · Global Banking in Multiple Currencies</Typography>
                        </Box>
                    </StyledPaper>
                </Fade>
            </Container>
        </Box>
    );
}

export default SignUp;