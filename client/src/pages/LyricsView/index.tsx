import React from "react";
import { CurrentlyPlayingState, PlayingStates } from "../../types/currentlyPlayingState";
import { ITrackLyrics } from "../../types/trackLyrics";
import Advertisement from "./Advertisement";
import Error from "./Error";
import Loading from "./Loading";
import NoTrackPlaying from "./NoTrackPlaying";
import TrackPlaying from "./TrackPlaying";
import Welcome from "./Welcome";
import { Box, Typography } from "@material-ui/core";
import HijackedImage from "../../img/facepalm.png";

interface IProps {
  user: SpotifyApi.UserObjectPrivate | null;
  currentlyPlayingSong: CurrentlyPlayingState;
  lyrics: ITrackLyrics | undefined;
  publicMode?: boolean;
}

const LyricsView: React.FunctionComponent<IProps> = ({
  user,
  currentlyPlayingSong,
  lyrics,
  publicMode = false
}) => {
  if (!publicMode && user === null) {
    return <Welcome />;
  } else if (currentlyPlayingSong.state === PlayingStates.Loading) {
    return <Loading />;
  } else if (currentlyPlayingSong.state === PlayingStates.NotPlaying) {
    return <NoTrackPlaying />;
  } else if (currentlyPlayingSong.state === PlayingStates.Error) {
    return <Error />;
  } else if (currentlyPlayingSong.currentlyPlayingObject.currently_playing_type === "ad") {
    return <Advertisement />;
  } else if (currentlyPlayingSong.currentlyPlayingObject?.device?.name === "Car") {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h4" gutterBottom>
          Spotify Hijacked!
        </Typography>
        <Typography color="textSecondary">
          The parents have hijacked my Spotify account. What they're playing in the car
          is NOT what Vismay is listening to.
        </Typography>
        <img
          src={HijackedImage}
          height="250"
          alt="Nothing Playing Right Now"
        />
      </Box>
    );
  } else {
    return (
      <TrackPlaying
        lyricDetails={lyrics}
        currentlyPlayingSong={currentlyPlayingSong}
      />
    );
  }
};

export default LyricsView;
