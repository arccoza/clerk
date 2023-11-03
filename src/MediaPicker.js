import GObject from "gi://GObject"
import Gtk from "gi://Gtk"
import Adw from "gi://Adw"


export const MediaPicker = GObject.registerClass({
  GTypeName: "MediaPicker",
  Template: "resource:///com/arccoza/clerk/MediaPicker.ui",
  InternalChildren: [],
}, class MediaPicker extends Adw.Window {
  constructor(window) {
    console.log("---------->", window)
    super()
  }
})
