"use client";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { useState } from "react";
import { Marquee } from "@/registry/joyco/blocks/marquee";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowLeft, Play, Pause } from "lucide-react";

// Logo Components with theme support
const NasaLogo = ({ className }: { className?: string }) => (
  <svg
    version="1.1"
    x="0px"
    y="0px"
    width="508.204px"
    height="141.732px"
    viewBox="0 0 508.204 141.732"
    enableBackground="new 0 0 508.204 141.732"
    xmlSpace="preserve"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g id="main_layer" className="fill-current">
      <g>
        <path d="M91.991,104.699c1.576,5.961,4.119,8.266,8.613,8.266c4.659,0,7.102-2.799,7.102-8.266V3.2h29.184v101.499 c0,14.307-1.856,20.506-9.11,27.762c-5.228,5.229-14.871,9.271-27.047,9.271c-9.837,0-19.25-3.256-25.253-9.27 c-5.263-5.273-8.154-10.689-12.672-27.764L44.9,37.033c-1.577-5.961-4.119-8.265-8.613-8.265c-4.66,0-7.103,2.798-7.103,8.265 v101.5H0v-101.5C0,22.727,1.857,16.527,9.111,9.271C14.337,4.044,23.981,0,36.158,0c9.837,0,19.25,3.257,25.253,9.27 c5.263,5.273,8.154,10.689,12.672,27.764L91.991,104.699z" />
        <path d="M478.038,138.533L444.334,33.096c-0.372-1.164-0.723-2.152-1.263-2.811 c-0.926-1.127-2.207-1.719-3.931-1.719c-1.723,0-3.004,0.592-3.931,1.719c-0.539,0.658-0.891,1.646-1.262,2.811l-33.703,105.437 h-30.167l36.815-115.177c1.918-6,4.66-11.094,8.139-14.488C421.002,3.047,428.038,0,439.141,0s18.14,3.047,24.109,8.867 c3.479,3.395,6.221,8.488,8.14,14.488l36.814,115.177H478.038z" />
        <path d="M328.878,138.533c19.12,0,28.446-4.062,35.814-11.389c8.153-8.105,12.053-16.973,12.053-30.213 c0-11.699-4.283-22.535-10.804-29.019c-8.526-8.479-19.116-11.151-36.384-11.151L305.37,56.76c-9.242,0-12.925-1.117-15.839-3.98 c-2.001-1.964-2.939-4.885-2.939-8.328c0-3.559,0.857-7.074,3.303-9.475c2.171-2.131,5.13-3.109,10.816-3.109h69.903V3.2H306.05 c-19.12,0-28.445,4.063-35.814,11.389c-8.152,8.105-12.053,16.972-12.053,30.212c0,11.701,4.283,22.536,10.804,29.019 c8.527,8.479,19.116,11.152,36.384,11.152l24.188,0.002c9.242,0,12.925,1.115,15.839,3.979c2.001,1.965,2.939,4.885,2.939,8.328 c0,3.559-0.857,7.074-3.302,9.475c-2.172,2.131-5.131,3.109-10.817,3.109h-72.094l-27.651-86.509 c-1.918-6-4.66-11.094-8.139-14.488C220.363,3.047,213.327,0,202.224,0s-18.14,3.047-24.108,8.867 c-3.48,3.395-6.221,8.488-8.139,14.488l-36.815,115.177h30.166l33.704-105.437c0.372-1.164,0.723-2.152,1.263-2.811 c0.926-1.127,2.208-1.719,3.931-1.719s3.004,0.592,3.931,1.719c0.54,0.658,0.891,1.646,1.262,2.811l33.704,105.437H328.878z" />
      </g>
    </g>
  </svg>
);

