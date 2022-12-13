// Modules
const express = require('express');
const {analytics2, analytics3, analytics4} = require('../helper/department');
const auth = require('../middleware/auth');
const Attendance = require('../models/attendance');
const Batches = require('../models/batches');
const Students = require('../models/student');
const logger = require('../services/logger');
const router = new express.Router();

// POST METHOD - ADD Department data
router.post('/batches', auth, async function (req, res) {

  if (req.user.role !== 'admin') {
    throw new Error();
  }

  const batch = new Batches(req.body);
  try {
    await batch.save();
    res.status(201).send({ batch })
  }
  catch (e) {
    res.status(400).send()
    logger.error(e.message);
  }
})


// get analytic data - 1
router.get('/batches/analytics1', auth, async function (req, res) {

  if (req.user.role !== 'admin') {
    throw new Error();
  }

  try {
    const aggregate = await Students.aggregate([
      {
        '$group': {
          '_id': {
            'branch': '$department',
            'year': '$batch'
          },
          'StudentPerBranch': {
            '$count': {}
          }
        }
      }, {
        '$group': {
          '_id': '$_id.year',
          'branches': {
            '$push': {
              'k': '$_id.branch',
              'v': '$StudentPerBranch'
            }
          },
          'totalStudents': {
            '$sum': '$StudentPerBranch'
          }
        }
      }, {
        '$project': {
          '_id': 0,
          'year': '$_id',
          'branches': {
            '$arrayToObject': '$branches'
          },
          'totalStudents': 1
        }
      }, {
        '$sort': {
          '_id': -1
        }
      }, {
        '$replaceRoot': {
          'newRoot': {
            'year': '$year',
            'totalStudents': '$totalStudents',
            'branches': '$branches'
          }
        }
      }
    ]);

    res.send(aggregate);

  } catch (e) {
    res.status(400).send(e)
    logger.error(e.message)
  }

})

// get analytic data - 2
router.get('/students/analytics2', auth, analytics2)

// get analytic data - 3
router.get('/students/analytics3', auth, analytics3)


// get analytic data - 4
router.get('/students/analytics4', auth, analytics4)

// Export Department Router 
module.exports = router;