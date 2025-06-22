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
  const router = useRouter();

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
            onClick={() => router.push('/')}
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
              <Card key={idx} sx={{ mb: 3, borderRadius: 3, boxShadow: 1, background: '#fff', border: '1px solid #222' }}>
                <CardContent>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: '#222', fontFamily: 'Raleway, Arial, sans-serif' }}>
                    {modelProviders[idx] ? `${modelProviders[idx]} Report for: ` : 'Report for: '}{entityName}
                  </Typography>
                  <Divider sx={{ mb: 2, borderColor: '#222' }} />

                  {output.entity_summary && renderObjectDetails(output.entity_summary, 'Entity Summary')}

                  <Divider sx={{ my: 2 }} />

                  {renderObjectDetails({
                    risk_score: output.risk_score ?? 'N/A',
                    confidence_level: output.confidence_level ?? 'N/A',
                    needs_review: output.needs_review ?? 'N/A',
                    escalation_level: output.escalation_level ?? 'N/A'
                  }, 'Risk Assessment')}

                  <Divider sx={{ my: 2 }} />

                  {output.search_methodology && renderObjectDetails(output.search_methodology, 'Search Methodology')}

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Matches ({output.matches?.length || 0})</Typography>
                    {output.matches && output.matches.length > 0 ? (
                      output.matches.map((match, matchIdx) => (
                        <Card key={matchIdx} variant="outlined" sx={{ mb: 2, background: '#fafafa' }}>
                          <CardContent>
                            {Object.entries(match).map(([key, value]) => (
                              <Typography key={key} variant="body2" sx={{ mb: 0.5 }}>
                                <strong style={{ textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}:</strong>{' '}
                                {key === 'source_link' ? (
                                  <Link href={String(value)} target="_blank" rel="noopener noreferrer">{value}</Link>
                                ) : (
                                  Array.isArray(value) ? value.join(', ') : String(value)
                                )}
                              </Typography>
                            ))}
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                        No matches found
                      </Typography>
                    )}
                  </Box>

                </CardContent>
              </Card>
            );
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
