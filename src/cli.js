import { Command } from 'commander';
const program = new Command();

program
  .version("1.0.0")
  .option("-p, --path <path>", "The file path to save the PDF to.")
  .option(
    "-s, --scale [scale]",
    "Scale of the webpage rendering.",
    parseFloat,
    1
  )
  .option("-dhf, --displayHeaderFooter", "Display header and footer.", false)
  .option(
    "-ht, --headerTemplate [template]",
    "HTML template for the print header."
  )
  .option(
    "-ft, --footerTemplate [template]",
    "HTML template for the print footer."
  )
  .option("-pb, --printBackground", "Print background graphics.", false)
  .option("-l, --landscape", "Paper orientation.", false)
  .option(
    "-pr, --pageRanges <range>",
    "Paper ranges to print, e.g., '1-5, 8, 11-13'. Defaults to the empty string, which means print all pages."
  )
  .option(
    "-f, --format [format]",
    "Paper format. If set, takes priority over width or height options. Defaults to 'Letter'.",
    "Letter"
  )
  .option(
    "-w, --width [width]",
    "Paper width, accepts values labeled with units."
  )
  .option(
    "-h, --heigh [height]",
    "Paper height, accepts values labeled with units."
  )
  .option(
    "-mt, --marginTop [margin]",
    "Top margin, accepts values labeled with units."
  )
  .option(
    "-mr, --marginRight [margin]",
    "Right margin, accepts values labeled with units."
  )
  .option(
    "-mb, --marginBottom [margin]",
    "Bottom margin, accepts values labeled with units."
  )
  .option(
    "-ml, --marginLeft [margin]",
    "Left margin, accepts values labeled with units."
  )
  .option("-d, --debug", "Output Puppeteer PDF options")
  .option(
    "-wu, --waitUntil [choice]",
    "waitUntil accepts choices load, domcontentloaded, networkidle0, networkidle2. Defaults to 'networkidle2'.",
    "networkidle2"
  )
  .option("-oBg, --omitBackground", "Omits background", false)
  .parse(process.argv);

export default program;