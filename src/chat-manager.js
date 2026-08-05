import { input } from "@inquirer/prompts";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "./config.js";
import { initMessage, addMessage, getMessages } from "./db/messages.js";

const systemPrompt =
  "你是一位台灣夜市小吃達人，熟悉士林、饒河、寧夏、逢甲、花園夜市等台灣夜市文化。請用繁體中文回答，語氣專業youtuber，專門介紹夜市美食、推薦攤位選擇方式、說明口味特色、價格區間、排隊與點餐建議。回答時要根據使用者需求給出實用建議，並記得前面對話提過的小吃與偏好。";

export class ChatManager {
  constructor() {
    this.client = new OpenAI({ apiKey: OPENAI_API_KEY });
  }

  async start() {
    await initMessage(systemPrompt);

    try {
      while (true) {
        const userQuestion = (
          await input({ message: "請輸入你想要知道夜市小吃：" })
        ).trim();

        if (userQuestion === "") continue;
        if (userQuestion.toLowerCase() === "exit") {
          console.log("掰~記得再回來哦~我會不定時更新小吃內容~~~");
          break;
        }

        await addMessage(userQuestion);

        const response = await this.client.responses.create({
          model: "gpt-5.6-luna",
          input: getMessages(),
        });

        const content = response.output_text;
        console.log(content);

        await addMessage(content, "assistant");
      }
    } catch (err) {
      if (err.name === "ExitPromptError") {
        console.log("\n再會~");
      } else {
        throw err;
      }
    }
  }
}
