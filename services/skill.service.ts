import type { Context, Service, ServiceSchema } from "moleculer";
import DbService from "moleculer-db";
import MongooseAdapter from "moleculer-db-adapter-mongoose";
import { SkillModel } from "../models/skill.schema";

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

const skillService: ServiceSchema<ServiceSettings, ServiceThis> = {
	name: "skill",

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

	model: SkillModel,

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

export default skillService;

