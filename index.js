require('dotenv').config();
const {
    Client,
    GatewayIntentBits,
    Partials,
    Collection,
    EmbedBuilder,
    ModalBuilder,          // Importado para uso nos eventos (embora agora venha de utils)
    TextInputBuilder,      // Importado para uso nos eventos (embora agora venha de utils)
    TextInputStyle,        // Importado para uso nos eventos (embora agora venha de utils)
    ActionRowBuilder,      // Importado para uso nos eventos (embora agora venha de utils)
    ChannelSelectMenuBuilder, // Importado para uso nos eventos
    ChannelType            // Importado para uso nos eventos
} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

// Importa a função para criar o Modal de postagem
const { createPostagemModal } = require('./utils/postagemModal'); // <--- Linha importante!

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages, // Necessário se for usar DMs para algo ou interações privadas
    ],
    partials: [Partials.Channel, Partials.Message], // Adicionado Partials.Message para interações
});

client.commands = new Collection();
client.tempEmbeds = new Map(); // Para armazenar embeds temporariamente entre interações
client.pontosAbertos = new Map();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Adiciona comandos à coleção, verificando se são Slash Commands ou comandos de texto
    if ('data' in command && 'execute' in command) { // Para Slash Commands (com a propriedade 'data')
        client.commands.set(command.data.name, command);
    } else if ('name' in command && 'execute' in command) { // Para comandos de texto (com a propriedade 'name')
        client.commands.set(command.name, command);
    } else {
        console.warn(`[AVISO] O comando em ${filePath} está faltando uma propriedade "data" (para Slash) ou "name" e "execute" (para texto) necessárias.`);
    }
}

client.once('ready', () => {
    console.log(`Bot conectado como ${client.user.tag}`);
});

