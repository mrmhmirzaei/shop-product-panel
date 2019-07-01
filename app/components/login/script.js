const http = require('../../services/http'),
    { ipcRenderer } = require('electron'),
    settings = require('electron-settings');

module.exports = function ($scope, $mdToast, $location) {
    ipcRenderer.send('login', null);

    if (settings.get('auth') != null) {
        $location.path('/dashboard');
    }

    if (window.localStorage.getItem('email')) {
        $scope.email = window.localStorage.getItem('email');
    }
    if (window.localStorage.getItem('password')) {
        $scope.password = window.localStorage.getItem('password');
    }

    $scope.submit = function () {
        let email = $scope.email,
            password = $scope.password;

        if (email == null || email.length == 0) {
            $mdToast.show($mdToast.simple().textContent('آدرس ایمیل وارد نشده است.').action('باشه').hideDelay(3000).highlightAction(true).highlightClass('md-accent'))
        } else if (password == null || password.length == 0) {
            $mdToast.show($mdToast.simple().textContent('رمزعبور وارد نشده است.').action('باشه').hideDelay(3000).highlightAction(true).highlightClass('md-accent'))
        } else {
            document.getElementById('loading').classList.add('show');
            http.request('/auth/admin/login', 'POST', { email, password })
                .then(res => {                    
                    $mdToast.show($mdToast.simple().textContent(res['message']).action('باشه').hideDelay(3000).highlightAction(true).highlightClass('md-accent'));
                    if (res['status'] == true) {
                        window.localStorage.setItem('email', email);
                        window.localStorage.setItem('password', password);
                        settings.set('auth', JSON.stringify(res['auth']));
                        $location.path('/dashboard');
                        document.getElementById('loading').classList.remove('show');
                    }
                }).catch(error => {
                    $mdToast.show($mdToast.simple().textContent('خطا در ارتباط با سرور').hideDelay(3000));
                    document.getElementById('loading').classList.remove('show');
                })
        }
    }
}