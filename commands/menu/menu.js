const { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('menu')
        .setDescription('The Menu!'),

    async execute(interaction) {
        try {
            const user = interaction.user;
            const userid = interaction.user.id;
            const avatarURL = user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 });

            const inventoryButton = new ButtonBuilder()
                .setCustomId('inventory')
                .setLabel('Inventory')
                .setStyle(ButtonStyle.Primary);

            const teamButton = new ButtonBuilder()
                .setCustomId('team')
                .setLabel('Team')
                .setStyle(ButtonStyle.Primary);

            const rowMain = new ActionRowBuilder()
                .addComponents(inventoryButton, teamButton);

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Welcome to the Menu!')
                .setAuthor({ name: `${user.username}`, iconURL: avatarURL })
                .setDescription('Just a simple menu for a stupid bot :v')
                .setThumbnail(avatarURL)
                .addFields({ name: '', value: 'FUCKKKKKK', inline: true })
                .setTimestamp()
                .setFooter({ text: `${userid}`, iconURL: avatarURL });

            await interaction.reply({ embeds: [embed], components: [rowMain] });


            const filter = i => i.user.id === interaction.user.id;

            const collector = interaction.channel.createMessageComponentCollector({
                ComponentType: ComponentType.Button,
                time: 30_000,
                filter,
                withResponse: true,
            });

            collector.on('collect', async i => {
                if (i.customId === 'inventory') {
                    const inventoryEmbed = require('../../data/embeds/inventoryEmbed.js');
                    return await inventoryEmbed.execute(i);
                }
            });
            collector.on('end', collected => {
                interaction.editReply({content: 'TimeOut!', components: [] }); // Disable buttons after timeout
            });
        } catch (error) {
            console.error('Error executing command:', error);
            //return interaction.reply({ content: 'An error occurred while executing this command at menuEmbed.', ephemeral: true });
        }
    },
};