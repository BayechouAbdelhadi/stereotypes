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

const END = 41.3; // end of verdict; spoken outro follows (9.4 s), then references card
const OUTRO_LEN = 9.4;
const REFS_LEN = 5.0;
const TOTAL = END + OUTRO_LEN + REFS_LEN;

const REFS = [
  "Présidence de la République française, Déclaration sur la reconnaissance de la responsabilité de la France envers les harkis, 25 septembre 2016",
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

// ---- C/D: dates
const DateCard: React.FC<{ year: string; top: string; sub: string }> = ({ year, top, sub }) => {
  const f = useCurrentFrame() - 6;
  const a = pop(f, S(0.15), 14, 150);
  return (
    <Frame>
      <div style={{ ...label, opacity: ease(f, S(0.1), S(0.6)) * 0.85, marginBottom: 20 }}>{top}</div>
      <div style={{ ...big(C.GOLD, 400), opacity: Math.min(1, a * 1.3), transform: `scale(${0.85 + 0.15 * a})` }}>{year}</div>
      <div style={{ height: 5, width: 520 * ease(f, S(0.8), S(1.8)), background: C.GOLD, margin: "30px 0" }} />
      <div style={{ ...label, fontSize: 40, textTransform: "none", letterSpacing: "0.04em", opacity: ease(f, S(1.4), S(2.0)) }}>{sub}</div>
    </Frame>
  );
};

// ---- A: cold open. Fully composed on frame 0: no black, no fade, no logo.
const ColdOpen: React.FC = () => {
  const f = useCurrentFrame();
  const lines = ["EN 2016,", "LE PRÉSIDENT", "RECONNAÎT", "L'ABANDON", "DES HARKIS"];
  const scale = 1.045 - 0.045 * ease(f, 0, 20);
  const rule = ease(f, S(0.8), S(2.4));
  return (
    <Frame>
      <div style={{ transform: `scale(${scale})` }}>
        {lines.map((t, i) => (
          <div key={t} style={{ ...big(i >= 3 ? C.GOLD : C.BONE, 140), whiteSpace: "nowrap" }}>{t}</div>
        ))}
      </div>
      <div style={{ height: 6, width: 640 * rule, background: C.GOLD, marginTop: 50 }} />
    </Frame>
  );
};

// ---- B: the quoted stereotype
const Quote: React.FC = () => {
  const f = useCurrentFrame() - 6;
  const lines = ["« LA FRANCE A BIEN", "ACCUEILLI LES", "HARKIS EN 1962 »"];
  return (
    <Frame>
      <div style={{ ...label, opacity: ease(f, 0, 14), marginBottom: 50 }}>On entend encore</div>
      {lines.map((t, i) => {
        const p = pop(f, 6 + i * 6);
        return <div key={t} style={{ ...big(C.BONE, 118), whiteSpace: "nowrap", opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 70}px)` }}>{t}</div>;
      })}
      <div style={{ ...label, color: C.GOLD, opacity: ease(f, S(5.4), S(6.2)), marginTop: 70, fontSize: 46 }}>Voici ce qu'il en est</div>
    </Frame>
  );
};

// ---- D: clandestine departures
const Departures: React.FC = () => {
  const f = useCurrentFrame() - 6;
  const a = pop(f, S(0.2));
  return (
    <Frame>
      <div style={{ ...label, opacity: ease(f, 0, 14), marginBottom: 40 }}>Des officiers organisent</div>
      <div style={{ ...big(C.GOLD, 170), opacity: Math.min(1, a * 1.3), transform: `translateY(${(1 - a) * 70}px)` }}>DÉPARTS<br />CLANDESTINS</div>
    </Frame>
  );
};

// ---- E: signature device (one beat): the places, appearing with the narration. Scene local 0 = global 20.9 - 0.3
const Camps: React.FC = () => {
  const f = useCurrentFrame() - 6;
  const L = (g: number) => S(g - 20.6);
  const items = [
    { t: "RIVESALTES", g: timing.at.s5 + 0.1, c: C.GOLD, sz: 140 },
    { t: "BIAS", g: timing.at.s5 + 1.3, c: C.BONE, sz: 140 },
    { t: "SAINT-MAURICE-\nL'ARDOISE", g: timing.at.s5 + 2.0, c: C.GOLD, sz: 120 },
  ];
  return (
    <Frame>
      <div style={{ ...label, fontSize: 42, opacity: ease(f, L(timing.at.s4 + 0.2), L(timing.at.s4 + 0.9)), marginBottom: 50, lineHeight: 1.4 }}>Camps de transit<br />et hameaux de forestage</div>
      {items.map((n, i) => {
        const o = ease(f, L(n.g), L(n.g) + 12);
        return <div key={i} style={{ ...big(n.c, n.sz), whiteSpace: "pre-line", marginBottom: 30, opacity: o, transform: `translateX(${(1 - o) * 60}px)` }}>{n.t}</div>;
      })}
      <div style={{ ...label, fontSize: 40, marginTop: 30, opacity: ease(f, L(timing.at.s5 + 3.4), L(timing.at.s5 + 4.0)) }}>des années dans des baraquements</div>
    </Frame>
  );
};

// ---- H: verdict (red stamp FAUX, once)
const Verdict: React.FC = () => {
  const f = useCurrentFrame() - 6;
  const local = S(timing.at.s8a - 34.3 + 0.3);
  const hit = f - local;
  const shake = hit >= 0 && hit < 10 ? (1 - hit / 10) * 28 : 0;
  const sx = (random(`sx${f}`) - 0.5) * shake;
  const sy = (random(`sy${f}`) - 0.5) * shake;
  const stampScale = hit < 0 ? 0 : interpolate(spring({ frame: hit, fps: FPS, config: { damping: 10, stiffness: 420, mass: 0.5 } }), [0, 1], [3.6, 1]);
  const strike = ease(f, local + 4, local + 14);
  const sub = ease(f, local + S(2.4), local + S(3.0));
  return (
    <Frame style={{ transform: `translate(${sx}px, ${sy}px)` }}>
      <div style={{ position: "relative", opacity: 1 - 0.55 * ease(f, local, local + 8) }}>
        <div style={{ ...big(C.BONE, 118) }}>LA FRANCE A BIEN<br />ACCUEILLI<br />LES HARKIS</div>
        <div style={{ position: "absolute", left: -20, right: -20, top: "50%", height: 12, background: C.GOLD, transform: `scaleX(${strike})`, transformOrigin: "left" }} />
      </div>
      {hit >= 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: "52%", display: "flex", justifyContent: "center", transform: `rotate(-9deg) scale(${stampScale})` }}>
          <div style={{ fontFamily: ANTON, fontSize: 380, lineHeight: 1, color: C.RED, border: `18px solid ${C.RED}`, padding: "0 60px", borderRadius: 14, background: "rgba(11,15,20,0.88)", letterSpacing: "0.04em" }}>FAUX</div>
        </div>
      )}
      <div style={{ ...label, color: C.GOLD, fontSize: 38, position: "absolute", left: 0, right: 0, top: 250, opacity: sub }}>Reconnu en 2016 par la France</div>
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
    <FadeScene a={0} b={4.8} first><ColdOpen /></FadeScene>
    <FadeScene a={4.8} b={12.6}><Quote /></FadeScene>
    <FadeScene a={12.6} b={17.7}><DateCard year="1962" top="Le gouvernement limite" sub="les rapatriements des supplétifs" /><SourceTag text="Présidence de la République, 25 septembre 2016" /></FadeScene>
    <FadeScene a={17.7} b={20.9}><Departures /></FadeScene>
    <FadeScene a={20.9} b={34.3}><Camps /><SourceTag text="Présidence de la République, 25 septembre 2016" /></FadeScene>
    <FadeScene a={34.3} b={END}><Verdict /></FadeScene>
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
