import when from "when/when";
import postal from "postal";

var syms = {
    channel: Symbol("channel"),
    subscriptions: Symbol("subscriptions"),
    unsubscribers: Symbol("unsubscribers"),
    started: Symbol("started"),
    memory: Symbol("memory"),
    id: Symbol("id")
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
        var id = Base.generateRandomString();
        this[syms.id] = id;
        this[syms.channel] = postal.channel(id);
        this[syms.subscriptions] = [];
        this[syms.started] = false;
        this[syms.memory] = memory ? [] : false;
    }

    /**
     * Publish messages on the component.
     *
     * If messages are published while the component is stopped:
     *
     * - If memory is enabled, publications will be postponed until the
     *   component is started.
     *
     * - Otherwise, an error will be thrown.
     *
     * See https://github.com/postaljs/postal.js/wiki/ChannelDefinition
     *
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
     *
     * See https://github.com/postaljs/postal.js/wiki/ChannelDefinition
     *
     * @param {String} topic The topic of the publication.
     * @param {Function} callback Function to call when a message is published
     * on the given topic.
     * @return {Function} Unsubscribe function
     */
    subscribe(...args){
        var that = this, s = { args: args };
        this[syms.subscriptions].push(s);
        if (this[syms.started]){
            var _s = that[syms.channel].subscribe(...args);
            s.us = _s.unsubscribe.bind(_s);
        }
        return function(){
            if (s === null) throw Error("This subscription was already removed");
            var i = that[syms.subscriptions].indexOf(s);
            that[syms.subscriptions].splice(i, 1);
            if (s.us) s.us();
            s = null; // allow to be gc'd
        };
    }

    /**
     * Start the component.
     *
     * 1. Activate all subscriptions.
     *
     * 2. Publish all postponed publications.
     *
     * @return {Promise} Promise which is resolved when the component is
     * started.
     */
    start(){
        var that = this;
        this[syms.started] = true;
        this[syms.subscriptions].forEach(function(s){
            var _s = that[syms.channel].subscribe(...s.args);
            s.us = _s.unsubscribe.bind(_s);
        });
        if (this[syms.memory]){
            this[syms.memory].forEach(args => this.publish(...args));
            this[syms.memory] = [];
        }
        return when();
    }

    /**
     * Stop the component by deactivating all subscriptions.
     *
     * @return {Promise} Promise which is resolved when the component is
     * stopped.
     */
    stop(){
        this[syms.subscriptions].forEach(function(s){
            s.us();
            delete s.us;
        });
        this[syms.started] = false;
        return when();
    }

    /**
     * Check if the component is started.
     *
     * @return {Boolean}
     */
    isStarted(){
        return this[syms.started];
    }

    /**
     * Relay all publications on this component to another component.
     *
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
     * Get the component's id
     *
     * @return {String}
     */
    getId(){
        return this[syms.id];
    }

    /**
     * Create a random string componsed of alphanumeric chars.
     *
     * @return {String}
     * @private
     */
    static generateRandomString(){
        return Math.random().toString(36).substr(2);
    }
}

export default Base;
