// commands/ponto.js (ou commands/baterponto.js)
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ponto') // OK, se você quer que o comando seja /ponto
        .setDescription(`Envia a mensagem com botão de abrir e fechar ponto`),

    async execute(interaction) {
        const pontoEmbed = new EmbedBuilder()
            .setColor('Yellow')
            .setTitle('Sistema de Registro de Ponto')
            .setDescription('Clique nos botões abaixo para registrar seu ponto.');

        const baterPontoButton = new ButtonBuilder()
            .setCustomId('baterPonto') // <-- MUDOU AQUI! AGORA CORRESPONDE AO INDEX.JS
            .setLabel('ABRIR PONTO') // Label pode ser o que você quiser
            .setStyle(ButtonStyle.Success);

        const fecharPontoButton = new ButtonBuilder()
            .setCustomId('fecharPonto') // <-- MUDOU AQUI! AGORA CORRESPONDE AO INDEX.JS
            .setLabel('FECHAR PONTO') // Label pode ser o que você quiser
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
            .addComponents(baterPontoButton, fecharPontoButton);

        await interaction.reply({
            embeds: [pontoEmbed],
            components: [row],
            ephemeral: false
        });
    },
};