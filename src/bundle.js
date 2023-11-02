// src/main.js
import GObject2 from "gi://GObject";
import Gio from "gi://Gio";
import Gtk2 from "gi://Gtk?version=4.0";
import Adw2 from "gi://Adw?version=1";

// src/window.js
import GObject from "gi://GObject";
import Gtk from "gi://Gtk";
import Adw from "gi://Adw";
var ClerkWindow = GObject.registerClass({
  GTypeName: "ClerkWindow",
  Template: "resource:///com/arccoza/clerk/window.ui",
  InternalChildren: ["filesAdd", "mediaSearchInput", "filesUpdate", "filePicker", "files"]
}, class ClerkWindow2 extends Adw.ApplicationWindow {
  constructor(application) {
    super({ application });
  }
  async onFilesAdd(button) {
    console.log("onFilesAdd");
    this._filePicker.show();
  }
  onMediaSearchChanged(button) {
    console.log("onMediaSearchChanged", button);
  }
  onFilesUpdate(button) {
    console.log("onFilesUpdate", button);
  }
  onFilesAdded(filePicker, responseId) {
    console.log("onFilesAdded", responseId);
    if (responseId !== Gtk.ResponseType.ACCEPT) {
      return;
    }
    const files = filePicker.get_files();
    this.addFiles(files);
  }
  setupFileItem(listView, listItem) {
    const row = new Adw.ActionRow();
    listItem.child = row;
  }
  bindFileItem(listView, listItem) {
    const file = listItem.item;
    const row = listItem.child;
    row.icon_name = "checkbox";
    row.title = file.get_basename();
    row.subtitle = file.get_path();
  }
  addFiles(files) {
    for (let i = 0, file; file = files.get_item(i), !!file && i < 1e3; i++) {
      console.log("onFilesAdded", file, file.get_basename());
      this._files.append(file);
    }
  }
  remFiles(fileIndices) {
    for (const i of fileIndices) {
      this._files;
    }
  }
});

// src/main.js
pkg.initGettext();
pkg.initFormat();
var ClerkApplication = GObject2.registerClass(
  class ClerkApplication2 extends Adw2.Application {
    constructor() {
      super({ application_id: "com.arccoza.clerk", flags: Gio.ApplicationFlags.DEFAULT_FLAGS });
      const quit_action = new Gio.SimpleAction({ name: "quit" });
      quit_action.connect("activate", (action) => {
        this.quit();
      });
      this.add_action(quit_action);
      this.set_accels_for_action("app.quit", ["<primary>q"]);
      const show_about_action = new Gio.SimpleAction({ name: "about" });
      show_about_action.connect("activate", (action) => {
        let aboutParams = {
          transient_for: this.active_window,
          application_name: "clerk",
          application_icon: "com.arccoza.clerk",
          developer_name: "Adrien",
          version: "0.1.0",
          developers: [
            "Adrien"
          ],
          copyright: "\xA9 2023 Adrien"
        };
        const aboutWindow = new Adw2.AboutWindow(aboutParams);
        aboutWindow.present();
      });
      this.add_action(show_about_action);
    }
    vfunc_activate() {
      let { active_window } = this;
      if (!active_window)
        active_window = new ClerkWindow(this);
      active_window.present();
    }
  }
);
function main(argv) {
  const application = new ClerkApplication();
  return application.runAsync(argv);
}
export {
  ClerkApplication,
  main
};
