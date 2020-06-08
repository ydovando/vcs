/**
 * @author: Sotheanith Sok, Yashua Ovando
 * @email: sotheanith.sok@student.csulb.edu, yashua.ovando@student.csulb.edu
 * @description: This module provides functionality that allows the generation
 * and updation of manifest file.  
 */

//imports 
const fs = require("fs");
const check = require("check-types");
const path = require('path');

/**This is a manifest object contains information related the distribution of artifacts of each files.*/
class Manifest {

    /**
     * The default contstructor.
     * @param {string} p Path to the location of manifest files
     */
    constructor(p) {
        //check parameters
        if (!check.nonEmptyString(p)) {
            throw new Error("Invalid path to a directory");
        }

        this._commits = [];
        this._checkins = [];
        this._checkouts = [];
        this._root = path.join(p, "../")
        this._path = path.resolve(path.join(p, "/Manifests"));
        this._pathExistcheckined = false;

        //check if folder exist
        let isExist = fs.existsSync(this._path);

        //If it exist, begin reading the files
        if (isExist) {
            let readFiles = fs.readdirSync(this._path, {
                withFileTypes: "true"
            });
            let files = readFiles.filter(item => item.isFile());
            files.forEach((file) => {
                let obj = this.readFile(file.name.slice(0, -5)); //Remove extension from files
                switch (obj.command) {
                    case "commit":
                        this._commits.push(obj.id); //Push commits item into its array
                        break;
                    case "checkin":
                        this._checkins.push(obj.id); //Push checkins item into its array
                        break;
                    case "checkout":
                        this._checkouts.push(obj.id); //Push checkouts item into its array
                        break;
                    default:
                        throw new Error("Unknown file type");
                }
            })
        }

    }

    /**
     * Create a commit.
     * @param {String} id Unique identifer for this commit.
     * @param {Array | String} values Values for this commit.
     * @param {String} author Author of this commit. (Optional)
     * @param {String} description Desciption of this commit. (Optional)
     * @param {Array | String} tag Tag for this commit. (Optional)
     */
    createCommit(id, values, author, description, tag) {
        //Parameters checking
        if (!check.nonEmptyString(id)) {
            throw new Error("Id must be a string");
        }
        if (!check.nonEmptyArray(values) && !check.nonEmptyString(values)) {
            throw new Error("Values be a non-empty string or non-empty array");
        }

        //Data formatting
        if (check.nonEmptyString(tag)) {
            tag = [tag];
        }

        //Create commit object
        let obj = {
            id: id,
            argument: this._root,
            author: (check.nonEmptyString(author)) ? author : null,
            description: (check.nonEmptyString(description)) ? description : null,
            tag: (check.nonEmptyArray(tag)) ? tag : null,
            values: (check.nonEmptyArray(values)) ? values : [values],
            created: Date.now(),
            lastUpdated: Date.now(),
            command: "commit"
        };

        this._commits.push(obj.id); //Push the new object to commits array
        this.writeFile(obj.id, obj); //Write object to storage
    }

    /**
     * Create a checkin.
     * @param {String} id Unique identifer for this checkin.
     * @param {String} source Source of this checkin.
     * @param {String} author Author of this checkin. (Optional)
     * @param {String} description Description of this checkin. (Optional)
     * @param {Array | String} tag Tag of this checkin. (Optional)
     */
    createCheckin(id, source, author, description, tag) {
        //Parameters checking
        if (!check.nonEmptyString(id)) {
            throw new Error("Id must be a string");
        }
        if (!check.nonEmptyString(source)) {
            throw new Error("Target be a non-empty string or non-empty array");
        }

        //Data formatting
        if (check.nonEmptyString(tag)) {
            tag = [tag];
        }

        //Create commit object
        let obj = {
            id: id,
            argument: {
                source: path.resolve(source),
                target: this._root
            },
            author: (check.nonEmptyString(author)) ? author : null,
            description: (check.nonEmptyString(description)) ? description : null,
            tag: (check.nonEmptyArray(tag)) ? tag : null,
            created: Date.now(),
            lastUpdated: Date.now(),
            command: "checkin"
        };

        //Check if the source has been checkout to before
        let checker = this.getCheckouts().find((element) => {
            return element.argument.target === obj.argument.source;
        })

        if (checker) {
            this._checkins.push(obj.id); //Push the new object to checkouts array
            this.writeFile(obj.id, obj); //Write object to storage
            return true;
        } else {
            return false;
        }
    }

    /**
     * Create a checkout.
     * @param {String} id Unique identifer of this checkout.
     * @param {String} target Target of this checkout.
     * @param {String} author Author of this checkout. (Optional)
     * @param {String} description Description of this checkout. (Optional)
     * @param {Array | String} tag Tag of this checkout. (Optional)
     */
    createCheckout(id, target, author, description, tag) {
        //Parameters checking
        if (!check.nonEmptyString(id)) {
            throw new Error("Id must be a string");
        }
        if (!check.nonEmptyString(target)) {
            throw new Error("Target be a non-empty string or non-empty array");
        }

        //Data formatting
        if (check.nonEmptyString(tag)) {
            tag = [tag];
        }

        //Create commit object
        let obj = {
            id: id,
            argument: {
                source: this._root,
                target: path.resolve(target)
            },
            author: (check.nonEmptyString(author)) ? author : null,
            description: (check.nonEmptyString(description)) ? description : null,
            tag: (check.nonEmptyArray(tag)) ? tag : null,
            created: Date.now(),
            lastUpdated: Date.now(),
            command: "checkout"
        };

        this._checkouts.push(obj.id); //Push the new object to checkouts array
        this.writeFile(obj.id, obj); //Write object to storage
    }

