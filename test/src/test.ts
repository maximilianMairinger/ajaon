import ajaon from "./../../app/src/ajaon"
import delay from "delay"

localStorage.sessKey = "dummySessKey"


let ajax = ajaon(undefined, "sessKey", true);

(async () => {
  

  window.addEventListener("offline", async () => {
    ajax.post("log", {aye: "yo"})
  })


  
})()

