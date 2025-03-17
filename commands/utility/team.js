const { ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js');
const { conn, sql } = require('../../connect.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('team')
		.setDescription('Team information.'),
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

			await ps.unprepare(); // Unprepare immediately after execution

			const selectPlayer = new StringSelectMenuBuilder()
				.setCustomId('player')
				.setPlaceholder('Select a player!')
				.addOptions(
					Array.from(result.recordset, (row) => new StringSelectMenuOptionBuilder()
						.setLabel(row.name)
						.setValue(row.cardID)),
				);

			const selectTeamLine = new StringSelectMenuBuilder()
				.setCustomId('line')
				.setPlaceholder('Select a Line!')
				.addOptions(
					new StringSelectMenuOptionBuilder()
						.setLabel('Line 1')
						.setValue('1'),
				)
				.addOptions(
					new StringSelectMenuOptionBuilder()
						.setLabel('Line 2')
						.setValue('2'),
				)
				.addOptions(
					new StringSelectMenuOptionBuilder()
						.setLabel('Line 3')
						.setValue('3'),
				)
				.addOptions(
					new StringSelectMenuOptionBuilder()
						.setLabel('Line 4')
						.setValue('4'),
				)
				.addOptions(
					new StringSelectMenuOptionBuilder()
						.setLabel('Line 5')
						.setValue('5'),
				);
			const selectTeamSlot = new StringSelectMenuBuilder()
				.setCustomId('slot')
				.setPlaceholder('Select a Slot!')
				.addOptions(
					new StringSelectMenuOptionBuilder()
						.setLabel('Slot 1')
						.setValue('1'),
				)
				.addOptions(
					new StringSelectMenuOptionBuilder()
						.setLabel('Slot 2')
						.setValue('2'),
				)
				.addOptions(
					new StringSelectMenuOptionBuilder()
						.setLabel('Slot 3')
						.setValue('3'),
				)
				.addOptions(
					new StringSelectMenuOptionBuilder()
						.setLabel('Slot 4')
						.setValue('4'),
				)
				.addOptions(
					new StringSelectMenuOptionBuilder()
						.setLabel('Slot 5')
						.setValue('5'),
				);

			const selectPosition = new StringSelectMenuBuilder()
				.setCustomId('position')
				.setPlaceholder('Select a position!')
				.addOptions(
					new StringSelectMenuOptionBuilder()
						.setLabel('CF')
						.setValue('cf'),
					new StringSelectMenuOptionBuilder()
						.setLabel('SS')
						.setValue('ss'),
					new StringSelectMenuOptionBuilder()
						.setLabel('CM')
						.setValue('cm'),
					new StringSelectMenuOptionBuilder()
						.setLabel('LW')
						.setValue('lw'),
					new StringSelectMenuOptionBuilder()
						.setLabel('RW')
						.setValue('rw'),
				);
			const confirm = new ButtonBuilder()
				.setCustomId('confirm')
				.setLabel('Confirm changes')
				.setStyle(ButtonStyle.Primary);

			const row1 = new ActionRowBuilder()
				.addComponents(selectTeamSlot);
			const row2 = new ActionRowBuilder()
				.addComponents(selectPlayer);
			const row3 = new ActionRowBuilder()
				.addComponents(selectPosition);
			const row4 = new ActionRowBuilder()
				.addComponents(selectTeamLine);
			const row5 = new ActionRowBuilder()
				.addComponents(confirm);

			await interaction.reply({
				content: 'Set your team!',
				components: [row1, row2, row3, row4, row5],
			});
		} catch (error) {
			console.error(error);
			return interaction.reply({ content: 'An error occurred while executing this command.', ephemeral: true });
		}

	},
};