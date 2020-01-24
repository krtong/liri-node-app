require("dotenv").config();

const fs = require("fs");
const keys = require("./keys.js");
const axios = require("axios");
const moment = require("moment");
const request = require("request-promise");
const Spotify = require("node-spotify-api");
const inquirer = require("inquirer");
const spotify = new Spotify(keys.spotify);

const callback = {
    'Concert This': async function (artist) {
        const query = `https://rest.bandsintown.com/artists/${artist}/events?app_id=codingbootcamp`;
        const body = await request(query);
        const json = JSON.parse(body);

        console.log(`Concert Results: ${json.length}`);
        json.forEach((concert, index) => {
             {venue: {name, city, country}, datetime} = concert;
            [   `${index + 1}.)`,
                `Venue Name : ${name}`,
                `Location : ${city}, ${country}`,
                `Date : ${moment(datetime).format("MM-DD-YYYY")}`,
                `----------------------------------------------`
            ].forEach(line => console.log(line));
        });
        goLiriBot();
    },
    'Spotify This Song': async function (songName) {
        const query = {type: 'track', query: songName};
        const {tracks: {items}} = await spotify.search(query);

        console.log(`Searching for the song "${songName}" in Spotify...`);
        console.log(`Spotify Results:  ${items.length}`);

        items.forEach((song, index) => {
            const {album: {artists: [{name: Artist}], name: Album}, name : Song, preview_url: Preview} = song;
            [   `${index + 1}.)`,
                `Artist: ${Artist}`,
                `Song Title: ${Song}`,
                `Preview URL: ${Preview ? Preview : "No preview available for this song"}`,
                `Album Title: ${Album}`,
                `----------------------------------------------`
            ].forEach(line => console.log(line));
        });
        goLiriBot();
    },
    'Movie This': async function (movieName) {
        const response = await axios.get(`https://www.omdbapi.com/?apikey=trilogy&t=${movieName}`);
        const {Title, Year, imdbRating, Country, Language, Plot, Actors, Ratings: [{Value}]} = response.data;
        [   `Searching for "${movieName}" in OMDB...`,
            `Movie Result:`,
            `Movie Name: ${Title}`,
            `Release Year: ${Year}`,
            `IMDB Rating: ${imdbRating}`,
            `Rotten Tomatoes Rating: ${Value ? Value : "No Rotten Tomatoes Rating Available"}`,
            `Country: ${Country}`,
            `Language: ${Language}`,
            `Plot: ${Plot}`,
            `Actors: ${Actors}`,
            `----------------------------------------------`
         ].forEach(line => console.log(line));
        goLiriBot();
    },
    'Do What It Says': async function () {
        const data = await fs.promises.readFile('random.txt', 'utf8');
        const [choice, ...searchText] = data.split(' ');
        goLiriBot(choice, searchText);
    }
};

const prompts = {
    choice: {
        message: `What would you like to do?`,
        type: 'list',
        choices: Object.keys(callback),
        name: 'choice'
    },
    searchText: {
        message: `Enter your search text:`,
        type: 'input',
        name: 'searchText'
    }
};

async function goLiriBot(choice, searchText) {
    if (choice && choice.length > 0) {
        choice = choice.split('-').map(word => word[0].toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };
    if (searchText && searchText.length > 0) {
        searchText = searchText.join(' ');
    };
    if (Object.keys(callback).indexOf(choice) === -1) {
        var {choice} = await inquirer.prompt(prompts.choice);
    };
    while ((!searchText || searchText.length < 3) && choice !== 'Do What It Says') {
        console.log('Must be at least 3 letters long.');
        var {searchText} = await inquirer.prompt(prompts.searchText);
    };
    callback[choice](searchText);
};

goLiriBot(process.argv[2], process.argv.slice(3));