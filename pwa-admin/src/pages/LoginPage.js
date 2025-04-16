import React, { useState, useEffect } from 'react';
import { Box, Container, TextField, Button, Typography, Paper, Alert, 
  FormControlLabel, Switch, CircularProgress, Link } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function LoginPage() {
  const { login, error: authError, loading: authLoading } = useAuth();
  const { requestNotificationPermission, notificationPermission } = useNotification();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load saved server URL
  useEffect(() => {
    const savedUrl = localStorage.getItem('serverUrl');
    if (savedUrl) {
      setServerUrl(savedUrl);
    } else {
      // Default to current origin if no saved URL
      setServerUrl(window.location.origin);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    if (!serverUrl) {
      setError('Server URL is required');
      return;
    }

    try {
      // Save server URL
      localStorage.setItem('serverUrl', serverUrl);
      
      // Attempt login
      const success = await login(username, password);
      
      if (success) {
        // Request notification permission after successful login
        if (notificationPermission !== 'granted') {
          requestNotificationPermission();
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            Rai Admin
          </Typography>
          
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Guest House Management
          </Typography>
          
          {(error || authError) && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error || authError}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={authLoading}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={authLoading}
            />
            
            <FormControlLabel
              control={
                <Switch 
                  checked={showAdvanced} 
                  onChange={(e) => setShowAdvanced(e.target.checked)} 
                  color="primary"
                />
              }
              label="Show advanced settings"
              sx={{ mt: 1 }}
            />
            
            {showAdvanced && (
              <TextField
                margin="normal"
                required
                fullWidth
                id="serverUrl"
                label="Server URL"
                name="serverUrl"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                disabled={authLoading}
                helperText="URL of the Rai Guest House server"
              />
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={authLoading}
            >
              {authLoading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
            </Button>
            
            <Typography variant="body2" color="text.secondary" align="center">
              This app requires notifications for order alerts.
              {notificationPermission !== 'granted' && (
                <Link
                  component="button"
                  variant="body2"
                  onClick={requestNotificationPermission}
                  sx={{ ml: 1 }}
                >
                  Enable Notifications
                </Link>
              )}
            </Typography>
          </Box>
        </Paper>
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
          Rai Guest House Admin v1.0.0
        </Typography>
      </Box>
    </Container>
  );
}