const ValveLogo = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 43.66459 12.37425"
    height="283.39902"
    width="1000"
    className={className}
  >
    <path
      className="fill-current"
      d="M 0.00164434,-1.2594915e-4 43.66459,0.03440491 V 12.374376 c 0,0 -29.111371,0 -43.66459,0 C 0,8.2832608 0.00164434,-1.2594915e-4 0.00164434,-1.2594915e-4 Z M 1.2587413,1.3260307 v 9.7871373 c 0,0 27.4308577,0 41.1471077,0 0,-3.2640454 0,-6.5247693 0,-9.7871373 -13.71625,0 -41.1471077,0 -41.1471077,0"
    />
    <path
      className="fill-current"
      d="M 3.8099326,2.5839498 H 5.2454402 L 6.6431282,8.0727519 8.0054627,2.5839498 H 9.5100321 L 7.3057966,9.8568934 H 5.977171 L 3.8099326,2.5839498"
    />
    <path
      className="fill-current"
      d="m 13.703918,2.5839498 h 1.958407 l 2.062001,7.2729436 H 16.256754 L 15.766741,8.0390437 h -2.167238 c 0,0 -0.375732,1.4618497 -0.455482,1.7824957 -0.43575,0.03454 -1.502104,0 -1.502104,0 z m 0.94385,1.2250323 -0.76955,3.0749133 h 1.608164 L 14.647768,3.8089821"
    />
    <path
      className="fill-current"
      d="m 21.290896,2.5839498 c 0.462882,0 0.933163,0 1.399333,0 0,2.0159592 0,4.0343849 0,6.0479102 1.010446,0 2.026647,0 3.038737,0 0,0.4119071 0,0.8106604 0,1.2242104 -1.491414,0 -2.98283,0 -4.473422,0 0,-2.4057004 -0.06085,-4.9281158 0.03535,-7.2721206"
    />
    <path
      className="fill-current"
      d="m 27.477721,2.5839498 h 1.469216 l 1.396866,5.4197404 1.363979,-5.4197404 h 1.468395 L 30.972763,9.8568934 H 29.678669 L 27.477721,2.5839498"
    />
    <path
      className="fill-current"
      d="m 36.216559,2.5839498 c 0,0 2.004448,0 3.007495,0 0,0.3124244 0,0.9446725 0,0.9446725 h -1.95923 c 0,0 0,0.6971997 0,1.0474438 0.594429,0 1.188857,0 1.784108,0 0,0.3116022 0,0.6330703 0,0.9446725 -0.595251,0 -1.189679,0 -1.784108,0 0,0.3592881 0,0.7210426 0,1.0819749 0.653625,0 1.95923,0 1.95923,0 V 7.5482079 H 36.18285 l 0.03371,-4.9642581"
    />
  </svg>
);

const SpaceXLogo = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 50" className={className}>
    <g className="letter_s fill-current">
      <path d="M37.5 30.5H10.9v-6.6h34.3c-.9-2.8-3.8-5.4-8.9-5.4H11.4c-5.7 0-9 2.1-9 6.7v4.9c0 4 3.4 6.3 8.4 6.3h26.9v7H1.5c.9 3.8 3.8 5.8 9 5.8h27.1c5.7 0 8.5-2.2 8.5-6.9v-4.9c0-4.3-3.3-6.6-8.6-6.9z" />
    </g>
    <g className="letter_p fill-current">
      <path d="M91.8 18.6H59v30.7h9.3V37.5h24.2c6.7 0 10.4-2.3 10.4-7.7v-3.4c-.1-5-4.3-7.8-11.1-7.8zm3 9.8c0 2.2-.4 3.4-4 3.4H68.3l.1-8h22c4 0 4.5 1.2 4.5 3.3v1.3z" />
    </g>
    <g className="letter_a fill-current">
      <polygon points="129.9,17.3 124.3,24.2 133.8,37.3 114,37.3 109.1,42.5 137.7,42.5 142.6,49.3 153.6,49.3" />
    </g>
    <g className="letter_c fill-current">
      <path d="M171.4 23.9h34.8c-.9-3.6-4.4-5.4-9.4-5.4h-26c-4.5 0-8.8 1.8-8.8 6.7v17.2c0 4.9 4.3 6.7 8.8 6.7h26.3c6 0 8.1-1.7 9.1-5.8h-34.8V23.9z" />
    </g>
    <g className="letter_e fill-current">
      <polygon points="228.3,43.5 228.3,34.1 247,34.1 247,28.9 218.9,28.9 218.9,49.3 260.4,49.3 260.4,43.5" />
      <rect width="41.9" height="5.4" x="219.9" y="18.6" />
    </g>
    <g className="letter_x fill-current">
      <path d="M287.6 18.6H273l17.2 12.6c2.5-1.7 5.4-3.5 8-5l-10.6-7.6zm21.2 15.7c-2.5 1.7-5 3.6-7.4 5.4l13 9.5h14.7l-20.3-14.9z" />
    </g>
    <g className="letter_swoosh fill-current">
      <path d="M399 .7c-80 4.6-117 38.8-125.3 46.9l-1.7 1.6h14.8C326.8 9.1 384.3 2 399 .7z" />
    </g>
  </svg>
);

