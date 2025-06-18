import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Container, InputAdornment } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PublicIcon from '@mui/icons-material/Public';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useRouter } from 'next/router';

interface FormData {
  entityName: string;
  dateOfBirth: string;
  country: string;
}

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    entityName: '',
    dateOfBirth: '',
    country: ''
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      router.push('/listen');
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ entityName: 'Failed to submit form. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
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
      <Container maxWidth="sm">
        <Paper
          elevation={1}
          sx={{
            p: 5,
            borderRadius: 4,
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.06)',
            background: '#fff',
            border: '1px solid #222',
          }}
        >
          <Typography variant="h4" component="h2" align="center" sx={{ mb: 3, fontWeight: 700, color: '#111', fontFamily: 'Raleway, Arial, sans-serif' }}>
            AMS AI Solution
          </Typography>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                required
                fullWidth
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
                  style: { color: '#111', fontFamily: 'Raleway, Arial, sans-serif' },
                }}
                InputLabelProps={{ style: { color: '#111', fontFamily: 'Raleway, Arial, sans-serif' } }}
              />
              <TextField
                fullWidth
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                InputLabelProps={{ shrink: true, style: { color: '#111', fontFamily: 'Raleway, Arial, sans-serif' } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayIcon sx={{ color: '#111' }} />
                    </InputAdornment>
                  ),
                  style: { color: '#111', fontFamily: 'Raleway, Arial, sans-serif' },
                }}
              />
              <TextField
                fullWidth
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
                  style: { color: '#111', fontFamily: 'Raleway, Arial, sans-serif' },
                }}
                InputLabelProps={{ style: { color: '#111', fontFamily: 'Raleway, Arial, sans-serif' } }}
              />
              <Button
                type="submit"
                variant="outlined"
                size="large"
                disabled={isSubmitting}
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontSize: '1.1rem',
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