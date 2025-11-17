"use client";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { useState } from "react";
import { Marquee } from "@/registry/joyco/blocks/marquee/marquee";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowLeft, Play, Pause } from "lucide-react";

const ITEMS = [
  { id: 1, logo: "/ibm.svg", text: "IBM" },
  { id: 2, logo: "/nasa.svg", text: "NASA" },
  { id: 3, logo: "/spacex.svg", text: "SpaceX" },
  { id: 4, logo: "/valve.svg", text: "Valve" },
  { id: 1, logo: "/ibm.svg", text: "IBM" },
  { id: 2, logo: "/nasa.svg", text: "NASA" },
  { id: 3, logo: "/spacex.svg", text: "SpaceX" },
  { id: 4, logo: "/valve.svg", text: "Valve" },
];

export function MarqueeDemo() {
  const [speedPercent, setSpeedPercent] = useState(50);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [play, setPlay] = useState(true);

  const speed = speedPercent / 100;
  const percClassName = "text-sm absolute inset-0 z-10 flex items-center pointer-events-none justify-center font-medium whitespace-now uppercase nowrap font-mono"

  return (
    <div className="not-prose">
      <Card className="overflow-hidden rounded-b-none">
        <div className="py-6">
          <Marquee
            speed={100}
            speedFactor={speed}
            direction={direction}
            play={play}
          >
            <div className="flex items-center gap-8 px-4">
              {ITEMS.map((item) => (
                <img key={item.id} src={item.logo} alt={item.text} className="h-8 w-auto" />
              ))}
            </div>
          </Marquee>
        </div>
      </Card>

      <div className="border-t-0 bg-fd-card border border-fd-border rounded-b-lg overflow-hidden">
        <div className="flex">
          <ControlButton onClick={() => setPlay(!play)} className={cn(!play && "bg-fd-accent/80 dark:bg-fd-accent/50")}>
            {play ? (
              <>
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Play
              </>
            )}
          </ControlButton>

          <ControlButton
            onClick={() => setDirection(1)}
            className={cn(direction === 1 && "bg-fd-accent/80 dark:bg-fd-accent/50")}
            disabled={direction === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Left
          </ControlButton>

          <ControlButton
            onClick={() => setDirection(-1)}
            className={cn(direction === -1 && "bg-fd-accent/80 dark:bg-fd-accent/50")}
            disabled={direction === -1}
          >
            Right
            <ArrowRight className="w-4 h-4 mr-1" />
          </ControlButton>

          <div className="flex-1">
            <SliderPrimitive.Root
              className={cn(
                "relative flex w-full h-full touch-none select-none items-center"
              )}
              value={[speedPercent]}
              onValueChange={(value) => setSpeedPercent(Math.max(10, Math.min(100, value[0])))}
            >
              <SliderPrimitive.Track className="relative h-full w-full grow overflow-hidden cursor-ew-resize">
                <SliderPrimitive.Range className="absolute h-full bg-fd-primary" />
                <span 
                  className={cn(percClassName, "text-fd-background")}
                  style={{
                    clipPath: `inset(0 ${100 - speedPercent}% 0 0)`
                  }}
                >
                  {speedPercent} px/s
                </span>
                <span 
                  className={cn(percClassName, "text-fd-foreground")}
                  style={{
                    clipPath: `inset(0 0 0 ${speedPercent}%)`
                  }}
                >
                  {speedPercent} px/s
                </span>
              </SliderPrimitive.Track>
            </SliderPrimitive.Root>
          </div>
        </div>
      </div>
    </div>
  );
}

const ControlButton = ({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button>) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "hover:bg-fd-accent/50 disabled:opacity-100 rounded-none flex-1 uppercase font-mono",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};
