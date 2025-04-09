const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('avatar')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Input User')
				.setRequired(true)) // Mark the option as required	
		.setDescription("Shows a user's avatar"),
	async execute(interaction) {
		// Get the user (either the mentioned user or the one who ran the command)
		const user = interaction.options.getUser('user');

		// Get high-resolution avatar URL
		const avatarURL = user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 });

		// Create embed
		const embed = new EmbedBuilder()
			.setColor(0xFFFFFF)
			.setTitle(`${user.username}'s Avatar`)
			.setImage(avatarURL)
			.setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
			.setTimestamp();

		// Send the embed
		await interaction.reply({ embeds: [embed] });
	},
};