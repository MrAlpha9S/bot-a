const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

const deploy = require('./deploy-commands.js');
const client = require('./bot.js');

client.client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

const cooldowns = new Map();

client.client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	const cooldownTime = 10 * 1000; // 10 seconds in ms
    const userId = interaction.user.id;

	// Check if user is on cooldown
	if (cooldowns.has(userId)) {
		const expirationTime = cooldowns.get(userId) + cooldownTime;
		const timeLeft = (expirationTime - Date.now()) / 1000;

		if (Date.now() < expirationTime) {
			return interaction.reply({
				content: `⏳ You need to wait ${timeLeft.toFixed(1)} more second(s) before using this command again.`,
				ephemeral: true,
			});
		}
		
	}

	// Set cooldown
	cooldowns.set(userId, Date.now());

	// Optional: remove cooldown after time expires to free memory
	setTimeout(() => cooldowns.delete(userId), cooldownTime);

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
});

// Log in to Discord with your client's token
client.client.login(token);