const { EmbedBuilder, SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('show')
		// .addStringOption(option =>
		// 	option.setName('id')
		// 		.setDescription('Input CardID'))
	    .setDescription('Show Card information.'),
	async execute(interaction) {
		const id = interaction.options.getString('id');

		const picPath = path.join(__dirname, '../../pic/PR00001.jpg');
		const iconPath = path.join(__dirname, '../../pic/icon.jpg');
		const picAttachment = new AttachmentBuilder(picPath);
		const iconAttachment = new AttachmentBuilder(iconPath);

		const embed = new EmbedBuilder()
		.setColor(0xFFFFFF)
		.setTitle('Name')
		.setDescription('Some description here')
		.setThumbnail('attachment://icon.jpg')
		.addFields(
			{ name: 'Passive:', value: 'Some value here' },
			{ name: 'PAC ', value: '', inline: true },
			{ name: 'SHO ', value: '', inline: true },
			{ name: 'PAS ', value: '', inline: true },
			{ name: 'DRI ', value: '', inline: true },
			{ name: 'DEF ', value: '', inline: true },
			{ name: 'PHY ', value: '', inline: true },
		)
		.addFields({ name: 'Skill 1:', value: 'Some value here', inline: true })
		.addFields({ name: 'Skill 2:', value: 'Some value here', inline: true })
		.setImage('attachment://PR00001.jpg') // Use the attachment name here
		.setTimestamp();

		await interaction.reply({ embeds: [embed], files: [picAttachment, iconAttachment] });
	},
};