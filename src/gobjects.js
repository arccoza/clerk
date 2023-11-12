import Gio from "gi://Gio"
import GObject from "gi://GObject"


export const MediaInfo = GObject.registerClass({
  GTypeName: "MediaInfo",
  Properties: {
    id: GObject.ParamSpec.double("id", "ID", "ID of the item", GObject.ParamFlags.READWRITE, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 0.0),
    name: GObject.ParamSpec.string("name", "Name", "Name of the file", GObject.ParamFlags.READWRITE, ""),
    date: GObject.ParamSpec.string("date", "Date", "Release date", GObject.ParamFlags.READWRITE, ""),
    overview: GObject.ParamSpec.string("overview", "Overview", "The overview", GObject.ParamFlags.READWRITE, ""),
    seasonName: GObject.ParamSpec.string("season-name", "Season Name", "The season name", GObject.ParamFlags.READWRITE, ""),
    seasonNumber: GObject.ParamSpec.double("season-number", "Season Number", "The season number", GObject.ParamFlags.READWRITE, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, -1),
    seasonOverview: GObject.ParamSpec.string("season-overview", "Season Overview", "The season overview", GObject.ParamFlags.READWRITE, ""),
    seasonEpisodeCount: GObject.ParamSpec.double("season-episode-count", "Season Episode Count", "The episode count for the season", GObject.ParamFlags.READWRITE, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, -1),
    episodeName: GObject.ParamSpec.string("episode-name", "Episode Name", "The episode name", GObject.ParamFlags.READWRITE, ""),
    episodeNumber: GObject.ParamSpec.double("episode-number", "Episode Number", "The episode number", GObject.ParamFlags.READWRITE, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, -1),
    episodeOverview: GObject.ParamSpec.string("episode-overview", "Episode Overview", "The episode overview", GObject.ParamFlags.READWRITE, ""),
    // icon: GObject.ParamSpec.object("icon", "Icon", "Icon for the file", GObject.ParamFlags.READWRITE, Gio.Icon),
    // type: GObject.ParamSpec.enum("type", "Type", "File type", GObject.ParamFlags.READWRITE, Gio.FileType, Gio.FileType.UNKNOWN),
  }
}, class extends GObject.Object {})

export const EpisodeGroup = GObject.registerClass({
  GTypeName: "EpisodeGroup",
  Properties: {
    id: GObject.ParamSpec.string("id", "ID", "ID of the group", GObject.ParamFlags.READWRITE, ""),
    name: GObject.ParamSpec.string("name", "Name", "Episode group name", GObject.ParamFlags.READWRITE, ""),
    type: GObject.ParamSpec.double("type", "Type", "Episode group type", GObject.ParamFlags.READWRITE, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, -1),
  }
}, class extends GObject.Object {})
