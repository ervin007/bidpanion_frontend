import { spawn } from "child_process";
const port = process.env.PORT || "3000";
spawn("next", ["dev", "--turbo", "--port", port], {
  stdio: "inherit",
  shell: true,
}).on("exit", (code) => process.exit(code));
