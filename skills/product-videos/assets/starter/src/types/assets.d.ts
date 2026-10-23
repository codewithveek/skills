// Font files imported from npm resolve to URLs at bundle time (Remotion's webpack asset rule).
declare module "*.woff2" {
  const url: string;
  export default url;
}
