/**
 * @author: Anthony Martinez, Chandandeep Thind,Sotheanith Sok, Yashua Ovando
 * @email: anthony.martinez02@student.csulb.edu, chandandeep.thind@student.csulb.edu, sotheanith.sok@student.csulb.edu, yashua.ovando@student.csulb.edu 
 * @description: This module contains Express routing services provided by this application. It is reponsible
 * for serving necessary files and handling incoming HTTP requests. 
 */


/**
 * Import libraries.
 */
const express = require('express');
const path = require('path');
const VCS = require('./src/js/VCS')

/**
 * Initialize variables.
 */
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'src/build')));

const debugMode = true;


/**
 * Homepage routes. 
 */
app.get('/', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'src/build', 'index.html'));
})

/**
 * Create route.
 */
app.post('/create', (req, res, next) => {
    try {
        let sourceDirectory = req.body.sourceDirectory;
        new VCS(sourceDirectory).init();
        res.status(201).end();
    } catch (err) {
        if(debugMode){
            console.log(err);
        }
        res.status(400).end();
    }
})

/**
 * Commit route.
 */
app.post('/commit', (req, res, next) => {
    try {
        let sourceDirectory = req.body.sourceDirectory;
        try {
            new VCS(sourceDirectory).init();
        } catch (err) {
            console.log(err);
        }
        new VCS(sourceDirectory).commit();
        res.status(200).end();
    } catch (err) {
        if(debugMode){
            console.log(err);
        }
        res.status(400).end();
    }
})

/**
 * Checkout route.
 */
app.post('/checkout', (req, res, next) => {
    try {
        let sourceDirectory = req.body.sourceDirectory;
        let targetDirectory = req.body.targetDirectory;
        new VCS(sourceDirectory).checkout(targetDirectory)
        res.status(200).end();
    } catch (err) {
        if(debugMode){
            console.log(err);
        }
        res.status(400).end();
    }
});

/**
 * Checkin route.
 */
app.post('/checkin', (req, res, next) => {
    try {
        console.log("checking in...")
        let sourceDirectory = req.body.sourceDirectory;
        let targetDirectory = req.body.targetDirectory;
        new VCS(sourceDirectory).checkin(targetDirectory)
        res.status(200).end();
    } catch (err) {
        if(debugMode){
            console.log(err);
        }
        res.status(400).end();
    }
});


/**
 * Get commits route.
 */
app.post('/get/commits', (req, res, next) => {
    try {
        let sourceDirectory = req.body.sourceDirectory;
        res.send(new VCS(sourceDirectory).get(0));
        res.status(200).end();
    } catch (err) {
        if(debugMode){
            console.log(err);
        }
        res.status(400).end();
    }
})

/**
 * Get checkins route.
 */
app.post('/get/checkins', (req, res, next) => {
    try {
        let sourceDirectory = req.body.sourceDirectory;
        res.send(new VCS(sourceDirectory).get(2));
        res.status(200).end();
    } catch (err) {
        if(debugMode){
            console.log(err);
        }
        res.status(400).end();
    }
})

/**
 * Get checkouts route.
 */
app.post('/get/checkouts', (req, res, next) => {
    try {
        let sourceDirectory = req.body.sourceDirectory;
        res.send(new VCS(sourceDirectory).get(1));
        res.status(200).end();
    } catch (err) {
        if(debugMode){
            console.log(err);
        }
        res.status(400).end();
    }
})

/**
 * Update a manifest route.
 */
app.post('/update', (req, res, next) => {
    try {
        let sourceDirectory = req.body.sourceDirectory;
        let id = req.body.id;
        let field = req.body.field;
        let value = req.body.value
        new VCS(sourceDirectory).updateManifest(id, field, value);
        res.status(200).end();
    } catch (err) {
        if(debugMode){
            console.log(err);
        }
        res.status(400).end();
    }
})

/**
 * Get all the manifest files 
 */

app.post('/get/manifests', (req, res, next) => {
    try {
        let sourceDirectory = req.body.sourceDirectory;
        res.send(new VCS(sourceDirectory).get(3));
        res.status(200).end();

    } catch (err) {
        if(debugMode){
            console.log(err);
        }
        res.status(400).end();
    }
})

/**
 * Merge out rounte. It will return merging configuration.
 */
app.post('/mergeout', (req, res, next) => {
    try {
        let sourceDirectory = req.body.sourceDirectory;
        let targetDirectory = req.body.targetDirectory;
        let mergeData = new VCS(sourceDirectory).mergeOut(targetDirectory);
        res.send(mergeData);
        res.status(200).end();
    } catch (err) {
        if(debugMode){
            console.log(err);
        }
        res.status(400).end();
    }
})

/**
 * Merge in route. Must provide the merge configuration.
 */
app.post('/mergein', (req, res, next) => {
    try {
        let sourceDirectory = req.body.sourceDirectory;
        let targetDirectory = req.body.targetDirectory;
        let mergeData = req.body.mergeData;
        new VCS(sourceDirectory).mergeIn(targetDirectory, mergeData)
        res.status(200).end();
    } catch (err) {
        if(debugMode){
            console.log(err);
        }
        res.status(400).end();
    }
})

/**
 * Port to listen to.
 */
const port = process.env.port || 3000;
app.listen(port, () => console.log(`Listen to port ${port}`));