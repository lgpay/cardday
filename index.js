var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// node_modules/date-fns/constants.js
var daysInYear = 365.2425;
var maxTime = Math.pow(10, 8) * 24 * 60 * 60 * 1e3;
var minTime = -maxTime;
var millisecondsInWeek = 6048e5;
var millisecondsInDay = 864e5;
var secondsInHour = 3600;
var secondsInDay = secondsInHour * 24;
var secondsInWeek = secondsInDay * 7;
var secondsInYear = secondsInDay * daysInYear;
var secondsInMonth = secondsInYear / 12;
var secondsInQuarter = secondsInMonth * 3;
var constructFromSymbol = Symbol.for("constructDateFrom");

// node_modules/date-fns/constructFrom.js
function constructFrom(date, value) {
  if (typeof date === "function")
    return date(value);
  if (date && typeof date === "object" && constructFromSymbol in date)
    return date[constructFromSymbol](value);
  if (date instanceof Date)
    return new date.constructor(value);
  return new Date(value);
}
__name(constructFrom, "constructFrom");

// node_modules/date-fns/toDate.js
function toDate(argument, context) {
  return constructFrom(context || argument, argument);
}
__name(toDate, "toDate");

// node_modules/date-fns/addMonths.js
function addMonths(date, amount, options) {
  const _date = toDate(date, options?.in);
  if (isNaN(amount))
    return constructFrom(options?.in || date, NaN);
  if (!amount) {
    return _date;
  }
  const dayOfMonth = _date.getDate();
  const endOfDesiredMonth = constructFrom(options?.in || date, _date.getTime());
  endOfDesiredMonth.setMonth(_date.getMonth() + amount + 1, 0);
  const daysInMonth = endOfDesiredMonth.getDate();
  if (dayOfMonth >= daysInMonth) {
    return endOfDesiredMonth;
  } else {
    _date.setFullYear(
      endOfDesiredMonth.getFullYear(),
      endOfDesiredMonth.getMonth(),
      dayOfMonth
    );
    return _date;
  }
}
__name(addMonths, "addMonths");

// node_modules/date-fns/_lib/defaultOptions.js
var defaultOptions = {};
function getDefaultOptions() {
  return defaultOptions;
}
__name(getDefaultOptions, "getDefaultOptions");

// node_modules/date-fns/startOfWeek.js
function startOfWeek(date, options) {
  const defaultOptions2 = getDefaultOptions();
  const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions2.weekStartsOn ?? defaultOptions2.locale?.options?.weekStartsOn ?? 0;
  const _date = toDate(date, options?.in);
  const day = _date.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  _date.setDate(_date.getDate() - diff);
  _date.setHours(0, 0, 0, 0);
  return _date;
}
__name(startOfWeek, "startOfWeek");

// node_modules/date-fns/startOfISOWeek.js
function startOfISOWeek(date, options) {
  return startOfWeek(date, { ...options, weekStartsOn: 1 });
}
__name(startOfISOWeek, "startOfISOWeek");

// node_modules/date-fns/getISOWeekYear.js
function getISOWeekYear(date, options) {
  const _date = toDate(date, options?.in);
  const year = _date.getFullYear();
  const fourthOfJanuaryOfNextYear = constructFrom(_date, 0);
  fourthOfJanuaryOfNextYear.setFullYear(year + 1, 0, 4);
  fourthOfJanuaryOfNextYear.setHours(0, 0, 0, 0);
  const startOfNextYear = startOfISOWeek(fourthOfJanuaryOfNextYear);
  const fourthOfJanuaryOfThisYear = constructFrom(_date, 0);
  fourthOfJanuaryOfThisYear.setFullYear(year, 0, 4);
  fourthOfJanuaryOfThisYear.setHours(0, 0, 0, 0);
  const startOfThisYear = startOfISOWeek(fourthOfJanuaryOfThisYear);
  if (_date.getTime() >= startOfNextYear.getTime()) {
    return year + 1;
  } else if (_date.getTime() >= startOfThisYear.getTime()) {
    return year;
  } else {
    return year - 1;
  }
}
__name(getISOWeekYear, "getISOWeekYear");

// node_modules/date-fns/_lib/getTimezoneOffsetInMilliseconds.js
function getTimezoneOffsetInMilliseconds(date) {
  const _date = toDate(date);
  const utcDate = new Date(
    Date.UTC(
      _date.getFullYear(),
      _date.getMonth(),
      _date.getDate(),
      _date.getHours(),
      _date.getMinutes(),
      _date.getSeconds(),
      _date.getMilliseconds()
    )
  );
  utcDate.setUTCFullYear(_date.getFullYear());
  return +date - +utcDate;
}
__name(getTimezoneOffsetInMilliseconds, "getTimezoneOffsetInMilliseconds");

// node_modules/date-fns/_lib/normalizeDates.js
function normalizeDates(context, ...dates) {
  const normalize = constructFrom.bind(
    null,
    context || dates.find((date) => typeof date === "object")
  );
  return dates.map(normalize);
}
__name(normalizeDates, "normalizeDates");

// node_modules/date-fns/startOfDay.js
function startOfDay(date, options) {
  const _date = toDate(date, options?.in);
  _date.setHours(0, 0, 0, 0);
  return _date;
}
__name(startOfDay, "startOfDay");

// node_modules/date-fns/differenceInCalendarDays.js
function differenceInCalendarDays(laterDate, earlierDate, options) {
  const [laterDate_, earlierDate_] = normalizeDates(
    options?.in,
    laterDate,
    earlierDate
  );
  const laterStartOfDay = startOfDay(laterDate_);
  const earlierStartOfDay = startOfDay(earlierDate_);
  const laterTimestamp = +laterStartOfDay - getTimezoneOffsetInMilliseconds(laterStartOfDay);
  const earlierTimestamp = +earlierStartOfDay - getTimezoneOffsetInMilliseconds(earlierStartOfDay);
  return Math.round((laterTimestamp - earlierTimestamp) / millisecondsInDay);
}
__name(differenceInCalendarDays, "differenceInCalendarDays");

// node_modules/date-fns/startOfISOWeekYear.js
function startOfISOWeekYear(date, options) {
  const year = getISOWeekYear(date, options);
  const fourthOfJanuary = constructFrom(options?.in || date, 0);
  fourthOfJanuary.setFullYear(year, 0, 4);
  fourthOfJanuary.setHours(0, 0, 0, 0);
  return startOfISOWeek(fourthOfJanuary);
}
__name(startOfISOWeekYear, "startOfISOWeekYear");

// node_modules/date-fns/isDate.js
function isDate(value) {
  return value instanceof Date || typeof value === "object" && Object.prototype.toString.call(value) === "[object Date]";
}
__name(isDate, "isDate");

// node_modules/date-fns/isValid.js
function isValid(date) {
  return !(!isDate(date) && typeof date !== "number" || isNaN(+toDate(date)));
}
__name(isValid, "isValid");

// node_modules/date-fns/startOfYear.js
function startOfYear(date, options) {
  const date_ = toDate(date, options?.in);
  date_.setFullYear(date_.getFullYear(), 0, 1);
  date_.setHours(0, 0, 0, 0);
  return date_;
}
__name(startOfYear, "startOfYear");

// node_modules/date-fns/locale/en-US/_lib/formatDistance.js
var formatDistanceLocale = {
  lessThanXSeconds: {
    one: "less than a second",
    other: "less than {{count}} seconds"
  },
  xSeconds: {
    one: "1 second",
    other: "{{count}} seconds"
  },
  halfAMinute: "half a minute",
  lessThanXMinutes: {
    one: "less than a minute",
    other: "less than {{count}} minutes"
  },
  xMinutes: {
    one: "1 minute",
    other: "{{count}} minutes"
  },
  aboutXHours: {
    one: "about 1 hour",
    other: "about {{count}} hours"
  },
  xHours: {
    one: "1 hour",
    other: "{{count}} hours"
  },
  xDays: {
    one: "1 day",
    other: "{{count}} days"
  },
  aboutXWeeks: {
    one: "about 1 week",
    other: "about {{count}} weeks"
  },
  xWeeks: {
    one: "1 week",
    other: "{{count}} weeks"
  },
  aboutXMonths: {
    one: "about 1 month",
    other: "about {{count}} months"
  },
  xMonths: {
    one: "1 month",
    other: "{{count}} months"
  },
  aboutXYears: {
    one: "about 1 year",
    other: "about {{count}} years"
  },
  xYears: {
    one: "1 year",
    other: "{{count}} years"
  },
  overXYears: {
    one: "over 1 year",
    other: "over {{count}} years"
  },
  almostXYears: {
    one: "almost 1 year",
    other: "almost {{count}} years"
  }
};
var formatDistance = /* @__PURE__ */ __name((token, count, options) => {
  let result;
  const tokenValue = formatDistanceLocale[token];
  if (typeof tokenValue === "string") {
    result = tokenValue;
  } else if (count === 1) {
    result = tokenValue.one;
  } else {
    result = tokenValue.other.replace("{{count}}", count.toString());
  }
  if (options?.addSuffix) {
    if (options.comparison && options.comparison > 0) {
      return "in " + result;
    } else {
      return result + " ago";
    }
  }
  return result;
}, "formatDistance");

