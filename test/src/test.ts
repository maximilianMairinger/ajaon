import ajaon from "./../../app/src/ajaon"
//const testElem = document.querySelector("#test")

let ajax = ajaon();

(async () => {
  console.log(await ajax.post("log", {ok: "ok"}))
})()

