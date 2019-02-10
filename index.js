'use strict';

var http = require('http');
var util = require('util');
var async = require('async');
var msRestAzure = require('ms-rest-azure');
var ComputeManagementClient = require('azure-arm-compute');
//var StorageManagementClient = require('azure-arm-storage');
//var NetworkManagementClient = require('azure-arm-network');
//var ResourceManagementClient = require('azure-arm-resource').ResourceManagementClient;

_validateEnvironmentVariables();
var clientId = process.env['CLIENT_ID'];
var domain = process.env['DOMAIN'];
var secret = process.env['APPLICATION_SECRET'];
var subscriptionId = process.env['AZURE_SUBSCRIPTION_ID'];
var resourceClient, computeClient, storageClient, networkClient;

var location = 'eastus';

function _validateEnvironmentVariables() {
    var envs = [];
    if (!process.env['CLIENT_ID']) envs.push('CLIENT_ID');
    if (!process.env['DOMAIN']) envs.push('DOMAIN');
    if (!process.env['APPLICATION_SECRET']) envs.push('APPLICATION_SECRET');
    if (!process.env['AZURE_SUBSCRIPTION_ID']) envs.push('AZURE_SUBSCRIPTION_ID');
    if (envs.length > 0) {
      throw new Error(util.format('please set/export the following environment variables: %s', envs.toString()));
    }
  }
  

var server = http.createServer(function(request, response) {

    response.writeHead(200, {"Content-Type": "text/plain"});
    //response.end("Hello World!");
    msRestAzure.loginWithServicePrincipalSecret(clientId, secret, domain, function (err, credentials, subscriptions) {
        if (err) return console.log(err);
        //resourceClient = new ResourceManagementClient(credentials, subscriptionId);
        computeClient = new ComputeManagementClient(credentials, subscriptionId);
        //storageClient = new StorageManagementClient(credentials, subscriptionId);
        //networkClient = new NetworkManagementClient(credentials, subscriptionId);
        
        async.series([
          function (callback) {
            //////////////////////////////////////////////////////
            //Task5: Lisitng All the VMs under the subscription.//
            //////////////////////////////////////////////////////
            console.log('\n>>>>>>>Start of Task5: List all vms under the current subscription.');
            computeClient.virtualMachines.listAll(function (err, result) {
              if (err) {
                console.log(util.format('\n???????Error in Task5: while listing all the vms under ' + 
                  'the current subscription:\n%s', util.inspect(err, { depth: null })));
                callback(err);
              } else {
                console.log(util.format('\n######End of Task5: List all the vms under the current ' + 
                  'subscription is successful.\n%s', util.inspect(result, { depth: null })));
                var vmOutput = "";
                //result.foreach(vmItem => {
                  //vmOutput += "vm " + vmItem.name + ", " + vmItem.location + ", " + vmItem.tags.shutdown;
                //})
                for (var vm = 0; vm < result.length; vm++) {
                  vmOutput += "vm " + result[vm].name + ", " + result[vm].location + ", " + result[vm].tags.shutdown;
                };
                //var vmOutput = [result[0].name, result[0].type, result[0].location, result[0].tags.shutdown]
                response.end(vmOutput);
                callback(null, result);
              }
            });
          }
        ],
        //final callback to be run after all the tasks
        function (err, results) {
          if (err) {
            console.log(util.format('\n??????Error occurred in one of the operations.\n%s', 
              util.inspect(err, { depth: null })));
          } else {
            console.log(util.format('\n######All the operations have completed successfully. '));
          }
          return;
        });
      });
      
});

var port = process.env.PORT || 1337;
server.listen(port);

console.log("Server running at http://localhost:%d", port);
