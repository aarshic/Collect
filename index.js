'use strict';
var mysql = require('mysql');
var async = require('async');
var cluster = require('cluster');
var http = require('http');
var express = require('express');
const parse = require('csv-parse');
const util = require('util');
const fs = require('fs');
const path = require('path');
const csvHeaders = require('csv-headers');
const leftpad = require('leftpad');
const bodyParser=require('body-parser');
var readline = require('readline-sync');

// *****Database Details*****
var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:'qwerty',
    database: 'socialcops'
});

// *****Connecting Database*****
con.connect(function(err){
    if(err) {
        throw err;
    }
    console.log("Connected to the database!");
});

// *****To read total no of rows in the csv file*****
var i;
var count = 0;
require('fs').createReadStream('csvfn.csv')
.on('data', function(chunk) {
    for (i=0; i < chunk.length; ++i)
        if (chunk[i] == 10) count++;
    })
.on('end', function() {
    // console.log(count);
});

var x = 0;
var flag = 0;

// *****Database and Table details
var csvfn = 'csvfn.csv';
var dbnm = 'socialcops';
var tblnm = 'Student';
var q = `SELECT * FROM ${tblnm}`;

// *****To Create Tables and enter the required details*****
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
                var d = [];
                try {
                    context.headers.forEach(hdr => {
                        d.push(datum[hdr]);
                    });
                } catch (e) {
                    console.error(e.stack);
                }
                if (d.length > 0) {
                    if(flag==1){
                        setTimeout((function() {  
                            return process.exit(22);
                        }), 1000);
                    }
                    context.db.query(`INSERT INTO ${tblnm} ( ${context.fieldnms} ) VALUES ( ${context.qs} )`, d,
                    err => {
                        if (err) { console.error(err); next(err); }
                        else setTimeout(() => { next(); });
                    });
                    var y = count/133;
                    con.query(q, function(err, respond){
                        if(err){
                            throw err;
                        }
                        else{
                            // console.log(respond);
                            x++;
                            if(y==x){
                                x=0;
                                var stop = readline.question("If you want to stop and delete this table them press 0: ");
                                if(stop==0){
                                    con.query(`DROP TABLE IF EXISTS ${tblnm}`, function(err, respond){
                                        if(err){
                                            throw err;
                                        }
                                        else{
                                            flag=1;
                                            console.log("Table Deleted");
                                            process.exit();
                                        }
                                    });
                                }   
                            }
                        }
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

// var http=require('http')
// http.createServer(function (req, res) {
//     // res.write('Hello World!'); //write a response to the client
//     res.end('Welcome to the SocialCops Assignment'); //end the response
//     console.log("Server Started");
// }).listen(8080);