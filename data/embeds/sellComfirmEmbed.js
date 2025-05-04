const { ButtonBuilder, ButtonStyle, ComponentType, ActionRowBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');
const { conn, sql } = require('../../connect.js');

module.exports = {
    data: {
		name: 'sellComfirm',
		description: 'Sell Comfirm',
	},

	async execute(interaction, cardID) {
        const id = interaction.user.id;

        try {
            const pool = await conn;
			if (!pool) throw new Error("Database connection failed");

			const ps = new sql.PreparedStatement(pool);
			ps.input('userid', sql.VarChar(50));
            ps.input('cardid', sql.VarChar(7));

			const query = `
				SELECT c.name, c.cardID, c.cost FROM Cards c
				LEFT JOIN UserCard uc ON uc.cardID = c.cardID
				WHERE uc.userID = @userid AND c.cardID = @cardid AND uc.amount > 0
			`;

			await ps.prepare(query);
			const result = await ps.execute({ userid: id, cardid: cardID });
            await ps.unprepare();

            const card = result.recordset[0];

            const confirmButton = new ButtonBuilder()
                .setCustomId('confirmSell')
                .setLabel('Confirm')
                .setStyle(ButtonStyle.Success);

            const cancelButton = new ButtonBuilder()
                .setCustomId('cancelSell')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder()
                .addComponents(confirmButton, cancelButton);

            await interaction.reply({ content:`You're selling ${card.name} to earn ${card.cost/10} Coins, Are you sure?`, components: [row], ephemeral: true });

            // Create a filter for the button interactions
            const filter = i => i.user.id === id && (i.customId === 'confirmSell' || i.customId === 'cancelSell');

            // Create a collector for the button interactions
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

            collector.on('collect', async i => {
                if (i.customId === 'confirmSell') {
                    const cost = card.cost / 10; // Calculate the cost in coins

                    const ps1 = new sql.PreparedStatement(pool);
                    ps1.input('userid', sql.VarChar(50));
                    ps1.input('cardid', sql.VarChar(7));
                    ps1.input('cost', sql.Int);

                    const sellQuery = `
                        UPDATE UserCard SET amount = amount - 1 WHERE userID = @userid AND cardID = @cardid;
                        UPDATE Users SET currency = currency + @cost WHERE userID = @userid;
                    `;

                    await ps1.prepare(sellQuery);
                    await ps1.execute({ userid: id, cardid: cardID, cost: cost });
                    await ps1.unprepare();

                    await i.update({ content: 'Card sold successfully!', components: [] });
                    // Add your logic to remove the card from the user's inventory and add coins here
                } else if (i.customId === 'cancelSell') {
                    await i.update({ content: 'Sell cancelled.', components: [] });
                }
                collector.stop(); // Stop the collector after handling the interaction
            });

            collector.on('end', async () => {
				confirmButton.setDisabled(true);
                cancelButton.setDisabled(true);
			});

        } catch (error) {
            console.error('Error executing command:', error);
            await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
        }
    
    }

};