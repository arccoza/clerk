export function makeSearchParams(obj) {
  return encodeURI(
    Object.entries(obj)
      .filter(([k, v]) => v != null && v !== "")
      .map(([k, v]) => `${k}=${v}`)
      .join("&")
  )
}
