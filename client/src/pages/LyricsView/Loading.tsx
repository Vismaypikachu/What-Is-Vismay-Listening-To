import { Box, CircularProgress, Typography } from "@material-ui/core";
import React from "react";

const Loading: React.FunctionComponent = () => {
  return (
    <Box textAlign="center" py={8}>
      <Typography variant="h4" gutterBottom>
        Checking What's Playing
      </Typography>
      <CircularProgress size={30} />
    </Box>
  );
};

export default Loading;
