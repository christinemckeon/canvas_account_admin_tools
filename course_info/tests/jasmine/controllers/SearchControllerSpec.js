// NOTE - this is still a work in progress, doesn't really test anything useful

describe('Unit testing SearchController', function() {
    beforeEach(module('CourseInfo'));

    var $controller, $window, $document, $httpBackend, $rootScope;
    var scope, controller;
    var searchURL =
            '/angular/reverse/?djng_url_name=icommons_rest_api_proxy&djng_url_args' +
            '=api%2Fcourse%2Fv2%2Fcourse_instances&exclude_from_isites=0&search=65153' +
            '&school=colgsas&offset=0&limit=10&ordering=title';

    beforeEach(inject(function(_$controller_, _$window_, _$document_, _$httpBackend_, _$rootScope_) {
        // The injector unwraps the underscores (_) from around
        // the parameter names when matching
        $controller = _$controller_;
        $window = _$window_;
        $document = _$document_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;

        // this comes from django_auth_lti, just stub it out so that the $httpBackend
        // sanity checks in afterEach() don't fail
        $window.globals = {
            append_resource_link_id: function(url) { return url; },
        };

        // instantiate the controller, give it a $scope
        scope = $rootScope.$new();
        controller = $controller('SearchController', { $scope: scope });

        // always expect the controller constructor to call for term codes
        var term_codes = {
            results: [
                {
                    term_code: 0,
                    term_name: 'Summer',
                    sort_order: 40
                },
                {
                    term_code: 1,
                    term_name: 'Fall',
                    sort_order: 60
                },
                {
                    term_code: 2,
                    term_name: 'Spring',
                    sort_order: 30
                },
            ],
            next: '',
        };
        $httpBackend.expectGET('/icommons_rest_api/api/course/v2/term_codes/?limit=100')
            .respond(200, JSON.stringify(term_codes));
        $httpBackend.flush(1); // flush the term_codes request
    }));

    it("should inject the providers we've requested", function() {
        [$controller, $window, $document, $httpBackend, $rootScope].forEach(function(thing) {
            expect(thing).not.toBeUndefined();
            expect(thing).not.toBeNull();
        });
    });

    it("should instantiate the controller", function() {
        expect(controller).not.toBe(null);
    });

    afterEach(function() {
        // sanity checks to make sure no http work is still pending
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('$scope setup', function() {

    });

    describe('$scope.enableColumnSorting()', function() {

    });

    describe('$scope.courseInstanceToTable()', function() {

    });

    describe('$scope.initializeDatatable()', function() {
        var searchResults = {
            results: [{
                course: {
                    registrar_code: 'REGCODE',
                    school_id: 'xyz',
                    course_id: '789',
                },
                course_instance_id: '12345',
            }],
        };
        beforeEach(function() {
            scope.searchInProgress = true;
        });

        xit('should make the api call to fetch data ', function () {

            //make the ajax call
            $httpBackend.expectGET(searchURL)
                .respond(200, JSON.stringify(searchResults));
            $httpBackend.flush(1);
        });

        it('should  initialize  data table with results');

        it('should not include  excluded_from_isites records');

        it('should handle errors');

     });

    describe('$scope.searchCourseInstances()', function() {

    });
});