// node_modules/date-fns/locale/_lib/buildFormatLongFn.js
function buildFormatLongFn(args) {
  return (options = {}) => {
    const width = options.width ? String(options.width) : args.defaultWidth;
    const format2 = args.formats[width] || args.formats[args.defaultWidth];
    return format2;
  };
}
__name(buildFormatLongFn, "buildFormatLongFn");

// node_modules/date-fns/locale/en-US/_lib/formatLong.js
var dateFormats = {
  full: "EEEE, MMMM do, y",
  long: "MMMM do, y",
  medium: "MMM d, y",
  short: "MM/dd/yyyy"
};
var timeFormats = {
  full: "h:mm:ss a zzzz",
  long: "h:mm:ss a z",
  medium: "h:mm:ss a",
  short: "h:mm a"
};
var dateTimeFormats = {
  full: "{{date}} 'at' {{time}}",
  long: "{{date}} 'at' {{time}}",
  medium: "{{date}}, {{time}}",
  short: "{{date}}, {{time}}"
};
var formatLong = {
  date: buildFormatLongFn({
    formats: dateFormats,
    defaultWidth: "full"
  }),
  time: buildFormatLongFn({
    formats: timeFormats,
    defaultWidth: "full"
  }),
  dateTime: buildFormatLongFn({
    formats: dateTimeFormats,
    defaultWidth: "full"
  })
};

// node_modules/date-fns/locale/en-US/_lib/formatRelative.js
var formatRelativeLocale = {
  lastWeek: "'last' eeee 'at' p",
  yesterday: "'yesterday at' p",
  today: "'today at' p",
  tomorrow: "'tomorrow at' p",
  nextWeek: "eeee 'at' p",
  other: "P"
};
var formatRelative = /* @__PURE__ */ __name((token, _date, _baseDate, _options) => formatRelativeLocale[token], "formatRelative");

// node_modules/date-fns/locale/_lib/buildLocalizeFn.js
function buildLocalizeFn(args) {
  return (value, options) => {
    const context = options?.context ? String(options.context) : "standalone";
    let valuesArray;
    if (context === "formatting" && args.formattingValues) {
      const defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
      const width = options?.width ? String(options.width) : defaultWidth;
      valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
    } else {
      const defaultWidth = args.defaultWidth;
      const width = options?.width ? String(options.width) : args.defaultWidth;
      valuesArray = args.values[width] || args.values[defaultWidth];
    }
    const index = args.argumentCallback ? args.argumentCallback(value) : value;
    return valuesArray[index];
  };
}
__name(buildLocalizeFn, "buildLocalizeFn");

// node_modules/date-fns/locale/en-US/_lib/localize.js
var eraValues = {
  narrow: ["B", "A"],
  abbreviated: ["BC", "AD"],
  wide: ["Before Christ", "Anno Domini"]
};
var quarterValues = {
  narrow: ["1", "2", "3", "4"],
  abbreviated: ["Q1", "Q2", "Q3", "Q4"],
  wide: ["1st quarter", "2nd quarter", "3rd quarter", "4th quarter"]
};
var monthValues = {
  narrow: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
  abbreviated: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ],
  wide: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ]
};
var dayValues = {
  narrow: ["S", "M", "T", "W", "T", "F", "S"],
  short: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  abbreviated: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  wide: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ]
};
var dayPeriodValues = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mi",
    noon: "n",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  }
};
var formattingDayPeriodValues = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mi",
    noon: "n",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "midnight",
    noon: "noon",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "midnight",
    noon: "noon",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  }
};
var ordinalNumber = /* @__PURE__ */ __name((dirtyNumber, _options) => {
  const number = Number(dirtyNumber);
  const rem100 = number % 100;
  if (rem100 > 20 || rem100 < 10) {
    switch (rem100 % 10) {
      case 1:
        return number + "st";
      case 2:
        return number + "nd";
      case 3:
        return number + "rd";
    }
  }
  return number + "th";
}, "ordinalNumber");
var localize = {
  ordinalNumber,
  era: buildLocalizeFn({
    values: eraValues,
    defaultWidth: "wide"
  }),
  quarter: buildLocalizeFn({
    values: quarterValues,
    defaultWidth: "wide",
    argumentCallback: (quarter) => quarter - 1
  }),
  month: buildLocalizeFn({
    values: monthValues,
    defaultWidth: "wide"
  }),
  day: buildLocalizeFn({
    values: dayValues,
    defaultWidth: "wide"
  }),
  dayPeriod: buildLocalizeFn({
    values: dayPeriodValues,
    defaultWidth: "wide",
    formattingValues: formattingDayPeriodValues,
    defaultFormattingWidth: "wide"
  })
};

// node_modules/date-fns/locale/_lib/buildMatchFn.js
function buildMatchFn(args) {
  return (string, options = {}) => {
    const width = options.width;
    const matchPattern = width && args.matchPatterns[width] || args.matchPatterns[args.defaultMatchWidth];
    const matchResult = string.match(matchPattern);
    if (!matchResult) {
      return null;
    }
    const matchedString = matchResult[0];
    const parsePatterns = width && args.parsePatterns[width] || args.parsePatterns[args.defaultParseWidth];
    const key = Array.isArray(parsePatterns) ? findIndex(parsePatterns, (pattern) => pattern.test(matchedString)) : (
      // [TODO] -- I challenge you to fix the type
      findKey(parsePatterns, (pattern) => pattern.test(matchedString))
    );
    let value;
    value = args.valueCallback ? args.valueCallback(key) : key;
    value = options.valueCallback ? (
      // [TODO] -- I challenge you to fix the type
      options.valueCallback(value)
    ) : value;
    const rest = string.slice(matchedString.length);
    return { value, rest };
  };
}
__name(buildMatchFn, "buildMatchFn");
function findKey(object, predicate) {
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key) && predicate(object[key])) {
      return key;
    }
  }
  return void 0;
}
__name(findKey, "findKey");
function findIndex(array, predicate) {
  for (let key = 0; key < array.length; key++) {
    if (predicate(array[key])) {
      return key;
    }
  }
  return void 0;
}
__name(findIndex, "findIndex");

// node_modules/date-fns/locale/_lib/buildMatchPatternFn.js
function buildMatchPatternFn(args) {
  return (string, options = {}) => {
    const matchResult = string.match(args.matchPattern);
    if (!matchResult)
      return null;
    const matchedString = matchResult[0];
    const parseResult = string.match(args.parsePattern);
    if (!parseResult)
      return null;
    let value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
    value = options.valueCallback ? options.valueCallback(value) : value;
    const rest = string.slice(matchedString.length);
    return { value, rest };
  };
}
__name(buildMatchPatternFn, "buildMatchPatternFn");

// node_modules/date-fns/locale/en-US/_lib/match.js
var matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
var parseOrdinalNumberPattern = /\d+/i;
var matchEraPatterns = {
  narrow: /^(b|a)/i,
  abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
  wide: /^(before christ|before common era|anno domini|common era)/i
};
var parseEraPatterns = {
  any: [/^b/i, /^(a|c)/i]
};
var matchQuarterPatterns = {
  narrow: /^[1234]/i,
  abbreviated: /^q[1234]/i,
  wide: /^[1234](th|st|nd|rd)? quarter/i
};
var parseQuarterPatterns = {
  any: [/1/i, /2/i, /3/i, /4/i]
};
var matchMonthPatterns = {
  narrow: /^[jfmasond]/i,
  abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
  wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
};
var parseMonthPatterns = {
  narrow: [
    /^j/i,
    /^f/i,
    /^m/i,
    /^a/i,
    /^m/i,
    /^j/i,
    /^j/i,
    /^a/i,
    /^s/i,
    /^o/i,
    /^n/i,
    /^d/i
  ],
  any: [
    /^ja/i,
    /^f/i,
    /^mar/i,
    /^ap/i,
    /^may/i,
    /^jun/i,
    /^jul/i,
    /^au/i,
    /^s/i,
    /^o/i,
    /^n/i,
    /^d/i
  ]
};
var matchDayPatterns = {
  narrow: /^[smtwf]/i,
  short: /^(su|mo|tu|we|th|fr|sa)/i,
  abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
  wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
};
var parseDayPatterns = {
  narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
  any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
};
var matchDayPeriodPatterns = {
  narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
  any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
};
var parseDayPeriodPatterns = {
  any: {
    am: /^a/i,
    pm: /^p/i,
    midnight: /^mi/i,
    noon: /^no/i,
    morning: /morning/i,
    afternoon: /afternoon/i,
    evening: /evening/i,
    night: /night/i
  }
};
var match = {
  ordinalNumber: buildMatchPatternFn({
    matchPattern: matchOrdinalNumberPattern,
    parsePattern: parseOrdinalNumberPattern,
    valueCallback: (value) => parseInt(value, 10)
  }),
  era: buildMatchFn({
    matchPatterns: matchEraPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseEraPatterns,
    defaultParseWidth: "any"
  }),
  quarter: buildMatchFn({
    matchPatterns: matchQuarterPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseQuarterPatterns,
    defaultParseWidth: "any",
    valueCallback: (index) => index + 1
  }),
  month: buildMatchFn({
    matchPatterns: matchMonthPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseMonthPatterns,
    defaultParseWidth: "any"
  }),
  day: buildMatchFn({
    matchPatterns: matchDayPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseDayPatterns,
    defaultParseWidth: "any"
  }),
  dayPeriod: buildMatchFn({
    matchPatterns: matchDayPeriodPatterns,
    defaultMatchWidth: "any",
    parsePatterns: parseDayPeriodPatterns,
    defaultParseWidth: "any"
  })
};

