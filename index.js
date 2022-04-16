'use strict';
const snoowrap = require('snoowrap');
const snoostorm = require('snoostorm');
const download = require('image-downloader');
const Redis = require("ioredis");
var mysql = require('mysql');
const AWS = require('aws-sdk');
const fs = require('fs');
var path = require("path");
var subs = require("./subs.js");
require('dotenv').config();

// Define the following environment variables in .env
// AWS_ACCESS_KEY_ID
// AWS_SECRET_ACCESS_KEY
// AWS_BUCKET_NAME
// MYSQL_PASSWORD
// REDIS_PASSWORD

var con = mysql.createConnection({
    host: "dbcluster",
    user: "user",
    password: process.env.MYSQL_PASSWORD,
    database: "memes",
    charset: "utf8mb4"
});

con.connect(function(err) {
    if(err) {
        console.log('\x1b[31mERROR: \x1b[0m', err);
     }
    console.log("\x1b[32mSQL: \x1b[0m Connected");
    console.log("\x1b[32mSTATUS: \x1b[0m OK")
});

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  })

const redis = new Redis({
    sentinels: [{ host: "redis-sentinel", port: 26379 }],
    name: "redis-cache",
    password: process.env.REDIS_PASSWORD,
});

const creds = require("./credentials.json");
const client = new snoowrap(creds);


const submissions = new snoostorm.SubmissionStream(client, {
    subreddit: "memes", //define multiple with "+" e.g. subreddit1+subreddit2+subreddit3
    limit: 10,
    pollTime: 2000,
});
submissions.on("item", (item) => {
    check(item)
});


async function check(it) {
    if(it.post_hint == "image") {
        if(redis.exists(it.id, function(err, reply) {
            if(reply == 1) {
                console.log("id exists in database, skipping...");
            } else {
                dl(it.url, it.title, it.id)
            }
        }));
    } else {
        console.log("item not an image, skipping...")
    }
}

async function dl(Url, title, id) {

    const options = {
        url: Url,
        dest: '/app/images'
      }
    
      download.image(options)
      .then(({ filename }) => {
        console.log('Saved to', filename) 
        //handle an upload to S3 or somewhere here! then call the database!!1! :)
        //upload to S3
        const fileContent = fs.readFileSync(filename)
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: path.basename(filename),
            Body: fileContent
          }

          s3.upload(params, function(s3Err, data) {
            if (s3Err) throw s3Err
            console.log(`File uploaded successfully at ${data.Location}`)
            sqlInsert(title, filename, data.Location)
        });
        redis.set(id, '1');

      })
      .catch((err) => console.error(err))
}

//create a function to add to database here
async function sqlInsert(title, filename, s3location) {

    const sql = {
        title: title,
        fileName: filename,
        url: s3location
    };
    con.query('INSERT INTO images SET ?', sql, (err, res) => {
        if(err) {
            console.log('\x1b[31mERROR: \x1b[0m', err.message);
        }
    })

    //console.log(sql)
    console.log('\x1b[32mSQL INSERT: \x1b[0m'+path.basename(filename))
    console.log('\x1b[32mSUCCESS: \x1b[0m'+title)

}
