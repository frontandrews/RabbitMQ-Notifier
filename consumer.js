const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const amqp = require('amqplib/callback_api');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = 4000;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

amqp.connect('amqp://localhost', (error, connection) => {
    if (error) throw error;

    connection.createChannel((error1, channel) => {
        if (error1) throw error1;

        const queue = 'notifications';

        channel.assertQueue(queue, { durable: false });

        console.log("Waiting for messages in %s. To exit press CTRL+C", queue);

        channel.consume(queue, (msg) => {
            console.log('Received Message from Queue:', msg.content.toString());
            const notification = msg.content.toString();
            io.emit('new-notification', notification);  // Sending the notification to all connected clients
        }, { noAck: true });
    });
});

server.listen(PORT, () => {
    console.log(`Consumer with WebSocket running at http://localhost:${PORT}`);
});