const IBMLogo = ({ className }: { className?: string }) => (
  <svg
    version="1.1"
    id="IBM_logo_8-bar_blue"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    x="0px"
    y="0px"
    width="1075px"
    height="401.15px"
    viewBox="0 0 1075 401.15"
    enableBackground="new 0 0 1000 401.15"
    xmlSpace="preserve"
    className={className}
  >
    <g id="IBM_logo" className="fill-current">
      <g id="I">
        <rect y="373.17" width="194.43" height="27.932" />
        <rect y="319.83" width="194.43" height="27.932" />
        <rect x="55.468" y="266.54" width="83.399" height="27.932" />
        <rect x="55.468" y="213.25" width="83.399" height="27.932" />
        <rect x="55.468" y="159.96" width="83.399" height="27.932" />
        <rect x="55.468" y="106.58" width="83.399" height="27.932" />
        <rect y="53.288" width="194.43" height="27.932" />
        <rect width="194.43" height="27.932" />
      </g>
      <g id="B">
        <path d="m222.17 400.85 207.11 0.297c27.734 0 52.793-10.697 71.513-27.932h-278.62z" />
        <path d="m222.17 347.76h299.03c5.051-8.617 8.815-18.027 11.094-27.932h-310.12z" />
        <rect x="277.73" y="266.54" width="83.3" height="27.932" />
        <path d="m444.43 266.54v27.932h90.927c0-9.608-1.288-19.017-3.764-27.932z" />
        <path d="m497.92 213.25h-220.19v27.932h243.46c-6.34-10.698-14.165-20.107-23.277-27.932z" />
        <path d="m277.73 159.96v27.932h220.19c9.311-7.825 17.135-17.235 23.277-27.932z" />
        <rect x="277.73" y="106.58" width="83.3" height="27.932" />
        <path d="m444.43 134.51h87.163c2.476-8.914 3.764-18.324 3.764-27.932h-90.927z" />
        <path d="m521.2 53.288h-299.03v27.932h310.12c-2.575-9.905-6.339-19.314-11.093-27.932z" />
        <path d="m429.28 0h-207.11v27.932h278.53c-18.621-17.235-43.878-27.932-71.414-27.932z" />
      </g>
      <g id="M">
        <polygon points="555.57 81.22 742.67 81.22 733.06 53.288 555.57 53.288" />
        <polygon points="555.57 27.932 724.25 27.932 714.64 0 555.57 0" />
        <polygon points="861.03 401.17 861.03 373.24 1e3 373.24 1e3 401.17" strokeWidth="1.0018" />
        <polygon points="861.03 347.76 861.03 319.83 1e3 319.83 1e3 347.76" />
        <polygon points="777.73 182.54 769.91 159.96 694.43 159.96 611.03 159.96 611.03 187.89 694.43 187.89 694.43 162.24 703.25 187.89 852.22 187.89 861.03 162.24 861.03 187.89 944.43 187.89 944.43 159.96 861.03 159.96 785.56 159.96" />
        <polygon points="944.43 106.58 803.98 106.58 794.37 134.51 944.43 134.51" />
        <polygon points="1e3 27.932 1e3 0 840.93 0 831.32 27.932" />
        <polygon points="768.13 373.22 777.73 400.85 787.34 373.22" />
        <polygon points="749.5 319.83 759.31 347.76 796.16 347.76 806.06 319.83" />
        <polygon points="730.78 266.54 740.59 294.47 814.88 294.47 824.68 266.54" />
        <polygon points="721.97 241.18 833.6 241.18 843.11 213.25 712.36 213.25" />
        <polygon points="611.03 134.51 761.09 134.51 751.49 106.58 611.03 106.58" />
        <polygon points="1e3 53.288 822.4 53.288 812.9 81.22 1e3 81.22" />
        <rect x="555.57" y="373.22" width="138.97" height="27.932" />
        <rect x="555.57" y="319.83" width="138.97" height="27.932" />
        <rect x="611.03" y="266.54" width="83.399" height="27.932" />
        <rect x="611.03" y="213.25" width="83.399" height="27.932" />
        <rect x="861.03" y="213.25" width="83.399" height="27.932" />
        <rect x="861.03" y="266.54" width="83.399" height="27.932" />
      </g>
      <path
        id="Registered"
        d="m1052 357.15a22 22 0 0 0-22 22 22 22 0 0 0 22 22 22 22 0 0 0 22-22 22 22 0 0 0-22-22zm0 4a18 18 0 0 1 18 18 18 18 0 0 1-18 18 18 18 0 0 1-18-18 18 18 0 0 1 18-18zm-9.3476 6.793v22.414h5.453v-7.7305h3.0978l4.164 7.7305h5.9804l-5.0234-8.582c2.4616-0.96446 4.0624-3.2158 4.0624-6.75 0-4.0818-2.5594-7.082-7.582-7.082zm5.453 4.2891h4.0548c1.7114 0 2.668 0.75016 2.668 2.3555v1.6133c0 1.6053-0.9566 2.3594-2.668 2.3594h-4.0548z"
      />
    </g>
  </svg>
);

