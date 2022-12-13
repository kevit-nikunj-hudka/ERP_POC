const Attendance = require('../models/attendance');
const Students = require('../models/student');
const Batches = require('../models/batches');
const logger = require('../services/logger');
const analytics2 = async (req, res) => {
    if (req.user.role !== 'admin') {
        throw new Error();
    }
    try {
        const batch = parseInt(req.body.batch);
        const branch = req.body.department;
        const currentSem = parseInt(req.body.currentSem);
        const date = req.body.date;

        const aggregate = await Attendance.aggregate([
            {
                '$match': {
                    'attendance.date': date,
                }
            }, {
                '$lookup': {
                    'from': 'students',

                    'let': {
                        'list': '$attendance.list'
                    },
                    'pipeline': [
                        {
                            '$match': {
                                '$and': [
                                    {
                                        'batch': batch,
                                    }, {
                                        'department': branch,
                                    }, {
                                        'currentSem': currentSem,
                                    }, {
                                        '$expr': {
                                            '$not': {
                                                '$in': [
                                                    '$name', '$$list'
                                                ]
                                            }
                                        }
                                    }
                                ]
                            }
                        }, {
                            '$project': {
                                '_id': 0,
                                'name': 1
                            }
                        }
                    ],
                    'as': 'absentees'
                }
            }, {
                '$replaceRoot': {
                    'newRoot': {
                        'absentList': '$absentees'
                    }
                }
            }
        ]);

        res.send(aggregate);
    }
    catch (e) {
        res.status(400).send();
        logger.error(e.message)
    }
}




const analytics3 = async (req, res) => {
    if (req.user.role !== 'admin') {
        throw new Error();
      }
    
      try {
        const batch = parseInt(req.body.batch);
        const branch = req.body.branch;
        const currentSem = parseInt(req.body.currentSem);
    
        const aggregate = await Students.aggregate([
          {
            '$match': {
              '$and': [
                {
                  'department': branch
                }, {
                  'currentSem': currentSem
                }, {
                  'batch': batch
                }
              ]
            }
          }, {
            '$lookup': {
              'from': 'attendances',
              'localField': 'currentSem',
              'foreignField': 'currentSem',
              'let': {
                'branch': '$department',
                'sem': '$currentSem'
              },
              'pipeline': [
                {
                  '$group': {
                    '_id': 'attendance',
                    'totalAttendance': {
                      '$count': {}
                    }
                  }
                }
              ],
              'as': 'result'
            }
          }, {
            '$unwind': {
              'path': '$result'
            }
          }, {
            '$project': {
              'name': 1,
              'totalAttendance': '$result.totalAttendance',
              'finalAttendance': {
                '$lt': [
                  {
                    '$multiply': [
                      '$result.totalAttendance', {
                        '$divide': [
                          75, 100
                        ]
                      }
                    ]
                  }, {
                    '$size': '$attendance'
                  }
                ]
              }
            }
          }, {
            '$group': {
              '_id': '$finalAttendance',
              'list': {
                '$push': '$name'
              }
            }
          },
          {
            '$match': {
              '_id': false
            }
          }, {
            '$replaceRoot': {
              'newRoot': {
                'finalList': '$list'
              }
            }
          }
        ]);
    
        res.send(aggregate);
      }
      catch (e) {
        res.status(400).send();
        logger.error(e.message)
      }
}


const analytics4 = async function(req,res){
    if (req.user.role !== 'admin') {
        throw new Error();
      }
    
      try {
        const batch = parseInt(req.body.batch);
        const department = req.body.department;
    
        const aggregate = await Batches.aggregate([
          {
            '$match': {
              'year': batch
            }
          }, {
            '$unwind': {
              'path': '$branches'
            }
          }, {
            '$lookup': {
              'from': 'students', 
              'localField': 'branches.name', 
              'foreignField': 'department', 
              'let': {
                'year': '$year', 
                'branch': '$branches.name', 
                'totalStudents': '$branches.totalStudentsIntake'
              }, 
              'pipeline': [
                {
                  '$match': {
                    '$expr': {
                      '$eq': [
                        '$batch', '$$year'
                      ]
                    }
                  }
                }, {
                  '$group': {
                    '_id': '$$branch', 
                    'totalStudents': {
                      '$count': {}
                    }
                  }
                }, {
                  '$addFields': {
                    'availableIntake': {
                      '$subtract': [
                        '$$totalStudents', '$totalStudents'
                      ]
                    }
                  }
                }
              ], 
              'as': 'result'
            }
          }, {
            '$unwind': {
              'path': '$result'
            }
          }, {
            '$project': {
              'batch': '$year', 
              'branches': {
                'k': '$result._id', 
                'v': {
                  'totalStudentsIntake': '$branches.totalStudentsIntake', 
                  'totalStudents': '$result.totalStudents', 
                  'availableIntake': '$result.availableIntake'
                }
              }
            }
          }, {
            '$group': {
              '_id': '$batch', 
              'branches': {
                '$addToSet': '$branches'
              }, 
              'totalStudents': {
                '$sum': '$branches.v.totalStudents'
              }, 
              'totalStudentsIntake': {
                '$sum': '$branches.v.totalStudentsIntake'
              }, 
              'availableIntake': {
                '$sum': '$branches.v.availableIntake'
              }
            }
          }, {
            '$replaceRoot': {
              'newRoot': {
                'batch': '$_id', 
                'totalStudents': '$totalStudents', 
                'totalStudentsIntake': '$totalStudentsIntake', 
                'availableIntake': '$availableIntake',
                'branches': {
                  '$arrayToObject': '$branches'
                }
              }
            }
          }
        ]);
        console.log(aggregate);
        res.send(aggregate);
    
    
      }
      catch (e) {
        res.status(400).send(e);
        logger.error(e.message)
      }
}

module.exports =  {analytics2, analytics3,analytics4}