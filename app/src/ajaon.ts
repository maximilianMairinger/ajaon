import clone from "tiny-clone"



export class AjaonPromise<Res = any, Error = string> extends Promise<Res> {
  constructor(f: (res: (res: Res) => void, fail: (err: Error) => void) => void) {
    super((res) => {
      f(res, (msg: Error) => {
        this.hasFailed = true
        this.failiourMsg = msg
        this.failCbs.forEach((cb) => {
          cb(msg)
        })
      })
    })
  }

  private hasFailed: boolean = false
  private failiourMsg: Error
  private failCbs: ((err: Error) => void)[] = []
  fail(f: (err: Error) => void) {
    if (this.hasFailed) f(this.failiourMsg)
    else this.failCbs.push(f)
  }

}


const dir = "/"
const setVerboseFalseNote = "\n\nIf this behaviour is intended and youd like to disable this warning, set verbose to false."

function constructConsoleType(type: "warn" | "error" | "log" | ((msg: string) => void)) {
  if (typeof type === "string") return function constructConsoleVerbose(verbose: boolean) {
    return function(msg: string) {
      if (verbose) console[type](msg + setVerboseFalseNote)
    }
  }
  else return function constructConsoleVerbose(verbose: boolean) {
    return function(msg: string) {
      if (verbose) type(msg + setVerboseFalseNote)
    }
  }
}

const constructConsoleWarnVerbose = constructConsoleType("warn")

type GenericObject = {[key: string]: any} | {[key: number]: any}
type SessKeyKey = {sessKeyKeyForLocalStorage: string, sessKeyKeyForApi: string}

export default function ajaon(apiUrl: string, sessKeyKey: string | SessKeyKey = "sessKey", verbose: boolean = true) {
  const warn = constructConsoleWarnVerbose(verbose)
  

  if (apiUrl.charAt(apiUrl.length-1) !== "/") apiUrl += "/"

  const sess: SessKeyKey = typeof sessKeyKey === "string" ? {sessKeyKeyForLocalStorage: sessKeyKey, sessKeyKeyForApi: sessKeyKey} : clone(sessKeyKey)
  function post<Res = GenericObject>(url: string | string[], body: object | string, headers?: HeadersInit) {
    return new AjaonPromise<Res, string>(async (res, fail) => {
      const error = constructConsoleType((r) => {fail(r); console.error(r)})(verbose)

      body = typeof body === "string" ? JSON.parse(body) : body
      if (body[sess.sessKeyKeyForApi] !== undefined) {
        warn("Session key property \"" + sess.sessKeyKeyForApi + "\" in post body defined as \"" + body[sess.sessKeyKeyForApi] + "\". The sesskey (saved as \"" + sess.sessKeyKeyForLocalStorage + "\" in localStorage) will not be ijected into the payload.");
      }
      else body[sess.sessKeyKeyForApi] = localStorage[sess.sessKeyKeyForLocalStorage] || "";
      try {
        res(await (await fetch(validateURL(url), {
          headers: new Headers(headers),
          method: "POST",
          body: JSON.stringify(body)
        })).json())
      } catch (e) {
        error("POST request failed at \"" + validateURL(url) + "\".");
      }
    })
  }

  

  async function get<Res>(...url: string[]) {
    return new AjaonPromise<Res, string>(async (res, fail) => {
      const error = constructConsoleType((r) => {fail(r); console.error(r)})(verbose)
      try {
        res(await (await fetch(validateURL(url))).json())
      }
      catch(e) {
        error("GET request failed at \"" + validateURL(url) + "\".");
      }
    })
  }

  function validateURL(url: string[] | string) {
    url = (url instanceof Array) ? url : [url];
    let fullUrl = "";
    url.forEach((urlPart) => {
      if (urlPart.charAt(urlPart.length - 1) === dir) urlPart = urlPart.substring(0, urlPart.length - 1);
      fullUrl += urlPart;
    });
  
    if (url[0].substring(0, 4) !== "http") fullUrl = apiUrl + fullUrl;
  
    return fullUrl;
  }


  return {post, get}

}


// TODO: is currently online. if offline for longer dont spam, not connected event
