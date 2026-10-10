import { Box, Typography } from "@material-ui/core";
import React from "react";
import MusicNoteIcon from "@material-ui/icons/MusicNote";

const NoTrackPlaying: React.FunctionComponent = () => {
  return (
    <Box textAlign="center" py={8}>
      <MusicNoteIcon style={{ fontSize: 56, opacity: 0.55 }} />
      <Typography variant="h4" gutterBottom>
        Nothing Playing Right Now
      </Typography>
      <Typography color="textSecondary">
        When Vismay starts playing music on Spotify, the song and synchronized lyrics will appear here.
        <br />
        He's probably lying on the couch or doomscrolling waiting for something to do.
      </Typography>
    </Box>
  );
};

export default NoTrackPlaying;
