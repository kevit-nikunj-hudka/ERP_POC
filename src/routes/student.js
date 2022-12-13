// Modules
const express = require('express');
const Students = require('../models/student');
const Attendance = require('../models/attendance');
const auth = require('../middleware/auth');
const router = new express.Router();

// Add students
router.post('/students', auth, async function (req, res) {

    const student = new Students({
        ...req.body,
        staffId: req.user._id
    })
    try {
        await student.save();
        res.status(201).send({ student });
    } catch (e) {
        res.status(400).send(e);
    }

})

// Get all students data
// router.get('/students/data', auth, async function (req, res) {
//     const match = {};
//     try {
//         await req.admin.populate({
//             path: 'students',
//             match
//         });
//         res.send(req.admin.students)
//     } catch (e) {
//         res.send(e)
//     }
// })

// GET METHOD - READ students with given params
// Get student data by params
router.get('/student/data', auth, async function (req, res) {

    if (req.user.role !== 'admin') {
        res.status(400).send("Login as Admin")
    }

    const studentQuery = req.query;
    try {
        const student = await Students.find(studentQuery)
        if (!student) {
            return res.status(404).send();
        }
        res.send(student)
    } catch (e) {
        res.status(500).send()
    }
})


// PATCH METHOD - UPDATE one student data at a time
// Update students data finding by name and department parameters
router.patch('/student/update', auth, async function (req, res) {
    if (req.user.role !== 'admin') {
        res.status(400).send("Login as Admin")
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'department', 'currentSem', 'batch', 'contact'];
    const isValid = updates.every((update) => allowedUpdates.includes(update));

    if (!isValid) {
        res.status(400).send('Invalid Updates!')
    }

    try {
        const student = await Students.findOne(req.query);

        if (!student) {
            res.status(404).send();
        }

        updates.forEach((update) => student[update] = req.body[update]);
        await student.save();
        res.send(student);

    } catch (e) {
        res.status(400).send(e);
    }
});

// Delete student from collection
router.delete('/student/delete', auth, async function (req, res) {

    if(req.user.role !== 'admin')
    {
        res.status(400).send("Cannot delete admin.")
    }
    try {
        const student = await Students.findOneAndDelete(req.query);
        res.send(student)
    } catch(e)
    {
        res.status(400).send(e)
    }
    
})

// Student Attendance-------------------------------------------------------------------------
router.post('/student/attendance', auth, async function (req, res) {
    try {
        const attendanceDoc = req.body;
        const attend = new Attendance(req.body);
        const date = attendanceDoc.attendance.date;
        // console.log(attendanceDoc.attendance[0].list)
        
        for (let studentname of attendanceDoc.attendance.list) {

            const query = {
                name: studentname,
                department: attendanceDoc.department,
                currentSem: attendanceDoc.currentSem
            }

            const student = await Students.findOne(query);
            await Students.updateOne(student, { $push: { attendance: date } }, { new: true });
        }
        attend.save()
        
        res.send('Attendance filled');

    } catch (err) {
        res.status(400).send("Unable to find data. Please re-check!")
    }
})

// Export Student-Route Module
module.exports = router;