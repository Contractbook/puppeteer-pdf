import puppeteer from "puppeteer";

const fixBrokenPdf = async (options) => {
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
}

export default fixBrokenPdf;
