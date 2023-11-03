import GObject from "gi://GObject"
import Gtk from "gi://Gtk"
import Adw from "gi://Adw"
import { TMDB } from "./media-api"


export const MediaPicker = GObject.registerClass({
  GTypeName: "MediaPicker",
  Template: "resource:///com/arccoza/clerk/MediaPicker.ui",
  InternalChildren: [
    "results",
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
    
  }

  setupResultItem(listView, listItem) {

  }

  bindResultItem(listView, listItem) {

  }
})
