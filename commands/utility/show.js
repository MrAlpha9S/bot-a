const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('show')
		.setDescription('Show player information.'),
	async execute(interaction) {
		await interaction.reply('Ping!');
	},
};