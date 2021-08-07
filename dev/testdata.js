import {FormVariable} from "../src/model/types";

require('dotenv').config()
const fs = require("fs")

// https://stackoverflow.com/a/68470365
const rnd = (len, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => [...Array(len)].map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('')

async function generateTestVariables(amount) {
    return new Promise(resolve => {
        let varName = "test"
        let csv = "";
        for (let i = 1; i <= amount; i++) {
            csv += `${varName}-${i};${varName}.var_${i}-${rnd(Math.floor(Math.random() * 60)) + 1};${varName} desc ${i};Example ${i}`
            csv += "\n"
        }
        resolve(csv)
    })
}

if (process.env.ENVIOURNMENT === "localhost") {
    console.log("generating variables....")
    generateTestVariables(500)
        .then((vars) => {
            fs.writeFile("./public/variables.csv", vars, (err) => {
                if (err)
                    console.error(err)
                else
                    console.log("variables generated.")
            })
        })
}

