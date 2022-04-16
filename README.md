## Reddit Meme Collector

This simple NodeJS project watches a Submission Stream from a defined set of subreddits and automatically downloads the memes and uploads them into S3 (which can be used for creating a personal gallery etc?) this is also backed by adding entries along with the S3 URL's into a MySQL database

## Uses Redis to prevent downloading duplicate files

Due to me using this on a docker swarm for a personal project we're using Redis (I'm running a replicated redis cluster w/ sentinel for this) in order to store the unique id's of each download.
