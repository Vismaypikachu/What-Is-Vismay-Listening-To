import { Box, Container, CssBaseline, ThemeProvider } from "@material-ui/core";
import { setBasepath, useRedirect, useRoutes } from "hookrouter";
import React from "react";
import MetaTags from "./components/MetaTags";
import Navigation from "./components/Navigation";
import Player from "./components/Player";
import config from "./config";
import useLyrics from "./hooks/useLyrics";
import usePublicCurrentlyPlayingSong from "./hooks/usePublicCurrentlyPlayingSong";
import useThemeState from "./hooks/useThemeState";
import About from "./pages/About";
import LyricsView from "./pages/LyricsView";
import NotFound from "./pages/NotFound";
import { PlayingStates } from "./types/currentlyPlayingState";

const App: React.FC = () => {
  if (config.client.basename !== undefined) {
    setBasepath(config.client.basename);
  }

  const currentlyPlayingSong = usePublicCurrentlyPlayingSong();
  const lyrics = useLyrics(currentlyPlayingSong);
  const { theme, toggleTheme, darkModeEnabled } = useThemeState();

  const routes = {
    "/": () => (
      <MetaTags
        route="/"
        titlePrefix="Currently Listening - "
        description="See what Vismay is listening to on Spotify, with synchronized lyrics."
      >
        <LyricsView
          user={null}
          currentlyPlayingSong={currentlyPlayingSong}
          lyrics={lyrics}
          publicMode={true}
        />
      </MetaTags>
    ),
    "/about": () => (
      <MetaTags
        route="/about"
        titlePrefix="About - "
        description="A public, read-only view of Vismay's current Spotify listening activity and synchronized lyrics."
      >
        <About />
      </MetaTags>
    )
  };
  const routeResult = useRoutes(routes);
  useRedirect("/about/", "/about");

  const showPlayer =
    (currentlyPlayingSong.state === PlayingStates.Playing ||
      currentlyPlayingSong.state === PlayingStates.Paused) &&
    currentlyPlayingSong.currentlyPlayingObject !== null;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ display: "grid", gridTemplateRows: "auto 1fr auto", minHeight: "100vh" }}>
        <Navigation
          user={null}
          onLogout={() => undefined}
          onThemeToggle={toggleTheme}
          isDarkMode={darkModeEnabled}
          publicMode={true}
        />

        <Box py={3} style={{ overflow: "auto" }}>
          <Container maxWidth="md">{routeResult ?? <NotFound />}</Container>
        </Box>

        {showPlayer ? (
          <Player
            currentlyPlayingSong={currentlyPlayingSong}
            token={null}
          />
        ) : null}
      </div>
    </ThemeProvider>
  );
};

export default App;
