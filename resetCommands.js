const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');

const rest = new REST().setToken(token);

(async () => {
	try {
		// Fetch and log existing guild commands
		const guildCommands = await rest.get(Routes.applicationGuildCommands(clientId, guildId));
		console.log('Existing guild commands:', guildCommands);

		// Fetch and log existing global commands
		const globalCommands = await rest.get(Routes.applicationCommands(clientId));
		console.log('Existing global commands:', globalCommands);

		// Delete all guild-based commands
		await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] });
		console.log('Successfully deleted all guild commands.');

		// Delete all global commands
		await rest.put(Routes.applicationCommands(clientId), { body: [] });
		console.log('Successfully deleted all application commands.');
	} catch (error) {
		console.error('Error while deleting commands:', error);
	}
})();