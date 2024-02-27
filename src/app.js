const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const connection = require('./db');

app.use(express.json());

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


// Status endpoint
app.get('/status', (request, response) => {
    response.status(200).send('Running');
});


// CRUD operations

// Get all tasks
app.get('/tasks', async (request, response) => {
    try {
        const tasks = await new Promise((resolve, reject) => {
            const query = 'SELECT * FROM tasks';
            connection.query(query, (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                console.log('Tasks retrieved:', result);
                resolve(result);
            });
        });
    
        response.status(200).json(tasks);
    } catch (error) {
        console.error('Error:', error);
        response.status(500).send('An error occurred while retrieving tasks');
    }
    
});


// Get a task by id
app.get('/tasks/:id', async (request, response) => {
    try {
        const taskId = request.params.id;

        const task = await new Promise((resolve, reject) => {
            const query = 'SELECT * FROM tasks WHERE id = ?';
            connection.query(query, [taskId], (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                if (!result.length) {
                    response.status(404).send('Task not found');
                    return;
                }

                console.log('Task retrieved:', result[0]);
                resolve(result[0]);
            });
        });
    
        response.status(200).json(task);
    } catch (error) {
        console.error('Error:', error);
        response.status(500).send('An error occurred while retrieving tasks');
    }
    
});


// Add a task
app.post('/tasks/add', async (request, response) => {
    try {
        const taskData = request.body; // Extraer datos de la solicitud

        await new Promise((resolve, reject) => {
            const query = 'INSERT INTO tasks (description, priority) VALUES (?, ?)';
            connection.query(query, [taskData.description, taskData.priority], (error, result) => {
                if (error) {
                reject(error);
                return;
                }

                resolve();
            });
        });

        response.status(201).send('Task created');
    } catch (error) {
        console.error('Error creating task:', error);
        response.status(500).send('Internal Server Error');
    }
});


// Update a task
app.put('/tasks/update/:id', async (request, response) => {
    try {
        const taskId = request.params.id;
        const taskData = request.body;

        const task = await new Promise((resolve, reject) => {
            const query = 'UPDATE tasks SET description = ?, priority = ?, completed = ? WHERE id = ?';
            connection.query(query, [taskData.description, taskData.priority, taskData.completed, taskId], (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                if (!result.affectedRows) {
                    response.status(404).send('Task not found');
                    return;
                }

                resolve();
            });
        });

        response.status(200).send(`Task with id: ${taskId} updated`);
    } catch (error) {
        console.error('Error updating task:', error);
        response.status(500).send('Internal Server Error');
    }

});


// Delete a task
app.delete('/tasks/delete/:id', async (request, response) => {
    try {
        const taskId = request.params.id;

        await new Promise((resolve, reject) => {
            const query = 'DELETE FROM tasks WHERE id = ?';
            connection.query(query, [taskId], (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                if (!result.affectedRows) {
                    response.status(404).send('Task not found');
                    return;
                }

                resolve();
            });
        });

        response.status(200).send(`Task with id: ${taskId} deleted`);
    } catch (error) {
        console.error('Error deleting task:', error);
        response.status(500).send('Internal Server Error');
    }

});
