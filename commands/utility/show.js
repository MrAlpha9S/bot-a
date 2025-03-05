const { EmbedBuilder, SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');
const { conn } = require('../../connect.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('show')
		.addStringOption(option =>
			option.setName('id')
				.setDescription('Input CardID')
				.setRequired(true)) // Mark the option as required		
	    .setDescription('Show Card information.'),
	async execute(interaction) {
		
		const id = interaction.options.getString('id');
		const sanitizedId = conn.escape(id);

		conn.query(`SELECT * FROM Cards 
					INNER JOIN Passive p  ON p.PassiveID = Cards.PassiveID
					INNER JOIN Skill s  ON s.SkillID = Cards.Skill1 OR s.SkillID = Cards.Skill2 
					WHERE cardID = ${sanitizedId};`, function (err, results, fields) {

			if (err) {
				console.error(err);
				return interaction.reply('An error occurred while fetching the card information.');
			}

			if (results.length === 0) {
				return interaction.reply('No card found with the provided ID.');
			}

			const card = results[0];
			const card1 = results[1];

		const picPath = path.join(__dirname, `../../pic/${card.cardID}.jpg`);
		const iconPath = path.join(__dirname, '../../pic/icon.jpg');
		const picAttachment = new AttachmentBuilder(picPath);
		const iconAttachment = new AttachmentBuilder(iconPath);

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
			{ name: '\u200B', value: '\u200B' },
		)
		.addFields({ name: `Skill 1: ${card.SkillName}`, value: `${card.SkillDescription}. Cost ${card.SkillCost}`, inline: false })
		.addFields({ name: `Skill 2: ${card1.SkillName}`, value: `${card1.SkillDescription}. Cost ${card.SkillCost}`, inline: false })
		.setImage(`attachment://${card.cardID}.jpg`) // Use the attachment name here
		.setTimestamp();

		interaction.reply({ embeds: [embed], files: [picAttachment, iconAttachment] });
});
	},
};