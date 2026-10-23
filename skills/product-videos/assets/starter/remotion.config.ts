import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setCodec("h264");
Config.setCrf(16);

// Use a browser that's already installed instead of Remotion's download (offline or locked-down
// machines): REMOTION_BROWSER_EXECUTABLE=/path/to/chrome-headless-shell ./render-all.sh
if (process.env.REMOTION_BROWSER_EXECUTABLE) Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
