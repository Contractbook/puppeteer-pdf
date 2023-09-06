#!/usr/bin/env node
import fileUrl from "file-url";
import isUrl from "is-url";
import puppeteer from "puppeteer";

import cli from "./src/cli";
import { prepareOptions } from "./src/options";
import fixBrokenPdf from "./src/fixBrokenPdf";

(async () => {
  const cliOptions = cli.opts();
  const options = prepareOptions(cliOptions);

  if (options.brokenPdf !== undefined && options.fixedPdf !== undefined) {
    fixBrokenPdf(options);
    return;
  }

  const executablePath = process.env.CHROME_BIN || "/usr/bin/google-chrome-stable";
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
      "--disable-gpu"
    ],
    executablePath
  });
  const page = await browser.newPage();

  await page.setViewport({width: 1240, height: 1448, deviceScaleFactor: options.deviceScaleFactor || 1});

  // Get URL / file path from first argument
  const location = cli.args[0];
  await page.goto(isUrl(location) ? location : fileUrl(location), {
    waitUntil: options.waitUntil || "networkidle2"
  });
  // Output options if in debug mode
  if (options.debug) {
    console.log(options);
  }

  await page.pdf(options);

  await browser.close();
})();
