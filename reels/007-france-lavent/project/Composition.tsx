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
const END = 42.3; // end of the last scene; spoken outro follows
const TOTAL = END + 9.4;

const INK = "#0A0A0C";
const BONE = "#F4F1EA";
const RED = "#E8272B";
const SAND = "#E3A72F";
const DIM = "#1D1D23";
const MUTED = "#8E8E98";

// Scene windows (seconds, global)
const W = {
  s1: [0.0, 3.8],
  s2: [3.8, 10.8],
  s3: [10.8, 18.7],
  s4: [18.7, 22.5],
  s5: [22.5, 29.3],
  s6: [29.3, 35.3],
  s7: [35.3, END],
} as const;

// Narration clips (global start seconds) — durations measured from the Piper output.
const VOICE: { file: string; at: number }[] = [
  { file: "intro", at: -3.7 },
  { file: "s1a", at: 0.3 },
  { file: "s1b", at: 2.4 },
  { file: "s2", at: 4.0 },
  { file: "s3", at: 11.1 },
  { file: "s4", at: 19.0 },
  { file: "s5", at: 22.8 },
  { file: "s6", at: 29.6 },
  { file: "s7a", at: 35.6 },
  { file: "s7b", at: 37.7 },
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
  const lines = ["LES", "FRANÇAIS", "NE SE LAVENT", "PAS ?"];
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
                fontSize: 190,
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


const col: React.CSSProperties = { alignItems: "center", justifyContent: "center", flexDirection: "column" };
const big = (c: string, size = 150): React.CSSProperties => ({ fontFamily: ANTON, fontSize: size, lineHeight: 1.05, color: c, textAlign: "center" });

// ---------------------------------------------------------------- Scene 2: bars, today
const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const g = ease(f, S(1.4), S(3.8));
  const Bar: React.FC<{ name: string; color: string; at: number }> = ({ name, color, at }) => (
    <div style={{ opacity: ease(f, at, at + 10), marginBottom: 70 }}>
      <div style={{ ...label, color: BONE, marginBottom: 18 }}>{name}</div>
      <div style={{ width: 880, height: 70, background: DIM }}>
        <div style={{ width: 880 * 0.72 * g, height: 70, background: color }} />
      </div>
    </div>
  );
  return (
    <Frame style={col}>
      <div style={{ ...label, opacity: ease(f, 0, 12), marginBottom: 90 }}>Enquêtes d'hygiène actuelles</div>
      <Bar name="France" color={SAND} at={S(0.5)} />
      <Bar name="Voisins européens" color={BONE} at={S(0.9)} />
      <div style={{ ...big(BONE, 96), opacity: ease(f, S(4.6), S(5.2)), marginTop: 30 }}>
        PAS DE <span style={{ color: SAND }}>DIFFÉRENCE</span> NOTABLE
      </div>
    </Frame>
  );
};

// ---------------------------------------------------------------- Scene 3: the belief
const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const chain = ["EAU CHAUDE", "PORES OUVERTS", "ÉPIDÉMIES"];
  return (
    <Frame style={col}>
      <div style={{ ...big(SAND, 200), opacity: ease(f, S(0.2), S(0.8)) }}>XVIe–XVIIIe</div>
      <div style={{ ...label, opacity: ease(f, S(0.8), S(1.3)), margin: "10px 0 80px" }}>siècles · médecine européenne</div>
      {chain.map((t, i) => {
        const at = S(2.2 + i * 1.4);
        return (
          <React.Fragment key={t}>
            {i > 0 && <div style={{ width: 4, height: 50 * ease(f, at - 10, at), background: MUTED, margin: "10px 0" }} />}
            <div style={{ ...big(i === 2 ? SAND : BONE, 110), opacity: ease(f, at, at + 12), transform: `translateY(${(1 - ease(f, at, at + 12)) * 30}px)` }}>{t}</div>
          </React.Fragment>
        );
      })}
    </Frame>
  );
};

// ---------------------------------------------------------------- Scene 4: the habit
const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const a = pop(f, S(0.3), 14, 150);
  const b = pop(f, S(1.4), 14, 150);
  return (
    <Frame style={col}>
      <div style={{ ...big(BONE, 190), opacity: Math.min(1, a * 1.3), transform: `scale(${0.85 + 0.15 * a})` }}>LINGE PROPRE</div>
      <div style={{ ...big(SAND, 130), margin: "30px 0", opacity: ease(f, S(0.9), S(1.3)) }}>+</div>
      <div style={{ ...big(BONE, 190), opacity: Math.min(1, b * 1.3), transform: `scale(${0.85 + 0.15 * b})` }}>PARFUM</div>
    </Frame>
  );
};

