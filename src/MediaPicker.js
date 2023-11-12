import GObject from "gi://GObject"
import Gio from 'gi://Gio'
import Gtk from "gi://Gtk"
import Adw from "gi://Adw"
import { TMDB } from "./media-api"
import { MediaInfo, EpisodeGroup, } from "./gobjects"


export const MediaPicker = GObject.registerClass({
  GTypeName: "MediaPicker",
  Template: "resource:///com/arccoza/clerk/MediaPicker.ui",
  InternalChildren: [
    "searchEntry",
    "showTitle",
    "stack",
    "shows",
    "showsSelect",
    "seasons",
    "seasonsSelect",
    "movies",
    "moviesSelect",
    "groupings",
    "groupingsDropdown",
    "select",
    "back",
    "progressBar",
    "progressBarRevealer",
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
    this._groupingsDropdown.expression = new Gtk.PropertyExpression(EpisodeGroup, null, "name")
  }

  set isBusy(v) {
    const id = this._isBusy

    if (v && id == null) {
      this._progressBarRevealer.reveal_child = v
      this._isBusy = setInterval(() => {
        this._progressBar.pulse()
      }, 180)
    } else {
      clearInterval(id)
      this._isBusy = null
      this._progressBarRevealer.reveal_child = v
    }
  }

  get isBusy() {
    return this._isBusy != null
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

    this.isBusy = true
    this._mediaApi.search(kind, query)
      .then((res) => {
        store.remove_all()
        this.isBusy = false

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
    const order = new Gtk.Label()
    order.width_chars = 2
    order.add_css_class("title-4")
    row.add_prefix(order)
    row.order = order
    listItem.child = row
  }

  bindShowItem(listView, listItem) {
    const result = listItem.item
    const row = listItem.child
    row.title = result.name.replace("&", "&amp;")
    row.subtitle = result.date
    row.order.label = (listItem.get_position() + 1).toString()
  }

  onShowSelect(model, position, count) {
    const show = model.get_selected_item()
    this._stack.set_visible_child_name("season")
    this._showTitle.label = show.name

    this.isBusy = true
    this._mediaApi.groupings(show.id)
      .then((res) => {
        this._groupings.remove_all()
        res.results.forEach((group) => {
          this._groupings.append(new EpisodeGroup(group))
        })
      })
      .catch((err) => console.error(err))
  }

  onGroupingSelect(dropdown) {
    const show = this._showsSelect.get_selected_item()
    const group = dropdown.get_selected_item()

    this._mediaApi.seasons(show.id, group.id)
      .then((res) => {
        this.isBusy = false
        this._seasons.remove_all()
        res.results.forEach((season) => {
          this._seasons.append(new MediaInfo({
            id: show.id || -1,
            name: show.name || show.original_name || show.title || show.original_title || "unknown",
            date: season.air_date || "unknown",
            seasonName: season.name,
            seasonNumber: season.number,
            seasonOverview: season.overview,
            seasonEpisodeCount: season.episode_count,
          }))
        })
      })
      .catch((err) => {
        this._seasons.remove_all()
        console.error(err)
      })
  }

  onBack(button) {
    this._stack.set_visible_child_name("tv")
  }

  setupSeasonItem(listView, listItem) {
    const row = new Adw.ActionRow()
    const order = new Gtk.Label()
    const episodes = new Gtk.Button()
    episodes.halign = Gtk.Align.CENTER
    episodes.valign = Gtk.Align.CENTER
    episodes.add_css_class("accent")
    episodes.add_css_class("heading")
    order.width_chars = 2
    order.add_css_class("title-4")
    row.use_markup = false
    row.add_prefix(order)
    row.add_suffix(episodes)
    row.order = order
    row.episodes = episodes
    listItem.child = row
  }

  bindSeasonItem(listView, listItem) {
    const result = listItem.item
    const row = listItem.child
    row.title = `${result.seasonName.replace("&", "&amp;")}`
    row.subtitle = `${result.name.replace("&", "&amp;")}  •  ${result.date}`
    row.order.label = result.seasonNumber.toString()
    row.episodes.label = result.seasonEpisodeCount.toString()
  }

  setupMovieItem(listView, listItem) {
    const row = new Adw.ActionRow()
    const order = new Gtk.Label()
    order.width_chars = 2
    order.add_css_class("title-4")
    row.add_prefix(order)
    row.order = order
    listItem.child = row
  }

  bindMovieItem(listView, listItem) {
    const result = listItem.item
    const row = listItem.child
    row.title = result.name.replace("&", "&amp;")
    row.subtitle = result.date
    row.order.label = (listItem.get_position() + 1).toString()
  }

  onSwitchPage(stack) {
    const page = stack.visible_child_name
    this._searchEntry.set_text("")
    this._select.sensitive = page !== "tv"
    this._back.sensitive = page === "season"
    this._searchEntry.visible = page !== "season"
    this._showTitle.visible = page === "season"
    this._groupingsDropdown.visible = page === "season"
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
