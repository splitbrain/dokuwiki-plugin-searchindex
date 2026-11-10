/**
 * Web component for searchindex manager plugin
 *
 * @author Andreas Gohr <andi@splitbrain.org>
 * @author Symon Bent <hendrybadao@gmail.com>
 */

class SearchIndexManager extends HTMLElement {
    /** Number of consecutive failed requests after which the run stops */
    static MAX_ERRORS = 5;

    #pages = null;
    #page = null;
    #url = null;
    #sectok = '';
    #done = 1;
    #count = 0;
    #$msg = null;
    #$buttons = null;
    #force = '';
    #errors = 0;
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
        error: '*Error:',
        aborted: '*Indexing stopped because of too many errors.',
    };

    connectedCallback() {
        this.#lang = {...this.#lang, ...JSON.parse(this.getAttribute('lang'))};
        this.#url = this.getAttribute('url');
        this.#sectok = this.getAttribute('sectok');
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
     *
     * @throws {Error} when the request fails or the response is not valid JSON
     */
    async #post(params) {
        const response = await fetch(this.#url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `${params}&sectok=${encodeURIComponent(this.#sectok)}`
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
        return response.json();
    }

    /**
     * Count a failed request and stop the run when there are too many
     *
     * @param {Error} error the error of the failed request
     * @param {string} context what the request was for
     * @returns {boolean} true when the run was stopped
     */
    #fail(error, context) {
        console.error('searchindex:', context, error);
        if (++this.#errors < SearchIndexManager.MAX_ERRORS) return false;

        this.#abort(`${this.#lang.aborted} ${this.#lang.error} ${error.message}`);
        return true;
    }

    /**
     * Stop the run and show the given message
     *
     * @param {string} msg the message to show
     */
    #abort(msg) {
        this.#throbberOff();
        this.#message(msg);
        this.#$buttons.style.display = '';
    }

    /**
     * Starts the indexing of a page.
     */
    async #index() {
        if (this.#page) {
            let msg;
            try {
                const indexed = await this.#post(`call=indexpage&page=${encodeURIComponent(this.#page)}&force=${this.#force}`);
                msg = indexed ? this.#lang.indexed : this.#lang.notindexed;
                this.#errors = 0;
            } catch (e) {
                if (this.#fail(e, this.#page)) return;
                msg = `${this.#lang.error} ${this.#page}: ${e.message}`;
            }
            const wait = 250;
            // next page from queue
            this.#page = this.#pages.shift();
            this.#done++;

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
        let success = false;
        let error = new Error('clearindex failed');
        try {
            success = await this.#post('call=clearindex');
        } catch (e) {
            error = e;
        }
        if (!success) {
            if (this.#fail(error, 'clearindex')) return;
            this.#message(this.#lang.clearing + ' - failed, retrying...');
            // retry
            setTimeout(() => this.#clear(), 5000);
        } else {
            this.#errors = 0;
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
        this.#errors = 0;
        this.#$buttons.style.display = 'none';
        this.#throbberOn();
        this.#message(this.#lang.finding);
        try {
            this.#pages = await this.#post('call=pagelist');
        } catch (e) {
            console.error('searchindex: pagelist', e);
            this.#abort(`${this.#lang.error} ${e.message}`);
            return;
        }
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
