#!/usr/bin/env node
import fileUrl from "file-url";
import isUrl from "is-url";
import puppeteer from "puppeteer";

import cli from "./src/cli";
import { prepareOptions } from "./src/options";

(async () => {
  const cliOptions = cli.opts();
  const options = prepareOptions(cliOptions);

  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();

  // Get URL / file path from first argument
  const location = cli.args[0];
  await page.goto(isUrl(location) ? location : fileUrl(location), {
    waitUntil: options.waitUntil || "networkidle2"
  });
  // Output options if in debug mode
  if (options.debug) {
    console.log(options);
  }

  if (options.setTransparentBackground) {
    await page._emulationManager._client.send(
      'Emulation.setDefaultBackgroundColorOverride',
      { color: { r: 0, g: 0, b: 0, a: 0 } }
    );
  }

  await page.pdf(options);

  await browser.close();
})();
