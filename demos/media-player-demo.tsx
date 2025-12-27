'use client'

import {
  MediaPlayer,
  MediaPlayerControls,
  MediaPlayerControlsOverlay,
  MediaPlayerFullscreen,
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

export function MediaPlayerDemo() {
  return (
    <div className="mx-auto w-full max-w-3xl p-10">
      <MediaPlayer>
        <MediaPlayerVideo className='aspect-video' muted autoPlay>
          <source
            src="https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/medium.mp4"
            type="video/mp4"
          />
        </MediaPlayerVideo>
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

export default MediaPlayerDemo
