const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const Weapon = require('./weapon');

const schema = new Schema({
    name: {
        type: String,
        required: true
    },
    rank: {
        type: String,
        default: 'crew'
    },
    crewId: {
        type: Schema.Types.ObjectId,
        ref: 'Crew'   
    },
    familiar: {
        animal: String,
        name: String
    },
    colors: [String],
    weapons: [Weapon.schema]
});

// Pirate.findByWeapon()
schema.statics.findByWeapon = function(weaponName) {
    return this.find({ 'weapons.name': weaponName });
}

schema.query.byWeapon = function(weaponName) {
    return this.find({ 'weapons.name': weaponName });
}

// pirate.someMethod()
schema.methods.addWeapon = function(name, damamge) {
    const weapon = new Weapon(name, damage);
    this.weapons.push(weapon);
}

module.exports = mongoose.model('Pirate', schema);


