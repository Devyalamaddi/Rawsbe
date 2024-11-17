const exp = require("express");
const app = exp();

require('dotenv').config();

const cors = require('cors');

app.use(cors({
    origin: process.env.O_URL,
}));


app.use(exp.json());

// const authorApp=require('./APIs/author-api.js');
const userApp = require('./APIs/user-api.js');


app.use('/user-api',userApp);
// app.use('/author-api',authorApp);

app.use((err,req,res,next)=>{
    res.send({errorMessage:"error",payload:err});
})

const PORT =process.env.PORT||5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
