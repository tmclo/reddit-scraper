'use strict';
const snoowrap = require('snoowrap');
const snoostorm = require('snoostorm');
const download = require('image-downloader')

const creds = require("./credentials.json");

const client = new snoowrap(creds);

  const submissions = new snoostorm.SubmissionStream(client, {
    subreddit: "AskReddit", //put the subreddit here! :)
    limit: 10,
    pollTime: 1000,
  });
  submissions.on("item", (item) => {
      check(item)
  });

async function check(it) {
    if(it.post_hint == "image") {
        dl(it)
    } else {
        console.log("item not an image, skipping...")
    }
}

async function dl(it) {
    const options = {
        url: it.url,
        dest: './images'
      }
    
      download.image(options)
      .then(({ filename }) => {
        console.log('Saved to', filename) 
      })
      .catch((err) => console.error(err))
}