import React from "react";
// import Image from 'material-ui-image'
import { Grid, Box, Typography } from "@material-ui/core";

const pjson = require("../package.json");

export default function appFooter() {
  return (
    <Box
      style={{
        backgroundColor: "#112",
        position: "fixed",
        left: 0,
        bottom: 0,
        width: "100%",
        "text-align": "center",
      }}
    >
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justify="center"
        style={{ minHeight: "4vh" }}
      >
        <Grid item xs={12}>
          <Typography style={{ color: "white" }}>
            Designed & Developed by CEID students
          </Typography>
          <Typography style={{ color: "white" }}>
            {`Version ${pjson.version}`}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
