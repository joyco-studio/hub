'use client'

import * as React from 'react'
import type Hls from 'hls.js'
import type { ErrorData, ManifestParsedData, LevelSwitchedData } from 'hls.js'
import { useComposedRefs } from '@/lib/compose-refs'

/* -------------------------------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------------------------------*/

type HLSErrorType = 'network' | 'media' | 'fatal' | 'other'

export interface HLSVideoError {
  type: HLSErrorType
  message: string
  fatal: boolean
  details?: string
}

export interface HLSVideoPlayerProps extends Omit<
  React.VideoHTMLAttributes<HTMLVideoElement>,
  'src' | 'width' | 'height' | 'onError'
> {
  /** Ref to the underlying video element */
  ref?: React.Ref<HTMLVideoElement>
  /** The HLS stream URL (.m3u8) or regular video source */
  src: string
  /** Video width (required for aspect ratio) */
  width: number
  /** Video height (required for aspect ratio) */
  height: number
  /** Enable debug logging */
  debug?: boolean
  /** Custom error handler */
  onHlsError?: (error: HLSVideoError) => void
  /** Native video error handler */
  onVideoError?: React.ReactEventHandler<HTMLVideoElement>
  /** Called when the video is ready to play */
  onReady?: () => void
  /** Called when HLS.js library is loaded (only when native HLS not supported) */
  onHlsLoaded?: () => void
  /** Start time in seconds */
  startTime?: number
  /** Maximum resolution to use (e.g., 720, 1080) */
  maxResolution?: number
  /** Minimum resolution to use (e.g., 480, 720) */
  minResolution?: number
}

/* -------------------------------------------------------------------------------------------------
 * Utils
 * -------------------------------------------------------------------------------------------------*/

function supportsHlsNatively(): boolean {
  if (typeof window === 'undefined') return false
  const video = document.createElement('video')
  return (
    video.canPlayType('application/vnd.apple.mpegurl') !== '' ||
    video.canPlayType('audio/mpegurl') !== ''
  )
}

function isHlsSource(src: string): boolean {
  return src.includes('.m3u8') || src.includes('application/vnd.apple.mpegurl')
}

function createHlsError(
  type: HLSErrorType,
  message: string,
  fatal: boolean,
  details?: string
): HLSVideoError {
  return { type, message, fatal, details }
}

/* -------------------------------------------------------------------------------------------------
 * HLSVideoPlayer
 * -------------------------------------------------------------------------------------------------*/

