import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/router';


export default function Listen() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the home page since this page is deprecated
    // Users should now use the dynamic version with an ID
    router.push('/');
  }, [router]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
      <Typography variant="h6">
        Redirecting to home page...
      </Typography>
    </Box>
  );
}
