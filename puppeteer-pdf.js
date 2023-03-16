#!/usr/bin/env node
import {createRequire} from 'module';const require=createRequire(import.meta.url);
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw new Error('Dynamic require of "' + x + '" is not supported');
});

// main.js
import fileUrl from "file-url";
import isUrl from "is-url";
import puppeteer from "puppeteer";

// src/cli.js
import { Command } from "commander";
var program = new Command();
program.version("1.0.0").option("-p, --path <path>", "The file path to save the PDF to.").option(
  "-s, --scale [scale]",
  "Scale of the webpage rendering.",
  parseFloat,
  1
).option("-dhf, --displayHeaderFooter", "Display header and footer.", false).option(
  "-ht, --headerTemplate [template]",
  "HTML template for the print header."
).option(
  "-ft, --footerTemplate [template]",
  "HTML template for the print footer."
).option("-pb, --printBackground", "Print background graphics.", false).option("-l, --landscape", "Paper orientation.", false).option(
  "-pr, --pageRanges <range>",
  "Paper ranges to print, e.g., '1-5, 8, 11-13'. Defaults to the empty string, which means print all pages."
).option(
  "-f, --format [format]",
  "Paper format. If set, takes priority over width or height options. Defaults to 'Letter'.",
  "Letter"
).option(
  "-w, --width [width]",
  "Paper width, accepts values labeled with units."
).option(
  "-h, --heigh [height]",
  "Paper height, accepts values labeled with units."
).option(
  "-mt, --marginTop [margin]",
  "Top margin, accepts values labeled with units."
).option(
  "-mr, --marginRight [margin]",
  "Right margin, accepts values labeled with units."
).option(
  "-mb, --marginBottom [margin]",
  "Bottom margin, accepts values labeled with units."
).option(
  "-ml, --marginLeft [margin]",
  "Left margin, accepts values labeled with units."
).option("-d, --debug", "Output Puppeteer PDF options").option(
  "-wu, --waitUntil [choice]",
  "waitUntil accepts choices load, domcontentloaded, networkidle0, networkidle2. Defaults to 'networkidle2'.",
  "networkidle2"
).option("-oBg, --omitBackground", "Omits background", false).parse(process.argv);
var cli_default = program;

// src/options.js
var fs = __require("fs");
var prepareOptions = (optionsFromCLI) => Object.keys(optionsFromCLI).reduce((acc, optionKey) => {
  if (optionKey == "version" || typeof optionKey == "object") {
    return acc;
  }
  const value = optionsFromCLI[optionKey];
  if (optionKey.startsWith("margin")) {
    const key = optionKey.replace("margin", "");
    return {
      ...acc,
      margin: {
        ...acc.margin,
        [key]: value
      }
    };
  }
  if (["headerTemplate", "footerTemplate"].includes(optionKey) && value.startsWith("file://")) {
    const loadedFile = fs.readFileSync(
      value.replace("file://", ""),
      "utf-8"
    );
    return {
      ...acc,
      [optionKey]: loadedFile
    };
  }
  return {
    ...acc,
    [optionKey]: value
  };
}, {});

// main.js
(async () => {
  const cliOptions = cli_default.opts();
  const options = prepareOptions(cliOptions);
  const executablePath = process.env.CHROME_BIN || "/usr/bin/google-chrome-stable";
  const browser = await puppeteer.launch({ args: ["--no-sandbox"], executablePath });
  const page = await browser.newPage();
  const location = cli_default.args[0];
  await page.goto(isUrl(location) ? location : fileUrl(location), {
    waitUntil: options.waitUntil || "networkidle2"
  });
  if (options.debug) {
    console.log(options);
  }
  await page.pdf(options);
  await browser.close();
})();