// node_modules/date-fns/locale/en-US.js
var enUS = {
  code: "en-US",
  formatDistance,
  formatLong,
  formatRelative,
  localize,
  match,
  options: {
    weekStartsOn: 0,
    firstWeekContainsDate: 1
  }
};

// node_modules/date-fns/getDayOfYear.js
function getDayOfYear(date, options) {
  const _date = toDate(date, options?.in);
  const diff = differenceInCalendarDays(_date, startOfYear(_date));
  const dayOfYear = diff + 1;
  return dayOfYear;
}
__name(getDayOfYear, "getDayOfYear");

// node_modules/date-fns/getISOWeek.js
function getISOWeek(date, options) {
  const _date = toDate(date, options?.in);
  const diff = +startOfISOWeek(_date) - +startOfISOWeekYear(_date);
  return Math.round(diff / millisecondsInWeek) + 1;
}
__name(getISOWeek, "getISOWeek");

// node_modules/date-fns/getWeekYear.js
function getWeekYear(date, options) {
  const _date = toDate(date, options?.in);
  const year = _date.getFullYear();
  const defaultOptions2 = getDefaultOptions();
  const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
  const firstWeekOfNextYear = constructFrom(options?.in || date, 0);
  firstWeekOfNextYear.setFullYear(year + 1, 0, firstWeekContainsDate);
  firstWeekOfNextYear.setHours(0, 0, 0, 0);
  const startOfNextYear = startOfWeek(firstWeekOfNextYear, options);
  const firstWeekOfThisYear = constructFrom(options?.in || date, 0);
  firstWeekOfThisYear.setFullYear(year, 0, firstWeekContainsDate);
  firstWeekOfThisYear.setHours(0, 0, 0, 0);
  const startOfThisYear = startOfWeek(firstWeekOfThisYear, options);
  if (+_date >= +startOfNextYear) {
    return year + 1;
  } else if (+_date >= +startOfThisYear) {
    return year;
  } else {
    return year - 1;
  }
}
__name(getWeekYear, "getWeekYear");

// node_modules/date-fns/startOfWeekYear.js
function startOfWeekYear(date, options) {
  const defaultOptions2 = getDefaultOptions();
  const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
  const year = getWeekYear(date, options);
  const firstWeek = constructFrom(options?.in || date, 0);
  firstWeek.setFullYear(year, 0, firstWeekContainsDate);
  firstWeek.setHours(0, 0, 0, 0);
  const _date = startOfWeek(firstWeek, options);
  return _date;
}
__name(startOfWeekYear, "startOfWeekYear");

// node_modules/date-fns/getWeek.js
function getWeek(date, options) {
  const _date = toDate(date, options?.in);
  const diff = +startOfWeek(_date, options) - +startOfWeekYear(_date, options);
  return Math.round(diff / millisecondsInWeek) + 1;
}
__name(getWeek, "getWeek");

// node_modules/date-fns/_lib/addLeadingZeros.js
function addLeadingZeros(number, targetLength) {
  const sign = number < 0 ? "-" : "";
  const output = Math.abs(number).toString().padStart(targetLength, "0");
  return sign + output;
}
__name(addLeadingZeros, "addLeadingZeros");

// node_modules/date-fns/_lib/format/lightFormatters.js
var lightFormatters = {
  // Year
  y(date, token) {
    const signedYear = date.getFullYear();
    const year = signedYear > 0 ? signedYear : 1 - signedYear;
    return addLeadingZeros(token === "yy" ? year % 100 : year, token.length);
  },
  // Month
  M(date, token) {
    const month = date.getMonth();
    return token === "M" ? String(month + 1) : addLeadingZeros(month + 1, 2);
  },
  // Day of the month
  d(date, token) {
    return addLeadingZeros(date.getDate(), token.length);
  },
  // AM or PM
  a(date, token) {
    const dayPeriodEnumValue = date.getHours() / 12 >= 1 ? "pm" : "am";
    switch (token) {
      case "a":
      case "aa":
        return dayPeriodEnumValue.toUpperCase();
      case "aaa":
        return dayPeriodEnumValue;
      case "aaaaa":
        return dayPeriodEnumValue[0];
      case "aaaa":
      default:
        return dayPeriodEnumValue === "am" ? "a.m." : "p.m.";
    }
  },
  // Hour [1-12]
  h(date, token) {
    return addLeadingZeros(date.getHours() % 12 || 12, token.length);
  },
  // Hour [0-23]
  H(date, token) {
    return addLeadingZeros(date.getHours(), token.length);
  },
  // Minute
  m(date, token) {
    return addLeadingZeros(date.getMinutes(), token.length);
  },
  // Second
  s(date, token) {
    return addLeadingZeros(date.getSeconds(), token.length);
  },
  // Fraction of second
  S(date, token) {
    const numberOfDigits = token.length;
    const milliseconds = date.getMilliseconds();
    const fractionalSeconds = Math.trunc(
      milliseconds * Math.pow(10, numberOfDigits - 3)
    );
    return addLeadingZeros(fractionalSeconds, token.length);
  }
};

