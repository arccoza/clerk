import GObject from "gi://GObject"
import Gtk from "gi://Gtk"
import Adw from "gi://Adw"


export const ClerkWindow = GObject.registerClass({
  GTypeName: "ClerkWindow",
  Template: "resource:///com/arccoza/clerk/window.ui",
  InternalChildren: [
    "filesAdd",
    "filesUpdate",
    "filePicker",
    "files",
    "mediaPicker",
    "renames",
  ],
}, class ClerkWindow extends Adw.ApplicationWindow {
  constructor(application) {
    super({ application })

    this._mediaPicker.connect("cancelled", this.onMediaCancelled.bind(this))
    this._mediaPicker.connect("selected", this.onMediaAdded.bind(this))
  }

  async onFilesAdd(button) {
    console.log("onFilesAdd")
    // const res = await this._filePicker.open_multiple(this, null, null)
    // const res = await this._filePicker.open_multiple_finish()
    // console.log("--->", res)
    this._filePicker.show()
  }

  onFilesUpdate(button) {
    console.log("onFilesUpdate", button)
  }

  onFilesAdded(filePicker, responseId) {
    console.log("onFilesAdded", responseId)
    if (responseId !== Gtk.ResponseType.ACCEPT) {
     return
    }

    const files = filePicker.get_files()
    this.addFiles(files)
  }

  setupFileItem(listView, listItem) {
    const row = new Adw.ActionRow()
    row.set_title_lines(1)
    row.set_subtitle_lines(1)
    listItem.child = row
  }

  bindFileItem(listView, listItem) {
    const file = listItem.item
    const row = listItem.child
    row.icon_name = "checkbox"
    row.title = file.get_basename()
    row.subtitle = file.get_parent()?.get_path()
  }

  onMediaSearchOpen(button) {
    console.log("onMediaSearchOpen", button)
    this._mediaPicker.show()
  }

  onMediaCancelled(picker) {
    picker.hide()
  }

  onMediaAdded(picker, list) {
    for (let i = 0, item; item = list.get_item(i), i < list.get_n_items(); i++) {
      this._renames.append(item)
    }

    picker.hide()
  }

  setupRenameItem(listView, listItem) {
    const row = new Adw.ActionRow()
    row.set_title_lines(1)
    row.set_subtitle_lines(1)
    listItem.child = row
  }

  bindRenameItem(listView, listItem) {
    const rename = listItem.item
    const row = listItem.child
    row.icon_name = "checkbox"
    row.title = rename.episodeName || rename.name
    row.subtitle = rename.date
  }

  addFiles(files) {
    for (let i = 0, file; file = files.get_item(i), !!file && i < 1000; i++) {
      console.log("onFilesAdded", file, file.get_basename())
      this._files.append(file)
    }
  }

  remFiles(fileIndices) {
    for (const i of fileIndices) {
      this._files
    }
  }
})

