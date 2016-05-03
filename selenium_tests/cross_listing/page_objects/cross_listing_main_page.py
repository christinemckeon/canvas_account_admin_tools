"""
This page models the main (landing) page of the Cross Listing Tool
"""

from selenium.common.exceptions import NoSuchElementException, TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait

from selenium_tests.cross_listing.page_objects.cross_listing_base_page_object\
    import CrossListingBasePageObject


class Locators(object):
    CONFIRMATION_ALERT = (By.ID, 'result-message')
    # TODO: DELETE is a stub until remove story comes into play
    DELETE_BUTTON = (By.ID, 'DELETE_PAIRING_BUTTON')
    HEADING_ELEMENT = (By.XPATH, '//h3[contains(.,"Cross Listing")]')
    PRIMARY_CID_ADD_FIELD = (By.ID, 'primary-course')
    SECONDARY_CID_ADD_FIELD = (By.ID, 'secondary-course')
    SUBMIT_BUTTON = (By.ID, 'submit-new-cross-listing-btn')


class MainPageObject(CrossListingBasePageObject):
    page_loaded_locator = Locators.HEADING_ELEMENT

    def add_cross_listing_pairing(self, primary_cid, secondary_cid):
        """Add two cross listed ID to be paired in cross-listing tool"""

        # Fill in the primary CID for cross-listing
        primary_cid_field = self.find_element(*Locators.PRIMARY_CID_ADD_FIELD)
        primary_cid_field.send_keys(primary_cid)

        # Fill in the secondary CID field for cross-listing
        secondary_cid_field = self.find_element(
                *Locators.SECONDARY_CID_ADD_FIELD)
        secondary_cid_field.send_keys(secondary_cid)

        # Click on submit button to pair the cross listing
        self.find_element(*Locators.SUBMIT_BUTTON).click()

    def confirm_presence_of_confirmation_alert(self):
        """
        :param self:
        :return: Confirms that an alert box returns after add
        """
        try:
            WebDriverWait(self._driver, 60).until(lambda s: s.find_element(
                    *Locators.CONFIRMATION_ALERT).is_displayed())
        except TimeoutException:
            return False
        return True

    def get_confirmation_text(self):
        """
        Returns the confirmation text after add
        """
        alert = self.find_element(*Locators.CONFIRMATION_ALERT)
        confirmation_text = alert.text.strip()
        return confirmation_text


    """THE FOLLOWING ARE FOR THE REMOVE STORY; IN VERY PRIMITIVE STUB FORM
    ONLY """

    def delete_mapping(self, cid):
        # TODO:  STUB ONLY BELOW FOR TLT-2595 (REMOVE STORY)
        """
        Deletes a crosslisting pairing via the UI
        """
        # LOGIC WITH PO:
        # it goes 1 primary to 1 secondary,
        # or 1 primary to multiple secondaries
        # secondary_course_instance should be a column of unique values

        # TODO: Figure out logic here, check primary/secondary/both/one?
        # self.find_element(*Locators.DELETE_PAIRING_BUTTON(cid)).click()

    def is_mapping_removed_from_list(self, lookup_text):
         # TODO:  STUB ONLY BELOW FOR TLT-2595 (REMOVE STORY)
        """
        Verifies that a cross-listing mapping has been removed from list
        """
        try:
            WebDriverWait(self._driver, 30).until_not(lambda s: s.find_element(
                *CrossListingBasePageObject.get_cell_with_text(
                        lookup_text)).is_displayed())
        except TimeoutException:
            return False
        return True
