import { client } from "../index";
import { TextChannel, AttachmentBuilder } from "discord.js";
import fs from "fs";
import path from "path";
import logger from "../Logger/logger";

// Function to send the log file to a Discord channel
export async function sendLogFile() {
  try {
    // Path to the log file
    const logFilePath = path.join(__dirname, '../../logs/app.log');

    // Check if the log file exists
    if (!fs.existsSync(logFilePath)) {
      logger.warn('Log file does not exist.');
      return;
    }

    // Find the channel where you want to send the logs
    const channel = client.channels.cache.get(process.env.logchannel) as TextChannel;
    if (!channel) {
      logger.warn('Channel not found.');
      return;
    }

    // Create an attachment
    const logFileAttachment = new AttachmentBuilder(logFilePath, { name: 'app.log' });

    // Send the log file as an attachment
    await channel.send({
      content: 'Daily Log Report:',
      files: [logFileAttachment],
    });

    logger.info('Log file sent to Discord channel successfully.');

    // Optionally, clear the log file after sending
    fs.writeFileSync(logFilePath, '', 'utf-8');
  } catch (err) {
    logger.error('Error sending log file to Discord:', err);
  }
}



