/**
 * The Audio Session API is still a draft, so it is absent from lib.dom.
 * Safari uses it to keep playback alive when the screen locks.
 */
interface AudioSession {
  type: "auto" | "playback" | "transient" | "transient-solo" | "ambient" | "play-and-record";
}

interface Navigator {
  audioSession?: AudioSession;
}
