// src/troll/src/std/base64.js
import GLib from "gi://GLib";
function atob(data) {
  return new TextDecoder().decode(GLib.base64_decode(data));
}
function btoa(data) {
  return GLib.base64_encode(data);
}

// src/troll/src/async.js
function promiseTask(object, method, finish, ...args) {
  return new Promise((resolve, reject) => {
    object[method](...args, (self, asyncResult) => {
      try {
        resolve(object[finish](asyncResult));
      } catch (err) {
        reject(err);
      }
    });
  });
}

// src/troll/src/std/fetch.js
import Soup from "gi://Soup?version=3.0";
import GLib2 from "gi://GLib";
import Gio from "gi://Gio";
async function fetch2(url, options = {}) {
  if (typeof url === "object") {
    options = url;
    url = options.url;
  }
  const session = new Soup.Session();
  const method = options.method || "GET";
  const message = Soup.Message.new(method, url);
  const headers = options.headers || {};
  const request_headers = message.get_request_headers();
  for (const header in headers) {
    request_headers.append(header, headers[header]);
  }
  if (typeof options.body === "string") {
    message.set_request_body_from_bytes(null, new GLib2.Bytes(options.body));
  }
  const inputStream = await promiseTask(
    session,
    "send_async",
    "send_finish",
    message,
    null,
    null
  );
  const { status_code, reason_phrase } = message;
  const ok = status_code >= 200 && status_code < 300;
  return {
    status: status_code,
    statusText: reason_phrase,
    ok,
    type: "basic",
    async json() {
      const text = await this.text();
      return JSON.parse(text);
    },
    async text() {
      const gBytes = await this.gBytes();
      return new TextDecoder().decode(gBytes.toArray());
    },
    async arrayBuffer() {
      const gBytes = await this.gBytes();
      return gBytes.toArray().buffer;
    },
    async gBytes() {
      const outputStream = Gio.MemoryOutputStream.new_resizable();
      await promiseTask(
        outputStream,
        "splice_async",
        "splice_finish",
        inputStream,
        Gio.OutputStreamSpliceFlags.CLOSE_TARGET | Gio.OutputStreamSpliceFlags.CLOSE_SOURCE,
        GLib2.PRIORITY_DEFAULT,
        null
      );
      const bytes = outputStream.steal_as_bytes();
      return bytes;
    }
  };
}

// src/troll/src/std/WebSocket.js
import Soup2 from "gi://Soup?version=3.0";
import GLib3 from "gi://GLib";
var Signals = imports.signals;
var text_decoder = new TextDecoder("utf-8");
var text_encoder = new TextEncoder("utf-8");
var WebSocket = class {
  constructor(url, protocols = []) {
    this.eventListeners = /* @__PURE__ */ new WeakMap();
    this._connection = null;
    this.readyState = 0;
    const uri = GLib3.Uri.parse(url, GLib3.UriFlags.NONE);
    this.url = uri.to_string();
    this._uri = uri;
    if (typeof protocols === "string")
      protocols = [protocols];
    this._connect(protocols);
  }
  get protocol() {
    return this._connection?.get_protocol() || "";
  }
  async _connect(protocols) {
    const session = new Soup2.Session();
    const message = new Soup2.Message({
      method: "GET",
      uri: this._uri
    });
    let connection;
    try {
      connection = await promiseTask(
        session,
        "websocket_connect_async",
        "websocket_connect_finish",
        message,
        "origin",
        protocols,
        null,
        null
      );
    } catch (err) {
      this._onerror(err);
      return;
    }
    this._onconnection(connection);
  }
  _onconnection(connection) {
    this._connection = connection;
    this._onopen();
    connection.connect("closed", () => {
      this._onclose();
    });
    connection.connect("error", (self, err) => {
      this._onerror(err);
    });
    connection.connect("message", (self, type, message) => {
      if (type === Soup2.WebsocketDataType.TEXT) {
        const data = text_decoder.decode(message.toArray());
        this._onmessage({ data });
      } else {
        this._onmessage({ data: message });
      }
    });
  }
  send(data) {
    if (typeof data === "string") {
      this._connection.send_message(
        Soup2.WebsocketDataType.TEXT,
        new GLib3.Bytes(text_encoder.encode(data))
      );
    } else {
      this._connection.send_message(Soup2.WebsocketDataType.BINARY, data);
    }
  }
  close() {
    this.readyState = 2;
    this._connection.close(Soup2.WebsocketCloseCode.NORMAL, null);
  }
  _onopen() {
    this.readyState = 1;
    if (typeof this.onopen === "function")
      this.onopen();
    this.emit("open");
  }
  _onmessage(message) {
    if (typeof this.onmessage === "function")
      this.onmessage(message);
    this.emit("message", message);
  }
  _onclose() {
    this.readyState = 3;
    if (typeof this.onclose === "function")
      this.onclose();
    this.emit("close");
  }
  _onerror(error) {
    if (typeof this.onerror === "function")
      this.onerror(error);
    this.emit("error", error);
  }
  addEventListener(name, fn) {
    const id = this.connect(name, (self, ...args) => {
      fn(...args);
    });
    this.eventListeners.set(fn, id);
  }
  removeEventListener(name, fn) {
    const id = this.eventListeners.get(fn);
    this.disconnect(id);
    this.eventListeners.delete(fn);
  }
};
Signals.addSignalMethods(WebSocket.prototype);

