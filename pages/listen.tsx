import React, { useEffect, useState } from 'react';
import { Box, Typography, LinearProgress, Card, CardContent, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useRouter } from 'next/router';

interface ReceivedData {
  html: string[];
  timestamp: string;
}

export default function Listen() {
  const [data, setData] = useState<ReceivedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/listen');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();

        console.log(result);
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

  if (data && Array.isArray(data.html)) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, px: 2, fontFamily: 'Raleway, Arial, sans-serif', background: '#fff', minHeight: '100vh' }}>
        {/* Black/white header */}
        <Box
          sx={{
            width: '100%',
            maxWidth: '90%',
            mb: 3,
            py: 2,
            px: 3,
            borderRadius: 3,
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.06)',
            border: '1px solid #222',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircleIcon sx={{ color: '#222', fontSize: 36, mr: 2 }} />
            <Typography variant="h5" sx={{ color: '#111', fontWeight: 700, fontFamily: 'Raleway, Arial, sans-serif' }}>
              Screening Results Received!
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="inherit"
            sx={{
              fontWeight: 600,
              borderRadius: 2,
              borderColor: '#222',
              color: '#111',
              background: '#fff',
              ml: 2,
              '&:hover': {
                background: '#111',
                color: '#fff',
                borderColor: '#111',
              },
            }}
            onClick={() => router.push('/')}
          >
            Search Again
          </Button>
        </Box>
        <Box sx={{ width: '100%', mt: 2 }}>
          {/* Custom table and card styles */}
          <style>{`
            body, .modern-table, .modern-table * {
              font-family: 'Raleway', Arial, sans-serif !important;
            }
            .modern-table {
              border-collapse: separate !important;
              border-spacing: 0;
              width: 100%;
              background: #fff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.04);
              margin-bottom: 24px;
              border: 0;
            }
            .modern-table th, .modern-table td {
              border: 0;
              padding: 8px 12px;
              font-size: 1rem;
              color: #111;
              background: #fff;
            }
            .modern-table th {
              background: #f5f5f5;
              font-weight: 600;
              color: #111;
            }
            .modern-table tr:nth-of-type(even) td {
              background: #fafafa;
            }
            /* Remove borders from nested tables and make them cards */
            .modern-table table {
              border: 1px solid #bbb !important;
              box-shadow: 0 1px 4px rgba(0,0,0,0.04);
              border-radius: 8px;
              margin: 12px 0;
              background: #fff;
              width: 98%;
            }
            .modern-table table th, .modern-table table td {
              border: 1px solid #eee !important;
              background: #fff !important;
              font-size: 0.98rem;
              color: #222;
              padding: 6px 10px;
            }
            .modern-table ul {
              padding-left: 18px;
              margin: 0;
            }
            .modern-table li {
              list-style: none;
              margin-bottom: 12px;
            }
          `}</style>
          {data.html.flatMap((htmlString, idx) => {
            // Split by all <h3>...</h3> and keep the heading with its content
            const sections = [];
            const regex = /<h3>(.*?)<\/h3>([\s\S]*?)(?=<h3>|$)/gi;
            let match;
            while ((match = regex.exec(htmlString)) !== null) {
              sections.push({
                heading: match[1],
                content: match[2],
              });
            }
            return sections.map((section, sectionIdx) => (
              <Card key={`${idx}-${sectionIdx}`} sx={{ mb: 3, borderRadius: 3, boxShadow: 1, background: '#fff', border: '1px solid #222' }}>
                <CardContent>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: '#222', fontFamily: 'Raleway, Arial, sans-serif' }}>
                    {section.heading}
                  </Typography>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: section.content.replace(/<table/g, '<table class=\"modern-table\"'),
                    }}
                  />
                </CardContent>
              </Card>
            ));
          })}
        </Box>
      </Box>
    );
  }

  // Modern loader while waiting for data
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 12, width: '100%', fontFamily: 'Raleway, Arial, sans-serif', background: '#fff' }}>
      <Box sx={{ width: '60%', minWidth: 250, maxWidth: 400 }}>
        <LinearProgress color="inherit" sx={{ background: '#eee' }} />
      </Box>
      <Typography variant="subtitle1" sx={{ mt: 3, color: '#222' }}>
        Our workflow is compiling the results, please wait...
      </Typography>
    </Box>
  );
} 