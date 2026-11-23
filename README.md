# Glyph Bench

A single-stroke gesture prototyping tool for interaction designers. Draw with a mouse, pen, or touch, or activate a sample with a keyboard. Compare the three nearest labels, teach a new example, and see when the model abstains.

## Try it in 30 seconds

Select **Slash**. Its nearest starter template is too far away. Enter **Slash** in Gesture name and save. The new label now matches at distance zero. Save the same stroke again as **Cut** to expose a naming conflict. Reloading preserves examples in the same browser and origin if local storage is available.

## Run and deploy

From the app directory with Node.js 20 or later:

```sh
npm run build
npm start
```

Visit http://127.0.0.1:4173. The build copies the self-contained assets from src into dist. Publish dist as static files on Cloudflare Pages. No environment variables, accounts, network inference, or runtime packages are needed to run locally.

## Verification

Run npm ci, npm run build, and node verify.cjs in this directory. The test uses Playwright with installed Google Chrome by default. Set BROWSER_CHANNEL=msedge to use Microsoft Edge. It launches a loopback server and writes the four walkthrough images to the sibling shots directory.

## Technology and limits

Vanilla JavaScript, SVG, Pointer Events, CSS, and localStorage. A one-nearest-neighbor classifier compares ordered 32-point normalized stroke vectors. Examples of the same class compete by minimum distance. Matching is translation- and uniform-scale-invariant. Direction, rotation, stroke order and noisy shapes can affect results. The thresholds are prototype heuristics. Distances are geometric errors, not probabilities. The app has three hand-specified seed templates and four distinct sample paths. No external dataset, model weights, or model provider.

## Credits, AI use and license

During AI OpenBuild, OpenAI Codex, an AI coding agent, wrote the implementation, sample coordinates, tests and copy under human direction. The nearest-neighbor method predates the event. The application and its templates were created for this entry. Playwright is an existing development dependency. The project is distributed under the [MIT License](../LICENSE).
