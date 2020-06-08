/**
 * @author: Anthony Martinez, Sotheanith Sok, Yashua Ovando
 * @email: anthony.martinez02@student.csulb.edu, sotheanith.sok@student.csulb.edu, yashua.ovando@student.csulb.edu
 * @description: This module contains the implementation of version control system functinoalities 
 * including intitalization, commit, and so on. It uses functionalities provided by the manifest and ArtifactIdService moduels.
 */


// Required modules
const fs = require('fs'); // source: https://nodejs.org/api/fs.html
const artifactIdService = require('./ArtifactIdService'); // For generating ArtifactId of file
const manifest = require('./manifest'); // For tracking
const crypto = require('crypto'); // Generating commit Id
const path = require('path'); //use to resolve and normalize path to an absolute value

/**
 * @description: Initialization method. 
 *               Creates vcs hidden subdirectory for tracking changes
 *               Copies main directory contents into vcs and creates artifact structure
 */
VCS.prototype.init = function () {
    if(!fs.existsSync(this.sourceRoot)){
        throw new Error('Directory doesn\'t exist.')
    }
    fs.readdir(this.sourceRoot, {
        withFileTypes: true
    }, (error, directoryContents) => {
        // TODO: Implement some error handling
        if (error) {
            throw error;
        }

        if (directoryContents.find((file) => file.name === this.vcsFileName)) {
            console.error('Init failed: This directory has already been initialized.');
        } else {
            console.log('Initializing repository...');

            const targetRoot = this.sourceRoot + '/' + this.vcsFileName;

            fs.mkdir(targetRoot, (error) => {
                // TODO: Implement some error handling
                if (error) {
                    throw error;
                }

                this.breadthFirstTraverse(this.sourceRoot, targetRoot, true);
            });
        }
    });
};

/**
 * @description: Commit method. 
 *               Creates vcs hidden subdirectory for tracking changes
 */
VCS.prototype.commit = function () {
    if(!fs.existsSync(this.sourceRoot)){
        throw new Error('Directory doesn\'t exist.')
    }
    fs.readdir(this.sourceRoot, {
        withFileTypes: true
    }, (error, directoryContents) => {
        // TODO: Implement some error handling
        if (error) {
            throw error;
        }

        if (!directoryContents.find((file) => file.name === this.vcsFileName)) {
            console.error('Commit failed: Directory has not been initialized.');
        } else {
            console.log('Committing changes...');

            this.breadthFirstTraverse(this.sourceRoot, this.sourceRoot + '/' + this.vcsFileName, false);
        }
    });
};


/**
 * Default constructor of VCS
 * @param {String} sourceRoot the source directory
 */
