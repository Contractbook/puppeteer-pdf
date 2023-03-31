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

    const optionValue = ["headerTemplate", "footerTemplate"].includes(optionKey) &&
      value.startsWith("file://")
        ? fs.readFileSync(value.replace("file://", ""), "utf-8")
        : value;

    return {
      ...acc,
      [optionKey]: optionValue,
    };
  }, {});