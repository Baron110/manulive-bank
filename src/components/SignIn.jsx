import React, { useState } from 'react';
import {
    Container, Paper, TextField, Button, Typography, Box,
    Avatar, Grid, Link, InputAdornment, IconButton,
    Checkbox, FormControlLabel, Alert, Fade
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    LockOutlined, Email, Visibility, VisibilityOff,
    Security, AccountBalance, ArrowForward
} from '@mui/icons-material';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const StyledPaper = styled(Paper)(({ theme }) => ({
    background: 'white',
    borderRadius: '32px',
    padding: theme.spacing(4),
    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
    position: 'relative',
    overflow: 'hidden',
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

function SignIn({ onSwitchToSignUp }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            switch(error.code) {
                case 'auth/user-not-found':
                    setError('No account found with this email');
                    break;
                case 'auth/wrong-password':
                    setError('Incorrect password');
                    break;
                case 'auth/invalid-email':
                    setError('Invalid email format');
                    break;
                default:
                    setError('Login failed. Please try again');
                    break;
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
            <Container maxWidth="sm">
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
                                <AccountBalance sx={{ fontSize: 40 }} />
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
                                Welcome back to elite banking
                            </Typography>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError('')}>
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Email Address"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
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
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                sx={{ mb: 2 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlined sx={{ color: '#0A1E3F' }} />
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

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <FormControlLabel
                                    control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} sx={{ color: '#0A1E3F' }} />}
                                    label="Remember me"
                                />
                                <Link href="#" sx={{ color: '#0A1E3F', textDecoration: 'none' }}>Forgot password?</Link>
                            </Box>

                            <GradientButton fullWidth type="submit" disabled={loading} endIcon={<ArrowForward />}>
                                {loading ? 'Signing in...' : 'Sign In'}
                            </GradientButton>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, p: 1.5, bgcolor: '#F8FAFD', borderRadius: '12px' }}>
                                <Security sx={{ color: '#4CAF50', fontSize: 20 }} />
                                <Typography variant="caption" color="text.secondary">Secure 256-bit encryption · Your data is protected</Typography>
                            </Box>

                            <Box sx={{ textAlign: 'center', mt: 3 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Don't have an account?{' '}
                                    <Link href="#" onClick={(e) => { e.preventDefault(); onSwitchToSignUp(); }} sx={{ color: '#0A1E3F', fontWeight: 600 }}>
                                        Create Account
                                    </Link>
                                </Typography>
                            </Box>

                            <Box sx={{ textAlign: 'center', mt: 4, pt: 2, borderTop: '1px solid #E0E7FF' }}>
                                <Typography variant="caption" color="text.secondary">🌍 QuinCore Bank · Global Private Banking</Typography>
                            </Box>
                        </form>
                    </StyledPaper>
                </Fade>
            </Container>
        </Box>
    );
}

export default SignIn;