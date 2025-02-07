import type { Context, Service, ServiceSchema } from "moleculer";
import DbService from "moleculer-db";
import MongooseAdapter from "moleculer-db-adapter-mongoose";
import { UserModel } from "../models/user.schema";

export type ActionHelloParams = {
	// name: string;
};

type ServiceSettings = {
	defaultName: string;
};

type ServiceMethods = {
	// uppercase(str: string): string;
};

type ServiceThis = Service<ServiceSettings> & ServiceMethods;

const userService: ServiceSchema<ServiceSettings, ServiceThis> = {
	name: "user",

	/**
	 * Settings
	 */
	settings: {
		defaultName: "Moleculer",
	},

	/**
	 * Mixins
	 */
	mixins: [DbService],

	adapter: new MongooseAdapter(process.env.MONGO_URI_CLOUD || "mongodb://localhost/moleculer"),

	model: UserModel,

	/**
	 * Dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {

	},

	/**
	 * Events
	 */
	events: {},

	/**
	 * Methods
	 */
	methods: {
	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {
		this.logger.info(`The ${this.name} service created.`);
	},

	/**
	 * Service started lifecycle event handler
	 */
	async started() {
		this.logger.info(`The ${this.name} service started.`);
	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {
		this.logger.info(`The ${this.name} service stopped.`);
	},
};

export default userService;

