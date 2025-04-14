const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const path = require('path');
const { conn, sql } = require('../../connect.js');

const showEmbedCooldown = new Set();

module.exports = {
	data: {
		name: 'viewInventory',
		description: 'View your inventory',
	},

	async execute(interaction) {
		const id = interaction.user.id;
		const user = interaction.user;
		const pageSize = 10; // Number of cards per page

		try {
			const pool = await conn;
			if (!pool) throw new Error("Database connection failed");

			const ps = new sql.PreparedStatement(pool);
			ps.input('userid', sql.VarChar(50));

			const query = `
				SELECT c.cardID, c.name, u.userID, us.amount, u.currency, c.sell FROM Cards c
                INNER JOIN UserCard us  ON us.cardID = c.cardID
                INNER JOIN Users u ON u.userID = us.userID
                WHERE u.userID = @userid;
			`;

			await ps.prepare(query);
			const result = await ps.execute({ userid: user.id });
			await ps.unprepare();

			if (!result.recordset.length) {
				return interaction.reply({ content: 'Your inventory is empty.', ephemeral: true });
			}

			const cards = result.recordset;
			let currentPage = 0;
			const totalPages = Math.ceil(cards.length / pageSize);

			// Get user's avatar URL
			const avatarURL = user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 });

			// Function to create an embed for a given page
			const createEmbed = (page) => {
				const start = page * pageSize;
				const end = start + pageSize;
				const currentCards = cards.slice(start, end);

				const embed = new EmbedBuilder()
					.setColor(0xFFFFFF)
					.setTitle(`${user.username}'s Inventory`)
					.setDescription(`Page ${page + 1} of ${totalPages}`)
					.setThumbnail(avatarURL) // Use user's avatar instead of icon
					.addFields({ name: `Currency: ${cards[0].currency}`, value: '' });

				currentCards.forEach((card) => {
					embed.addFields({
						name: `ID: ${card.cardID}, Name: ${card.name}, Amount: ${card.amount}, Sell: ${card.sell}`,
						value: '',
						inline: false
					});
				});

				return embed;
			};

			// Create buttons
			const createButtons = () => {
				return new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setCustomId('prev')
						.setLabel('⬅️ Previous')
						.setStyle(ButtonStyle.Primary)
						.setDisabled(currentPage === 0),
					new ButtonBuilder()
						.setCustomId('next')
						.setLabel('Next ➡️')
						.setStyle(ButtonStyle.Primary)
						.setDisabled(currentPage === totalPages - 1),
					new ButtonBuilder()
						.setCustomId('show')
						.setLabel('Show Cards')
						.setStyle(ButtonStyle.Primary)
				);
			};

			// Send initial embed
			const embed = createEmbed(currentPage);

			var reply = await interaction.update({ embeds: [embed], components: [createButtons()] });

			// Create a button interaction collector
			const filter = i => i.user.id === interaction.user.id;
			const collector = reply.createMessageComponentCollector({
				ComponentType: ComponentType.Button,
				filter,
				time: 60_000,
			});

			collector.on('collect', async i => {

				if (i.customId === 'prev' && currentPage > 0) {
					currentPage--;
				} else if (i.customId === 'next' && currentPage < totalPages - 1) {
					currentPage++;
				} else if (i.customId === 'show') {

					if (showEmbedCooldown.has(id)) {
						return i.update({ content: 'You are on cooldown. Please wait before using this again.' });
					}
					showEmbedCooldown.add(id);
                    setTimeout(() => showEmbedCooldown.delete(id), 30_000);

					collector.stop(); // Stop the collector to prevent multiple interactions
					const showEmbed = require('../../data/embeds/showEmbed.js');
					return await showEmbed.execute(i);
				}

				const updatedEmbed = createEmbed(currentPage);
				await i.update({ embeds: [updatedEmbed], components: [createButtons()] });
			});

			collector.on('end', async () => {
				const disabledButtons = createButtons().components.map(button => button.setDisabled(true));
			});
		} catch (err) {
			createButtons().components.forEach(button => button.setDisabled(true));
		}
	}
};