function VCS(sourceRoot) {
    this.sourceRoot = sourceRoot;
    this.vcsFileName = '.psa'; // VSC file [target] name
    this.manifest = new manifest(this.sourceRoot + '/' + this.vcsFileName + '/');
    this.commitId = crypto.randomBytes(8).toString('hex');

    /**
     * @description: Implements simplified Breadth-first search recursive 
     *               algorithm to traverse project tree
     *               - Initial traversal through project tree (no .git/.vsc subdirectory)
     *                 meathod will create subdirectory [target] and replicate contents of 
     *                 source into it replacing files with artifact structures
     *               - For commits, meathod looks for .git/.vcs subdirectory to use as target
     * @param: sourceRoot - path to source directory root
     * @param: targetRoot - path to target directory root
     * @param: fullCopy - if true, copy the entire structure of source to target.
     *                    Otherwise only the creates an artifact 
     * Source: https://en.wikipedia.org/wiki/Breadth-first_search
     */
    this.breadthFirstTraverse = function (sourceRoot, targetRoot, fullCopy) {
        console.log('sourceRoot: ' + sourceRoot);
        console.log('targetRoot: ' + targetRoot);

        // Assume top level root is a directory
        // Can ensure all subsequent calls will be made on directories 
        // thanks to fs.readdir option parameter which can help 
        // get file types along with contents.
        if(!fs.existsSync(sourceRoot)){
            throw new Error("Directory does not exist.")
        }
        fs.readdir(sourceRoot, {
            withFileTypes: true
        }, (error, directoryContents) => {
            // TODO: Implement some error handling
            if (error) {
                throw error;
            }

            directoryContents.forEach((fileOrDirectory) => {
                console.log('fileOrDirectory: ' + fileOrDirectory.name);

                // Ignore system files
                if (!fileOrDirectory.name.startsWith('.')) {
                    // Assume file can be one of two things
                    // A file, or a directory.
                    if (fileOrDirectory.isDirectory()) {
                        console.log('directory: ' + fileOrDirectory.name);

                        const source = sourceRoot + '/' + fileOrDirectory.name;
                        const target = targetRoot + '/' + fileOrDirectory.name;

                        if (fullCopy) {
                            fs.mkdir(target, (error) => {
                                // TODO: Implement some error handling
                                if (error) {
                                    throw error;
                                }

                                this.breadthFirstTraverse(source, target, fullCopy);
                            });
                        } else {
                            this.breadthFirstTraverse(source, target, fullCopy);
                        }
                    } else {
                        console.log('file: ' + fileOrDirectory.name);

                        const fileName = fileOrDirectory.name; // Remove file extension
                        const sourceFile = sourceRoot + '/' + fileOrDirectory.name;
                        const targetDirectory = targetRoot + '/' + fileName;
                        const targetArtifact = targetRoot + '/' + fileName + '/' + artifactIdService.artifactID(sourceFile) + '.txt'; // Build artifactId

                        if (this.manifest.isItemExist(this.commitId)) {
                            this.manifest.updateManifest(this.commitId, "values", path.resolve(targetArtifact));
                        } else {
                            this.manifest.createCommit(this.commitId, path.resolve(targetArtifact))
                        }

                        if (!fs.existsSync(targetDirectory)) {
                            // Create directory with name of file
                            fs.mkdir(targetDirectory, (error) => {
                                // TODO: Implement some error handling
                                if (error) {
                                    throw error;
                                }

                                // Move file into new directory
                                // Replace file name with artifactId    
                                fs.copyFile(sourceFile, targetArtifact, fs.constants.COPYFILE_EXCL, (error) => {
                                    // TODO: Implement some error handling
                                    if (error) {
                                        throw error;
                                    }
                                });
                            });
                        } else {
                            fs.access(targetArtifact, (isFileDNE) => {
                                if (isFileDNE) {
                                    // Move file into new directory
                                    // Replace file name with artifactId    
                                    fs.copyFile(sourceFile, targetArtifact, fs.constants.COPYFILE_EXCL, (error) => {
                                        // TODO: Implement some error handling
                                        if (error) {
                                            throw error;
                                        }
                                    });
                                } else {
                                    console.log('Target Artifact already exists for this version of source: ' + sourceFile + '. No new artifact will be created for this file.');
                                }
                            });
                        }
                    }
                }
            });
        });
    }

}

/**
 * @description: Checkout a repository. 
 *               Clone files from the source directory to the target directory.
 *               Create checkout manifest in the source directory..
 * @param {String} targetRoot The target directory
 */
VCS.prototype.checkout = function (targetRoot) {

    //Prevent same directory checkin
    if (path.resolve(targetRoot) === path.resolve(this.sourceRoot)) {
        throw new Error("Can't checkin to the same folder.")
    }

    /**
     * Clone directory. It will only copy files do not exist in the target directory. 
     * @param {String} sourceRoot Source directory
     * @param {String} targetRoot Target directory
     */
    let cloneDirectory = function (sourceRoot, targetRoot) {

        if(!fs.existsSync(sourceRoot)){
            throw new Error("Directory does not exist.")
        }
        if(!fs.existsSync(targetRoot)){
            throw new Error("Directory does not exist.")
        }

        //Read a directory
        fs.readdir(sourceRoot, {
            withFileTypes: true
        }, (err, files) => {
            if (err) {
                console.log(err);
            } else {

                //Filter files
                let filteredFiles = files.filter((value) => {
                    return value.name.charAt(0) != ".";
                })

                //Start copying
                filteredFiles.forEach((value) => {
                    if (value.isDirectory()) {
                        if (!fs.existsSync(path.join(targetRoot, value.name))) {
                            fs.mkdirSync(path.join(targetRoot, value.name));
                        }
                        cloneDirectory(path.join(sourceRoot, value.name), path.join(targetRoot, value.name));
                    } else {
                        fs.copyFileSync(path.join(sourceRoot, value.name), path.join(targetRoot, value.name));
                    }
                })
            }
        })
    }

    this.manifest.createCheckout(this.commitId, targetRoot); //Create checkout manifest
    cloneDirectory(this.sourceRoot, targetRoot); //Start cloning
    new VCS(targetRoot).init(); //Initalize the target directory
}

