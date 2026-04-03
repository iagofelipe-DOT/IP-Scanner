const fastify = require('fastify')({ logger: false });
const cors = require('@fastify/cors');
const rateLimit = require('@fastify/rate-limit');
const net = require('net');

fastify.register(cors, {
    origin: 'https://project-tzws4.vercel.app' 
});

fastify.register(rateLimit, {
    max: 15, 
    timeWindow: '1 minute'
});

function scanPort(port, host) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        let status = 'Fechada';
        
        socket.setTimeout(1000);
        
        socket.on('connect', () => {
            status = 'Aberta';
            socket.destroy();
        });
        
        socket.on('timeout', () => {
            socket.destroy();
        });
        
        socket.on('error', () => {
            socket.destroy();
        });
        
        socket.on('close', () => {
            resolve({ port, status });
        });
        
        socket.connect(port, host);
    });
}
fastify.post('/api/server', async (request, reply) => {
    const { target } = request.body;
    const ports = [80, 443, 22];
    const promises = ports.map(port => scanPort(port, target));
    const results = await Promise.all(promises);
    
    return { target, results };
});

module.exports = async function handler(req, res) {
    await fastify.ready();
    fastify.server.emit('request', req, res);
};
