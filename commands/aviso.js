// commands/aviso.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'aviso',
    description: 'Envia uma mensagem de aviso em formato de embed.',
    execute(message, args) {
        // Isso pega o texto depois do comando, ou define um padrão se não houver
        const texto = args.join(' ') || 'Nenhuma mensagem enviada.';

        // Cria o embed com as propriedades
        const embed = new EmbedBuilder()
            .setTitle('AVISO')
            .setDescription(texto)
            .setColor(0xFFFF00) // Usando um código hexadecimal para o amarelo, mais robusto
            .setFooter({ text: `Enviado por ${message.author.username}` });

        // Envia a mensagem com o embed
        // É crucial que 'embeds' seja um array contendo seu EmbedBuilder
        message.channel.send({ embeds: [embed] })
            .catch(error => {
                console.error('Erro ao enviar o embed de aviso:', error);
                message.reply('Desculpe, não consegui enviar o aviso. Verifique o console para mais detalhes.');
            });
    },
};