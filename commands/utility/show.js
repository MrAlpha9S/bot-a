const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('show')
		.setDescription('show'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};