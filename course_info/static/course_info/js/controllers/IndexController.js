(function(){
    /**
     * Angular controller for the home page of course_info.
     */
    angular.module('app').controller('IndexController', ['$scope', '$http', '$timeout', function($scope, $http, $timeout){
        $scope.searchInProgress = false;
        $scope.queryString = '';
        $scope.showDataTable = false;
        $scope.searchEnabled = false;
        $scope.filtersApplied = false;
        $scope.columnFieldMap = {
            1: 'title',
            2: 'term__academic_year',
            3: 'term__display_name',
            5: 'course__registrar_code_display'
        };
        $scope.filterOptions = {
            // `key` and `value` are the GET params sent to the server when
            // the option is chosen. `value` must be unique in its option list,
            // as it is also used for the HTML input element value. `value` can
            // be arbitrarily set to something unique if there are duplicate
            // values; in that case, an optional `query_value` attribute can be
            // included in the option object to indicate what to send to the
            // server. `query` is `true` if this option should trigger a GET
            // param included in the request, or `false` if it is e.g. the
            // default and should not be appended to the request params.
            sites: [
                {key:'sites', value: 'all', name:'All courses', query: false, text: 'All courses <span class="caret"></span>'},
                {key:'has_sites', value: 'True', name:'Only courses with sites', query: true, text: 'Only courses with sites <span class="caret"></span>'},
                {key:'has_sites', value: 'False', name:'Only courses without sites', query: true, text: 'Only courses without sites <span class="caret"></span>'},
                {key:'sync_to_canvas', value: 'sync_to_canvas_true', query_value: 'True', name:'Courses being synced to Canvas', query: true, text: 'Courses being synced to Canvas <span class="caret"></span>'}
            ],
            schools: JSON.parse(document.getElementById('schoolOptions').innerHTML),
            // todo: this wants to be handled like .schools
            terms: JSON.parse(document.getElementById('termOptions').innerHTML),
            years: [
                {key:'academic_year', value: 'all', name:'All years', query: false, text: 'All years <span class="caret"></span>'}
                // specific years are filled out dynamically below
            ]
        };

        var year = (new Date()).getFullYear();
        var endYear = year + 1;
        var startYear = 2002;
        for (var i = endYear ; i >= startYear; i--) {
            $scope.filterOptions.years.push({
                key: 'academic_year',
                value: i + '',
                name: i + '',
                query: true,
                text: i + ' <span class="caret"></span>'
            });
        }

        $scope.filters = {
            // default to first in list on load
            schools: $scope.filterOptions.schools[0],
            sites: $scope.filterOptions.sites[0],
            terms: $scope.filterOptions.terms[0],
            years: $scope.filterOptions.years[0]
        };

        $scope.updateFilter = function(filterKey, selectedValue) {
            $scope.filters[filterKey] = $scope.filterOptions[filterKey].filter(
                function(option){ return option.value == selectedValue})[0];
        };

        $scope.checkIfFiltersApplied = function() {
            for (var key in $scope.filters) {
                if ($scope.filters[key].query) {
                    $scope.filtersApplied = true;
                    break;
                }
                $scope.filtersApplied = false;
            }
            $scope.checkIfSearchable();
        };

        $scope.checkIfSearchable = function() {
            $scope.searchEnabled = $scope.filtersApplied || $scope.queryString.trim() != '';
            if (!$scope.searchEnabled) {
                $scope.showDataTable = false;
            }
        };

        $scope.$watch('queryString', $scope.checkIfSearchable);
        // deep object compare
        $scope.$watch('filters', $scope.checkIfFiltersApplied, true);

        $scope.courseInstanceToTable = function(course) {
            var cinfo = {};
            cinfo['description'] = course.title;
            cinfo['year'] = course.term ? course.term.academic_year : '';
            cinfo['term'] = course.term ? course.term.display_name : '';
            cinfo['term_code'] = course.term ? course.term.term_code : '';
            cinfo['sites'] = course.sites || [];
            cinfo['sites'].forEach(function (site) {
                site.site_id = site.external_id;
                if (site.site_id.indexOf('http') === 0) {
                    site.site_id = site.site_id.substr(site.site_id.lastIndexOf('/')+1);
                }
            });
            cinfo['sites'].sort(function(a,b) {
                return (a.external_id > b.external_id) ? 1 :
                           (b.external_id > a.external_id) ? -1 : 0;
            });
            if (course.course) {
                cinfo['code'] = (course.course.registrar_code_display
                + ' (' + course.course.course_id + ')').trim();
                cinfo['school'] = course.course.school_id.toUpperCase();
            } else {
                cinfo['code'] = '';
                cinfo['school'] = '';
            }

            cinfo['cid'] = course.course_instance_id;
            if (course.secondary_xlist_instances && course.secondary_xlist_instances.length > 0) {
                cinfo['xlist_status'] = 'Primary';
                cinfo['xlist_status_label'] = 'success';
            } else if (course.primary_xlist_instances && course.primary_xlist_instances.length > 0) {
                cinfo['xlist_status'] = 'Secondary';
                cinfo['xlist_status_label'] = 'info';
            } else {
                cinfo['xlist_status'] = '';
            }
            return cinfo;
        };

        var request = null;
        $scope.initializeDatatable = function() {
            $scope.dataTable = $('#courseInfoDT').DataTable({
                serverSide: true,
                deferLoading: true,
                ajax: function(data, callback, settings) {
                    $scope.$apply(function(){
                        $scope.searchInProgress = true;
                    });
                    var queryParameters = {};
                    if ($scope.queryString.trim() != '') {
                        queryParameters.search = $scope.queryString.trim();
                    }
                    if ($scope.filtersApplied) {
                        for (var key in $scope.filters) {
                            var f = $scope.filters[key];
                            if (f.query) {
                                queryParameters[f.key] = f.query_value ? f.query_value : f.value;
                            }
                        }
                    }
                    queryParameters.offset = data.start;
                    queryParameters.limit = data.length;
                    var order = data.order[0];
                    queryParameters.ordering = (order.dir == 'desc' ? '-' : '') + $scope.columnFieldMap[order.column];
                    //if search request is already in progress, abort the previous one.
                    if (request) {
                        request.abort();
                        //restart the progress bar
                        $scope.searchInProgress = true;
                    }
                    request = $.ajax({
                        url: '/icommons_rest_api/api/course/v2/course_instances',
                        method: 'GET',
                        data: queryParameters,
                        dataType: 'json',
                        success: function(data, textStatus, jqXHR) {
                            var results = data.results;
                            var resultsLength = data.results.length;
                            var processedData = results.map($scope.courseInstanceToTable);
                            callback({
                                recordsTotal: data.count,
                                recordsFiltered: data.count,
                                data: processedData
                            });
                            $scope.showDataTable = true;
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            console.log(textStatus);
                        },
                        complete: function() {
                            $scope.$apply(function(){
                                $scope.searchInProgress = false;
                            });
                            //reset request when complete
                            request = null;
                        }
                    });
                },
                dom: '<<t>ip>',
                language: {
                    info: 'Showing _START_ to _END_ of _TOTAL_ courses',
                    emptyTable: 'There are no courses to display.',
                    // datatables-bootstrap js adds glyphicons, so remove
                    // default Previous/Next text and don't add &laquo; or
                    // &raquo; as in that case the chevrons will be repeated
                    paginate: {
                        previous: '',
                        next: ''
                    }
                },
                order: [[6, 'asc']],  // order by course instance ID
                columns: [
                    {data: 'school'},
                    {data: 'description'},
                    {data: 'year'},
                    {data: 'term'},
                    {
                        orderable: false,
                        render: function(data, type, row, meta) {
                            var sites = row.sites.map(function(site) {
                                return '<a href="' + site.course_site_url
                                           + '" target="_parent">'
                                           + site.site_id + '</a>';
                            });
                            return sites.join(', ');
                        }
                    },
                    {data: 'code'},
                    {data: 'cid'},
                    {
                        orderable: false,
                        data: null,
                        render: function(data, type, full, meta) {
                            if (data.xlist_status != '') {
                                return '<span class="label label-'
                                    + data.xlist_status_label + '">'
                                    + data.xlist_status + '</span>';
                            } else {
                                return data.xlist_status;
                            }
                        }
                    }
                ]
            });
        };

        angular.element(document).ready($scope.initializeDatatable);

        $(document).on('hidden.bs.dropdown', function(event) {
            var dropdown = $(event.target);
            dropdown.find('.dropdown-menu').attr('aria-expanded', false);
            dropdown.find('.dropdown-toggle').focus();
        });

        $scope.searchCourseInstances = function(event) {
            if (event.type == 'click' || (event.type == 'keypress' && event.which == 13)) {
                // Call within timeout to prevent https://docs.angularjs.org/error/$rootScope/inprog?p0=$apply
                $timeout(function () {
                    $scope.searchEnabled = false;
                    $scope.dataTable.ajax.reload();
                }, 0);
            }
        }
    }]);
})();