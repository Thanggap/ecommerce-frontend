import React from 'react';
import { Alert, Box, Typography } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface FDADisclaimerProps {
  variant?: 'standard' | 'compact' | 'banner';
  severity?: 'warning' | 'info';
}

const FDADisclaimer: React.FC<FDADisclaimerProps> = ({ 
  variant = 'standard',
  severity = 'info'
}) => {
  const standardText = "These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.";
  
  const healthWarning = "Consult your healthcare provider before use, especially if you are pregnant, nursing, taking medication, or have a medical condition.";

  if (variant === 'compact') {
    return (
      <Typography 
        variant="caption" 
        color="text.secondary" 
        sx={{ 
          display: 'block', 
          fontStyle: 'italic',
          fontSize: '0.75rem',
          lineHeight: 1.4
        }}
      >
        {standardText}
      </Typography>
    );
  }

  if (variant === 'banner') {
    return (
      <Alert 
        severity={severity}
        icon={<WarningAmberIcon />}
        sx={{ 
          mb: 2,
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
          Important Health Information
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {healthWarning}
        </Typography>
        <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
          {standardText}
        </Typography>
      </Alert>
    );
  }

  // Standard variant
  return (
    <Box 
      sx={{ 
        p: 2, 
        bgcolor: '#f5f5f5', 
        borderRadius: 1,
        border: '1px solid #e0e0e0'
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
        <strong>FDA Disclaimer:</strong> {standardText}
      </Typography>
    </Box>
  );
};

export default FDADisclaimer;
