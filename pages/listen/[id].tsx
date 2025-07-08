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
    const results: ScreeningResult[] = data.html
      .trim()
      .split('\n')
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          console.error('Failed to parse JSON line:', line, e);
          return null;
        }
      })
      .filter((item): item is ScreeningResult => item !== null);

    const modelProviders = ['OpenAI', 'DeepSeek', "LLAMA"];

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
          {results.map((result, idx) => {
            // Add defensive checks for data structure
            if (!result?.output) {
              console.warn('Missing output in result:', result);
              return null;
            }

            const { output } = result;
            const entityName = output.entity_summary?.name || 'Unknown Entity';

            return (
              <Card
                key={idx}
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
                    {entityName}
                  </Typography>

                  {/* Entity Summary */}
                  {output.entity_summary && renderObjectDetails(output.entity_summary, 'Entity Summary')}

                  {/* Risk Score and Confidence */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Risk Assessment</Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Risk Score:</strong> {output.risk_score}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Confidence Level:</strong> {output.confidence_level}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Needs Review:</strong> {output.needs_review ? 'Yes' : 'No'}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Escalation Level:</strong> {output.escalation_level}
                    </Typography>
                  </Box>

                  {/* Matches */}
                  {output.matches && output.matches.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Matches Found ({output.matches.length})
                      </Typography>
                      {output.matches.map((match, matchIdx) => (
                        <Card
                          key={matchIdx}
                          sx={{
                            mb: 2,
                            p: 2,
                            borderRadius: 2,
                            border: '1px solid #e0e0e0',
                            background: '#fafafa',
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            {match.risk_type} - {match.severity}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Source:</strong> {match.source} (Tier: {match.source_tier})
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Date:</strong> {match.date}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Summary:</strong> {match.summary}
                          </Typography>
                          {match.source_link && (
                            <Link href={match.source_link} target="_blank" rel="noopener noreferrer">
                              View Source
                            </Link>
                          )}
                          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                            <strong>Entity Confirmation:</strong> {match.entity_confirmation}
                          </Typography>
                        </Card>
                      ))}
                    </Box>
                  )}

                  {/* Search Methodology */}
                  {output.search_methodology && renderObjectDetails(output.search_methodology, 'Search Methodology')}
                </CardContent>
              </Card>
            );
          })}
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