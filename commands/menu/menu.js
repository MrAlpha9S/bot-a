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
                .setLabel('Inventory').setDisabled(false)
                .setStyle(ButtonStyle.Primary);

            const packButton = new ButtonBuilder()
                .setCustomId('packs')
                .setLabel('Packs').setDisabled(false)
                .setStyle(ButtonStyle.Primary);

            const teamButton = new ButtonBuilder()
                .setCustomId('team')
                .setLabel('Team').setDisabled(false)
                .setStyle(ButtonStyle.Primary);

            const shopButton = new ButtonBuilder()
                .setCustomId('shop')
                .setLabel('Shop').setDisabled(false)
                .setStyle(ButtonStyle.Primary); 
                
            const battleButton = new ButtonBuilder()
                .setCustomId('battle')
                .setLabel('Battle').setDisabled(false)
                .setStyle(ButtonStyle.Primary);

            const row1 = new ActionRowBuilder()
                .addComponents(inventoryButton, packButton, teamButton);
            const row2 = new ActionRowBuilder()
                .addComponents(shopButton);

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Welcome to the Menu!')
                .setAuthor({ name: `${user.username}`, iconURL: avatarURL })
                .setDescription('Just a simple menu for a stupid bot :v')
                .setThumbnail(avatarURL)
                .addFields({ name: '', value: 'FUCKKKKKK', inline: true })
                .setTimestamp()
                .setFooter({ text: `${userid}`, iconURL: avatarURL });

            var reply = await interaction.reply({ embeds: [embed], components: [row1, row2] });


            const filter = i => i.user.id === interaction.user.id;

            const collector = reply.createMessageComponentCollector({
                ComponentType: ComponentType.Button,
                time: 60_000,
                filter,
                withResponse: true,
            });

            collector.on('collect', async i => {
                if (i.customId === 'inventory') {
                    collector.stop(); // Stop the collector when a button is clicked
                    const inventoryEmbed = require('../../data/embeds/inventoryEmbed.js');
                    return await inventoryEmbed.execute(i);
                } else if( i.customId === 'team') {
                    const teamEmbed = require('../../data/embeds/teamEmbed.js');
                    return await teamEmbed.execute(i);
                }
            });

            collector.on('end', async () => {
                await interaction.editReply({ components: [] });
            });
        } catch (error) {
            await interaction.editReply({ components: [] });
        }
    },
};