# Ajaon

Asynchron js and json (ajaon). A tiny, fetch based http client for the web.



## Example

### Quick start

```js
import ajaon from "ajaon"

// initialisation
let ajax = ajaon();

let req = ajax.post("apiCall", {ok: "ok"})
let getReq = ajax.get("resource")

req.then(console.log)
```

### Abort Network Requests

```js
setTimeout(() => {
  req.abort("Message")
}, 500)

req.fail(console.error) // Abort: Message
```

Abort, or a for any other reason failed network request, does not throw an `Error`, rather it calls all explicitly attached fail callbacks.

In this case, the `req` Promise would never be resolved.

### Initialisation options

The quick start example used no explicit initialisation options, however there are a couple of helpful customisations to be considered. 

```ts
let apiUrl: string = "backend.myUrl.com" // Default: the baseUrl the website is renderd on
type SessKeyKey = {sessKeyKeyForStorage: string, sessKeyKeyForApi: string}
let sessKeyKey: string | SessKeyKey = "sess_key" // Default: "sessKey"
let storage: object = {} // Default: localStorage
let verbose: boolean = false // Default: true

let ajax = ajaon(apiUrl, sessKeyKey, storage, verbose)
```

* **`apiUrl`**: Your backend might be located on a different [`baseUrl`]("https://www.npmjs.com/package/get-base-url") than your frontend. This could be injected in your build script for different environments (dev, uat, prod). Please note that when no protocol (`http` / `https`) is given, ajaon will try `https` on your *first* call; though if it fails ajaon will try `http` next (without closing the outwards facing `Promise`).  The working protocol will be stored.
* **`sessKeyKey`**: TODO

## Contribute

All feedback is appreciated. Create a pull request or write an issue.
