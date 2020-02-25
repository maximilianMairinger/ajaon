import ajaon from "./../../app/src/ajaon"
//const testElem = document.querySelector("#test")

let ajax = ajaon();

(async () => {
  let req = ajax.post("log", {ok: "ok"})

  setTimeout(() => {
    console.log("cancel")
    req.abort()
  }, 500)

  req.then(console.log)
})()