/**
 * @description: Checkin a repository. 
 *               Clone files from the source directory to the target directory.
 *               Create checkout manifest in the source directory..
 * @param {String} sourceRoot The source directory
 */
VCS.prototype.checkin = function (sourceRoot) {

    //Prevent same directory checkin
    if (path.resolve(sourceRoot) === path.resolve(this.sourceRoot)) {
        throw new Error("Can't checkin to the same folder.")
    }

    if(!fs.existsSync(sourceRoot)){
        throw new Error("Directory does not exist.")
    }

    /**
     * Clone directory. It will only copy files do not exist in the target directory. 
     * @param {String} sourceRoot Source directory
     * @param {String} targetRoot Target directory
     */
    let cloneDirectory = function (sourceRoot, targetRoot) {
        //Read a directory
        fs.readdir(sourceRoot, {
            withFileTypes: true
        }, (err, files) => {
            if (err) {
                console.log(err);
            } else {

                //Filter files
                let filteredFiles = files.filter((value) => {
                    return value.name.charAt(0) != ".";
                })

                //Start copying
                filteredFiles.forEach((value) => {
                    if (value.isDirectory()) {
                        if (!fs.existsSync(path.join(targetRoot, value.name))) {
                            fs.mkdirSync(path.join(targetRoot, value.name));
                        }
                        cloneDirectory(path.join(sourceRoot, value.name), path.join(targetRoot, value.name));
                    } else {
                        fs.copyFileSync(path.join(sourceRoot, value.name), path.join(targetRoot, value.name));
                    }
                })
            }
        })
    }

    let result = this.manifest.createCheckin(this.commitId, sourceRoot); //Create checkout manifest
    if (result === true) {
        cloneDirectory(sourceRoot, this.sourceRoot); //Start cloning
        new VCS(this.sourceRoot).commit(); //Initalize the target directory
    }
}

/**
 * @description: Get manifests by type. Sorted by creation date. 
 * @param {Number} option 0 for commits, 1 for checkouts, 2 for checkins, and 3 for all.
 */
VCS.prototype.get = function (option) {
    switch (option) {
        case 0:
            return this.manifest.getCommits();
        case 1:
            return this.manifest.getCheckouts();
        case 2:
            return this.manifest.getCheckins();
        case 3:
            return this.manifest.getAll();
        default:
            return;
    }
}

/**
 * @description: Update a commit. 
 * @param {String} id Unique identifier of a commit.
 * @param {String} field  Field to modifiy. It can be "author", "description", "tag", and "value"
 * @param {Array | String} value New value to go into the above field.
 */
VCS.prototype.updateManifest = function (id, field, value) {
    this.manifest.updateManifest(id, field, value);
}

/**
 * @description: Perform a merge out by gathering necessary information for merging.
 * @param target the target directory which to merge into this source
 */
