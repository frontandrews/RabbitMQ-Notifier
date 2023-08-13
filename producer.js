const express = require('express');
const amqp = require('amqplib/callback_api');

const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

amqp.connect('amqp://localhost', (error, connection) => {
    if (error) throw error;

    connection.createChannel((error1, channel) => {
        if (error1) throw error1;

        app.post('/send-notification', (req, res) => {
            const notification = req.body;
            const queue = 'notifications';

            channel.assertQueue(queue, { durable: false });
            channel.sendToQueue(queue, Buffer.from(JSON.stringify(notification)));

            res.json({ message: 'Notification sent!' });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Producer running at http://localhost:${PORT}`);
});