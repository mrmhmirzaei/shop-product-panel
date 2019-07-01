const url = 'https://api.ghoghnoosit.ir';
const settings = require('electron-settings');
async function request(path = '', method = '', body = {}, auth = false) {
    try {
        let options = new Object();
        options['method'] = method;
        if (method != 'GET') {
            options['body'] = JSON.stringify(body);
        }

        let headers = new Object();
        headers['Content-Type'] = 'application/json';
        if (auth == true) {
            let token = await settings.get('auth');
                token = await JSON.parse(token),
                token = token['access_token'];

            headers['authorization'] = 'Bearer ' + token;
        }
        options['headers'] = headers;

        let res = await window.fetch(url + path, options)
        res = await res.clone();
        return await res.json();
    } catch (error) {
        return error;
    }
}

module.exports = { request, url };