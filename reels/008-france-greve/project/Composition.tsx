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

const END = 45.4; // end of verdict; spoken outro follows (9.4 s), then references card
const OUTRO_LEN = 9.4;
const REFS_LEN = 5.0;
const TOTAL = END + OUTRO_LEN + REFS_LEN;

const REFS = [
  "Stéphane Sirot, La Grève en France : une histoire sociale, Odile Jacob, 2002",
  "Loi du 25 mai 1864 (fin du délit de coalition)",
  "Préambule de la Constitution du 27 octobre 1946",
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

// ---- A: cold open (0-3 s). Fully composed on frame 0: no black, no fade, no logo.
const ColdOpen: React.FC = () => {
  const f = useCurrentFrame();
  const lines = ["LES FRANÇAIS,", "TOUJOURS", "EN GRÈVE", "?"];
  const scale = 1.045 - 0.045 * ease(f, 0, 20);
  const rule = ease(f, S(0.8), S(2.2));
  return (
    <Frame>
      <div style={{ transform: `scale(${scale})` }}>
        {lines.map((t, i) => (
          <div key={t} style={{ ...big(i === 3 ? C.GOLD : C.BONE, i === 3 ? 300 : 150), whiteSpace: "nowrap" }}>
            {t}
          </div>
        ))}
      </div>
      <div style={{ height: 6, width: 640 * rule, background: C.GOLD, marginTop: 40 }} />
    </Frame>
  );
};

// ---- B: promise (open loop)
const Promise_: React.FC = () => {
  const f = useCurrentFrame() - 6;
  const a = pop(f, 2);
  const b = ease(f, S(1.0), S(1.6));
  return (
    <Frame>
      <div style={{ ...big(C.BONE, 215), opacity: Math.min(1, a * 1.4), transform: `translateY(${(1 - a) * 90}px)` }}>PAS<br />VRAIMENT.</div>
      <div style={{ ...label, color: C.GOLD, opacity: b, marginTop: 70, fontSize: 48 }}>La réponse est dans les faits</div>
    </Frame>
  );
};

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

// ---- E: the image forged
const Forged: React.FC = () => {
  const f = useCurrentFrame() - 6;
  const a = pop(f, S(0.2));
  const b = pop(f, S(1.4));
  const c = pop(f, S(3.2), 14, 150);
  return (
    <Frame>
      <div style={{ ...big(C.BONE, 260), opacity: Math.min(1, a * 1.3), transform: `translateY(${(1 - a) * 70}px)` }}>1936</div>
      <div style={{ ...big(C.BONE, 260), opacity: Math.min(1, b * 1.3), transform: `translateY(${(1 - b) * 70}px)` }}>MAI 68</div>
      <div style={{ ...big(C.GOLD, 118), marginTop: 70, opacity: Math.min(1, c * 1.3), transform: `scale(${0.9 + 0.1 * c})` }}>UNE FRANCE<br />DU CONFLIT</div>
    </Frame>
  );
};

// ---- F: signature device: irregular year bars, then two sectors (illustrative, no values shown)
const BARS = [0.35, 0.8, 0.22, 0.95, 0.45, 0.15, 0.7, 0.5, 0.88, 0.28];
const Variation: React.FC = () => {
  const f = useCurrentFrame() - 6;
  const sectors = ease(f, S(5.6), S(6.4));
  const barsOpacity = 1 - 0.8 * sectors;
  return (
    <Frame>
      <div style={{ ...label, opacity: ease(f, 0, 14) }}>Jours de grève, année après année</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 18, height: 520, marginTop: 50, opacity: barsOpacity }}>
        {BARS.map((v, i) => (
          <div key={i} style={{ width: 70, height: 520 * v * ease(f, 10 + i * 6, 40 + i * 6), background: i % 3 === 1 ? C.GOLD : C.SOFT }} />
        ))}
      </div>
      <div style={{ ...big(C.BONE, 100), marginTop: 40, opacity: barsOpacity * ease(f, S(2.6), S(3.4)) }}>
        TRÈS <span style={{ color: C.GOLD }}>VARIABLE</span>
      </div>
      <div style={{ position: "absolute", top: 760, left: 0, right: 0, ...col, opacity: sectors }}>
        <div style={{ ...label, marginBottom: 40 }}>Concentrée dans</div>
        <div style={{ ...big(C.GOLD, 150), transform: `translateY(${(1 - sectors) * 40}px)` }}>TRANSPORTS</div>
        <div style={{ ...big(C.BONE, 150), transform: `translateY(${(1 - sectors) * 60}px)` }}>FONCTION<br />PUBLIQUE</div>
      </div>
      <div style={{ position: "absolute", bottom: 585, left: 0, right: 0, textAlign: "center", fontFamily: INTER, fontSize: 26, color: C.BONE, opacity: 0.55 * barsOpacity }}>
        schéma illustratif, sans valeurs
      </div>
    </Frame>
  );
};

