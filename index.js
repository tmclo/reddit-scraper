'use strict';
const snoowrap = require('snoowrap');
const snoostorm = require('snoostorm');

const creds = require("./credentials.json");

const client = new snoowrap(creds);

  const submissions = new snoostorm.SubmissionStream(client, {
    subreddit: "AskReddit",
    limit: 10,
    pollTime: 1000,
  });
  submissions.on("item", (item) => {
      console.log("New post: " + item.title)
  });