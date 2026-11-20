import { Composition } from "remotion";
import { Scene, calculateMetadata, SceneProps } from "./Composition";

export const Root: React.FC = () => (
  <Composition
    id="MarocArabes"
    component={Scene}
    durationInFrames={33 * 30}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={{} as SceneProps}
    calculateMetadata={calculateMetadata}
  />
);
