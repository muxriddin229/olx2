const express = require("express")
const {connectDb} = require("./config/db")

const app = express()
app.use(express.json())
connectDb()


app.listen(3000, ()=>console.log("server started on port 3000"))