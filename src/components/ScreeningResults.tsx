import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import * as cheerio from 'cheerio';

interface Match {
  risk_type: string;
  source: string;
  source_tier: string;
  severity: string;
  date: string;
  summary: string;
  source_link: string;
  entity_confirmation: string;
}

interface EntitySummary {
  name: string;
  identifiers_used: string;
  search_date: string;
  summary: string;
}

interface ParsedData {
  source: string;
  matches: Match[];
  risk_score: number;
  confidence_level: number;
  escalation_level: string;
  entity_summary: EntitySummary;
}

interface ScreeningData {
  html: string;
}

const parseHtmlData = (htmlString: string): ParsedData | null => {
  if (!htmlString) {
    return null;
  }

  try {
    const $ = cheerio.load(htmlString);
    const source = $('h3').first().text() || 'Unknown Source';
    
    // Parse entity summary
    const entitySummary: EntitySummary = {
      name: $('td:contains("name") + td').first().text() || 'Unknown',
      identifiers_used: $('td:contains("identifiers_used") + td').first().text() || 'N/A',
      search_date: $('td:contains("search_date") + td').first().text() || 'N/A',
      summary: $('td:contains("summary") + td').first().text() || 'No summary available'
    };

    // Parse matches
    const matches: Match[] = [];
    $('ul li').each((_, element) => {
      const match: Match = {
        risk_type: $(element).find('td:contains("risk_type") + td').first().text() || 'Unknown',
        source: $(element).find('td:contains("source") + td').first().text() || 'Unknown',
        source_tier: $(element).find('td:contains("source_tier") + td').first().text() || 'Unknown',
        severity: $(element).find('td:contains("severity") + td').first().text() || 'Unknown',
        date: $(element).find('td:contains("date") + td').first().text() || 'N/A',
        summary: $(element).find('td:contains("summary") + td').first().text() || 'No summary available',
        source_link: $(element).find('td:contains("source_link") + td').first().text() || '#',
        entity_confirmation: $(element).find('td:contains("entity_confirmation") + td').first().text() || 'Unknown'
      };
      
      // Only add if we have at least some valid data
      if (match.risk_type && match.source) {
        matches.push(match);
      }
    });

    // Parse scores and levels with default values
    const risk_score = parseInt($('td:contains("risk_score") + td').first().text()) || 0;
    const confidence_level = parseInt($('td:contains("confidence_level") + td').first().text()) || 0;
    const escalation_level = $('td:contains("escalation_level") + td').first().text() || 'Unknown';

    return {
      source,
      matches,
      risk_score,
      confidence_level,
      escalation_level,
      entity_summary: entitySummary
    };
  } catch (error) {
    console.error('Error parsing HTML data:', error);
    return null;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'success';
    default:
      return 'default';
  }
};

const ScreeningResults: React.FC<{ data: ScreeningData[] }> = ({ data }) => {
  if (!Array.isArray(data)) {
    return (
      <Box sx={{ width: '100%', mt: 3 }}>
        <Typography color="error">
          Invalid data format received
        </Typography>
      </Box>
    );
  }

  // Parse the HTML data into structured format
  const parsedData = data
    .map(item => item?.html ? parseHtmlData(item.html) : null)
    .filter((item): item is ParsedData => item !== null);

  if (parsedData.length === 0) {
    return (
      <Box sx={{ width: '100%', mt: 3 }}>
        <Typography>
          No valid screening results to display
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Screening Results
      </Typography>
      
      {parsedData.map((sourceData, sourceIndex) => (
        <Box key={sourceIndex} sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
            Source: {sourceData.source}
          </Typography>

          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Entity Summary
            </Typography>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell>{sourceData.entity_summary.name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Identifiers Used</strong></TableCell>
                  <TableCell>{sourceData.entity_summary.identifiers_used}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Search Date</strong></TableCell>
                  <TableCell>{sourceData.entity_summary.search_date}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Summary</strong></TableCell>
                  <TableCell>{sourceData.entity_summary.summary}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>

          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Risk Type</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Summary</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sourceData.matches.map((match: Match, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{match.risk_type}</TableCell>
                    <TableCell>
                      {match.source}
                      <Typography variant="caption" display="block">
                        Tier: {match.source_tier}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={match.severity}
                        color={getSeverityColor(match.severity) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{match.date}</TableCell>
                    <TableCell>{match.summary}</TableCell>
                    <TableCell>
                      {match.source_link !== '#' ? (
                        <a href={match.source_link} target="_blank" rel="noopener noreferrer">
                          View Source
                        </a>
                      ) : (
                        'No source available'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Paper sx={{ p: 2, flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                Risk Score
              </Typography>
              <Typography variant="h4">
                {sourceData.risk_score}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                Confidence Level
              </Typography>
              <Typography variant="h4">
                {sourceData.confidence_level}%
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                Escalation Level
              </Typography>
              <Typography variant="h4">
                {sourceData.escalation_level}
              </Typography>
            </Paper>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default ScreeningResults; 