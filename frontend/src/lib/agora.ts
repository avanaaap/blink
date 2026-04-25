/**
 * Agora RTC client wrapper for voice and video calls.
 *
 * Uses `agora-rtc-sdk-ng` (Agora Web SDK 4.x) to manage a single
 * client instance, local tracks, and remote user subscriptions.
 */

import AgoraRTC, {
  type IAgoraRTCClient,
  type IMicrophoneAudioTrack,
  type ICameraVideoTrack,
  type IAgoraRTCRemoteUser,
} from "agora-rtc-sdk-ng";

// Disable Agora SDK console logs in production
AgoraRTC.setLogLevel(
  import.meta.env.PROD ? 3 /* ERROR */ : 1 /* INFO */,
);

let client: IAgoraRTCClient | null = null;
let localAudioTrack: IMicrophoneAudioTrack | null = null;
let localVideoTrack: ICameraVideoTrack | null = null;

export type AgoraCallbacks = {
  onUserJoined?: (user: IAgoraRTCRemoteUser) => void;
  onUserLeft?: (user: IAgoraRTCRemoteUser) => void;
  onRemoteAudioReady?: (user: IAgoraRTCRemoteUser) => void;
  onRemoteVideoReady?: (
    user: IAgoraRTCRemoteUser,
    mediaType: "video",
  ) => void;
};

/**
 * Join an Agora channel for a voice-only call.
 */
export async function joinVoiceCall(
  appId: string,
  channel: string,
  token: string,
  uid: number,
  callbacks?: AgoraCallbacks,
): Promise<void> {
  client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

  _registerCallbacks(client, callbacks);

  await client.join(appId, channel, token, uid);

  localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  await client.publish([localAudioTrack]);
}

/**
 * Join an Agora channel for a video call (audio + video).
 */
export async function joinVideoCall(
  appId: string,
  channel: string,
  token: string,
  uid: number,
  callbacks?: AgoraCallbacks,
): Promise<{ videoTrack: ICameraVideoTrack }> {
  client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

  _registerCallbacks(client, callbacks);

  await client.join(appId, channel, token, uid);

  localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  localVideoTrack = await AgoraRTC.createCameraVideoTrack();
  await client.publish([localAudioTrack, localVideoTrack]);

  return { videoTrack: localVideoTrack };
}

/**
 * Leave the current channel and clean up all tracks.
 */
export async function leaveCall(): Promise<void> {
  localAudioTrack?.close();
  localVideoTrack?.close();
  localAudioTrack = null;
  localVideoTrack = null;

  if (client) {
    await client.leave();
    client = null;
  }
}

/** Toggle the local microphone on/off. */
export function toggleMute(muted: boolean): void {
  localAudioTrack?.setEnabled(!muted);
}

/** Toggle the local camera on/off. */
export function toggleVideo(enabled: boolean): void {
  localVideoTrack?.setEnabled(enabled);
}

/** Return the current local video track (for rendering). */
export function getLocalVideoTrack(): ICameraVideoTrack | null {
  return localVideoTrack;
}

// ── Internal ──────────────────────────────────────────────

function _registerCallbacks(
  c: IAgoraRTCClient,
  cbs?: AgoraCallbacks,
): void {
  c.on("user-joined", (user) => cbs?.onUserJoined?.(user));
  c.on("user-left", (user) => cbs?.onUserLeft?.(user));
  c.on("user-published", async (user, mediaType) => {
    await c.subscribe(user, mediaType);
    if (mediaType === "audio") {
      user.audioTrack?.play();
      cbs?.onRemoteAudioReady?.(user);
    } else if (mediaType === "video") {
      cbs?.onRemoteVideoReady?.(user, "video");
    }
  });
}
