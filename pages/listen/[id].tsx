import React, { useEffect, useState } from 'react';
import { Box, Typography, LinearProgress, Card, CardContent, Button, Divider, Link } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useRouter } from 'next/router';

// --- New Interfaces for the JSON data structure ---

interface EntitySummary {
  name: string;
  identifiers_used: string | string[];
  search_date: string;
  summary: string;
}

interface Match {
  risk_type: string;
  source: string;
  source_tier: string | number;
  severity: string;
  date: string;
  summary: string;
  source_link: string;
  entity_confirmation: string;
}

interface SearchMethodology {
  sources_searched: string | string[];
  date_range: string;
  search_terms_used: string | string[];
}

interface ScreeningOutput {
  entity_summary: EntitySummary;
  matches: Match[];
  risk_score: string | number;
  confidence_level: string | number;
  needs_review: boolean | string;
  escalation_level: string;
  search_methodology: SearchMethodology;
}

interface ScreeningResult {
  output: ScreeningOutput;
}

interface ReceivedData {
  html: string; // This is now a JSON-lines string
  timestamp: string;
}

// --- Helper function to render object details ---

const renderObjectDetails = (obj: Record<string, any>, title: string) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{title}</Typography>
    {Object.entries(obj).map(([key, value]) => (
      <Typography key={key} variant="body2" sx={{ mb: 0.5 }}>
        <strong style={{ textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}:</strong>{' '}
        {Array.isArray(value) ? value.join(', ') : String(value)}
      </Typography>
    ))}
  </Box>
);

export default function Listen() {
  const [data, setData] = useState<ReceivedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;

  const clearData = async () => {
    if (!id) return;
    try {
      await fetch(`/api/listen/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to clear data on server:', err);
    }
    setData(null);
    setError(null);
  };

  useEffect(() => {
    if (!id) return;

    clearData(); // Clear data on initial component mount

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/listen/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();

        if (result.data) {
          setData(result.data);
          setError(null); // Clear any previous error
          setIsLoading(false);
          clearInterval(pollInterval);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setData(null); // Clear data on error
        setIsLoading(false);
        clearInterval(pollInterval); // Stop polling on error
      }
    }, 2000);

    return () => {
      clearInterval(pollInterval);
      clearData(); // Clear data when component unmounts
    };
  }, [id]);

  const handleSearchAgain = () => {
    clearData();
    router.push('/');
  };

  if (!id) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
        <Typography color="error" variant="h6">
          No request ID provided
        </Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Waiting for results...
        </Typography>
        <LinearProgress sx={{ width: '300px' }} />
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
          Request ID: {id}
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
        <Button
          variant="outlined"
          onClick={handleSearchAgain}
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  if (data && data.html) {
    let parsedResult: any = null;
    try {
      parsedResult = JSON.parse(data.html);
    } catch (e) {
      console.error('Failed to parse JSON:', data.html, e);
    }

    // Helper to render a list of results
    const renderResults = (results: any[]) => (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Results:</Typography>
        {results.length === 0 ? (
          <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic' }}>No results found.</Typography>
        ) : (
          results.map((item, idx) => (
            <Card key={idx} sx={{ mb: 2, p: 2, borderRadius: 2, border: '1px solid #e0e0e0', background: '#fafafa' }}>
              {item.title && (
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>{item.title}</Typography>
              )}
              {item.url && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>URL:</strong> <Link href={item.url} target="_blank" rel="noopener noreferrer">{item.url}</Link>
                </Typography>
              )}
              {item.content && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Content:</strong> {item.content}
                </Typography>
              )}
              {item.score !== undefined && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Score:</strong> {item.score}
                </Typography>
              )}
              {/* Render any other fields generically */}
              {Object.entries(item).map(([key, value]) => (
                !['title', 'url', 'content', 'score'].includes(key) && value !== null && value !== undefined ? (
                  <Typography key={key} variant="body2" sx={{ mb: 1 }}>
                    <strong>{key.replace(/_/g, ' ')}:</strong> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </Typography>
                ) : null
              ))}
            </Card>
          ))
        )}
      </Box>
    );

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, px: 2, fontFamily: 'Raleway, Arial, sans-serif', background: '#fff', minHeight: '100vh' }}>
        {/* Header */}
        <Box
          sx={{
            width: '100%',
            maxWidth: '95%',
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
            onClick={handleSearchAgain}
          >
            Search Again
          </Button>
        </Box>

        {/* Results */}
        <Box sx={{ width: '100%', maxWidth: '95%', mt: 2 }}>
          <Card
            sx={{
              mb: 3,
              borderRadius: 3,
              boxShadow: '0 2px 8px 0 rgba(0,0,0,0.06)',
              border: '1px solid #222',
              background: '#fff',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#111' }}>
                Result
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Query:</strong> {parsedResult?.query || <span style={{ fontStyle: 'italic' }}>N/A</span>}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Follow Up Questions:</strong> {parsedResult?.follow_up_questions ? String(parsedResult.follow_up_questions) : <span style={{ fontStyle: 'italic' }}>None</span>}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Answer:</strong> {parsedResult?.answer ? String(parsedResult.answer) : <span style={{ fontStyle: 'italic' }}>None</span>}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Images:</strong> {Array.isArray(parsedResult?.images) && parsedResult.images.length > 0 ? parsedResult.images.join(', ') : <span style={{ fontStyle: 'italic' }}>None</span>}
              </Typography>
              {Array.isArray(parsedResult?.results) && renderResults(parsedResult.results)}
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
      <Typography variant="h6">
        No data received yet
      </Typography>
      <Button
        variant="outlined"
        onClick={handleSearchAgain}
        sx={{ mt: 2 }}
      >
        Search Again
      </Button>
    </Box>
  );
} 