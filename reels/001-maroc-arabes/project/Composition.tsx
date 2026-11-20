import React from "react";
import {
  AbsoluteFill,
  Audio,
  CalculateMetadataFunction,
  Easing,
  Sequence,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadTifi } from "@remotion/google-fonts/NotoSansTifinagh";

const { fontFamily: ANTON } = loadAnton("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] });
const { fontFamily: INTER } = loadInter("normal", { weights: ["500", "700"], subsets: ["latin", "latin-ext"] });
const { fontFamily: TIFI } = loadTifi("normal", { weights: ["400"], subsets: ["tifinagh"] });

export interface SceneProps {}

const FPS = 30;
const S = (sec: number) => Math.round(sec * FPS);
const OFF = 0;
const END = 34.1; // end of the last scene; spoken outro follows
const TOTAL = END + 9.4;

const INK = "#0A0A0C";
const BONE = "#F4F1EA";
const RED = "#E8272B";
const SAND = "#E3A72F";
const DIM = "#1D1D23";
const MUTED = "#8E8E98";

// Scene windows (seconds, global)
const W = {
  intro: [0, OFF],
  s1: [0 + OFF, 3.5 + OFF],
  s2: [3.5 + OFF, 6.1 + OFF],
  s3: [6.1 + OFF, 13.2 + OFF],
  s4a: [13.2 + OFF, 16.2 + OFF],
  s4b: [16.2 + OFF, 21.2 + OFF],
  s5: [21.2 + OFF, 26.9 + OFF],
  s6: [26.9 + OFF, END],
} as const;

// Narration clips (global start seconds) — durations measured from the Piper output.
const VOICE: { file: string; at: number }[] = [
  { file: "s1a", at: 0.3 + OFF },
  { file: "s1b", at: 2.4 + OFF },
  { file: "s2", at: 3.7 + OFF },
  { file: "s3", at: 6.3 + OFF },
  { file: "s4a", at: 13.4 + OFF },
  { file: "s4b", at: 16.4 + OFF },
  { file: "s5", at: 21.5 + OFF },
  { file: "s6a", at: 27.2 + OFF },
  { file: "s6b", at: 29.85 + OFF },
  { file: "outro1", at: END + 0.8 },
  { file: "outro2", at: END + 4.9 },
];

const ease = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

const pop = (f: number, delay: number, damping = 13, stiffness = 170) =>
  spring({ frame: f - delay, fps: FPS, config: { damping, stiffness, mass: 0.7 } });

const label: React.CSSProperties = {
  fontFamily: INTER,
  fontWeight: 700,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: MUTED,
  fontSize: 44,
};

const Frame: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill
    style={{
      padding: "230px 70px 400px 70px",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      ...style,
    }}
  >
    {children}
  </AbsoluteFill>
);

const Background: React.FC = () => (
  <AbsoluteFill style={{ background: INK }}>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #1A1A20 0%, #0A0A0C 70%)" }} />
    <AbsoluteFill style={{ opacity: 0.07, mixBlendMode: "screen" }}>
      <svg width="100%" height="100%">
        <filter id="g">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#g)" />
      </svg>
    </AbsoluteFill>
  </AbsoluteFill>
);


// ---------------------------------------------------------------- Outro (spoken, slow, same in every reel)
const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const a = ease(f, S(0.3), S(1.3));
  const dim = 1 - 0.55 * ease(f, S(4.4), S(5.0));
  const b = ease(f, S(4.7), S(5.9));
  const rule = ease(f, S(6.2), S(8.0));
  return (
    <Frame style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div style={{ opacity: a * dim, transform: `translateY(${(1 - a) * 20}px)`, textAlign: "center", fontFamily: ANTON, fontSize: 104, lineHeight: 1.12, color: BONE }}>
        LES PRÉJUGÉS<br />S'EFFACENT,<br />QUAND LES <span style={{ color: SAND }}>FAITS</span><br />PRENNENT PLACE.
      </div>
      <div style={{ opacity: b, transform: `translateY(${(1 - b) * 30}px)`, textAlign: "center", fontFamily: ANTON, fontSize: 124, lineHeight: 1.08, color: SAND, marginTop: 90 }}>
        ENSEMBLE,<br />TUONS LES<br />STÉRÉOTYPES.
      </div>
      <div style={{ height: 6, width: 620 * rule, background: SAND, marginTop: 50 }} />
    </Frame>
  );
};

