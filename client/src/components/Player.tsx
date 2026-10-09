import { AppBar, Box, Container, Slider, makeStyles } from "@material-ui/core";
import React from "react";
import SpotifyLogoRoundImage from "../img/spotify-logo-round.png";
import { CurrentlyPlayingState } from "../types/currentlyPlayingState";
import { IToken } from "../types/token";
import { formatMilliseconds } from "../utils";
import useSmoothProgress from "../hooks/useSmoothProgress";

const placeholder1PxImage =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mO8+x8AAr8B3gzOjaQAAAAASUVORK5CYII=";

interface PlayerProps {
  currentlyPlayingSong: CurrentlyPlayingState;
  token: IToken | null;
}

const Player: React.FC<PlayerProps> = ({
  currentlyPlayingSong,
  token
}) => {
  const classes = useStyles();

  let albumArt =
    currentlyPlayingSong.currentlyPlayingObject?.item?.album.images?.[0]?.url;

  let title =
    currentlyPlayingSong.currentlyPlayingObject?.item?.name ?? "---";

  let artist =
    currentlyPlayingSong.currentlyPlayingObject?.item?.artists
      .map(a => a.name)
      .join(", ") ?? "---";

  let durationMs =
    currentlyPlayingSong.currentlyPlayingObject?.item?.duration_ms ?? 0;

  const progressMs =
    currentlyPlayingSong.currentlyPlayingObject?.progress_ms ?? 0;

  const isPlaying =
    currentlyPlayingSong.currentlyPlayingObject?.is_playing ?? false;

  if (
    currentlyPlayingSong.currentlyPlayingObject?.currently_playing_type ===
    "ad"
  ) {
    albumArt = SpotifyLogoRoundImage;
    title = "Advertisement";
    artist = "Spotify";
    durationMs = Math.max(progressMs, 30 * 1000);
  }

  const { progress: smoothedProgressMs } = useSmoothProgress(
    progressMs,
    durationMs,
    isPlaying,
    token
  );

  const displayedProgress = Math.min(
    Math.max(smoothedProgressMs, 0),
    durationMs || 1
  );

  return (
    <AppBar
      position="fixed"
      color="primary"
      className={classes.appBar}
    >
      <Container maxWidth="md">
        <div className={classes.playerWrapper}>
          <div className={classes.songWrapper}>
            <div className={classes.songAlbumArtWrapper}>
              <img
                src={albumArt ?? placeholder1PxImage}
                className={classes.songAlbumArt}
                alt="Album art for current song"
              />
            </div>

            <div className={classes.songDetail} title={title}>
              {title}
            </div>

            <div className={classes.songDetail} title={artist}>
              {artist}
            </div>
          </div>

          <Box
            display="inline-flex"
            alignItems="center"
            className={classes.sliderWrapper}
          >
            <span className={classes.timeControl}>
              {formatMilliseconds(displayedProgress)}
            </span>

            <Slider
              value={displayedProgress}
              valueLabelDisplay="off"
              min={0}
              max={durationMs || 1}
              disabled
              className={classes.slider}
            />

            <span className={classes.timeControl}>
              {formatMilliseconds(durationMs)}
            </span>
          </Box>
        </div>
      </Container>
    </AppBar>
  );
};

const useStyles = makeStyles(theme => ({
  appBar: {
    backgroundColor: theme.palette.background.paper,
    top: "auto",
    bottom: 0,
    background: "#f8f9fa",
    paddingTop: 6,
    paddingBottom: 6
  },

  playerWrapper: {
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr)",
    alignItems: "center",
    gridColumnGap: 16,

    [theme.breakpoints.down("xs")]: {
      gridTemplateColumns: "minmax(0, 1fr)",
      gridRowGap: 6
    }
  },

  songWrapper: {
    display: "inline-grid",
    gridTemplateColumns: "auto minmax(0, 1fr)",
    gridTemplateRows: "1fr 1fr",
    gridColumnGap: 5,
    maxWidth: 250,
    minWidth: 0
  },

  songAlbumArtWrapper: {
    gridColumnStart: 1,
    gridColumnEnd: 2,
    gridRowStart: 1,
    gridRowEnd: 3
  },

  songAlbumArt: {
    height: 40,
    width: 40,
    objectFit: "cover"
  },

  songDetail: {
    color: theme.palette.text.primary,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },

  timeControl: {
    color: theme.palette.text.primary,
    whiteSpace: "nowrap",
    flexShrink: 0
  },

  sliderWrapper: {
    minWidth: 0,
    width: "100%",
    boxSizing: "border-box",

    [theme.breakpoints.down("xs")]: {
      gridColumnStart: 1,
      gridColumnEnd: 2
    }
  },

  slider: {
    minWidth: 0,
    marginLeft: 10,
    marginRight: 10,

    "&.Mui-disabled": {
      color: theme.palette.primary.main
    },

    "& .MuiSlider-thumb.Mui-disabled": {
      width: 10,
      height: 10
    },

    [theme.breakpoints.down("xs")]: {
      padding: "10px 0"
    }
  }
}));

export default Player;