// ---------------------------------------------------------------- Scene 5: Europe vs France
const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const drop = ease(f, S(3.2), S(4.2));
  return (
    <Frame style={col}>
      <div style={{ ...label, opacity: ease(f, S(0.3), S(0.8)) }}>pratiques communes à toute l'</div>
      <div style={{ ...big(BONE, 230), opacity: ease(f, S(0.5), S(1.1)), marginTop: 10 }}>EUROPE</div>
      <div style={{ width: 4, height: 260 * drop, background: SAND, margin: "20px 0" }} />
      <div style={{ ...label, opacity: ease(f, S(3.8), S(4.4)), color: SAND, marginBottom: 14 }}>récits de voyageurs étrangers</div>
      <div style={{ ...big(SAND, 190), opacity: ease(f, S(4.2), S(4.8)), transform: `translateY(${(1 - ease(f, S(4.2), S(4.8))) * 40}px)` }}>FRANÇAIS</div>
    </Frame>
  );
};

// ---------------------------------------------------------------- Scene 6: running water
const Scene6: React.FC = () => {
  const f = useCurrentFrame();
  const grow = ease(f, S(0.6), S(4.2));
  const node = (y: number, t: string, sub: string, c: string, at: number) => (
    <div style={{ position: "absolute", left: 210, top: y, display: "flex", alignItems: "center", opacity: ease(f, at, at + 14) }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: c, marginLeft: -18 }} />
      <div style={{ marginLeft: 50 }}>
        <div style={{ ...big(c, 120), textAlign: "left" }}>{t}</div>
        <div style={{ ...label, fontSize: 36, color: BONE, marginTop: 6, textAlign: "left" }}>{sub}</div>
      </div>
    </div>
  );
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 210, top: 420, width: 4, height: 700 * grow, background: BONE, opacity: 0.5 }} />
      {node(380, "XIXe", "tout-à-l'égout", SAND, S(0.8))}
      {node(1040, "XXe", "eau courante dans les logements", BONE, S(2.8))}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Scene 7: landing
const Scene7: React.FC = () => {
  const f = useCurrentFrame();
  const a = pop(f, S(0.2), 13, 170);
  const b = pop(f, S(2.4), 13, 170);
  const bars = ease(f, S(3.4), S(4.6));
  return (
    <Frame style={col}>
      <div style={{ ...big(BONE, 170), opacity: Math.min(1, a * 1.3), transform: `translateY(${(1 - a) * 80}px)` }}>LES FRANÇAIS<br />SE LAVENT.</div>
      <div style={{ ...big(SAND, 150), marginTop: 50, opacity: Math.min(1, b * 1.3), transform: `translateY(${(1 - b) * 80}px)` }}>COMME LEURS<br />VOISINS.</div>
      <div style={{ display: "flex", gap: 24, marginTop: 70 }}>
        <div style={{ width: 400 * bars, height: 30, background: SAND }} />
        <div style={{ width: 400 * bars, height: 30, background: SAND }} />
      </div>
      <div style={{ ...label, fontSize: 28, letterSpacing: "0.08em", textTransform: "none", opacity: ease(f, S(4.4), S(5.2)) * 0.8, marginTop: 70, maxWidth: 900, textAlign: "center", lineHeight: 1.4 }}>
        Georges Vigarello, Le Propre et le sale : l'hygiène du corps depuis le Moyen Âge, Seuil, 1985.
      </div>
    </Frame>
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
  const boundaries = [W.s2[0], W.s3[0], W.s4[0], W.s5[0], W.s6[0], W.s7[0]];
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Background />
      {/* each scene sees local frame 0 at its start */}
      <Sequence from={S(END)} durationInFrames={S(9.4)}><Outro /></Sequence>
      <Sequence from={S(W.s1[0])} durationInFrames={S(W.s1[1] - W.s1[0])}><Scene1 /></Sequence>
      <Sequence from={S(W.s2[0])} durationInFrames={S(W.s2[1] - W.s2[0])}><Scene2 /></Sequence>
      <Sequence from={S(W.s3[0])} durationInFrames={S(W.s3[1] - W.s3[0])}><Scene3 /></Sequence>
      <Sequence from={S(W.s4[0])} durationInFrames={S(W.s4[1] - W.s4[0])}><Scene4 /></Sequence>
      <Sequence from={S(W.s5[0])} durationInFrames={S(W.s5[1] - W.s5[0])}><Scene5 /></Sequence>
      <Sequence from={S(W.s6[0])} durationInFrames={S(W.s6[1] - W.s6[0])}><Scene6 /></Sequence>
      <Sequence from={S(W.s7[0])} durationInFrames={S(W.s7[1]) - S(W.s7[0])}><Scene7 /></Sequence>
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
