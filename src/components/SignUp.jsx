import React, { useState } from 'react';
import {
    Container, Paper, TextField, Button, Typography, Box,
    Avatar, Grid, Link, InputAdornment, IconButton, Divider,
    Checkbox, FormControlLabel, Alert, Fade, Stepper, Step,
    StepLabel, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    PersonAdd, Email, Lock, Visibility, VisibilityOff,
    Badge, CalendarToday, Phone, Flag, CheckCircle,
    ArrowForward, ArrowBack, AccountBalance, Security
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

    // Form data
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        surname: '',
        middleName: '',
        lastName: '',
        username: '',
        dob: '',
        phone: '',
        country: 'Canada',
        state: '',
        city: '',
        gender: '',
        occupation: '',
        address: ''
    });

    const steps = ['Account Info', 'Personal Details', 'Security', 'Review'];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validateStep = () => {
        switch(activeStep) {
            case 0:
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
                break;
            case 1:
                if (!formData.surname || !formData.lastName || !formData.dob) {
                    setError('Please fill all required fields');
                    return false;
                }
                break;
            case 2:
                if (!agreeTerms) {
                    setError('You must agree to terms and conditions');
                    return false;
                }
                break;
        }
        setError('');
        return true;
    };

    const handleNext = () => {
        if (validateStep()) {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleSubmit = async () => {
        if (!agreeTerms) {
            setError('You must agree to terms and conditions');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth, 
                formData.email, 
                formData.password
            );
            
            const user = userCredential.user;

            await setDoc(doc(db, 'users', user.uid), {
                ...formData,
                balance: 350000,
                accountNumber: 'MAN' + Math.floor(Math.random() * 10000000000),
                createdAt: new Date().toLocaleString(),
                transactions: [],
                accountType: 'Premium Black',
                memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                verified: true
            });

            setSuccess('Account created successfully! Welcome to MANULIVE BANK!');
            
            setTimeout(() => {
                onSwitchToLogin();
            }, 2000);

        } catch (error) {
            switch(error.code) {
                case 'auth/email-already-in-use':
                    setError('Email already registered');
                    break;
                case 'auth/invalid-email':
                    setError('Invalid email format');
                    break;
                case 'auth/weak-password':
                    setError('Password is too weak');
                    break;
                default:
                    setError('Registration failed: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

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
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#0A1E3F' }}>
                                Create Account
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                                Join over 1M+ Canadians banking with us
                            </Typography>
                        </Box>

                        {/* Stepper */}
                        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>

                        {/* Error/Success Messages */}
                        {error && (
                            <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                                {error}
                            </Alert>
                        )}
                        {success && (
                            <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
                                {success}
                            </Alert>
                        )}

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
                                    name="username"
                                    label="Username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    sx={{ mb: 2 }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Badge sx={{ color: '#0A1E3F' }} />
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
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                >
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

                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                                    Password must be at least 6 characters
                                </Typography>
                            </Box>
                        )}

                        {/* Step 2: Personal Details */}
                        {activeStep === 1 && (
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        name="surname"
                                        label="Surname"
                                        value={formData.surname}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        name="middleName"
                                        label="Middle Name"
                                        value={formData.middleName}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        name="lastName"
                                        label="Last Name"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        name="dob"
                                        label="Date of Birth"
                                        type="date"
                                        value={formData.dob}
                                        onChange={handleChange}
                                        InputLabelProps={{ shrink: true }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <CalendarToday sx={{ color: '#0A1E3F' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        name="phone"
                                        label="Phone Number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Phone sx={{ color: '#0A1E3F' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Country</InputLabel>
                                        <Select
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            label="Country"
                                        >
                                            <MenuItem value="Canada">Canada 🇨🇦</MenuItem>
                                            <MenuItem value="USA">USA 🇺🇸</MenuItem>
                                            <MenuItem value="UK">UK 🇬🇧</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        name="state"
                                        label="State/Province"
                                        value={formData.state}
                                        onChange={handleChange}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        name="city"
                                        label="City"
                                        value={formData.city}
                                        onChange={handleChange}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Gender</InputLabel>
                                        <Select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            label="Gender"
                                        >
                                            <MenuItem value="female">Female</MenuItem>
                                            <MenuItem value="male">Male</MenuItem>
                                            <MenuItem value="other">Other</MenuItem>
                                            <MenuItem value="prefer-not">Prefer not to say</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        name="occupation"
                                        label="Occupation"
                                        value={formData.occupation}
                                        onChange={handleChange}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name="address"
                                        label="Full Address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        multiline
                                        rows={2}
                                    />
                                </Grid>
                            </Grid>
                        )}

                        {/* Step 3: Security */}
                        {activeStep === 2 && (
                            <Box>
                                <Paper sx={{ p: 3, bgcolor: '#F8FAFD', borderRadius: '16px', mb: 3 }}>
                                    <Typography variant="h6" gutterBottom sx={{ color: '#0A1E3F' }}>
                                        Security Settings
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
                                        <Typography variant="body2">
                                            Your data is protected with 256-bit encryption
                                        </Typography>
                                    </Box>
                                </Paper>

                                <Alert severity="info" sx={{ borderRadius: '12px' }}>
                                    <Typography variant="body2">
                                        By creating an account, you'll receive:
                                    </Typography>
                                    <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                                        <li>🎁 $350,000 CAD welcome balance</li>
                                        <li>💳 Premium Black account</li>
                                        <li>🛡️ Fraud protection guarantee</li>
                                        <li>📱 Mobile banking access</li>
                                    </ul>
                                </Alert>
                            </Box>
                        )}

                        {/* Step 4: Review */}
                        {activeStep === 3 && (
                            <Box>
                                <Paper sx={{ p: 3, bgcolor: '#F8FAFD', borderRadius: '16px', mb: 3 }}>
                                    <Typography variant="h6" gutterBottom sx={{ color: '#0A1E3F' }}>
                                        Review Your Information
                                    </Typography>
                                    
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Full Name</Typography>
                                            <Typography>{formData.surname} {formData.middleName} {formData.lastName}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Email</Typography>
                                            <Typography>{formData.email}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
                                            <Typography>{formData.dob}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Location</Typography>
                                            <Typography>{formData.city}, {formData.country}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="caption" color="text.secondary">Account Type</Typography>
                                            <Typography variant="h6" sx={{ color: '#0A1E3F' }}>Premium Black</Typography>
                                        </Grid>
                                    </Grid>
                                </Paper>

                                <Alert severity="success" sx={{ borderRadius: '12px', mb: 2 }}>
                                    <Typography variant="body2" fontWeight={600}>
                                        You'll receive $350,000 CAD welcome bonus!
                                    </Typography>
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
                                    sx={{ 
                                        color: '#0A1E3F',
                                        fontWeight: 600,
                                        textDecoration: 'none',
                                        '&:hover': { textDecoration: 'underline' }
                                    }}
                                >
                                    Sign In
                                </Link>
                            </Typography>
                        </Box>

                        {/* Bank Info */}
                        <Box sx={{ 
                            textAlign: 'center', 
                            mt: 4,
                            pt: 2,
                            borderTop: '1px solid #E0E7FF'
                        }}>
                            <Typography variant="caption" color="text.secondary">
                                🇨🇦 MANULIVE BANK · Vancouver, Canada
                            </Typography>
                        </Box>
                    </StyledPaper>
                </Fade>
            </Container>
        </Box>
    );
}

export default SignUp;