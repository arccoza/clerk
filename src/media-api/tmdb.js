import { makeSearchParams } from "./utils"


export class TMDB {
  _baseUrl = "https://api.themoviedb.org/3"

  constructor(language="en-US") {
    this._language = language
  }

  async search(type, query, page=1) {
    if (!query) {
      return
    }

    const params = makeSearchParams({
      query,
      page,
      language: this._language,
      include_adult: false,
    })

    const url = `${this._baseUrl}/search/${type}?${params}`

    console.log("------>>>", url)

    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTliM2M1M2JjNzY5N2M0NWQzZGQ1ZmYzYzE3ZDFjMCIsInN1YiI6IjU4MmQyYTMxOTI1MTQxMDk1ZDAwMjY2OSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.a1p8_PtthYMxddvjQpCedWB93BBWKXKhuLWjAwHmzUk"
      }
    }

    return fetch(url, options)
      .then((res) => res.json())
      // .then(json => console.log(json))
      // .catch(err => console.error("error:" + err))
  }
}
