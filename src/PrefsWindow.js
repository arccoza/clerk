import GObject from "gi://GObject"
import Adw from "gi://Adw"


export const PrefsWindow = GObject.registerClass({
  GTypeName: "PrefsWindow",
  Template: "resource:///com/arccoza/clerk/ui/PrefsWindow.ui",
  Children: [],
  InternalChildren: [],
}, class PrefsWindow extends Adw.Window {

})
