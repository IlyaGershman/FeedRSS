/**
 * Created by ilyagershman on 5/30/16.
 */

var repeat = false;

var App = angular.module('RSSFeedApp', ['ngRoute']);

App.controller("FeedCtrl", ['$scope','$location', 'FeedService', function ($scope,$location,Feed) {

    (!$.cookie('feedCookie')) ? $scope.items = [] : $scope.items = JSON.parse($.cookie("feedCookie"));

    $scope.loadFeed = function(url){
        $scope.feedSrc = url;

        Feed.parseFeed($scope.feedSrc).then(function(res){
            $scope.feeds = res.data.responseData.feed.entries;
            if ($scope.feeds !== undefined){
                $scope.items.forEach(function (entry, index) {
                    if (entry.url !== url){
                        entry.active = '';
                    } else {
                        entry.active = 'active';
                        repeat = true
                    }
                });
                if (!repeat){
                    $scope.items.unshift({url: url, active: 'active'});
                    $.cookie("feedCookie", JSON.stringify($scope.items));
                }
            }
            repeat = false;
        });
    };

    $scope.deleteFeed = function(url){
        $scope.items.forEach(function (entry, index) {
            if (entry.url === url){
                $scope.items.splice(index,1);
                $.cookie("feedCookie", JSON.stringify($scope.items));
            }
        })
    };

    $scope.getURL = function (id) {
        return document.getElementById(id).value;
    };

    $scope.$on('$locationChangeSuccess', function() {
        $scope.actualLocation = $location.path();
    });


    $scope.$watch(function () {return $location.path()}, function (newLocation, oldLocation) {

        //true only for onPopState
        if($scope.actualLocation === newLocation) {
            var link = newLocation.slice(1,newLocation.length);
            console.log(link);
            $scope.items.forEach(function (entry, index) {
                if (entry.url === link){
                    $scope.items[index].active = 'active';
                } else {
                    $scope.items[index].active = '';
                }
            });
            $scope.loadFeed(link);
        }
    });

}]);

App.factory('FeedService',['$http',function($http){
    return {
        parseFeed : function(url){
            return $http.jsonp('//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&callback=JSON_CALLBACK&q=' + encodeURIComponent(url));
        }
    }
}]);