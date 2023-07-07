#!/usr/bin/env node
import fileUrl from "file-url";
import isUrl from "is-url";
import puppeteer from "puppeteer";

import cli from "./src/cli";
import { prepareOptions } from "./src/options";

(async () => {
  const cliOptions = cli.opts();
  const options = prepareOptions(cliOptions);

  if (options.brokenPdf !== undefined && options.fixedPdf !== undefined) {
    const executablePath = process.env.FIREFOX_BIN || "/usr/bin/firefox"
    const browser = await puppeteer.launch({
      headless: true,
      product: 'firefox',
      executablePath: executablePath,
    });
    const page = await browser.newPage();

    const html = `
    <html>
      <body style="margin: 0;">
        <embed src="data:application/pdf;base64,${options.brokenPdf}" type="application/pdf" style="width: 100vw; height: 100vh;">
      </body>
    </html>
    `

    await page.setContent(html);
    await page.waitForSelector('embed[type="application/pdf"]');

    await page.pdf({path: options.fixedPdf, printBackground: true});

    await browser.close();

  } else  {
    const executablePath = process.env.CHROME_BIN || "/usr/bin/google-chrome-stable";
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ["--no-sandbox"],
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
  }
})();
