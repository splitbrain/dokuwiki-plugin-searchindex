/**
 * Web component for searchindex manager plugin
 *
 * @author Andreas Gohr <andi@splitbrain.org>
 * @author Symon Bent <hendrybadao@gmail.com>
 */

class SearchIndexManager extends HTMLElement {
    #pages = null;
    #page = null;
    #url = null;
    #done = 1;
    #count = 0;
    #$msg = null;
    #$buttons = null;
    #force = '';
    #lang = {
        rebuild: '*Rebuild Index',
        rebuild_tip: '*Clears the current index and then adds all pages from scratch.',
        update: '*Update Index',
        update_tip: '*Updates the index for any changed pages since the last update.',
        finding: '*Finding pages...',
        pages: '*Found %d pages.',
        indexing: '*Indexing',
        indexed: '*indexed',
        notindexed: '*not indexed',
        done: '*Finished indexing.',
        clearing: '*Clearing index...',
    };

    connectedCallback() {
        this.#lang = {...this.#lang, ...JSON.parse(this.getAttribute('lang'))};
        this.#url = this.getAttribute('url');
        this.#render();
        this.#$msg = this.querySelector('.msg');
        this.#$buttons = this.querySelector('.buttons');

        this.querySelector('.rebuild').addEventListener('click', () => this.#rebuild());
        this.querySelector('.update').addEventListener('click', () => this.#update());
    }

    /**
     * Render the component HTML
     */
    #render() {
        this.innerHTML = `
            <div class="buttons">
                <input type="button" class="button rebuild" value="${this.#lang.rebuild}">
                <p>${this.#lang.rebuild_tip}</p>
                <input type="button" class="button update" value="${this.#lang.update}">
                <p>${this.#lang.update_tip}</p>
            </div>
            <div class="msg"></div>
        `;
    }

    /**
     * Gives textual feedback
     */
    #message(text) {
        if (text.charAt(0) !== '<') {
            text = `<p>${text}</p>`;
        }
        this.#$msg.innerHTML = text;
    }

    /**
     * Send a POST request to the ajax endpoint
     */
    async #post(params) {
        const response = await fetch(this.#url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params
        });
        return response.json();
    }

    /**
     * Starts the indexing of a page.
     */
    async #index() {
        if (this.#page) {
            const indexed = await this.#post(`call=indexpage&page=${encodeURIComponent(this.#page)}&force=${this.#force}`);
            const wait = 250;
            // next page from queue
            this.#page = this.#pages.shift();
            this.#done++;

            const msg = indexed ? this.#lang.indexed : this.#lang.notindexed;
            const status = `<p class="status">${msg}</p>`;
            this.#message(`<p>${this.#lang.indexing} ${this.#done}/${this.#count}</p><p class="name">${this.#page}</p>${status}`);
            // next index run
            setTimeout(() => this.#index(), wait);
        } else {
            this.#finished();
        }
    }

    /**
     * Called when indexing is complete
     */
    #finished() {
        this.#throbberOff();
        this.#message(this.#lang.done);
        setTimeout(() => {
            this.#message('');
            this.#$buttons.style.display = '';
        }, 3000);
    }

    /**
     * Cleans the index (ready for complete rebuild)
     */
    async #clear() {
        this.#message(this.#lang.clearing);
        const success = await this.#post('call=clearindex');
        if (!success) {
            this.#message(this.#lang.clearing + ' - failed, retrying...');
            // retry
            setTimeout(() => this.#clear(), 5000);
        } else {
            // start indexing
            this.#force = 'true';
            setTimeout(() => this.#index(), 1000);
        }
    }

    /**
     * Starts a full rebuild (clear + reindex)
     */
    #rebuild() {
        this.#update(true);
    }

    /**
     * Starts the index update
     */
    async #update(rebuild = false) {
        this.#done = 1;
        this.#$buttons.style.display = 'none';
        this.#throbberOn();
        this.#message(this.#lang.finding);
        this.#pages = await this.#post('call=pagelist');
        if (this.#pages.length) {
            this.#count = this.#pages.length;
            this.#message(this.#lang.pages.replace(/%d/, this.#pages.length));

            // move the first page from the queue
            this.#page = this.#pages.shift();

            // complete index rebuild?
            if (rebuild === true) {
                this.#clear();
            } else {
                this.#force = '';
                // just start indexing immediately
                setTimeout(() => this.#index(), 1000);
            }
        } else {
            this.#finished();
        }
    }

    /**
     * Add a throbber image
     */
    #throbberOn() {
        this.#$msg.classList.add('updating');
    }

    /**
     * Stop the throbber
     */
    #throbberOff() {
        this.#$msg.classList.remove('updating');
    }
}

customElements.define('searchindex-manager', SearchIndexManager);