VCS.prototype.mergeOut = function (target) {

    //Finding manifests of granparent, source, target
    removeDirectory(path.join(this.sourceRoot, ".psa/.mergeSpace"));
    let sourceManifests = this.manifest.getAll();
    let targetManifests = new VCS(target).manifest.getAll();
    let latestSourceManifest = sourceManifests.reverse().find(e => {
        return e.command === "commit";
    });
    let latestTargetManifest = targetManifests.reverse().find(e => {
        return e.command === "commit";
    });
    let index = -1;
    let c = sourceManifests.find((e, i) => {
        if ((e.command === "checkin" || e.command === "checkout") && (e.argument.source === path.resolve(target) || e.argument.target === path.resolve(target))) {
            index = i;
            return e;
        }
    })
    if (index === -1) {
        throw new Error("Grandparent manifest can't be found.")
    }
    let grandparentManifest = (c.command === "checkin") ? sourceManifests[index - 1] : sourceManifests[index + 1];

    if(c.command==='checkin'){
        for (let i =index; i>=0;i--){
            if(sourceManifests[i].command==="commit"){
                grandparentManifest=sourceManifests[i];
                break;
            }
        }
    }else{
        for (let i =index; i<sourceManifests.length;i++){
            if(sourceManifests[i].command==="commit"){
                grandparentManifest=sourceManifests[i];
                break;
            }
        }
    }

    if(latestTargetManifest===undefined || latestSourceManifest ===undefined || grandparentManifest ===undefined){
        throw new Error ('Unable to find neccessary manifests.');
    }


    //Copy manifests related to the above manifests
    grandparentManifest.values.forEach((sourceFile, index) => {
        let parsedPath = path.parse(sourceFile);
        let targetDir = path.normalize(path.join(this.sourceRoot, ".psa/.mergeSpace/", parsedPath.dir.split(".psa")[1]));
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, {
                recursive: true
            });
        }
        fs.copyFileSync(sourceFile, path.join(targetDir, parsedPath.name + "_MG" + parsedPath.ext));
    })

    latestSourceManifest.values.forEach((sourceFile, index) => {
        let parsedPath = path.parse(sourceFile);
        let targetDir = path.normalize(path.join(this.sourceRoot, ".psa/.mergeSpace/", parsedPath.dir.split(".psa")[1]));
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, {
                recursive: true
            });
        }
        fs.copyFileSync(sourceFile, path.join(targetDir, parsedPath.name + "_MR" + parsedPath.ext));
    })

    latestTargetManifest.values.forEach((sourceFile, index) => {
        let parsedPath = path.parse(sourceFile);
        let targetDir = path.normalize(path.join(this.sourceRoot, ".psa/.mergeSpace/", parsedPath.dir.split(".psa")[1]));
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, {
                recursive: true
            });
        }
        fs.copyFileSync(sourceFile, path.join(targetDir, parsedPath.name + "_MT" + parsedPath.ext));
    })


    //Generate merge documents
    let mergesData = []

    function formMergeData(p) {
        if(!fs.existsSync(p)){
            throw new Error("Directory does not exist.")
        }
        let files = fs.readdirSync(p, {
            withFileTypes: true
        });


        let mergeFragments = files.filter(value => value.isFile());

        let temp = {}

        mergeFragments.forEach(value => {
            let fileData = path.parse(path.join(p, value.name))
            if (fileData.name.endsWith("_MG")) {
                temp.fileGrandparent = path.join(p, value.name)
            } else if (fileData.name.endsWith("_MR")) {
                temp.fileSource = path.join(p, value.name);
            } else if (fileData.name.endsWith("_MT")) {
                temp.fileTarget = path.join(p, value.name);
            }
        })

        let nameOfFileGrandpranet = (temp.fileGrandparent != undefined) ? path.parse(temp.fileGrandparent).name : String(undefined);
        let nameOfFileSource = (temp.fileSource != undefined) ? path.parse(temp.fileSource).name : String(undefined);
        let nameOfFileTarget = (temp.fileTarget != undefined) ? path.parse(temp.fileTarget).name : String(undefined);


        if (nameOfFileSource.toString().substring(0, nameOfFileSource.length - 3) !== nameOfFileTarget.toString().substring(0, nameOfFileTarget.length - 3)) {

            if (nameOfFileGrandpranet.toString().substring(0, nameOfFileGrandpranet.length - 3) === nameOfFileSource.toString().substring(0, nameOfFileSource.length - 3)) {
                let mergeType = "Target"
                if (temp.fileTarget === undefined) {
                    mergeType += "-Remove"
                } else if (temp.fileSource === undefined) {
                    mergeType += "-Add"
                } else {
                    mergeType += "-Update"
                }

                mergesData.push({
                    mergeType: mergeType,
                    source: (temp.fileSource) ? temp.fileSource : null,
                    target: (temp.fileTarget) ? temp.fileTarget : null,
                    choice: "Target"
                })
            } else if (nameOfFileGrandpranet.toString().substring(0, nameOfFileGrandpranet.length - 3) === nameOfFileTarget.toString().substring(0, nameOfFileTarget.length - 3)) {
                let mergeType = "Source"
                if (temp.fileSource === undefined) {
                    mergeType += "-Remove"
                } else if (temp.fileTarget === undefined) {
                    mergeType += "-Add"
                } else {
                    mergeType += "-Update"
                }

                mergesData.push({
                    mergeType: mergeType,
                    source: (temp.fileSource) ? temp.fileSource : null,
                    target: (temp.fileTarget) ? temp.fileTarget : null,
                    choice: "Source"
                })
            } else {
                mergesData.push({
                    mergeType: "Conflict",
                    source: (temp.fileSource) ? temp.fileSource : null,
                    target: (temp.fileTarget) ? temp.fileTarget : null,
                    choice: null

                })
            }
        }

        //Nested down the directory
        let directories = files.filter(value => value.isDirectory());
        directories.forEach(value => formMergeData(path.join(p, value.name)))
    }
    formMergeData(path.join(this.sourceRoot, ".psa/.mergeSpace/"))

    fs.writeFileSync(path.join(this.sourceRoot, ".psa/.mergeSpace/MergeData.json"), JSON.stringify(mergesData, null, 4), {
        recursive: true
    });
    return mergesData
}

