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
    ArrowForward, ArrowBack, Security, Public
} from '@mui/icons-material';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

// Styled components
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
    padding: '12px',
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
        address: ''
    });

    const steps = ['Account', 'Personal', 'Verify'];

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
            const initialBalance = 10000;

            // Store ALL user data in Firebase
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                firstName: formData.firstName,
                lastName: formData.lastName,
                fullName: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                phone: formData.phone,
                dateOfBirth: formData.dateOfBirth,
                country: formData.country,
                address: formData.address,
                balance: initialBalance,
                accountNumber: accountNumber,
                createdAt: new Date().toLocaleString(),
                transactions: [],
                cardApplications: [],
                issuedCards: []
            });

            setSuccess('Account created successfully! Welcome to QuinCore Bank.');
            setTimeout(() => onSwitchToLogin(), 2000);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const countries = [
        { code: 'Canada', flag: '🇨🇦' },
        { code: 'USA', flag: '🇺🇸' },
        { code: 'UK', flag: '🇬🇧' },
        { code: 'Australia', flag: '🇦🇺' },
        { code: 'Germany', flag: '🇩🇪' }
    ];

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
                        {/* Header */}
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
                                Join the future of elite banking
                            </Typography>
                        </Box>

                        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                            {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                        </Stepper>

                        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}
                        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>{success}</Alert>}

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
                                    <FormControl fullWidth>
                                        <InputLabel>Country</InputLabel>
                                        <Select
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            label="Country"
                                        >
                                            {countries.map(c => (
                                                <MenuItem key={c.code} value={c.code}>{c.flag} {c.code}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth name="address" label="Full Address" value={formData.address} onChange={handleChange} multiline rows={2} />
                                </Grid>
                            </Grid>
                        )}

                        {activeStep === 2 && (
                            <Box>
                                <Paper sx={{ p: 3, bgcolor: '#F8FAFD', borderRadius: '16px', mb: 3 }}>
                                    <FormControlLabel
                                        control={<Checkbox checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} sx={{ color: '#0A1E3F' }} />}
                                        label="I agree to the Terms & Conditions and Privacy Policy"
                                    />
                                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Security sx={{ color: '#4CAF50' }} />
                                        <Typography variant="body2">Your data is protected with 256-bit encryption</Typography>
                                    </Box>
                                </Paper>
                                <Alert severity="info" sx={{ borderRadius: '12px' }}>
                                    <Typography variant="body2">By creating an account, you'll receive:</Typography>
                                    <ul><li>🎁 $10,000 CAD welcome balance</li><li>💳 Premium account</li><li>🛡️ Fraud protection guarantee</li></ul>
                                </Alert>
                            </Box>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                            <Button onClick={handleBack} disabled={activeStep === 0} startIcon={<ArrowBack />} sx={{ color: '#0A1E3F' }}>Back</Button>
                            {activeStep === steps.length - 1 ? (
                                <GradientButton onClick={handleSubmit} disabled={loading} endIcon={<CheckCircle />}>{loading ? 'Creating...' : 'Create Account'}</GradientButton>
                            ) : (
                                <GradientButton onClick={handleNext} endIcon={<ArrowForward />}>Continue</GradientButton>
                            )}
                        </Box>

                        <Box sx={{ textAlign: 'center', mt: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                                Already have an account?{' '}
                                <Link href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }} sx={{ color: '#0A1E3F', fontWeight: 600 }}>
                                    Sign In
                                </Link>
                            </Typography>
                        </Box>

                        <Box sx={{ textAlign: 'center', mt: 4, pt: 2, borderTop: '1px solid #E0E7FF' }}>
                            <Typography variant="caption" color="text.secondary">🌍 QuinCore Bank · Global Private Banking</Typography>
                        </Box>
                    </StyledPaper>
                </Fade>
            </Container>
        </Box>
    );
}

export default SignUp;