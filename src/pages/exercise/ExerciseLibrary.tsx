import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import Exercise from './Exercise';

const ExerciseLibrary: React.FC = () => {
  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Exercise Library
        </Typography>
        <Exercise />
      </Box>
    </Container>
  );
};

export default ExerciseLibrary;