import ajaon from "./../../app/src/ajaon"
//const testElem = document.querySelector("#test")

let ajax = ajaon();

(async () => {
  let req = ajax.post("log", {ok: "ok"})

  setTimeout(() => {
    console.log("cancel")
    req.abort("error message")
  }, 500)

  req.fail((e) => {
    console.error(e)
  })

  req.then(console.log)
})()

