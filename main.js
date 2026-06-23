#!/usr/bin/env node
import fileUrl from "file-url";
import isUrl from "is-url";
import puppeteer from "puppeteer";

import cli from "./src/cli";
import { prepareOptions } from "./src/options";
import fixBrokenPdf from "./src/fixBrokenPdf";

(async () => {
  const cliOptions = cli.opts();
  var options = prepareOptions(cliOptions);

  if (options.brokenPdf !== undefined && options.fixedPdf !== undefined) {
    fixBrokenPdf(options);
    return;
  }

  const executablePath = process.env.CHROME_BIN || "/usr/bin/google-chrome-stable";
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      "--no-sandbox",
      "--no-zygote",
      "--disable-gpu"
    ],
    executablePath
  });
  const page = await browser.newPage();

  try {
    // Allow setting the size for PNG output but ignore the option if it is
    // not a valid plain number or if no PNG is to be generated. In all of the
    // ignore cases, use the supplied defaultValue.
    const numWithDefault = (optionValue, defaultValue) => {
      if (options.png) {
        const tryInt = parseInt(optionValue);
        return Number.isNaN(tryInt) ? defaultValue : tryInt;
      } else {
        return defaultValue;
      }
    }
    await page.setViewport({
      width: numWithDefault(options.width, 1240),
      height: numWithDefault(options.height, 1448),
      deviceScaleFactor: options.deviceScaleFactor || 1
    });

    // Get URL / file path from first argument
    const location = cli.args[0];
    await page.goto(isUrl(location) ? location : fileUrl(location), {
      waitUntil: options.waitUntil || "networkidle2"
    });
    // Output options if in debug mode
    if (options.debug) {
      console.log(options);
    }

    if (options.png) {
      // cross out the options which are supported (explicitly processed) but
      // not valid options to page.screenshot function. Effectively this leaves
      // only the `omitBackground` and `path` parameters active
      delete options.png;
      delete options.deviceScaleFactor;
      delete options.width;
      delete options.height;
      options.fullPage = true;
      await page.screenshot(options);
    } else {
      delete options.png;
      await page.pdf(options);
    }

    await browser.close();
  } catch(e) {
    console.error(e);
  } finally {
    // Kill group on error.
    const pid = -browser.process().pid;
    try {
      process.kill(pid, 'SIGKILL');
    } catch (e) {}
  }
})();
