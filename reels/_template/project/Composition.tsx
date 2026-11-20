import React from "react";
import { AbsoluteFill, CalculateMetadataFunction } from "remotion";

// Atelier (bespoke) composition. Hand-author from scratch; do not import from
// remotion-composer/src/components or src/Explainer. See skills/meta/bespoke-composition.md on the VM.
export interface SceneProps {}

export const Scene: React.FC<SceneProps> = () => <AbsoluteFill style={{ background: "#000" }} />;

export const calculateMetadata: CalculateMetadataFunction<SceneProps> = async () => ({
  durationInFrames: 30 * 30,
  fps: 30,
  width: 1080,
  height: 1920,
});
