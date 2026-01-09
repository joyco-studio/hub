'use client'

import {
  ActionHintEmitter,
  useActionHint,
} from '@/registry/joyco/blocks/action-hint'
import { Button } from '@/components/ui/button'
import { Copy, Check, Download, Share2, Bookmark } from 'lucide-react'

function CopyButton() {
  const { emit } = useActionHint()
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() =>
        emit(
          <span className="flex items-center gap-1.5">
            <Check className="size-3" />
            Copied!
          </span>
        )
      }
    >
      <Copy className="size-4" />
      Copy
    </Button>
  )
}

function DownloadButton() {
  const { emit } = useActionHint()
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() =>
        emit(
          <span className="flex items-center gap-1.5">
            <Download className="size-3" />
            Downloading...
          </span>
        )
      }
    >
      <Download className="size-4" />
      Download
    </Button>
  )
}

function ShareButton() {
  const { emit } = useActionHint()
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() =>
        emit(
          <span className="flex items-center gap-1.5">
            <Share2 className="size-3" />
            Link shared!
          </span>
        )
      }
    >
      <Share2 className="size-4" />
      Share
    </Button>
  )
}

function SaveButton() {
  const { emit } = useActionHint()
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() =>
        emit(
          <span className="flex items-center gap-1.5">
            <Bookmark className="size-3" />
            Saved!
          </span>
        )
      }
    >
      <Bookmark className="size-4" />
      Save
    </Button>
  )
}

function ActionHintDemo() {
  return (
    <div className="flex min-h-32 w-full items-center justify-center p-8">
      <div className="flex flex-wrap items-center gap-2">
        <ActionHintEmitter>
          <CopyButton />
        </ActionHintEmitter>

        <ActionHintEmitter>
          <DownloadButton />
        </ActionHintEmitter>

        <ActionHintEmitter>
          <ShareButton />
        </ActionHintEmitter>

        <ActionHintEmitter>
          <SaveButton />
        </ActionHintEmitter>
      </div>
    </div>
  )
}

export default ActionHintDemo
