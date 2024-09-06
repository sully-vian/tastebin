// model to tell what our database looks like
const mongoose = require("mongoose");

// define the type of data to store
const documentScheme = new mongoose.Schema({
    value: {
        type: String,
        required: true
    }
})

// create a new model in monngoose.
// "Document" is the name of the model and documentScheme is the scheme definition for the model
module.exports = mongoose.model("Document", documentScheme);