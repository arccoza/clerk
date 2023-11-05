import GObject from "gi://GObject"
import Gtk from "gi://Gtk"
import Adw from "gi://Adw"
import { TMDB } from "./media-api"
import { MediaInfo } from "./gobjects"


export const MediaPicker = GObject.registerClass({
  GTypeName: "MediaPicker",
  Template: "resource:///com/arccoza/clerk/MediaPicker.ui",
  InternalChildren: [
    "typeStack",
    "shows",
    "movies",
  ],
}, class MediaPicker extends Adw.Window {
  constructor(window) {
    super()
    this._mediaApi = new TMDB()
  }

  onShowsToggled(button) {

  }

  onMoviesToggled(button) {

  }

  onSearchChanged(entry) {
    const query = entry.get_text()
    const kind = this._typeStack.get_visible_child_name()

    console.log("==>>>>>>>", kind)

    if (!query || !kind) {
      return
    }

    const store = kind === "tv" ? this._shows : this._movies

    this._mediaApi.search(kind, query)
      .then((res) => {
        store.remove_all()
        console.log("==++>>", res)

        for (const result of res.results) {
          store.append(new MediaInfo({
            id: result.id || -1,
            name: result.name || result.original_name || result.title || result.original_title || "unknown",
            date: result.date || result.first_air_date || result.release_date || "unknown",
          }))
        }
      })
      .catch((err) => console.error(err))
  }

  setupShowItem(listView, listItem) {
    const row = new Adw.ActionRow()
    listItem.child = row
  }

  bindShowItem(listView, listItem) {
    const result = listItem.item
    const row = listItem.child
    row.title = result.name.replace("&", "&amp;")
    row.subtitle = result.date
  }

  setupMovieItem(listView, listItem) {
    const row = new Adw.ActionRow()
    listItem.child = row
  }

  bindMovieItem(listView, listItem) {
    const result = listItem.item
    const row = listItem.child
    row.title = result.name.replace("&", "&amp;")
    row.subtitle = result.date
  }
})
