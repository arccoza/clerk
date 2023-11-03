import Gio from "gi://Gio"
import GObject from "gi://GObject"


export const MediaInfo = GObject.registerClass({
  GTypeName: "MediaInfo",
  Properties: {
    id: GObject.ParamSpec.double("id", "ID", "ID of the item", GObject.ParamFlags.READWRITE, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 0.0),
    name: GObject.ParamSpec.string("name", "Name", "Name of the file", GObject.ParamFlags.READWRITE, ""),
    date: GObject.ParamSpec.string("date", "Date", "Release date", GObject.ParamFlags.READWRITE, ""),
    // icon: GObject.ParamSpec.object("icon", "Icon", "Icon for the file", GObject.ParamFlags.READWRITE, Gio.Icon),
    // type: GObject.ParamSpec.enum("type", "Type", "File type", GObject.ParamFlags.READWRITE, Gio.FileType, Gio.FileType.UNKNOWN),
  }
}, class extends GObject.Object {})
