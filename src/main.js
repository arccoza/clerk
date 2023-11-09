import "./troll/src/globals.js"
import GObject from "gi://GObject"
import Gio from "gi://Gio"
import Gtk from "gi://Gtk?version=4.0"
import Adw from "gi://Adw?version=1"
import { MediaInfo } from "./gobjects"
import { MediaPicker } from "./MediaPicker"
import { ClerkWindow } from "./window.js"
import Soup from 'gi://Soup'


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
  // const url = 'https://api.themoviedb.org/3/search/tv?query=scooby%20doo%20where%20are%20you&include_adult=false&language=en-US&page=1';
  // const options = {
  //   method: 'GET',
  //   headers: {
  //     accept: 'application/json',
  //     Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTliM2M1M2JjNzY5N2M0NWQzZGQ1ZmYzYzE3ZDFjMCIsInN1YiI6IjU4MmQyYTMxOTI1MTQxMDk1ZDAwMjY2OSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.a1p8_PtthYMxddvjQpCedWB93BBWKXKhuLWjAwHmzUk'
  //   }
  // };

  // fetch(url, options)
  //   .then(res => (console.log(res), res))
  //   .then(res => res.json())
  //   .then(json => console.log(json))
  //   .catch(err => console.error('error:' + err));


  // const session = new Soup.Session();
  // const msg = Soup.Message.new('GET', url);
  // const request_headers = msg.get_request_headers();
  // request_headers.append('accept', 'application/json');
  // request_headers.append('Authorization', 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTliM2M1M2JjNzY5N2M0NWQzZGQ1ZmYzYzE3ZDFjMCIsInN1YiI6IjU4MmQyYTMxOTI1MTQxMDk1ZDAwMjY2OSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.a1p8_PtthYMxddvjQpCedWB93BBWKXKhuLWjAwHmzUk');
  // session.queue_message(msg, (_, {statusCode, responseBody}) => {
  //   log(`statusCode: ${statusCode}`);
  //   log(`body: ${responseBody.data}`);
  // });
  // const gbytes = session.send_and_read(msg, null)
  // console.log(new TextDecoder().decode(gbytes.toArray()))

  const application = new ClerkApplication()
  return application.runAsync(argv)
}
