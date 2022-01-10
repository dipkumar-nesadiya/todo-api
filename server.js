const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/',(req,res) => {
    res.send('Todo API Root!');
})

app.listen(PORT,(req,res) => {
    console.log(`Express listening on PORT ${PORT}`);
})