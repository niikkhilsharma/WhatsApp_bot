"use strict";
import { Configuration, OpenAIApi } from "openai";
import qrcode from "qrcode-terminal";
import { Client } from "whatsapp-web.js";
import dotenv from "dotenv";
dotenv.config();

// WhatsApp Web-js
const client = new Client();

client.initialize();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

// Open AI
const configuration = new Configuration({
  organization: "org-vqMW8Y0PsIKbjv8gkLxkEyZO",
  apiKey: process.env.SECRET_KEY,
});

const openai = new OpenAIApi(configuration);

client.on("message", async (message) => {
  console.log(`message = ${message.body}`);
  if (message.body.trim().length === 0) {
    console.log(message.body);
    console.log("No idea where this message came from");
  } else {
    try {
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: message.body,
          },
        ],
      });

      // Send the response back to the user)
      if (message.reply.length >= 400) {
        //when reply length is too large
        const completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: `${message.body} in short`,
            },
          ],
        });
        await message.reply(completion.data.choices[0].message.content);
      } else {
        await message.reply(completion.data.choices[0].message.content);
        console.log(`Reply = `, completion.data.choices[0].message.content);
        console.log(
          `completion.data.choices[0] = `,
          completion.data.choices[0].message.content
        );
      }
    } catch (error) {
      console.error(error);
    }
  }
});
