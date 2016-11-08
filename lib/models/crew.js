const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

const schema = new Schema({
    name: {
        type: String,
        required: true
    },
    flag: {
        type: String
    },
    // ship: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Ship'
    // },
    // treasures: [{
    //     type: Schema.Types.ObjectId,
    //     ref: 'Treasure'
    // }]
});

module.exports = mongoose.model('Crew', schema);