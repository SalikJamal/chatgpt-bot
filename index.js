require('dotenv').config()
const { Client, IntentsBitField } = require('discord.js')
const { OpenAI } = require('openai')

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ]
})

client.on('ready', () => {
    console.log('Bot is online')
})

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

client.on('messageCreate', async message => {
    if(message.author.bot) return
    if(message.channelId !== process.env.CHANNEL_ID) return
    if(message.content.startsWith('!')) return
    if(message.content.startsWith('@')) return

    let conversationLog = [{ role: 'system', content: 'You are a friendly chatbot.'}]

    await message.channel.sendTyping()

    let prevMessages = await message.channel.messages.fetch({ limit: 15 })
    prevMessages.reverse()

    prevMessages.forEach(msg => {
        if(message.content.startsWith('!')) return
        if(msg.author.id !== client.user.id && message.author.bot) return
        if(msg.author.id !== message.author.id) return

        conversationLog.push({
            role: 'user',
            content: msg.content
        })
    })

    const result = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: conversationLog
    })

    message.reply(result.data.choices[0].message)

})

client.login(process.env.DISCORD_BOT_TOKEN)