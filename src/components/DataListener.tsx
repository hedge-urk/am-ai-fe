import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import ScreeningResults from './ScreeningResults';

interface DataListenerProps {
  entityName?: string;
}

const DataListener: React.FC<DataListenerProps> = () => {
  const location = useLocation();
  const entityName = location.state?.entityName || 'Unknown Entity';
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/listen');
        console.log("response", response);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        
        if (result && Array.isArray(result.data) && result.data.length > 0) {
          setData(result.data);
          setLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Waiting for screening results...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
        <Typography color="error" variant="h6">
          Error: {error}
        </Typography>
      </Box>
    );
  }

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
        <Typography variant="h6">
          No screening results received yet. Please wait...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Screening Results for {entityName}
      </Typography>
      <ScreeningResults data={data} />
    </Box>
  );
};

export default DataListener; 