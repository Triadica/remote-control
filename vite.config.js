import { defineConfig } from "vite";
let { gitDescribeSync } = require("git-describe");

const gitInfo = gitDescribeSync({
  // customArguments: ["--abbrev=16"], // how long in SHA
  match: "[0-9]*", // tag name
});

export default defineConfig({
  define: {
    __COMMIT_HASH__: JSON.stringify(gitInfo.hash || "TODO"),
    HASH: JSON.stringify(gitInfo.hash || "TODO"),
  },
});
