require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT;

const connection = require('./db');
const { swaggerDocs } = require('./swagger');

app.use(express.json());

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    swaggerDocs(app, port);
});


// Status endpoint
/**
* @openapi
* /status:
*   get:
*     tags:
*       - Check status
*     responses:
*       200:
*         description: OK
*         content:
*           application/json:
*             schema:
*               type: string
*               properties:
*                 data:
*                   type: string
*               example:
*                 running
*       500:
*         description: Internal Server Error
*/
app.get('/status', (request, response) => {
    response.status(200).send('Running');
});


// CRUD operations

// Get all tasks
/**
* @openapi
* /tasks:
*   get:
*     tags:
*       - Get all tasks
*     responses:
*       200:
*         description: OK
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 data:
*                   type: array 
*                   items: 
*                     type: object
*               example:
*                 [{"id":1,"description":"Task 1","priority":"High","completed":0},{"id":2,"description":"Task 2","priority":"Low","completed":0},{"id":3,"description":"task 3","priority":"Medium","completed":1}]     
*       500:
*         description: Internal Server Error
*/
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
/**
* @openapi
* /tasks/{id}:
*   get:
*     tags:
*       - Get task by ID     
*     summary: Get a specific task by ID
*     description: Returns a single task object based on the provided ID
*     parameters:
*       - in: path
*         name: id
*         required: true
*         description: The ID of the task
*         type: integer
*     responses:
*       200:
*         description: Successful operation
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 id:
*                   type: integer
*                   description: The ID of the task
*                 data:
*                   type: object
*               example:
*                 [{"id": 1, "description": "Task 1", "priority": "High", "completed": 0 }]
*       404:
*         description: Task not found
*       500:
*         description: Internal Server Error
*/
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
/**
* @openapi
* /tasks/add:
*   post:
*     tags:
*       - Add a task    
*     summary: Add a task
*     description: Adds a task to the database
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               description:
*                 type: string
*                 description: The description of the task
*               priority:
*                 type: string
*                 description: The priority of the task
*             example:
*               description: Task 1
*               priority: High
*     responses:
*       201:
*         description: Task created
*         content:
*           application/json:
*             schema:
*               type: String
*               properties:
*                 data:
*                   type: string
*               example:
*                 Task created
*       500:
*         description: Internal Server Error
*/
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
/**
* @openapi
* /tasks/update/{id}:
*   put:
*     tags:
*       - Update a task    
*     summary: Update a task
*     description: Updates a task in the database based on the provided ID
*     parameters:
*       - in: path
*         name: id
*         required: true
*         description: The ID of the task
*         type: integer
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               description:
*                 type: string
*                 description: The description of the task
*               priority:
*                 type: string
*                 description: The priority of the task
*             example:
*               description: Task 1
*               priority: High
*               completed: 0
*     responses:
*       200:
*         description: Task updated
*         content:
*           application/json:
*             schema:
*               type: String
*               properties:
*                 data:
*                   type: string
*               example:
*                 Task with id 1 updated
*       404:
*         description: Task not found
*       500:
*         description: Internal Server Error
*/
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
/**
* @openapi
* /tasks/delete/{id}:
*   delete:
*     tags:
*       - Delete a task by ID     
*     summary: Delete a specific task by ID
*     description: Deletes a task from the database based on the provided ID
*     parameters:
*       - in: path
*         name: id
*         required: true
*         description: The ID of the task to delete
*         type: integer
*     responses:
*       200:
*         description: Task deleted
*         content:
*           application/json:
*             schema:
*               type: String
*               properties:
*                 data:
*                   type: string
*               example:
*                 Task with id 1 deleted
*       404:
*         description: Task not found
*       500:
*         description: Internal Server Error
*/
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
