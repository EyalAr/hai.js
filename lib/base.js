import * as when from "when/when";
import * as postal from "postal";

var syms = {
    channel: Symbol("channel"),
    subscriptions: Symbol("subscriptions"),
    unsubscribers: Symbol("unsubscribers"),
    started: Symbol("started"),
    memory: Symbol("memory")
};

/**
 * Base class for all other classes. Provides:
 * 1. Pub / Sub
 * 2. Start / Stop
 */
class Base {

    /**
     * Constructs a new Base object.
     * @param {Boolean} memory Should this component postpone publications
     * while it is stopped. If true, publications will be published when the
     * component is started.
     */
    constructor(memory = true){
        this[syms.channel] = postal.channel(this.generateRandomString());
        this[syms.subscriptions] = [];
        this[syms.unsubscribers] = [];
        this[syms.started] = false;
        this[syms.memory] = memory ? [] : false;
    }

    /**
     * Publish messages on the component.
     * If messages are published while the component is stopped:
     *     - If memory is enabled, publications will be postponed until the
     *       component is started.
     *     - Otherwise, an error will be thrown.
     * See https://github.com/postaljs/postal.js/wiki/ChannelDefinition
     * @param {String} topic The topic of the publication.
     * @param {Object} data Optional data
     */
    publish(...args){
        if (this[syms.started])
            this[syms.channel].publish(...args);
        else if (this[syms.memory])
            this[syms.memory].push(args);
        else
            throw Error("Unable to publish. Not started and no memory.");
    }

    /**
     * Subscribe to a topic on the component.
     * See https://github.com/postaljs/postal.js/wiki/ChannelDefinition
     * @param {String} topic The topic of the publication.
     * @param {Function} callback Function to call when a message is published
     * on the given topic.
     */
    subscribe(...args){
        this[syms.subscriptions].push(args);
        if (this[syms.started])
            this[syms.unsubscribers].push(
                this[syms.channel].subscribe(...args)
            );
    }

    /**
     * Start the component.
     * 1. Activate all subscriptions.
     * 2. Publish all postponed publications.
     * @return {Promise} Promise which is resolved when the component is
     * started.
     */
    start(){
        this[syms.started] = true;
        this[syms.subscriptions].forEach(args => this.subscribe(...args));
        if (this[syms.memory]){
            this[syms.memory].forEach(args => this.publish(...args));
            this[syms.memory] = [];
        }
        return when();
    }

    /**
     * Stop the component by deactivating all subscriptions.
     * @return {Promise} Promise which is resolved when the component is
     * stopped.
     */
    stop(){
        this[syms.unsubscribers].forEach(us => us());
        this[syms.unsubscribers] = [];
        this[syms.started] = false;
        return when();
    }

    /**
     * Check if the component is started.
     * @return {Boolean}
     */
    isStarted(){
        return this[syms.started];
    }

    /**
     * Relay all publications on this component to another component.
     * @param {Component} to The component to relay messages to. Must have a
     * 'publish' method.
     * @param {...String} topics Topics to relay.
     */
    relayTo(to, ...topics){
        topics.forEach(
            topic => this.subscribe(
                topic,
                data => to.publish(topic, data)
            )
        );
    }

    /**
     * Create a random string componsed of alphanumeric chars.
     * @return {String}
     */
    static generateRandomString(){
        return Math.random().toString(36).substr(2);
    }
}

export default Base;
