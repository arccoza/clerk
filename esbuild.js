import * as esbuild from "esbuild"


const result = await esbuild.build({
  entryPoints: ["src/main.js"],
  bundle: true,
  outfile: "src/bundle.js",
  platform: "neutral",
  external: ["gi*"],
})

console.log(result)