// src/troll/src/globals.js
Object.entries({ atob, btoa, fetch: fetch2, WebSocket }).forEach(([key, value]) => {
  if (!globalThis[key])
    globalThis[key] = value;
});

// src/main.js
import GObject4 from "gi://GObject";
import Gio4 from "gi://Gio";
import Gtk3 from "gi://Gtk?version=4.0";
import Adw3 from "gi://Adw?version=1";

// src/gobjects.js
import Gio2 from "gi://Gio";
import GObject from "gi://GObject";
var MediaInfo = GObject.registerClass({
  GTypeName: "MediaInfo",
  Properties: {
    id: GObject.ParamSpec.double("id", "ID", "ID of the item", GObject.ParamFlags.READWRITE, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 0),
    name: GObject.ParamSpec.string("name", "Name", "Name of the file", GObject.ParamFlags.READWRITE, ""),
    date: GObject.ParamSpec.string("date", "Date", "Release date", GObject.ParamFlags.READWRITE, ""),
    overview: GObject.ParamSpec.string("overview", "Overview", "The overview", GObject.ParamFlags.READWRITE, ""),
    seasonName: GObject.ParamSpec.string("season-name", "Season Name", "The season name", GObject.ParamFlags.READWRITE, ""),
    seasonNumber: GObject.ParamSpec.double("season-number", "Season Number", "The season number", GObject.ParamFlags.READWRITE, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, -1),
    seasonOverview: GObject.ParamSpec.string("season-overview", "Season Overview", "The season overview", GObject.ParamFlags.READWRITE, ""),
    seasonEpisodeCount: GObject.ParamSpec.double("season-episode-count", "Season Episode Count", "The episode count for the season", GObject.ParamFlags.READWRITE, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, -1),
    episodeName: GObject.ParamSpec.string("episode-name", "Episode Name", "The episode name", GObject.ParamFlags.READWRITE, ""),
    episodeNumber: GObject.ParamSpec.double("episode-number", "Episode Number", "The episode number", GObject.ParamFlags.READWRITE, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, -1),
    episodeOverview: GObject.ParamSpec.string("episode-overview", "Episode Overview", "The episode overview", GObject.ParamFlags.READWRITE, "")
    // icon: GObject.ParamSpec.object("icon", "Icon", "Icon for the file", GObject.ParamFlags.READWRITE, Gio.Icon),
    // type: GObject.ParamSpec.enum("type", "Type", "File type", GObject.ParamFlags.READWRITE, Gio.FileType, Gio.FileType.UNKNOWN),
  }
}, class extends GObject.Object {
});
var EpisodeGroup = GObject.registerClass({
  GTypeName: "EpisodeGroup",
  Properties: {
    id: GObject.ParamSpec.string("id", "ID", "ID of the group", GObject.ParamFlags.READWRITE, ""),
    name: GObject.ParamSpec.string("name", "Name", "Episode group name", GObject.ParamFlags.READWRITE, ""),
    type: GObject.ParamSpec.double("type", "Type", "Episode group type", GObject.ParamFlags.READWRITE, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, -1)
  }
}, class extends GObject.Object {
});

