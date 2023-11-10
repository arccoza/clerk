import GObject from "gi://GObject"
import Gio from 'gi://Gio'
import Gtk from "gi://Gtk"
import Adw from "gi://Adw"
import { TMDB } from "./media-api"
import { MediaInfo } from "./gobjects"


export const MediaPicker = GObject.registerClass({
  GTypeName: "MediaPicker",
  Template: "resource:///com/arccoza/clerk/MediaPicker.ui",
  InternalChildren: [
    "searchEntry",
    "stack",
    "shows",
    "seasons",
    "movies",
  ],
  Signals: {
    "cancelled": {
      param_types: [],
    },
    "selected": {
      param_types: [Gio.ListStore],
    },
  },
}, class MediaPicker extends Adw.Window {
  constructor(window) {
    super()
    this._mediaApi = new TMDB()
  }

  onCancel(button) {
    this.emit("cancelled")
  }

  onSelect(button) {
    const list = Gio.ListStore.new(MediaInfo)
    this.emit("selected", list)
  }

  onSearchChanged(entry) {
    const query = entry.get_text()
    const kind = this._stack.get_visible_child_name()

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
    // const row = new Gtk.Label()
    listItem.child = row
  }

  bindShowItem(listView, listItem) {
    const result = listItem.item
    const row = listItem.child
    row.title = result.name.replace("&", "&amp;")
    row.subtitle = result.date
  }

  onShowSelect(model, position, count) {
    const id = model.get_selected_item().id
    this._mediaApi.details("tv", id)
      .then((details) => console.log("====>>>", details))
      .catch((err) => console.error(err))
  }

  setupSeasonItem(listView, listItem) {
    const row = new Adw.ActionRow()
    listItem.child = row
  }

  bindSeasonItem(listView, listItem) {
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

  onSwitchPage(stack) {
    console.log("==>>", stack.visible_child_name)
    this._searchEntry.set_text("")
  }
})
