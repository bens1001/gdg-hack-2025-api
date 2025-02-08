import type { Context, Service, ServiceSchema } from "moleculer";
import { Errors } from "moleculer";
const { MoleculerError } = Errors;

import { populate } from "dotenv";
import DbService from "moleculer-db";
import MongooseAdapter from "moleculer-db-adapter-mongoose";
import { MemberModel } from "../models/member.schema";

export type ActionHelloParams = {};

type ServiceSettings = {};

type ServiceMethods = {};

type ServiceThis = Service<ServiceSettings> & ServiceMethods;

const memberService: ServiceSchema<ServiceSettings, ServiceThis> = {
    name: "member",

    /**
     * Settings
     */
    settings: {
        defaultName: "Moleculer",
    },

    /**
     * Dependencies
     */
    dependencies: [],

    /**
     * Mixins
     */
    mixins: [DbService],

    model: MemberModel,

    adapter: new MongooseAdapter(process.env.MONGO_URI_CLOUD || "mongodb://localhost/moleculer"),

    /**
     * Actions
     */
    actions: {
        getMemberByDiscordId: {
            rest: "GET /:discord_id",
            params: {
                discord_id: "string",
            },
            async handler(ctx: Context<{ discord_id: string }>) {
                const { discord_id } = ctx.params;
                const member = await this.adapter.findOne({ discord_id });
                if (!member) {
                    throw new MoleculerError("Member not found", 404);
                }
                return member;
            },
        },
        create: {
            rest: "POST /",
            params: {
                discord_id: "string",
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

export default memberService;