// src/MediaPicker.js
import GObject2 from "gi://GObject";
import Gio3 from "gi://Gio";
import Gtk from "gi://Gtk";
import Adw from "gi://Adw";

// src/media-api/utils.js
function makeSearchParams(obj) {
  return encodeURI(
    Object.entries(obj).filter(([k, v]) => v != null && v !== "").map(([k, v]) => `${k}=${v}`).join("&")
  );
}

// src/media-api/tmdb.js
var TMDB = class {
  _baseUrl = "https://api.themoviedb.org/3";
  _headers = {
    accept: "application/json",
    Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTliM2M1M2JjNzY5N2M0NWQzZGQ1ZmYzYzE3ZDFjMCIsInN1YiI6IjU4MmQyYTMxOTI1MTQxMDk1ZDAwMjY2OSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.a1p8_PtthYMxddvjQpCedWB93BBWKXKhuLWjAwHmzUk"
  };
  _cache = {};
  constructor(language = "en-US") {
    this._language = language;
  }
  async get(url) {
    if (Object.hasOwn(this._cache, url)) {
      return this._cache[url];
    }
    const options = {
      method: "GET",
      headers: this._headers
    };
    return fetch(url, options).then((res) => res.json()).then((res) => {
      if (res.success === false) {
        throw {
          url,
          ...res
        };
      }
      this._cache[url] = res;
      return res;
    });
  }
  async search(type, query, page = 1) {
    if (!query) {
      throw "Query empty error";
    }
    const params = makeSearchParams({
      query: query.trim(),
      include_adult: false,
      language: this._language,
      page
    });
    const url = `${this._baseUrl}/search/${type}?${params}`;
    const options = {
      method: "GET",
      headers: this._headers
    };
    return fetch(url, options).then((res) => res.json());
  }
  async details(type, id, seasonNum) {
    if (!id) {
      throw "Missing id";
    }
    const season = seasonNum != null ? `/season/${seasonNum}` : "";
    const url = `${this._baseUrl}/${type}/${id}${season}?language=${this._language}`;
    const options = {
      method: "GET",
      headers: this._headers
    };
    return fetch(url, options).then((res) => res.json());
  }
  async groupings(id) {
    const url = `${this._baseUrl}/tv/${id}/episode_groups?language=${this._language}`;
    const res = await this.get(url);
    const ret = {
      id,
      results: [
        {
          id: "-1",
          name: "Original Air Date",
          type: 1
        }
      ]
    };
    for (const result of res.results) {
      ret.results.push({
        id: result.id,
        name: result.name,
        type: result.type
      });
    }
    this._cache[`groupings/${id}`] = ret;
    return ret;
  }
  async seasons(id, groupId) {
    const isOriginal = groupId === "-1";
    let url = "";
    if (isOriginal) {
      url = `${this._baseUrl}/tv/${id}?language=${this._language}`;
    } else {
      url = `${this._baseUrl}/tv/episode_group/${groupId}?language=${this._language}`;
    }
    console.log("seasons--------->>>", url, id, groupId, isOriginal, groupId === "-1");
    const res = await this.get(url);
    const ret = {
      id,
      results: []
    };
    if (isOriginal) {
      for (const season of res.seasons) {
        ret.results.push({
          id: season.id,
          name: season.name,
          number: season.season_number,
          air_date: season.air_date,
          overview: season.overview || "",
          episode_count: season.episode_count
        });
      }
    } else {
      for (const group of res.groups) {
        ret.results.push({
          id: group.id,
          name: group.name,
          number: group.order,
          air_date: group.episodes[0]?.air_date,
          overview: group.overview || "",
          episode_count: group.episodes.length
        });
      }
    }
    return ret;
  }
  async episodes(id, groupId, ...seasons) {
    const isOriginal = groupId === "-1";
    const ret = {
      id,
      results: []
    };
    if (isOriginal) {
      const pending = [];
      for (const season of seasons) {
        const url = `${this._baseUrl}/tv/${id}/season/${season}?language=${this._language}`;
        pending.push(this.get(url));
      }
      const all = await Promise.all(pending);
      for (const res of all) {
        for (const episode of res.episodes) {
          ret.results.push({
            id: episode.id,
            name: episode.name,
            number: episode.episode_number,
            air_date: episode.air_date,
            overview: episode.overview,
            season_number: episode.season_number
          });
        }
      }
    } else {
      const url = `${this._baseUrl}/tv/episode_group/${groupId}/?language=${this._language}`;
      const res = await this.get(url);
      const idx = res.groups.reduce((a, g, i) => (a[g.order] = i, a), {});
      for (const season of seasons) {
        const group = res.groups[idx[season]];
        for (const episode of group.episodes) {
          ret.results.push({
            id: episode.id,
            name: episode.name,
            number: episode.episode_number,
            air_date: episode.air_date,
            overview: episode.overview,
            season_number: episode.season_number
          });
        }
      }
    }
    return ret;
  }
};