const ITEMS = [
  { id: 1, logo: IBMLogo, text: "IBM" },
  { id: 2, logo: NasaLogo, text: "NASA" },
  { id: 3, logo: SpaceXLogo, text: "SpaceX" },
  { id: 4, logo: ValveLogo, text: "Valve" },
  { id: 5, logo: IBMLogo, text: "IBM" },
  { id: 6, logo: NasaLogo, text: "NASA" },
  { id: 7, logo: SpaceXLogo, text: "SpaceX" },
  { id: 8, logo: ValveLogo, text: "Valve" },
];


export function MarqueeDemo() {
  const [speedPercent, setSpeedPercent] = useState(50);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [play, setPlay] = useState(true);

  const speed = speedPercent / 100;
  const percClassName = "text-sm absolute inset-0 z-10 flex items-center pointer-events-none justify-center font-medium whitespace-now uppercase nowrap font-mono"

  return (
    <div className="not-prose">
      <Card className="overflow-hidden rounded-b-none bg-card">
        <div className="py-6">
          <Marquee
            speed={100}
            speedFactor={speed}
            direction={direction}
            play={play}
          >
            {ITEMS.map((item) => {
              const LogoComponent = item.logo;
              return <LogoComponent key={item.id} className="h-8 w-auto" />;
            })}
          </Marquee>
        </div>
      </Card>

      <div className="border-t-0 bg-card border border-border rounded-b-lg overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4">
          <ControlButton onClick={() => setPlay(!play)} className={cn(!play && "bg-accent/80 dark:bg-accent/50")}>
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
            className={cn(direction === 1 && "bg-accent/80 dark:bg-accent/50", "max-sm:row-2")}
            disabled={direction === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Left
          </ControlButton>

          <ControlButton
            onClick={() => setDirection(-1)}
            className={cn(direction === -1 && "bg-accent/80 dark:bg-accent/50", "max-sm:row-2")}
            disabled={direction === -1}
          >
            Right
            <ArrowRight className="w-4 h-4 mr-1" />
          </ControlButton>

          <div>
            <SliderPrimitive.Root
              className={cn(
                "relative flex w-full h-full touch-none select-none items-center"
              )}
              value={[speedPercent]}
              onValueChange={(value) => setSpeedPercent(Math.max(10, Math.min(100, value[0])))}
            >
              <SliderPrimitive.Track className="relative h-full w-full grow overflow-hidden cursor-ew-resize">
                <SliderPrimitive.Range className="absolute h-full bg-primary" />
                <span 
                  className={cn(percClassName, "text-background")}
                  style={{
                    clipPath: `inset(0 ${100 - speedPercent}% 0 0)`
                  }}
                >
                  {speedPercent} px/s
                </span>
                <span 
                  className={cn(percClassName, "text-foreground")}
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
        "hover:bg-accent/50 disabled:opacity-100 rounded-none flex-1 uppercase font-mono",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};
