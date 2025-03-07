const { EmbedBuilder, SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');
const { conn, sql } = require('../../connect.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('show')
		.setDescription('Show Card information.')
		.addStringOption(option =>
			option.setName('id')
				.setDescription('Input CardID')
				.setRequired(true)), // Mark the option as required		

	async execute(interaction) {
		const id = interaction.options.getString('id');

		try {
			const pool = await conn;
			if (!pool) throw new Error("Database connection failed");

			const ps = new sql.PreparedStatement(pool);
			ps.input('cardid', sql.VarChar(7));

			const query = `
				SELECT * FROM Cards 
				INNER JOIN Passive p  ON p.PassiveID = Cards.PassiveID
				INNER JOIN Skill s  ON s.SkillID = Cards.Skill1 OR s.SkillID = Cards.Skill2 
				WHERE cardID = @cardid;
			`;

			await ps.prepare(query);

			const result = await ps.execute({ cardid: id });

			await ps.unprepare(); // Unprepare immediately after execution

			if (!result.recordset.length) {
				return interaction.reply({ content: 'No card found with that ID.', ephemeral: true });
			}

			const card = result.recordset[0];
			const skills = result.recordset.map(row => ({
				name: row.SkillName,
				description: row.SkillDescription,
				cost: row.SkillCost
			}));

			// Attach images
			const picPath = path.join(__dirname, `../../pic/${card.cardID}.jpg`);
			const iconPath = path.join(__dirname, '../../pic/icon.jpg');
			const picAttachment = new AttachmentBuilder(picPath);
			const iconAttachment = new AttachmentBuilder(iconPath);

			// Create embed message
			const embed = new EmbedBuilder()
				.setColor(0xFFFFFF)
				.setTitle(`${card.name}`)
				.setDescription(`Card ID: ${card.cardID}`)
				.setThumbnail('attachment://icon.jpg')
				.addFields(
					{ name: `Passive: ${card.PassiveName}`, value: `${card.PassiveDescription}` },
					{ name: `PAC ${card.PAC}`, value: ``, inline: true },
					{ name: `SHO ${card.SHO}`, value: ``, inline: true },
					{ name: `PAS ${card.PAS}`, value: ``, inline: true },
					{ name: `DRI ${card.DRI}`, value: ``, inline: true },
					{ name: `DEF ${card.DEF}`, value: ``, inline: true },
					{ name: `PHY ${card.PHY}`, value: ``, inline: true },
					{ name: '\u200B', value: '\u200B' }
				);

			// Add skills dynamically
			skills.forEach((skill, index) => {
				embed.addFields({ name: `Skill ${index + 1}: ${skill.name}`, value: `${skill.description}. Cost: ${skill.cost}`, inline: false });
			});

			embed.setImage(`attachment://${card.cardID}.jpg`).setTimestamp();

			await interaction.reply({ embeds: [embed], files: [picAttachment, iconAttachment] });

		} catch (err) {
			//console.error('Error executing command:', err);

			// If interaction has already been replied to, send a follow-up
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'An unexpected error occurred. Please try again later.', ephemeral: true });
			} else {
				await interaction.reply({ content: 'An unexpected error occurred. Please try again later.', ephemeral: true });
			}
		}
	}
};
