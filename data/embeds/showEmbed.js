const { ButtonBuilder, ButtonStyle, ComponentType, StringSelectMenuOptionBuilder, StringSelectMenuBuilder, ActionRowBuilder, AttachmentBuilder } = require('discord.js');
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

			const sellButton = new ButtonBuilder()
						.setCustomId('sell')
						.setLabel('Sell Card')
						.setStyle(ButtonStyle.Danger)
						.setDisabled(true);

			const showRow1 = new ActionRowBuilder().addComponents(selectPlayer);
			const showRow2 = new ActionRowBuilder().addComponents(sellButton);

			var reply = await interaction.update({
				content: `Choose a player (Page ${currentPage + 1} / ${totalPages})`,
				components: [showRow1, showRow2], // Add the select menu row
			});

			let cardID = null;
			let selected = null;

			const filter = i => i.user.id === interaction.user.id;

			const collector = reply.createMessageComponentCollector({
				filter,
				time: 30_000,
				// componentType: ComponentType.StringSelect,
			});

			collector.on('collect', async i => {
         

				if(i.customId === 'player') {
					selected = i.values[0];
				} else if (i.customId === 'sell') {
					selected = i.customId;
				}

				if (selected === 'next_page') {
					if (currentPage < totalPages - 1) currentPage++;
				} else if (selected === 'prev_page') {
					if (currentPage > 0) currentPage--;
				} else if (selected === 'sell') {
					collector.stop(); // Stop the collector when a card is selected
					const sellEmbed = require('../embeds/sellComfirmEmbed.js');
					return await sellEmbed.execute(i, cardID);
				} else {	

				    cardID = selected;
					embed = await cardEmbed.execute(cardID);
					sellButton.setDisabled(false);

					const picPath = path.join(__dirname, `../../pic/${cardID}.jpg`);
					const iconPath = path.join(__dirname, '../../pic/icon.jpg');
					const picAttachment = new AttachmentBuilder(picPath);
					const iconAttachment = new AttachmentBuilder(iconPath);

					return await i.update({
						content: `Choose a player (Page ${currentPage + 1} / ${totalPages})`,
						embeds: [embed], // Add the embed with card data
						components: [showRow1, showRow2],
						files: [picAttachment, iconAttachment], // Attach the images
					});
					
				}

				const newSelectPlayer = buildSelectPlayer(currentPage);
				const updatedRow = new ActionRowBuilder().addComponents(newSelectPlayer);


				await i.update({
					content: `Choose a player (Page ${currentPage + 1} / ${totalPages})`,
					components: [updatedRow, showRow2], // Update the select menu row
				});

			});

			collector.on('end', async () => {
				await interaction.editReply({ components: [] });
			});
		} catch (error) {
			console.log(error);
		}
	}
};
