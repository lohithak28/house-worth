const express = require('express');
const app=express();
//Route with parameter
app.get('/users/:id?/:postId?',(req,res)=>{
    const {id,postId}=req.params;//Extract the parameter
    if(id && postId){
        res.send(`User ID is: ${id} and postId ${postId}`)
    }
    else{
        res.send(`id not found`);
    }
    
});
const PORT=3500;
app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});