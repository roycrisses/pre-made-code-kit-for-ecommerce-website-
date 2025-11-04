import React from 'react';
import { Box } from '@mui/material';

const ClothingHubLogo = ({ width = 120, height = 40, color = 'black' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        width: width,
        height: height,
      }}
    >

      {/* Brand Text */}
      <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <Box
          sx={{
            fontFamily: '"Playfair Display", serif',
            fontSize: '16px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: color,
            lineHeight: 1,
          }}
        >
          CLOTHING HUB
        </Box>
        <Box
          sx={{
            fontFamily: '"Inter", sans-serif',
            fontSize: '10px',
            fontWeight: 300,
            letterSpacing: '0.3em',
            color: color,
            opacity: 0.8,
            lineHeight: 1,
            textTransform: 'uppercase',
          }}
        >
          DRESS TO IMPRESS
        </Box>
      </Box>
    </Box>
  );
};

export default ClothingHubLogo;