// ---------------------------------------------------------------- Scene 1
const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const lines = ["TOUS LES", "MAROCAINS", "SONT", "ARABES ?"];
  const at = S(2.4);
  const hit = f - at;
  const shake = hit >= 0 && hit < 10 ? (1 - hit / 10) * 30 : 0;
  const sx = (random(`sx${f}`) - 0.5) * shake;
  const sy = (random(`sy${f}`) - 0.5) * shake;
  const stampScale =
    hit < 0
      ? 0
      : interpolate(
          spring({ frame: hit, fps: FPS, config: { damping: 10, stiffness: 420, mass: 0.5 } }),
          [0, 1],
          [3.6, 1],
        );
  const dim = ease(f, at, at + 8);
  const flash = hit >= 0 && hit < 5 ? 0.55 * (1 - hit / 5) : 0;
  return (
    <Frame style={{ transform: `translate(${sx}px, ${sy}px)` }}>
      <div style={{ opacity: 1 - 0.7 * dim }}>
        {lines.map((t, i) => {
          const p = pop(f, 4 + i * 5);
          return (
            <div
              key={t}
              style={{
                fontFamily: ANTON,
                fontSize: 200,
                lineHeight: 1.02,
                textAlign: "center",
                color: i === 3 ? SAND : BONE,
                whiteSpace: "nowrap",
                opacity: Math.min(1, p * 1.4),
                transform: `translateY(${(1 - p) * 140}px)`,
              }}
            >
              {t}
            </div>
          );
        })}
      </div>
      {hit >= 0 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "38%",
            display: "flex",
            justifyContent: "center",
            transform: `rotate(-9deg) scale(${stampScale})`,
          }}
        >
          <div
            style={{
              fontFamily: ANTON,
              fontSize: 380,
              lineHeight: 1,
              color: RED,
              border: `18px solid ${RED}`,
              padding: "0 60px",
              borderRadius: 14,
              background: "rgba(10,10,12,0.88)",
              letterSpacing: "0.04em",
            }}
          >
            FAUX
          </div>
        </div>
      )}
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </Frame>
  );
};

// ---------------------------------------------------------------- Scene 2
const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const p1 = pop(f, 6, 14, 150);
  const p2 = pop(f, 14, 14, 150);
  return (
    <Frame>
      <div style={{ ...label, opacity: ease(f, 0, 10), marginBottom: 40 }}>Le Maroc est un pays</div>
      <div
        style={{
          fontFamily: ANTON,
          fontSize: 300,
          lineHeight: 1,
          color: BONE,
          whiteSpace: "nowrap",
          transform: `translateX(${(1 - p1) * -1100}px)`,
        }}
      >
        ARABO-
      </div>
      <div
        style={{
          fontFamily: ANTON,
          fontSize: 285,
          lineHeight: 1,
          color: SAND,
          whiteSpace: "nowrap",
          transform: `translateX(${(1 - p2) * 1100}px)`,
        }}
      >
        BERBÈRE
      </div>
      <div style={{ marginTop: 50, height: 8, width: 620 * ease(f, 30, 52), background: BONE }} />
    </Frame>
  );
};

