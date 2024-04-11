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
import puppeteer2 from "puppeteer";

// src/cli.js
import { Command } from "commander";
var program = new Command();
program.version("1.0.0").option("-p, --path <path>", "The file path to save the PDF to.").option(
  "-s, --scale [scale]",
  "Scale of the webpage rendering.",
  parseFloat,
  1
).option("-dhf, --displayHeaderFooter", "Display header and footer.", false).option("-pCSSPage, --preferCSSPageSize", "Give any CSS @page size declared in the page priority over what is declared in the width or height or format option.", false).option("-l, --landscape", "(Optional) Whether to print in landscape orientation.", false).option(
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
  "-dSF, --deviceScaleFactor [width]",
  "Device scale factor"
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
).option("-oBg, --omitBackground", "Omits background", false).option("-bpdf --brokenPdf [file]", "Broken PDF to fix").option("-fpdf --fixedPdf [file]", "Fixed PDF").parse(process.argv);
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
  let optionValue = value;
  if (["headerTemplate", "footerTemplate"].includes(optionKey) && value.startsWith("file://")) {
    optionValue = fs.readFileSync(value.replace("file://", ""), "utf-8");
  }
  if (["brokenPdf"].includes(optionKey)) {
    optionValue = fs.readFileSync(value.replace("file://", "")).toString("base64");
  }
  if (["fixedPdf"].includes(optionKey)) {
    optionValue = value.replace("file://", "");
  }
  return {
    ...acc,
    [optionKey]: optionValue
  };
}, {});

// src/fixBrokenPdf.js
import puppeteer from "puppeteer";
var fixBrokenPdf = async (options) => {
  const executablePath = process.env.FIREFOX_BIN || "/usr/bin/firefox";
  const browser = await puppeteer.launch({
    headless: true,
    product: "firefox",
    executablePath
  });
  const page = await browser.newPage();
  const html = `
  <html>
    <body style="margin: 0;">
      <embed src="data:application/pdf;base64,${options.brokenPdf}" type="application/pdf" style="width: 100vw; height: 100vh;">
    </body>
  </html>
  `;
  await page.setContent(html);
  await page.waitForSelector('embed[type="application/pdf"]');
  await page.pdf({ path: options.fixedPdf, printBackground: true });
  await browser.close();
};
var fixBrokenPdf_default = fixBrokenPdf;

// main.js
(async () => {
  const cliOptions = cli_default.opts();
  const options = prepareOptions(cliOptions);
  if (options.brokenPdf !== void 0 && options.fixedPdf !== void 0) {
    fixBrokenPdf_default(options);
    return;
  }
  const executablePath = process.env.CHROME_BIN || "/usr/bin/google-chrome-stable";
  const browser = await puppeteer2.launch({
    headless: "old",
    args: [
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
      "--disable-gpu"
    ],
    executablePath
  });
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1240, height: 1448, deviceScaleFactor: options.deviceScaleFactor || 1 });
    const location = cli_default.args[0];
    await page.goto(isUrl(location) ? location : fileUrl(location), {
      waitUntil: options.waitUntil || "networkidle2"
    });
    if (options.debug) {
      console.log(options);
    }
    await page.pdf(options);
    await browser.close();
  } catch (e) {
    console.error(e);
  } finally {
    const pid = -browser.process().pid;
    try {
      process.kill(pid, "SIGKILL");
    } catch (e) {
    }
  }
})();
