import ajaon from "./../../app/src/ajaon"
import delay from "delay"


let ajax = ajaon(undefined, undefined);

(async () => {
  

  window.addEventListener("offline", async () => {
    console.log("start")
    let req1 = ajax.post("log", {ok: "log1"})
    let req2 = ajax.post("log", {ok: "log2"})
    req1.fail(async () => {
      console.log("failed req1 - added recall")



      let prom1 = req1.recall()

      prom1.then(async () => {
        await delay(1000)

        console.log("1000")
      })

    })

  
    req2.fail(() => {
      console.log("failed req2 - added recall")



      let prom2 = req2.recall()

      prom2.then(async () => {
        await delay(1000)

        console.log("1000 - 2")
      })


    })



  })


  
})()