// src/MediaPicker.js
var MediaPicker = GObject2.registerClass({
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
    "progressBarRevealer"
  ],
  Signals: {
    "cancelled": {
      param_types: []
    },
    "selected": {
      param_types: [Gio3.ListStore]
    }
  }
}, class MediaPicker2 extends Adw.Window {
  constructor(window) {
    super();
    this._mediaApi = new TMDB();
    this._groupingsDropdown.expression = new Gtk.PropertyExpression(EpisodeGroup, null, "name");
  }
  set isBusy(v) {
    const id = this._isBusy;
    if (v && id == null) {
      this._progressBarRevealer.reveal_child = v;
      this._isBusy = setInterval(() => {
        this._progressBar.pulse();
      }, 180);
    } else {
      clearInterval(id);
      this._isBusy = null;
      this._progressBarRevealer.reveal_child = v;
    }
  }
  get isBusy() {
    return this._isBusy != null;
  }
  onCancel(button) {
    this.emit("cancelled");
  }
  onSelect(button) {
    const list = Gio3.ListStore.new(MediaInfo);
    const page = this._stack.visible_child_name;
    if (page === "movie" && this._moviesSelect) {
      const movies = get_selected_items(this._moviesSelect);
      if (movies.length === 0) {
        return;
      }
      for (const item of get_selected_items(this._moviesSelect)) {
        list.append(item);
      }
      this.emit("selected", list);
    } else if (page === "season") {
      const seasons = get_selected_items(this._seasonsSelect);
      const seasonsMap = Object.fromEntries(seasons.map((s) => [s.seasonNumber, s]));
      const show = this._showsSelect.get_selected_item();
      const group = this._groupingsDropdown.get_selected_item();
      if (seasons.length === 0) {
        return;
      }
      this._mediaApi.episodes(show.id, group.id, ...Object.keys(seasonsMap).map(parseFloat)).then((res) => {
        for (const episode of res.results) {
          const season = seasonsMap[episode.season_number];
          list.append(new MediaInfo({
            id: show.id,
            name: show.name,
            date: show.date,
            overview: show.overview,
            seasonName: season.seasonName,
            seasonNumber: season.seasonNumber,
            seasonOverview: season.seasonOverview,
            seasonEpisodeCount: season.seasonEpisodeCount,
            episodeName: episode.name,
            episodeNumber: episode.number,
            episodeOverview: episode.overview
          }));
        }
        this.emit("selected", list);
      }).catch((err) => console.error(err));
    }
  }
  onSearchChanged(entry) {
    const query = entry.get_text();
    const kind = this._stack.get_visible_child_name();
    if (!query || !kind) {
      return;
    }
    const store = kind === "tv" ? this._shows : this._movies;
    this.isBusy = true;
    this._mediaApi.search(kind, query).then((res) => {
      store.remove_all();
      this.isBusy = false;
      for (const result of res.results) {
        store.append(new MediaInfo({
          id: result.id || -1,
          name: result.name || result.original_name || result.title || result.original_title || "unknown",
          date: result.date || result.first_air_date || result.release_date || "unknown"
        }));
      }
    }).catch((err) => console.error(err));
  }
  onShowSelect(model, position, count) {
    if (!model.is_selected(position)) {
      return;
    }
    const show = model.get_selected_item();
    this._stack.set_visible_child_name("season");
    this._showTitle.label = show.name;
    this.isBusy = true;
    this._mediaApi.groupings(show.id).then((res) => {
      this._groupings.remove_all();
      res.results.forEach((group) => {
        this._groupings.append(new EpisodeGroup(group));
      });
    }).catch((err) => console.error(err));
  }
  onGroupingSelect(dropdown) {
    const show = this._showsSelect.get_selected_item();
    const group = dropdown.get_selected_item();
    this._mediaApi.seasons(show.id, group.id).then((res) => {
      this.isBusy = false;
      this._seasons.remove_all();
      res.results.forEach((season) => {
        this._seasons.append(new MediaInfo({
          id: show.id || -1,
          name: show.name || show.original_name || show.title || show.original_title || "unknown",
          date: season.air_date || "unknown",
          seasonName: season.name,
          seasonNumber: season.number,
          seasonOverview: season.overview,
          seasonEpisodeCount: season.episode_count
        }));
      });
    }).catch((err) => {
      this._seasons.remove_all();
      console.error(err);
    });
  }
  onBack(button) {
    this._stack.set_visible_child_name("tv");
  }
  setupMovieItem(listView, listItem) {
    const row = new Adw.ActionRow();
    const order = new Gtk.Label();
    order.width_chars = 2;
    order.add_css_class("title-4");
    row.add_prefix(order);
    row.order = order;
    listItem.child = row;
  }
  bindMovieItem(listView, listItem) {
    const result = listItem.item;
    const row = listItem.child;
    row.title = result.name.replace("&", "&amp;");
    row.subtitle = result.date;
    row.order.label = (listItem.get_position() + 1).toString();
  }
  setupShowItem(listView, listItem) {
    const row = new Adw.ActionRow();
    const order = new Gtk.Label();
    const arrow = new Gtk.Image();
    arrow.icon_name = "carousel-arrow-next-symbolic";
    order.width_chars = 2;
    order.add_css_class("title-4");
    row.add_prefix(order);
    row.add_suffix(arrow);
    row.order = order;
    listItem.child = row;
  }
  bindShowItem(listView, listItem) {
    const result = listItem.item;
    const row = listItem.child;
    row.title = result.name.replace("&", "&amp;");
    row.subtitle = result.date;
    row.order.label = (listItem.get_position() + 1).toString();
  }
  setupSeasonItem(listView, listItem) {
    const row = new Adw.ActionRow();
    const order = new Gtk.Label();
    const episodes = new Gtk.Button();
    episodes.halign = Gtk.Align.CENTER;
    episodes.valign = Gtk.Align.CENTER;
    episodes.add_css_class("accent");
    episodes.add_css_class("heading");
    order.width_chars = 2;
    order.add_css_class("title-4");
    row.use_markup = false;
    row.add_prefix(order);
    row.add_suffix(episodes);
    row.order = order;
    row.episodes = episodes;
    listItem.child = row;
  }
  bindSeasonItem(listView, listItem) {
    const result = listItem.item;
    const row = listItem.child;
    row.title = `${result.seasonName.replace("&", "&amp;")}`;
    row.subtitle = `${result.name.replace("&", "&amp;")}  \u2022  ${result.date}`;
    row.order.label = result.seasonNumber.toString();
    row.episodes.label = result.seasonEpisodeCount.toString();
  }
  onSwitchPage(stack) {
    const page = stack.visible_child_name;
    this._searchEntry.set_text("");
    this._select.sensitive = page !== "tv";
    this._back.sensitive = page === "season";
    this._searchEntry.visible = page !== "season";
    this._showTitle.visible = page === "season";
    this._groupingsDropdown.visible = page === "season";
    if (page === "tv") {
      this._showsSelect.unselect_item(this._showsSelect.get_selected());
    }
  }
});
function get_selected_items(select) {
  const selection = select.get_selection();
  const items = [];
  for (let i = 0, position; position = selection.get_nth(i), i < selection.get_size(); i++) {
    const item = select.model.get_item(position);
    if (item != null) {
      items.push(item);
    }
  }
  return items;
}

