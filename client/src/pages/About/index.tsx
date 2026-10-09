import { Box, Link, Typography } from "@material-ui/core";
import React from "react";

const About: React.FC = () => {
  return (
    <div style={{ margin: "auto" }}>
      <Typography variant="h4" align="center" gutterBottom>
        About
      </Typography>

      <Typography align="center" gutterBottom>
        Yasmina requested a way to see what I am listening to. Here ya go
      </Typography>

      <Typography align="center" gutterBottom>
        Visitors do not need to sign in to Spotify, and this site cannot control playback.
        When no music is playing, the page displays an idle screen until playback resumes.
      </Typography>

      <Typography align="center" gutterBottom>
        Lyrics are retrieved from LRCLIB, with Genius used as an optional fallback when configured.
        Lyrics availability and synchronization may vary by track.
      </Typography>

      <Box mt={8}>
        <Typography align="center">
          <Link href="https://vismaypatel.com" target="_blank" rel="noopener noreferrer">
            Vismay's Website
          </Link>
        </Typography>
      </Box>

    </div>
  );
};

export default About;
