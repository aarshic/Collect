var mysql = require('mysql');
var async = require("async");
var json = require("json");

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
    // con.query("CREATE TABLE Student", function(err,result){
    
    // for(var i=20;i<100;i++){
    //     con.query("INSERT INTO Student (Rollno, Name) VALUES ('"+i+"', 'Name "+i+"')", function(err,result){
    //         if(err) throw err;
    //         console.log("1 record inserted");
    //     });
    // }
});
   


function seriesDemo(req, res, next) {
    let rsp = {};
    console.log("In the function");
    const tasks = [ 
    // async.series([
        function insert1(cb) {
            cb(null,console.log("insert1"));
            // console.log("insert1");
            // const company = new Company({
            //     name: 'FullStackhour'
            // });
            // company.save(function(err, savedCompany) {
            //     if (err) {
            //         return cb(err);
            //     }
            //         console.log("insert1");
            //     rsp.company = savedCompany;
            //     return cb(null, savedCompany);
            // });
        },
        function insert2(cb) {
            cb(null,console.log("insert2"));
            setTimeout(() => console.log('second'), 2000);
            // console.log("insert2");
            // const job = new Job({
            //     title: 'Node.js Developer',
            //     _company: rsp.company._id
            // });
            // job.save((err, savedJob) => {
            //     if (err) {
            //         return cb(err);
            //     }
            //     rsp.job = savedJob;
            //     return cb(null, savedJob);
            // })
        },
        function insert3(cb) {
            setTimeout(() => console.log('seconewsdfd'), 5000);
            cb(null,console.log("insert3"));
            // console.log("insert3");
            // const application = new Application({
            //     _job: rsp.job._id,
            //     _company: rsp.company._id
            // });
            // application.save((err, savedApp) => {
            //     if (err) {
            //         return cb(err);
            //     }
            //     rsp.application = savedApp;
            //     return cb(null, savedApp);
            // })
        },
        function insert4(cb) {
            cb(null,console.log("insert4"));
            // console.log("insert4");
            // const licence = new Licence({
            //     name: 'FREE',
            //     _application: rsp.application._id
            // });
            // licence.save((err, savedLic) => {
            //     if (err) {
            //         return cb(err);
            //     }
            //     return cb(null, savedLic);
            // })
        }
    ];
    async.series(tasks, (err, results) => {
        if (err) {
            return next(err);
        }
        return console.log(results);
    })
}

seriesDemo();