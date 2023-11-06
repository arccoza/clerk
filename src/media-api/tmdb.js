import { makeSearchParams } from "./utils"


export class TMDB {
  _baseUrl = "https://api.themoviedb.org/3"
  _headers = {
    accept: "application/json",
    Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTliM2M1M2JjNzY5N2M0NWQzZGQ1ZmYzYzE3ZDFjMCIsInN1YiI6IjU4MmQyYTMxOTI1MTQxMDk1ZDAwMjY2OSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.a1p8_PtthYMxddvjQpCedWB93BBWKXKhuLWjAwHmzUk"
  }

  constructor(language="en-US") {
    this._language = language
  }

  async search(type, query, page=1) {
    if (!query) {
      throw "Query empty error"
    }

    const params = makeSearchParams({
      query: query.trim(),
      include_adult: false,
      language: this._language,
      page,
    })

    const url = `${this._baseUrl}/search/${type}?${params}`

    const options = {
      method: "GET",
      headers: this._headers,
    }

    return fetch(url, options)
      .then((res) => res.json())
  }

  async details(type, id, seasonNum) {
    if (!id) {
      throw "Missing id"
    }

    const season = seasonNum != null ? `/season/${seasonNum}` : ""

    const url = `${this._baseUrl}/${type}/${id}${season}?language=${this._language}`

    const options = {
      method: "GET",
      headers: this._headers,
    }

    return fetch(url, options)
      .then((res) => res.json())
  }
}
