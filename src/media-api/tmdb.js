import { makeSearchParams } from "./utils"


export class TMDB {
  _baseUrl = "https://api.themoviedb.org/3"
  _headers = {
    accept: "application/json",
    Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTliM2M1M2JjNzY5N2M0NWQzZGQ1ZmYzYzE3ZDFjMCIsInN1YiI6IjU4MmQyYTMxOTI1MTQxMDk1ZDAwMjY2OSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.a1p8_PtthYMxddvjQpCedWB93BBWKXKhuLWjAwHmzUk"
  }
  _cache = {}

  constructor(language="en-US") {
    this._language = language
  }

  async get(url) {
    if (Object.hasOwn(this._cache, url)) {
      return this._cache[url]
    }

    const options = {
      method: "GET",
      headers: this._headers,
    }

    return fetch(url, options)
      .then((res) => res.json())
      .then((res) => {
        if (res.success === false) {
          throw res
        }

        this._cache[url] = res
        return res
      })
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

  async groupings(id) {
    const url = `${this._baseUrl}/tv/${id}/episode_groups?language=${this._language}`
    const res = await this.get(url)
    const ret = {
      id,
      results: [
        {
          id: "-1",
          name: "Original Air Date",
          type: 1,
        },
      ],
    }

    for (const result of res.results) {
      ret.results.push({
        id: result.id,
        name: result.name,
        type: result.type,
      })
    }

    this._cache[`groupings/${id}`] = ret
    return ret
  }

  async seasons(id, groupId) {
    const isOriginal = groupId === "-1"
    let url = ""

    if (isOriginal) {
      url = `${this._baseUrl}/tv/${id}?language=${this._language}`
    } else {
      url = `${this._baseUrl}/tv/episode_group/${groupId}/?language=${this._language}`
    }

    console.log("seasons--------->>>", url, id, groupId, isOriginal, groupId === "-1")

    const res = await this.get(url)
    const ret = {
      id,
      results: [],
    }

    if (isOriginal) {
      for (const season of res.seasons) {
        ret.results.push({
          id: season.id,
          name: season.name,
          number: season.season_number,
          air_date: season.air_date,
          overview: season.overview,
          episode_count: season.episode_count,          
        })
      }
    } else {
      for (const group of res.groups) {
        ret.results.push({
          id: group.id,
          name: group.name,
          number: group.order,
          air_date: group.episodes[0]?.air_date,
          episode_count: group.episodes.length,
        })
      }
    }

    return ret
  }

  async episodes(id, groupId, ...seasons) {
    const isOriginal = groupId === "-1"
    const ret = {
      id,
      results: [],
    }

    if (isOriginal) {
      const pending = []
      for (const season of seasons) {
        const url = `${this._baseUrl}/tv/${id}/season/${season}?language=${this._language}`
        pending.push(this.get(url))
      }

      const res = await Promise.all(pending)
      
      for (const episode of res.episodes){
        ret.results.push({
          id: episode.id,
          name: episode.name,
          number: episode.episode_number,
          air_date: episode.air_date,
          overview: episode.overview,
          season_number: episode.season_number,
        })
      }
      
    } else {
      const url = `${this._baseUrl}/tv/episode_group/${groupId}/?language=${this._language}`
      const res = await this.get(url)
      const idx = res.groups.reduce((a, g, i) => (a[g.order] = i, a), {})
      
      for (const season of seasons) {
        const group = res.groups[idx[season]]

        for (const episode of group.episodes) {
          ret.results.push({
            id: episode.id,
            name: episode.name,
            number: episode.episode_number,
            air_date: episode.air_date,
            overview: episode.overview,
            season_number: episode.season_number,
          })
        }
      }
    }

    return ret
  }
}
