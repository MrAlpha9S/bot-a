const { 
	ButtonBuilder, 
	ButtonStyle, 
	ActionRowBuilder, 
	StringSelectMenuBuilder, 
	StringSelectMenuOptionBuilder, 
	SlashCommandBuilder, 
	ComponentType 
} = require('discord.js');
const { conn, sql } = require('../../connect.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setteam')
		.setDescription('Set your team!'),
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

			const selectTeamLine = new StringSelectMenuBuilder()
				.setCustomId('line')
				.setPlaceholder('Select a Line!')
				.addOptions(
					...Array.from({ length: 5 }, (_, i) =>
						new StringSelectMenuOptionBuilder()
							.setLabel(`Line ${i + 1}`)
							.setValue(`${i + 1}`)
					)
				);

			const selectTeamSlot = new StringSelectMenuBuilder()
				.setCustomId('slot')
				.setPlaceholder('Select a Slot!')
				.addOptions(
					...Array.from({ length: 7 }, (_, i) =>
						new StringSelectMenuOptionBuilder()
							.setLabel(`Slot ${i + 1}`)
							.setValue(`${i + 1}`)
					)
				);

			const selectPosition = new StringSelectMenuBuilder()
				.setCustomId('position')
				.setPlaceholder('Select a position!')
				.addOptions(
					...['CF', 'SS', 'LW', 'RW', 'AM', 'CM', 'LM', 'RM', 'CB', 'LB', 'RB'].map(pos =>
						new StringSelectMenuOptionBuilder()
							.setLabel(pos)
							.setValue(pos.toLowerCase())
					)
				);

			const cancel = new ButtonBuilder()
				.setCustomId('cancel')
				.setLabel('Cancel Changes')
				.setStyle(ButtonStyle.Danger);

			const row1 = new ActionRowBuilder().addComponents(selectPlayer);
			const row2 = new ActionRowBuilder().addComponents(selectTeamSlot);
			const row3 = new ActionRowBuilder().addComponents(selectPosition);
			const row4 = new ActionRowBuilder().addComponents(selectTeamLine);

			const button = new ActionRowBuilder().addComponents(cancel);

			const rows = [row1, row2, row3, row4]; // Store all rows in an array

			let currentRowIndex = 0; // Track the current row index

			let playerSelected = {};

			await interaction.reply({
				content: `Choose a player to set him to team (Page ${currentPage + 1} / ${totalPages})`,
				components: [row1, button],
			});

			const filter = i => i.user.id === interaction.user.id;

			const collector = interaction.channel.createMessageComponentCollector({
				time: 60_000,
				filter,
			});

			collector.on('collect', async i => {

				if (i.customId === 'cancel') {
					await i.update({
						content: `Cancelled!`,
						components: [], // Clear all components
					});
					return collector.stop(); // Stop the collector if cancelled
				}

				const selected = i.values[0];
				if (selected === 'next_page') {
					if (currentPage < totalPages - 1) currentPage++;
				} else if (selected === 'prev_page') {
					if (currentPage > 0) currentPage--;
				} else {
					playerSelected[currentRowIndex] = selected; // Store the selected player in the object
					currentRowIndex++; // Move to the next row
					if (currentRowIndex >= rows.length) {
						console.log(playerSelected);
						await i.update({
							content: `done!`,
							components: [], // Clear all components
						});
						return collector.stop(); // Stop the collector if all rows are filled
					} 

					await i.update({
						content: `You selected **${i.values[0]}** from \`${i.customId}\``,
						components: [rows[currentRowIndex], button], // Dynamically select the row
					});
					return;
				}

				const newSelectPlayer = buildSelectPlayer(currentPage);
				const updatedRow1 = new ActionRowBuilder().addComponents(newSelectPlayer);

				await i.update({
					content: `Set your team! (Page ${currentPage + 1} / ${totalPages})`,
					components: [updatedRow1, button],
				});
			});

			// collector.on('end', collected => {
			// 	console.log(`Collector ended. Collected ${collected.size} interactions.`);
			// });
		} catch (error) {
			console.error(error);
			return interaction.reply({ content: 'An error occurred while executing this command.', ephemeral: true });
		}
	},
};
