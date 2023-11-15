import GObject from "gi://GObject"
import Gtk from "gi://Gtk"


export const DetailRow = GObject.registerClass({
  GTypeName: "DetailRow",
  Template: "resource:///com/arccoza/clerk/ui/DetailRow.ui",
  Children: [
    "prefix",
    "suffix",
    "titles",
    "title",
    "subtitle",
  ],
  InternalChildren: [],
}, class DetailRow extends Gtk.Box {

})
