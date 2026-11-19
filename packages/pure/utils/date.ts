import config from 'virtual:config'

const dateFormat = new Intl.DateTimeFormat(config.locale.dateLocale, config.locale.dateOptions)

export function getFormattedDate(
  date: string | number | Date,
  options?: Intl.DateTimeFormatOptions,
  locale = config.locale.dateLocale
) {
  if (typeof options !== 'undefined') {
    return new Date(date).toLocaleDateString(locale, {
      ...(config.locale.dateOptions as Intl.DateTimeFormatOptions),
      ...options
    })
  }

  if (locale !== config.locale.dateLocale) {
    return new Intl.DateTimeFormat(locale, config.locale.dateOptions).format(new Date(date))
  }

  return dateFormat.format(new Date(date))
}