// ---------------------------------------------------------------- Scene 3
const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const prog = ease(f, S(1.8), S(3.4));
  const n = Math.round(25 * prog);
  const chip = pop(f, S(4.6), 12, 200);
  return (
    <Frame>
      <div style={{ ...label, opacity: ease(f, S(0.3), S(0.7)), marginBottom: 10 }}>Recensement 2014</div>
      <div
        style={{
          fontFamily: ANTON,
          fontSize: 380,
          lineHeight: 1.05,
          color: BONE,
          opacity: ease(f, S(1.4), S(1.8)),
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ color: MUTED, fontSize: 200 }}>≈</span>
        {n}
        <span style={{ color: SAND, fontSize: 280 }}> %</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 64px)", gap: 12, marginTop: 30 }}>
        {Array.from({ length: 100 }).map((_, i) => {
          const row = Math.floor(i / 10);
          const col = i % 10;
          const order = (9 - row) * 10 + col; // fill from bottom-left
          const on = order < n;
          const born = ease(f, S(1.8) + order * 1.3, S(1.8) + order * 1.3 + 5);
          return (
            <div
              key={i}
              style={{
                width: 64,
                height: 64,
                borderRadius: 10,
                background: on ? SAND : DIM,
                transform: on ? `scale(${0.85 + 0.15 * born})` : "scale(1)",
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          marginTop: 44,
          opacity: Math.min(1, chip * 1.3),
          transform: `translateY(${(1 - chip) * 60}px)`,
          display: "flex",
          alignItems: "baseline",
          gap: 22,
          border: `4px solid ${BONE}`,
          borderRadius: 100,
          padding: "10px 44px",
        }}
      >
        <span style={{ fontFamily: ANTON, fontSize: 90, color: SAND }}>3</span>
        <span style={{ ...label, color: BONE, fontSize: 40 }}>variétés de tamazight</span>
      </div>
    </Frame>
  );
};

// ---------------------------------------------------------------- Scene 4a
const Scene4a: React.FC = () => {
  const f = useCurrentFrame();
  const big = pop(f, S(1.2), 9, 260);
  return (
    <Frame>
      <div style={{ ...label, opacity: ease(f, 0, 8) }}>Tamazight</div>
      <div
        style={{
          marginTop: 30,
          fontFamily: ANTON,
          fontSize: 150,
          color: BONE,
          opacity: ease(f, S(0.3), S(0.6)),
          transform: `translateX(${(1 - ease(f, S(0.3), S(0.7))) * -300}px)`,
          whiteSpace: "nowrap",
        }}
      >
        LANGUE OFFICIELLE
      </div>
      <div
        style={{
          fontFamily: ANTON,
          fontSize: 560,
          lineHeight: 1,
          color: SAND,
          transform: `scale(${interpolate(big, [0, 1], [0.2, 1])})`,
          opacity: Math.min(1, big * 2),
        }}
      >
        2011
      </div>
      <div style={{ ...label, opacity: ease(f, S(1.9), S(2.3)) }}>Constitution</div>
    </Frame>
  );
};

// ---------------------------------------------------------------- Scene 4b
const Scene4b: React.FC = () => {
  const f = useCurrentFrame();
  const R = 290;
  const C = 2 * Math.PI * R;
  const l = ease(f, S(0.4), S(1.4));
  const r = ease(f, S(2.0), S(3.0));
  const fillI = ease(f, S(2.9), S(3.5));
  const cy = 520;
  const lx = 540 - 170;
  const rx = 540 + 170;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="clipL">
            <circle cx={lx} cy={cy + 440} r={R} />
          </clipPath>
        </defs>
        <circle cx={rx} cy={cy + 440} r={R} fill={SAND} fillOpacity={0.12 * r} />
        <circle
          cx={lx}
          cy={cy + 440}
          r={R}
          fill="none"
          stroke={BONE}
          strokeWidth={10}
          strokeDasharray={C}
          strokeDashoffset={C * (1 - l)}
          transform={`rotate(-90 ${lx} ${cy + 440})`}
        />
        <circle
          cx={rx}
          cy={cy + 440}
          r={R}
          fill="none"
          stroke={SAND}
          strokeWidth={10}
          strokeDasharray={C}
          strokeDashoffset={C * (1 - r)}
          transform={`rotate(-90 ${rx} ${cy + 440})`}
        />
        <circle cx={rx} cy={cy + 440} r={R} fill={SAND} fillOpacity={0.75 * fillI} clipPath="url(#clipL)" />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 60,
          top: cy + 440 - R - 150,
          width: 440,
          ...label,
          color: BONE,
          fontSize: 46,
          textAlign: "center",
          opacity: ease(f, S(1.0), S(1.4)),
        }}
      >
        Marocains
        <br />
        arabophones
      </div>
      <div
        style={{
          position: "absolute",
          right: 60,
          top: cy + 440 - R - 150,
          width: 440,
          ...label,
          color: SAND,
          fontSize: 46,
          textAlign: "center",
          opacity: ease(f, S(2.5), S(2.9)),
        }}
      >
        Ancêtres
        <br />
        berbères
      </div>
      <div
        style={{
          position: "absolute",
          left: 440,
          width: 200,
          top: cy + 440 - 60,
          textAlign: "center",
          fontFamily: ANTON,
          fontSize: 58,
          lineHeight: 1.05,
          color: INK,
          opacity: fillI,
        }}
      >
        LA
        <br />
        PLUPART
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Scene 5
const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const top = 400;
  const bottom = 1330;
  const grow = ease(f, S(0.6), S(3.6));
  const y = top + (bottom - top) * grow;
  const mk = pop(f, S(3.8), 11, 220);
  const av = pop(f, S(2.5), 12, 200);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 250,
          left: 0,
          right: 0,
          textAlign: "center",
          ...label,
          color: SAND,
          opacity: ease(f, S(0.3), S(0.7)),
        }}
      >
        Amazighs · Afrique du Nord
      </div>
      <div
        style={{
          position: "absolute",
          left: 534,
          width: 12,
          top,
          height: y - top,
          background: `linear-gradient(${SAND}, ${SAND})`,
          borderRadius: 6,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 700,
          fontFamily: ANTON,
          fontSize: 190,
          lineHeight: 1,
          color: BONE,
          opacity: Math.min(1, av * 1.5),
          transform: `translateX(${(1 - av) * -400}px)`,
        }}
      >
        BIEN
        <br />
        AVANT
      </div>
      <div
        style={{
          position: "absolute",
          top: bottom - 20,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: Math.min(1, mk * 1.5),
          transform: `scale(${interpolate(mk, [0, 1], [0.5, 1])})`,
        }}
      >
        <div style={{ width: 110, height: 110, borderRadius: 55, background: BONE, marginTop: 0 }} />
        <div style={{ fontFamily: ANTON, fontSize: 130, color: BONE, marginTop: 20, whiteSpace: "nowrap" }}>
          VIIᵉ SIÈCLE
        </div>
        <div style={{ ...label, fontSize: 38, marginTop: 6, color: MUTED }}>Armées arabes</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Scene 6
