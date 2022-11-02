const express = require('express');
const mongoose=require('mongoose');
const cors=require('cors');
const { readdirSync} = require('fs');
const dotenv=require('dotenv');
dotenv.config();

const app= express();

app.use(express.json());
app.use(cors());


readdirSync("./routes").map((route)=>app.use("/", require(`./routes/${route}`)))


mongoose.connect(process.env.DATABASE_URL).then(()=>{
    console.log("Database connected successfully")
}).catch((err)=>{
    console.log("Error in connecting database "+err.message);
})


const PORT=process.env.PORT || 8000;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}..`);
})