const http = require('http');
const PORT = process.env.PORT || 5000;

const subscribers = {};

http.createServer((request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Request-Method', '*');
  response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
  response.setHeader('Access-Control-Allow-Headers', '*');

  switch (request.url) {
    case '/subscribeToEvents':
      subscribeToEvents(request, response);
      break;
    case '/generateEvent':
      generateEvent(request, response);
      break;
    default:
      response.writeHead(404);
      response.end();
  }
}).listen(PORT);

console.log(`server running on port ${PORT}`);

function createMessage(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', data => {
      body += data;
    });

    request.on('end', () => {
      resolve(`event: notification\ndata:${body}\n\n\n`);
    });
  });
}

function subscribeToEvents(request, response) {
  const subscriberKey = Date.now();

  response.writeHead(200, {
    Connection: 'keep-alive',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache'
  });

  request.on('close', () => {
    response.end();
    delete(subscribers[subscriberKey]);
    console.log(`Client closed connection for subscriberKey ${subscriberKey}.`);
  });

  subscribers[subscriberKey] = {
    request,
    response
  };

  console.log(`Added subscriber ${subscriberKey}.`);
}

function generateEvent(request, response) {
  createMessage(request).then(message => {
    for (const subscriberKey in subscribers) {
      subscribers[subscriberKey].response.write(message);
      console.log(`Sent message to subscriber ${subscriberKey}.`);
    }

    response.write('ok');
    response.end();
    return;
  });
}
