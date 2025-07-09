    const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

function createPostagemModal() {
    const modal = new ModalBuilder()
        .setCustomId('criarPostagemModal')
        .setTitle('Criar Nova Postagem');

    // Campos de texto para o Modal
    const tituloInput = new TextInputBuilder()
        .setCustomId('tituloPostagemInput')
        .setLabel('Título da Postagem (opcional)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setPlaceholder('Ex: Novo Aviso Importante!');

    const descricaoInput = new TextInputBuilder()
        .setCustomId('descricaoPostagemInput')
        .setLabel('Descrição da Postagem')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setPlaceholder('Detalhes sobre a postagem...');

    const thumbnailInput = new TextInputBuilder()
        .setCustomId('thumbnailPostagemInput') // <<< ESTE É O customId DA THUMBNAIL
        .setLabel('URL da Miniatura/Thumbnail (opcional)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setPlaceholder('Cole a URL de uma imagem para a miniatura (canto superior direito)');
        
    const imageInput = new TextInputBuilder()
        .setCustomId('imagemPrincipalPostagemInput') // <<< ESTE É O customId DA IMAGEM PRINCIPAL!
        .setLabel('URL da Imagem Principal (opcional)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setPlaceholder('Cole a URL de uma imagem para o corpo do embed');

    const footerInput = new TextInputBuilder()
        .setCustomId('footerPostagemInput')
        .setLabel('Texto do Rodapé (opcional)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setPlaceholder('Ex: Equipe de Suporte');

    // Cada TextInputBuilder deve estar em sua própria ActionRowBuilder para Modals
    const firstActionRow = new ActionRowBuilder().addComponents(tituloInput);
    const secondActionRow = new ActionRowBuilder().addComponents(descricaoInput);
    const thirdActionRow = new ActionRowBuilder().addComponents(thumbnailInput);
    const fourthActionRow = new ActionRowBuilder().addComponents(imageInput);
    const fifthActionRow = new ActionRowBuilder().addComponents(footerInput);

    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow, fifthActionRow);

    return modal;
}

module.exports = { createPostagemModal };