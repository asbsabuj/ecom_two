import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import qs from "query-string"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

//convert prisma object into JS object
export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

//format number with decimal places

export function formatNumberWithDecimal(num: number): string {
  const [int, decimal] = num.toString().split(".")
  return decimal ? `${int}.${decimal.padEnd(2, "0")}` : `${int}.00`
}

//format errors with correct messages

export function formatError(error: any) {
  if (error.name === "ZodError") {
    const fieldErrors = Object.keys(error.errors).map(
      (field) => error.errors[field].message
    )
    return fieldErrors.join(". ")
  } else if (
    error.name === "PrismaClientKnownRequestError" &&
    error.code === "P2002"
  ) {
    const field = error.meta?.target ? error.meta.target[0] : "Field"
    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists!`
  } else {
    return typeof error.message === "string"
      ? error.message
      : JSON.stringify(error.message)
  }
}

//round to 2 decimal points
export function round2(value: number | string) {
  if (typeof value === "number") {
    return Math.round((value + Number.EPSILON) * 100) / 100
  } else if (typeof value === "string") {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100
  } else {
    throw new Error("Value is not a number or a string !")
  }
}

//format currency to locale or other currency
const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
  minimumFractionDigits: 2,
})

export function formatCurrency(amount: number | string | null) {
  if (typeof amount === "number") {
    return CURRENCY_FORMATTER.format(amount)
  } else if (typeof amount === "string") {
    return CURRENCY_FORMATTER.format(Number(amount))
  } else {
    return "NaN"
  }
}

//shorten UUId
export function formatId(id: string) {
  return `..${id.substring(id.length - 6)}`
}
console.log(formatId("792a2512-6818-49de-8090-50e36bc28f29"))

//format date and time
export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // abbreviated month name (e.g., 'Oct')
    day: "numeric", // numeric day of the month (e.g., '25')
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  }
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // numeric year (e.g., '2023')
    day: "numeric", // numeric day of the month (e.g., '25')
  }
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  }
  const formattedDateTime: string = new Date(dateString).toLocaleString(
    "en-US",
    dateTimeOptions
  )
  const formattedDate: string = new Date(dateString).toLocaleString(
    "en-US",
    dateOptions
  )
  const formattedTime: string = new Date(dateString).toLocaleString(
    "en-US",
    timeOptions
  )
  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  }
}

//create pagination url
export function createPaginationUrl({
  params,
  key,
  value,
}: {
  params: string
  key: string
  value: string | null
}) {
  const query = qs.parse(params)

  query[key] = value

  return qs.stringifyUrl(
    {
      query,
      url: window.location.pathname,
    },
    {
      skipNull: true,
    }
  )
}
