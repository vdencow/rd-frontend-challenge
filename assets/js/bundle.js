/**
 * @author Hugo Calheira <https://github.com/hugocalheira> challenge author
 * @author Victor Dencowski <vdencobr@gmail.com>
 * 
 */


/* Header const to use with fetch */
const HEADERS = {
'Content-Type': 'application/json',
'Access-Control-Allow-Origin': '*'
};

/**
 * Helper function to create svgs
 * @param {string} node node name 
 * @param {Attributes} att attributes
 * @returns {ElementNs} node
 * @example let myCircle = getNode('circle', {fill: 'red', 'stroke-width': 2})
 */
function getNode(node, att) {
    node = document.createElementNS("http://www.w3.org/2000/svg", node);
    for (var p in att)
    node.setAttributeNS(null, p, att[p]);
    return node
}

const MANIPULATE =  {
    el: this,
    /**
     * Creates a child element inside of it
     * @param {Element} child 
     * @returns {ChainableManipulator} this
     * @example divElement.add(spanElement)
     */
    add (child) {
        el = this.appendChild(child);
        return this
    },
    /**
     * Apply the hide class to it and remove the show class
     * @returns {ChainableManipulator} this
     * @example divElement.hide()
     */
    hide() {
        this.classList.remove('show')
        this.classList.add('hide')
        return this
    },
    /**
     * Apply the show class and removes the hide class to it
     * @returns {ChainableManipulator} this
     * @example divElement.show()
     */
    show() {
        this.classList.remove('hide')
        this.classList.add('show')
        return this
    }

    /* Add any dom manipulation functions here, such as wrap, animate, destroy */
    
};

/* Prototype duckpatching */
Element.prototype = Object.assign(Element.prototype, MANIPULATE);

(() => {
    /**
     * Select a element by querySelector
     * @param {String} selector 
     * @returns {Element} 
     * @example let mainApp = selector('#app')
     */
    const selector = selector => document.querySelector(selector); 
    /**
     * Create a element with a tag
     * @param {String} elementTag
     * @returns {Element} element
     * @example let myDiv = create('div')
     */
    const create = elementTag => app.appendChild(document.createElement(elementTag));


    const app = selector('#app');


    const Login = create('div');
    Login.classList.add('login');

    const Logo = create('img');
    Logo.src = './assets/images/logo.svg';
    Logo.classList.add('logo');

    /* Spinner */
    const spinner = getNode("svg", {viewBox: '0 0 50 50'})
    spinner.classList.add('spinner');
    spinner.hide();
    spinner.add(
        getNode('circle', {cx: '25', cy: '25', r: '20', fill: 'none', 'stroke-width': '3', class:"path"})
    )
    app.add(spinner)

    /* Form */
    const Form = create('form');
    Form.onsubmit = async e => {
        e.preventDefault();

        const [email, password] = e.target.children;

        const {url} = await fakeAuthenticate(email.value, password.value);

        location.href='#users';
        
        const users = await getDevelopersList(url);

        renderPageUsers(users);
    };

    Form.oninput = e => {
        const [email, password, button] = e.target.parentElement.children;
        (!email.validity.valid || !email.value || password.value.length <= 5) 
            ? button.setAttribute('disabled','disabled')
            : button.removeAttribute('disabled');
    };

    Form.innerHTML = 
    `
    <input type="text" name="user" value="" class="form-input" placeholder="Entre com seu e-mail"> 
    <input type="password" name="pass" value="" class="form-input" placeholder="Digite sua senha supersecreta" >
    <button type="submit" name="formSubmit" class="form-button" disabled="disabled" > Entrar </button> 
    `;

    app.add(Logo)
    Login.add(Form)

    /**
     * Use to authenticate with email and password. Will return data received from the server
     * @param {String} email 
     * @param {String} password 
     * @returns {*} data
     */
    async function fakeAuthenticate(email, password) {
        const data = await fetch(
            'http://www.mocky.io/v2/5dba690e3000008c00028eb6',
            {method: 'GET', headers: HEADERS}
        ).then(function(response) {
            return response.json();
        });

        const fakeJwtToken = `${btoa(email+password)}.${btoa(data.url)}.${(new Date()).getTime()+300000}`;
        localStorage.setItem('token', fakeJwtToken)
        return data;
    }

    /**
     * Use to get the developer list once authenticated
     * @param {String} url
     * @returns {Array}
     * @example let devs = await getDevelopersList('www.mysite.com/devs')
     */
    async function getDevelopersList(url) {
        spinner.show();
        Form.hide();
        const data = await fetch(
            url,
            {method: 'GET', headers: HEADERS}
        ).then(function(response) {
            return response.json();
        })

        return data;
    }

    /**
     * Renders the users array into a pretty list
     * @param {Array} users
     * @returns {void} Does not return
     * @example renderPageUsers([{avatar: 'via.placeholder.com/64', login: 'vdenco'}])
     */
    function renderPageUsers(users) {
        app.classList.add('logged');
        Login.style.display = 'none' // value modifiable
        Logo.style.top = "20px";// modifiable

        const Ul = create('ul');
        Ul.classList.add('users-container');

        users.map(user => {
            const li = create('li');
            li.classList.add('user-item');

            const avatar = create('img');
            avatar.src = user.avatar_url;

            const username = document.createTextNode(user.login);

            li.appendChild(avatar);
            li.appendChild(username);
            return li
        })
        .reduce((prev, curr) => {
            return prev.add(curr)
        }, Ul)

        app.add(Ul);
        spinner.hide();
        Form.show();

    }

    // init
    (async function(){
        const rawToken = localStorage.getItem('token');
        const token = rawToken ? rawToken.split('.') : null
        if (!token || token[2] < (new Date()).getTime()) {
            localStorage.removeItem('token');
            location.href='#login';
            app.add(Login)
        } else {
            location.href='#users';
            const users = await getDevelopersList(atob(token[1]));
            renderPageUsers(users);
        }
    })()
})()