const fs = require("fs");

export const prepareOptions = (optionsFromCLI) =>
  Object.keys(optionsFromCLI).reduce((acc, optionKey) => {
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
          [key]: value,
        }
      }
    }

    let optionValue = value;

    if (['headerTemplate', 'footerTemplate'].includes(optionKey) && value.startsWith('file://')) {
      optionValue = fs.readFileSync(value.replace('file://', ''), 'utf-8');
    }

    if (['brokenPdf'].includes(optionKey)) {
      optionValue = fs.readFileSync(value.replace('file://', '')).toString('base64');
    }

    if (['fixedPdf'].includes(optionKey)) {
      optionValue = value.replace('file://', '');
    }

    return {
      ...acc,
      [optionKey]: optionValue,
    };
  }, {});
