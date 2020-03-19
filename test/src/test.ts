import ajaon from "./../../app/src/ajaon"


let ajax = ajaon(undefined, undefined);

(async () => {
  

  window.addEventListener("offline", async () => {
    console.log("start")
    let req1 = ajax.post("log", {ok: "log1"})
    req1.fail(async () => {
      console.log("failed - added recall")



      let prom = req1.recall()

      

      setTimeout(() => {
        debugger
        prom.abort("Sad")
      }, 500)

      prom.fail((e) => {
        console.log("fail", e)
      })

      console.log(await prom, "yea")

    })

    let res = await Promise.all([req1])
  
    console.log(res)
  })

  
})()

