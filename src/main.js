import "./troll/src/globals.js"
import GObject from "gi://GObject"
import Gio from "gi://Gio"
import Gtk from "gi://Gtk?version=4.0"
import Adw from "gi://Adw?version=1"
import { MediaInfo } from "./gobjects"
import { MediaPicker } from "./MediaPicker"
import { ClerkWindow } from "./window.js"


pkg.initGettext()
pkg.initFormat()

export const ClerkApplication = GObject.registerClass(
  class ClerkApplication extends Adw.Application {
    constructor() {
      super({application_id: "com.arccoza.clerk", flags: Gio.ApplicationFlags.DEFAULT_FLAGS})

      const quit_action = new Gio.SimpleAction({name: "quit"})
      quit_action.connect("activate", action => {
        this.quit()
      })
      this.add_action(quit_action)
      this.set_accels_for_action("app.quit", ["<primary>q"])

      const show_about_action = new Gio.SimpleAction({name: "about"})
      show_about_action.connect("activate", action => {
        let aboutParams = {
          transient_for: this.active_window,
          application_name: "clerk",
          application_icon: "com.arccoza.clerk",
          developer_name: "Adrien",
          version: "0.1.0",
          developers: [
            "Adrien"
            ],
          copyright: "© 2023 Adrien"
        }
        const aboutWindow = new Adw.AboutWindow(aboutParams)
        aboutWindow.present()
      })
      this.add_action(show_about_action)
    }

    vfunc_activate() {
      let {active_window} = this

      if (!active_window)
        active_window = new ClerkWindow(this)

      active_window.present()
    }
  }
  )

export function main(argv) {
  const application = new ClerkApplication()
  return application.runAsync(argv)
}
