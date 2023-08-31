"use strict";

var request = require("request");

var keyCloakUrl = "/backend/auth/token/";

// var username = "nae";
// var password = "xinfinitdev@123456789";

var bearerToken, refreshToken, requestBearerTokenPromise;

function requestBearerToken(server, username, password) {
    console.log(username, password);
    return new Promise(function(resolve, reject) {
        request({
            url: server + keyCloakUrl + 'request',
            method: "POST",
            form: {
                username: username,
                password: password
            },
            headers: {
                Accept: "application/json"
            }
        }, function(error, response, body) {
            if (error) {
                console.error(error);
                reject(error);
            } else {
                var responseObj = JSON.parse(body);
                bearerToken = responseObj.access_token;
                if (bearerToken) {
                    refreshToken = responseObj.refresh_token;
                    setInterval(function(){
                        refreshBearerToken(server);
                    }, (responseObj.expires_in - 60) * 1000);
                    resolve(bearerToken);
                } else {
                    console.error("please check username and password (xinAuth.js)");
                    reject("please check username and password (xinAuth.js)");
                }
            }
        });
    });
}

function refreshBearerToken(server){
    request({
        url: server + keyCloakUrl + 'refresh',
        method: "POST",
        form: {
            token: refreshToken
        },
        headers: {
            Accept: "application/json"
        }
    },function(error, response, body){
        if(!error && response.statusCode == 200){
            var responseObj = JSON.parse(body);
            bearerToken = responseObj.access_token;
        }else{
            console.error(error);
        }
    });
}

function getBearerToken(server, username, password){
    if(typeof bearerToken === 'undefined'){
        if(typeof requestBearerTokenPromise === 'undefined'){
            requestBearerTokenPromise = requestBearerToken(server, username, password).then(function(token){
                requestBearerTokenPromise = undefined;
                return token;
            });
        }
        return requestBearerTokenPromise;
    }else{
        return Promise.resolve(bearerToken);
    }
}

// Exports

module.exports = {
    getBearerToken : getBearerToken
};