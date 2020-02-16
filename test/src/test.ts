import ajaon from "./../../app/src/ajaon"
//const testElem = document.querySelector("#test")

let ajax = ajaon("http://127.0.0.1:7000", "userKey");

(async () => {
  console.log(await ajax.post("log", {ok: "ok"}))
})()