export function HLSVideoPlayer({
  ref,
  src,
  width,
  height,
  debug = false,
  onHlsError,
  onVideoError,
  onReady,
  onHlsLoaded,
  startTime,
  maxResolution,
  minResolution,
  autoPlay,
  ...videoProps
}: HLSVideoPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const hlsRef = React.useRef<Hls | null>(null)
  const [isUsingHls, setIsUsingHls] = React.useState(false)

  const log = React.useCallback(
    (...args: unknown[]) => {
      if (debug) {
        console.log('[HLSVideoPlayer]', ...args)
      }
    },
    [debug]
  )

  const handleError = React.useCallback(
    (error: HLSVideoError) => {
      log('Error:', error)
      onHlsError?.(error)
    },
    [onHlsError, log]
  )

  const composedRef = useComposedRefs(ref, videoRef)

  // Initialize HLS or native playback
  React.useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

    let hls: Hls | null = null
    let destroyed = false

    const setupPlayback = async () => {
      const isHls = isHlsSource(src)
      const hasNativeSupport = supportsHlsNatively()

      log('Source:', src)
      log('Is HLS:', isHls)
      log('Has native HLS support:', hasNativeSupport)

      // If it's not an HLS source or browser has native support, use native playback
      if (!isHls || hasNativeSupport) {
        log('Using native playback')
        setIsUsingHls(false)
        video.src = src

        if (startTime && startTime > 0) {
          video.currentTime = startTime
        }

        return
      }

      // Load HLS.js dynamically only when needed
      try {
        log('Loading HLS.js...')
        const HlsModule = await import('hls.js')
        const HlsClass = HlsModule.default

        if (destroyed) return

        if (!HlsClass.isSupported()) {
          handleError(
            createHlsError(
              'fatal',
              'HLS is not supported in this browser',
              true
            )
          )
          return
        }

        onHlsLoaded?.()
        log('HLS.js loaded, initializing...')

        hls = new HlsClass({
          debug,
          startPosition: startTime ?? -1,
          capLevelToPlayerSize: true,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
        })

        hlsRef.current = hls
        setIsUsingHls(true)

        // Handle HLS events
        hls.on(
          HlsClass.Events.MANIFEST_PARSED,
          (_event, data: ManifestParsedData) => {
            if (destroyed) return
            log('Manifest parsed, levels:', data.levels.length)

            // Apply resolution constraints
            if (maxResolution || minResolution) {
              const availableLevels = data.levels.map((level, i) => ({
                height: level.height,
                width: level.width,
                bitrate: level.bitrate,
                index: i,
              }))

              const validLevels = availableLevels.filter((l) => {
                if (maxResolution && l.height > maxResolution) return false
                if (minResolution && l.height < minResolution) return false
                return true
              })

              if (validLevels.length > 0 && maxResolution && hls) {
                // Set to highest valid level
                const maxLevel = validLevels.reduce((prev, curr) =>
                  curr.height > prev.height ? curr : prev
                )
                hls.currentLevel = maxLevel.index
              }
            }

            onReady?.()

            if (autoPlay) {
              video.play().catch((e) => {
                log('Autoplay failed:', e)
              })
            }
          }
        )

        hls.on(
          HlsClass.Events.LEVEL_SWITCHED,
          (_event, data: LevelSwitchedData) => {
            if (destroyed) return
            log('Level switched to:', data.level)
          }
        )

        hls.on(HlsClass.Events.ERROR, (_event, data: ErrorData) => {
          if (destroyed) return
          log('HLS error:', data)

          if (data.fatal) {
            switch (data.type) {
              case HlsClass.ErrorTypes.NETWORK_ERROR:
                handleError(
                  createHlsError(
                    'network',
                    'Network error occurred',
                    true,
                    data.details
                  )
                )
                // Try to recover
                hls?.startLoad()
                break
              case HlsClass.ErrorTypes.MEDIA_ERROR:
                handleError(
                  createHlsError(
                    'media',
                    'Media error occurred',
                    true,
                    data.details
                  )
                )
                // Try to recover
                hls?.recoverMediaError()
                break
              default:
                handleError(
                  createHlsError(
                    'fatal',
                    'Fatal error occurred',
                    true,
                    data.details
                  )
                )
                hls?.destroy()
                break
            }
          } else {
            handleError(
              createHlsError(
                data.type === HlsClass.ErrorTypes.NETWORK_ERROR
                  ? 'network'
                  : data.type === HlsClass.ErrorTypes.MEDIA_ERROR
                    ? 'media'
                    : 'other',
                'Non-fatal error occurred',
                false,
                data.details
              )
            )
          }
        })

        hls.attachMedia(video)
        hls.loadSource(src)
      } catch (error) {
        log('Failed to load HLS.js:', error)
        handleError(
          createHlsError(
            'fatal',
            'Failed to load HLS library',
            true,
            String(error)
          )
        )
      }
    }

    setupPlayback()

    return () => {
      destroyed = true
      if (hls) {
        log('Destroying HLS instance')
        hls.destroy()
        hlsRef.current = null
      }
    }
  }, [
    src,
    debug,
    startTime,
    maxResolution,
    minResolution,
    autoPlay,
    onReady,
    onHlsLoaded,
    handleError,
    log,
  ])

  // Handle native video errors
  const handleVideoError = React.useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = e.currentTarget
      const error = video.error

      if (error) {
        let errorType: HLSErrorType = 'other'
        if (error.code === MediaError.MEDIA_ERR_NETWORK) {
          errorType = 'network'
        } else if (
          error.code === MediaError.MEDIA_ERR_DECODE ||
          error.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
        ) {
          errorType = 'media'
        }

        handleError(
          createHlsError(errorType, error.message || 'Video error', true)
        )
      }

      onVideoError?.(e)
    },
    [handleError, onVideoError]
  )

  const handleCanPlay = React.useCallback(() => {
    // Only call onReady for native playback
    if (!isUsingHls) {
      onReady?.()
    }
  }, [isUsingHls, onReady])

  const aspectRatio = width / height

  return (
    <video
      ref={composedRef}
      width={width}
      height={height}
      autoPlay={autoPlay}
      style={{
        aspectRatio,
        ...videoProps.style,
      }}
      onError={handleVideoError}
      onCanPlay={handleCanPlay}
      {...videoProps}
    />
  )
}
