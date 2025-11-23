const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.get("/", (req, res) =>{
    res.send('user server is available');
})

app.listen(port, () => {
  console.log(`user server started on Port: ${port}`);
})