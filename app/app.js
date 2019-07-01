const { remote } = require('electron'), { dialog } = remote,
    win = remote.getCurrentWindow();

const app = angular.module('app', ['ngMaterial', 'ngMessages', 'ngRoute']);
app.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: './components/login/template.html',
            controller: 'login'
        })
        .when('/dashboard', {
            templateUrl: './components/dashboard/template.html',
            controller: 'dashboard'
        })
});

app.controller('login', require('./components/login/script'));
app.controller('dashboard', require('./components/dashboard/script'));
app.controller('upload', async function($scope, $mdBottomSheet) {
    $scope.image = 'file://' + await window.sessionStorage.getItem('image');
    $scope.uploadResult = function(result) {
        $mdBottomSheet.hide(result);
    }
})

document.addEventListener('keyup', event => {
    if (event.keyCode == 116) {
        window.location.reload();
    }
})

function openFile() {
    let res = dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: 'Image File (.jpg, .png)', extensions: ['jpg', 'png'] }] });
    if (!res) return null;
    else return res[0];
}