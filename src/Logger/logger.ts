import pino from 'pino';
import fs from 'fs';
import path from 'path';

// Ensure the logs directory exists
const logDirectory = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const logger = pino({
  level: 'info',
  transport: {
    targets: [
      {
        target: 'pino/file',
        options: { destination: `${logDirectory}/app.log` },
      },
    //   {
    //     target: 'pino-pretty',
    //     options: {
	// 		colorize: true,
	// 		translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
	// 		ignore: 'pid,hostname'
	// 	},
    //   },
    ],
  },
});

export default logger;


