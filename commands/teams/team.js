const { EmbedBuilder, SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');
const { conn, sql } = require('../../connect.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('team')
		.setDescription('Show Team'),	
	async execute(interaction) {
		const user = interaction.user;
		const id = interaction.user.id;
		const avatarURL = user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 });

		try {
			const pool = await conn;
			if (!pool) throw new Error("Database connection failed");

			const ps = new sql.PreparedStatement(pool);
			ps.input('userid', sql.VarChar(50));

			const query = `
				SELECT * FROM UserTeam
				WHERE userid = @userid;
			`;

			await ps.prepare(query);

			const result = await ps.execute({ userid: id });

			await ps.unprepare(); // Unprepare immediately after execution

			if (!result.recordset.length) {
				return interaction.reply({ content: 'Not Found!', ephemeral: true });
			}

			const results = result.recordset[0];
			const name1 = results.name1;

			// Create embed message
			const embed = new EmbedBuilder()
				.setColor(0xFFFFFF)
				.setTitle(`${user.username}'s Team`)
				.setThumbnail(avatarURL)
				.addFields(
					{ name: `===========Barou===========`, value: ``, inline: false },
					{ name: `====Lorenzo======Snuffy====`, value: ``, inline: false },
					{ name: `===========================`, value: ``, inline: false },
				)
				.setFooter({ text: `ID: ${id}` });

			//embed.setImage(`attachment://${card.cardID}.jpg`).setTimestamp();

			await interaction.reply({ embeds: [embed] });

		} catch (err) {
			console.error('Error executing command:', err);

			// If interaction has already been replied to, send a follow-up
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'An unexpected error occurred. Please try again later.', ephemeral: true });
			} else {
				await interaction.reply({ content: 'An unexpected error occurred. Please try again later.', ephemeral: true });
			}
		}
	}
};
