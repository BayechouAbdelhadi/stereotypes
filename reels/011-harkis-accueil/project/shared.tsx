// Shared series components. Copy unchanged into every reel (see reels/STYLE-GUIDE.md).
import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

export const SERIF = loadSerif("normal", { weights: ["600", "700"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const INTER = loadInter("normal", { weights: ["500", "600"], subsets: ["latin", "latin-ext"] }).fontFamily;

export const C = {
  INK: "#0B0F14",
  TEAL: "#12303A",
  BONE: "#F4F1EA",
  GOLD: "#E3A72F",
  SOFT: "#3FA7A0",
  RED: "#E8272B",
};

export const FPS = 30;
export const S = (sec: number) => Math.round(sec * FPS);
export const XFADE = 15; // frames, slow cross-dissolve

export const ease = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

export const Background: React.FC = () => (
  <AbsoluteFill style={{ background: C.INK }}>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 35%, ${C.TEAL} 0%, ${C.INK} 72%)` }} />
    <AbsoluteFill style={{ opacity: 0.05, mixBlendMode: "screen" }}>
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  </AbsoluteFill>
);

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)", pointerEvents: "none" }}
  />
);

// Scene window in seconds [a, b]. Dissolves into the previous and next scene, slow drift inside.
export const FadeScene: React.FC<{ a: number; b: number; first?: boolean; children: React.ReactNode }> = ({
  a,
  b,
  first,
  children,
}) => {
  const from = first ? 0 : S(a) - XFADE;
  const dur = S(b) - from;
  return (
    <Sequence from={from} durationInFrames={dur} layout="none">
      <FadeInner dur={dur} first={first}>
        {children}
      </FadeInner>
    </Sequence>
  );
};

const FadeInner: React.FC<{ dur: number; first?: boolean; children: React.ReactNode }> = ({ dur, first, children }) => {
  const f = useCurrentFrame();
  const inn = first ? 1 : interpolate(f, [0, XFADE], [0, 1], { extrapolateRight: "clamp" });
  const out = interpolate(f, [dur - XFADE, dur], [1, 0], { extrapolateLeft: "clamp" });
  const drift = 1 + 0.04 * (f / dur);
  return (
    <AbsoluteFill style={{ opacity: Math.min(inn, out), transform: `scale(${drift})` }}>{children}</AbsoluteFill>
  );
};

// Small subtitle, lower third, inside the 9:16 safe area. Keywords, max 2 lines of 42 chars.
export const Subtitle: React.FC<{ at: number; to: number; text: string }> = ({ at, to, text }) => (
  <Sequence from={S(at)} durationInFrames={S(to - at)} layout="none">
    <SubtitleInner dur={S(to - at)} text={text} />
  </Sequence>
);

const SubtitleInner: React.FC<{ dur: number; text: string }> = ({ dur, text }) => {
  const f = useCurrentFrame();
  const o = Math.min(ease(f, 0, 12), 1 - ease(f, dur - 12, dur));
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 330,
        display: "flex",
        justifyContent: "center",
        opacity: o,
      }}
    >
      <div
        style={{
          fontFamily: INTER,
          fontWeight: 600,
          fontSize: 42,
          lineHeight: 1.3,
          color: C.BONE,
          textAlign: "center",
          whiteSpace: "pre-line",
          padding: "14px 34px",
          background: "rgba(11,15,20,0.55)",
          borderRadius: 12,
          maxWidth: 940,
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const SourceTag: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 510,
      textAlign: "center",
      fontFamily: INTER,
      fontWeight: 500,
      fontSize: 28,
      color: C.BONE,
      opacity: 0.7,
      letterSpacing: "0.04em",
    }}
  >
    {text}
  </div>
);

// Common intro (same in every reel).
export const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const rule = ease(f, 14, 60);
  const t = ease(f, 6, 36);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div
        style={{
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: 120,
          lineHeight: 1.08,
          letterSpacing: "0.12em",
          color: C.BONE,
          textAlign: "center",
          opacity: t,
        }}
      >
        KILL THE
        <br />
        <span style={{ color: C.GOLD }}>STEREOTYPE</span>
      </div>
      <div style={{ height: 4, width: 640 * rule, background: C.GOLD, marginTop: 50 }} />
    </AbsoluteFill>
  );
};

// Common outro: references card + sign-off (same in every reel).
export const Outro: React.FC<{ refs: string[]; title?: string }> = ({ refs, title = "Sources" }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  void durationInFrames;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", padding: "0 90px" }}>
      <div
        style={{
          fontFamily: INTER,
          fontWeight: 600,
          fontSize: 40,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: C.GOLD,
          opacity: ease(f, 0, 20),
        }}
      >
        {title}
      </div>
      <div style={{ height: 3, width: 420, background: C.GOLD, margin: "28px 0 60px", opacity: ease(f, 0, 20) }} />
      {refs.map((r, i) => (
        <div
          key={r}
          style={{
            fontFamily: INTER,
            fontWeight: 500,
            fontSize: 38,
            lineHeight: 1.4,
            color: C.BONE,
            textAlign: "center",
            marginBottom: 40,
            opacity: ease(f, 20 + i * 18, 44 + i * 18),
          }}
        >
          {r}
        </div>
      ))}
      <div
        style={{
          marginTop: 90,
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: 44,
          letterSpacing: "0.14em",
          color: C.BONE,
          opacity: ease(f, 110, 140) * 0.9,
        }}
      >
        KILL THE <span style={{ color: C.GOLD }}>STEREOTYPE</span>
      </div>
    </AbsoluteFill>
  );
};
