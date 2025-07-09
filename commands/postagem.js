// commands/postagem.js - VERSÃO AJUSTADA
const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'); // Adicionado ButtonBuilder, ButtonStyle

module.exports = {
    data: new SlashCommandBuilder()
        .setName('postagem')
        .setDescription('Cria um embed personalizado e envia para um canal.'),

    async execute(interaction) {
        // Envia uma mensagem inicial com um botão para abrir o Modal
        const button = new ButtonBuilder()
            .setCustomId('openPostagemModal')
            .setLabel('Abrir Formulário de Postagem')
            .setStyle(ButtonStyle.Primary); // Cor azul

        const actionRow = new ActionRowBuilder().addComponents(button);

        // Responde à interação do comando slash com um botão, tornando-o ephemeral
        // para que apenas o usuário que digitou o comando veja o botão inicial.
        await interaction.reply({
            content: 'Clique no botão abaixo para criar sua postagem:',
            components: [actionRow],
            ephemeral: true // Só o usuário vê
        });
    },
};