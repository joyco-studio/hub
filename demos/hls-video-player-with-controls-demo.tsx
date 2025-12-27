'use client'

import {
  MediaPlayer,
  MediaPlayerControls,
  MediaPlayerControlsOverlay,
  MediaPlayerFullscreen,
  MediaPlayerLoading,
  MediaPlayerPiP,
  MediaPlayerPlay,
  MediaPlayerPlaybackSpeed,
  MediaPlayerSeek,
  MediaPlayerSeekBackward,
  MediaPlayerSeekForward,
  MediaPlayerTime,
  MediaPlayerVideo,
  MediaPlayerVolume,
} from '@/components/ui/media-player'
import { HLSVideoPlayer } from '@/registry/joyco/blocks/hls-video-player'

function HLSVideoPlayerWithControlsDemo() {
  return (
    <div className="mx-auto w-full max-w-3xl p-10">
      <MediaPlayer autoHide>
        <MediaPlayerVideo asChild>
          <HLSVideoPlayer
            src="https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU.m3u8"
            width={1920}
            height={1080}
          />
        </MediaPlayerVideo>
        <MediaPlayerLoading />
        <MediaPlayerControls className="flex-col items-start gap-2.5">
          <MediaPlayerControlsOverlay />
          <MediaPlayerSeek />
          <div className="flex w-full items-center gap-2">
            <div className="flex flex-1 items-center gap-2">
              <MediaPlayerPlay />
              <MediaPlayerSeekBackward />
              <MediaPlayerSeekForward />
              <MediaPlayerVolume expandable />
              <MediaPlayerTime />
            </div>
            <div className="flex items-center gap-2">
              <MediaPlayerPlaybackSpeed />
              <MediaPlayerPiP />
              <MediaPlayerFullscreen />
            </div>
          </div>
        </MediaPlayerControls>
      </MediaPlayer>
    </div>
  )
}

export default HLSVideoPlayerWithControlsDemo
