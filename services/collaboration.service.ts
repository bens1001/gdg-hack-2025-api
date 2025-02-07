import type { Context, Service, ServiceSchema } from "moleculer";
import DbService from "moleculer-db";
import MongooseAdapter from "moleculer-db-adapter-mongoose";
import { CollaborationModel } from "../models/collaboration.schema";

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

const collaborationService: ServiceSchema<ServiceSettings, ServiceThis> = {
	name: "collaboration",

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

	model: CollaborationModel,

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

export default collaborationService;