const Scene6: React.FC = () => {
  const f = useCurrentFrame();
  const phaseB = S(2.9);
  const a = 1 - ease(f, phaseB - 4, phaseB + 2);
  const b = pop(f, phaseB, 10, 230);
  const glyph = pop(f, phaseB + 4, 9, 140);
  const strike = ease(f, S(1.4), S(1.9));
  const src = ease(f, S(4.2), S(4.8));
  const out = interpolate(f, [S(7.2) - 12, S(7.2)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Frame style={{ opacity: a }}>
        <div style={{ ...label, opacity: ease(f, 0, 8), color: MUTED }}>Le Maroc n'est pas</div>
        <div style={{ position: "relative", marginTop: 30 }}>
          <div style={{ fontFamily: ANTON, fontSize: 250, lineHeight: 1.05, color: BONE, textAlign: "center" }}>
            ARABE
            <br />
            <span style={{ color: MUTED, fontSize: 130 }}>OU</span>
            <br />
            BERBÈRE
          </div>
          <div
            style={{
              position: "absolute",
              left: -30,
              top: "50%",
              height: 18,
              width: `${strike * 112}%`,
              background: RED,
              transform: "rotate(-6deg)",
              transformOrigin: "left center",
            }}
          />
        </div>
      </Frame>
      <Frame style={{ opacity: Math.min(1, b * 1.5) }}>
        <div
          style={{
            fontFamily: TIFI,
            fontSize: 520,
            lineHeight: 1,
            color: SAND,
            transform: `scale(${interpolate(glyph, [0, 1], [0.3, 1])})`,
            textShadow: `0 0 90px ${SAND}66`,
          }}
        >
          ⵣ
        </div>
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 190,
            lineHeight: 1.02,
            color: BONE,
            textAlign: "center",
            transform: `translateY(${(1 - b) * 120}px)`,
          }}
        >
          IL EST
          <br />
          <span style={{ color: SAND }}>LES DEUX.</span>
        </div>
      </Frame>
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          bottom: 330,
          textAlign: "center",
          fontFamily: INTER,
          fontWeight: 500,
          fontSize: 30,
          lineHeight: 1.35,
          color: MUTED,
          opacity: src,
        }}
      >
        Source : Haut-Commissariat au Plan (Maroc), Recensement général de la population et de l'habitat 2014.
      </div>
      <AbsoluteFill style={{ background: INK, opacity: out }} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Wipes