/**
 * @description Given that the mergeData provided is correct, perform a merge in function
 * @param {String} target the target directory in which to merge into this source.
 * @param {Object} mergeData the merge configuration
 */
VCS.prototype.mergeIn = function (target, mergeData) {
    //let mergeData = JSON.parse(fs.readFileSync(path.join(this.sourceRoot, ".psa/.mergeSpace/MergeData.json")));

    mergeData.forEach((value) => {
        let hasMergeTypeExist = value.mergeType.split('-')[0] === "Conflict" || value.mergeType.split('-')[0] === "Source" || value.mergeType.split('-')[0] === "Target";
        let hasSource = (value.source === null) ? true : fs.existsSync(value.source);
        let hasTarget = (value.target === null) ? true : fs.existsSync(value.target);
        let hasChoice = value.choice === "Source" || value.choice === "Target";

        if (!hasMergeTypeExist || !hasSource || !hasTarget || !hasChoice) {
            throw new Error("Incomplete merge data");
        }


        if (value.choice === "Target") {
            if (value.target === null) {
                let destination = path.parse(path.join(...(path.join(...value.source.split(".psa"))).split(".mergeSpace"))).dir;
                fs.unlinkSync(destination);
            } else {
                let destination = path.parse(path.join(...(path.join(...value.target.split(".psa"))).split(".mergeSpace"))).dir;
                fs.copyFileSync(value.target, destination);
            }
        }
    })

    removeDirectory(path.join(this.sourceRoot, ".psa/.mergeSpace"));
    new VCS(this.sourceRoot).commit()
}

/**
 * Recursively remove everything in a directory
 * @param {String} directory directory to remove
 */
let removeDirectory = (directory) => {
    
    if (fs.existsSync(directory)) {
        let directoryContent = fs.readdirSync(directory, {
            withFileTypes: true
        });
        directoryContent.forEach(content => {
            if (content.isFile()) {
                fs.unlinkSync(path.join(directory, content.name))
            } else {
                removeDirectory(path.join(directory, content.name))
            }
        })
        fs.rmdirSync(directory);
    }
}
module.exports = VCS;