require('dotenv').config()
const express = require('express');
require('./db/mongoose');
const staffRouter = require('./routes/staff');
const studentRouter = require('./routes/student');
const departmentRouter = require('./routes/department')
const logger  = require('./services/logger')

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(staffRouter);
app.use(studentRouter);
app.use(departmentRouter);

app.listen(port, function () {
    logger.info(`Server is up on port ${port}`);
})