const Wipe: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  if (f < at - 7 || f > at + 7) return null;
  const y =
    f < at
      ? interpolate(f, [at - 7, at], [1920, 0], { easing: Easing.in(Easing.cubic) })
      : interpolate(f, [at, at + 7], [0, -1920], { easing: Easing.out(Easing.cubic) });
  return <AbsoluteFill style={{ background: SAND, transform: `translateY(${y}px)` }} />;
};

// ---------------------------------------------------------------- Root scene
export const Scene: React.FC<SceneProps> = () => {
  const seq = (w: readonly [number, number], node: React.ReactNode) => (
    <Sequence from={S(w[0])} durationInFrames={S(w[1]) - S(w[0])} layout="none">
      <AbsoluteFill>{node}</AbsoluteFill>
    </Sequence>
  );
  const boundaries = [W.s2[0], W.s3[0], W.s4a[0], W.s4b[0], W.s5[0], W.s6[0]];
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Background />
      {/* each scene sees local frame 0 at its start */}
      <Sequence from={S(END)} durationInFrames={S(9.4)}><Outro /></Sequence>
      <Sequence from={S(W.s1[0])} durationInFrames={S(W.s1[1] - W.s1[0])}><Scene1 /></Sequence>
      <Sequence from={S(W.s2[0])} durationInFrames={S(W.s2[1] - W.s2[0])}><Scene2 /></Sequence>
      <Sequence from={S(W.s3[0])} durationInFrames={S(W.s3[1] - W.s3[0])}><Scene3 /></Sequence>
      <Sequence from={S(W.s4a[0])} durationInFrames={S(W.s4a[1] - W.s4a[0])}><Scene4a /></Sequence>
      <Sequence from={S(W.s4b[0])} durationInFrames={S(W.s4b[1] - W.s4b[0])}><Scene4b /></Sequence>
      <Sequence from={S(W.s5[0])} durationInFrames={S(W.s5[1] - W.s5[0])}><Scene5 /></Sequence>
      <Sequence from={S(W.s6[0])} durationInFrames={S(W.s6[1] - W.s6[0])}><Scene6 /></Sequence>
      {boundaries.map((b) => (
        <Wipe key={b} at={S(b)} />
      ))}
      {VOICE.map((v) => (
        <Sequence key={v.file} from={S(v.at)}>
          <Audio src={staticFile(`audio/${v.file}.wav`)} volume={1} />
        </Sequence>
      ))}
      <Sequence from={S(2.4 + OFF)}>
        <Audio src={staticFile("audio/thump.wav")} volume={0.9} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const calculateMetadata: CalculateMetadataFunction<SceneProps> = async () => ({
  durationInFrames: S(TOTAL),
  fps: FPS,
  width: 1080,
  height: 1920,
});
