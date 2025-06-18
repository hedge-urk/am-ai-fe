import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

interface ReceivedData {
  html: string;
  timestamp: string;
}

export default function Listen() {
  const [data, setData] = useState<ReceivedData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/listen');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        
        if (result.data) {
          setData(result.data);
          clearInterval(pollInterval);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, []);

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
        <Typography color="error" variant="h6">
          Error: {error}
        </Typography>
      </Box>
    );
  }

  if (data) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, px: 2 }}>
        <Typography variant="h6" color="success.main" gutterBottom>
          Data received successfully!
        </Typography>
        <Box sx={{ width: '100%', maxWidth: '800px', mt: 2 }}>
          <div dangerouslySetInnerHTML={{ __html: data.html }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
      <Typography variant="h6">
        Waiting for data...
      </Typography>
    </Box>
  );
} 