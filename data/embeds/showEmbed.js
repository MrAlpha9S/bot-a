const { EmbedBuilder, ComponentType, StringSelectMenuOptionBuilder, StringSelectMenuBuilder, ActionRowBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');
const { conn, sql } = require('../../connect.js');

const cardEmbed = require('../datahandler/cardData.js');
let embed = null;

module.exports = {
	data: {
		name: 'showCards',
		description: 'Show your cards',
	},


	async execute(interaction) {
		const id = interaction.user.id;
		try {
			const pool = await conn;
			if (!pool) throw new Error("Database connection failed");

			const ps = new sql.PreparedStatement(pool);
			ps.input('userid', sql.VarChar(50));

			const query = `
				SELECT c.name, c.cardID FROM Cards c
				LEFT JOIN UserCard uc ON uc.cardID = c.cardID
				WHERE uc.userID = @userid AND uc.amount > 0
				ORDER BY c.name ASC;
			`;

			await ps.prepare(query);
			const result = await ps.execute({ userid: id });
			await ps.unprepare();

			const allcards = result.recordset;
			const cardsPerPage = 20;
			let currentPage = 0;
			const totalPages = Math.ceil(allcards.length / cardsPerPage);

			const buildSelectPlayer = (page) => {
				const start = page * cardsPerPage;
				const end = start + cardsPerPage;
				const pageCards = allcards.slice(start, end);

				const options = [];

				if (page > 0) {
					options.push(
						new StringSelectMenuOptionBuilder()
							.setLabel('⬅ Trang trước')
							.setValue('prev_page')
					);
				}

				for (const row of pageCards) {
					options.push(
						new StringSelectMenuOptionBuilder()
							.setLabel(row.name)
							.setValue(row.cardID)
							.setDescription(`ID: ${row.cardID}`)
					);
				}

				if (page < totalPages - 1) {
					options.push(
						new StringSelectMenuOptionBuilder()
							.setLabel('➡ Trang sau')
							.setValue('next_page')
					);
				}

				return new StringSelectMenuBuilder()
					.setCustomId('player')
					.setPlaceholder('Select a player!')
					.addOptions(options);
			};

			const selectPlayer = buildSelectPlayer(currentPage);
			const row = new ActionRowBuilder().addComponents(selectPlayer);


			await interaction.reply({
				content: `Choose a player (Page ${currentPage + 1} / ${totalPages})`,
				embeds: [], // Clear all embeds
				components: [row], // Add the select menu row
			});

			const filter = i => i.user.id === interaction.user.id;

			const collector = interaction.channel.createMessageComponentCollector({
				filter,
				time: 60_000,
				withResponse: true,
				componentType: ComponentType.StringSelect,
			});

			collector.on('collect', async i => {

				const selected = i.values[0];

				if (selected === 'next_page') {
					if (currentPage < totalPages - 1) currentPage++;
				} else if (selected === 'prev_page') {
					if (currentPage > 0) currentPage--;
				} else {
					const cardID = selected;
					embed = await cardEmbed.execute(cardID);

					const picPath = path.join(__dirname, `../../pic/${cardID}.jpg`);
					const iconPath = path.join(__dirname, '../../pic/icon.jpg');
					const picAttachment = new AttachmentBuilder(picPath);
					const iconAttachment = new AttachmentBuilder(iconPath);

					await i.update({
						content: `Choose a player (Page ${currentPage + 1} / ${totalPages})`,
						embeds: [embed], // Add the embed with card data
						components: [row],
						files: [picAttachment, iconAttachment], // Attach the images
					});
					return;
				}

				const newSelectPlayer = buildSelectPlayer(currentPage);
				const updatedRow = new ActionRowBuilder().addComponents(newSelectPlayer);


				await i.update({
					content: `Choose a player (Page ${currentPage + 1} / ${totalPages})`,
					embeds: [embed], // Add the embed with card data
					components: [updatedRow],
				});

			});

			collector.on('end', async () => {
				console.log('Collector ended');
				// Clear components when the collector ends
				await interaction.editReply({ content: 'Collector ended!', components: [] });
			});
		} catch (error) {
			console.log(error);
		}
	}
};
