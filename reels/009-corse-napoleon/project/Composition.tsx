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
import { Background, C, FadeScene, FPS, INTER as SH_INTER, Outro as RefsCard, S, XFADE, SourceTag, Subtitle, Vignette, ease } from "./shared";
import timing from "./timing";
import cues from "./cues";

const { fontFamily: ANTON } = loadAnton("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] });
const { fontFamily: INTER } = loadInter("normal", { weights: ["500", "700"], subsets: ["latin", "latin-ext"] });
void SH_INTER;

export interface SceneProps {}

const END = 44.3; // end of verdict; spoken outro follows (9.4 s), then references card
const OUTRO_LEN = 9.4;
const REFS_LEN = 5.0;
const TOTAL = END + OUTRO_LEN + REFS_LEN;

const REFS = [
  "Jean-Marie Arrighi, Olivier Jehasse, Histoire de la Corse et des Corses, Perrin, 2008",
  "Traité de Versailles entre Gênes et la France, 1768",
];

const VOICE: { file: string; at: number }[] = [
  ...Object.entries(timing.at).map(([file, at]) => ({ file, at: at as number })),
  { file: "outro1", at: END + 0.8 },
  { file: "outro2", at: END + 4.9 },
];

const pop = (f: number, delay: number, damping = 13, stiffness = 170) =>
  spring({ frame: f - delay, fps: FPS, config: { damping, stiffness, mass: 0.7 } });

const label: React.CSSProperties = {
  fontFamily: INTER,
  fontWeight: 700,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: C.BONE,
  opacity: 0.75,
  fontSize: 44,
  textAlign: "center",
};
const big = (color: string, size = 150): React.CSSProperties => ({
  fontFamily: ANTON,
  fontSize: size,
  lineHeight: 1.05,
  color,
  textAlign: "center",
});
const col: React.CSSProperties = { alignItems: "center", justifyContent: "center", flexDirection: "column" };

const Frame: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={{ padding: "230px 70px 520px 70px", ...col, ...style }}>{children}</AbsoluteFill>
);

// ---- A: cold open (0-3.6 s). Fully composed on frame 0: no black, no fade, no logo.
const ColdOpen: React.FC = () => {
  const f = useCurrentFrame();
  const lines = ["NAPOLÉON", "EST NÉ DANS", "UNE CORSE", "DÉJÀ FRANÇAISE"];
  const scale = 1.045 - 0.045 * ease(f, 0, 20);
  const rule = ease(f, S(0.8), S(2.4));
  return (
    <Frame>
      <div style={{ transform: `scale(${scale})` }}>
        {lines.map((t, i) => (
          <div key={t} style={{ ...big(i === 3 ? C.GOLD : C.BONE, 150), whiteSpace: "nowrap" }}>{t}</div>
        ))}
      </div>
      <div style={{ height: 6, width: 640 * rule, background: C.GOLD, marginTop: 50 }} />
    </Frame>
  );
};

