from selenium_tests.course_info.course_info_base_test_case \
    import CourseInfoBaseTestCase


class CourseInfoDetailsNonEditTests(CourseInfoBaseTestCase):

    def setUp(self):
        super(CourseInfoDetailsNonEditTests, self).setUp()
        # Load a non-ILE course to validate non editable fields
        self._load_test_course()
        self.assertTrue(self.detail_page.is_loaded())

    def test_regular_course_not_editable(self):
        """
        TLT-2523 (AC 2) verify non-SB/ILE course fields cannot be edited
        TLT-2558 introduced new logic -- non-editable fields are still
        non-editable, but checkboxes can be saved, so we're checking for the
        presence of the edit buttons.
        """
        # Verify that buttons to edit page are present
        self.assertTrue(self.detail_page.
                        verify_buttons_to_edit_page_are_present())

        non_editable_fields = [
        'course_instance_id',
        'description',
        'instructors_display',
        'location',
        'meeting_time',
        'notes',
        'registrar_code_display',
        'sub_title',
        'term',
        'title'
        ]

        for element in non_editable_fields:
            #  verify that the field is not rendered as an input element
            self.assertFalse(self.detail_page.
                             is_element_displayed_as_input_field(element))
