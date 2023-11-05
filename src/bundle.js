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
  const uri = GLib2.Uri.parse(url, GLib2.UriFlags.NONE);
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
import Gio3 from "gi://Gio";
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
    date: GObject.ParamSpec.string("date", "Date", "Release date", GObject.ParamFlags.READWRITE, "")
    // icon: GObject.ParamSpec.object("icon", "Icon", "Icon for the file", GObject.ParamFlags.READWRITE, Gio.Icon),
    // type: GObject.ParamSpec.enum("type", "Type", "File type", GObject.ParamFlags.READWRITE, Gio.FileType, Gio.FileType.UNKNOWN),
  }
}, class extends GObject.Object {
});

// src/MediaPicker.js
import GObject2 from "gi://GObject";
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
  constructor(language = "en-US") {
    this._language = language;
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
    console.log("------>>>", url);
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTliM2M1M2JjNzY5N2M0NWQzZGQ1ZmYzYzE3ZDFjMCIsInN1YiI6IjU4MmQyYTMxOTI1MTQxMDk1ZDAwMjY2OSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.a1p8_PtthYMxddvjQpCedWB93BBWKXKhuLWjAwHmzUk"
      }
    };
    return fetch(url, options).then((res) => res.json());
  }
};

// src/MediaPicker.js
var MediaPicker = GObject2.registerClass({
  GTypeName: "MediaPicker",
  Template: "resource:///com/arccoza/clerk/MediaPicker.ui",
  InternalChildren: [
    "typeStack",
    "shows",
    "movies"
  ]
}, class MediaPicker2 extends Adw.Window {
  constructor(window) {
    super();
    this._mediaApi = new TMDB();
  }
  onShowsToggled(button) {
  }
  onMoviesToggled(button) {
  }
  onSearchChanged(entry) {
    const query = entry.get_text();
    const kind = this._typeStack.get_visible_child_name();
    console.log("==>>>>>>>", kind);
    if (!query || !kind) {
      return;
    }
    const store = kind === "tv" ? this._shows : this._movies;
    this._mediaApi.search(kind, query).then((res) => {
      store.remove_all();
      console.log("==++>>", res);
      for (const result of res.results) {
        store.append(new MediaInfo({
          id: result.id || -1,
          name: result.name || result.original_name || result.title || result.original_title || "unknown",
          date: result.date || result.first_air_date || result.release_date || "unknown"
        }));
      }
    }).catch((err) => console.error(err));
  }
  setupShowItem(listView, listItem) {
    const row = new Adw.ActionRow();
    listItem.child = row;
  }
  bindShowItem(listView, listItem) {
    const result = listItem.item;
    const row = listItem.child;
    row.title = result.name.replace("&", "&amp;");
    row.subtitle = result.date;
  }
  setupMovieItem(listView, listItem) {
    const row = new Adw.ActionRow();
    listItem.child = row;
  }
  bindMovieItem(listView, listItem) {
    const result = listItem.item;
    const row = listItem.child;
    row.title = result.name.replace("&", "&amp;");
    row.subtitle = result.date;
  }
});

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
    "mediaPicker"
  ]
}, class ClerkWindow2 extends Adw2.ApplicationWindow {
  constructor(application) {
    super({ application });
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
  setupFileItem(listView, listItem) {
    const row = new Adw2.ActionRow();
    listItem.child = row;
  }
  bindFileItem(listView, listItem) {
    const file = listItem.item;
    const row = listItem.child;
    row.icon_name = "checkbox";
    row.title = file.get_basename();
    row.subtitle = file.get_path();
  }
  onMediaSearchOpen(button) {
    console.log("onMediaSearchOpen", button);
    this._mediaPicker.show();
  }
  onMediaSearchChanged(entry) {
    console.log("onMediaSearchChanged", entry);
  }
  setupSearchItem(listView, listItem) {
  }
  bindSearchItem(listView, listItem) {
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
      super({ application_id: "com.arccoza.clerk", flags: Gio3.ApplicationFlags.DEFAULT_FLAGS });
      const quit_action = new Gio3.SimpleAction({ name: "quit" });
      quit_action.connect("activate", (action) => {
        this.quit();
      });
      this.add_action(quit_action);
      this.set_accels_for_action("app.quit", ["<primary>q"]);
      const show_about_action = new Gio3.SimpleAction({ name: "about" });
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
