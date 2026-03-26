function parsePositiveInt(value) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function parseNonNegativeInt(value) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

function parseRequiredString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function parseEmail(value) {
  const email = parseRequiredString(value).toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "";
  }

  return email;
}

module.exports = {
  parsePositiveInt,
  parseNonNegativeInt,
  parseRequiredString,
  parseEmail,
};