// node_modules/date-fns/_lib/format/formatters.js
var dayPeriodEnum = {
  am: "am",
  pm: "pm",
  midnight: "midnight",
  noon: "noon",
  morning: "morning",
  afternoon: "afternoon",
  evening: "evening",
  night: "night"
};
var formatters = {
  // Era
  G: function(date, token, localize3) {
    const era = date.getFullYear() > 0 ? 1 : 0;
    switch (token) {
      case "G":
      case "GG":
      case "GGG":
        return localize3.era(era, { width: "abbreviated" });
      case "GGGGG":
        return localize3.era(era, { width: "narrow" });
      case "GGGG":
      default:
        return localize3.era(era, { width: "wide" });
    }
  },
  // Year
  y: function(date, token, localize3) {
    if (token === "yo") {
      const signedYear = date.getFullYear();
      const year = signedYear > 0 ? signedYear : 1 - signedYear;
      return localize3.ordinalNumber(year, { unit: "year" });
    }
    return lightFormatters.y(date, token);
  },
  // Local week-numbering year
  Y: function(date, token, localize3, options) {
    const signedWeekYear = getWeekYear(date, options);
    const weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear;
    if (token === "YY") {
      const twoDigitYear = weekYear % 100;
      return addLeadingZeros(twoDigitYear, 2);
    }
    if (token === "Yo") {
      return localize3.ordinalNumber(weekYear, { unit: "year" });
    }
    return addLeadingZeros(weekYear, token.length);
  },
  // ISO week-numbering year
  R: function(date, token) {
    const isoWeekYear = getISOWeekYear(date);
    return addLeadingZeros(isoWeekYear, token.length);
  },
  // Extended year. This is a single number designating the year of this calendar system.
  // The main difference between `y` and `u` localizers are B.C. years:
  // | Year | `y` | `u` |
  // |------|-----|-----|
  // | AC 1 |   1 |   1 |
  // | BC 1 |   1 |   0 |
  // | BC 2 |   2 |  -1 |
  // Also `yy` always returns the last two digits of a year,
  // while `uu` pads single digit years to 2 characters and returns other years unchanged.
  u: function(date, token) {
    const year = date.getFullYear();
    return addLeadingZeros(year, token.length);
  },
  // Quarter
  Q: function(date, token, localize3) {
    const quarter = Math.ceil((date.getMonth() + 1) / 3);
    switch (token) {
      case "Q":
        return String(quarter);
      case "QQ":
        return addLeadingZeros(quarter, 2);
      case "Qo":
        return localize3.ordinalNumber(quarter, { unit: "quarter" });
      case "QQQ":
        return localize3.quarter(quarter, {
          width: "abbreviated",
          context: "formatting"
        });
      case "QQQQQ":
        return localize3.quarter(quarter, {
          width: "narrow",
          context: "formatting"
        });
      case "QQQQ":
      default:
        return localize3.quarter(quarter, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Stand-alone quarter
  q: function(date, token, localize3) {
    const quarter = Math.ceil((date.getMonth() + 1) / 3);
    switch (token) {
      case "q":
        return String(quarter);
      case "qq":
        return addLeadingZeros(quarter, 2);
      case "qo":
        return localize3.ordinalNumber(quarter, { unit: "quarter" });
      case "qqq":
        return localize3.quarter(quarter, {
          width: "abbreviated",
          context: "standalone"
        });
      case "qqqqq":
        return localize3.quarter(quarter, {
          width: "narrow",
          context: "standalone"
        });
      case "qqqq":
      default:
        return localize3.quarter(quarter, {
          width: "wide",
          context: "standalone"
        });
    }
  },
  // Month
  M: function(date, token, localize3) {
    const month = date.getMonth();
    switch (token) {
      case "M":
      case "MM":
        return lightFormatters.M(date, token);
      case "Mo":
        return localize3.ordinalNumber(month + 1, { unit: "month" });
      case "MMM":
        return localize3.month(month, {
          width: "abbreviated",
          context: "formatting"
        });
      case "MMMMM":
        return localize3.month(month, {
          width: "narrow",
          context: "formatting"
        });
      case "MMMM":
      default:
        return localize3.month(month, { width: "wide", context: "formatting" });
    }
  },
  // Stand-alone month
  L: function(date, token, localize3) {
    const month = date.getMonth();
    switch (token) {
      case "L":
        return String(month + 1);
      case "LL":
        return addLeadingZeros(month + 1, 2);
      case "Lo":
        return localize3.ordinalNumber(month + 1, { unit: "month" });
      case "LLL":
        return localize3.month(month, {
          width: "abbreviated",
          context: "standalone"
        });
      case "LLLLL":
        return localize3.month(month, {
          width: "narrow",
          context: "standalone"
        });
      case "LLLL":
      default:
        return localize3.month(month, { width: "wide", context: "standalone" });
    }
  },
  // Local week of year
  w: function(date, token, localize3, options) {
    const week = getWeek(date, options);
    if (token === "wo") {
      return localize3.ordinalNumber(week, { unit: "week" });
    }
    return addLeadingZeros(week, token.length);
  },
  // ISO week of year
  I: function(date, token, localize3) {
    const isoWeek = getISOWeek(date);
    if (token === "Io") {
      return localize3.ordinalNumber(isoWeek, { unit: "week" });
    }
    return addLeadingZeros(isoWeek, token.length);
  },
  // Day of the month
  d: function(date, token, localize3) {
    if (token === "do") {
      return localize3.ordinalNumber(date.getDate(), { unit: "date" });
    }
    return lightFormatters.d(date, token);
  },
  // Day of year
  D: function(date, token, localize3) {
    const dayOfYear = getDayOfYear(date);
    if (token === "Do") {
      return localize3.ordinalNumber(dayOfYear, { unit: "dayOfYear" });
    }
    return addLeadingZeros(dayOfYear, token.length);
  },
  // Day of week
  E: function(date, token, localize3) {
    const dayOfWeek = date.getDay();
    switch (token) {
      case "E":
      case "EE":
      case "EEE":
        return localize3.day(dayOfWeek, {
          width: "abbreviated",
          context: "formatting"
        });
      case "EEEEE":
        return localize3.day(dayOfWeek, {
          width: "narrow",
          context: "formatting"
        });
      case "EEEEEE":
        return localize3.day(dayOfWeek, {
          width: "short",
          context: "formatting"
        });
      case "EEEE":
      default:
        return localize3.day(dayOfWeek, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Local day of week
  e: function(date, token, localize3, options) {
    const dayOfWeek = date.getDay();
    const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
    switch (token) {
      case "e":
        return String(localDayOfWeek);
      case "ee":
        return addLeadingZeros(localDayOfWeek, 2);
      case "eo":
        return localize3.ordinalNumber(localDayOfWeek, { unit: "day" });
      case "eee":
        return localize3.day(dayOfWeek, {
          width: "abbreviated",
          context: "formatting"
        });
      case "eeeee":
        return localize3.day(dayOfWeek, {
          width: "narrow",
          context: "formatting"
        });
      case "eeeeee":
        return localize3.day(dayOfWeek, {
          width: "short",
          context: "formatting"
        });
      case "eeee":
      default:
        return localize3.day(dayOfWeek, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Stand-alone local day of week
  c: function(date, token, localize3, options) {
    const dayOfWeek = date.getDay();
    const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
    switch (token) {
      case "c":
        return String(localDayOfWeek);
      case "cc":
        return addLeadingZeros(localDayOfWeek, token.length);
      case "co":
        return localize3.ordinalNumber(localDayOfWeek, { unit: "day" });
      case "ccc":
        return localize3.day(dayOfWeek, {
          width: "abbreviated",
          context: "standalone"
        });
      case "ccccc":
        return localize3.day(dayOfWeek, {
          width: "narrow",
          context: "standalone"
        });
      case "cccccc":
        return localize3.day(dayOfWeek, {
          width: "short",
          context: "standalone"
        });
      case "cccc":
      default:
        return localize3.day(dayOfWeek, {
          width: "wide",
          context: "standalone"
        });
    }
  },
  // ISO day of week
  i: function(date, token, localize3) {
    const dayOfWeek = date.getDay();
    const isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
    switch (token) {
      case "i":
        return String(isoDayOfWeek);
      case "ii":
        return addLeadingZeros(isoDayOfWeek, token.length);
      case "io":
        return localize3.ordinalNumber(isoDayOfWeek, { unit: "day" });
      case "iii":
        return localize3.day(dayOfWeek, {
          width: "abbreviated",
          context: "formatting"
        });
      case "iiiii":
        return localize3.day(dayOfWeek, {
          width: "narrow",
          context: "formatting"
        });
      case "iiiiii":
        return localize3.day(dayOfWeek, {
          width: "short",
          context: "formatting"
        });
      case "iiii":
      default:
        return localize3.day(dayOfWeek, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // AM or PM
  a: function(date, token, localize3) {
    const hours = date.getHours();
    const dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
    switch (token) {
      case "a":
      case "aa":
        return localize3.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        });
      case "aaa":
        return localize3.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        }).toLowerCase();
      case "aaaaa":
        return localize3.dayPeriod(dayPeriodEnumValue, {
          width: "narrow",
          context: "formatting"
        });
      case "aaaa":
      default:
        return localize3.dayPeriod(dayPeriodEnumValue, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // AM, PM, midnight, noon
  b: function(date, token, localize3) {
    const hours = date.getHours();
    let dayPeriodEnumValue;
    if (hours === 12) {
      dayPeriodEnumValue = dayPeriodEnum.noon;
    } else if (hours === 0) {
      dayPeriodEnumValue = dayPeriodEnum.midnight;
    } else {
      dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
    }
    switch (token) {
      case "b":
      case "bb":
        return localize3.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        });
      case "bbb":
        return localize3.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        }).toLowerCase();
      case "bbbbb":
        return localize3.dayPeriod(dayPeriodEnumValue, {
          width: "narrow",
          context: "formatting"
        });
      case "bbbb":
      default:
        return localize3.dayPeriod(dayPeriodEnumValue, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // in the morning, in the afternoon, in the evening, at night
  B: function(date, token, localize3) {
    const hours = date.getHours();
    let dayPeriodEnumValue;
    if (hours >= 17) {
      dayPeriodEnumValue = dayPeriodEnum.evening;
    } else if (hours >= 12) {
      dayPeriodEnumValue = dayPeriodEnum.afternoon;
    } else if (hours >= 4) {
      dayPeriodEnumValue = dayPeriodEnum.morning;
    } else {
      dayPeriodEnumValue = dayPeriodEnum.night;
    }
    switch (token) {
      case "B":
      case "BB":
      case "BBB":
        return localize3.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        });
      case "BBBBB":
        return localize3.dayPeriod(dayPeriodEnumValue, {
          width: "narrow",
          context: "formatting"
        });
      case "BBBB":
      default:
        return localize3.dayPeriod(dayPeriodEnumValue, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Hour [1-12]
  h: function(date, token, localize3) {
    if (token === "ho") {
      let hours = date.getHours() % 12;
      if (hours === 0)
        hours = 12;
      return localize3.ordinalNumber(hours, { unit: "hour" });
    }
    return lightFormatters.h(date, token);
  },
  // Hour [0-23]
  H: function(date, token, localize3) {
    if (token === "Ho") {
      return localize3.ordinalNumber(date.getHours(), { unit: "hour" });
    }
    return lightFormatters.H(date, token);
  },
  // Hour [0-11]
  K: function(date, token, localize3) {
    const hours = date.getHours() % 12;
    if (token === "Ko") {
      return localize3.ordinalNumber(hours, { unit: "hour" });
    }
    return addLeadingZeros(hours, token.length);
  },
  // Hour [1-24]
  k: function(date, token, localize3) {
    let hours = date.getHours();
    if (hours === 0)
      hours = 24;
    if (token === "ko") {
      return localize3.ordinalNumber(hours, { unit: "hour" });
    }
    return addLeadingZeros(hours, token.length);
  },
  // Minute
  m: function(date, token, localize3) {
    if (token === "mo") {
      return localize3.ordinalNumber(date.getMinutes(), { unit: "minute" });
    }
    return lightFormatters.m(date, token);
  },
  // Second
  s: function(date, token, localize3) {
    if (token === "so") {
      return localize3.ordinalNumber(date.getSeconds(), { unit: "second" });
    }
    return lightFormatters.s(date, token);
  },
  // Fraction of second
  S: function(date, token) {
    return lightFormatters.S(date, token);
  },
  // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
  X: function(date, token, _localize) {
    const timezoneOffset = date.getTimezoneOffset();
    if (timezoneOffset === 0) {
      return "Z";
    }
    switch (token) {
      case "X":
        return formatTimezoneWithOptionalMinutes(timezoneOffset);
      case "XXXX":
      case "XX":
        return formatTimezone(timezoneOffset);
      case "XXXXX":
      case "XXX":
      default:
        return formatTimezone(timezoneOffset, ":");
    }
  },
  // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
  x: function(date, token, _localize) {
    const timezoneOffset = date.getTimezoneOffset();
    switch (token) {
      case "x":
        return formatTimezoneWithOptionalMinutes(timezoneOffset);
      case "xxxx":
      case "xx":
        return formatTimezone(timezoneOffset);
      case "xxxxx":
      case "xxx":
      default:
        return formatTimezone(timezoneOffset, ":");
    }
  },
  // Timezone (GMT)
  O: function(date, token, _localize) {
    const timezoneOffset = date.getTimezoneOffset();
    switch (token) {
      case "O":
      case "OO":
      case "OOO":
        return "GMT" + formatTimezoneShort(timezoneOffset, ":");
      case "OOOO":
      default:
        return "GMT" + formatTimezone(timezoneOffset, ":");
    }
  },
  // Timezone (specific non-location)
  z: function(date, token, _localize) {
    const timezoneOffset = date.getTimezoneOffset();
    switch (token) {
      case "z":
      case "zz":
      case "zzz":
        return "GMT" + formatTimezoneShort(timezoneOffset, ":");
      case "zzzz":
      default:
        return "GMT" + formatTimezone(timezoneOffset, ":");
    }
  },
  // Seconds timestamp
  t: function(date, token, _localize) {
    const timestamp = Math.trunc(+date / 1e3);
    return addLeadingZeros(timestamp, token.length);
  },
  // Milliseconds timestamp
  T: function(date, token, _localize) {
    return addLeadingZeros(+date, token.length);
  }
};
function formatTimezoneShort(offset, delimiter = "") {
  const sign = offset > 0 ? "-" : "+";
  const absOffset = Math.abs(offset);
  const hours = Math.trunc(absOffset / 60);
  const minutes = absOffset % 60;
  if (minutes === 0) {
    return sign + String(hours);
  }
  return sign + String(hours) + delimiter + addLeadingZeros(minutes, 2);
}
__name(formatTimezoneShort, "formatTimezoneShort");
function formatTimezoneWithOptionalMinutes(offset, delimiter) {
  if (offset % 60 === 0) {
    const sign = offset > 0 ? "-" : "+";
    return sign + addLeadingZeros(Math.abs(offset) / 60, 2);
  }
  return formatTimezone(offset, delimiter);
}
__name(formatTimezoneWithOptionalMinutes, "formatTimezoneWithOptionalMinutes");
function formatTimezone(offset, delimiter = "") {
  const sign = offset > 0 ? "-" : "+";
  const absOffset = Math.abs(offset);
  const hours = addLeadingZeros(Math.trunc(absOffset / 60), 2);
  const minutes = addLeadingZeros(absOffset % 60, 2);
  return sign + hours + delimiter + minutes;
}
__name(formatTimezone, "formatTimezone");

// node_modules/date-fns/_lib/format/longFormatters.js
var dateLongFormatter = /* @__PURE__ */ __name((pattern, formatLong3) => {
  switch (pattern) {
    case "P":
      return formatLong3.date({ width: "short" });
    case "PP":
      return formatLong3.date({ width: "medium" });
    case "PPP":
      return formatLong3.date({ width: "long" });
    case "PPPP":
    default:
      return formatLong3.date({ width: "full" });
  }
}, "dateLongFormatter");
var timeLongFormatter = /* @__PURE__ */ __name((pattern, formatLong3) => {
  switch (pattern) {
    case "p":
      return formatLong3.time({ width: "short" });
    case "pp":
      return formatLong3.time({ width: "medium" });
    case "ppp":
      return formatLong3.time({ width: "long" });
    case "pppp":
    default:
      return formatLong3.time({ width: "full" });
  }
}, "timeLongFormatter");
var dateTimeLongFormatter = /* @__PURE__ */ __name((pattern, formatLong3) => {
  const matchResult = pattern.match(/(P+)(p+)?/) || [];
  const datePattern = matchResult[1];
  const timePattern = matchResult[2];
  if (!timePattern) {
    return dateLongFormatter(pattern, formatLong3);
  }
  let dateTimeFormat;
  switch (datePattern) {
    case "P":
      dateTimeFormat = formatLong3.dateTime({ width: "short" });
      break;
    case "PP":
      dateTimeFormat = formatLong3.dateTime({ width: "medium" });
      break;
    case "PPP":
      dateTimeFormat = formatLong3.dateTime({ width: "long" });
      break;
    case "PPPP":
    default:
      dateTimeFormat = formatLong3.dateTime({ width: "full" });
      break;
  }
  return dateTimeFormat.replace("{{date}}", dateLongFormatter(datePattern, formatLong3)).replace("{{time}}", timeLongFormatter(timePattern, formatLong3));
}, "dateTimeLongFormatter");
var longFormatters = {
  p: timeLongFormatter,
  P: dateTimeLongFormatter
};

// node_modules/date-fns/_lib/protectedTokens.js
var dayOfYearTokenRE = /^D+$/;
var weekYearTokenRE = /^Y+$/;
var throwTokens = ["D", "DD", "YY", "YYYY"];
function isProtectedDayOfYearToken(token) {
  return dayOfYearTokenRE.test(token);
}
__name(isProtectedDayOfYearToken, "isProtectedDayOfYearToken");
function isProtectedWeekYearToken(token) {
  return weekYearTokenRE.test(token);
}
__name(isProtectedWeekYearToken, "isProtectedWeekYearToken");
function warnOrThrowProtectedError(token, format2, input) {
  const _message = message(token, format2, input);
  console.warn(_message);
  if (throwTokens.includes(token))
    throw new RangeError(_message);
}
__name(warnOrThrowProtectedError, "warnOrThrowProtectedError");
function message(token, format2, input) {
  const subject = token[0] === "Y" ? "years" : "days of the month";
  return `Use \`${token.toLowerCase()}\` instead of \`${token}\` (in \`${format2}\`) for formatting ${subject} to the input \`${input}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`;
}
__name(message, "message");

// node_modules/date-fns/format.js
var formattingTokensRegExp = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g;
var longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
var escapedStringRegExp = /^'([^]*?)'?$/;
var doubleQuoteRegExp = /''/g;
var unescapedLatinCharacterRegExp = /[a-zA-Z]/;
function format(date, formatStr, options) {
  const defaultOptions2 = getDefaultOptions();
  const locale = options?.locale ?? defaultOptions2.locale ?? enUS;
  const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
  const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions2.weekStartsOn ?? defaultOptions2.locale?.options?.weekStartsOn ?? 0;
  const originalDate = toDate(date, options?.in);
  if (!isValid(originalDate)) {
    throw new RangeError("Invalid time value");
  }
  let parts = formatStr.match(longFormattingTokensRegExp).map((substring) => {
    const firstCharacter = substring[0];
    if (firstCharacter === "p" || firstCharacter === "P") {
      const longFormatter = longFormatters[firstCharacter];
      return longFormatter(substring, locale.formatLong);
    }
    return substring;
  }).join("").match(formattingTokensRegExp).map((substring) => {
    if (substring === "''") {
      return { isToken: false, value: "'" };
    }
    const firstCharacter = substring[0];
    if (firstCharacter === "'") {
      return { isToken: false, value: cleanEscapedString(substring) };
    }
    if (formatters[firstCharacter]) {
      return { isToken: true, value: substring };
    }
    if (firstCharacter.match(unescapedLatinCharacterRegExp)) {
      throw new RangeError(
        "Format string contains an unescaped latin alphabet character `" + firstCharacter + "`"
      );
    }
    return { isToken: false, value: substring };
  });
  if (locale.localize.preprocessor) {
    parts = locale.localize.preprocessor(originalDate, parts);
  }
  const formatterOptions = {
    firstWeekContainsDate,
    weekStartsOn,
    locale
  };
  return parts.map((part) => {
    if (!part.isToken)
      return part.value;
    const token = part.value;
    if (!options?.useAdditionalWeekYearTokens && isProtectedWeekYearToken(token) || !options?.useAdditionalDayOfYearTokens && isProtectedDayOfYearToken(token)) {
      warnOrThrowProtectedError(token, formatStr, String(date));
    }
    const formatter = formatters[token[0]];
    return formatter(originalDate, token, locale.localize, formatterOptions);
  }).join("");
}
__name(format, "format");
function cleanEscapedString(input) {
  const matched = input.match(escapedStringRegExp);
  if (!matched) {
    return input;
  }
  return matched[1].replace(doubleQuoteRegExp, "'");
}
__name(cleanEscapedString, "cleanEscapedString");

// node_modules/date-fns/isSameWeek.js
function isSameWeek(laterDate, earlierDate, options) {
  const [laterDate_, earlierDate_] = normalizeDates(
    options?.in,
    laterDate,
    earlierDate
  );
  return +startOfWeek(laterDate_, options) === +startOfWeek(earlierDate_, options);
}
__name(isSameWeek, "isSameWeek");

// node_modules/date-fns/locale/zh-CN/_lib/formatDistance.js
var formatDistanceLocale2 = {
  lessThanXSeconds: {
    one: "\u4E0D\u5230 1 \u79D2",
    other: "\u4E0D\u5230 {{count}} \u79D2"
  },
  xSeconds: {
    one: "1 \u79D2",
    other: "{{count}} \u79D2"
  },
  halfAMinute: "\u534A\u5206\u949F",
  lessThanXMinutes: {
    one: "\u4E0D\u5230 1 \u5206\u949F",
    other: "\u4E0D\u5230 {{count}} \u5206\u949F"
  },
  xMinutes: {
    one: "1 \u5206\u949F",
    other: "{{count}} \u5206\u949F"
  },
  xHours: {
    one: "1 \u5C0F\u65F6",
    other: "{{count}} \u5C0F\u65F6"
  },
  aboutXHours: {
    one: "\u5927\u7EA6 1 \u5C0F\u65F6",
    other: "\u5927\u7EA6 {{count}} \u5C0F\u65F6"
  },
  xDays: {
    one: "1 \u5929",
    other: "{{count}} \u5929"
  },
  aboutXWeeks: {
    one: "\u5927\u7EA6 1 \u4E2A\u661F\u671F",
    other: "\u5927\u7EA6 {{count}} \u4E2A\u661F\u671F"
  },
  xWeeks: {
    one: "1 \u4E2A\u661F\u671F",
    other: "{{count}} \u4E2A\u661F\u671F"
  },
  aboutXMonths: {
    one: "\u5927\u7EA6 1 \u4E2A\u6708",
    other: "\u5927\u7EA6 {{count}} \u4E2A\u6708"
  },
  xMonths: {
    one: "1 \u4E2A\u6708",
    other: "{{count}} \u4E2A\u6708"
  },
  aboutXYears: {
    one: "\u5927\u7EA6 1 \u5E74",
    other: "\u5927\u7EA6 {{count}} \u5E74"
  },
  xYears: {
    one: "1 \u5E74",
    other: "{{count}} \u5E74"
  },
  overXYears: {
    one: "\u8D85\u8FC7 1 \u5E74",
    other: "\u8D85\u8FC7 {{count}} \u5E74"
  },
  almostXYears: {
    one: "\u5C06\u8FD1 1 \u5E74",
    other: "\u5C06\u8FD1 {{count}} \u5E74"
  }
};
var formatDistance2 = /* @__PURE__ */ __name((token, count, options) => {
  let result;
  const tokenValue = formatDistanceLocale2[token];
  if (typeof tokenValue === "string") {
    result = tokenValue;
  } else if (count === 1) {
    result = tokenValue.one;
  } else {
    result = tokenValue.other.replace("{{count}}", String(count));
  }
  if (options?.addSuffix) {
    if (options.comparison && options.comparison > 0) {
      return result + "\u5185";
    } else {
      return result + "\u524D";
    }
  }
  return result;
}, "formatDistance");

// node_modules/date-fns/locale/zh-CN/_lib/formatLong.js
var dateFormats2 = {
  full: "y'\u5E74'M'\u6708'd'\u65E5' EEEE",
  long: "y'\u5E74'M'\u6708'd'\u65E5'",
  medium: "yyyy-MM-dd",
  short: "yy-MM-dd"
};
var timeFormats2 = {
  full: "zzzz a h:mm:ss",
  long: "z a h:mm:ss",
  medium: "a h:mm:ss",
  short: "a h:mm"
};
var dateTimeFormats2 = {
  full: "{{date}} {{time}}",
  long: "{{date}} {{time}}",
  medium: "{{date}} {{time}}",
  short: "{{date}} {{time}}"
};
var formatLong2 = {
  date: buildFormatLongFn({
    formats: dateFormats2,
    defaultWidth: "full"
  }),
  time: buildFormatLongFn({
    formats: timeFormats2,
    defaultWidth: "full"
  }),
  dateTime: buildFormatLongFn({
    formats: dateTimeFormats2,
    defaultWidth: "full"
  })
};

// node_modules/date-fns/locale/zh-CN/_lib/formatRelative.js
function checkWeek(date, baseDate, options) {
  const baseFormat = "eeee p";
  if (isSameWeek(date, baseDate, options)) {
    return baseFormat;
  } else if (date.getTime() > baseDate.getTime()) {
    return "'\u4E0B\u4E2A'" + baseFormat;
  }
  return "'\u4E0A\u4E2A'" + baseFormat;
}
__name(checkWeek, "checkWeek");
var formatRelativeLocale2 = {
  lastWeek: checkWeek,
  // days before yesterday, maybe in this week or last week
  yesterday: "'\u6628\u5929' p",
  today: "'\u4ECA\u5929' p",
  tomorrow: "'\u660E\u5929' p",
  nextWeek: checkWeek,
  // days after tomorrow, maybe in this week or next week
  other: "PP p"
};
var formatRelative2 = /* @__PURE__ */ __name((token, date, baseDate, options) => {
  const format2 = formatRelativeLocale2[token];
  if (typeof format2 === "function") {
    return format2(date, baseDate, options);
  }
  return format2;
}, "formatRelative");

// node_modules/date-fns/locale/zh-CN/_lib/localize.js
var eraValues2 = {
  narrow: ["\u524D", "\u516C\u5143"],
  abbreviated: ["\u524D", "\u516C\u5143"],
  wide: ["\u516C\u5143\u524D", "\u516C\u5143"]
};
var quarterValues2 = {
  narrow: ["1", "2", "3", "4"],
  abbreviated: ["\u7B2C\u4E00\u5B63", "\u7B2C\u4E8C\u5B63", "\u7B2C\u4E09\u5B63", "\u7B2C\u56DB\u5B63"],
  wide: ["\u7B2C\u4E00\u5B63\u5EA6", "\u7B2C\u4E8C\u5B63\u5EA6", "\u7B2C\u4E09\u5B63\u5EA6", "\u7B2C\u56DB\u5B63\u5EA6"]
};
var monthValues2 = {
  narrow: [
    "\u4E00",
    "\u4E8C",
    "\u4E09",
    "\u56DB",
    "\u4E94",
    "\u516D",
    "\u4E03",
    "\u516B",
    "\u4E5D",
    "\u5341",
    "\u5341\u4E00",
    "\u5341\u4E8C"
  ],
  abbreviated: [
    "1\u6708",
    "2\u6708",
    "3\u6708",
    "4\u6708",
    "5\u6708",
    "6\u6708",
    "7\u6708",
    "8\u6708",
    "9\u6708",
    "10\u6708",
    "11\u6708",
    "12\u6708"
  ],
  wide: [
    "\u4E00\u6708",
    "\u4E8C\u6708",
    "\u4E09\u6708",
    "\u56DB\u6708",
    "\u4E94\u6708",
    "\u516D\u6708",
    "\u4E03\u6708",
    "\u516B\u6708",
    "\u4E5D\u6708",
    "\u5341\u6708",
    "\u5341\u4E00\u6708",
    "\u5341\u4E8C\u6708"
  ]
};
var dayValues2 = {
  narrow: ["\u65E5", "\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D"],
  short: ["\u65E5", "\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D"],
  abbreviated: ["\u5468\u65E5", "\u5468\u4E00", "\u5468\u4E8C", "\u5468\u4E09", "\u5468\u56DB", "\u5468\u4E94", "\u5468\u516D"],
  wide: ["\u661F\u671F\u65E5", "\u661F\u671F\u4E00", "\u661F\u671F\u4E8C", "\u661F\u671F\u4E09", "\u661F\u671F\u56DB", "\u661F\u671F\u4E94", "\u661F\u671F\u516D"]
};
var dayPeriodValues2 = {
  narrow: {
    am: "\u4E0A",
    pm: "\u4E0B",
    midnight: "\u51CC\u6668",
    noon: "\u5348",
    morning: "\u65E9",
    afternoon: "\u4E0B\u5348",
    evening: "\u665A",
    night: "\u591C"
  },
  abbreviated: {
    am: "\u4E0A\u5348",
    pm: "\u4E0B\u5348",
    midnight: "\u51CC\u6668",
    noon: "\u4E2D\u5348",
    morning: "\u65E9\u6668",
    afternoon: "\u4E2D\u5348",
    evening: "\u665A\u4E0A",
    night: "\u591C\u95F4"
  },
  wide: {
    am: "\u4E0A\u5348",
    pm: "\u4E0B\u5348",
    midnight: "\u51CC\u6668",
    noon: "\u4E2D\u5348",
    morning: "\u65E9\u6668",
    afternoon: "\u4E2D\u5348",
    evening: "\u665A\u4E0A",
    night: "\u591C\u95F4"
  }
};
var formattingDayPeriodValues2 = {
  narrow: {
    am: "\u4E0A",
    pm: "\u4E0B",
    midnight: "\u51CC\u6668",
    noon: "\u5348",
    morning: "\u65E9",
    afternoon: "\u4E0B\u5348",
    evening: "\u665A",
    night: "\u591C"
  },
  abbreviated: {
    am: "\u4E0A\u5348",
    pm: "\u4E0B\u5348",
    midnight: "\u51CC\u6668",
    noon: "\u4E2D\u5348",
    morning: "\u65E9\u6668",
    afternoon: "\u4E2D\u5348",
    evening: "\u665A\u4E0A",
    night: "\u591C\u95F4"
  },
  wide: {
    am: "\u4E0A\u5348",
    pm: "\u4E0B\u5348",
    midnight: "\u51CC\u6668",
    noon: "\u4E2D\u5348",
    morning: "\u65E9\u6668",
    afternoon: "\u4E2D\u5348",
    evening: "\u665A\u4E0A",
    night: "\u591C\u95F4"
  }
};
var ordinalNumber2 = /* @__PURE__ */ __name((dirtyNumber, options) => {
  const number = Number(dirtyNumber);
  switch (options?.unit) {
    case "date":
      return number.toString() + "\u65E5";
    case "hour":
      return number.toString() + "\u65F6";
    case "minute":
      return number.toString() + "\u5206";
    case "second":
      return number.toString() + "\u79D2";
    default:
      return "\u7B2C " + number.toString();
  }
}, "ordinalNumber");
var localize2 = {
  ordinalNumber: ordinalNumber2,
  era: buildLocalizeFn({
    values: eraValues2,
    defaultWidth: "wide"
  }),
  quarter: buildLocalizeFn({
    values: quarterValues2,
    defaultWidth: "wide",
    argumentCallback: (quarter) => quarter - 1
  }),
  month: buildLocalizeFn({
    values: monthValues2,
    defaultWidth: "wide"
  }),
  day: buildLocalizeFn({
    values: dayValues2,
    defaultWidth: "wide"
  }),
  dayPeriod: buildLocalizeFn({
    values: dayPeriodValues2,
    defaultWidth: "wide",
    formattingValues: formattingDayPeriodValues2,
    defaultFormattingWidth: "wide"
  })
};

// node_modules/date-fns/locale/zh-CN/_lib/match.js
var matchOrdinalNumberPattern2 = /^(第\s*)?\d+(日|时|分|秒)?/i;
var parseOrdinalNumberPattern2 = /\d+/i;
var matchEraPatterns2 = {
  narrow: /^(前)/i,
  abbreviated: /^(前)/i,
  wide: /^(公元前|公元)/i
};
var parseEraPatterns2 = {
  any: [/^(前)/i, /^(公元)/i]
};
var matchQuarterPatterns2 = {
  narrow: /^[1234]/i,
  abbreviated: /^第[一二三四]刻/i,
  wide: /^第[一二三四]刻钟/i
};
var parseQuarterPatterns2 = {
  any: [/(1|一)/i, /(2|二)/i, /(3|三)/i, /(4|四)/i]
};
var matchMonthPatterns2 = {
  narrow: /^(一|二|三|四|五|六|七|八|九|十[二一])/i,
  abbreviated: /^(一|二|三|四|五|六|七|八|九|十[二一]|\d|1[12])月/i,
  wide: /^(一|二|三|四|五|六|七|八|九|十[二一])月/i
};
var parseMonthPatterns2 = {
  narrow: [
    /^一/i,
    /^二/i,
    /^三/i,
    /^四/i,
    /^五/i,
    /^六/i,
    /^七/i,
    /^八/i,
    /^九/i,
    /^十(?!(一|二))/i,
    /^十一/i,
    /^十二/i
  ],
  any: [
    /^一|1/i,
    /^二|2/i,
    /^三|3/i,
    /^四|4/i,
    /^五|5/i,
    /^六|6/i,
    /^七|7/i,
    /^八|8/i,
    /^九|9/i,
    /^十(?!(一|二))|10/i,
    /^十一|11/i,
    /^十二|12/i
  ]
};
var matchDayPatterns2 = {
  narrow: /^[一二三四五六日]/i,
  short: /^[一二三四五六日]/i,
  abbreviated: /^周[一二三四五六日]/i,
  wide: /^星期[一二三四五六日]/i
};
var parseDayPatterns2 = {
  any: [/日/i, /一/i, /二/i, /三/i, /四/i, /五/i, /六/i]
};
var matchDayPeriodPatterns2 = {
  any: /^(上午?|下午?|午夜|[中正]午|早上?|下午|晚上?|凌晨|)/i
};
var parseDayPeriodPatterns2 = {
  any: {
    am: /^上午?/i,
    pm: /^下午?/i,
    midnight: /^午夜/i,
    noon: /^[中正]午/i,
    morning: /^早上/i,
    afternoon: /^下午/i,
    evening: /^晚上?/i,
    night: /^凌晨/i
  }
};
var match2 = {
  ordinalNumber: buildMatchPatternFn({
    matchPattern: matchOrdinalNumberPattern2,
    parsePattern: parseOrdinalNumberPattern2,
    valueCallback: (value) => parseInt(value, 10)
  }),
  era: buildMatchFn({
    matchPatterns: matchEraPatterns2,
    defaultMatchWidth: "wide",
    parsePatterns: parseEraPatterns2,
    defaultParseWidth: "any"
  }),
  quarter: buildMatchFn({
    matchPatterns: matchQuarterPatterns2,
    defaultMatchWidth: "wide",
    parsePatterns: parseQuarterPatterns2,
    defaultParseWidth: "any",
    valueCallback: (index) => index + 1
  }),
  month: buildMatchFn({
    matchPatterns: matchMonthPatterns2,
    defaultMatchWidth: "wide",
    parsePatterns: parseMonthPatterns2,
    defaultParseWidth: "any"
  }),
  day: buildMatchFn({
    matchPatterns: matchDayPatterns2,
    defaultMatchWidth: "wide",
    parsePatterns: parseDayPatterns2,
    defaultParseWidth: "any"
  }),
  dayPeriod: buildMatchFn({
    matchPatterns: matchDayPeriodPatterns2,
    defaultMatchWidth: "any",
    parsePatterns: parseDayPeriodPatterns2,
    defaultParseWidth: "any"
  })
};

// node_modules/date-fns/locale/zh-CN.js
var zhCN = {
  code: "zh-CN",
  formatDistance: formatDistance2,
  formatLong: formatLong2,
  formatRelative: formatRelative2,
  localize: localize2,
  match: match2,
  options: {
    weekStartsOn: 1,
    firstWeekContainsDate: 4
  }
};

// src/index.ts
async function getAccessToken(env) {
  const url = `${env.BASE_URL}/cgi-bin/gettoken?corpid=${env.CORP_ID}&corpsecret=${env.CORP_SECRET}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.access_token;
}
__name(getAccessToken, "getAccessToken");
async function sendQYWXMessage(env, message2) {
  const accessToken = await getAccessToken(env);
  const url = `${env.BASE_URL}/cgi-bin/message/send?access_token=${accessToken}`;
  const messageData = {
    touser: env.TO_USER,
    msgtype: "text",
    agentid: env.AGENT_ID,
    text: {
      content: message2
    }
  };
  await fetch(url, {
    method: "POST",
    body: JSON.stringify(messageData),
    headers: {
      "Content-Type": "application/json"
    }
  });
}
__name(sendQYWXMessage, "sendQYWXMessage");
async function checkAndSendReminders(env) {
  try {
    const threshold = parseInt(env.REMINDER_THRESHOLD) || 1;
    const { results: cards } = await env.DB.prepare(
      "SELECT c.card_id, c.bank_id, c.card_name, c.card_number, c.billing_day, c.is_next_period, c.grace_type, c.grace_days, c.repayment_day, c.repaid, b.bank_name FROM credit_cards c JOIN banks b ON c.bank_id = b.bank_id WHERE c.repaid = 0"
    ).all();
    const currentDate = /* @__PURE__ */ new Date();
    const reminders = [];
    for (const card of cards) {
      const repaymentDate = calculateRepaymentDate(card, currentDate);
      const daysToRepayment = differenceInCalendarDays(repaymentDate, currentDate);
      if (daysToRepayment <= threshold && daysToRepayment >= 0) {
        reminders.push(
          `${card.bank_name}${card.card_name}(\u5C3E\u53F7${card.card_number.slice(-4)})\u5C06\u5728${daysToRepayment}\u5929\u540E(${format(repaymentDate, "M\u6708d\u65E5")})\u5230\u671F\u8FD8\u6B3E`
        );
      }
    }
    if (reminders.length > 0) {
      const message2 = "\u4FE1\u7528\u5361\u8FD8\u6B3E\u63D0\u9192\uFF1A\n" + reminders.join("\n");
      await sendQYWXMessage(env, message2);
    }
  } catch (error) {
    console.error("\u53D1\u9001\u63D0\u9192\u5931\u8D25:", error);
  }
}
__name(checkAndSendReminders, "checkAndSendReminders");
function calculateRepaymentDate(card, targetDate) {
  const { billing_day, grace_type, grace_days, repayment_day } = card;
  let repaymentDate;
  if (grace_type) {
    if (targetDate.getDate() < billing_day) {
      repaymentDate = new Date(targetDate.getFullYear(), targetDate.getMonth() - 1, billing_day);
      repaymentDate.setDate(repaymentDate.getDate() + grace_days);
    } else {
      repaymentDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), billing_day);
      repaymentDate.setDate(repaymentDate.getDate() + grace_days);
    }
  } else {
    if (targetDate.getDate() < billing_day) {
      if (repayment_day > billing_day) {
        repaymentDate = new Date(targetDate.getFullYear(), targetDate.getMonth() - 1, repayment_day);
      } else {
        repaymentDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), repayment_day);
      }
    } else {
      if (repayment_day > billing_day) {
        repaymentDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), repayment_day);
      } else {
        repaymentDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, repayment_day);
      }
    }
  }
  return repaymentDate;
}
__name(calculateRepaymentDate, "calculateRepaymentDate");
function calculateLongestGracePeriod(card, currentDate) {
  const { billing_day, is_next_period, grace_days, repayment_day } = card;
  let gracePeriod = 0;
  let billingDate;
  if (is_next_period) {
    billingDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), billing_day);
    if (billingDate <= currentDate) {
      billingDate = addMonths(billingDate, 1);
    }
  } else {
    billingDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), billing_day);
    if (billingDate < currentDate) {
      billingDate = addMonths(billingDate, 1);
    }
  }
  const repaymentDate = calculateRepaymentDate(card, billingDate);
  gracePeriod = differenceInCalendarDays(repaymentDate, currentDate);
  return gracePeriod;
}
__name(calculateLongestGracePeriod, "calculateLongestGracePeriod");
var src_default = {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
      "Access-Control-Max-Age": "86400",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders
      });
    }
    if (request.method === "POST" && new URL(request.url).pathname === "/api/toggle-repaid") {
      try {
        const { cardId, repaid } = await request.json();
        await env.DB.prepare(
          "UPDATE credit_cards SET repaid = ? WHERE card_id = ?"
        ).bind(repaid, cardId).run();
        return new Response(JSON.stringify({ success: true }), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }
    }
    try {
      const { results } = await env.DB.prepare(
        "SELECT c.card_id, c.bank_id, c.card_name, c.card_number, c.billing_day, c.is_next_period, c.grace_type, c.grace_days, c.repayment_day, c.repaid, b.bank_name, b.bank_icon_url FROM credit_cards c JOIN banks b ON c.bank_id = b.bank_id"
      ).all();
      const currentDate = /* @__PURE__ */ new Date();
      const cardInfo = results.map((card) => {
        const repaymentDate = calculateRepaymentDate(card, currentDate);
        const gracePeriod = calculateLongestGracePeriod(card, currentDate);
        const daysToRepayment = differenceInCalendarDays(repaymentDate, currentDate);
        return {
          cardId: card.card_id,
          bankName: card.bank_name,
          bankIconUrl: card.bank_icon_url,
          cardNumber: card.card_number,
          cardName: card.card_name,
          billingDay: card.billing_day,
          repaymentDate,
          gracePeriod,
          repaid: card.repaid,
          daysToRepayment
        };
      });
      const htmlContent = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <title>\u4FE1\u7528\u5361\u4FE1\u606F</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
            background-color: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          }
          th, td { 
            border: 1px solid #eee; 
            padding: 12px; 
            text-align: left; 
          }
          th { 
            background-color: #f8f9fa;
            cursor: pointer;
          }
          th:hover {
            background-color: #e9ecef;
          }
          .bank-logo {
            width: 24px; 
            height: 24px; 
            vertical-align: middle;
            margin-right: 8px;
            border-radius: 4px;
          }
          .repaid-status {
            cursor: pointer;
            padding: 6px 12px;
            border-radius: 20px;
            display: inline-block;
            min-width: 80px;
            text-align: center;
            font-weight: 500;
            transition: all 0.3s ease;
          }
          .repaid-true {
            background-color: #d4edda;
            color: #155724;
          }
          .repaid-false {
            background-color: #f8d7da;
            color: #721c24;
          }
          .repaid-status:hover {
            opacity: 0.8;
          }
          .days-info {
            font-size: 0.9em;
            margin-left: 10px;
            padding: 4px 8px;
            border-radius: 4px;
            background-color: #e9ecef;
          }
          .overdue {
            color: #dc3545;
            font-weight: bold;
            background-color: #f8d7da;
          }
          .grace-period {
            font-weight: bold;
            color: #0066cc;
          }
          .sort-icon::after {
            content: '\u2195';
            margin-left: 5px;
            color: #666;
          }
          .sort-active::after {
            content: '\u2193';
            color: #0066cc;
          }
          .sort-active.sort-desc::after {
            content: '\u2191';
          }
        </style>
        <script>
          function sortTable(column) {
            const table = document.querySelector('table');
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            const th = table.querySelector(\`th[data-column="\${column}"]\`);
            const isDesc = th.classList.contains('sort-desc');
            
            // \u6E05\u9664\u6240\u6709\u8868\u5934\u7684\u6392\u5E8F\u72B6\u6001
            table.querySelectorAll('th').forEach(header => {
              header.classList.remove('sort-active', 'sort-desc');
            });
      
            // \u8BBE\u7F6E\u5F53\u524D\u8868\u5934\u7684\u6392\u5E8F\u72B6\u6001
            th.classList.add('sort-active');
            if (!isDesc) {
              th.classList.add('sort-desc');
            }
      
            rows.sort((a, b) => {
              let aValue = a.querySelector(\`td:nth-child(\${getColumnIndex(column)})\`).textContent;
              let bValue = b.querySelector(\`td:nth-child(\${getColumnIndex(column)})\`).textContent;
              
              if (column === 'gracePeriod') {
                aValue = parseInt(aValue);
                bValue = parseInt(bValue);
              }
              
              if (aValue < bValue) return isDesc ? 1 : -1;
              if (aValue > bValue) return isDesc ? -1 : 1;
              return 0;
            });
      
            tbody.innerHTML = '';
            rows.forEach(row => tbody.appendChild(row));
          }
      
          function getColumnIndex(column) {
            const columns = {
              'bankName': 1,
              'cardNumber': 2,
              'cardName': 3,
              'billingDay': 4,
              'repaymentDate': 5,
              'repaidStatus': 6,
              'gracePeriod': 7
            };
            return columns[column];
          }
      
          async function toggleRepaidStatus(cardId, currentStatus) {
            try {
              const response = await fetch('/api/toggle-repaid', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cardId, repaid: !currentStatus })
              });
              
              if (response.ok) {
                location.reload();
              }
            } catch (error) {
              console.error('Error:', error);
            }
          }
        <\/script>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <th data-column="bankName" onclick="sortTable('bankName')" class="sort-icon">\u94F6\u884C</th>
              <th data-column="cardNumber" onclick="sortTable('cardNumber')" class="sort-icon">\u5361\u53F7</th>
              <th data-column="cardName" onclick="sortTable('cardName')" class="sort-icon">\u5361\u540D\u79F0</th>
              <th data-column="billingDay" onclick="sortTable('billingDay')" class="sort-icon">\u8D26\u5355\u65E5</th>
              <th data-column="repaymentDate" onclick="sortTable('repaymentDate')" class="sort-icon">\u8FD8\u6B3E\u65E5</th>
              <th data-column="repaidStatus" onclick="sortTable('repaidStatus')" class="sort-icon">\u8FD8\u6B3E\u72B6\u6001</th>
              <th data-column="gracePeriod" onclick="sortTable('gracePeriod')" class="sort-icon">\u514D\u606F\u671F</th>
            </tr>
          </thead>
          <tbody>
            ${cardInfo.map((card) => `
              <tr>
                <td><img class="bank-logo" src="${card.bankIconUrl}" alt="${card.bankName}">${card.bankName}</td>
                <td>${card.cardNumber}</td>
                <td>${card.cardName}</td>
                <td>${card.billingDay}</td>
                <td>${format(card.repaymentDate, "M\u6708d\u65E5", { locale: zhCN })}</td>
                <td>
                  <span 
                    id="repaid-${card.cardId}"
                    class="repaid-status repaid-${card.repaid}"
                    onclick="toggleRepaidStatus(${card.cardId}, ${card.repaid})"
                  >
                    ${card.repaid ? "\u5DF2\u8FD8\u6B3E" : "\u672A\u8FD8\u6B3E"}
                  </span>
                  ${!card.repaid ? `
                    <span class="days-info ${card.daysToRepayment < 0 ? "overdue" : ""}">
                      ${card.daysToRepayment > 0 ? `\u8DDD\u79BB\u8FD8\u6B3E\u65E5\u8FD8\u6709 ${card.daysToRepayment} \u5929` : card.daysToRepayment < 0 ? `\u5DF2\u8FC7\u8FD8\u6B3E\u65E5 ${Math.abs(card.daysToRepayment)} \u5929` : "\u4ECA\u5929\u662F\u8FD8\u6B3E\u65E5"}
                    </span>
                  ` : ""}
                </td>
                <td class="grace-period">${card.gracePeriod} \u5929</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </body>
      </html>`;
      return new Response(htmlContent, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          ...corsHeaders
        }
      });
    } catch (error) {
      return new Response(`Error: ${error.message}`, {
        status: 500,
        headers: corsHeaders
      });
    }
  },
  // 添加定时任务处理器
  async scheduled(event, env, ctx) {
    const date = /* @__PURE__ */ new Date();
    const beijingTime = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }));
    if (beijingTime.getHours() === 0) {
      const { results: cards } = await env.DB.prepare(
        "SELECT card_id, billing_day FROM credit_cards"
      ).all();
      const currentDay = beijingTime.getDate();
      for (const card of cards) {
        if (card.billing_day === currentDay) {
          await env.DB.prepare(
            "UPDATE credit_cards SET repaid = 0 WHERE card_id = ?"
          ).bind(card.card_id).run();
        }
      }
    }
    if (beijingTime.getHours() === 9) {
      await checkAndSendReminders(env);
    }
  }
};
export {
  src_default as default
};
//# sourceMappingURL=index.js.map
