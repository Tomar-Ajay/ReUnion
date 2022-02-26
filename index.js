const express = require('express');
const mongoose = require('mongoose');
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const app = express();

dotenv.config();

const port = process.env.PORT || 3000;

mongoose.connect(process.env.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
},
  ()=>{
      console.log("Connected to DB");
  }
)

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

// app.get("/", (req,res)=>{
//     res.send("Welcome");
// })

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);

app.listen(port, ()=>{
    console.log(`Port is running on ${port}.`);
})