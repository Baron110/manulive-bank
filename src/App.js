import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import Dashboard from './components/Dashboard';

function App() {
    const [user, setUser] = useState(null);
    const [showSignUp, setShowSignUp] = useState(false);

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
    }, []);

    if (user) {
        return <Dashboard />;
    }

    if (showSignUp) {
        return <SignUp onSwitchToLogin={() => setShowSignUp(false)} />;
    }

    return <SignIn onSwitchToSignUp={() => setShowSignUp(true)} />;
}

export default App;