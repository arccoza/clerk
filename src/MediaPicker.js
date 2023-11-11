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
    "showsSelect",
    "seasons",
    "seasonsSelect",
    "movies",
    "moviesSelect",
    "select",
    "back",
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
    const page = this._stack.visible_child_name

    if (page === "movie") {
      for (const item of get_selected_items(this._moviesSelect)) {
        list.append(item)
      }
    }
    
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
    const show = model.get_selected_item()
    const store = this._seasons
    this._seasons.remove_all()
    this._stack.set_visible_child_name("season")
    
    this._mediaApi.details("tv", show.id)
      .then((details) => {
        for (const season of details.seasons) {
          store.append(new MediaInfo({
            id: show.id || -1,
            name: show.name || show.original_name || show.title || show.original_title || "unknown",
            date: season.date || season.air_date || "unknown",
            seasonName: season.name,
            seasonNumber: season.season_number,
            seasonOverview: season.overview,
          }))
        }
      })
      .catch((err) => console.error(err))
  }

  onBack(button) {
    this._stack.set_visible_child_name("tv")
  }

  setupSeasonItem(listView, listItem) {
    const row = new Adw.ActionRow()
    listItem.child = row
  }

  bindSeasonItem(listView, listItem) {
    const result = listItem.item
    const row = listItem.child
    row.title = `${result.seasonNumber}) ${result.seasonName.replace("&", "&amp;")}`
    row.subtitle = `${result.date} - ${result.name}`
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
    const page = stack.visible_child_name
    this._searchEntry.set_text("")
    this._select.sensitive = page !== "tv"
    this._back.sensitive = page === "season"
    this._searchEntry.visible = page !== "season"
  }
})

function get_selected_items(select) {
  const selection = select.get_selection()
  const items = []

  for (let i = 0, position; position = selection.get_nth(i), i < selection.get_size(); i++) {
    const item = select.model.get_item(position)
    if (item != null) {
      items.push(item)
    }
  }

  return items
}
