import {FormVariable} from "../src/model/types";

require('dotenv').config()
const fs = require("fs")

 async function generateTestVariables(amount){
    return new Promise(resolve => {
        let varName = "test"
        let csv = "";
        for(let i = 1; i <= amount; i++){
            csv += `${varName}-${i};${varName}.var_${i};${varName} desc ${i};Example ${i}`
            csv += "\n"
        }
        resolve(csv)
    })
}

if(process.env.ENVIOURNMENT === "localhost"){
    console.log("generating variables....")
    generateTestVariables(1000)
        .then((vars) => {
            fs.writeFile("./public/variables.csv", vars, (err) => {
                if(err)
                    console.error(err)
                else
                    console.log("variables generated.")
            })
        })
}

