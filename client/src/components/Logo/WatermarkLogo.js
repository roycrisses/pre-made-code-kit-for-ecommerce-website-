import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';

const WatermarkLogo = ({ 
  size = 200, 
  opacity, 
  position = 'center',
  title = 'CLOTHING HUB',
  subtitle = 'DRESS TO IMPRESS'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Auto-adjust opacity based on theme if not provided
  const defaultOpacity = theme.palette.mode === 'dark' ? 0.05 : 0.03;
  const finalOpacity = opacity !== undefined ? opacity : defaultOpacity;
  
  // Hide on very small screens to avoid interference
  if (isSmallScreen) return null;
  
  // Responsive size adjustment
  const responsiveSize = isMobile ? size * 0.7 : size;
  const getPositionStyles = () => {
    switch (position) {
      case 'center':
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
      case 'bottom-right':
        return {
          bottom: '20px',
          right: '20px',
        };
      case 'bottom-center':
        return {
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
        };
      case 'top-center':
        return {
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: finalOpacity,
        userSelect: 'none',
        transition: 'opacity 0.3s ease',
        '@media (prefers-reduced-transparency: reduce)': {
          opacity: 0
        },
        ...getPositionStyles(),
      }}
    >
      {/* Large Watermark Logo */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 1, md: 2 },
        }}
      >
        {/* Watermark Text */}
        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              fontFamily: '"Inter", sans-serif',
              fontSize: {
                xs: `clamp(${responsiveSize * 0.15}px, 4vw, ${responsiveSize * 0.2}px)`,
                md: `${responsiveSize * 0.2}px`
              },
              fontWeight: 800,
              letterSpacing: '0.1em',
              color: theme.palette.text.primary,
              opacity: 0.8,
              lineHeight: 1,
              textTransform: 'uppercase',
              mb: { xs: 0.5, md: 1 },
            }}
          >
            {title}
          </Box>
          <Box
            sx={{
              fontFamily: '"Inter", sans-serif',
              fontSize: {
                xs: `clamp(${responsiveSize * 0.08}px, 2vw, ${responsiveSize * 0.1}px)`,
                md: `${responsiveSize * 0.1}px`
              },
              fontWeight: 300,
              letterSpacing: '0.3em',
              color: theme.palette.text.primary,
              opacity: 0.8,
              lineHeight: 1,
              textTransform: 'uppercase',
            }}
          >
            {subtitle}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default React.memo(WatermarkLogo);
