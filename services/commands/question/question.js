const { SlashCommandBuilder } = require("@discordjs/builders");
const discord = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("question")
        .setDescription("Ask a question.")
        .addStringOption((option) =>
            option
                .setName("text")
                .setDescription("The question you want to ask.")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("skill")
                .setDescription("The skill related to your question (e.g., JavaScript).")
                .setRequired(true),
        ),
    async execute(client, interaction, args) {
        const questionText = interaction.options.getString("text");
        const skill = interaction.options.getString("skill");

        // Here you might insert the question into your database for logging.
        // For demonstration, we simply reply with an embed.

        const embed = new discord.MessageEmbed()
            .setTitle("Question Received")
            .setDescription(
                `Your question: **${questionText}** has been received for the skill: **${skill}**.`,
            )
            .setColor("BLUE");

        await interaction.reply({ embeds: [embed] });
    },
};
