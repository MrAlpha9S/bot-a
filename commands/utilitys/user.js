const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('user')
		.addUserOption(option =>
			option.setName('userid')
				.setDescription('Input User')
				.setRequired(true)) // Mark the option as required	
		.setDescription('Provides information about the user.'),
	async execute(interaction) {
		const userid = interaction.options.getUser('userid');
		await interaction.reply(`<@${userid.id}> is a nigaaa, has username is ${userid.username}`);
	},
};