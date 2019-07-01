const { ipcRenderer } = require('electron'),
    http = require('../../services/http'),
    settings = require('electron-settings');

module.exports = function($scope, $location, $mdBottomSheet, $mdToast, $mdDialog) {
    ipcRenderer.send('main', null);
    $scope.loading = false;
    $scope.filter = {};
    $scope.data = {
        name: '',
        brand: '',
        category: '',
        keywords: [],
        descriptions: '',
        features: {
            good: [],
            bad: [],
        },
        box: {
            length: '', // طول 
            width: '', // عرض
            height: '', // ارتفاع
            weight: '', // وزن
        },
        images: {
            front: null,
            back: null,
            gallary: []
        },
        specifications: []
    };
    $scope.products = null;
    $scope.brands = [];
    $scope.categories = [];
    $scope.optionsGroup = [];
    $scope.specifications = [];
    $scope.none = "";
    $scope.feature = "";
    $scope.categoryID = "";
    $scope.brandID = "";

    $scope.fetchBrands = async function() {
        try {
            let res = await http.request('/api/brand', 'GET', {}, true);
            $scope.brands = res['data'];
            $scope.$apply();
        } catch (error) {
            console.error(error);
        }
    }

    $scope.fetchOptionsGroup = async function() {
        try {
            let res = await http.request('/api/specifications/group', 'GET', {}, true);
            $scope.optionsGroup = res['data'];
            $scope.$apply();
        } catch (error) {
            console.error(error);
        }
    }

    $scope.fetchCategories = async function() {
        try {
            let res = await http.request('/api/categories', 'GET', {}, true);
            $scope.categories = res['data'];
            $scope.$apply();
        } catch (error) {
            console.error(error);
        }
    }


    $scope.fetchProducts = async function() {
        try {
            $scope.products = null;
            let res = await http.request('/api/products', 'POST', $scope.filter, true);
            $scope.products = res['data'];
            $scope.$apply();
        } catch (error) {
            console.error(error);
        }
    }

    $scope.searchFilter = function(event) {
        if (event.keyCode == 13) {
            $scope.fetchProducts();
        }
    }

    $scope.openFabButton = function(empty = false) {
        if (document.querySelector('div.fab-button').classList.contains('open')) return;
        if (empty == true) {
            $scope.data = {
                name: '',
                brand: '',
                category: '',
                keywords: [],
                descriptions: '',
                features: {
                    good: [],
                    bad: [],
                },
                box: {
                    length: '', // طول 
                    width: '', // عرض
                    height: '', // ارتفاع
                    weight: '', // وزن
                },
                images: {
                    front: null,
                    back: null,
                    gallary: []
                },
                specifications: []
            };
            $scope.brandID = "";
            $scope.categoryID = "";
        }
        document.querySelector('div.fab-button').classList.add('open');
        setTimeout(() => {
            document.querySelector('div.fab-button div.form').classList.add('show');
        }, 400);
    }

    $scope.closeFabButton = function() {
        document.querySelector('div.form').classList.remove('show');
        setTimeout(() => {
            document.querySelector('div.fab-button').classList.remove('open');
        }, 300);
        setTimeout(() => {
            document.querySelector('div.form').classList.remove('show');
        }, 800);
    }

    $scope.logout = function() {
        settings.deleteAll();
        $location.path('/');
    }

    $scope.addSubImage = function() {
        let img = document.createElement('img');
        img.setAttribute('onclick', 'openFile(this)');
        document.getElementById('sub-image').appendChild(img);
        openFile(img);
    }

    $scope.addOptionGroup = function(data = { name: '', options: [] }) {
        if ($scope.specifications.includes(data) == false) {
            $scope.specifications.push(data);
            let specifications = {
                name: data['name'],
                options: []
            };

            for (let i in data['options']) {
                specifications['options'].push({ name: data['options'][i]['name'], values: [] })
            }

            $scope.data['specifications'].push(specifications)
        }
    }

    $scope.selectOption = function(value, i, j) {
        $scope.data['specifications'][i]['options'][j]['values'].push(value);
    }

    $scope.addFeature = function(to = '') {
        if ($scope.feature.length == 0) return;
        else {
            $scope.data['features'][to].push($scope.feature);
            $scope.feature = '';
        }
    }

    $scope.removeFeature = function(from = '', i = 0) {
        $scope.data['features'][from].splice(i, 1);
    }

    $scope.setImage = async function(to) {
        let res = await openFile();
        if (res != null) {
            try {
                let answer = await $scope.uploadAsk(res, to);
                if (answer != false) {
                    if (typeof to == 'string' && (to == 'front' || to == 'back')) {
                        $scope.data['images'][to] = answer;
                    } else if (typeof to == 'number') {
                        if (to == -1) {
                            $scope.data['images']['gallary'].push(answer);
                        } else {
                            $scope.data['images']['gallary'][to] = answer;
                        }
                    }
                    $scope.$apply();
                }
            } catch (error) {
                $mdToast.show($mdToast.simple().textContent('خطا در آپلود تصویر رخ داده است.').action('باشه').hideDelay(3000).highlightAction(true).highlightClass('md-accent'));
            }
        }
    }

    $scope.uploadAsk = function(image, to) {
        return new Promise(async function(resolve, reject) {
            await window.sessionStorage.setItem('image', image);
            document.body.style.overflowY = 'hidden';
            $mdBottomSheet.show({
                templateUrl: './components/dashboard/upload.html',
                controller: 'upload',
                clickOutsideToClose: false,
                escapeToClose: false
            }).then(async function(result) {
                if (result == true) {
                    let name = await Date.now();
                    if (typeof to == 'string') {
                        name = name + '_' + to;
                    } else if (typeof to == 'number') {
                        name = name + '_gallary_';
                        if (to == -1) {
                            name = name + $scope.data['images']['gallary'].length;
                        } else {
                            name = name + to;
                        }
                    }
                    let uploaded = await ipcRenderer.sendSync('upload', { dir: image, name });
                    if (uploaded != false) resolve(uploaded);
                    reject(false);
                } else {
                    resolve(result);
                }
                document.body.removeAttribute('style');
            })
        })
    }

    $scope.submit = async function() {
        $scope.loading = true;
        let method = ($scope.data['_id']) ? 'PUT' : 'POST';
        try {
            let data = $scope.data;
            delete data['$$hashKey'];
            delete data['__v'];
            data['brand'] = $scope.brandID;
            data['category'] = $scope.categoryID;
            let res = await http.request('/api/products', method, data, true);
            if (res['status'] == true) {
                $mdToast.show($mdToast.simple().textContent(res['message']).action('باشه').hideDelay(3000).highlightAction(true).highlightClass('md-accent'));
                $scope.closeFabButton();
                $scope.fetchProducts();
            }
        } catch (error) {
            console.error(error);
        }
        $scope.loading = false;
    }

    $scope.remove = function(ev, id) {
        let confirm = $mdDialog.confirm()
            .title("آیا مطمعین هستید که میخواهید این محصول را حذف کنید ؟")
            .textContent("دقت نمایید در صورت حذف این محصول برای همیشه حذف می شود و باید دوباره ثبت کرد.")
            .targetEvent(ev)
            .ok("حذف شود")
            .cancel("انصراف");

        $mdDialog.show(confirm).then(async function() {
            $scope.loading = true;
            try {
                let res = await http.request('/api/products', 'DELETE', { id }, true);
                if (res['status'] == true) {
                    $mdToast.show($mdToast.simple().textContent(res['message']).action('باشه').hideDelay(3000).highlightAction(true).highlightClass('md-accent'));
                    $scope.fetchProducts();
                }
            } catch (error) {
                console.error(error);
            }
            $scope.loading = false;
        });

    }

    $scope.selectProduct = function(product) {
        $scope.data = product;
        $scope.brandID = product['brand']['_id'];
        $scope.categoryID = product['category']['_id'];
        for (let j in $scope.optionsGroup) {
            for (let i in product['specifications']) {
                if ($scope.optionsGroup[j]['name'] == product['specifications'][i]['name']) {
                    if ($scope.specifications.includes($scope.optionsGroup[j]) == false) {
                        $scope.specifications.push($scope.optionsGroup[j]);
                    }
                }
            }
        }
        $scope.openFabButton();
    }

    $scope.init = function() {
        $scope.fetchBrands();
        $scope.fetchOptionsGroup();
        $scope.fetchCategories();
        $scope.fetchProducts();
    }
    $scope.init();
}