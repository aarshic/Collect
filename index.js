'use strict';
var mysql = require('mysql');
var async = require('async');
var cluster = require('cluster');
var http = require('http');
var express = require('express');
// var json = require("json");
const parse      = require('csv-parse');
const util       = require('util');
const fs         = require('fs');
const path       = require('path');
// const mysql      = require('mysql');
// const async      = require('async');
const csvHeaders = require('csv-headers');
const leftpad    = require('leftpad');



var numCPUs = 1;

if (cluster.isMaster) {
    var numWorkers = require('os').cpus().length;
    console.log('Master cluster setting up ' + numWorkers + ' workers...');

    for(var i = 0; i < numWorkers; i++) {
        cluster.fork();
    }
    cluster.on('online', function(worker) {
        console.log('Worker ' + worker.process.pid + ' is online');
    });

    cluster.on('exit', function(worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
    });
} else {
    var app = require('express')();
    app.all('/*', function(req, res) {res.send('process ' + process.pid + ' says hello!').end();})

    var server = app.listen(8000, function() {
        console.log('Process ' + process.pid + ' is listening to all incoming requests');
    });
}
// } else {
//     http.createServer(function(req, res) {
//         res.writeHead(200);
//         res.end('process ' + process.pid + ' says hello!');
//         console.log('process ' + process.pid + ' says hello!');
//     }).listen(8000);
// }














// const csvfn = process.argv[2];
// const dbnm  = process.argv[3];
// const tblnm = process.argv[4];
var csvfn = 'csvfn.csv';
var dbnm = 'socialcops';
var tblnm = 'Student';

new Promise((resolve, reject) => {
    csvHeaders({
        file      : csvfn,
        delimiter : ','
    }, function(err, headers) {
        if (err) reject(err);
        else resolve({ headers });
    });
})
.then(context => {
    return new Promise((resolve, reject) => {
        context.db = mysql.createConnection({
            host     : 'localhost',
            user     : 'root',
            password : 'qwerty',
            database : dbnm
        });
        context.db.connect((err) => {
            if (err) {
                console.error('error connecting: ' + err.stack);
                reject(err);
            } else {
                resolve(context);
            }
        });
    })
})
.then(context => {
    return new Promise((resolve, reject) => {
        context.db.query(`DROP TABLE IF EXISTS ${tblnm}`,
        [ ],
        err => {
            if (err) reject(err);
            else resolve(context);
        })
    });
})
.then(context => {
    return new Promise((resolve, reject) => {
        var fields = '';
        var fieldnms = '';
        var qs = '';
        context.headers.forEach(hdr => {
            hdr = hdr.replace(' ', '_');
            if (fields !== '') fields += ',';
            if (fieldnms !== '') fieldnms += ','
            if (qs !== '') qs += ',';
            fields += ` ${hdr} TEXT`;
            fieldnms += ` ${hdr}`;
            qs += ' ?';
        });
        context.qs = qs;
        context.fieldnms = fieldnms;
        // console.log(`about to create CREATE TABLE IF NOT EXISTS ${tblnm} ( ${fields} )`);
        context.db.query(`CREATE TABLE IF NOT EXISTS ${tblnm} ( ${fields} )`,
        [ ],
        err => {
            if (err) reject(err);
            else resolve(context);
        })
    });
})
.then(context => {
    return new Promise((resolve, reject) => {
        fs.createReadStream(csvfn).pipe(parse({
            delimiter: ',',
            columns: true,
            relax_column_count: true
        }, (err, data) => {
            if (err) return reject(err);
            async.eachSeries(data, (datum, next) => {
                // console.log(`about to run INSERT INTO ${tblnm} ( ${context.fieldnms} ) VALUES ( ${context.qs} )`);
                var d = [];
                try {
                    context.headers.forEach(hdr => {
                        d.push(datum[hdr]);
                    });
                } catch (e) {
                    console.error(e.stack);
                }
                // console.log(`${d.length}: ${util.inspect(d)}`);
                if (d.length > 0) {
                    context.db.query(`INSERT INTO ${tblnm} ( ${context.fieldnms} ) VALUES ( ${context.qs} )`, d,
                    err => {
                        if (err) { console.error(err); next(err); }
                        else setTimeout(() => { next(); });
                    });
                } else { console.log(`empty row ${util.inspect(datum)} ${util.inspect(d)}`); next(); }
            },
            err => {
                if (err) reject(err);
                else resolve(context);
            });
        }));
    });
})
.then(context => { 
    console.log("Task Completed");
    context.db.end();
})
.catch(err => { 
    console.error(err.stack); 
});


















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