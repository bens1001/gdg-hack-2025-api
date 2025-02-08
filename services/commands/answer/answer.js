const { SlashCommandBuilder } = require("@discordjs/builders");
const discord = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("answer")
        .setDescription("Answer a question and create a voice channel for discussion.")
        .addStringOption((option) =>
            option
                .setName("question_id")
                .setDescription("ID of the question you are answering.")
                .setRequired(true),
        )
        .addIntegerOption((option) =>
            option
                .setName("skill_level")
                .setDescription(
                    "Skill level (e.g., 1 for beginner, 2 for intermediate, 3 for advanced).",
                )
                .setRequired(true),
        ),
    async execute(client, interaction, broker) {
        const questionId = interaction.options.getString("question_id");
        const skillLevel = interaction.options.getInteger("skill_level");

        // Ensure the command is used within a guild.
        const guild = interaction.guild;
        if (!guild) return interaction.reply("This command can only be used in a server.");

        try {
            // Create a temporary voice channel for discussion.
            // (In discord.js v13, use type: 'voice'; adjust if you are on v14.)
            const voiceChannel = await guild.channels.create(`discussion-${questionId}`, {
                type: "voice",
                permissionOverwrites: [
                    {
                        id: guild.id,
                        allow: ["VIEW_CHANNEL", "CONNECT", "SPEAK"],
                    },
                ],
            });

			try {
				await broker.call("collaboration.create", {
					question_id: questionId,
					skill_level: skillLevel,
					mentor_discord_id: interaction.user.id,
					mentor_score_increase: skillLevel * 10,
				});
				await broker.call("question.update", {
					id: questionId,
					answered: true,
				});
			} catch (error) {
				return await interaction.reply({
					content: `Error: ${error.message}`,
					ephemeral: true,
				});
			}

            const embed = new discord.MessageEmbed()
                .setTitle("Answer Received")
                .setDescription(
                    `Voice channel **${voiceChannel.name}** created for discussion on question ID: **${questionId}** at skill level **${skillLevel}**.`,
                )
                .setColor("GREEN");

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "Error creating voice channel.", ephemeral: true });
        }
    },
};
