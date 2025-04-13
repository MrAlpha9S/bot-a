const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const path = require('path');
const { conn, sql } = require('../../connect.js');

module.exports = {
    data: {
        name: 'teamEmbed',
        description: 'Show your team',
    },

    async execute(interaction) {

        const user = interaction.user;
        const id = interaction.user.id;
        const avatarURL = user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 });

        try {
            const pool = await conn;
            if (!pool) throw new Error("Database connection failed");

            const ps = new sql.PreparedStatement(pool);
            ps.input('userid', sql.VarChar(50));

            const query = `
                SELECT ut.slot, c.name, ut.pos, ut.line FROM UserTeam ut
                LEFT JOIN Cards c ON ut.cardid = c.cardid
                WHERE userid = @userid;
            `;

            await ps.prepare(query);

            const result = await ps.execute({ userid: id });

            await ps.unprepare(); // Unprepare immediately after execution

            if (!result.recordset.length) {
                return interaction.reply({ content: 'Not Found!', ephemeral: true });
            }

            const lineData = {
                line1: '',
                line2: '',
                line3: '',
                line4: '',
                line5: ''
            }

            const results = result.recordset;
            results.forEach(resultsData => {
                if (resultsData.line == 1) {
                    const name = resultsData.name.split(' ')[1] + ' ';
                    lineData.line1 += name;
                }
                if (resultsData.line == 2) {
                    const name = resultsData.name.split(' ')[1] + ' ';
                    lineData.line2 += name;
                }
                if (resultsData.line == 3) {
                    const name = resultsData.name.split(' ')[1] + ' ';
                    lineData.line3 += name;
                }
                if (resultsData.line == 4) {
                    const name = resultsData.name.split(' ')[1] + ' ';
                    lineData.line4 += name;
                }
                if (resultsData.line == 5) {
                    const name = resultsData.name.split(' ')[1] + ' ';
                    lineData.line5 += name;
                }            
            });

            

            // Create embed message
            const embed = new EmbedBuilder()
                .setColor(0xFFFFFF)
                .setTitle(`${user.username}'s Team`)
                .setThumbnail(avatarURL)
                .setDescription(`...`)
                .addFields(
                    { name: `=====================================`, value: ``, inline: false },
                    { name: `line 5: ${lineData.line5}`, value: ``, inline: false },
                    { name: `line 4: ${lineData.line4}`, value: ``, inline: false },
                    { name: `line 3: ${lineData.line3}`, value: ``, inline: false },
                    { name: `line 2: ${lineData.line2}`, value: ``, inline: false },
                    { name: `line 1: ${lineData.line1}`, value: ``, inline: false },
                    { name: `=====================================`, value: ``, inline: false },
                )
                .setFooter({ text: `ID: ${id}` });

            await interaction.reply({ embeds: [embed], components: [] });

        } catch (err) {
            console.error('Error executing command:', err);

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'An unexpected error occurred. Please try again later.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'An unexpected error occurred. Please try again later.', ephemeral: true });
            }
        }
    }
}