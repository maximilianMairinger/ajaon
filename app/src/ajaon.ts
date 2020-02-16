import clone from "tiny-clone"



export class AjaonPromise<Res = any, Error = string> extends Promise<Res> {
  private hasFailed: boolean
  private failiourMsg: Error
  private failCbs: ((err: Error) => void)[]

  constructor(f: (res: (res: Res) => void, fail: (err: Error) => void) => void) {
    let res
    super((r) => {
      res = r
    })
    this.failCbs = []
    this.hasFailed = false

    f(res, (msg: Error) => {
      this.hasFailed = true
      this.failiourMsg = msg
      this.failCbs.forEach((cb) => {
        cb(msg)
      })
    })
  }

  fail(f: (err: Error) => void) {
    if (this.hasFailed) f(this.failiourMsg)
    else this.failCbs.push(f)
  }

}


const dir = "/"
const setVerboseFalseNote = "\n\nIf this behaviour is intended and youd like to disable this warning, set verbose to false."
const postString = "POST"

function constructConsoleType(type: "warn" | "error" | "log" | ((msg: string) => void), alwaysExecute?: (msg: string) => void) {
  const defaultAlwaysExecute = alwaysExecute
  if (typeof type === "string") return function constructConsoleVerbose(verbose: boolean, alwaysExecute: (msg: string) => void = defaultAlwaysExecute) {
    return function(msg: string) {
      msg += setVerboseFalseNote
      if (alwaysExecute !== undefined) alwaysExecute(msg)
      if (verbose) console[type](msg)
    }
  }
  else return function constructConsoleVerbose(verbose: boolean, alwaysExecute: (msg: string) => void = defaultAlwaysExecute) {
    return function(msg: string) {
      msg += setVerboseFalseNote
      if (alwaysExecute !== undefined) alwaysExecute(msg)
      if (verbose) type(msg)
    }
  }
}

function startsWith(expected: string | string[]) {
  if (expected instanceof Array) return function(testString: string) {
    for (let i = 0; i < expected.length; i++) {
      if (testString.substr(0, expected[i].length) === expected[i]) return true
    }
    return false
  }
  else return function(testString: string) {
    return testString.substr(0, expected.length) === expected
  }
}
const startsWithHTTPS = startsWith(["http://", "https://"])

function endsWith(expected: string[] | string) {
  if (expected instanceof Array) return function(testString: string) {
    for (let i = 0; i < expected.length; i++) {
      if (testString.substr(testString.length - expected[i].length) === expected[i]) return true
    }
    return false
  }
  else return function(testString: string) {
    return testString.substr(testString.length - expected.length) === expected
  }
}
const endsWithSlash = endsWith("/")

const constructConsoleWarnVerbose = constructConsoleType("warn")

type GenericObject = {[key: string]: any} & {[key: number]: any}
type SessKeyKey = {sessKeyKeyForStorage: string, sessKeyKeyForApi: string}



export default function ajaon(apiUrl: string, sessKeyKey?: string | SessKeyKey, storage: object = localStorage, verbose: boolean = true) {
  const defaultVervose = verbose
  let warn = constructConsoleWarnVerbose(verbose)

  if (!endsWithSlash(apiUrl)) apiUrl += "/"

  let apiUrlHasNOTBeenWith: boolean | "http://" | "https://" = false
  const apiUrlWithoutHTTPSPrefix = apiUrl
  if (!startsWithHTTPS(apiUrl)) {
    apiUrlHasNOTBeenWith = "http://"
    apiUrl = "https://" + apiUrl
  }

  const sess: SessKeyKey = sessKeyKey !== undefined ? typeof sessKeyKey === "string" ? {sessKeyKeyForStorage: sessKeyKey, sessKeyKeyForApi: sessKeyKey} : clone(sessKeyKey) : false
  function post<Res = GenericObject>(url: string | string[], body: object | string, headers: HeadersInit | Headers = {'Content-Type': 'application/json'}, verbose: boolean = defaultVervose) {
    return new AjaonPromise<Res, string>(async (res, fail) => {
      headers = headers instanceof Headers ? headers : new Headers(headers)


      const error = constructConsoleType(console.error, fail)(verbose)
      if (verbose !== defaultVervose) warn = constructConsoleWarnVerbose(verbose)
      

      body = typeof body === "string" ? JSON.parse(body) : body
      if (sess) {
        if (body[sess.sessKeyKeyForApi] !== undefined) warn("Session key property \"" + sess.sessKeyKeyForApi + "\" in post body defined as \"" + body[sess.sessKeyKeyForApi] + "\". The sesskey (saved as \"" + sess.sessKeyKeyForStorage + "\" in storage) will not be ijected into the payload.");
        else if (storage[sess.sessKeyKeyForStorage] !== undefined) body[sess.sessKeyKeyForApi] = storage[sess.sessKeyKeyForStorage]
        else error("No sessionKey found on the client under " + sess.sessKeyKeyForStorage + ".")
      }

      body = JSON.stringify(body)

      try {
        res(await (await fetch(validateURL(url), {
          headers: headers,
          method: postString,
          body: body
        })).json())
      } catch (e) {
        if (apiUrlHasNOTBeenWith !== false) {
          apiUrl = apiUrlHasNOTBeenWith + apiUrlWithoutHTTPSPrefix
          if      (apiUrlHasNOTBeenWith === "http://") apiUrlHasNOTBeenWith = "https://"
          else if (apiUrlHasNOTBeenWith === "https://") apiUrlHasNOTBeenWith = "http://"
          try {
            res(await (await fetch(validateURL(url), {
              headers: headers,
              method: postString,
              body: body
            })).json())
          }
          catch (e) {
            let apiUrlSave = apiUrl
            apiUrl = apiUrlHasNOTBeenWith + apiUrlWithoutHTTPSPrefix
            let urlA = validateURL(url)
            apiUrl = apiUrlSave
            let urlB = validateURL(url)
            


            error("POST request failed at " + urlA + " and " + urlB + ".")
          }
        }
        else {
          error("POST request failed at " + validateURL(url) + ".")
        }
        
      }
    })
  }

  

  async function get<Res>(...url: string[]) {
    return new AjaonPromise<Res, string>(async (res, fail) => {
      try {
        res(await (await fetch(validateURL(url))).json())
      }
      catch(e) {
        constructConsoleType(console.error, fail)(verbose)("GET request failed at \"" + validateURL(url) + "\".");
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