// ---- G: the impression
const Impression: React.FC = () => {
  const f = useCurrentFrame() - 6;
  const a = pop(f, S(0.2));
  const b = pop(f, S(3.6), 13, 170);
  return (
    <Frame>
      <div style={{ ...label, opacity: ease(f, 0, 14) }}>l'impression de</div>
      <div style={{ ...big(C.BONE, 190), marginTop: 20, opacity: Math.min(1, a * 1.3), transform: `translateY(${(1 - a) * 80}px)` }}>GRÈVE<br />PERMANENTE</div>
      <div style={{ ...big(C.GOLD, 70), margin: "40px 0 30px", opacity: ease(f, S(3.0), S(3.6)) }}>VIENT DE LA</div>
      <div style={{ ...big(C.GOLD, 170), opacity: Math.min(1, b * 1.3), transform: `scale(${0.88 + 0.12 * b})` }}>MÉDIATI-<br />SATION</div>
    </Frame>
  );
};

// ---- H: verdict (stamp once, gold: NUANCÉ), calls back the cold open
const Verdict: React.FC = () => {
  const f = useCurrentFrame() - 6;
  const local = S(timing.at.s8a - 38.4 + 0.5 - 0.2); // stamp lands when "Toujours en grève ? Non." starts
  const hit = f - local;
  const shake = hit >= 0 && hit < 10 ? (1 - hit / 10) * 24 : 0;
  const sx = (random(`sx${f}`) - 0.5) * shake;
  const sy = (random(`sy${f}`) - 0.5) * shake;
  const stampScale = hit < 0 ? 0 : interpolate(spring({ frame: hit, fps: FPS, config: { damping: 10, stiffness: 420, mass: 0.5 } }), [0, 1], [3.4, 1]);
  const strike = ease(f, local + 4, local + 14);
  const sub = ease(f, S(3.2), S(3.9));
  return (
    <Frame style={{ transform: `translate(${sx}px, ${sy}px)` }}>
      <div style={{ position: "relative", opacity: 1 - 0.55 * ease(f, local, local + 8) }}>
        <div style={{ ...big(C.BONE, 130) }}>TOUJOURS<br />EN GRÈVE ?</div>
        <div style={{ position: "absolute", left: -20, right: -20, top: "50%", height: 12, background: C.GOLD, transform: `scaleX(${strike})`, transformOrigin: "left" }} />
      </div>
      {hit >= 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: "54%", display: "flex", justifyContent: "center", transform: `rotate(-8deg) scale(${stampScale})` }}>
          <div style={{ fontFamily: ANTON, fontSize: 300, lineHeight: 1, color: C.GOLD, border: `16px solid ${C.GOLD}`, padding: "0 50px", borderRadius: 14, background: "rgba(11,15,20,0.88)", letterSpacing: "0.04em" }}>
            NUANCÉ
          </div>
        </div>
      )}
      <div style={{ ...label, color: C.GOLD, fontSize: 40, marginTop: 90, opacity: sub }}>Une tradition visible, pas permanente</div>
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
    <FadeScene a={0} b={3.0} first><ColdOpen /></FadeScene>
    <FadeScene a={3.0} b={6.6}><Promise_ /></FadeScene>
    <FadeScene a={6.6} b={11.2}><DateCard year="1864" top="Droit de grève reconnu" sub="fin du délit de coalition" /><SourceTag text="Loi du 25 mai 1864" /></FadeScene>
    <FadeScene a={11.2} b={15.6}><DateCard year="1946" top="Inscrit dans la Constitution" sub="Préambule" /><SourceTag text="Préambule de la Constitution, 1946" /></FadeScene>
    <FadeScene a={15.6} b={22.2}><Forged /><SourceTag text="S. Sirot, La Grève en France, 2002" /></FadeScene>
    <FadeScene a={22.2} b={32.2}><Variation /><SourceTag text="S. Sirot, La Grève en France, 2002" /></FadeScene>
    <FadeScene a={32.2} b={38.4}><Impression /></FadeScene>
    <FadeScene a={38.4} b={END}><Verdict /></FadeScene>
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