// src/window.js
import GObject3 from "gi://GObject";
import Gtk2 from "gi://Gtk";
import Adw2 from "gi://Adw";
var ClerkWindow = GObject3.registerClass({
  GTypeName: "ClerkWindow",
  Template: "resource:///com/arccoza/clerk/window.ui",
  InternalChildren: [
    "filesAdd",
    "filesUpdate",
    "filePicker",
    "files",
    "mediaPicker",
    "renames"
  ]
}, class ClerkWindow2 extends Adw2.ApplicationWindow {
  constructor(application) {
    super({ application });
    this._mediaPicker.connect("cancelled", this.onMediaCancelled.bind(this));
    this._mediaPicker.connect("selected", this.onMediaAdded.bind(this));
  }
  async onFilesAdd(button) {
    console.log("onFilesAdd");
    this._filePicker.show();
  }
  onFilesUpdate(button) {
    console.log("onFilesUpdate", button);
  }
  onFilesAdded(filePicker, responseId) {
    console.log("onFilesAdded", responseId);
    if (responseId !== Gtk2.ResponseType.ACCEPT) {
      return;
    }
    const files = filePicker.get_files();
    this.addFiles(files);
  }
  onMediaSearchOpen(button) {
    console.log("onMediaSearchOpen", button);
    this._mediaPicker.show();
  }
  onMediaCancelled(picker) {
    picker.hide();
  }
  onMediaAdded(picker, list) {
    for (let i = 0, item; item = list.get_item(i), i < list.get_n_items(); i++) {
      this._renames.append(item);
    }
    picker.hide();
  }
  setupFileItem(listView, listItem) {
    const row = new Adw2.ActionRow();
    row.set_title_lines(1);
    row.set_subtitle_lines(1);
    listItem.child = row;
  }
  bindFileItem(listView, listItem) {
    const file = listItem.item;
    const row = listItem.child;
    row.icon_name = "checkbox";
    row.title = file.get_basename();
    row.subtitle = file.get_parent()?.get_path() || "";
  }
  setupRenameItem(listView, listItem) {
    const row = new Adw2.ActionRow();
    row.set_title_lines(1);
    row.set_subtitle_lines(1);
    listItem.child = row;
  }
  bindRenameItem(listView, listItem) {
    const rename = listItem.item;
    const row = listItem.child;
    row.icon_name = "checkbox";
    row.title = rename.episodeName || rename.name;
    row.subtitle = rename.date;
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
import Soup3 from "gi://Soup";
pkg.initGettext();
pkg.initFormat();
var ClerkApplication = GObject4.registerClass(
  class ClerkApplication2 extends Adw3.Application {
    constructor() {
      super({ application_id: "com.arccoza.clerk", flags: Gio4.ApplicationFlags.DEFAULT_FLAGS });
      const quit_action = new Gio4.SimpleAction({ name: "quit" });
      quit_action.connect("activate", (action) => {
        this.quit();
      });
      this.add_action(quit_action);
      this.set_accels_for_action("app.quit", ["<primary>q"]);
      const show_about_action = new Gio4.SimpleAction({ name: "about" });
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
        const aboutWindow = new Adw3.AboutWindow(aboutParams);
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
