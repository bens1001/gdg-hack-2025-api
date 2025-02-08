import { create } from "lodash";
import type { Context, Service, ServiceSchema } from "moleculer";
import DbService from "moleculer-db";
import MongooseAdapter from "moleculer-db-adapter-mongoose";
import { QuestionModel } from "../models/question.schema";

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

const questionService: ServiceSchema<ServiceSettings, ServiceThis> = {
    name: "question",

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

    model: QuestionModel,

    /**
     * Dependencies
     */
    dependencies: [],

    /**
     * Actions
     */
    actions: {
        create: {
            rest: "POST /",
            params: {
                discord_id: "string",
                question_text: "string",
                skill: "string",
            },
            async handler(
                ctx: Context<{ discord_id: string; question_text: string; skill: string }>,
            ) {
                const { discord_id, question_text, skill } = ctx.params;
                const question = await this.adapter.insert({
                    discord_id,
                    question_text,
                    skill,
                });
                return question;
            },
        },
    },

    /**
     * Events
     */
    events: {},

    /**
     * Methods
     */
    methods: {},

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

export default questionService;
