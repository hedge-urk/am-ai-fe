import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Container, InputAdornment, Select, MenuItem, FormControl, InputLabel, Tooltip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PublicIcon from '@mui/icons-material/Public';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useRouter } from 'next/router';

interface FormData {
  entityName: string;
  dateOfBirth: string;
  country: string;
  modelProvider: string;
  similarityScore: number;
}

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    entityName: '',
    dateOfBirth: '',
    country: '',
    modelProvider: 'OpenAI',
    similarityScore: 20,
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modelProviders = ['OpenAI', 'DeepSeek', 'LLAMA'];

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};
    if (!formData.entityName.trim()) {
      newErrors.entityName = 'Entity Name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Generate a unique ID for this request
      const requestId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      
      // Create the dynamic callback URL
      const callbackUrl = `${window.location.origin}/api/listen/${requestId}`;
      
      // Select the appropriate API endpoint based on the model provider
      let apiEndpoint: string;
      switch (formData.modelProvider) {
        case 'OpenAI':
          apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT_OPENAI || '';
          break;
        case 'DeepSeek':
          apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT_DEEPSEEK || '';
          break;
        case 'LLAMA':
          apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT_LLAMA || '';
          break;
        default:
          throw new Error('Invalid model provider selected');
      }

      if (!apiEndpoint) {
        throw new Error(`API endpoint not configured for ${formData.modelProvider}`);
      }
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          callbackUrl: callbackUrl,
          requestId: requestId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      // Navigate to the listen page with the request ID and all search parameters
      const params = new URLSearchParams({
        model: formData.modelProvider,
        similarityScore: String(formData.similarityScore),
        country: formData.country,
        dateOfBirth: formData.dateOfBirth,
      });
      router.push(`/listen/${requestId}?${params.toString()}`);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ entityName: 'Failed to submit form. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name?: string; value: unknown } }) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: name === 'similarityScore' ? Math.max(0, Math.min(100, Number(value))) : value
    }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name as string]: undefined
      }));
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Raleway, Arial, sans-serif',
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: 600 }}>
        <Paper
          elevation={1}
          sx={{
            p: 3,
            borderRadius: 3,
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.06)',
            background: '#fff',
            border: '1px solid #222',
          }}
        >
          <Typography variant="h4" component="h2" align="center" sx={{ mb: 2, fontWeight: 700, color: '#111', fontFamily: 'Raleway, Arial, sans-serif', fontSize: '2rem' }}>
            AMS AI Solution
          </Typography>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                required
                fullWidth
                size="small"
                label="Entity Name"
                name="entityName"
                value={formData.entityName}
                onChange={handleChange}
                error={!!errors.entityName}
                helperText={errors.entityName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: '#111' }} />
                    </InputAdornment>
                  ),
                  style: { color: '#111', fontFamily: 'Raleway, Arial, sans-serif', fontSize: '1rem', height: 44, padding: '6px 8px' },
                }}
                InputLabelProps={{ style: { color: '#111', fontFamily: 'Raleway, Arial, sans-serif', fontSize: '1rem' } }}
                sx={{ '& .MuiInputBase-root': { height: 44 } }}
              />
              <Tooltip title="A percentage value (0-100) of how closely the name must match. Higher means stricter matching." placement="top" arrow>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Similarity Score (%)"
                  name="similarityScore"
                  value={formData.similarityScore}
                  onChange={handleChange}
                  inputProps={{ min: 0, max: 100, style: { height: 44 } }}
                  sx={{ '& input': { color: '#111', fontFamily: 'Raleway, Arial, sans-serif', fontSize: '1rem', height: 44, padding: '6px 8px' }, '& .MuiInputBase-root': { height: 44 } }}
                  InputLabelProps={{ style: { color: '#111', fontFamily: 'Raleway, Arial, sans-serif', fontSize: '1rem' } }}
                  helperText="How close the name must match (0-100%)"
                />
              </Tooltip>
              <TextField
                fullWidth
                size="small"
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                InputLabelProps={{ shrink: true, style: { color: '#111', fontFamily: 'Raleway, Arial, sans-serif', fontSize: '1rem' } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayIcon sx={{ color: '#111' }} />
                    </InputAdornment>
                  ),
                  style: { color: '#111', fontFamily: 'Raleway, Arial, sans-serif', fontSize: '1rem', height: 44, padding: '6px 8px' },
                }}
                sx={{ '& .MuiInputBase-root': { height: 44 } }}
              />
              <TextField
                fullWidth
                size="small"
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PublicIcon sx={{ color: '#111' }} />
                    </InputAdornment>
                  ),
                  style: { color: '#111', fontFamily: 'Raleway, Arial, sans-serif', fontSize: '1rem', height: 44, padding: '6px 8px' },
                }}
                InputLabelProps={{ style: { color: '#111', fontFamily: 'Raleway, Arial, sans-serif', fontSize: '1rem' } }}
                sx={{ '& .MuiInputBase-root': { height: 44 } }}
              />
              <FormControl fullWidth size="small" sx={{ '& .MuiInputBase-root': { height: 44 } }}>
                <InputLabel style={{ color: '#111', fontFamily: 'Raleway, Arial, sans-serif', fontSize: '1rem' }}>
                  Model Provider
                </InputLabel>
                <Select
                  name="modelProvider"
                  value={formData.modelProvider}
                  onChange={handleChange}
                  label="Model Provider"
                  sx={{
                    color: '#111',
                    fontFamily: 'Raleway, Arial, sans-serif',
                    fontSize: '1rem',
                    height: 44,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#222',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#111',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#111',
                    },
                  }}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SmartToyIcon sx={{ color: '#111', mr: 1 }} />
                      <span>{typeof selected === 'string' ? selected : ''}</span>
                    </Box>
                  )}
                >
                  {modelProviders.map((provider) => (
                    <MenuItem key={provider} value={provider} style={{ fontFamily: 'Raleway, Arial, sans-serif', display: 'flex', alignItems: 'center', fontSize: '1rem', height: 44 }}>
                      <SmartToyIcon sx={{ color: '#111', mr: 1 }} />
                      {provider}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                type="submit"
                variant="outlined"
                size="small"
                disabled={isSubmitting}
                sx={{
                  mt: 1,
                  py: 1,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  borderColor: '#222',
                  color: '#111',
                  background: '#fff',
                  '&:hover': {
                    background: '#111',
                    color: '#fff',
                    borderColor: '#111',
                  },
                  fontFamily: 'Raleway, Arial, sans-serif',
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
} 