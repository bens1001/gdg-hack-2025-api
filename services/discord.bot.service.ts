import fs from "fs";
import path from "path";
import { REST } from "@discordjs/rest";
import Ascii from "ascii-table";
import { Routes } from "discord-api-types/v9";
import { Client, Collection, Intents } from "discord.js";
import type { Context, Service, ServiceSchema } from "moleculer";

type DiscordBotSettings = {
	discordToken: string;
	clientId: string;
	guildId: string;
};

type DiscordBotMethods = {
	initializeClient(): Promise<void>;
	handleInteractions(): void;
	loadCommands(): Promise<void>;
};

type DiscordBotThis = Service<DiscordBotSettings> &
	DiscordBotMethods & {
		client?: Client & { commands: Collection<string, any> };
	};

const discordBotService: ServiceSchema<DiscordBotSettings, DiscordBotThis> = {
	name: "discordbot",

	settings: {
		discordToken: process.env.DISCORD_TOKEN || "YOUR_BOT_TOKEN",
		clientId: process.env.CLIENT_ID || "YOUR_CLIENT_ID",
		guildId: process.env.GUILD_ID || "YOUR_GUILD_ID",
	},

	dependencies: [],

	actions: {
		/**
		 * Start the Discord bot manually.
		 */
		startBot: {
			rest: {
				method: "POST",
				path: "/start",
			},
			async handler(this: DiscordBotThis) {
				await this.initializeClient();
				return "Discord bot started successfully!";
			},
		},

		/**
		 * Stop the Discord bot manually.
		 */
		stopBot: {
			rest: {
				method: "POST",
				path: "/stop",
			},
			async handler(this: DiscordBotThis) {
				if (this.client) {
					await this.client.destroy();
					this.logger.info("Discord client destroyed.");
				}
				return "Discord bot stopped successfully!";
			},
		},
	},

	events: {},

	methods: {
		async initializeClient(this: DiscordBotThis) {
			// Create the Discord client with the required intents.
			this.client = new Client({
				intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
			}) as Client & { commands: Collection<string, any> };

			// Initialize the commands collection
			this.client.commands = new Collection();

			this.client.once("ready", () => {
				this.logger.info(`Logged in as ${this.client?.user?.tag}`);
			});

			// Load commands from the file system and register them with Discord.
			await this.loadCommands();

			// Set up interaction handler.
			this.handleInteractions();

			// Login to Discord.
			this.client.login(this.settings.discordToken).catch((error) => {
				this.logger.error("Failed to login:", error);
			});
		},

		handleInteractions(this: DiscordBotThis) {
			this.client?.on("interactionCreate", async (interaction) => {
				if (!interaction.isCommand()) return;

				const command = this.client?.commands.get(
					interaction.commandName
				);
				if (!command) {
					await interaction.reply("Unknown command.");
					return;
				}

				// Check if the member exists in the database.
				const discordMember = await this.broker.call(
					"member.getMemberByDiscordId",
					{
						discord_id: interaction.user.id,
					}
				);
				if (!discordMember) {
					await this.broker.call("member.create", {
						discord_id: interaction.user.id,
					});
				}
				try {
					// Execute the command's execute method.
					await command.execute(
						this.client,
						interaction,
						this.broker
					);
				} catch (error) {
					this.logger.error(error);
					await interaction.reply({
						content:
							"There was an error while executing this command!",
						ephemeral: true,
					});
				}
			});
		},

		/**
		 * Loads commands from the file system and registers them with Discord.
		 */
		async loadCommands(this: DiscordBotThis) {
			const commands = [];
			const table = new Ascii().setHeading(
				"Slash Commands",
				"Load Status"
			);
			// Adjust the path according to your project structure.
			const commandFolders = fs.readdirSync(
				path.join(__dirname, "/commands")
			);
			for (const folder of commandFolders) {
				const commandFiles = fs
					.readdirSync(path.join(__dirname, `/commands/${folder}`))
					.filter(
						(file) => file.endsWith(".js") || file.endsWith(".ts")
					);
				this.logger.info(`Started loading commands...`);
				for (const file of commandFiles) {
					// Dynamically import the command module.
					const commandModule = await import(
						`./commands/${folder}/${file}`
					);
					const command = commandModule.default || commandModule;
					if (command.data) {
						this.client?.commands.set(command.data.name, command);
						commands.push(command.data.toJSON());
						table.addRow(file, "Loaded ✔️");
					} else {
						table.addRow(file, "❌ => Missing command data");
					}
				}
			}
			this.logger.info(table.toString());

			// Create a REST client for command registration.
			const rest = new REST({ version: "9" }).setToken(
				this.settings.discordToken
			);
			try {
				await rest.put(
					Routes.applicationGuildCommands(
						this.settings.clientId,
						this.settings.guildId
					),
					{ body: commands }
				);
				this.logger.info(
					"Successfully registered application commands."
				);
			} catch (error) {
				this.logger.error("Error registering commands:", error);
			}
		},
	},

	created(this: DiscordBotThis) {
		this.logger.info("[discordBot] Service created.");
	},

	async started(this: DiscordBotThis) {
		this.logger.info("[discordBot] Service started.");
		await this.initializeClient();
	},

	async stopped(this: DiscordBotThis) {
		this.logger.info("[discordBot] Service stopped.");
		await this.client?.destroy();
	},
};

export default discordBotService;
