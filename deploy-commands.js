require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
// Pega os arquivos de comando da pasta commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[AVISO] O comando em ${filePath} está faltando uma propriedade "data" ou "execute" necessária para ser um Slash Command.`);
    }
}

// Seu token do bot e IDs
const CLIENT_ID = process.env.CLIENT_ID; // Você precisará adicionar CLIENT_ID ao seu .env
const GUILD_ID = '1392181578641309746'; // <--- SUBSTITUA PELO ID DO SEU SERVIDOR!
const TOKEN = process.env.DISCORD_TOKEN;

// Constrói e registra os comandos slash
const rest = new REST().setToken(TOKEN);

(async () => {
    try {
        console.log(`Iniciando o registro de ${commands.length} comandos de aplicação (/) .`);

        // O Routes.applicationGuildCommands registra comandos APENAS PARA UM SERVIDOR.
        // Para comandos globais (disponíveis em todos os servidores do bot), use Routes.applicationCommands
        const data = await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands },
        );

        console.log(`Comandos de aplicação (/) registrados com sucesso: ${data.length}`);
    } catch (error) {
        console.error('Erro ao registrar comandos de aplicação:', error);
    }
})();