// ---- B: the quoted stereotype (series hook)
const Quote: React.FC = () => {
  const f = useCurrentFrame() - 6;
  const a = pop(f, 2);
  const lines = ["« LA CORSE N'EST", "FRANÇAISE QUE", "DEPUIS NAPOLÉON »"];
  return (
    <Frame>
      <div style={{ ...label, opacity: ease(f, 0, 14), marginBottom: 50 }}>On entend encore</div>
      {lines.map((t, i) => {
        const p = pop(f, 6 + i * 5);
        return <div key={t} style={{ ...big(C.BONE, 118), whiteSpace: "nowrap", opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 70}px)` }}>{t}</div>;
      })}
      <div style={{ ...label, color: C.GOLD, opacity: ease(f, S(4.6), S(5.4)), marginTop: 70, fontSize: 46 }}>Voici ce qu'il en est</div>
      <div style={{ opacity: 0 }}>{a}</div>
    </Frame>
  );
};

// ---- Timeline (signature device, one beat): nodes appear with the narration. Scene local 0 = global 10.1 s
const NODES = [
  { g: timing.at.s2, y: 250, year: "1768", text: "Traité de Versailles :\nGênes cède l'île à la France", c: C.GOLD },
  { g: timing.at.s3, y: 510, year: "MAI 1769", text: "Ponte Novu : fin de la\nRépublique corse", c: C.GOLD },
  { g: timing.at.s4, y: 770, year: "1769", text: "Naissance de Napoléon", c: C.BONE },
  { g: timing.at.s5, y: 1030, year: "1789", text: "Députés corses aux\nÉtats généraux", c: C.GOLD },
];
const Timeline: React.FC = () => {
  const f = useCurrentFrame() - 6;
  const L = (g: number) => S(g - 10.1);
  const grow = ease(f, L(timing.at.s2), L(timing.at.s5) + 20);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 190, top: 280, width: 4, height: 780 * grow, background: C.BONE, opacity: 0.45 }} />
      {NODES.map((n, i) => {
        const o = ease(f, L(n.g), L(n.g) + 14);
        return (
          <div key={i} style={{ position: "absolute", left: 190, top: n.y, display: "flex", alignItems: "flex-start", opacity: o, transform: `translateX(${(1 - o) * 40}px)` }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: n.c, marginLeft: -18, marginTop: 40 }} />
            <div style={{ marginLeft: 50 }}>
              <div style={{ ...big(n.c, 124), textAlign: "left" }}>{n.year}</div>
              <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 38, lineHeight: 1.3, color: C.BONE, whiteSpace: "pre-line" }}>{n.text}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---- s7
const NotHim: React.FC = () => {
  const f = useCurrentFrame() - 6;
  const a = pop(f, S(0.1));
  const b = pop(f, S(1.3));
  return (
    <Frame>
      <div style={{ ...big(C.BONE, 190), opacity: Math.min(1, a * 1.3), transform: `translateY(${(1 - a) * 80}px)` }}>NAPOLÉON</div>
      <div style={{ ...big(C.GOLD, 100), margin: "30px 0", opacity: ease(f, S(0.8), S(1.3)) }}>N'A PAS RATTACHÉ</div>
      <div style={{ ...big(C.BONE, 190), opacity: Math.min(1, b * 1.3), transform: `scale(${0.88 + 0.12 * b})` }}>LA CORSE</div>
    </Frame>
  );
};

// ---- H: verdict (red stamp FAUX, once), calls back the claim
const Verdict: React.FC = () => {
  const f = useCurrentFrame() - 6;
  const local = S(timing.at.s8a - 38.1);
  const hit = f - local;
  const shake = hit >= 0 && hit < 10 ? (1 - hit / 10) * 28 : 0;
  const sx = (random(`sx${f}`) - 0.5) * shake;
  const sy = (random(`sy${f}`) - 0.5) * shake;
  const stampScale = hit < 0 ? 0 : interpolate(spring({ frame: hit, fps: FPS, config: { damping: 10, stiffness: 420, mass: 0.5 } }), [0, 1], [3.6, 1]);
  const strike = ease(f, local + 4, local + 14);
  const sub = ease(f, local + S(2.6), local + S(3.2));
  return (
    <Frame style={{ transform: `translate(${sx}px, ${sy}px)` }}>
      <div style={{ position: "relative", opacity: 1 - 0.55 * ease(f, local, local + 8) }}>
        <div style={{ ...big(C.BONE, 120) }}>N'EST FRANÇAISE<br />QUE DEPUIS<br />NAPOLÉON</div>
        <div style={{ position: "absolute", left: -20, right: -20, top: "50%", height: 12, background: C.GOLD, transform: `scaleX(${strike})`, transformOrigin: "left" }} />
      </div>
      {hit >= 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: "52%", display: "flex", justifyContent: "center", transform: `rotate(-9deg) scale(${stampScale})` }}>
          <div style={{ fontFamily: ANTON, fontSize: 380, lineHeight: 1, color: C.RED, border: `18px solid ${C.RED}`, padding: "0 60px", borderRadius: 14, background: "rgba(11,15,20,0.88)", letterSpacing: "0.04em" }}>FAUX</div>
        </div>
      )}
      <div style={{ ...label, color: C.GOLD, fontSize: 40, position: "absolute", left: 0, right: 0, top: 250, opacity: sub }}>Française avant sa naissance</div>
    </Frame>
  );
};

// ---- Spoken outro (shared across reels)
const SpokenOutro: React.FC = () => {
  const f = useCurrentFrame();
  const a = ease(f, S(0.3), S(1.3));
  const dim = 1 - 0.55 * ease(f, S(4.4), S(5.0));
  const b = ease(f, S(4.7), S(5.9));
  const rule = ease(f, S(6.2), S(8.0));
  return (
    <Frame>
      <div style={{ opacity: a * dim, transform: `translateY(${(1 - a) * 20}px)`, textAlign: "center", fontFamily: ANTON, fontSize: 104, lineHeight: 1.12, color: C.BONE }}>
        LES PRÉJUGÉS<br />S'EFFACENT,<br />QUAND LES <span style={{ color: C.GOLD }}>FAITS</span><br />PRENNENT PLACE.
      </div>
      <div style={{ opacity: b, transform: `translateY(${(1 - b) * 30}px)`, textAlign: "center", fontFamily: ANTON, fontSize: 124, lineHeight: 1.08, color: C.GOLD, marginTop: 90 }}>
        ENSEMBLE,<br />TUONS LES<br />STÉRÉOTYPES.
      </div>
      <div style={{ height: 6, width: 620 * rule, background: C.GOLD, marginTop: 50 }} />
    </Frame>
  );
};

export const Scene: React.FC<SceneProps> = () => (
  <AbsoluteFill style={{ background: C.INK }}>
    <Background />
    <FadeScene a={0} b={3.6} first><ColdOpen /></FadeScene>
    <FadeScene a={3.6} b={10.4}><Quote /></FadeScene>
    <FadeScene a={10.4} b={34.0}><Timeline /><SourceTag text="Arrighi & Jehasse, 2008 · Traité de Versailles, 1768" /></FadeScene>
    <FadeScene a={34.0} b={38.1}><NotHim /></FadeScene>
    <FadeScene a={38.1} b={END}><Verdict /></FadeScene>
    <Sequence from={S(END)} durationInFrames={S(OUTRO_LEN)}><SpokenOutro /></Sequence>
    <Sequence from={S(END + OUTRO_LEN)} durationInFrames={S(REFS_LEN)}><RefsCard refs={REFS} /></Sequence>
    {cues.map((c) => (
      <Subtitle key={c.at} at={c.at} to={c.to} text={c.text} />
    ))}
    <Vignette />
    {VOICE.map((v) => (
      <Sequence key={v.file} from={S(v.at)}>
        <Audio src={staticFile(`audio/${v.file}.wav`)} volume={1} startFrom={v.file === "c1" ? 6 : 0} />
      </Sequence>
    ))}
    <Sequence from={S(timing.at.s8a)}>
      <Audio src={staticFile("audio/thump.wav")} volume={0.9} />
    </Sequence>
  </AbsoluteFill>
);

export const calculateMetadata: CalculateMetadataFunction<SceneProps> = async () => ({
  durationInFrames: S(TOTAL),
  fps: FPS,
  width: 1080,
  height: 1920,
});
