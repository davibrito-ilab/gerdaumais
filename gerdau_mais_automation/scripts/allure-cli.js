/**
 * Invoca o Allure CLI sem depender do shim em node_modules/.bin (no Windows,
 * esse shim costuma falhar se o caminho do projeto contiver parênteses).
 */
const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const binDir = path.join(
  __dirname,
  "..",
  "node_modules",
  "allure-commandline",
  "dist",
  "bin"
);
const isWin = process.platform === "win32";
const allureExe = isWin
  ? path.join(binDir, "allure.bat")
  : path.join(binDir, "allure");

if (!fs.existsSync(allureExe)) {
  console.error(
    "Allure CLI não encontrado. Rode npm install na pasta gerdau_mais_automation."
  );
  process.exit(1);
}

const args = process.argv.slice(2);
const result = isWin
  ? spawnSync("cmd.exe", ["/c", allureExe, ...args], {
      stdio: "inherit",
      windowsHide: true,
    })
  : spawnSync("sh", [allureExe, ...args], { stdio: "inherit", shell: false });

process.exit(result.status === null ? 1 : result.status);
