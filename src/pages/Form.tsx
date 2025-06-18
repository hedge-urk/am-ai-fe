import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DataListener from '../components/DataListener';

interface FormData {
  entityName: string;
  dateOfBirth: string;
  country: string;
}

const Form: React.FC = () => {
  const navigate = useNavigate();
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
      const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      // Navigate to the listening page with the entity name
      navigate('/listen', { state: { entityName: formData.entityName } });
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
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      minHeight: '100vh',
      py: 4,
      px: 2
    }}>
      <Paper elevation={3} sx={{ 
        p: 4, 
        width: '100%', 
        maxWidth: '1200px',
        backgroundColor: 'background.paper'
      }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          Entity Screening Form
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
              sx={{ 
                '& .MuiInputBase-input': { 
                  color: 'text.primary',
                  fontSize: '1.1rem'
                },
                '& .MuiInputLabel-root': {
                  fontSize: '1.1rem'
                }
              }}
            />
            
            <TextField
              fullWidth
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              sx={{ 
                '& .MuiInputBase-input': { 
                  color: 'text.primary',
                  fontSize: '1.1rem'
                },
                '& .MuiInputLabel-root': {
                  fontSize: '1.1rem'
                }
              }}
            />
            
            <TextField
              fullWidth
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              sx={{ 
                '& .MuiInputBase-input': { 
                  color: 'text.primary',
                  fontSize: '1.1rem'
                },
                '& .MuiInputLabel-root': {
                  fontSize: '1.1rem'
                }
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{ 
                mt: 2,
                py: 1.5,
                fontSize: '1.1rem'
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Form; 