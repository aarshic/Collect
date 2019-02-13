var mysql = require('mysql');

var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:'qwerty',
    database: 'socialcops'
});

con.connect(function(err){
    if(err) {
        throw err;
    }
    console.log("Connected to the database!");
    // con.query("CREATE DATABASE socialcops", function(err,result){
    //     if(err) throw err;
    //     console.log("Database Created");
    // });
    
    for(var i=20;i<100;i++){
        con.query("INSERT INTO Student (Rollno, Name) VALUES ('"+i+"', 'Name "+i+"')", function(err,result){
            if(err) throw err;
            console.log("1 record inserted");
        });
    }
    
    
    
});