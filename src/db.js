const myqls = require('mysql');

const connection = myqls.createConnection({
    host: 'localhost',
    user: 'api',
    password: '1234',
    database: 'tasksapi'
});

connection.connect((error) => {
    if (error) {
        console.error('Error connecting to database: ', error);
    } else {
        console.log('Connected to database');
    }
});

module.exports = connection;