const db=require('mysql2');
const pool = db.createPool({
    host: 'localhost',
    user: 'root',
    database: 'node_js',
    password: '$sultan$##xjinx$1234##'
});


// var con=pool.connect((err)=>{
//     if(err){
//         console.log(err);
//     }else{
//         console.log("connected");
//     }
// });
// pool.getConnection


// if(pool){
//     console.log("connected");
// // }



module.exports=pool.promise();