import React from 'react';
// import Image from 'material-ui-image'
import {
  Grid, Box, Typography,
} from '@material-ui/core';

const pjson = require('../package.json');

export default function appFooter() {
  return (
    <Box
      style={{
        backgroundColor: '#194b8c',
        bottom: 0,
        maxWidth: '100%',
        marginTop: 'calc(5% + 60px)',
        padding: '30px',
      }}
    >
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justify="center"
        style={{ minHeight: '8vh' }}
      >
        <Grid item xs={12}>
          <Typography style={{ color: 'white' }}>
            Designed & Developed by CEID students
          </Typography>
          <Typography style={{ color: 'white' }}>
            {`Version ${pjson.version}`}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
