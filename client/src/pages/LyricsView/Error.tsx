import { Box, Typography } from "@material-ui/core";
import React from "react";

const Error: React.FunctionComponent = () => {
  return (
    <Box textAlign="center" py={8}>
      <Typography variant="h4" gutterBottom>
        Playback Temporarily Unavailable
      </Typography>
      <Typography color="textSecondary">
        The live Spotify status couldn't be reached. Please try again in a moment.
      </Typography>
    </Box>
  );
};

export default Error;
