/**
 * Created by lasantha on 9/3/15.
 * JavaScript Module to laod keyCloak adaptor.
 * Please include below js in you html before this js and call initAdaptor() function inside document ready function
 *<script src="https://security-xinfinit.rhcloud.com/auth/js/keycloak.js"></script>

 */

var keyCloakAdaptor = (function(){

    /**
     * private function to load keycloak adaptor
     * This will redirect page to keycloak login page if authenticated session not available
     * Keycloak server will redirect back to original page after authentication success
     * @private
     */
    var _initAdaptor = function (callback) {

        try {

            window.keycloak = Keycloak({
                "realm": 'xinfinit-realm',
                "realm-public-key": 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtXFtchYKPZnBnPAC77I8okEl0YzqEsNjsCKpZjvfycRdhkkNrI6z5X3JYNM1NQxOHYl8NpKKAjpUqQYGT5dcl0LJIUuAjK4Wp8+a5INiUZ9hSfVsx5fJWcZCOxX0vuGWHaNuQctpNa0+2P23LyWqibbJ9BQU9HwZ9HJAFjvd5X/rVmDFEQzGbCLon2UQ5+E1v+UPNcq+56mhM9EHAAEyWgO56Z1L5EdSfg9rjGn1lJduFmqRNA7V9yjkkaaU/xdLuwIaH79/iXwNapUh9ya+nq6xqW9msbLPXVUfdtGUJYnyH9DHPVDCkbWBSzCoHs+IDlzGRoziGg4f+8zCgz7kyQIDAQAB',
                "auth-server-url": 'http://dev-xinfinit.rhcloud.com/auth',
                "ssl-required": 'none',
                "public-client": true,
                "clientId": 'xinfinit-client',
                "enable-cors": true
            });

            window.keycloak.init({onLoad: 'login-required', checkLoginIframe: false}).success(function (authenticated) {
                //this token "window.keycloak.token" is used to send cross domain requests
                //alert(window.keycloak.token);
                if(callback) {
                    callback.apply(this, arguments);
                }
            }).error(function () {
                alert('failed to initialize');
            });
            //Until there's a synchronous way to call updateToken from within KeycloakBearerTokenInterceptor (it's currently
            //asynchronous), just attempt to refresh it every 10 sec.
            setInterval(function () {
                window.keycloak.updateToken();
            }, 10000);
        }catch(e){
            infUtil.console.error(e)
        }
    };


    /**
     * public functions
     */
    return {
        initAdaptor:_initAdaptor
    };

})();