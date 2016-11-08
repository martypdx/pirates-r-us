const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser').json();
const Crew = require('../models/crew');
const Pirate = require('../models/pirate');

router
    .get('/', (req, res, next) => {
        Crew.find()
            .then(crews => res.send(crews ))
            .catch(next);
    })

    .get('/:id', (req, res, next) => {
        // reference the crewId of the param
        // ( why? 1) using it twice, 2) match find key name )
        const crewId = req.params.id;

        // Dispatch both the crew find and 
        // the find of pirates for that crew
        Promise
            .all([
                // get crew data, no model needed
                Crew.findById(crewId).lean(),
                // get pirates
                Pirate
                    // only in this crew
                    .find({ crewId })
                    // limit data to name and rank
                    .select('name rank')
                    // we don't need to create a Pirate instance
                    .lean()
            ])
            .then(([crew, pirates]) => {
                // append the pirates to the crew being returned
                crew.pirates = pirates;
                res.send(crew);
            })
            .catch(next);
    })

    .delete('/:id', (req, res, next) => {
        Crew.removeById(req.params.id)
            .then(deleted => res.send(deleted ))
            .catch(next);
    })

    .post('/', bodyParser, (req, res, next) => {
        new Crew(req.body).save()
            .then(saved => res.send(saved ))
            .catch(next);
    })

    .put('/:id', bodyParser, (req, res, next) => {
        Crew.findByIdAndUpdate(req.params.id, req.body)
            .then(saved => res.send(saved))
            .catch(next);
    })

    .put('/:crewId/pirates/:pirateId', bodyParser, (req, res, next) => {
        Pirate.findById(req.params.pirateId)
            .then(pirate => {
                pirate.crewId = req.params.crewId;
                return pirate.save();
            })
            .then(pirate => res.send(pirate))
            .catch(next);
    });

module.exports = router;