    /**
     * Update a manifest.
     * @param {String} id Unique indetifer of a commit.
     * @param {"author" | "description" | "tag" | "values"} field Field of the commit to modify.
     * @param {Array | String} value A new value of the field.
     */
    updateManifest(id, field, value) {

        let changed = false;
        //Parameter checking
        if (!check.nonEmptyString(id) || !check.nonEmptyString(field) || !(check.nonEmptyArray(value) || check.nonEmptyString(value))) {
            throw new Error("Invalid parameters");
        }

        if (!field === "author" && !field === "description" && !field === "tag" && !field === "values") {
            throw new Error("Unknown field");
        }

        if (field === "values" && this._commits.indexOf(id) <= -1) {
            throw new Error("You can't edit the value of non-commit manifest");
        }
        if (this._commits.indexOf(id) <= -1 && this._checkins.indexOf(id) <= -1 && this._checkouts.indexOf(id) <= -1) {
            throw new Error("You can't edit the value of non-commit manifest");
        }

        let obj = this.readFile(id);
        switch (field) {
            case "values":
                if (check.nonEmptyString(value)) {
                    if (check.nonEmptyArray(obj.values)) {
                        obj.values.push(value);
                        changed = true;
                    } else {
                        obj.values = [value]
                        changed = true;
                    }
                } else if (check.nonEmptyArray(value)) {
                    if (!check.nonEmptyArray(obj.values)) {
                        obj.values = [];
                    }
                    value.forEach((element) => {
                        if (check.nonEmptyString(element)) {
                            obj.values.push(element);
                            changed = true;
                        }
                    })
                }
                break;
            case "tag":
                if (check.nonEmptyString(value)) {
                    if (check.nonEmptyArray(obj.tag)) {
                        obj.tag.push(value);
                        changed = true;
                    } else {
                        obj.tag = [value]
                        changed = true;
                    }
                } else if (check.nonEmptyArray(value)) {
                    if (!check.nonEmptyArray(obj.tag)) {
                        obj.tag = [];
                    }
                    value.forEach((element) => {
                        if (check.nonEmptyString(element)) {
                            obj.tag.push(element);
                            changed = true;
                        }
                    })
                }
                break;
            default:
                if (check.nonEmptyString(value)) {
                    obj[field] = value;
                    changed = true;
                }
        }
        if (changed) {
            obj.lastUpdated = Date.now();
            this.writeFile(obj.id, obj);
        } else {

            throw new Error("Invalid parameters");
        }

    }

    /**
     * Get a manifest.
     * @param {String} id Unique identifer of a manifest.
     * @returns Manifest object.
     */
    getItem(id) {
        if (this.isItemExist(id)) {
            return this.readFile(id);
        } else {
            return undefined;
        }
    }

    /**
     * Get all commits sorted by creation date.
     */
    getCommits() {
        let temp = [];
        this._commits.forEach((e) => {
            temp.push(this.getItem(e));
        })
        temp.sort((a, b) => {
            return b.created - a.created;
        })
        return temp;
    }

    /**
     * Get all checkins sorted by creation date.
     */
    getCheckins() {
        let temp = [];
        this._checkins.forEach((e) => {
            temp.push(this.getItem(e));
        })
        temp.sort((a, b) => {
            return a.created - b.created;
        })
        return temp;
    }

    /**
     * Get all checkouts sorted by creation date.
     */
    getCheckouts() {
        let temp = [];
        this._checkouts.forEach((e) => {
            temp.push(this.getItem(e));
        })
        temp.sort((a, b) => {
            return a.created - b.created;
        })
        return temp;
    }

    /**
     * Get all manifests sorted by creation date.
     */
    getAll() {
        let temp = [];

        this._checkouts.forEach((e) => {
            temp.push(this.getItem(e));
        })

        this._checkins.forEach((e) => {
            temp.push(this.getItem(e));
        })

        this._commits.forEach((e) => {
            temp.push(this.getItem(e));
        })

        temp.sort((a, b) => {
            return a.created - b.created;
        });
        return temp;

    }

    /**
     * Check if a manifest exist.
     * @param {String} id
     * @returns True/False. 
     */
    isItemExist(id) {
        return (this._commits.indexOf(id) > -1) || (this._checkins.indexOf(id) > -1) || (this._checkouts.indexOf(id) > -1);
    }

    /**
     * Read a manifest from storage.
     * @param {String} fileName 
     * @returns Manifest object.
     */
    readFile(fileName) {
        return JSON.parse(fs.readFileSync(path.resolve(this._path, fileName + ".json")));
    }

    /**
     * Write a manifest to storage.
     * @param {String} fileName Filename. 
     * @param {Object} value Manifest object.
     */
    writeFile(fileName, value) {
        if (!this._pathExisted) {
            if (!fs.existsSync(this._path)) {
                fs.mkdirSync(this._path);
                this._pathExisted = true;
            }
        }
        fs.writeFileSync(path.join(this._path, fileName + ".json"), JSON.stringify(value, null, 4));
    }
}
module.exports = Manifest;