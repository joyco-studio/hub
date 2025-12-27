import { HLSVideoPlayer } from '@/registry/joyco/blocks/hls-video-player'

function HLSVideoPlayerDemo() {
  return (
    <div className="px-4 py-6">
      <HLSVideoPlayer
        src="https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU.m3u8"
        width={1920}
        height={1080}
        muted
        autoPlay
        playsInline
        className="mx-auto w-full max-w-2xl overflow-hidden rounded-lg"
      />
    </div>
  )
}

export default HLSVideoPlayerDemo
