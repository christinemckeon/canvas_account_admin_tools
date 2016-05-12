describe('Unit testing ListController', function () {
    var $controller, $rootScope, $routeParams, $compile, djangoUrl,
        $httpBackend, $window, $log, $uibModal, $sce, $templateCache;

    var controller, scope;
    var xlistURL =
        '/angular/reverse/?djng_url_name=icommons_rest_api_proxy&djng_url_args' +
        '=api%2Fcourse%2Fv2%2Fxlist_maps%2F';


    function clearInitialxlistFetch() {
        // handle the initial course instance get
        $httpBackend.expectGET("partials/list.html").respond(200, '');
        $httpBackend.flush(1);
    }

    function setupController() {
        controller = $controller('ListController', {$scope: scope});
        clearInitialxlistFetch();
    }

    // set up the test environment
    beforeEach(function () {
        // load the app and the templates-as-module
        module('CrossListCourses');
        module('templates');
        inject(function (_$controller_, _$rootScope_, _$routeParams_,
                         _$compile_, _djangoUrl_, _$httpBackend_, _$window_, _$log_,
                         _$uibModal_, _$sce_, _$templateCache_) {

            $controller = _$controller_;
            $rootScope = _$rootScope_;
            $routeParams = _$routeParams_;
            $compile = _$compile_;
            djangoUrl = _djangoUrl_;
            $httpBackend = _$httpBackend_;
            $window = _$window_;
            $log = _$log_;
            $uibModal = _$uibModal_;
            $sce = _$sce_;
            $templateCache = _$templateCache_;

            // this comes from django_auth_lti, just stub it out so that the $httpBackend
            // sanity checks in afterEach() don't fail
            $window.globals = {
                append_resource_link_id: function (url) {
                    return url;
                }
            };
        });
        scope = $rootScope.$new();
        setupController();
    });

    afterEach(function () {
        // sanity checks to make sure no http calls are still pending
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    // DI sanity check
    it('should inject the providers we requested', function () {
        [$controller, $rootScope, $routeParams, $compile,
            djangoUrl, $httpBackend, $window, $log, $sce, $templateCache].forEach(function (thing) {
            expect(thing).not.toBeUndefined();
            expect(thing).not.toBeNull();
        });
    });

    describe('confirmRemove', function() {
        var xlistMap = {
            xlist_map_id: 1,
            primary_course_instance: {
                course_instance_id: 123456
            },
            secondary_course_instance: {
                course_instance_id: 345678
            }
        };
        beforeEach(function(){
            spyOn(scope, 'clearMessages');
            spyOn(scope, 'removeCrosslisting');
            scope.confirmRemove(xlistMap);
            $httpBackend.expectGET("partials/remove-xlist-map-confirmation.html").respond(200, '');
            $httpBackend.flush(1);
            scope.$digest();
        });
        it('should show the modal dialog with correct data when the user clicks delete', function(){
            for (modalScope = scope.$$nextSibling; modalScope != null; modalScope = modalScope.$$nextSibling) {
                if (modalScope.modalOptions.scope.hasOwnProperty('primary')  &&
                        modalScope.modalOptions.scope.hasOwnProperty('secondary')) {
                    break;
                }
            }
            expect(modalScope).not.toBeNull();
            expect(modalScope.modalOptions.scope.primary).toEqual(xlistMap.primary_course_instance.course_instance_id);
            expect(modalScope.modalOptions.scope.secondary).toEqual(xlistMap.secondary_course_instance.course_instance_id);
        });
    });


    describe('deleteCrosslisting', function() {
        it('should make sure the correct url is called', function(){
            var xlistMapId = 123,
                deleteURL = xlistURL + xlistMapId + '%2F';

            scope.deleteCrosslisting(xlistMapId);

            $httpBackend.expectDELETE(deleteURL).respond(204, {});
            $httpBackend.flush(1);
        });

    });

    describe('formatCourse', function() {
        it('should make sure the course text is formatted correctly', function() {
            var courseInstance = {
                "course": {
                    "registrar_code": "24259",
                    "school_id": "ext"
                },
                "course_instance_id": 338920,
                "term": {
                    "display_name": "Spring 2017"
                }
            };
            var result = scope.formatCourse(courseInstance);
            expect(result).toBe('EXT 24259-Spring 2017-338920');
        });
    });

    describe('invalidInput', function() {
        it('indicates validity when valid input is supplied', function() {
            // both course instances are valid
            spyOn(scope, 'isValidCourseInstance').and.returnValue(true);
            // different course instances (identical ones cannot be paired)
            spyOn(scope, 'cleanCourseInstanceInput').and
                .returnValues('123', '456');

            expect(scope.invalidInput()).toBe(false);
        });

        it('indicates invalid when primary is invalid', function() {
            spyOn(scope, 'isValidCourseInstance').and.returnValues(false, true);
            // different course instances (identical ones cannot be paired)
            spyOn(scope, 'cleanCourseInstanceInput').and
                .returnValues('123', '456');
            expect(scope.invalidInput()).toBe(true);
        });
        it('indicates invalid when secondary is invalid', function() {
            spyOn(scope, 'isValidCourseInstance').and.returnValues(true, false);
            // different course instances (identical ones cannot be paired)
            spyOn(scope, 'cleanCourseInstanceInput').and.returnValues('123', '456');
            expect(scope.invalidInput()).toBe(true);
        });

        it('indicates invalid when primary and secondary match', function() {
            // both course instances are valid
            spyOn(scope, 'isValidCourseInstance').and.returnValue(true);
            // identical course instance ids cannot be paired
            spyOn(scope, 'cleanCourseInstanceInput').and.returnValue('123');
            expect(scope.invalidInput()).toBe(true);
        });
    });

    describe('isValidCourseInstance', function() {
        beforeEach(function () {
            spyOn(scope, 'cleanCourseInstanceInput').and.callFake(
                function(input) { return input; });
        });

        it('returns true when valid course instance is supplied', function() {
            expect(scope.isValidCourseInstance('1234567')).toBe(true);
            expect(scope.isValidCourseInstance('1')).toBe(true);
        });

        it('returns false when invalid course instance is supplied', function() {
            expect(scope.isValidCourseInstance('123 4567')).toBe(false);
            expect(scope.isValidCourseInstance('abc123')).toBe(false);
            expect(scope.isValidCourseInstance('')).toBe(false);
        });
    });

    describe('postNewCrosslisting', function() {
        it('calls post with the correct params', function() {
            var result = null,
                primary = 123,
                secondary = 456,
                expectedPostParams = {
                    primary_course_instance: primary,
                    secondary_course_instance: secondary
                },
                expectedResponse = {
                    status: 201  // format is unimportant for purposes of test
                };


            scope.postNewCrosslisting(primary, secondary)
                .then(function(response) { result = response.data; });

            $httpBackend.expectPOST(xlistURL, expectedPostParams)
                .respond(201, expectedResponse);
            $httpBackend.flush(1);

            // resolve promise
            scope.$digest();

            expect(result).toEqual(expectedResponse);
        });
    });


    xdescribe('removeCrosslisting', function() {

        beforeEach(function () {
        });

        it('should make sure the deleteCrosslisting is called with the correct id');
        it('should make sure the scope.message has the correct messag eon failure');

    });


    xdescribe('submitAddCrosslisting', function() {

        beforeEach(function () {
        });

        it('should make sure the postNewCrosslisting is called with the correct values');
        it('should make sure the scope.message has the correct messag eon failure');

    });

});
