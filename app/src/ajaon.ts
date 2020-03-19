import clone from "tiny-clone"
import getBaseUrl from "get-base-url"

type Error = string

let recalls: Function[] = []
  window.addEventListener("online", async () => {
    for (let f of recalls) {
      await f()
    }
    recalls.length = 0
  })

export class AjaonPromise<Res = GenericObject> extends Promise<Res> {
  public readonly hasFailed: boolean
  public readonly failiourMsg: Error
  private failCbs: ((err: Error) => void)[]

  public abort: (msg?: Error) => void

  private resThis: (res: Res) => void
  private f: (res: (res: Res) => void, fail: (err: Error) => void) => ((err?: Error) => void)

  constructor(f: (res: (res: Res) => void, fail: (err: Error) => void) => (() => void)) {
    let res: (res: Res) => void
    super((r) => {
      res = r
    })
    this.f = f
    this.resThis = res
    this.failCbs = []
    this.hasFailed = false
    this.defaultLengthOfFailCb = 0


    this.abort = this.f(this.resThis, (msg: Error) => {
      //@ts-ignore
      this.hasFailed = true
      //@ts-ignore
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


  private defaultLengthOfFailCb: number
 
  recall() {
    let recallAjaonPromise = new AjaonPromise<Res>((recallRes, recallFail) => {
      if (!navigator.onLine) {
  

        let hasStarted = false
        let abort = false
        let abortFunc: () => void
        
        recalls.push(() => {
          hasStarted = true
          if (abort) return


          return new Promise((rrr) => {
            abortFunc = this.f((res) => {
              

              if (this.failCbs.length === this.defaultLengthOfFailCb) this.resThis(res)
              rrr()
              recallRes(res)
            }, recallFail)

            

            
          })
          
        })

        return (msg?: Error) => {
          if (hasStarted) {
            abortFunc()
          }
          else {
            abort = true
            if (msg) recallFail("Aborted: " + msg)
            else recallFail("Aborted")
          }
        }

      }
      else {
        return this.f(recallRes, recallFail)
      }
      
    })
    return recallAjaonPromise
  }

    

}


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
const endsWithSlash = endsWith(["/", "\\"])

const constructConsoleWarnVerbose = constructConsoleType("warn")

type GenericObject = {[key: string]: any} & {[key: number]: any}
type SessKeyKey = {sessKeyKeyForStorage: string, sessKeyKeyForApi: string}

const commonLoginApiCalls = ["login", "auth", "session"]
const baseUrl = getBaseUrl()













export default function ajaon(apiUrl: string = baseUrl, sessKeyKey?: string | SessKeyKey, ensureDelivery: boolean = false, storage: object = localStorage, verbose: boolean = true) {
  


  const defaultVervose = verbose
  const defualtEnsureDelivery = ensureDelivery
  let warn = constructConsoleWarnVerbose(verbose)

  if (!endsWithSlash(apiUrl)) apiUrl += "/"

  let apiUrlHasNOTBeenWith: boolean | "http://" | "https://" = false
  const apiUrlWithoutHTTPSPrefix = apiUrl
  if (!startsWithHTTPS(apiUrl)) {
    apiUrlHasNOTBeenWith = "http://"
    apiUrl = "https://" + apiUrl
  }

  const sess: SessKeyKey = sessKeyKey !== undefined ? typeof sessKeyKey === "string" ? {sessKeyKeyForStorage: sessKeyKey, sessKeyKeyForApi: sessKeyKey} : clone(sessKeyKey) : false
  function post<Res = GenericObject>(url: string | string[], body: object | string = {}, headers: HeadersInit | Headers = {'Content-Type': 'application/json'}, ensureDelivery: boolean = defualtEnsureDelivery, verbose: boolean = defaultVervose) {
    let ret = new AjaonPromise<Res>((res, fail) => {
      headers = headers instanceof Headers ? headers : new Headers(headers)


      const error = constructConsoleType(console.error, fail)(verbose)
      if (verbose !== defaultVervose) warn = constructConsoleWarnVerbose(verbose)
      const assembledUrl = assembleUrl(url)

      body = typeof body === "string" ? JSON.parse(body) : body
      if (sess) {
        if (body[sess.sessKeyKeyForApi] !== undefined) warn("Session key property \"" + sess.sessKeyKeyForApi + "\" in post body defined as \"" + body[sess.sessKeyKeyForApi] + "\". The sesskey (saved as \"" + sess.sessKeyKeyForStorage + "\" in storage) will not be ijected into the payload.");
        else if (storage[sess.sessKeyKeyForStorage] !== undefined) body[sess.sessKeyKeyForApi] = storage[sess.sessKeyKeyForStorage]
        else {
          let isCommon = false
          const lowerCaseUrl = assembledUrl.toLocaleLowerCase()
          for (let i = 0; i < commonLoginApiCalls.length; i++) {
            if (lowerCaseUrl.includes(commonLoginApiCalls[i])) {
              isCommon = true
            }
          }

          if (!isCommon) {
            error("No sessionKey found on the client under " + sess.sessKeyKeyForStorage + ".")
          }
        }
      }

      body = JSON.stringify(body);

      let controller = new AbortController();
      let signal = controller.signal;

      (async () => {
        try {
          res(await (await fetch(assembledUrl, {
            headers: headers,
            method: postString,
            body: body,
            signal
          })).json())
        } catch (e) {
          if (!signal.aborted) {
            if (apiUrlHasNOTBeenWith !== false) {
              apiUrl = apiUrlHasNOTBeenWith + apiUrlWithoutHTTPSPrefix
              if      (apiUrlHasNOTBeenWith === "http://") apiUrlHasNOTBeenWith = "https://"
              else if (apiUrlHasNOTBeenWith === "https://") apiUrlHasNOTBeenWith = "http://"
              try {
                res(await (await fetch(assembleUrl(url), {
                  headers: headers,
                  method: postString,
                  body: body,
                  signal
                })).json())
              }
              catch (e) {
                let apiUrlSave = apiUrl
                apiUrl = apiUrlHasNOTBeenWith + apiUrlWithoutHTTPSPrefix
                let urlA = assembleUrl(url)
                apiUrl = apiUrlSave
                let urlB = assembleUrl(url)
                
    
    
                error("POST request failed at " + urlA + " and " + urlB + ".")
              }
            }
            else {
              error("POST request failed at " + assembleUrl(url) + ".")
            }
          }
        }
      })()

      return (msg?: string) => {
        controller.abort()
        if (msg) fail("Aborted: " + msg)
        else fail("Aborted")
      }
    })

    if (ensureDelivery) {
      delete body[sess.sessKeyKeyForApi]
      //@ts-ignore
      ret.defaultLengthOfFailCb++
      ret.fail(() => {
        if (!navigator.onLine) {
          ret.recall()
        }
      })
    }


    return ret
  }

  

  function get<Res = GenericObject>(url: string | string[], ensureDelivery: boolean = defualtEnsureDelivery, verbose: boolean = defaultVervose) {
    let ret = new AjaonPromise<Res>((res, fail) => {
      let controller = new AbortController();
      let signal = controller.signal;

      

      (async () => {
        try {
          res(await (await fetch(assembleUrl(url), {signal})).json())
        }
        catch(e) {
          constructConsoleType(console.error, fail)(verbose)("GET request failed at \"" + assembleUrl(url) + "\".");
        }
      })()
      
      return (msg?: string) => {
        controller.abort()
        if (msg) fail("Aborted: " + msg)
        else fail("Aborted")
      }
    })

    if (ensureDelivery) {
      //@ts-ignore
      ret.defaultLengthOfFailCb++
      ret.fail(() => {
        if (!navigator.onLine) {
          ret.recall()
        }
      })
    }

    return ret
  }

  function assembleUrl(url: string[] | string) {
    url = (url instanceof Array) ? url : [url];

    let fullUrl = ""
    url.forEach((urlPart) => {
      if (endsWithSlash(urlPart)) urlPart = urlPart.substring(0, urlPart.length - 1)
      fullUrl += urlPart + "/"
    })
    fullUrl = fullUrl.substring(0, fullUrl.length - 1);

    if (!startsWithHTTPS(fullUrl)) fullUrl = apiUrl + fullUrl;

    return fullUrl
  }


  return {post, get}

}
