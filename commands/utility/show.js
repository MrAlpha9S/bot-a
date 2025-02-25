const { SlashCommandBuilder } = require('discord.js');
var conn = require('../../connect.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('show')
		.setDescription('show'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};