// --- EVENTO PRINCIPAL PARA LIDAR COM TODAS AS INTERAÇÕES ---
client.on('interactionCreate', async interaction => {
    // 1. Lidar com Comandos Slash (/postagem)
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`Nenhum comando correspondente a ${interaction.commandName} foi encontrado.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Houve um erro ao executar este comando!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Houve um erro ao executar este comando!', ephemeral: true });
            }
        }
    }
    // 2. Lidar com Cliques de Botão (o botão "Abrir Formulário de Postagem")
    else if (interaction.isButton()) {
        if (interaction.customId === 'openPostagemModal') {
            const modal = createPostagemModal(); // <--- CHAMA A FUNÇÃO AQUI!
            await interaction.showModal(modal);
        }
        else if (interaction.customId === 'baterPonto') { // Custom ID definido em commands/ponto.js
            console.log('--- Botão "BATER PONTO" clicado! ---'); // Mantido para depuração, pode remover depois
            const userId = interaction.user.id;
            console.log(`--- ID do usuário: ${userId} ---`); // Mantido para depuração, pode remover depois

            if (client.pontosAbertos.has(userId)) {
                await interaction.reply({ content: 'Você já tem um ponto em aberto! Feche seu ponto atual antes de abrir um novo.', ephemeral: true });
                return;
            }

            try {
                const now = new Date();
                client.pontosAbertos.set(userId, now.getTime());
                console.log(`--- Ponto de ${userId} ARMAZENADO. ---`); // Mantido para depuração, pode remover depois

                await interaction.reply({
                    content: `✅ Ponto batido com sucesso às ${now.toLocaleTimeString('pt-BR')} do dia ${now.toLocaleDateString('pt-BR')}.`,
                    ephemeral: true // Mensagem visível apenas para o usuário
                });
                console.log('--- Resposta de ponto batido ENVIADA. ---'); // Mantido para depuração, pode remover depois
            } catch (error) {
                console.error('ERRO AO BATER PONTO:', error);
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: 'Ocorreu um erro ao tentar bater o ponto. Tente novamente.', ephemeral: true });
                } else {
                    await interaction.followUp({ content: 'Ocorreu um erro ao tentar bater o ponto. Tente novamente.', ephemeral: true });
                }
            }
        }
        //Botão de fechar ponto
        // Botão "FECHAR PONTO" (ENCERRAR)
        else if (interaction.customId === 'fecharPonto') {
            const userId = interaction.user.id;

            // --- NOVO: ID do Canal de Logs de Ponto ---
            // Substitua 'SEU_ID_DO_CANAL_DE_LOGS_DE_PONTO_AQUI' pelo ID que você copiou
            const LOG_PONTO_CHANNEL_ID = '1392337442387791973';

            if (!client.pontosAbertos.has(userId)) {
                await interaction.reply({ content: 'Você não tem um ponto em aberto para fechar!', ephemeral: true });
                return;
            }

            const inicioPonto = client.pontosAbertos.get(userId);
            const fimPonto = new Date().getTime();
            client.pontosAbertos.delete(userId);

            const duracaoMs = fimPonto - inicioPonto;

            const totalSegundos = Math.floor(duracaoMs / 1000);
            const horas = Math.floor(totalSegundos / 3600);
            const minutos = Math.floor((totalSegundos % 3600) / 60);
            const segundos = totalSegundos % 60;
            const centesimos = Math.floor((duracaoMs % 1000) / 10);

            const formatarDoisDigitos = (num) => String(num).padStart(2, '0');
            const duracaoFormatada = `${formatarDoisDigitos(horas)}:${formatarDoisDigitos(minutos)}:${formatarDoisDigitos(segundos)}:${formatarDoisDigitos(centesimos)}`;

            const inicioDate = new Date(inicioPonto);
            const fimDate = new Date(fimPonto);

            const pontoFechadoEmbed = new EmbedBuilder()
                .setColor(0x3498DB)
                .setTitle(`LOG PONTO de ${interaction.user.username}`)
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 64 }))
                .addFields(
                    { name: '👤 Membro:', value: `<@${userId}>`, inline: true },
                    { name: '📊 Status:', value: 'Fechado', inline: true },
                )
                .addFields(
                    { name: '➡️ Aberto em:', value: `${inicioDate.toLocaleDateString('pt-BR')} ${inicioDate.toLocaleTimeString('pt-BR')}`, inline: false },
                    { name: '⬅️ Fechado em:', value: `${fimDate.toLocaleDateString('pt-BR')} ${fimDate.toLocaleTimeString('pt-BR')}`, inline: false }
                )
                .setFooter({ text: 'Relatório de Ponto Automático' })
                .setTimestamp();

            pontoFechadoEmbed.addFields(
                { name: '⏱️ Tempo Total:', value: `\`\`\`${duracaoFormatada}\`\`\``, inline: false }
            );

            // --- NOVO: Enviar para o canal de logs e responder ao usuário de forma ephemeral ---
            try {
                const logChannel = await client.channels.fetch(LOG_PONTO_CHANNEL_ID);

                if (logChannel && logChannel.isTextBased()) { // Verifica se o canal existe e é um canal de texto
                    await logChannel.send({ embeds: [pontoFechadoEmbed] });
                    // Resposta ephemeral para o usuário que fechou o ponto
                    await interaction.reply({ content: `✅ Seu ponto foi fechado! O relatório foi enviado para ${logChannel.name}.`, ephemeral: true });
                } else {
                    // Caso o canal de logs não seja encontrado ou não seja um canal de texto
                    console.error(`Canal de logs de ponto com ID ${LOG_PONTO_CHANNEL_ID} não encontrado, não é um canal de texto ou bot sem permissão.`);
                    await interaction.reply({ content: 'Erro: O canal de logs de ponto não foi encontrado ou não tenho permissão para enviar mensagens lá. O relatório não foi enviado.', ephemeral: true });
                }
            } catch (error) {
                console.error('Erro ao enviar relatório de ponto para o canal de logs:', error);
                await interaction.reply({ content: 'Houve um erro ao tentar enviar o relatório de ponto para o canal de logs. Por favor, avise um administrador.', ephemeral: true });
            }
        }
    // 3. Lidar com a Submissão de Modals (quando o usuário preenche e envia o formulário)
    else if (interaction.isModalSubmit()) {
        if (interaction.customId === 'criarPostagemModal') {
            // Pega os dados dos campos de texto do Modal
            const titulo = interaction.fields.getTextInputValue('tituloPostagemInput');
            const descricao = interaction.fields.getTextInputValue('descricaoPostagemInput');
            const thumbnail = interaction.fields.getTextInputValue('thumbnailPostagemInput');
            const imagemPrincipal = interaction.fields.getTextInputValue('imagemPrincipalPostagemInput');
            const footer = interaction.fields.getTextInputValue('footerPostagemInput');

            // Constrói o Embed (ainda não será enviado)
            const postagemEmbed = new EmbedBuilder()
                .setColor(0xFFFF00); // Amarelo padrão

            if (titulo) postagemEmbed.setTitle(titulo);
            if (descricao) postagemEmbed.setDescription(descricao);
            if (thumbnail) postagemEmbed.setThumbnail(thumbnail);
            if (imagemPrincipal) postagemEmbed.setImage(imagemPrincipal);
            if (footer) postagemEmbed.setFooter({ text: footer });

            // Armazena o embed construído temporariamente no Map 'client.tempEmbeds'
            client.tempEmbeds.set(interaction.user.id, postagemEmbed);

            // Cria o menu de seleção de canal para o usuário escolher onde enviar
            const channelSelectMenu = new ChannelSelectMenuBuilder()
                // customId único para esta seleção, incluindo ID do usuário e timestamp
                .setCustomId(`selectChannel-${interaction.user.id}-${Date.now()}`)
                .setPlaceholder('Selecione o canal de destino para a postagem...')
                .addChannelTypes(
                    ChannelType.GuildText,       // Canais de texto padrão
                    ChannelType.GuildAnnouncement // Canais de anúncios
                )
                .setMaxValues(1)
                .setMinValues(1);

            const row = new ActionRowBuilder().addComponents(channelSelectMenu);

            // Responde à submissão do Modal com o menu de seleção (ephemeral)
            await interaction.reply({
                content: 'Sua postagem foi preparada! Agora, selecione o canal para onde você quer enviá-la:',
                components: [row],
                ephemeral: true // Visível apenas para o usuário que interagiu
            });
        }
    }
    // 4. Lidar com a Seleção de Canal (quando o usuário escolhe um canal no menu)
    else if (interaction.isChannelSelectMenu()) {
        // Verifica se é o nosso menu de seleção de canal (usando o prefixo do customId)
        if (interaction.customId.startsWith('selectChannel-')) {
            const selectedChannelId = interaction.values[0]; // Pega o ID do canal selecionado
            const userId = interaction.customId.split('-')[1]; // Pega o ID do usuário que iniciou a interação

            // Recupera o embed que foi armazenado temporariamente para este usuário
            const storedEmbed = client.tempEmbeds.get(userId);

            if (!storedEmbed) {
                await interaction.reply({ content: 'Ops! O embed da sua postagem não foi encontrado. Tente iniciar uma nova postagem.', ephemeral: true });
                return;
            }

            try {
                // Tenta buscar o objeto do canal selecionado
                const targetChannel = await client.channels.fetch(selectedChannelId);

                if (!targetChannel) {
                    console.error(`Canal de destino com ID ${selectedChannelId} não encontrado ou bot sem acesso.`);
                    await interaction.reply({ content: 'Erro: O canal selecionado não foi encontrado ou não tenho permissão para vê-lo.', ephemeral: true });
                    // Não retorna, tenta remover o embed temporário mesmo em erro
                } else {
                    // Envia o embed final para o canal de destino selecionado pelo usuário
                    await targetChannel.send({ embeds: [storedEmbed] });

                    // Responde à seleção do canal com uma confirmação (ephemeral)
                    await interaction.reply({ content: `Postagem enviada com sucesso para ${targetChannel.name}!`, ephemeral: true });
                }

            } catch (error) {
                console.error('Erro ao enviar embed após seleção de canal:', error);
                // Responde à interação original com uma mensagem de erro ephemeral
                await interaction.reply({ content: 'Houve um erro ao tentar enviar sua postagem. Verifique minhas permissões no canal de destino.', ephemeral: true });
            } finally {
                // Sempre remove o embed temporário, mesmo que tenha dado erro no envio
                client.tempEmbeds.delete(userId);
            }
        }
    }
}});

// --- EVENTO ANTIGO PARA COMANDOS DE TEXTO (prefixados) ---
client.on('messageCreate', message => {
    if (message.author.bot) return;

    const prefix = '/'; // Seu prefixo para comandos de texto (se você ainda usa comandos prefixados)
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);

    // Ignora se o comando não existe OU se ele é um Slash Command (que tem a propriedade 'data')
    if (!command || command.data) return;

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(`Erro ao executar o comando ${commandName}:`, error);
        message.reply('Houve um erro ao tentar executar este comando!');
    }
});

client.login(process.env.DISCORD_TOKEN).catch(error => {
    console.error('Erro ao fazer login no Discord:', error);
});